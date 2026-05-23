import { jsPDF } from "jspdf";

interface ReceiptOptions {
  shopName?: string;
  shopPhone?: string;
  shopAddress?: string;
  footerText?: string;
}

const DEFAULT_OPTIONS: ReceiptOptions = {
  shopName: "Pinklet POS",
  shopPhone: "",
  shopAddress: "",
  footerText: "Thank you for shopping with us! 🎀",
};

function mmToPt(mm: number): number {
  return mm * 2.8346;
}

export function generateReceiptPDF(
  bill: any,
  customer: any,
  coinsEarned: number,
  options: ReceiptOptions = {},
): jsPDF {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 80mm receipt width
  const pageWidthMm = 80;
  const pageWidthPt = mmToPt(pageWidthMm);
  const marginPt = mmToPt(4);
  const contentWidthPt = pageWidthPt - marginPt * 2;

  // First pass — calculate height
  const estimatedHeight = estimateHeight(bill, coinsEarned);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageWidthPt, estimatedHeight],
  });

  let y = 14;

  // ── Helpers ──────────────────────────────────────────────
  const center = (text: string, yPos: number, size = 8, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("Courier", bold ? "bold" : "normal");
    doc.text(text, pageWidthPt / 2, yPos, { align: "center" });
  };

  const left = (text: string, yPos: number, size = 8, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("Courier", bold ? "bold" : "normal");
    doc.text(text, marginPt, yPos);
  };

  const right = (text: string, yPos: number, size = 8, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("Courier", bold ? "bold" : "normal");
    doc.text(text, pageWidthPt - marginPt, yPos, { align: "right" });
  };

  const leftRight = (
    leftText: string,
    rightText: string,
    yPos: number,
    size = 8,
    bold = false,
    rightColor?: [number, number, number],
  ) => {
    doc.setFontSize(size);
    doc.setFont("Courier", bold ? "bold" : "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(leftText, marginPt, yPos);
    if (rightColor) doc.setTextColor(...rightColor);
    doc.text(rightText, pageWidthPt - marginPt, yPos, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  const dashedLine = (yPos: number) => {
    doc.setDrawColor(160, 160, 160);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(marginPt, yPos, pageWidthPt - marginPt, yPos);
    doc.setLineDashPattern([], 0);
    doc.setDrawColor(0, 0, 0);
  };

  const solidLine = (yPos: number) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineDashPattern([], 0);
    doc.line(marginPt, yPos, pageWidthPt - marginPt, yPos);
  };

  const gap = (size: number) => {
    y += size;
  };

  // ── Header ────────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  center(opts.shopName || "Pinklet POS", y, 13, true);
  gap(12);

  if (opts.shopPhone) {
    doc.setTextColor(100, 100, 100);
    center(opts.shopPhone, y, 7.5);
    gap(9);
  }

  if (opts.shopAddress) {
    doc.setTextColor(100, 100, 100);
    const addressLines = doc.splitTextToSize(opts.shopAddress, contentWidthPt);
    addressLines.forEach((line: string) => {
      center(line, y, 7);
      gap(8);
    });
  }

  doc.setTextColor(0, 0, 0);
  solidLine(y);
  gap(7);

  // ── Bill info ─────────────────────────────────────────────
  doc.setFontSize(7.5);

  const infoRows: [string, string][] = [
    ["Bill #:", bill.billNumber],
    [
      "Date:",
      new Date(bill.createdAt).toLocaleString("en-LK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ],
    ["Cashier:", bill.cashier?.name || "—"],
  ];

  if (customer) infoRows.push(["Customer: ", customer.name]);
  if (bill.type === "pre_order") infoRows.push(["Type: ", "PRE-ORDER"]);
  if (bill.note) infoRows.push(["Note: ", bill.note]);

  infoRows.forEach(([label, value]) => {
    doc.setFont("Courier", "bold");
    doc.text(label, marginPt, y);
    doc.setFont("Courier", "normal");
    const maxWidth = contentWidthPt - 36;
    const valueLines = doc.splitTextToSize(value, maxWidth);
    doc.text(valueLines[0], marginPt + 36, y);
    gap(10);
  });

  dashedLine(y);
  gap(7);

  // ── Column headers ────────────────────────────────────────
  doc.setFont("Courier", "bold");
  doc.setFontSize(7);
  doc.text("ITEM", marginPt, y);
  doc.text("DISC", marginPt + contentWidthPt * 0.62, y, { align: "right" });
  doc.text("TOTAL", pageWidthPt - marginPt, y, { align: "right" });
  gap(4);
  solidLine(y);
  gap(6);

  // ── Line items ────────────────────────────────────────────
  bill.lines?.forEach((line: any) => {
    const marketPrice = line.item?.marketPrice;
    const qty = line.quantity;
    const unitPrice = line.unitPrice;
    const shopDiscount =
      marketPrice && marketPrice > unitPrice
        ? (marketPrice - unitPrice) * qty
        : 0;
    const billDiscount = line.discountAmount || 0;
    const totalDiscount = shopDiscount + billDiscount;

    // Item name (bold)
    doc.setFont("Courier", "bold");
    doc.setFontSize(8);
    const itemName = line.item?.name || "Item";
    const nameLines = doc.splitTextToSize(itemName, contentWidthPt * 0.75);
    left(nameLines[0], y, 8, true);
    gap(10);

    // Market price if applicable
    if (marketPrice && marketPrice > unitPrice) {
      doc.setFont("Courier", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(140, 140, 140);
      left(`  Market: Rs.${marketPrice.toLocaleString("en-LK")}`, y, 6.5);
      doc.setTextColor(0, 0, 0);
      gap(8);
    }

    // Calculation line: Rs.price × qty = Rs.subtotal
    doc.setFont("Courier", "normal");
    doc.setFontSize(7.5);
    const calcText = `  Rs.${unitPrice.toLocaleString("en-LK")} \u00d7 ${qty}`;
    left(calcText, y, 7.5);

    // Discount column
    if (totalDiscount > 0) {
      doc.setTextColor(180, 0, 0);
      doc.text(
        `-Rs.${totalDiscount.toFixed(2)}`,
        marginPt + contentWidthPt * 0.62,
        y,
        { align: "right" },
      );
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setTextColor(170, 170, 170);
      doc.text("—", marginPt + contentWidthPt * 0.62, y, { align: "right" });
      doc.setTextColor(0, 0, 0);
    }

    // Line total (bold)
    doc.setFont("Courier", "bold");
    right(`Rs.${line.lineTotal.toFixed(2)}`, y, 7.5, true);
    doc.setFont("Courier", "normal");
    gap(10);

    // Discount breakdown
    if (shopDiscount > 0 || billDiscount > 0) {
      doc.setFontSize(6.5);
      doc.setTextColor(120, 120, 120);
      if (shopDiscount > 0) {
        left(`  Shop discount: -Rs.${shopDiscount.toFixed(2)}`, y, 6.5);
        gap(8);
      }
      if (billDiscount > 0) {
        const pct = line.discountValue ? ` (${line.discountValue}%)` : "";
        left(`  Bill discount${pct}: -Rs.${billDiscount.toFixed(2)}`, y, 6.5);
        gap(8);
      }
      doc.setTextColor(0, 0, 0);
    }

    dashedLine(y);
    gap(5);
  });

  gap(3);

  // ── Totals ────────────────────────────────────────────────
  doc.setFontSize(8);

  if (bill.discountAmount > 0) {
    leftRight(
      "Bill Discount:",
      `-Rs.${bill.discountAmount.toFixed(2)}`,
      y,
      8,
      false,
      [180, 0, 0],
    );
    gap(11);
  }

  if (bill.loyaltyCoinsUsed > 0) {
    leftRight(
      "Loyalty Coins:",
      `-Rs.${bill.loyaltyCoinsUsed.toFixed(2)}`,
      y,
      8,
      false,
      [180, 0, 0],
    );
    gap(11);
  }

  solidLine(y);
  gap(8);

  // Grand total
  doc.setFont("Courier", "bold");
  doc.setFontSize(11);
  left("TOTAL:", y, 11, true);
  right(`Rs.${bill.total.toFixed(2)}`, y, 11, true);
  doc.setFont("Courier", "normal");
  gap(13);

  // Payment details
  doc.setFontSize(8);
  leftRight("Payment:", bill.paymentMethod.toUpperCase(), y);
  gap(10);

  if (bill.paymentMethod === "cash") {
    leftRight(
      "Received:",
      `Rs.${(bill.amountReceived || bill.total).toFixed(2)}`,
      y,
    );
    gap(10);
    if ((bill.change || 0) > 0) {
      leftRight("Change:", `Rs.${bill.change.toFixed(2)}`, y);
      gap(10);
    }
  }

  // Pre-order balance
  if (bill.type === "pre_order" && bill.advancePayment) {
    const balance = bill.total - (bill.advancePayment || 0);
    gap(2);
    dashedLine(y);
    gap(6);
    leftRight(
      "Advance Paid:",
      `Rs.${bill.advancePayment.toFixed(2)}`,
      y,
      8,
      false,
      [0, 120, 0],
    );
    gap(10);
    if (balance > 0) {
      leftRight(
        "Balance Due:",
        `Rs.${balance.toFixed(2)}`,
        y,
        8,
        true,
        [180, 100, 0],
      );
      gap(10);
    }
    if (bill.deliveryDate) {
      leftRight(
        "Required By:",
        new Date(bill.deliveryDate).toLocaleDateString("en-LK", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        y,
        7.5,
      );
      gap(10);
    }
  }

  // ── Savings box ───────────────────────────────────────────
  const totalMarket =
    bill.lines?.reduce((sum: number, l: any) => {
      return (
        sum +
        (l.item?.marketPrice
          ? l.item.marketPrice * l.quantity
          : l.unitPrice * l.quantity)
      );
    }, 0) || 0;

  const totalSaved = totalMarket - bill.total + (bill.discountAmount || 0);

  if (totalSaved > 0) {
    gap(4);
    doc.setDrawColor(59, 59, 152);
    doc.setFillColor(245, 245, 255);
    doc.roundedRect(marginPt, y, contentWidthPt, 26, 3, 3, "FD");
    doc.setFont("Courier", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(59, 59, 152);
    center("You saved today!", y + 9, 7.5, false);
    center(`Rs.${totalSaved.toFixed(2)}`, y + 19, 10, true);
    doc.setTextColor(0, 0, 0);
    gap(32);
  }

  // ── Loyalty coins ─────────────────────────────────────────
  if (coinsEarned > 0) {
    gap(2);
    doc.setDrawColor(238, 45, 124);
    doc.setFillColor(255, 245, 250);
    doc.roundedRect(marginPt, y, contentWidthPt, 22, 3, 3, "FD");
    doc.setFont("Courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(238, 45, 124);
    center(`Loyalty Coins Earned: +${coinsEarned}`, y + 14, 7.5);
    doc.setTextColor(0, 0, 0);
    gap(28);
  }

  // ── Footer ────────────────────────────────────────────────
  gap(4);
  dashedLine(y);
  gap(8);
  doc.setFont("Courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  center(opts.footerText || "Thank you for shopping!", y, 7);
  gap(10);
  center("Powered by Pinklet POS", y, 6.5);
  gap(10);

  doc.setTextColor(0, 0, 0);

  return doc;
}

function estimateHeight(bill: any, coinsEarned: number): number {
  let h = 120; // header

  // Info rows
  h += 60;

  // Lines
  bill.lines?.forEach((l: any) => {
    h += 30; // name + calc line
    if (l.item?.marketPrice && l.item.marketPrice > l.unitPrice) h += 10;
    if (l.discountAmount > 0) h += 16;
  });

  h += 60; // totals
  if (bill.paymentMethod === "cash") h += 20;
  if (bill.change > 0) h += 10;
  if (bill.type === "pre_order") h += 30;
  if (coinsEarned > 0) h += 35;
  h += 40; // footer

  // Savings box
  const totalMarket =
    bill.lines?.reduce((sum: number, l: any) => {
      return (
        sum +
        (l.item?.marketPrice
          ? l.item.marketPrice * l.quantity
          : l.unitPrice * l.quantity)
      );
    }, 0) || 0;
  if (totalMarket > bill.total) h += 40;

  return Math.max(h, 300);
}

export function printReceipt(
  bill: any,
  customer: any,
  coinsEarned: number,
  options?: ReceiptOptions,
) {
  const doc = generateReceiptPDF(bill, customer, coinsEarned, options);
  doc.autoPrint();
  const url = doc.output("bloburl");
  const win = window.open(url as unknown as string, "_blank");
  if (win) win.focus();
}

export function downloadReceipt(
  bill: any,
  customer: any,
  coinsEarned: number,
  options?: ReceiptOptions,
) {
  const doc = generateReceiptPDF(bill, customer, coinsEarned, options);
  doc.save(`receipt-${bill.billNumber}.pdf`);
}

export function shareReceiptWhatsApp(
  bill: any,
  customer: any,
  coinsEarned: number,
  options?: ReceiptOptions,
) {
  const number = customer?.whatsappNumber || customer?.phone;
  if (!number) {
    alert(
      "No WhatsApp number saved for this customer.\nPlease add a WhatsApp number to the customer profile.",
    );
    return;
  }

  // Download PDF
  downloadReceipt(bill, customer, coinsEarned, options);

  // Build WhatsApp message
  const totalMarket =
    bill.lines?.reduce((sum: number, l: any) => {
      return (
        sum +
        (l.item?.marketPrice
          ? l.item.marketPrice * l.quantity
          : l.unitPrice * l.quantity)
      );
    }, 0) || 0;
  const totalSaved = totalMarket - bill.total + (bill.discountAmount || 0);

  const itemLines =
    bill.lines
      ?.map(
        (l: any) =>
          `• ${l.item?.name || "Item"} ×${l.quantity} — Rs.${l.lineTotal.toFixed(2)}`,
      )
      .join("\n") || "";

  const message = [
    `🛍 *${options?.shopName || "Pinklet POS"} — Receipt*`,
    `━━━━━━━━━━━━━`,
    `📅 ${new Date(bill.createdAt).toLocaleDateString("en-LK")}`,
    `🧾 ${bill.billNumber}`,
    customer ? `👤 ${customer.name}` : "",
    ``,
    `*Items:*`,
    itemLines,
    ``,
    `━━━━━━━━━━━━━`,
    bill.discountAmount > 0
      ? `Discount: -Rs.${bill.discountAmount.toFixed(2)}`
      : "",
    `*Total: Rs.${bill.total.toFixed(2)}*`,
    totalSaved > 0 ? `🎉 *You saved Rs.${totalSaved.toFixed(2)}!*` : "",
    coinsEarned > 0 ? `💎 Coins Earned: *+${coinsEarned}*` : "",
    ``,
    `Thank you for shopping! 🎀`,
  ]
    .filter(Boolean)
    .join("\n");

  const cleanNumber = number.replace(/[\s\-\+\(\)]/g, "");
  const finalNumber = cleanNumber.startsWith("0")
    ? "94" + cleanNumber.slice(1)
    : cleanNumber;

  setTimeout(() => {
    window.open(
      `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  }, 1500);
}
