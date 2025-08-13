import React, { useState, useEffect, useRef } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

function App() {
  const [donations, setDonations] = useState([]);
  const [settledAmount, setSettledAmount] = useState(0);
  const [lastSettledAt, setLastSettledAt] = useState(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [expandedMonth, setExpandedMonth] = useState(null);

  const SETTLE_AMOUNT = 6000;

  // Track if initial Firestore load is complete to prevent overwrite
  const initialLoadDone = useRef(false);

  // Load data from Firestore once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "donationsData", "main"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDonations(data.donations || []);
          setSettledAmount(data.settledAmount || 0);
          setLastSettledAt(data.lastSettledAt || null);
        }
      } catch (error) {
        console.error("❌ Error fetching Firestore data:", error);
      } finally {
        initialLoadDone.current = true;  // Mark load complete
      }
    };
    fetchData();
  }, []);

  // Save data to Firestore when donations, settledAmount, or lastSettledAt changes
  // But only after initial data has loaded to avoid overwriting existing data
  useEffect(() => {
    if (!initialLoadDone.current) return; // skip save before initial load

    const saveData = async () => {
      try {
        await setDoc(doc(db, "donationsData", "main"), {
          donations,
          settledAmount,
          lastSettledAt,
        });
      } catch (error) {
        console.error("❌ Error saving to Firestore:", error);
      }
    };
    saveData();
  }, [donations, settledAmount, lastSettledAt]);

  const handleAddDonation = () => {
    if (!name || !amount || isNaN(amount)) return;

    const now = new Date();
    const month = now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    const newDonation = {
      name,
      amount: parseFloat(amount),
      timestamp: now.toLocaleString(),
      month,
    };

    setDonations((prev) => [...prev, newDonation]);
    setName("");
    setAmount("");
  };

  const totalAmount = donations.reduce((sum, entry) => sum + entry.amount, 0);
  const remaining = totalAmount - settledAmount;

  const handleSettle = () => {
    if (remaining >= SETTLE_AMOUNT) {
      const newSettled = settledAmount + SETTLE_AMOUNT;
      setSettledAmount(newSettled);

      setLastSettledAt(new Date().toLocaleString());
    }
  };

  const groupedDonations = donations.reduce((acc, donation) => {
    if (!acc[donation.month]) acc[donation.month] = [];
    acc[donation.month].push(donation);
    return acc;
  }, {});

  return (
    <div className="container">
      <h1>Krishana Puram Team 💰</h1>

      <div className="form">
        <input
          type="text"
          placeholder="Friend's Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleAddDonation}>Add Contributation</button>
      </div>

      <div className="summary">
        <h3>Remaining Amount: ₹{remaining.toFixed(2)}</h3>

        {lastSettledAt && (
          <p style={{ color: "green", marginTop: "0.5rem" }}>
            ✅ Settled on: {lastSettledAt}
          </p>
        )}

        <button
          className="settle"
          onClick={handleSettle}
          disabled={remaining < SETTLE_AMOUNT}
        >
          Settle ₹{SETTLE_AMOUNT}
        </button>
      </div>

      <div className="donation-list">
        <h3>Member List</h3>
        {Object.keys(groupedDonations).length === 0 ? (
          <p>No donations yet.</p>
        ) : (
          Object.entries(groupedDonations).map(([month, monthDonations]) => (
            <div key={month} style={{ marginBottom: "1rem" }}>
              <button
                onClick={() =>
                  setExpandedMonth((prev) => (prev === month ? null : month))
                }
                style={{
                  backgroundColor:
                    expandedMonth === month ? "#4CAF50" : "#2196F3",
                  color: "#fff",
                  padding: "10px 15px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  borderRadius: "8px",
                  marginBottom: "5px",
                  transition: "background-color 0.3s ease",
                }}
              >
                {month} {expandedMonth === month ? "⬆️" : "⬇️"}
              </button>

              {expandedMonth === month && (
                <ul style={{ paddingLeft: "1rem" }}>
                  {monthDonations
                    .slice()
                    .reverse()
                    .map((donation, index) => (
                      <li key={index}>
                        {donation.name} — ₹{donation.amount} <br />
                        <small>Donated on: {donation.timestamp}</small>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
