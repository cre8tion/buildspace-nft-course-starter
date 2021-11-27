import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import Loader from "react-loader-spinner";
import React, { useCallback, useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFT.json';

const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x5310b3DeC733e56c64dC5319EFe5Df752d25bCab";
const OPENSEA_MINT_LINK = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}`;
const OPENSEA_COLLECTION_LINK = `https://testnets.opensea.io/collection/squarenft-h1twir3gia`;
const TOTAL_MINT_COUNT = 50;


const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [mintedNFTs, setMintedNFTs] = useState(null);
    const [isMinting, setIsMinting] = useState(false);
    const isMintable = mintedNFTs !== null && mintedNFTs <= TOTAL_MINT_COUNT;

    const setupEventListener = useCallback(async () => {
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
          connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
            console.log(from, tokenId.toNumber())
            setIsMinting(false)
            alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: ${OPENSEA_MINT_LINK}/${tokenId.toNumber()}`)
            getMintedNFTs();
          });
  
          console.log("Setup event listener!")
  
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    }, [])

    const checkCurrentNetwork = async () => {
      try {
        const { ethereum } = window;
  
        if (!ethereum) {
          alert("Get MetaMask!");
          return;
        }
  
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
  
        // String, hex code of the chainId of the Rinkebey test network
        const rinkebyChainId = "0x4"; 
        if (chainId !== rinkebyChainId) {
          alert("You are not connected to the Rinkeby Test Network!");
          return false;
        }
      } catch (error) {
        console.log(error)
      }
    }
    
    const checkIfWalletIsConnected = useCallback( async () => {
      const { ethereum } = window;

      if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
      } else {
          console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
					setCurrentAccount(account)
          
          if(checkCurrentNetwork()){
            setupEventListener();
            getMintedNFTs();
          }
      } else {
          console.log("No authorized account found")
      }
  }, [setupEventListener])

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      if(checkCurrentNetwork()){
        setupEventListener();
        getMintedNFTs();
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getMintedNFTs = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        let totalNFTs = await connectedContract.getTotalNFTsMinted();
        setMintedNFTs(totalNFTs.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);

        console.log("Mining...please wait.")
        await nftTxn.wait();

        if(isMinting){
          setIsMinting(false);
        }
        console.log(nftTxn);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected])

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = (isMintable) => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button" disabled={!isMintable}>
      Mint NFT
    </button>
  )

  const renderLoadingIndicator = () => (
    <div className="loading-container">    
      <Loader
        type="TailSpin"
        color="#00BFFF"
        height={100}
        width={100}
      />
    </div>
  )

  const renderViewCollectionButton = () => (
    <button onClick={()=> window.open(OPENSEA_COLLECTION_LINK, "_blank")} className="cta-button view-collection-button">
      🌊 View Collection on OpenSea
    </button>
  )

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI(isMintable)}
          {isMinting ? renderLoadingIndicator() : null}
          <p className="sub-text">{mintedNFTs}/{TOTAL_MINT_COUNT} NFTs minted so far</p>
          {renderViewCollectionButton()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;