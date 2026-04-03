"use client";

import { useState } from "react";

interface CurrencyInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  currency?: "USD" | "CNY" | "VND";
  placeholder?: string;
  className?: string;
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  CNY: "¥",
  VND: "₫",
};

export function CurrencyInput({
  value,
  onChange,
  currency = "USD",
  placeholder = "0.00",
  className = "",
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(
    value !== undefined ? value.toLocaleString() : ""
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setDisplayValue(raw);
    const num = parseFloat(raw);
    onChange(isNaN(num) ? undefined : num);
  }

  function handleBlur() {
    if (value !== undefined) {
      setDisplayValue(
        currency === "VND"
          ? value.toLocaleString("vi-VN")
          : value.toLocaleString("en-US", { minimumFractionDigits: 2 })
      );
    }
  }

  function handleFocus() {
    if (value !== undefined) {
      setDisplayValue(value.toString());
    }
  }

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
        {currencySymbols[currency]}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#ffbf00]/50"
      />
    </div>
  );
}
