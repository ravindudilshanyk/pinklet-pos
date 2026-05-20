import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { settingsService } from "@/services/Settings.service";
import {
  buildReceiptPrintHtml,
  openReceiptPrintWindow,
  resolveReceiptLayoutConfig,
} from "./receiptPrintLayout";

const MM_TO_PT = 2.83464567;
let settingsCache: { value: any; expiresAt: number } | null = null;

async function getShopSettingsForReceipt() {
  if (settingsCache && Date.now() < settingsCache.expiresAt) {
    return settingsCache.value;
  }

  try {
    const settings = await settingsService.getShopSettings();
    settingsCache = {
      value: settings,
      expiresAt: Date.now() + 30_000,
    };
    return settings;
  } catch {
    const fallback = {
      shopName: "Pinklet POS",
      shopAddress: "",
      shopPhone: "",
      shopEmail: "",
      currencySymbol: "Rs.",
      taxName: "Tax",
      receiptFooter: "Thank you for shopping with us!",
      receiptLayout: undefined,
    };
    settingsCache = {
      value: fallback,
      expiresAt: Date.now() + 5_000,
    };
    return fallback;
  }
}

async function renderReceiptHtmlToPDF(html: string, pageWidthMm: number) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = `${Math.max(360, Math.round(pageWidthMm * 4.2))}px`;
  iframe.style.height = "2200px";
  iframe.style.opacity = "0";
  iframe.setAttribute("aria-hidden", "true");

  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = html;
    });

    const target = iframe.contentDocument?.querySelector(
      ".receipt-root",
    ) as HTMLElement | null;

    if (!target) {
      throw new Error("Receipt layout not found");
    }

    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const pageWidthPt = pageWidthMm * MM_TO_PT;
    const pageHeightPt = pageWidthPt * (canvas.height / canvas.width);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [pageWidthPt, pageHeightPt],
    });

    doc.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      pageWidthPt,
      pageHeightPt,
    );

    return doc;
  } finally {
    document.body.removeChild(iframe);
  }
}

export async function generateReceiptPDF(
  bill: any,
  customer: any,
  coinsEarned: number,
): Promise<jsPDF> {
  const settings = await getShopSettingsForReceipt();
  const layout = resolveReceiptLayoutConfig(settings);
  const html = buildReceiptPrintHtml(bill, customer, coinsEarned, settings, {
    autoPrint: false,
  });
  return renderReceiptHtmlToPDF(html, layout.pageWidthMm);
}

export async function printReceipt(bill: any, customer: any, coinsEarned: number) {
  const settings = await getShopSettingsForReceipt();
  const layout = resolveReceiptLayoutConfig(settings);
  const html = buildReceiptPrintHtml(bill, customer, coinsEarned, settings, {
    autoPrint: true,
  });
  openReceiptPrintWindow(html, layout.pageWidthMm);
}

export async function downloadReceipt(
  bill: any,
  customer: any,
  coinsEarned: number,
) {
  const doc = await generateReceiptPDF(bill, customer, coinsEarned);
  doc.save(`receipt-${bill.billNumber}.pdf`);
}

export async function shareReceiptWhatsApp(
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

  await downloadReceipt(bill, customer, coinsEarned);

  const cleanNumber = number.replace(/[\s\-\+]/g, "");
  const message = encodeURIComponent(
    `Pinklet POS - Receipt\n` +
      `Bill #: ${bill.billNumber}\n` +
      `Total: ${bill.total.toFixed(2)}\n\n` +
      `Your receipt PDF has been downloaded.\n` +
      `Please attach and send it to the customer.`,
  );

  setTimeout(() => {
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  }, 1000);
}
