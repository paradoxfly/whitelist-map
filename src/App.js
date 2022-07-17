import * as backend from './build/index.main.mjs';
import { loadStdlib } from '@reach-sh/stdlib';
import { ALGO_MyAlgoConnect as MyAlgoConnect } from '@reach-sh/stdlib';

import './App.css';
import { views } from './utils/constants.js';
import { useState } from 'react';

//views
import { 
  ConnectAccount,
  DeployOrAttach,
  Deploying,
  Attaching,
  Timeout,
  PasteContractInfo,
  WhitelistSuccess,
  SetTokenInfo,
  SubmitAddress,
  DisplayWhitelist
} from './views/';

const reach = loadStdlib('ALGO');
reach.setWalletFallback(reach.walletFallback( { providerEnv: 'TestNet', MyAlgoConnect } ));
const fmt = (x) => reach.formatCurrency(x, 4);

function App() {
  const [ view, setView ] = useState(views.CONNECT_ACCOUNT);
  const [ tokenBalance, setTokenBalance ] = useState(0);
  const [ outcome, setOutcome ] = useState();
  const [ account, setAccount ] = useState({});
  const [ resolver, setResolver ] = useState();
  const [ contractInfo, setContractInfo ] = useState("");
  const [ whitelist, setWhitelist ] = useState([])
  const [ viewOutcome, setViewOutcome ] = useState(false)

  console.log(view)
  const helperFunctions = {
    connect: async (secret, mnemonic = false) => {
      let result = ""
      try {
        const account = mnemonic ? await reach.newAccountFromMnemonic(secret) : await reach.getDefaultAccount();
        setAccount(account);
        setView(views.DEPLOY_OR_ATTACH);
        result = 'success';
      } catch (error) {
        result = 'failed';
      }
      return result;
    },

    setAsDeployer: (deployer = true) => {
      if(deployer){
        setView(views.SET_TOKEN_INFO);
      }
      else{
        setView(views.PASTE_CONTRACT_INFO);
      }
    },

    deploy: async () => {
      const BFR = await reach.launchToken(account, "BFR", "BFR")
      const contract = account.contract(backend);
      backend.Deployer(contract, {
        ...Deployer, 
        getTokenId: async () => {
          setTokenBalance(fmt(await reach.balanceOf(account, BFR.id)))
          return BFR.id
        }
      });
      setView(views.DEPLOYING);
      const ctcInfo = JSON.stringify(await contract.getInfo(), null, 2)
      setContractInfo(ctcInfo);
      setView(views.DISPLAY_WHITELIST)
    },

    attach: (contractInfo) => {
      const contract = account.contract(backend, JSON.parse(contractInfo));
      backend.Attacher(contract, Attacher)
    },

  };

  const Common = {
    random: () => reach.hasRandom.random(),
  
    checkBalance: async (token) => {
      const tokBal = fmt(await reach.balanceOf(account, token))
      setTokenBalance(tokBal)
    },
  }

  const Deployer = {
    ...Common,
  
    viewWhitelist: async (address) => {
      setWhitelist(whitelist => whitelist.push(address))
    },

  }

  const Attacher = {
    ...Common,

    acceptToken: async (token) => {
      const tokenID = reach.bigNumberToNumber(token)
      await account.tokenAccept(tokenID)
    },

    submitAddress: async () => {
      return new Promise((resolve, reject) => {
        setResolver(resolve)
        setView(views.SUBMIT_ADDRESS)
      }) 
    },

    whitelistSuccess: (outcome) => {
      setOutcome(outcome)
      setViewOutcome(true)
    },

    timeout: () => {
      setView(views.TIME_OUT)
    }
  }

  return (
    <div className="App">

      <div className='topnav'>
        <h1>Whitelist</h1>
        <p>Token Balance: {tokenBalance}</p>
      </div>
      
      {
        view === views.CONNECT_ACCOUNT &&
        <ConnectAccount connect={helperFunctions.connect}/>
      }

      {
        view === views.DEPLOY_OR_ATTACH &&
        <DeployOrAttach setAsDeployer={helperFunctions.setAsDeployer}/>
      }

      {
        view === views.SET_TOKEN_INFO&&
        <SetTokenInfo deploy={helperFunctions.deploy}/>
      }

      {
        view === views.DEPLOYING &&
        <Deploying />
      }

      {
        view === views.DISPLAY_WHITELIST &&
        <DisplayWhitelist whitelist={whitelist} contractInfo={contractInfo}/>
      }

      {
        view === views.PASTE_CONTRACT_INFO && 
        <PasteContractInfo attach={helperFunctions.attach}/>
      }

      {
        viewOutcome && <WhitelistSuccess outcome={outcome} />
      }

      {
        view === views.SUBMIT_ADDRESS &&
        <SubmitAddress accept={resolver} redirect={() => setView(views.DEPLOY_OR_ATTACH)}/>
      }

      {
        view === views.ATTACHING &&
        <Attaching />
      }

      {
        view === views.TIME_OUT &&
        <Timeout />
      }

    </div>
  );
}

export default App;
