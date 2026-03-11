import * as dotenv from "dotenv";
dotenv.config();

export const ARC_RPC_URL = process.env.ARC_RPC_URL || "";
export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
export const CASINO_CONTRACT_ADDRESS =
  process.env.CASINO_CONTRACT_ADDRESS || "";

export const ARC_CHAIN_ID = 5042002;

// Frontend will use its own copy of the ABI via the built artifacts.
// Backend utilities import from Hardhat artifacts.

