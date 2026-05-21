export interface ReceiptLayoutConfig {
  pageWidthMm: number;
  pagePaddingMm: number;
  fontSize: number;
  headerTitle: string;
  headerSubtitle: string;
  headerMeta: string;
  footerText: string;
  showShopAddress: boolean;
  showShopPhone: boolean;
  showShopEmail: boolean;
  showCustomer: boolean;
  showCashier: boolean;
  showBillType: boolean;
  showStatus: boolean;
  showOrderDates: boolean;
  showAdvancePayment: boolean;
  showDiscountColumn: boolean;
  showTaxRow: boolean;
  showLoyaltyUsed: boolean;
  showPaymentDetails: boolean;
  showSavings: boolean;
  showCoinsEarned: boolean;
  showNote: boolean;
}

export const defaultReceiptLayoutConfig: ReceiptLayoutConfig = {
  pageWidthMm: 80,
  pagePaddingMm: 6,
  fontSize: 10,
  headerTitle: "",
  headerSubtitle: "",
  headerMeta: "",
  footerText: "",
  showShopAddress: true,
  showShopPhone: true,
  showShopEmail: false,
  showCustomer: true,
  showCashier: true,
  showBillType: true,
  showStatus: false,
  showOrderDates: true,
  showAdvancePayment: true,
  showDiscountColumn: false,
  showTaxRow: false,
  showLoyaltyUsed: true,
  showPaymentDetails: true,
  showSavings: false,
  showCoinsEarned: true,
  showNote: true,
};

interface BuildLayoutOptions {
  autoPrint?: boolean;
}

function toNumber(value: unknown, fallback: number, min?: number, max?: number) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  if (typeof min === "number" && num < min) return min;
  if (typeof max === "number" && num > max) return max;
  return num;
}

function toBool(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function toText(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  return fallback;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value?: string | Date) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function formatShortDate(value?: string | Date) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function formatCurrency(value: number, symbol: string) {
  return `${symbol} ${value.toFixed(2)}`;
}

export function resolveReceiptLayoutConfig(shopSettings: any): ReceiptLayoutConfig {
  const raw = shopSettings?.receiptLayout || {};
  return {
    pageWidthMm: toNumber(raw.pageWidthMm, defaultReceiptLayoutConfig.pageWidthMm, 58, 120),
    pagePaddingMm: toNumber(raw.pagePaddingMm, defaultReceiptLayoutConfig.pagePaddingMm, 2, 16),
    fontSize: toNumber(raw.fontSize, defaultReceiptLayoutConfig.fontSize, 8, 14),
    headerTitle: toText(raw.headerTitle, defaultReceiptLayoutConfig.headerTitle),
    headerSubtitle: toText(raw.headerSubtitle, defaultReceiptLayoutConfig.headerSubtitle),
    headerMeta: toText(raw.headerMeta, defaultReceiptLayoutConfig.headerMeta),
    footerText: toText(raw.footerText, defaultReceiptLayoutConfig.footerText),
    showShopAddress: toBool(raw.showShopAddress, defaultReceiptLayoutConfig.showShopAddress),
    showShopPhone: toBool(raw.showShopPhone, defaultReceiptLayoutConfig.showShopPhone),
    showShopEmail: toBool(raw.showShopEmail, defaultReceiptLayoutConfig.showShopEmail),
    showCustomer: toBool(raw.showCustomer, defaultReceiptLayoutConfig.showCustomer),
    showCashier: toBool(raw.showCashier, defaultReceiptLayoutConfig.showCashier),
    showBillType: toBool(raw.showBillType, defaultReceiptLayoutConfig.showBillType),
    showStatus: toBool(raw.showStatus, defaultReceiptLayoutConfig.showStatus),
    showOrderDates: toBool(raw.showOrderDates, defaultReceiptLayoutConfig.showOrderDates),
    showAdvancePayment: toBool(raw.showAdvancePayment, defaultReceiptLayoutConfig.showAdvancePayment),
    showDiscountColumn: toBool(raw.showDiscountColumn, defaultReceiptLayoutConfig.showDiscountColumn),
    showTaxRow: toBool(raw.showTaxRow, defaultReceiptLayoutConfig.showTaxRow),
    showLoyaltyUsed: toBool(raw.showLoyaltyUsed, defaultReceiptLayoutConfig.showLoyaltyUsed),
    showPaymentDetails: toBool(raw.showPaymentDetails, defaultReceiptLayoutConfig.showPaymentDetails),
    showSavings: toBool(raw.showSavings, defaultReceiptLayoutConfig.showSavings),
    showCoinsEarned: toBool(raw.showCoinsEarned, defaultReceiptLayoutConfig.showCoinsEarned),
    showNote: toBool(raw.showNote, defaultReceiptLayoutConfig.showNote),
  };
}

export function buildReceiptPrintHtml(
  bill: any,
  customer: any,
  coinsEarned: number,
  shopSettings: any,
  options?: BuildLayoutOptions,
) {
  const layout = resolveReceiptLayoutConfig(shopSettings);
  const currencySymbol = shopSettings?.currencySymbol || "Rs.";
  const shopName = layout.headerTitle || shopSettings?.shopName || "Pinklet POS";
  const subtitle = layout.headerSubtitle || "";
  const footerText = layout.footerText || shopSettings?.receiptFooter || "";
  const developerText = shopSettings?.developerText || shopSettings?.developerContact || "Software by Pinklet Dev Team — contact: support@pinklet.dev";
  const lines = Array.isArray(bill?.lines) ? bill.lines : [];
  const isPreOrder = bill?.type === "pre_order" || bill?.status === "pending";

  const contactRows = [
    layout.showShopPhone && shopSettings?.shopPhone ? `<div>${escapeHtml(shopSettings.shopPhone)}</div>` : "",
    layout.showShopAddress && shopSettings?.shopAddress ? `<div>${escapeHtml(shopSettings.shopAddress)}</div>` : "",
    layout.showShopEmail && shopSettings?.shopEmail ? `<div>${escapeHtml(shopSettings.shopEmail)}</div>` : "",
    layout.headerMeta ? `<div>${escapeHtml(layout.headerMeta)}</div>` : "",
  ]
    .filter(Boolean)
    .join("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function unitPriceAfterDiscount(line: any) {
    const qty = Number(line.quantity || 1);
    const discount = Number(line.discountAmount || 0);
    const unit = Number(line.unitPrice || line.item?.price || 0);
    const perUnitDiscount = qty > 0 ? discount / qty : 0;
    return Math.max(0, unit - perUnitDiscount);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const lineItems = lines
    .map((line: any, i: number) => {
      const idx = i + 1;
      const sku = line?.item?.sku || line?.item?.code || "";
      const name = line?.item?.name || "Item";
      const qty = Number(line?.quantity || 0);
      const unit = Number(line?.unitPrice ?? line?.item?.price ?? 0);
      const discountTotal = Number(line?.discountAmount || 0);
      const special = unitPriceAfterDiscount(line);
      const subtotal = Number(line?.lineTotal ?? Math.max(0, qty * unit - discountTotal));

      return `
        <div class="item-row">
          <div class="item-first-line">
            <div class="col no">${escapeHtml(String(idx))}</div>
            <div class="col list">${escapeHtml(sku)}</div>
            <div class="col name">${escapeHtml(name)}</div>
            <div class="col qty">${escapeHtml(String(qty))}</div>
          </div>
          <div class="item-second-line">
            <div class="col selling">${escapeHtml(formatCurrency(unit, currencySymbol))}</div>
            <div class="col special">${escapeHtml(formatCurrency(special, currencySymbol))}</div>
            <div class="col discounts">${discountTotal > 0 ? `- ${escapeHtml(formatCurrency(discountTotal, currencySymbol))}` : '-'}</div>
            <div class="col subtotal">${escapeHtml(formatCurrency(subtotal, currencySymbol))}</div>
          </div>
        </div>
      `;
    })
    .join("");

  const preOrderRows =
    isPreOrder && layout.showOrderDates
      ? `
      <section class="card">
        <div class="section-title">Pre-order Details</div>
        <div class="kv"><span>Order Date</span><strong>${escapeHtml(formatShortDate(bill?.orderDate || bill?.createdAt))}</strong></div>
        <div class="kv"><span>Required Date</span><strong>${escapeHtml(formatShortDate(bill?.deliveryDate))}</strong></div>
        ${layout.showAdvancePayment && bill?.advancePayment > 0 ? `<div class="kv"><span>Advance Paid</span><strong>${escapeHtml(formatCurrency(bill.advancePayment, currencySymbol))}</strong></div>` : ""}
        ${layout.showAdvancePayment && bill?.advancePayment > 0 ? `<div class="kv"><span>Balance Due</span><strong>${escapeHtml(formatCurrency(Math.max(0, (bill?.total || 0) - (bill?.advancePayment || 0)), currencySymbol))}</strong></div>` : ""}
      </section>
    `
      : "";

  const totalDiscount = Number(bill?.discountAmount || 0);
  const amountReceived = Number(bill?.amountReceived || 0);
  const total = Number(bill?.total || 0);
  const balance = Math.max(0, total - amountReceived);

  const summaryRows = [
    `<div class="summary-row"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(bill?.subtotal || 0, currencySymbol))}</strong></div>`,
    totalDiscount > 0 ? `<div class="summary-row danger"><span>Total Discount</span><strong>- ${escapeHtml(formatCurrency(totalDiscount, currencySymbol))}</strong></div>` : "",
    coinsEarned > 0 ? `<div class="summary-row"><span>Loyalty Earns</span><strong>${escapeHtml(String(coinsEarned))} coin${coinsEarned === 1 ? '' : 's'}</strong></div>` : "",
    layout.showTaxRow ? `<div class="summary-row"><span>${escapeHtml(shopSettings?.taxName || 'Tax')}</span><strong>${escapeHtml(formatCurrency(bill?.tax || 0, currencySymbol))}</strong></div>` : "",
  ].filter(Boolean).join("");

  const paymentRows = layout.showPaymentDetails
    ? [
        `<div class="summary-row"><span>Amount Received</span><strong>${escapeHtml(formatCurrency(amountReceived || 0, currencySymbol))}</strong></div>`,
        `<div class="summary-row"><span>Balance</span><strong>${escapeHtml(formatCurrency(balance, currencySymbol))}</strong></div>`,
      ].filter(Boolean).join("")
    : "";

  const infoRows = [
    `<div class="kv"><span>Bill No</span><strong>${escapeHtml(bill?.billNumber || "-")}</strong></div>`,
    `<div class="kv"><span>Date</span><strong>${escapeHtml(formatDate(bill?.createdAt))}</strong></div>`,
    layout.showCashier ? `<div class="kv"><span>Cashier</span><strong>${escapeHtml(bill?.cashier?.name || "-")}</strong></div>` : "",
    layout.showCustomer ? `<div class="kv"><span>Customer</span><strong>${escapeHtml(customer?.name || "Walk-in")}</strong></div>` : "",
    layout.showBillType ? `<div class="kv"><span>Type</span><strong>${escapeHtml(String(bill?.type || "sale").replace(/_/g, " "))}</strong></div>` : "",
    layout.showStatus ? `<div class="kv"><span>Status</span><strong>${escapeHtml(String(bill?.status || "completed").replace(/_/g, " "))}</strong></div>` : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(shopName)} Receipt</title>
        <style>
          @page {
            size: ${layout.pageWidthMm}mm auto;
            margin: 0;
          }

          :root {
            --ink: #111111;
            --muted: #6b7280;
            --brand: #ee2d7c;
            --line: #e5e7eb;
            --soft: #fafafa;
            --accent: #fff1f6;
            --font-size: ${layout.fontSize}px;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: var(--ink);
            font-family: Arial, Helvetica, sans-serif;
            font-size: var(--font-size);
          }

          body {
            padding: ${layout.pagePaddingMm}mm;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .receipt {
            width: ${Math.max(40, layout.pageWidthMm - layout.pagePaddingMm * 2)}mm;
            margin: 0 auto;
          }

          .brand {
            text-align: center;
            margin-bottom: 4mm;
          }

          .brand h1 {
            margin: 0;
            font-size: calc(var(--font-size) + 4px);
            line-height: 1.1;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            color: #000;
          }

          .brand p {
            margin: 2px 0 0;
            font-size: calc(var(--font-size) - 1px);
            color: var(--muted);
          }

          .brand-meta {
            margin-top: 6px;
            font-size: calc(var(--font-size) - 1px);
            color: var(--muted);
            line-height: 1.4;
          }

          .card {
            border: 1px solid var(--line);
            border-radius: 0;
            padding: 8px;
            margin-bottom: 8px;
            background: #fff;
          }

          .section-title {
            margin-bottom: 8px;
            font-size: calc(var(--font-size) - 1px);
            font-weight: 800;
            color: #000;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }

          .kv {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            font-size: var(--font-size);
            line-height: 1.35;
            margin-bottom: 6px;
          }

          .kv:last-child {
            margin-bottom: 0;
          }

          .kv span {
            color: var(--muted);
            white-space: nowrap;
          }

          .kv strong {
            color: var(--ink);
            text-align: right;
            font-weight: 700;
            overflow-wrap: anywhere;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          thead th {
            font-size: calc(var(--font-size) - 1px);
            color: var(--muted);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 0 0 6px;
            border-bottom: 1px solid var(--line);
          }

          tbody td {
            padding: 10px 0;
            vertical-align: top;
            border-bottom: 1px solid #f1f5f9;
            font-size: var(--font-size);
          }

          .no-cell {
            width: 6%;
            text-align: left;
            color: var(--muted);
            font-weight: 700;
            white-space: nowrap;
            padding-right: 8px;
          }

          .item-cell {
            width: ${layout.showDiscountColumn ? "46%" : "56%"};
            padding-right: 8px;
          }

          .qty-cell,
          .price-cell,
          .discount-cell,
          .total-cell {
            text-align: right;
            white-space: nowrap;
          }

          .qty-cell {
            width: 10%;
          }

          .price-cell {
            width: 12%;
          }

          .discount-cell {
            width: 12%;
            color: #111111;
            font-weight: 700;
          }

          .total-cell {
            width: 14%;
            font-weight: 800;
          }

          .item-name {
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 2px;
            word-break: break-word;
          }

          .item-meta {
            color: var(--muted);
            font-size: calc(var(--font-size) - 1px);
            line-height: 1.3;
          }

          .item-discount {
            margin-top: 3px;
            font-size: calc(var(--font-size) - 1px);
            color: #dc2626;
            font-weight: 700;
          }

          .muted {
            color: #9ca3af;
          }

          .summary {
            background: #fff;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            font-size: var(--font-size);
            margin-bottom: 6px;
          }

          .summary-row:last-child {
            margin-bottom: 0;
          }

          .summary-row span {
            color: var(--muted);
          }

          .summary-row strong {
            color: var(--ink);
            text-align: right;
          }

          .total-box {
            margin-top: 10px;
            padding: 8px 0 0;
            border-top: 1px dashed #111111;
            color: #111111;
          }

          .total-box .summary-row {
            margin-bottom: 0;
          }

          .simple-note {
            margin-top: 8px;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            font-size: calc(var(--font-size) - 1px);
            color: #111111;
          }

          .footer {
            margin-top: 12px;
            text-align: center;
            font-size: calc(var(--font-size) - 1px);
            color: var(--muted);
          }

          .footer .note {
            margin-top: 4px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }

        </style>
      </head>
      <body>
        <main class="receipt receipt-root">
          <div class="brand">
            <h1>${escapeHtml(shopName)}</h1>
            ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
            ${contactRows ? `<div class="brand-meta">${contactRows}</div>` : ""}
          </div>

          <section class="card">
            <div class="section-title">Bill Details</div>
            ${infoRows}
          </section>

          ${preOrderRows}

          <section class="card">
            <div class="section-title">Items</div>
            <div class="items">
              ${lineItems || `<div class="item-meta">No items</div>`}
            </div>
          </section>

          <section class="card summary">
            <div class="section-title">Summary</div>
            ${summaryRows}
              <div class="total-box">
                <div class="summary-row"><span>Total</span><strong>${escapeHtml(formatCurrency(total || 0, currencySymbol))}</strong></div>
              </div>
              ${paymentRows}
              ${layout.showCoinsEarned && coinsEarned > 0 ? `<div class="simple-note">Loyalty coins earned: <strong>${escapeHtml(coinsEarned)} coin${coinsEarned === 1 ? "" : "s"}</strong></div>` : ""}
              <div class="simple-note" style="margin-top:8px; font-weight:700; text-align:center;">Come again!</div>
          </section>

          <div class="footer">
            ${footerText ? `<div>${escapeHtml(footerText)}</div>` : ""}
            ${layout.showNote && bill?.note ? `<div class="note">Note: ${escapeHtml(bill.note)}</div>` : ""}
            ${developerText ? `<div style="margin-top:8px; font-size:calc(var(--font-size)-1px); color:var(--muted);">${escapeHtml(developerText)}</div>` : ""}
          </div>
        </main>

        ${options?.autoPrint === false ? "" : `<script>window.addEventListener('load',()=>{setTimeout(()=>{window.print();setTimeout(()=>window.close(),500);},250);});</script>`}
      </body>
    </html>
  `;
}

export function openReceiptPrintWindow(html: string, pageWidthMm = 80) {
  const popupWidth = Math.max(420, Math.round(pageWidthMm * 4.2));
  const printWindow = window.open(
    "",
    "_blank",
    `noopener,noreferrer,width=${popupWidth},height=820`,
  );

  if (!printWindow) {
    alert("Popup blocked. Please allow popups to print the bill.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
