import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBillingStore } from "@/stores/billingStore";
import { billService } from "@/services/billing.service";
import ItemGrid from "@/components/billing/ItemGrid";
import BillPanel from "@/components/billing/BillPanel";
import CustomItemModal from "@/components/billing/CustomItemModal";

export default function MakeBill() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [showCustomItem, setShowCustomItem] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: billService.getCategories,
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items", selectedCategory, search],
    queryFn: () => billService.getItems(selectedCategory, search || undefined),
    staleTime: 30000,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "F1") {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        height: "100%",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minWidth: 0,
        }}
      >
        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "white",
            border: "1px solid rgba(238,45,124,0.15)",
            borderRadius: "14px",
            padding: "0 16px",
            height: "48px",
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="rgba(9,9,9,0.35)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or barcode... (F1)"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "14px",
              color: "#090909",
              fontFamily: "Inter, sans-serif",
              backgroundColor: "transparent",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(9,9,9,0.35)",
                fontSize: "18px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
          <div
            style={{
              fontSize: "11px",
              color: "rgba(9,9,9,0.30)",
              backgroundColor: "rgba(9,9,9,0.05)",
              padding: "3px 8px",
              borderRadius: "6px",
              fontWeight: 500,
            }}
          >
            F1
          </div>
        </div>

        {/* Category filter + Custom Item button */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "4px",
              flex: 1,
            }}
          >
            <CategoryBtn
              label="All"
              active={!selectedCategory}
              onClick={() => setSelectedCategory(undefined)}
            />
            {categories.map((cat: any) => (
              <CategoryBtn
                key={cat.id}
                label={cat.name}
                active={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>

          {/* Custom Item button */}
          <button
            onClick={() => setShowCustomItem(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "20px",
              border: "1px solid rgba(238,45,124,0.30)",
              backgroundColor: "white",
              color: "#EE2D7C",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            🎂 Custom Item
          </button>
        </div>

        {/* Item grid */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <ItemGrid items={items} loading={isLoading} />
        </div>
      </div>

      {/* Right panel — bill */}
      <div
        style={{
          width: "340px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BillPanel />
      </div>

      {/* Custom Item Modal */}
      {showCustomItem && (
        <CustomItemModal onClose={() => setShowCustomItem(false)} />
      )}
    </div>
  );
}

function CategoryBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 16px",
        borderRadius: "20px",
        border: active ? "none" : "1px solid rgba(238,45,124,0.20)",
        backgroundColor: active ? "#EE2D7C" : "white",
        color: active ? "white" : "rgba(9,9,9,0.60)",
        fontSize: "13px",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "Inter, sans-serif",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}
