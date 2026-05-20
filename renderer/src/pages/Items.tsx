import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";
import ItemFormModal from "@/components/inventory/ItemFormModal";
import StockUpModal from "@/components/inventory/StockUpModal";
import WasteModal from "@/components/inventory/WasteModal";
import WasteLogModal from '@/components/inventory/WasteLogModal'

type FilterType = "all" | "low_stock" | "out_of_stock";

interface Item {
  id: string;
  name: string;
  barcode?: string;
  categoryId?: string;
  category?: { name: string };
  supplierId?: string;
  supplier?: { name: string };
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockAlert: number;
  imageUrl?: string;
  marketPrice?: number;
  initialDiscount?: number;
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function Items() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [stockUpItem, setStockUpItem] = useState<Item | null>(null);
  const [wasteItem, setWasteItem] = useState<Item | null>(null);
  const [showWaste, setShowWaste] = useState(false)

  const { data: items = [], isLoading } = useQuery({
    queryKey: [
      "items-management",
      search,
      selectedCategory,
      selectedSupplier,
      filter,
    ],
    queryFn: () =>
      itemsService.getItems({
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        supplierId: selectedSupplier || undefined,
        filter: filter === "all" ? undefined : filter,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: itemsService.getCategories,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: itemsService.getSuppliers,
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this item?")) return;
    await itemsService.deleteItem(id);
    queryClient.invalidateQueries({ queryKey: ["items-management"] });
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["items-management"] });
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const lowStockCount = items.filter(
    (i: Item) => i.stock <= i.lowStockAlert && i.stock > 0,
  ).length;
  const outOfStockCount = items.filter((i: Item) => i.stock === 0).length;

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 700,
              color: "#090909",
            }}
          >
            Items
          </h1>
          <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
            <span style={{ fontSize: "13px", color: "rgba(9,9,9,0.45)" }}>
              {items.length} total
            </span>
            {lowStockCount > 0 && (
              <span
                style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 500 }}
              >
                ⚠ {lowStockCount} low stock
              </span>
            )}
            {outOfStockCount > 0 && (
              <span
                style={{ fontSize: "13px", color: "#ef4444", fontWeight: 500 }}
              >
                🔴 {outOfStockCount} out of stock
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddItem(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#EE2D7C",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Item
        </button>

        <button
          onClick={() => setShowWaste(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '12px',
            border: '1px solid rgba(239,68,68,0.25)',
            backgroundColor: 'rgba(239,68,68,0.06)',
            color: '#ef4444', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          🗑 Log Waste
        </button>
      </div>

      {/* Filter bar */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "14px",
          border: "1px solid rgba(9,9,9,0.06)",
          padding: "14px 16px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(238,45,124,0.04)",
            border: "1px solid rgba(238,45,124,0.15)",
            borderRadius: "10px",
            padding: "0 14px",
            height: "38px",
            flex: 1,
            minWidth: "180px",
          }}
        >
          <svg
            width="14"
            height="14"
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
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or barcode..."
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
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(9,9,9,0.35)",
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            height: "38px",
            padding: "0 12px",
            borderRadius: "10px",
            border: "1px solid rgba(238,45,124,0.15)",
            backgroundColor: selectedCategory
              ? "rgba(238,45,124,0.06)"
              : "white",
            fontSize: "13px",
            color: selectedCategory ? "#EE2D7C" : "rgba(9,9,9,0.60)",
            fontFamily: "Inter, sans-serif",
            outline: "none",
            cursor: "pointer",
            fontWeight: selectedCategory ? 600 : 400,
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c: Category) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Supplier */}
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          style={{
            height: "38px",
            padding: "0 12px",
            borderRadius: "10px",
            border: "1px solid rgba(238,45,124,0.15)",
            backgroundColor: selectedSupplier
              ? "rgba(238,45,124,0.06)"
              : "white",
            fontSize: "13px",
            color: selectedSupplier ? "#EE2D7C" : "rgba(9,9,9,0.60)",
            fontFamily: "Inter, sans-serif",
            outline: "none",
            cursor: "pointer",
            fontWeight: selectedSupplier ? 600 : 400,
          }}
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s: Supplier) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Stock filter */}
        <div
          style={{
            display: "flex",
            backgroundColor: "rgba(9,9,9,0.04)",
            borderRadius: "10px",
            padding: "3px",
          }}
        >
          {(
            [
              { key: "all", label: "All" },
              { key: "low_stock", label: "⚠ Low Stock" },
              { key: "out_of_stock", label: "🔴 Out of Stock" },
            ] as { key: FilterType; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "5px 12px",
                borderRadius: "7px",
                border: "none",
                backgroundColor: filter === key ? "white" : "transparent",
                color:
                  filter === key
                    ? key === "out_of_stock"
                      ? "#ef4444"
                      : key === "low_stock"
                        ? "#f59e0b"
                        : "#EE2D7C"
                    : "rgba(9,9,9,0.45)",
                fontSize: "12px",
                fontWeight: filter === key ? 600 : 500,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow:
                  filter === key ? "0 1px 4px rgba(9,9,9,0.10)" : "none",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {(search ||
          selectedCategory ||
          selectedSupplier ||
          filter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setSelectedSupplier("");
                setFilter("all");
              }}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(9,9,9,0.12)",
                backgroundColor: "transparent",
                color: "rgba(9,9,9,0.45)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Clear filters
            </button>
          )}
      </div>

      {/* Table */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "white",
          borderRadius: "14px",
          border: "1px solid rgba(9,9,9,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 120px",
            gap: "0",
            padding: "12px 20px",
            backgroundColor: "rgba(238,45,124,0.04)",
            borderBottom: "1px solid rgba(9,9,9,0.06)",
          }}
        >
          {[
            "Item",
            "Category",
            "Supplier",
            "Stock",
            "Cost",
            "Price / Profit",
            "Actions",
          ].map((col) => (
            <span
              key={col}
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(9,9,9,0.40)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "rgba(9,9,9,0.35)",
            }}
          >
            Loading items...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: "rgba(9,9,9,0.35)",
            }}
          >
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              style={{ margin: "0 auto 12px", display: "block" }}
            >
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p
              style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 500 }}
            >
              No items found
            </p>
            <button
              onClick={() => setShowAddItem(true)}
              style={{
                padding: "9px 20px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#EE2D7C",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              + Add First Item
            </button>
          </div>
        ) : (
          <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 320px)" }}>
            {items.map((item: Item, index: number) => (
              <ItemTableRow
                key={item.id}
                item={item}
                isLast={index === items.length - 1}
                onEdit={() => {
                  setEditingItem(item);
                  setShowAddItem(true);
                }}
                onDelete={() => handleDelete(item.id)}
                onStockUp={() => setStockUpItem(item)}
                onWaste={() => setWasteItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddItem && (
        <ItemFormModal
          item={editingItem}
          onClose={() => {
            setShowAddItem(false);
            setEditingItem(null);
          }}
          onSaved={refresh}
        />
      )}
      {stockUpItem && (
        <StockUpModal
          item={stockUpItem}
          onClose={() => setStockUpItem(null)}
          onSaved={refresh}
        />
      )}
      {wasteItem && (
        <WasteModal
          item={wasteItem}
          onClose={() => setWasteItem(null)}
          onSaved={refresh}
        />
      )}
      {showWaste && (
        <WasteLogModal onClose={() => { setShowWaste(false); refresh() }} />
      )}
    </div>
  );
}

// ── Table Row ─────────────────────────────────────────────
function ItemTableRow({
  item,
  isLast,
  onEdit,
  onDelete,
  onStockUp,
  onWaste,
}: {
  item: Item;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStockUp: () => void;
  onWaste: () => void;
}) {
  const isLowStock = item.stock <= item.lowStockAlert && item.stock > 0;
  const isOutOfStock = item.stock === 0;
  const profit = item.sellingPrice - item.buyingPrice;
  const margin =
    item.sellingPrice > 0 ? ((profit / item.sellingPrice) * 100).toFixed(0) : 0;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 120px",
        gap: "0",
        padding: "14px 20px",
        borderBottom: isLast ? "none" : "1px solid rgba(9,9,9,0.04)",
        backgroundColor: hovered ? "rgba(238,45,124,0.02)" : "transparent",
        transition: "background-color 0.15s",
        alignItems: "center",
      }}
    >
      {/* Item name + barcode */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            flexShrink: 0,
            backgroundColor: "rgba(238,45,124,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
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
              width="18"
              height="18"
              fill="none"
              stroke="rgba(238,45,124,0.40)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 600,
              color: "#090909",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "11px",
              color: "rgba(9,9,9,0.40)",
            }}
          >
            {item.barcode || "—"}
          </p>
        </div>
      </div>

      {/* Category */}
      <div>
        {item.category ? (
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: "20px",
              backgroundColor: "rgba(59,59,152,0.08)",
              color: "rgb(59,59,152)",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {item.category.name}
          </span>
        ) : (
          <span style={{ fontSize: "12px", color: "rgba(9,9,9,0.30)" }}>—</span>
        )}
      </div>

      {/* Supplier */}
      <div>
        {item.supplier ? (
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "rgba(9,9,9,0.60)",
              fontWeight: 500,
            }}
          >
            🏭 {item.supplier.name}
          </p>
        ) : (
          <span style={{ fontSize: "12px", color: "rgba(9,9,9,0.30)" }}>—</span>
        )}
      </div>

      {/* Stock */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: isOutOfStock
                ? "#ef4444"
                : isLowStock
                  ? "#f59e0b"
                  : "#090909",
            }}
          >
            {item.stock}
          </span>
          {isOutOfStock && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#ef4444",
                backgroundColor: "rgba(239,68,68,0.10)",
                padding: "2px 6px",
                borderRadius: "99px",
              }}
            >
              Out
            </span>
          )}
          {isLowStock && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#f59e0b",
                backgroundColor: "rgba(245,158,11,0.10)",
                padding: "2px 6px",
                borderRadius: "99px",
              }}
            >
              Low
            </span>
          )}
        </div>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "10px",
            color: "rgba(9,9,9,0.35)",
          }}
        >
          Alert at {item.lowStockAlert}
        </p>
      </div>

      {/* Cost price */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 500,
            color: "rgba(9,9,9,0.60)",
          }}
        >
          Rs. {item.buyingPrice.toLocaleString()}
        </p>
      </div>

      {/* Selling price + profit */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 700,
            color: "#EE2D7C",
          }}
        >
          Rs. {item.sellingPrice.toLocaleString()}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "11px",
            color: "#22c55e",
            fontWeight: 500,
          }}
        >
          +Rs. {profit.toLocaleString()} ({margin}%)
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "5px", justifyContent: "flex-end" }}>
        {/* Stock up */}
        <button
          onClick={onStockUp}
          title="Stock Up"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            border: "1px solid rgba(34,197,94,0.25)",
            backgroundColor: "rgba(34,197,94,0.08)",
            color: "#16a34a",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        {/* Waste/Damage */}
        <button
          onClick={onWaste}
          title="Log waste/damage"
          style={{
            width: '30px', height: '30px', borderRadius: '8px',
            border: '1px solid rgba(245,158,11,0.25)',
            backgroundColor: 'rgba(245,158,11,0.08)',
            color: '#f59e0b', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </button>

        {/* Edit */}
        <button
          onClick={onEdit}
          title="Edit"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            border: "1px solid rgba(238,45,124,0.20)",
            backgroundColor: "rgba(238,45,124,0.06)",
            color: "#EE2D7C",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          title="Deactivate"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            border: "1px solid rgba(239,68,68,0.20)",
            backgroundColor: "rgba(239,68,68,0.06)",
            color: "#ef4444",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
