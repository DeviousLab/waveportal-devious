import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/waveportal.json"

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);
  const [message, setMessage] = React.useState("");

  const contractAddress = "0x5CbCf6B63C4C2418C84CFDEf0f13dc7AeB1f034C";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have a MetaMask wallet");
    } else {
      console.log("We have the ethereum object", ethereum);
    }
  
  ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorised account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No valid account found");
      }
    })
  }
  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get MetaMask!");
    }
    ethereum.request({ method: 'eth_requestAccounts'})
      .then(accounts => {
        console.log("Connected!", accounts[0]);
        setCurrentAccount(accounts[0]);
      })
      .catch(err => console.log(err));
  }
  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await waveportalContract.getTotalWaves();
    console.log("Retreived total wave count:", count.toNumber());

    const waveTxn = await waveportalContract.wave(message);
    console.log("Mining:", waveTxn.hash);
    await waveTxn.wait();
    console.log("Mined:", waveTxn.hash);

    count = await waveportalContract.getTotalWaves();
    console.log("Retreived total wave count:", count.toNumber());
  }
  async function getAllWaves() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let waves = await waveportalContract.getAllWaves();

    let wavesCleaned = [];
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    setAllWaves(wavesCleaned);
  }

  React.useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header"> 
          <span role="img" aria-label="Waving Hand">👋</span> Hey there!
        </div>

        <div className="bio">
        Connect your Ethereum wallet and wave at me!
        </div>

        {currentAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <form>
        <label className="bio">Write me a message!</label>
            <input name="message" type="text" value={message} onChange={e => setMessage(e.target.value)} />
        </form>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {allWaves.map((wave, index) => {
          return (
            <div style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}} key={index}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
