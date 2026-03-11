import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";

const ARC_CHAIN_ID_HEX = "0x4cef52"; // 5042002
const ARC_DECIMALS = 18; // Native token uses 18 decimals on Arc

// Minimal ABI for frontend interactions
const CASINO_ABI = [
  // bankroll
  "function getCasinoBalance() view returns (uint256)",
  // games
  "function playCoinFlip(bool heads) payable",
  "function playRoulette(uint8 betType, uint8 number) payable",
  "function playSlots() payable",
  // events
  "event CoinFlipPlayed(address indexed player,uint256 bet,bool choice,bool result,bool win,uint256 payout)",
  "event RoulettePlayed(address indexed player,uint256 bet,uint8 betType,uint8 betNumber,uint8 resultNumber,bool win,uint256 payout)",
  "event SlotsPlayed(address indexed player,uint256 bet,uint8[3] symbols,bool win,uint256 payout)",
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

function getCasinoAddress(): string {
  const addr = import.meta.env.VITE_CASINO_CONTRACT_ADDRESS as string | undefined;
  if (!addr) {
    throw new Error("VITE_CASINO_CONTRACT_ADDRESS is not set");
  }
  return addr;
}

async function getProviderAndSigner() {
  if (!window.ethereum) {
    throw new Error("No injected wallet found (window.ethereum is undefined)");
  }
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function connectWallet(): Promise<{
  address: string;
  balance: number;
}> {
  if (!window.ethereum) {
    throw new Error("No injected wallet found");
  }

  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (chainId !== ARC_CHAIN_ID_HEX) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_CHAIN_ID_HEX }],
      });
    } catch {
      // Try adding the network if switching fails
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: ARC_CHAIN_ID_HEX,
            chainName: "Arc Testnet",
            nativeCurrency: {
              name: "USDC",
              symbol: "USDC",
              decimals: ARC_DECIMALS,
            },
            rpcUrls: [import.meta.env.VITE_ARC_RPC_URL || "https://rpc.testnet.arc.network"],
            blockExplorerUrls: ["https://testnet.arcscan.app"],
          },
        ],
      });
    }
  }

  const accounts: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const address = accounts[0];

  const { provider } = await getProviderAndSigner();
  const balanceWei = await provider.getBalance(address);
  const balance = Number(formatUnits(balanceWei, ARC_DECIMALS));

  return { address, balance };
}

function getCasinoContractWithSigner(signer: any) {
  const address = getCasinoAddress();
  return new Contract(address, CASINO_ABI, signer);
}

export async function getUserBalance(address: string): Promise<number> {
  if (!window.ethereum) {
    throw new Error("No injected wallet found");
  }
  const provider = new BrowserProvider(window.ethereum);
  const balanceWei = await provider.getBalance(address);
  return Number(formatUnits(balanceWei, ARC_DECIMALS));
}

export async function getCasinoBalance(): Promise<number> {
  const { provider } = await getProviderAndSigner();
  const casino = new Contract(getCasinoAddress(), CASINO_ABI, provider);
  const balance: bigint = await casino.getCasinoBalance();
  return Number(formatUnits(balance, ARC_DECIMALS));
}

export interface CoinFlipOutcome {
  win: boolean;
  payout: number;
  resultIsHeads: boolean;
}

export async function sendCoinFlipTransaction(
  heads: boolean,
  betAmount: string
) {
  const { signer } = await getProviderAndSigner();
  const casino = getCasinoContractWithSigner(signer);
  const value = parseUnits(betAmount, ARC_DECIMALS);
  const tx = await casino.playCoinFlip(heads, { value }); // awaits user signature
  return { tx, casino };
}

export async function waitForCoinFlipOutcome(
  tx: any,
  casino: Contract
): Promise<CoinFlipOutcome> {
  const receipt = await tx.wait();

  const event = receipt.logs
    .map((log: any) => {
      try {
        return casino.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed: any) => parsed && parsed.name === "CoinFlipPlayed");

  if (!event) {
    throw new Error("CoinFlipPlayed event not found");
  }

  const { result, win, payout } = event.args as {
    player: string;
    bet: bigint;
    choice: boolean;
    result: boolean;
    win: boolean;
    payout: bigint;
  };

  return {
    win,
    payout: Number(formatUnits(payout, ARC_DECIMALS)),
    resultIsHeads: result,
  };
}

export interface RouletteOutcome {
  win: boolean;
  payout: number;
  resultNumber: number;
}

export async function playRoulette(
  betType: number,
  chosenNumber: number,
  betAmount: string
): Promise<RouletteOutcome> {
  const { signer } = await getProviderAndSigner();
  const casino = getCasinoContractWithSigner(signer);
  const value = parseUnits(betAmount, ARC_DECIMALS);

  const tx = await casino.playRoulette(betType, chosenNumber, { value });
  const receipt = await tx.wait();

  const event = receipt.logs
    .map((log: any) => {
      try {
        return casino.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed: any) => parsed && parsed.name === "RoulettePlayed");

  if (!event) {
    throw new Error("RoulettePlayed event not found");
  }

  const { resultNumber, win, payout } = event.args as {
    player: string;
    bet: bigint;
    betType: number;
    betNumber: number;
    resultNumber: number;
    win: boolean;
    payout: bigint;
  };

  return {
    win,
    payout: Number(formatUnits(payout, ARC_DECIMALS)),
    resultNumber,
  };
}

export interface SlotsOutcome {
  win: boolean;
  payout: number;
  symbols: number[];
}

export async function playSlots(betAmount: string): Promise<SlotsOutcome> {
  const { signer } = await getProviderAndSigner();
  const casino = getCasinoContractWithSigner(signer);
  const value = parseUnits(betAmount, ARC_DECIMALS);

  const tx = await casino.playSlots({ value });
  const receipt = await tx.wait();

  const event = receipt.logs
    .map((log: any) => {
      try {
        return casino.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed: any) => parsed && parsed.name === "SlotsPlayed");

  if (!event) {
    throw new Error("SlotsPlayed event not found");
  }

  const { symbols, win, payout } = event.args as {
    player: string;
    bet: bigint;
    symbols: bigint[];
    win: boolean;
    payout: bigint;
  };

  return {
    win,
    payout: Number(formatUnits(payout, ARC_DECIMALS)),
    symbols: symbols.map((s) => Number(s)),
  };
}

