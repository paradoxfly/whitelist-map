import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno } from '@reach-sh/stdlib/ask.mjs';
const stdlib = loadStdlib(process.env);

//create test account
const startingBalance = stdlib.parseCurrency(1000);
const acc = await stdlib.newTestAccount(startingBalance);
const WHITELIST = [];

//Set up functions for checking balance
const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));

const before = await getBalance()
console.log('Your starting balance is: ' + before)
console.log(`Your address is ${acc.getAddress()}`)

//Define common interface for both participants
const Common = {
  //...hasRandom
  random: () => stdlib.hasRandom.random(),

  //function that gets called when checkBalance is called
  checkBalance: async (token) => {
    console.log(`Your network token balance is ${await getBalance()}`)
    console.log(`Your non-network token balance is ${fmt(await stdlib.balanceOf(acc, token))}`)
  },
};

//Define interface for Deployer
const Deployer = {
  ...Common,

  viewWhitelist: async (address) => {
    WHITELIST.push((address))
    console.log(' ------ WHITELIST ------')
    for(let i = 0; i < WHITELIST.length; i++){
      console.log(`Address ${i}: ${WHITELIST[i]}`)
    }
    console.log('-----------------------')
  },


};


//Define interface for Attacher
const Attacher = {
  ...Common,

  acceptToken: async (token) => {
    const tokenID = stdlib.bigNumberToNumber(token)
    await acc.tokenAccept(tokenID)
  },

  submitAddress: async () => {
    const proceed = await ask('Do you want to submit your address to contract?', yesno)
    if(!proceed) process.exit();
  },

  whitelistSuccess: (outcome) => {
    if(outcome){
      console.log('Successfully got added to whitelist. Will receive tokens shortly')
    }
    else{
      console.log('Your address wasnt added to whitelist')
    }
  },

  timeout: () => console.log('Time Out')

};


const program = async () => {

  const isDeployer = await ask(
    `Do you want to deploy the contract?`,
    yesno
  )
  const who = isDeployer ? 'Deployer' : 'Attacher';

  console.log(`Starting as ${who}`);

  //Contract gets initialized here
  let ctc = null;   
  if(isDeployer){
    const BFR = await stdlib.launchToken(acc, "BFR", "BFR")
    ctc =  acc.contract(backend);
    backend.Deployer(ctc, { ...Deployer, getTokenId: () => BFR.id });
    console.log('Deploying contract...');

    const info = JSON.stringify(await ctc.getInfo(), null, 1) //fetch contract info
    console.log(info); //display info
  }
  else{
    const info = await ask(
      `Please paste the contract information of the contract you want to subscribe to:`, 
      JSON.parse
    );
    ctc = acc.contract(backend, info);
    backend.Attacher(ctc, Attacher);
    console.log("Successfully connected");
  }

}

await program();
