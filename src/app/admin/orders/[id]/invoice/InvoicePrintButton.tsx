"use client";

import { Printer } from "lucide-react";

export function InvoicePrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-manrope text-sm font-medium hover:bg-[#6d1531] transition-colors"
    >
      <Printer className="h-4 w-4" />
      Print / Save PDF
    </button>
  );
}
