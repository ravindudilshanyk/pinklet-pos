import { jsPDF } from "jspdf";

export function generateReceiptPDF(
  bill: any,
  customer: any,
  coinsEarned: number,
): jsPDF {
  const pageWidth = 227; // 80mm in points
  const margin = 12;
  let y = 16;

  // Start with tall page, we'll track content height
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageWidth, 1200],
  });

  // ── Helpers ──────────────────────────────────────────────
  const centerText = (str: string, yPos: number, size = 8) => {
    doc.setFontSize(size);
    doc.text(str, pageWidth / 2, yPos, { align: "center" });
  };

  const leftRight = (left: string, right: string, yPos: number, size = 8) => {
    doc.setFontSize(size);
    doc.text(left, margin, yPos);
    doc.text(right, pageWidth - margin, yPos, { align: "right" });
  };

  const dashedLine = (yPos: number) => {
    doc.setDrawColor(180);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    doc.setLineDashPattern([], 0);
    doc.setDrawColor(0);
  };

  const solidLine = (yPos: number) => {
    doc.setDrawColor(0);
    doc.setLineDashPattern([], 0);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  // ── Header ────────────────────────────────────────────────
  doc.setFont("Courier", "bold");
  centerText("🎀 Pinklet POS", y, 13);
  y += 14;

  doc.setFont("Courier", "normal");
  doc.setTextColor(120);
  centerText("Thank you for shopping!", y, 8);
  doc.setTextColor(0);
  y += 10;

  solidLine(y);
  y += 8;

  // ── Bill info ─────────────────────────────────────────────
  doc.setFontSize(8);
  const infoLines: [string, string][] = [
    ["Bill #:", bill.billNumber],
    ["Date:", new Date(bill.createdAt).toLocaleString("en-LK")],
    ["Cashier:", bill.cashier?.name || "—"],
  ];
  if (customer) infoLines.push(["Customer:", customer.name]);

  infoLines.forEach(([label, value]) => {
    doc.setFont("Courier", "bold");
    doc.text(label, margin, y);
    doc.setFont("Courier", "normal");
    doc.text(value, margin + 50, y);
    y += 11;
  });

  // Bill type badge
  if (bill.type === "pre_order") {
    y += 2;
    doc.setFillColor(238, 45, 124);
    doc.roundedRect(margin, y, 55, 10, 2, 2, "F");
    doc.setTextColor(255);
    doc.setFontSize(7);
    doc.setFont("Courier", "bold");
    doc.text("PRE-ORDER", margin + 4, y + 7);
    doc.setTextColor(0);
    y += 14;
  }

  dashedLine(y);
  y += 8;

  // ── Column headers ────────────────────────────────────────
  doc.setFont("Courier", "bold");
  doc.setFontSize(7.5);
  doc.text("Item", margin, y);
  doc.text("Disc", margin + 148, y, { align: "right" });
  doc.text("Total", pageWidth - margin, y, { align: "right" });
  y += 4;
  solidLine(y);
  y += 7;

  // ── Line items ────────────────────────────────────────────
  doc.setFont("Courier", "normal");

  bill.lines.forEach((l: any) => {
    const marketPrice = l.item?.marketPrice;
    const qty = l.quantity;
    const unitPrice = l.unitPrice;
    const shopDiscount = marketPrice ? (marketPrice - unitPrice) * qty : 0;
    const billDiscount = l.discountAmount || 0;
    const totalDiscount = shopDiscount + billDiscount;

    // Item name
    doc.setFont("Courier", "bold");
    doc.setFontSize(8);
    const nameLines = doc.splitTextToSize(
      l.item?.name || "Item",
      pageWidth - margin * 2,
    );
    doc.text(nameLines[0], margin, y);
    y += 10;

    // Market price (crossed out effect - show with note)
    if (marketPrice && marketPrice > unitPrice) {
      doc.setFont("Courier", "normal");
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`Market: Rs.${marketPrice.toLocaleString()}`, margin + 4, y);
      doc.setTextColor(0);
      y += 8;
    }

    // Calculation: (price × qty)
    doc.setFont("Courier", "normal");
    doc.setFontSize(7.5);
    const calcStr = `(Rs.${unitPrice.toLocaleString()} × ${qty} = Rs.${(unitPrice * qty).toFixed(2)})`;
    doc.text(calcStr, margin + 4, y);

    // Discount column
    if (totalDiscount > 0) {
      doc.setTextColor(200, 0, 0);
      doc.text(`-Rs.${totalDiscount.toFixed(2)}`, margin + 148, y, {
        align: "right",
      });
      doc.setTextColor(0);
    } else {
      doc.setTextColor(180);
      doc.text("—", margin + 148, y, { align: "right" });
      doc.setTextColor(0);
    }

    // Line total
    doc.setFont("Courier", "bold");
    doc.text(`Rs.${l.lineTotal.toFixed(2)}`, pageWidth - margin, y, {
      align: "right",
    });
    doc.setFont("Courier", "normal");
    y += 10;

    // Discount breakdown detail
    if (shopDiscount > 0 || billDiscount > 0) {
      doc.setFontSize(7);
      doc.setTextColor(120);
      if (shopDiscount > 0) {
        doc.text(
          `  Shop discount: -Rs.${shopDiscount.toFixed(2)}`,
          margin + 4,
          y,
        );
        y += 8;
      }
      if (billDiscount > 0) {
        const pctLabel = l.discountValue ? ` (${l.discountValue}%)` : "";
        doc.text(
          `  Bill discount${pctLabel}: -Rs.${billDiscount.toFixed(2)}`,
          margin + 4,
          y,
        );
        y += 8;
      }
      doc.setTextColor(0);
    }

    dashedLine(y);
    y += 6;
  });

  y += 4;

  // ── Totals ────────────────────────────────────────────────
  doc.setFont("Courier", "normal");
  doc.setFontSize(8);

  if (bill.discountAmount > 0) {
    leftRight("Bill Discount:", `-Rs. ${bill.discountAmount.toFixed(2)}`, y);
    doc.setTextColor(200, 0, 0);
    doc.text(`-Rs. ${bill.discountAmount.toFixed(2)}`, pageWidth - margin, y, {
      align: "right",
    });
    doc.setTextColor(0);
    y += 11;
  }

  solidLine(y);
  y += 8;

  doc.setFont("Courier", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL:", margin, y);
  doc.text(`Rs. ${bill.total.toFixed(2)}`, pageWidth - margin, y, {
    align: "right",
  });
  y += 13;

  // Payment details
  doc.setFont("Courier", "normal");
  doc.setFontSize(8);
  leftRight("Payment:", bill.paymentMethod.toUpperCase(), y);
  y += 11;

  if (bill.paymentMethod === "cash") {
    leftRight(
      "Received:",
      `Rs. ${(bill.amountReceived || bill.total).toFixed(2)}`,
      y,
    );
    y += 11;
    if (bill.change > 0) {
      leftRight("Change:", `Rs. ${bill.change.toFixed(2)}`, y);
      y += 11;
    }
  }

  // ── Savings box ───────────────────────────────────────────
  const totalMarket = bill.lines.reduce((sum: number, l: any) => {
    return (
      sum +
      (l.item?.marketPrice
        ? l.item.marketPrice * l.quantity
        : l.unitPrice * l.quantity)
    );
  }, 0);
  const totalSaved = totalMarket - bill.total + (bill.discountAmount || 0);

  if (totalSaved > 0) {
    y += 6;
    doc.setDrawColor(59, 59, 152);
    doc.setFillColor(248, 248, 255);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 3, 3, "FD");
    doc.setFont("Courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(59, 59, 152);
    centerText("You saved today!", y + 9, 8);
    doc.setFontSize(10);
    centerText(`Rs. ${totalSaved.toFixed(2)}`, y + 19, 10);
    doc.setTextColor(0);
    y += 30;
  }

  // ── Loyalty coins ─────────────────────────────────────────
  if (coinsEarned > 0) {
    y += 4;
    doc.setDrawColor(238, 45, 124);
    doc.setFillColor(255, 248, 251);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 3, 3, "FD");
    doc.setFont("Courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(238, 45, 124);
    centerText(`Loyalty Coins Earned: ${coinsEarned}`, y + 14, 8);
    doc.setTextColor(0);
    y += 28;
  }

  // ── Footer ────────────────────────────────────────────────
  y += 6;
  dashedLine(y);
  y += 8;
  doc.setFont("Courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150);
  centerText("Powered by Pinklet POS", y, 7);
  y += 10;
  doc.setTextColor(0);

  // ── Trim page to content ──────────────────────────────────
  // Create new doc with exact height
  const finalDoc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageWidth, y + 10],
  });

  // Copy all pages from doc to finalDoc
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    if (i > 1) finalDoc.addPage([pageWidth, y + 10]);
    // Get the page content as data URL and add to finalDoc
    const imgData = doc.canvas?.toDataURL?.("image/png");
    if (imgData) {
      finalDoc.addImage(imgData, "PNG", 0, 0, pageWidth, y + 10);
    }
  }

  // Since jsPDF doesn't easily support page trimming after drawing,
  // we redraw everything on the correctly sized doc
  return drawReceiptOnDoc(
    finalDoc,
    bill,
    customer,
    coinsEarned,
    pageWidth,
    margin,
  );
}

// Separate draw function to avoid code duplication
function drawReceiptOnDoc(
  doc: jsPDF,
  bill: any,
  customer: any,
  coinsEarned: number,
  pageWidth: number,
  margin: number,
): jsPDF {
  let y = 16;

  const centerText = (str: string, yPos: number, size = 8) => {
    doc.setFontSize(size);
    doc.text(str, pageWidth / 2, yPos, { align: "center" });
  };

  const leftRight = (left: string, right: string, yPos: number) => {
    doc.setFontSize(8);
    doc.text(left, margin, yPos);
    doc.text(right, pageWidth - margin, yPos, { align: "right" });
  };

  const dashedLine = (yPos: number) => {
    doc.setDrawColor(180);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    doc.setLineDashPattern([], 0);
    doc.setDrawColor(0);
  };

  const solidLine = (yPos: number) => {
    doc.setDrawColor(0);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  // Header
  doc.setFont("Courier", "bold");
  centerText("Pinklet POS", y, 13);
  y += 14;
  doc.setFont("Courier", "normal");
  doc.setTextColor(120);
  centerText("Thank you for shopping!", y, 8);
  doc.setTextColor(0);
  y += 10;
  solidLine(y);
  y += 8;

  // Info
  doc.setFontSize(8);
  const infoLines: [string, string][] = [
    ["Bill #:", bill.billNumber],
    ["Date:", new Date(bill.createdAt).toLocaleString("en-LK")],
    ["Cashier:", bill.cashier?.name || "—"],
  ];
  if (customer) infoLines.push(["Customer:", customer.name]);
  infoLines.forEach(([label, value]) => {
    doc.setFont("Courier", "bold");
    doc.text(label, margin, y);
    doc.setFont("Courier", "normal");
    doc.text(value, margin + 50, y);
    y += 11;
  });

  dashedLine(y);
  y += 8;

  // Column headers
  doc.setFont("Courier", "bold");
  doc.setFontSize(7.5);
  doc.text("Item", margin, y);
  doc.text("Disc", margin + 148, y, { align: "right" });
  doc.text("Total", pageWidth - margin, y, { align: "right" });
  y += 4;
  solidLine(y);
  y += 7;

  // Items
  doc.setFont("Courier", "normal");
  bill.lines.forEach((l: any) => {
    const marketPrice = l.item?.marketPrice;
    const qty = l.quantity;
    const unitPrice = l.unitPrice;
    const shopDiscount = marketPrice ? (marketPrice - unitPrice) * qty : 0;
    const billDiscount = l.discountAmount || 0;
    const totalDiscount = shopDiscount + billDiscount;

    doc.setFont("Courier", "bold");
    doc.setFontSize(8);
    const nameLines = doc.splitTextToSize(
      l.item?.name || "Item",
      pageWidth - margin * 2,
    );
    doc.text(nameLines[0], margin, y);
    y += 10;

    if (marketPrice && marketPrice > unitPrice) {
      doc.setFont("Courier", "normal");
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`Market: Rs.${marketPrice.toLocaleString()}`, margin + 4, y);
      doc.setTextColor(0);
      y += 8;
    }

    doc.setFont("Courier", "normal");
    doc.setFontSize(7.5);
    doc.text(
      `(Rs.${unitPrice.toLocaleString()} x ${qty} = Rs.${(unitPrice * qty).toFixed(2)})`,
      margin + 4,
      y,
    );

    if (totalDiscount > 0) {
      doc.setTextColor(200, 0, 0);
      doc.text(`-Rs.${totalDiscount.toFixed(2)}`, margin + 148, y, {
        align: "right",
      });
      doc.setTextColor(0);
    } else {
      doc.setTextColor(180);
      doc.text("---", margin + 148, y, { align: "right" });
      doc.setTextColor(0);
    }

    doc.setFont("Courier", "bold");
    doc.text(`Rs.${l.lineTotal.toFixed(2)}`, pageWidth - margin, y, {
      align: "right",
    });
    doc.setFont("Courier", "normal");
    y += 10;

    if (shopDiscount > 0 || billDiscount > 0) {
      doc.setFontSize(7);
      doc.setTextColor(120);
      if (shopDiscount > 0) {
        doc.text(`  Shop: -Rs.${shopDiscount.toFixed(2)}`, margin + 4, y);
        y += 8;
      }
      if (billDiscount > 0) {
        const pct = l.discountValue ? ` (${l.discountValue}%)` : "";
        doc.text(`  Bill${pct}: -Rs.${billDiscount.toFixed(2)}`, margin + 4, y);
        y += 8;
      }
      doc.setTextColor(0);
    }

    dashedLine(y);
    y += 6;
  });

  y += 4;

  // Totals
  if (bill.discountAmount > 0) {
    doc.setFont("Courier", "normal");
    doc.setFontSize(8);
    doc.text("Bill Discount:", margin, y);
    doc.setTextColor(200, 0, 0);
    doc.text(`-Rs. ${bill.discountAmount.toFixed(2)}`, pageWidth - margin, y, {
      align: "right",
    });
    doc.setTextColor(0);
    y += 11;
  }

  solidLine(y);
  y += 8;
  doc.setFont("Courier", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL:", margin, y);
  doc.text(`Rs. ${bill.total.toFixed(2)}`, pageWidth - margin, y, {
    align: "right",
  });
  y += 13;

  doc.setFont("Courier", "normal");
  doc.setFontSize(8);
  leftRight("Payment:", bill.paymentMethod.toUpperCase(), y);
  y += 11;

  if (bill.paymentMethod === "cash") {
    leftRight(
      "Received:",
      `Rs. ${(bill.amountReceived || bill.total).toFixed(2)}`,
      y,
    );
    y += 11;
    if (bill.change > 0) {
      leftRight("Change:", `Rs. ${bill.change.toFixed(2)}`, y);
      y += 11;
    }
  }

  // Savings
  const totalMarket = bill.lines.reduce((sum: number, l: any) => {
    return (
      sum +
      (l.item?.marketPrice
        ? l.item.marketPrice * l.quantity
        : l.unitPrice * l.quantity)
    );
  }, 0);
  const totalSaved = totalMarket - bill.total + (bill.discountAmount || 0);

  if (totalSaved > 0) {
    y += 6;
    doc.setDrawColor(59, 59, 152);
    doc.setFillColor(248, 248, 255);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 3, 3, "FD");
    doc.setFont("Courier", "bold");
    doc.setTextColor(59, 59, 152);
    centerText("You saved today!", y + 9, 8);
    centerText(`Rs. ${totalSaved.toFixed(2)}`, y + 19, 10);
    doc.setTextColor(0);
    y += 30;
  }

  if (coinsEarned > 0) {
    y += 4;
    doc.setDrawColor(238, 45, 124);
    doc.setFillColor(255, 248, 251);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 3, 3, "FD");
    doc.setFont("Courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(238, 45, 124);
    centerText(`Loyalty Coins Earned: ${coinsEarned}`, y + 14, 8);
    doc.setTextColor(0);
    y += 28;
  }

  y += 6;
  dashedLine(y);
  y += 8;
  doc.setFont("Courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150);
  centerText("Powered by Pinklet POS", y, 7);

  return doc;
}

export function printReceipt(bill: any, customer: any, coinsEarned: number) {
  // Calculate content height first
  const height = estimateReceiptHeight(bill, coinsEarned);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [227, height],
  });
  drawReceiptOnDoc(doc, bill, customer, coinsEarned, 227, 12);
  doc.autoPrint();
  const url = doc.output("bloburl");
  window.open(url as unknown as string, "_blank");
}

export function downloadReceipt(bill: any, customer: any, coinsEarned: number) {
  const height = estimateReceiptHeight(bill, coinsEarned);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [227, height],
  });
  drawReceiptOnDoc(doc, bill, customer, coinsEarned, 227, 12);
  doc.save(`receipt-${bill.billNumber}.pdf`);
}

export function shareReceiptWhatsApp(
  bill: any,
  customer: any,
  coinsEarned: number,
) {
  const number = customer?.whatsappNumber || customer?.phone;
  if (!number) {
    alert(
      "No WhatsApp number saved.\nPlease add a WhatsApp number to the customer profile first.",
    );
    return;
  }

  // Download PDF first
  downloadReceipt(bill, customer, coinsEarned);

  // Then open WhatsApp — user manually attaches PDF
  const cleanNumber = number.replace(/[\s\-\+]/g, "");
  const message = encodeURIComponent(
    `🛍 *Pinklet POS - Receipt*\n` +
      `Bill #: ${bill.billNumber}\n` +
      `Total: Rs. ${bill.total.toFixed(2)}\n\n` +
      `Your receipt PDF has been downloaded.\n` +
      `Please find it attached.\n\n` +
      `Thank you for shopping! 🎀`,
  );

  setTimeout(() => {
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  }, 1500);
}

function estimateReceiptHeight(bill: any, coinsEarned: number): number {
  let height = 200; // base

  bill.lines?.forEach((l: any) => {
    height += 40; // base per item
    if (l.item?.marketPrice && l.item.marketPrice > l.unitPrice) height += 20;
    if (l.discountAmount > 0) height += 16;
  });

  if (coinsEarned > 0) height += 40;
  if (bill.discountAmount > 0) height += 20;
  if (bill.change > 0) height += 20;

  return Math.max(height, 400);
}
