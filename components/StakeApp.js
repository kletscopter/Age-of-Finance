import { useEffect, useState, useRef } from "react";
import { useNotification } from "web3uikit";

import {
  DAICONTRACT,
  DAICONTRACTABI,
  STAKINGMANAGERABI,
  STAKINGMANAGERCONTRACT,
  VILLAGERABI,
  VILLAGERCONTRACT,
} from "../constants";
import {
  getEtherBalance,
  getVilTokens,
  getDaiTokensUnstaked,
  getDaiTokensStaked,
} from "./GetAmounts";
import { BigNumber, Contract, ethers, utils } from "ethers";
import { SupportedAlgorithm } from "ethers/lib/utils";

export default function StakeApp() {
  //our contracts & state variables
  const [stakeAmount, setStakeAmount] = useState(BigNumber.zero);
  const [daiTokensStaked, setStakedDai] = useState("0");
  const [daiTokensUnstaked, setUnstakedDai] = useState("0");
  const [currentAddress, setCurrentAddress] = useState("0");
  const [earnedYield, setEarnedYield] = useState("0");
  const [numberOfStakers, setNumberOfStakers] = useState("0");
  const [walletConnected, setWalletConnected] = useState(false);
  const [villagerBalance, setVillagerBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const daiAddress = DAICONTRACT;
  const [web3Modal, setWeb3Modal] = useState({});
  const [isMinter, setMinter] = useState();
  const stakingmanagerAddress = STAKINGMANAGERCONTRACT;
  const [counter, changeCounter] = useState(0);
  const dispatch = useNotification();

  const stakeFunction = async () => {
    const signer = await getProviderOrSigner(true);
    const swapAmountWei = utils.parseEther((stakeAmount * 10 ** 18).toString()); //takes a fraction of stakeAmount to add later as value for gas
    const stakingMgr = new Contract(
      STAKINGMANAGERCONTRACT,
      STAKINGMANAGERABI,
      signer
    );
    const daiContract = new Contract(DAICONTRACT, DAICONTRACTABI, signer);
    try {
      let tx;
      tx = await daiContract.approve(
        STAKINGMANAGERCONTRACT,
        swapAmountWei.toString()
      ); //Moet eerst nog worden approved door contract, want gaat om een ERC20 token.
      //if true stake, if false unstake
      await tx.wait();
      //console.log((stakeAmount * 10 ** 18).toString());
      tx = await stakingMgr.stake((stakeAmount * 10 ** 18).toString());
      await tx.wait();
    } catch (err) {
      console.log(err);
    }
    setStakeAmount("0");
  };

  const unStakeFunction = async () => {
    const signer = await getProviderOrSigner(true);
    const swapAmountWei = utils.parseEther((stakeAmount * 10 ** 18).toString()); //takes a fraction of stakeAmount to add later as value for gas
    const stakingMgr = new Contract(
      STAKINGMANAGERCONTRACT,
      STAKINGMANAGERABI,
      signer
    );
    const daiContract = new Contract(DAICONTRACT, DAICONTRACTABI, signer);
    try {
      let tx;
      tx = await daiContract.approve(
        STAKINGMANAGERCONTRACT,
        swapAmountWei.toString()
      ); //Moet eerst nog worden approved door contract, want gaat om een ERC20 token.
      //if true stake, if false unstake
      await tx.wait();
      tx = await stakingMgr.unstake((stakeAmount * 10 ** 18).toString());
      await tx.wait();
    } catch (err) {
      console.log(err);
    }
    setStakeAmount("0");
  };

  const returnStakingBalance = async () => {
    //also returns yield
    if (currentAddress) {
      try {
        const providerr = await getProviderOrSigner(false);
        const stakingMgr = new Contract(
          STAKINGMANAGERCONTRACT,
          STAKINGMANAGERABI,
          providerr
        );
        const vilContract = new Contract(
          VILLAGERCONTRACT,
          VILLAGERABI,
          providerr
        );
        //let balance = stakingMgr.stakingBalance[currentAddress]; -> werkt niet, echt een aparte functie nodig
        let balance = await stakingMgr.returnStakingBalance(currentAddress);
        balance = balance / 10 ** 18;
        let yieldBalance = await stakingMgr.calculateYieldTotal(currentAddress);
        yieldBalance = yieldBalance / 10 ** 18;
        let vilBalance = await stakingMgr.returnVilBalance(currentAddress);
        vilBalance = vilBalance / 10 ** 18;
        let isMinter = await vilContract.returnMinter(currentAddress);
        setVillagerBalance(vilBalance);
        setEarnedYield(yieldBalance);
        setStakedDai(balance);
        setMinter(isMinter);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const withDrawYield = async () => {
    try {
      const swapAmountWei = utils.parseEther(
        (earnedYield * 10 ** 18).toString()
      ); //takes a fraction of stakeAmount to add later as value for gas
      const signer = await getProviderOrSigner(true);
      const stakingMgr = new Contract(
        STAKINGMANAGERCONTRACT,
        STAKINGMANAGERABI,
        signer
      );
      console.log("test");
      let tx;
      const vilContract = new Contract(VILLAGERCONTRACT, VILLAGERABI, signer);
      /*tx = await vilContract.approve(
        STAKINGMANAGERCONTRACT,
        swapAmountWei.toString()
      ); //Moet eerst nog worden approved door contract, want gaat om een ERC20 token.
      await tx.wait(); */
      //if true stake, if false unstake
      console.log(earnedYield);
      tx = await stakingMgr.withdrawYield({ gasLimit: 3000000 });

      setEarnedYield("0");
      getAmounts();
    } catch (err) {
      console.log(err);
    }
  };

  //UI stuff
  /**
   * connectWallet: Connects the MetaMask wallet
   */
  /*const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      let web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions: "",
      });
      const instance = await web3Modal.connect();
      const prov = new ethers.providers.Web3Provider(instance);
      setProvider(prov);
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  }; */

  //getAmounts for everything
  const getAmounts = async () => {
    const provider = await getProviderOrSigner(false);
    const signer = await getProviderOrSigner(true);
    const address = await signer.getAddress(); //current address
    setCurrentAddress(address);
    //console.log(address);
    //get the amount of eth in the user's account:
    const ethBalance = await getEtherBalance(provider, address);
    const daiTokensUnstaked = await getDaiTokensUnstaked(provider, address);
    const daiTokensStaked = await getDaiTokensStaked(provider, address);
    // const daiTokensStaked = await getDaiTokensStaked(prov, address);
    // const vilTokens = await getVilTokens(prov, address);
    returnStakingBalance();
    setStakedDai(daiTokensStaked);
    setUnstakedDai(daiTokensUnstaked);
    //setStakedDai(daiTokensStaked);
    setEthBalance(ethBalance);
  };

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    // If user is not connected to the Goerli network, let them know and throw an error
    /*const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
  };*/

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  //connectWallet using button
  /*const renderButton = () => {
    if (!walletConnected) {
      return (
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      );
    } else {
      return (
        <button
          onClick={disconnectWallet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Disconnect
        </button>
      );
    }
  }; */

  //above function not necessary since we are using web3uikit

  useEffect(() => {
    /* const web3modal = new Web3Modal({
      network: "goerli", // optional
      cacheProvider: true, // optional
      providerOptions: {}, // required
      disableInjectedProvider: false,
    });
    setWeb3Modal(web3modal); */
    //connectWallet();
    const interval = setInterval(() => {
      changeCounter(counter + 1);
    }, 10000);
    getAmounts();
    return () => clearInterval(interval);
  }, [counter]);

  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNewNotification(tx);
    getAmounts();
  };

  const updateStake = (e) => {
    if (e.target.value.length > 0) {
      setTimeout(() => setStakeAmount(e.target.value), 1); //needs setTimeout otherwise page keeps hanging -> bug with onchange & setState
    }
  };

  const handleNewNotification = function () {
    dispatch({
      //zie web3uikit docs!
      type: "info",
      message: "Transaction Complete!",
      title: "Tx Notification",
      position: "topR",
    });
  };
  return (
    <div>
      {stakingmanagerAddress ? (
        <>
          <div className="flex space-x-5 mt-1 ml-0">
            <br />
            <div>
              <input
                type="number"
                placeholder="Amount"
                onChange={(e) => {
                  {
                    updateStake(e);
                  }
                }}
                className="enabled:hover:border-gray-400 disabled:opacity-75"
              />
            </div>
            <div>
              <button
                className="bg-blue-500 hover:bg-blue-800 text-white font-bold py-1 px-4 rounded ml-auto"
                onClick={async function () {
                  await stakeFunction({
                    onSucces: handleSuccess,
                    onError: (error) => console.log(error),
                  });
                }}
              >
                Stake Tokens
              </button>
            </div>
            <div>
              <input
                type="number"
                placeholder="Amount"
                onChange={(e) => {
                  {
                    updateStake(e);
                  }
                }}
                className="enabled:hover:border-gray-400 disabled:opacity-75 ml-16"
              />
            </div>
            <div>
              <button
                className="bg-blue-500 hover:bg-blue-800 text-white font-bold py-1 px-4 rounded ml-auto"
                onClick={async function () {
                  await unStakeFunction({
                    onSucces: handleSuccess,
                    onError: (error) => console.log(error),
                  });
                }}
              >
                Unstake Tokens
              </button>
            </div>
            <div>
              <button
                className="bg-blue-500 hover:bg-blue-800 text-white font-bold py-1 px-4 rounded ml-auto"
                onClick={async function () {
                  withDrawYield({
                    onSucces: handleSuccess,
                    onError: (error) => console.log(error),
                  });
                }}
              >
                {" "}
                Withdraw Yield
              </button>
            </div>
          </div>
          <br />
          <br />
          <div className="shadow-md border-width: 2px border-4 border-black border-solid hover:outline-2 flex-auto w-64">
            <ul className="list-disc">
              You have:
              {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
              <li>{ethBalance} Eth</li>
              <li>{daiTokensUnstaked} Dai unstaked </li>
              <li>{daiTokensStaked} Dai staked</li>
              <li>{earnedYield} in VIL </li>
              <li>{villagerBalance} VIL to withdraw</li>
              <li>able to withdraw yield? {isMinter} </li>
            </ul>
          </div>
        </>
      ) : (
        <div>No stakingManager address detected</div>
      )}
    </div>
  );
}
