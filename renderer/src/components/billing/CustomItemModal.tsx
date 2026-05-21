import { useState } from "react";
import { useBillingStore } from "@/stores/billingStore";

interface Props {
  onClose: () => void;
}

const CAKE_TYPES = [
  "Birthday",
  "Anniversary",
  "Mother's Day",
  "Valentine's Day",
  "Wedding",
  "Baby Shower",
  "Graduation",
  "Christmas",
  "Other",
];

const FLAVOURS = [
  "Chocolate",
  "Vanilla",
  "Strawberry",
  "Red Velvet",
  "Butterscotch",
  "Black Forest",
  "Pineapple",
  "Mango",
  "Other",
];

const inputRow: React.CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  backgroundColor: "rgba(238,45,124,0.04)",
  border: "1px solid rgba(238,45,124,0.18)",
  borderRadius: "12px",
  height: "50px",
  marginBottom: "10px",
  overflow: "hidden",
};

const twoColumnRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  marginBottom: "12px",
};

const pillWrap: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginBottom: "12px",
};

const inputInner: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flex: 1,
  padding: "0 16px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "14px",
  color: "#090909",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "transparent",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "rgba(9,9,9,0.45)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "6px",
};

export default function CustomItemModal({ onClose }: Props) {
  const addItem = useBillingStore((s) => s.addItem);

  const [form, setForm] = useState({
    name: "",
    cakeType: "",
    flavour: "",
    weight: "",
    message: "",
    designNotes: "",
    sellingPrice: "",
    buyingPrice: "",
    quantity: "1",
    discount: "0",
  });

  const [error, setError] = useState("");

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const sellingPrice = parseFloat(form.sellingPrice || "0");
  const buyingPrice = parseFloat(form.buyingPrice || "0");
  const quantity = parseInt(form.quantity || "1");
  const discountAmount = parseFloat(form.discount || "0");
  const lineTotal = Math.max(0, sellingPrice * quantity - discountAmount);
  const profit = (sellingPrice - buyingPrice) * quantity - discountAmount;

  const isValid = form.name.trim() && sellingPrice > 0 && buyingPrice >= 0;

  const handleAdd = () => {
    setError("");
    if (!form.name.trim()) return setError("Item name is required");
    if (!form.sellingPrice) return setError("Selling price is required");
    if (sellingPrice <= 0)
      return setError("Selling price must be greater than 0");

    const label = [
      form.cakeType,
      form.flavour,
      form.weight ? `${form.weight}kg` : "",
    ]
      .filter(Boolean)
      .join(" · ");

    addItem({
      itemId: `custom_${Date.now()}`,
      name: `🎂 ${form.name}${label ? ` (${label})` : ""}`,
      unitPrice: sellingPrice,
      buyingPrice,
      quantity,
      stock: 9999,
      discount:
        discountAmount > 0
          ? {
            type: "amount",
            value: discountAmount,
            label: `Rs. ${discountAmount} Off`,
            amount: discountAmount,
          }
          : undefined,
    });

    onClose();
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
          maxWidth: "520px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px rgba(9,9,9,0.20)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(9,9,9,0.06)",
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 700,
                color: "#090909",
              }}
            >
              🎂 Add Custom Item
            </h3>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "12px",
                color: "rgba(9,9,9,0.45)",
              }}
            >
              Fill in the details for this custom order
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

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 22px" }}>
          {/* Item Name */}
          <p style={labelStyle}>Item Name *</p>
          <div style={inputRow}>
            <div style={inputInner}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Custom Birthday Cake"
                style={inputStyle}
                autoFocus
              />
            </div>
          </div>

          {/* Cake Type */}
          <p style={labelStyle}>Cake Type</p>
          <div
            style={{
              ...pillWrap,
            }}
          >
            {CAKE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() =>
                  set("cakeType", form.cakeType === type ? "" : type)
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border:
                    form.cakeType === type
                      ? "2px solid #EE2D7C"
                      : "1px solid rgba(238,45,124,0.20)",
                  backgroundColor:
                    form.cakeType === type
                      ? "rgba(238,45,124,0.08)"
                      : "transparent",
                  color:
                    form.cakeType === type ? "#EE2D7C" : "rgba(9,9,9,0.55)",
                  fontSize: "12px",
                  fontWeight: form.cakeType === type ? 600 : 500,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Flavour */}
          <p style={labelStyle}>Flavour</p>
          <div
            style={{
              ...pillWrap,
            }}
          >
            {FLAVOURS.map((f) => (
              <button
                key={f}
                onClick={() => set("flavour", form.flavour === f ? "" : f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border:
                    form.flavour === f
                      ? "2px solid #EE2D7C"
                      : "1px solid rgba(238,45,124,0.20)",
                  backgroundColor:
                    form.flavour === f
                      ? "rgba(238,45,124,0.08)"
                      : "transparent",
                  color: form.flavour === f ? "#EE2D7C" : "rgba(9,9,9,0.55)",
                  fontSize: "12px",
                  fontWeight: form.flavour === f ? 600 : 500,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Weight + Quantity row */}
          <div style={twoColumnRow}>
            <div style={{ flex: 1 }}>
              <p style={labelStyle}>Weight (kg)</p>
              <div style={inputRow}>
                <div style={inputInner}>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(9,9,9,0.35)",
                      fontWeight: 500,
                    }}
                  >kg
                  </span>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => set("weight", e.target.value)}
                    placeholder="e.g. 1.5"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            <div>
              <p style={labelStyle}>Quantity</p>
              <div style={inputRow}>
                <div style={inputInner}>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selling Price + Buying Price row */}
          <div style={twoColumnRow}>
            <div>
              <p style={labelStyle}>Selling Price (Rs.) *</p>
              <div style={inputRow}>
                <div style={inputInner}>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(9,9,9,0.35)",
                      fontWeight: 600,
                    }}
                  >
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={form.sellingPrice}
                    onChange={(e) => set("sellingPrice", e.target.value)}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            <div>
              <p style={labelStyle}>Cost Price (Rs.)</p>
              <div style={inputRow}>
                <div style={inputInner}>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(9,9,9,0.35)",
                      fontWeight: 600,
                    }}
                  >
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={form.buyingPrice}
                    onChange={(e) => set("buyingPrice", e.target.value)}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Discount */}
          <p style={labelStyle}>Discount Amount (Rs.)</p>
          <div style={inputRow}>
            <div style={inputInner}>
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(9,9,9,0.35)",
                  fontWeight: 600,
                }}
              >
                Rs.
              </span>
              <input
                type="number"
                value={form.discount}
                onChange={(e) => set("discount", e.target.value)}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Cake Message */}
          <p style={labelStyle}>Message on Cake</p>
          <div
            style={{
              ...inputRow,
              height: "auto",
              minHeight: "50px",
            }}
          >
            <div
              style={{
                ...inputInner,
                alignItems: "flex-start",
                padding: "12px 16px",
              }}
            >
              <textarea
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder='e.g. "Happy Birthday Sarah! 🎂"'
                rows={2}
                style={{
                  ...inputStyle,
                  resize: "none",
                  lineHeight: 1.5,
                }}
              />
            </div>
          </div>

          {/* Design Notes */}
          <p style={labelStyle}>Design Notes</p>
          <div
            style={{
              ...inputRow,
              height: "auto",
              minHeight: "50px",
            }}
          >
            <div
              style={{
                ...inputInner,
                alignItems: "flex-start",
                padding: "12px 16px",
              }}
            >
              <textarea
                value={form.designNotes}
                onChange={(e) => set("designNotes", e.target.value)}
                placeholder="e.g. Blue flowers, gold letters, photo on top"
                rows={2}
                style={{
                  ...inputStyle,
                  resize: "none",
                  lineHeight: 1.5,
                }}
              />
            </div>
          </div>

          {/* Live preview */}
          {sellingPrice > 0 && (
            <div
              style={{
                backgroundColor: "rgba(238,45,124,0.04)",
                border: "1px solid rgba(238,45,124,0.15)",
                borderRadius: "14px",
                padding: "14px 14px 12px",
                marginTop: "4px",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#EE2D7C",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Preview
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "13px", color: "rgba(9,9,9,0.55)" }}>
                  Selling Price × {quantity}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#090909",
                  }}
                >
                  Rs.{" "}
                  {(sellingPrice * quantity).toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {discountAmount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "rgba(9,9,9,0.55)" }}>
                    Discount
                  </span>
                  <span style={{ fontSize: "13px", color: "#ef4444" }}>
                    - Rs. {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div
                style={{
                  borderTop: "1px solid rgba(9,9,9,0.08)",
                  marginTop: "8px",
                  paddingTop: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#090909",
                  }}
                >
                  Line Total
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#EE2D7C",
                  }}
                >
                  Rs.{" "}
                  {lineTotal.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {buyingPrice > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "4px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "rgba(9,9,9,0.40)" }}>
                    Your Profit
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: profit >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  >
                    Rs.{" "}
                    {profit.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                fontSize: "13px",
                padding: "8px 14px",
                borderRadius: "10px",
                marginTop: "10px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(9,9,9,0.06)",
            display: "flex",
            gap: "10px",
            flexShrink: 0,
          }}
        >
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
            onClick={handleAdd}
            disabled={!isValid}
            style={{
              flex: 2,
              padding: "13px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: isValid ? "#EE2D7C" : "rgba(238,45,124,0.30)",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
              cursor: isValid ? "pointer" : "not-allowed",
              fontFamily: "Inter, sans-serif",
              transition: "background-color 0.2s",
            }}
          >
            🎂 Add to Bill
          </button>
        </div>
      </div>
    </div>
  );
}
