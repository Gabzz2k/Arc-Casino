import { ethers } from "ethers";
import { ARC_RPC_URL, PRIVATE_KEY, CASINO_CONTRACT_ADDRESS } from "./arcConfig";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CasinoArtifact = require("../artifacts/contracts/Casino.sol/Casino.json");

if (!ARC_RPC_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "ARC_RPC_URL is not set. Backend contract service will not be usable until it is configured."
  );
}

export function getProvider() {
  if (!ARC_RPC_URL) {
    throw new Error("ARC_RPC_URL is not configured");
  }
  return new ethers.JsonRpcProvider(ARC_RPC_URL);
}

export function getWallet() {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not configured");
  }
  return new ethers.Wallet(PRIVATE_KEY, getProvider());
}

export function getCasinoContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const address = CASINO_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("CASINO_CONTRACT_ADDRESS is not configured");
  }
  const provider = signerOrProvider ?? getWallet();
  return new ethers.Contract(address, CasinoArtifact.abi, provider);
}

export async function getCasinoBalanceOnChain(): Promise<bigint> {
  const contract = getCasinoContract();
  const balance: bigint = await contract.getCasinoBalance();
  return balance;
}

export async function fundCasino(amountWei: bigint) {
  const wallet = getWallet();
  const casino = getCasinoContract(wallet);
  const tx = await wallet.sendTransaction({
    to: await casino.getAddress(),
    value: amountWei,
  });
  return tx.wait();
}

