import { useEffect, useRef } from "react";

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minLength?: number;
  maxDelay?: number; // ms between keystrokes — scanners are very fast
}

export function useBarcodeScanner({
  onScan,
  minLength = 3,
  maxDelay = 50,
}: BarcodeScannerOptions) {
  const buffer = useRef<string>("");
  const lastKeyTime = useRef<number>(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        // But still capture if it looks like a scanner
        // (very fast input)
        const now = Date.now();
        const timeSinceLast = now - lastKeyTime.current;
        lastKeyTime.current = now;

        if (timeSinceLast > maxDelay * 3) {
          // Too slow — user is typing, not scanner
          if (e.key === "Enter" && buffer.current.length >= minLength) {
            const barcode = buffer.current.trim();
            buffer.current = "";
            if (barcode) onScan(barcode);
          }
          return;
        }
      }

      const now = Date.now();
      const timeSinceLast = now - lastKeyTime.current;
      lastKeyTime.current = now;

      // Clear buffer if too much time has passed
      if (timeSinceLast > 300) {
        buffer.current = "";
      }

      if (e.key === "Enter") {
        const barcode = buffer.current.trim();
        buffer.current = "";
        if (barcode.length >= minLength) {
          onScan(barcode);
        }
        return;
      }

      // Only add printable characters
      if (e.key.length === 1) {
        buffer.current += e.key;
      }

      // Clear after timeout if no Enter received
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        buffer.current = "";
      }, 500);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [onScan, minLength, maxDelay]);
}
