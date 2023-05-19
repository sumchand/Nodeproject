import 'regenerator-runtime/runtime';
import { Wallet } from './near-wallet';




const CONTRACT_ADDRESS = process.env.CONTRACT_NAME || dev-1684400164818-80195537676058;

// When creating the wallet you can optionally ask to create an access key
// Having the key enables to call non-payable methods without interrupting the user to sign
const wallet = new Wallet({ createAccessKeyFor: CONTRACT_ADDRESS })

// Setup on page load
window.onload = async () => {
  let isSignedIn = await wallet.startUp();

  if (isSignedIn) {
    signedInFlow();
  } else {
    signedOutFlow();
  }


};

// Button clicks
//document.querySelector('form').onsubmit = setGreeting;
document.querySelector('#mform').onsubmit = mintNft;
document.querySelector('#sign-in-button').onclick = () => { wallet.signIn(); };
document.querySelector('#sign-out-button').onclick = () => { wallet.signOut(); };

async function mintNft(event) {
  event.preventDefault();
  document.querySelector('#mButton').style.display = 'block';


  const { email } = event.target.elements;
  
  const amount = "0.01";
  await wallet.callMethod({ method: 'storage_deposit', args: { account_id:email.value}, contractId: CONTRACT_ADDRESS, attachedDeposit:amount });
  console.log("email:",email.value);



}
 

// UI: Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('#signed-in-flow').style.display = 'none';
  document.querySelector('#signed-out-flow').style.display = 'block';
}

// UI: Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
  document.querySelector('#signed-out-flow').style.display = 'none';
  document.querySelector('#signed-in-flow').style.display = 'block';
  document.querySelector('#save').style.display = 'block';
  document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
    el.innerText = wallet.accountId;
  });
}