
```shell

Ethazon Smart Contract Project

This project implements a simplified decentralized e-commerce order system using an Ethereum smart contract.
Users can create, confirm, or cancel orders while the payment is securely managed by the smart contract.

Technology Stack
    Backend
        Solidity
        Hardhat
        Hardhat Local Network
        Ethers.js
    Frontend 
        React (Vite)
        MetaMask
        Ethers.js

        ----------- ----------- PART 1 — Running the Project WITHOUT the Frontend ----------- ----------- 

This section explains how to run and test the smart contract directly using Hardhat console.

1. Install Dependencies
npm install ************

2. Compile the Smart Contract
npx hardhat compile

    This generates the contract ABI inside:
    artifacts/contracts/EthazonShop.sol/EthazonShop.json

3. Start Local Blockchain
npx hardhat node ********

    This starts a local Ethereum network with pre-funded accounts.
    Example accounts:
    Account #0
    Account #1
    Account #2
    ...
    Each account has 10,000 ETH for testing.

4. Deploy the Contract
    In another terminal run:
npx hardhat run scripts/deploy.js --network localhost **********
    You will see output like:
    EthazonShop deployed to:
    0x5FbDB2315678afecb367f032d93F642f64180aa3
    Copy this address for interacting with the contract.

5. Open Hardhat Console
npx hardhat console --network localhost ************8
Load the contract:
const shop = await ethers.getContractAt(
"EthazonShop",
"PASTE_DEPLOYED_ADDRESS"
);

6. Test Smart Contract Functions
    Create Order
    await shop.makeOrder("Adil", "Seattle", {
    value: ethers.parseEther("0.1")
    });
    Confirm Order
    await shop.confirmOrder();
    Cancel Order (Refund)
    await shop.cancelOrder();
    The smart contract automatically refunds the 0.1 ETH to the wallet that created the order.
    View Order State
    await shop.orders("USER_WALLET_ADDRESS");
    This retrieves the stored order information directly from the blockchain.



          -----------  -----------  PART 2 — Running the Project WITH the Frontend -----------  -----------

The frontend was implemented to demonstrate interaction between the UI, MetaMask wallet, and the smart contract.

1. Start Hardhat Node
npx hardhat node *********

2. Deploy Contract
npx hardhat run scripts/deploy.js --network localhost ************
Copy the deployed contract address.

3. Update Frontend Contract Address
    Open:
    frontend/src/config.js
    Update the contract address:
    export const CONTRACT_ADDRESS = "PASTE_DEPLOYED_ADDRESS";

4. Import Hardhat Account into MetaMask
    In MetaMask:
    Add network
    Network Name: Hardhat Local
    RPC URL: http://127.0.0.1:8545
    Chain ID: 31337
    Currency: ETH
    Import one Hardhat private key from the node output.

5. Install Frontend Dependencies
    Inside the frontend folder:
    cd frontend
    npm install**********

6. Start Frontend
    npm run dev *********
    Open the displayed local URL in your browser.

7. Frontend Features
    The frontend allows users to:
    Connect MetaMask wallet
    Create an order by paying 0.1 ETH
    Confirm an order
    Cancel an order and receive a refund
    View the current order state stored on-chain
    Important Notes
    If Hardhat node is restarted, the blockchain resets.
    The contract must be redeployed.
    The contract address in the frontend must be updated after each redeployment.



Author
Adil Nadeem
adiln@uw.edi 
University of Washington




```
