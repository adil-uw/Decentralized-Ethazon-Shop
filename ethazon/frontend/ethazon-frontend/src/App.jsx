import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

import EthazonArtifact from "./abi/EthazonShop.json";
import { CONTRACT_ADDRESS, HARDHAT_CHAIN_ID } from "./config";
import { BubbleBackgroundDemo } from "./components/BubbleBackgroundDemo";

function getNiceError(e) {
  if (e?.reason) return e.reason;
  if (e?.shortMessage) return e.shortMessage;

  const msg = e?.message || "";
  const m = msg.match(/execution reverted:\s*"([^"]+)"/);
  if (m?.[1]) return m[1];

  return "Transaction failed. Check inputs and network.";
}

export default function App() {
  const abi = EthazonArtifact.abi ?? EthazonArtifact;

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);

  const [name, setName] = useState("");
  const [ship, setShip] = useState("");

  const [status, setStatus] = useState("");
  const [priceEth, setPriceEth] = useState("-");
  const [contractBal, setContractBal] = useState("-");
  const [order, setOrder] = useState(null);

  const contract = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  }, [signer, abi]);

  const wrongNetwork = chainId !== null && chainId !== HARDHAT_CHAIN_ID;

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }

      const p = new ethers.BrowserProvider(window.ethereum);
      await p.send("eth_requestAccounts", []);

      const net = await p.getNetwork();
      const s = await p.getSigner();
      const addr = await s.getAddress();

      setProvider(p);
      setSigner(s);
      setAccount(addr);
      setChainId(Number(net.chainId));

      setStatus("Wallet connected ✅");
    } catch (e) {
      setStatus(getNiceError(e));
    }
  }

  async function refresh() {
    if (!provider || !contract || !account) return;

    try {
      // contract balance
      const balWei = await provider.getBalance(CONTRACT_ADDRESS);
      setContractBal(ethers.formatEther(balWei));

      // price constant
      const pWei = await contract.PRICE();
      setPriceEth(ethers.formatEther(pWei));

      // user order
      const o = await contract.orders(account);
      setOrder({
        isValid: o.isValidEthazonOrder,
        hasConfirmed: o.hasConfirmed,
        customerName: o.customerName,
        shippingAddress: o.shippingAddress,
      });
    } catch (e) {
      setStatus(getNiceError(e));
    }
  }

  async function makeOrder() {
    if (!contract) return;

    // client-side validation (prevents ugly revert blobs)
    if (!name.trim()) {
      setStatus("Name required");
      return;
    }
    if (!ship.trim()) {
      setStatus("Address required");
      return;
    }
    if (wrongNetwork) {
      setStatus(`Wrong network. Switch to Hardhat Local (${HARDHAT_CHAIN_ID}).`);
      return;
    }

    try {
      setStatus("Sending makeOrder...");
      const priceWei = await contract.PRICE();

      const tx = await contract.makeOrder(name.trim(), ship.trim(), {
        value: priceWei,
      });

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Order created ✅");
      await refresh();
    } catch (e) {
      setStatus(getNiceError(e));
    }
  }

  async function confirmOrder() {
    if (!contract) return;
    if (wrongNetwork) {
      setStatus(`Wrong network. Switch to Hardhat Local (${HARDHAT_CHAIN_ID}).`);
      return;
    }

    try {
      setStatus("Sending confirmOrder...");
      const tx = await contract.confirmOrder();
      await tx.wait();

      setStatus("Order confirmed ✅");
      await refresh();
    } catch (e) {
      setStatus(getNiceError(e));
    }
  }

  async function cancelOrder() {
    if (!contract) return;
    if (wrongNetwork) {
      setStatus(`Wrong network. Switch to Hardhat Local (${HARDHAT_CHAIN_ID}).`);
      return;
    }

    try {
      setStatus("Sending cancelOrder...");
      const tx = await contract.cancelOrder();
      await tx.wait();

      setStatus("Order canceled + refunded ✅");
      await refresh();
    } catch (e) {
      setStatus(getNiceError(e));
    }
  }

  useEffect(() => {
    if (provider && contract && account) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, contract, account]);

  const canAct = !!account && !wrongNetwork;
  const canConfirm = order?.isValid && !order?.hasConfirmed && canAct;
  const canCancel = order?.isValid && !order?.hasConfirmed && canAct;

  return (
    <div className="page">
      <div className="cardWrap">
        <BubbleBackgroundDemo interactive={true} />

        <div className="card">
          <div className="header">
            <div>
              <h1 className="title">Ethazon Shop</h1>
              <p className="subtitle">TCSS-590 | Adil Nadeem</p>
            </div>

            <div className="headerBtns">
              <button className="primary" onClick={connectWallet}>
                {account ? "Connected" : "Connect Wallet"}
              </button>

              <button className="secondary" onClick={refresh} disabled={!account}>
                Refresh
              </button>
            </div>
          </div>

          <div className="stats">
            <div className="statBox">
              <div className="statLabel">Account</div>
              <div className="mono statValue">{account || "-"}</div>
            </div>

            <div className="statBox">
              <div className="statLabel">Chain</div>
              <div className="statValue">
                {chainId ?? "-"} {wrongNetwork ? "(Wrong)" : ""}
              </div>
            </div>

            <div className="statBox">
              <div className="statLabel">Price</div>
              <div className="statValue">{priceEth} ETH</div>
            </div>

            <div className="statBox">
              <div className="statLabel">Contract Balance</div>
              <div className="statValue">{contractBal} ETH</div>
            </div>
          </div>

          {wrongNetwork && (
            <div className="warning">
              Switch MetaMask to <b>Hardhat Local</b> (Chain ID: {HARDHAT_CHAIN_ID})
            </div>
          )}

          <div className="divider" />

          <h2 className="sectionTitle">Create Order</h2>

          <div className="form">
            <input
              placeholder="Customer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canAct}
            />

            <input
              placeholder="Shipping Address"
              value={ship}
              onChange={(e) => setShip(e.target.value)}
              disabled={!canAct}
            />

            <button className="primary" onClick={makeOrder} disabled={!canAct}>
              Make Order ({priceEth} ETH)
            </button>

            <div className="btnRow">
              <button className="secondary" onClick={confirmOrder} disabled={!canConfirm}>
                Confirm Order
              </button>

              <button className="danger" onClick={cancelOrder} disabled={!canCancel}>
                Cancel + Refund
              </button>
            </div>
          </div>

          {/* Horizontal Cards: Status + Order */}
          <div className="infoRow">
            <div className="infoCard">
              <div className="infoTitle">Status</div>
              {status ? (
                <div className="smallLine">{status}</div>
              ) : (
                <div className="smallLine" style={{ opacity: 0.6 }}>
                  No messages yet
                </div>
              )}
            </div>

            <div className="infoCard">
              <div className="infoTitle">My Order</div>

              {!order ? (
                <div className="smallLine" style={{ opacity: 0.6 }}>
                  Connect wallet to load order…
                </div>
              ) : (
                <>
                  <div className="smallLine">
                    <span className={`badge ${order.isValid ? "badgeOk" : "badgeNo"}`}>
                      Valid: {String(order.isValid)}
                    </span>{" "}
                    <span
                      className={`badge ${
                        order.hasConfirmed ? "badgeOk" : "badgeNo"
                      }`}
                    >
                      Confirmed: {String(order.hasConfirmed)}
                    </span>
                  </div>

                  <div className="smallLine">
                    <b>Name:</b> {order.customerName || "-"}
                  </div>

                  <div className="smallLine">
                    <b>Address:</b> {order.shippingAddress || "-"}
                  </div>

                  {account && (
                    <div className="smallLine mono">Wallet: {account}</div>
                  )}
                </>
              )}
            </div>
          </div>

          <p className="footnote">
            Keep <b>npx hardhat node</b> running. If you restart it, redeploy and update
            the address.
          </p>
        </div>
      </div>
    </div>
  );
}