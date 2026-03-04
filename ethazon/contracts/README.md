# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
npx hardhat run scripts/deploy.js --network localhost
npx hardhat console --network localhost

npx hardhat run scripts/deploy.js --network sepolia
```


EthazonShop deployed to: 0xe2C16E5F68732e2A27A813a6D76859C66105da75

https://sepolia.etherscan.io/address/0xe2C16E5F68732e2A27A813a6D76859C66105da75

*****Test 1: Make Order (Success)

await shop.connect(user0).makeOrder("Adil","Seattle",{ value: ethers.parseEther("0.1") });

Then check balance:

await ethers.provider.getBalance(await shop.getAddress());

************

Test 2: Try Second Order (Should Fail)

await shop.connect(user0).makeOrder("Adil2","Seattle2",{ value: ethers.parseEther("0.1") });

************'

Confirm Order
await shop.connect(user0).confirmOrder();

Now check order:

await shop.orders(await user0.getAddress());

hasConfirmed should now be true.

*************

Try Cancel After Confirm (Should Fail)

await shop.connect(user0).cancelOrder();

Should revert:

Order already confirmed

********


Make New Order After Confirm (Should Work)

await shop.connect(user0).makeOrder("Adil3","Seattle3",{ value: ethers.parseEther("0.1") });

This should succeed.

***************


Cancel Before Confirm (Should Refund)

await shop.connect(user0).cancelOrder();

Now check contract balance again:

await ethers.provider.getBalance(await shop.getAddress());

It should go back down by 0.1 ETH.


**************