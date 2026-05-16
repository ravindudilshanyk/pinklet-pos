import { useState } from "react";
import { useBillingStore, BillItem } from "@/stores/billingStore";
import DiscountPanel from "./DiscountPanel";

interface Props {
  item: BillItem;
  index: number;
}

export default function BillItemRow({ item, index }: Props) {
  const updateQuantity = useBillingStore((s) => s.updateQuantity);
  const removeItem = useBillingStore((s) => s.removeItem);
  const [showDiscount, setShowDiscount] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "rgba(238,45,124,0.02)",
        border: "1px solid rgba(238,45,124,0.10)",
        borderRadius: "12px",
        padding: "10px",
        transition: "all 0.15s",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        {/* Index */}
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            backgroundColor: "rgba(238,45,124,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            color: "#EE2D7C",
            flexShrink: 0,
            marginTop: "1px",
          }}
        >
          {index + 1}
        </div>

        {/* Name + price */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#090909",
              margin: "0 0 2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </p>
          <p style={{ fontSize: "11px", color: "rgba(9,9,9,0.45)", margin: 0 }}>
            Rs. {item.unitPrice.toLocaleString()} × {item.quantity}
          </p>
        </div>

        {/* Line total */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#090909",
              margin: "0 0 2px",
            }}
          >
            Rs.{" "}
            {item.lineTotal.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "#22c55e",
              margin: 0,
              fontWeight: 500,
            }}
          >
            +Rs.{" "}
            {item.profit.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Remove */}
        <button
          onClick={() => removeItem(item.itemId)}
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "rgba(239,68,68,0.10)",
            color: "#ef4444",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            flexShrink: 0,
            marginTop: "1px",
          }}
        >
          ×
        </button>
      </div>

      {/* Bottom row — quantity + discount */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "8px",
        }}
      >
        {/* Quantity controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "white",
            border: "1px solid rgba(238,45,124,0.15)",
            borderRadius: "8px",
            padding: "3px 8px",
          }}
        >
          <button
            onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
            style={{
              width: "20px",
              height: "20px",
              border: "none",
              backgroundColor: "transparent",
              color: "#EE2D7C",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            −
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.itemId, parseInt(e.target.value) || 1)
            }
            style={{
              width: "32px",
              border: "none",
              outline: "none",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 600,
              color: "#090909",
              fontFamily: "Inter, sans-serif",
              backgroundColor: "transparent",
            }}
          />
          <button
            onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            style={{
              width: "20px",
              height: "20px",
              border: "none",
              backgroundColor: "transparent",
              color:
                item.quantity >= item.stock ? "rgba(9,9,9,0.20)" : "#EE2D7C",
              cursor: item.quantity >= item.stock ? "not-allowed" : "pointer",
              fontSize: "16px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            +
          </button>
        </div>

        {/* Discount button */}
        <button
          onClick={() => setShowDiscount(!showDiscount)}
          style={{
            padding: "4px 10px",
            borderRadius: "8px",
            border: "1px solid rgba(238,45,124,0.20)",
            backgroundColor: item.discount
              ? "rgba(238,45,124,0.08)"
              : "transparent",
            color: item.discount ? "#EE2D7C" : "rgba(9,9,9,0.45)",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {item.discount
            ? `% ${item.discount.label || "Discount applied"}`
            : "% Discount"}
        </button>
      </div>

      {/* Discount panel */}
      {showDiscount && (
        <DiscountPanel
          itemId={item.itemId}
          unitPrice={item.unitPrice}
          quantity={item.quantity}
          onClose={() => setShowDiscount(false)}
        />
      )}
    </div>
  );
}
