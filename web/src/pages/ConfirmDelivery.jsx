import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchAuctions, confirmDelivery } from "../features/auctionSlice";

export default function ConfirmDelivery() {
  const dispatch = useDispatch();

  // ✅ Correct selector (like Wallet example)
  const user = useSelector((s) => s.auth.user);
  const auctions = useSelector((s) => s.auctions.items) || [];

  useEffect(() => {
    dispatch(fetchAuctions());
  }, [dispatch]);

  const pending = auctions.filter(
    (a) =>
      a.status === "CLOSED" &&
      a.deliveryStatus &&
      !a.deliveryStatus.finalPaymentDone
  );

  const handleConfirm = (id) => {
    if (!user?._id) {
      alert("Please login to confirm delivery.");
      return;
    }
    // console.log("Confirming delivery for auction:", id);
    dispatch(confirmDelivery(id));
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Confirm Delivery</h2>
        {/* {console.log("User:", user)} */}
        {!user && (
          <p className="text-red">⚠ You must be logged in to confirm delivery.</p>
        )}

        {pending.length === 0 && <p>🎉 No pending deliveries right now.</p>}

        {pending.map((auction) => (
          <div key={auction._id} className="card" style={{ marginBottom: "1rem" }}>
            <h3>{auction.title}</h3>
            <p>Current Bid: ₹{auction.currentBid}</p>
            <p>
              Farmer:{" "}
              {auction.deliveryStatus?.farmerConfirmed
                ? "✔ Confirmed"
                : "❌ Pending"}
              <br />
              Buyer:{" "}
              {auction.deliveryStatus?.buyerConfirmed
                ? "✔ Confirmed"
                : "❌ Pending"}
            </p>

            <div>
              {user?._id === auction.farmer &&
                !auction.deliveryStatus?.farmerConfirmed && (
                  <button className="btn" onClick={() => handleConfirm(auction._id)}>
                    ✅ Farmer Confirm Delivery
                  </button>
                )}

              {user?._id === auction.currentWinner &&
                !auction.deliveryStatus?.buyerConfirmed && (
                  <button className="btn" onClick={() => handleConfirm(auction._id)}>
                    ✅ Buyer Confirm Delivery
                  </button>
                )}
            </div>

            {auction.deliveryStatus?.finalPaymentDone && (
              <p>✅ Final payment released!</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
