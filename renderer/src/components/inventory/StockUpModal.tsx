import { useState } from "react";
import { itemsService } from "@/services/items.service";

interface Props {
  item: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function StockUpModal({ item, onClose, onSaved }: Props) {
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const qty = parseInt(quantity || "0");
  const newStock = item.stock + qty;

  const handleSave = async () => {
    if (!quantity || qty <= 0) return setError("Enter a valid quantity");
    try {
      setLoading(true);
      await itemsService.adjustStock(
        item.id,
        qty,
        note || `Restocked ${qty} units`,
      );
      onSaved();
      onClose();
    } catch {
      setError("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(9,9,9,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        fontFamily: "Inter, sans-serif",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 8px 40px rgba(9,9,9,0.20)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(9,9,9,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 700,
                color: "#090909",
              }}
            >
              Stock Up
            </h3>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "12px",
                color: "rgba(9,9,9,0.45)",
              }}
            >
              {item.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "rgba(9,9,9,0.06)",
              color: "rgba(9,9,9,0.50)",
              cursor: "pointer",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Current stock info */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(9,9,9,0.04)",
                borderRadius: "12px",
                padding: "14px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "11px",
                  color: "rgba(9,9,9,0.45)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Current
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 800,
                  color:
                    item.stock <= item.lowStockAlert ? "#f59e0b" : "#090909",
                }}
              >
                {item.stock}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "rgba(9,9,9,0.25)",
                fontSize: "20px",
              }}
            >
              +
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(34,197,94,0.08)",
                borderRadius: "12px",
                padding: "14px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "11px",
                  color: "rgba(9,9,9,0.45)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Adding
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#16a34a",
                }}
              >
                {qty || 0}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "rgba(9,9,9,0.25)",
                fontSize: "20px",
              }}
            >
              =
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(238,45,124,0.06)",
                borderRadius: "12px",
                padding: "14px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "11px",
                  color: "rgba(9,9,9,0.45)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                New Total
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#EE2D7C",
                }}
              >
                {newStock}
              </p>
            </div>
          </div>

          {/* Quantity input */}
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "rgba(9,9,9,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "6px",
            }}
          >
            Quantity to Add
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(238,45,124,0.04)",
              border: "1px solid rgba(238,45,124,0.18)",
              borderRadius: "12px",
              height: "52px",
              padding: "0 16px",
              marginBottom: "12px",
            }}
          >
            <button
              onClick={() => setQuantity(String(Math.max(0, qty - 1)))}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "rgba(238,45,124,0.12)",
                color: "#EE2D7C",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              autoFocus
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "18px",
                fontWeight: 700,
                color: "#090909",
                fontFamily: "Inter, sans-serif",
                backgroundColor: "transparent",
                textAlign: "center",
              }}
            />
            <button
              onClick={() => setQuantity(String(qty + 1))}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "rgba(238,45,124,0.12)",
                color: "#EE2D7C",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
          </div>

          {/* Quick add buttons */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
            {[10, 25, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setQuantity(String(n))}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "8px",
                  border:
                    qty === n
                      ? "2px solid #EE2D7C"
                      : "1px solid rgba(238,45,124,0.20)",
                  backgroundColor:
                    qty === n ? "rgba(238,45,124,0.08)" : "transparent",
                  color: qty === n ? "#EE2D7C" : "rgba(9,9,9,0.50)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                +{n}
              </button>
            ))}
          </div>

          {/* Note */}
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "rgba(9,9,9,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "6px",
            }}
          >
            Note (optional)
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(238,45,124,0.04)",
              border: "1px solid rgba(238,45,124,0.18)",
              borderRadius: "12px",
              height: "46px",
              padding: "0 16px",
              marginBottom: "16px",
            }}
          >
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Restocked from supplier"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "13px",
                color: "#090909",
                fontFamily: "Inter, sans-serif",
                backgroundColor: "transparent",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                fontSize: "13px",
                padding: "8px 14px",
                borderRadius: "10px",
                marginBottom: "12px",
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "13px",
                borderRadius: "12px",
                border: "1px solid rgba(9,9,9,0.12)",
                backgroundColor: "transparent",
                color: "rgba(9,9,9,0.55)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || qty <= 0}
              style={{
                flex: 2,
                padding: "13px",
                borderRadius: "12px",
                border: "none",
                backgroundColor:
                  qty > 0 && !loading ? "#22c55e" : "rgba(34,197,94,0.35)",
                color: "white",
                fontSize: "14px",
                fontWeight: 700,
                cursor: qty > 0 && !loading ? "pointer" : "not-allowed",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {loading ? "Updating..." : `Add ${qty > 0 ? qty : ""} to Stock`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
