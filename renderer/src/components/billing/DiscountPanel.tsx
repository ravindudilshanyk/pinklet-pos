import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBillingStore } from "@/stores/billingStore";
import { billService } from "@/services/billing.service";

interface Props {
  itemId: string;
  unitPrice: number;
  quantity: number;
  onClose: () => void;
}

export default function DiscountPanel({
  itemId,
  unitPrice,
  quantity,
  onClose,
}: Props) {
  const applyDiscount = useBillingStore((s) => s.applyDiscount);
  const removeDiscount = useBillingStore((s) => s.removeDiscount);

  const [type, setType] = useState<"preset" | "percentage" | "amount">(
    "preset",
  );
  const [customValue, setCustomValue] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<any>(null);

  const { data: presets = [] } = useQuery({
    queryKey: ["discount-presets"],
    queryFn: billService.getDiscountPresets,
  });

  const gross = unitPrice * quantity;

  const getPreviewAmount = () => {
    if (type === "preset" && selectedPreset) {
      return selectedPreset.type === "percentage"
        ? (gross * selectedPreset.value) / 100
        : selectedPreset.value;
    }
    if (type === "percentage" && customValue) {
      return (gross * parseFloat(customValue)) / 100;
    }
    if (type === "amount" && customValue) {
      return parseFloat(customValue);
    }
    return 0;
  };

  const handleApply = () => {
    const amount = getPreviewAmount();
    if (amount <= 0) return;

    if (type === "preset" && selectedPreset) {
      applyDiscount(itemId, {
        type: "preset",
        value: selectedPreset.value,
        presetId: selectedPreset.id,
        label: selectedPreset.label,
        amount,
      });
    } else if (type === "percentage") {
      applyDiscount(itemId, {
        type: "percentage",
        value: parseFloat(customValue),
        label: `${customValue}% Off`,
        amount,
      });
    } else {
      applyDiscount(itemId, {
        type: "amount",
        value: parseFloat(customValue),
        label: `Rs. ${customValue} Off`,
        amount,
      });
    }
    onClose();
  };

  const handleRemove = () => {
    removeDiscount(itemId);
    onClose();
  };

  const previewAmount = getPreviewAmount();

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "12px",
        backgroundColor: "white",
        borderRadius: "10px",
        border: "1px solid rgba(238,45,124,0.15)",
      }}
    >
      {/* Type selector */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        {(["preset", "percentage", "amount"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setCustomValue("");
              setSelectedPreset(null);
            }}
            style={{
              flex: 1,
              padding: "5px",
              borderRadius: "7px",
              border: "none",
              backgroundColor: type === t ? "#EE2D7C" : "rgba(238,45,124,0.08)",
              color: type === t ? "white" : "rgba(9,9,9,0.55)",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t === "preset"
              ? "Preset"
              : t === "percentage"
                ? "% Off"
                : "Rs. Off"}
          </button>
        ))}
      </div>

      {/* Preset list */}
      {type === "preset" && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "10px",
          }}
        >
          {presets.map((p: any) => (
            <button
              key={p.id}
              onClick={() => setSelectedPreset(p)}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border:
                  selectedPreset?.id === p.id
                    ? "2px solid #EE2D7C"
                    : "1px solid rgba(238,45,124,0.20)",
                backgroundColor:
                  selectedPreset?.id === p.id
                    ? "rgba(238,45,124,0.08)"
                    : "transparent",
                color: "#EE2D7C",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Custom input */}
      {(type === "percentage" || type === "amount") && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(238,45,124,0.04)",
            border: "1px solid rgba(238,45,124,0.15)",
            borderRadius: "8px",
            padding: "0 12px",
            height: "40px",
            marginBottom: "10px",
          }}
        >
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={type === "percentage" ? "Enter %" : "Enter amount"}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "13px",
              color: "#090909",
              fontFamily: "Inter, sans-serif",
              backgroundColor: "transparent",
            }}
            autoFocus
          />
          <span
            style={{
              fontSize: "13px",
              color: "rgba(9,9,9,0.40)",
              fontWeight: 500,
            }}
          >
            {type === "percentage" ? "%" : "Rs."}
          </span>
        </div>
      )}

      {/* Preview */}
      {previewAmount > 0 && (
        <p
          style={{
            fontSize: "12px",
            color: "#EE2D7C",
            margin: "0 0 10px",
            fontWeight: 500,
          }}
        >
          Discount: Rs. {previewAmount.toFixed(2)} off → New total: Rs.{" "}
          {(gross - previewAmount).toFixed(2)}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleApply}
          disabled={previewAmount <= 0}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            backgroundColor:
              previewAmount > 0 ? "#EE2D7C" : "rgba(238,45,124,0.30)",
            color: "white",
            fontSize: "12px",
            fontWeight: 600,
            cursor: previewAmount > 0 ? "pointer" : "not-allowed",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Apply
        </button>
        <button
          onClick={handleRemove}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(239,68,68,0.30)",
            backgroundColor: "transparent",
            color: "#ef4444",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Remove
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(9,9,9,0.12)",
            backgroundColor: "transparent",
            color: "rgba(9,9,9,0.45)",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
