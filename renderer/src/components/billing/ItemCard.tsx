import { useState } from "react";
import { useBillingStore } from "@/stores/billingStore";

interface Props {
  item: {
    id: string;
    name: string;
    sellingPrice: number;
    buyingPrice: number;
    stock: number;
    lowStockAlert: number;
    imageUrl?: string;
    category?: { name: string };
  };
}

export default function ItemCard({ item }: Props) {
  const addItem = useBillingStore((s) => s.addItem);
  const billItems = useBillingStore((s) => s.items);
  const [clicked, setClicked] = useState(false);

  const inBill = billItems.find((i) => i.itemId === item.id);
  const isLowStock = item.stock <= item.lowStockAlert;
  const isOutOfStock = item.stock === 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addItem({
      itemId: item.id,
      name: item.name,
      unitPrice: item.sellingPrice,
      buyingPrice: item.buyingPrice,
      quantity: 1,
      stock: item.stock,
    });
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "14px",
        overflow: "hidden",
        border: inBill ? "2px solid #EE2D7C" : "1px solid rgba(9,9,9,0.06)",
        transition: "all 0.15s",
        opacity: isOutOfStock ? 0.6 : 1,
      }}
    >
      {/* Image placeholder */}
      <div
        style={{
          height: "120px",
          backgroundColor: "rgba(238,45,124,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <svg
            width="36"
            height="36"
            fill="none"
            stroke="rgba(238,45,124,0.30)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}

        {/* Stock badge */}
        {isLowStock && !isOutOfStock && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              backgroundColor: "#f59e0b",
              color: "white",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: "99px",
            }}
          >
            Low Stock
          </div>
        )}
        {isOutOfStock && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              backgroundColor: "#ef4444",
              color: "white",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: "99px",
            }}
          >
            Out of Stock
          </div>
        )}

        {/* In bill badge */}
        {inBill && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              backgroundColor: "#EE2D7C",
              color: "white",
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: "99px",
            }}
          >
            × {inBill.quantity}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px 12px" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#090909",
            margin: "0 0 2px",
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.name}
        </p>

        <p
          style={{
            fontSize: "11px",
            color: "rgba(9,9,9,0.40)",
            margin: "0 0 8px",
          }}
        >
          Stock: {item.stock}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#EE2D7C",
            }}
          >
            Rs. {item.sellingPrice.toLocaleString()}
          </span>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: clicked
                ? "#8F1B4A"
                : isOutOfStock
                  ? "rgba(9,9,9,0.10)"
                  : "rgba(238,45,124,0.10)",
              color: isOutOfStock ? "rgba(9,9,9,0.30)" : "#EE2D7C",
              fontSize: "12px",
              fontWeight: 600,
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {clicked ? "✓ Added" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
