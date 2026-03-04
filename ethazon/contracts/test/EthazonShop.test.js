const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EthazonShop", function () {
  const PRICE = ethers.parseEther("0.1");

  async function deployFixture() {
    const [owner, user0, user1] = await ethers.getSigners();
    const EthazonShop = await ethers.getContractFactory("EthazonShop");
    const shop = await EthazonShop.deploy();
    await shop.waitForDeployment();
    return { shop, owner, user0, user1 };
  }

  it("1) cannot make the order if customerName is empty", async function () {
    const { shop, user0 } = await deployFixture();

    await expect(
      shop.connect(user0).makeOrder("", "Seattle", { value: PRICE })
    ).to.be.revertedWith("Name required");
  });

  it("2) cannot make the order if shippingAddress is empty", async function () {
    const { shop, user0 } = await deployFixture();

    await expect(
      shop.connect(user0).makeOrder("Adil", "", { value: PRICE })
    ).to.be.revertedWith("Address required");
  });

  it("3) cannot confirm if the order is not valid (isValidEthazonOrder is false)", async function () {
    const { shop, user0 } = await deployFixture();

    await expect(shop.connect(user0).confirmOrder()).to.be.revertedWith(
      "No valid order"
    );
  });

  it("4) cannot cancel the order if the customer has confirmed the order", async function () {
    const { shop, user0 } = await deployFixture();

    await shop.connect(user0).makeOrder("Adil", "Seattle", { value: PRICE });
    await shop.connect(user0).confirmOrder();

    await expect(shop.connect(user0).cancelOrder()).to.be.revertedWith(
      "Order already confirmed"
    );
  });

  it("5) cannot make another order before existing order is confirmed or canceled", async function () {
    const { shop, user0 } = await deployFixture();

    await shop.connect(user0).makeOrder("Adil", "Seattle", { value: PRICE });

    await expect(
      shop.connect(user0).makeOrder("Adil2", "Seattle2", { value: PRICE })
    ).to.be.revertedWith("Finish or cancel existing order");
  });

  it("6) cannot make an order if not enough ether is sent", async function () {
    const { shop, user0 } = await deployFixture();

    await expect(
      shop.connect(user0).makeOrder("Adil", "Seattle", {
        value: ethers.parseEther("0.05"),
      })
    ).to.be.revertedWith("Incorrect ETH amount");
  });

  it("7) creates an order successfully when everything is OK", async function () {
    const { shop, user0 } = await deployFixture();

    await shop.connect(user0).makeOrder("Adil", "Seattle", { value: PRICE });

    const order = await shop.orders(await user0.getAddress());
    expect(order.isValidEthazonOrder).to.equal(true);
    expect(order.customerName).to.equal("Adil");
    expect(order.shippingAddress).to.equal("Seattle");
    expect(order.hasConfirmed).to.equal(false);
  });

  it("8) customer receives money when cancelOrder succeeds (refund)", async function () {
    const { shop, user0 } = await deployFixture();

    await shop.connect(user0).makeOrder("Adil", "Seattle", { value: PRICE });

    // balance before (after order) — we will check delta around cancel
    const before = await ethers.provider.getBalance(await user0.getAddress());

    const tx = await shop.connect(user0).cancelOrder();
    const receipt = await tx.wait();

    // user pays gas for cancel tx, so we compute actual gas cost
    const gasUsed = receipt.gasUsed;
    const gasPrice = receipt.gasPrice;
    const gasCost = gasUsed * gasPrice;

    const after = await ethers.provider.getBalance(await user0.getAddress());

    // after should be before + PRICE - gasCost
    expect(after).to.equal(before + PRICE - gasCost);

    // order should be invalid now
    const order = await shop.orders(await user0.getAddress());
    expect(order.isValidEthazonOrder).to.equal(false);
  });

  it("9) can confirm the order if everything is good", async function () {
    const { shop, user0 } = await deployFixture();

    await shop.connect(user0).makeOrder("Adil", "Seattle", { value: PRICE });
    await shop.connect(user0).confirmOrder();

    const order = await shop.orders(await user0.getAddress());
    expect(order.hasConfirmed).to.equal(true);
    expect(order.isValidEthazonOrder).to.equal(true);
  });

  it("10) contract has correct ETH balance when an order is made", async function () {
    const { shop, user0 } = await deployFixture();

    const contractAddr = await shop.getAddress();
    const bal0 = await ethers.provider.getBalance(contractAddr);
    expect(bal0).to.equal(0n);

    await shop.connect(user0).makeOrder("Adil", "Seattle", { value: PRICE });

    const bal1 = await ethers.provider.getBalance(contractAddr);
    expect(bal1).to.equal(PRICE);
  });
});