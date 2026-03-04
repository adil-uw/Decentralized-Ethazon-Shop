// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EthazonShop {
    // Every order has the same fixed price
    uint256 public constant PRICE = 0.1 ether;

    struct EthazonOrder {
        bool isValidEthazonOrder; // true when ordered, false when canceled/reset
        string customerName;      // name of the customer
        string shippingAddress;   // mailing address
        bool hasConfirmed;        // true when order is confirmed
    }

    // One contract serves all customers
    mapping(address => EthazonOrder) public orders;

    // Events for readable output in Hardhat console / tests / frontend
    event OrderCreated(address indexed customer, string name, string shippingAddress, uint256 amountPaid);
    event OrderConfirmed(address indexed customer);
    event OrderCanceled(address indexed customer, uint256 refundAmount);

    // -------- Modifiers (rubric) --------

    // Customer must have a valid order
    modifier hasValidOrder() {
        require(orders[msg.sender].isValidEthazonOrder, "No valid order");
        _;
    }

    // Order must NOT be confirmed yet
    modifier notConfirmedYet() {
        require(!orders[msg.sender].hasConfirmed, "Order already confirmed");
        _;
    }

    // Customer can only create a new order if they don't have an active unconfirmed one
    modifier canCreateNewOrder() {
        EthazonOrder storage o = orders[msg.sender];
        require(!(o.isValidEthazonOrder && !o.hasConfirmed), "Finish or cancel existing order");
        _;
    }

    // -------- Function 1: Make Booking/Order (Payable) --------
    function makeOrder(string calldata customerName, string calldata shippingAddress)
        external
        payable
        canCreateNewOrder
    {
        // Mandatory tests: name/address cannot be empty
        require(bytes(customerName).length > 0, "Name required");
        require(bytes(shippingAddress).length > 0, "Address required");

        // Mandatory test: must send correct amount of ETH
        require(msg.value == PRICE, "Incorrect ETH amount");

        // Store/overwrite the order (no historical records required)
        orders[msg.sender] = EthazonOrder({
            isValidEthazonOrder: true,
            customerName: customerName,
            shippingAddress: shippingAddress,
            hasConfirmed: false
        });

        emit OrderCreated(msg.sender, customerName, shippingAddress, msg.value);
    }

    // -------- Function 2: Check-in/Confirm Order --------
    function confirmOrder()
        external
        hasValidOrder
    {
        // Mark confirmed
        orders[msg.sender].hasConfirmed = true;

        emit OrderConfirmed(msg.sender);
    }

    // -------- Function 3: Cancel Order + Refund --------
    function cancelOrder()
        external
        hasValidOrder
        notConfirmedYet
    {
        // Step 1: update state first (best practice)
        orders[msg.sender].isValidEthazonOrder = false;

        // Step 2: refund customer
        (bool ok, ) = payable(msg.sender).call{value: PRICE}("");
        require(ok, "Refund failed");

        emit OrderCanceled(msg.sender, PRICE);
    }
}