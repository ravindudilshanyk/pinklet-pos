import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

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
  display: "block",
};

export default function SupplierModal({ onClose, onSaved }: Props) {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: suppliers = [], refetch } = useQuery({
    queryKey: ["suppliers"],
    queryFn: itemsService.getSuppliers,
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openAdd = () => {
    setEditingSupplier(null);
    setForm({ name: "", phone: "", email: "", address: "", notes: "" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Supplier name is required");
    try {
      setLoading(true);
      if (editingSupplier) {
        await itemsService.updateSupplier(editingSupplier.id, form);
      } else {
        await itemsService.createSupplier(form);
      }
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      refetch();
      setShowForm(false);
      onSaved();
    } catch {
      setError("Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this supplier?")) return;
    await itemsService.deleteSupplier(id);
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    refetch();
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
              🏭 Suppliers
            </h3>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "12px",
                color: "rgba(9,9,9,0.45)",
              }}
            >
              Manage your product suppliers
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {!showForm && (
              <button
                onClick={openAdd}
                style={{
                  padding: "8px 16px",
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
                + Add Supplier
              </button>
            )}
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
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {/* Add/Edit form */}
          {showForm && (
            <div
              style={{
                backgroundColor: "rgba(238,45,124,0.03)",
                border: "1px solid rgba(238,45,124,0.12)",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#090909",
                }}
              >
                {editingSupplier ? "Edit Supplier" : "New Supplier"}
              </p>

              <label style={labelStyle}>Supplier Name *</label>
              <div style={inputRow}>
                <div style={inputInner}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Fresh Bake Supplies"
                    style={inputStyle}
                    autoFocus
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Phone</label>
                  <div style={inputRow}>
                    <div style={inputInner}>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="077 123 4567"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Email</label>
                  <div style={inputRow}>
                    <div style={inputInner}>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="supplier@email.com"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <label style={labelStyle}>Address</label>
              <div style={inputRow}>
                <div style={inputInner}>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Street, City"
                    style={inputStyle}
                  />
                </div>
              </div>

              <label style={labelStyle}>Notes</label>
              <div style={{ ...inputRow, height: "auto", minHeight: "50px" }}>
                <div
                  style={{
                    ...inputInner,
                    alignItems: "flex-start",
                    padding: "12px 16px",
                  }}
                >
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Any additional notes..."
                    rows={2}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                  />
                </div>
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    color: "#dc2626",
                    fontSize: "13px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid rgba(9,9,9,0.12)",
                    backgroundColor: "transparent",
                    color: "rgba(9,9,9,0.55)",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: "10px",
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
                  {loading
                    ? "Saving..."
                    : editingSupplier
                      ? "Save Changes"
                      : "Add Supplier"}
                </button>
              </div>
            </div>
          )}

          {/* Suppliers list */}
          {suppliers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "rgba(9,9,9,0.35)",
                padding: "40px 0",
              }}
            >
              <p style={{ fontSize: "14px" }}>No suppliers yet</p>
              <p style={{ fontSize: "12px", marginTop: "4px" }}>
                Add your first supplier above
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {suppliers.map((s: any) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(9,9,9,0.07)",
                    backgroundColor: "white",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(238,45,124,0.10)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#EE2D7C",
                      flexShrink: 0,
                    }}
                  >
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#090909",
                      }}
                    >
                      {s.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "rgba(9,9,9,0.45)",
                      }}
                    >
                      {[s.phone, s.email].filter(Boolean).join(" · ") ||
                        "No contact info"}
                    </p>
                    {s.address && (
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "11px",
                          color: "rgba(9,9,9,0.35)",
                        }}
                      >
                        {s.address}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      onClick={() => openEdit(s)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(238,45,124,0.20)",
                        backgroundColor: "rgba(238,45,124,0.06)",
                        color: "#EE2D7C",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "1px solid rgba(239,68,68,0.20)",
                        backgroundColor: "rgba(239,68,68,0.06)",
                        color: "#ef4444",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
