import { Contract } from "ethers";
import {
  DAICONTRACT,
  DAICONTRACTABI,
  STAKINGMANAGERABI,
  STAKINGMANAGERCONTRACT,
  VILLAGERABI,
  VILLAGERCONTRACT,
} from "../constants";

/**
 * getEtherBalance: Retrieves the ether balance of the user or the contract
 */
export const getEtherBalance = async (provider, address, contract = false) => {
  try {
    //als caller contract boolean true heeft gezet -> retrieve ether balance van het exchange contract, als het false is geeft het balans vd user.
    if (contract) {
      const balance = await provider.getBalance(STAKINGMANAGERCONTRACT);
      return balance;
    } else {
      const balance = await provider.getBalance(address);
      return balance / 10 ** 18;
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
};

/**
 * : Retrieves the getVilTokens in the account (yield)
 * of the provided `address`
 */
export const getVilTokens = async (provider, address) => {
  try {
    const tokenContract = new Contract(VILLAGERCONTRACT, VILLAGERABI, provider);
    const tokenBalance = await tokenContract.balanceOf(address);
    return tokenBalance / 10 ** 18;
  } catch (err) {
    console.error(err);
  }
};

//getDaiTokensUnstaked

export const getDaiTokensUnstaked = async (provider, address) => {
  try {
    const daiAddress = new Contract(DAICONTRACT, DAICONTRACTABI, provider);
    const daiTokens = await daiAddress.balanceOf(address);
    return daiTokens / 10 ** 18;
  } catch (err) {
    console.error(err);
  }
};

export const getDaiTokensStaked = async (provider, address) => {
  try {
    const stakingManagerAddress = new Contract(
      STAKINGMANAGERCONTRACT,
      STAKINGMANAGERABI,
      provider
    );
    const daiTokensStaked = await stakingManagerAddress.stakingBalance[address];
    return daiTokensStaked;
  } catch (err) {
    console.error(err);
  }
};

/**
 * getReserveOfCDTokens: Retrieves the amount of CD tokens in the
 * exchange contract address
 */
