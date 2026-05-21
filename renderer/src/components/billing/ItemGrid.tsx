import ItemCard from "./ItemCard";

interface Props {
  items: any[];
  loading: boolean;
  selectedItemIndex?: number;
  onItemHover?: (index: number) => void;
  onItemSelect?: (item: any) => void;
}

export default function ItemGrid({ items, loading, selectedItemIndex = -1, onItemHover, onItemSelect }: Props) {
  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "200px",
              borderRadius: "14px",
              backgroundColor: "rgba(238,45,124,0.05)",
              animation: "pulse 1.5s infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
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
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p style={{ marginTop: "12px", fontSize: "14px" }}>No items found</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "12px",
      }}
    >
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          selected={items.indexOf(item) === selectedItemIndex}
          onSelect={() => onItemSelect?.(item)}
        />
      ))}
    </div>
  );
}
