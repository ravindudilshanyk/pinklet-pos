import { useState, useEffect } from "react";
import { useBillingStore } from "@/stores/billingStore";
import { billService } from "@/services/billing.service";

interface Props {
  onClose: () => void;
}

export default function HoldBillDrawer({ onClose }: Props) {
  const items = useBillingStore((s) => s.items);
  const customer = useBillingStore((s) => s.customer);
  const clearBill = useBillingStore((s) => s.clearBill);
  const addItem = useBillingStore((s) => s.addItem);

  const [heldBills, setHeldBills] = useState<any[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    billService.getHeldBills().then(setHeldBills);
  }, []);

  const handleHold = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      await billService.holdBill({
        label: label || `Bill ${new Date().toLocaleTimeString()}`,
        billData: { items, customer },
      });
      clearBill();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async (held: any) => {
    clearBill();
    held.data.items.forEach((item: any) => addItem(item));
    await billService.deleteHeldBill(held.id);
    onClose();
  };

  const handleDelete = async (id: string) => {
    await billService.deleteHeldBill(id);
    setHeldBills((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(9,9,9,0.40)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "24px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 8px 32px rgba(9,9,9,0.15)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "#090909",
            }}
          >
            Hold Bill
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "rgba(9,9,9,0.40)",
            }}
          >
            ×
          </button>
        </div>

        {/* Hold current bill */}
        {items.length > 0 && (
          <div
            style={{
              backgroundColor: "rgba(238,45,124,0.04)",
              border: "1px solid rgba(238,45,124,0.15)",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#090909",
                margin: "0 0 10px",
              }}
            >
              Hold current bill ({items.length} items)
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (optional)"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(238,45,124,0.18)",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                }}
              />
              <button
                onClick={handleHold}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#EE2D7C",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Hold
              </button>
            </div>
          </div>
        )}

        {/* Held bills list */}
        <p
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "rgba(9,9,9,0.45)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: "0 0 10px",
          }}
        >
          Held Bills ({heldBills.length})
        </p>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {heldBills.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "rgba(9,9,9,0.35)",
                fontSize: "13px",
                marginTop: "20px",
              }}
            >
              No held bills
            </p>
          )}
          {heldBills.map((held) => (
            <div
              key={held.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(9,9,9,0.08)",
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#090909",
                  }}
                >
                  {held.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "rgba(9,9,9,0.40)",
                  }}
                >
                  {held.data?.items?.length || 0} items ·{" "}
                  {new Date(held.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => handleResume(held)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "rgba(238,45,124,0.10)",
                  color: "#EE2D7C",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Resume
              </button>
              <button
                onClick={() => handleDelete(held.id)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "rgba(239,68,68,0.08)",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
