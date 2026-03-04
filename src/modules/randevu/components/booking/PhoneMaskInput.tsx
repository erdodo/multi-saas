"use client";

import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

// Format: 0XXX XXX XX XX (11 digit Turkish mobile)
function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 4 || i === 7 || i === 9) out += " ";
    out += digits[i];
  }
  return out;
}

export default function PhoneMaskInput({
  value,
  onChange,
  required,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value);
    onChange(masked);
  };

  return (
    <input
      ref={inputRef}
      type="tel"
      inputMode="numeric"
      required={required}
      value={value}
      onChange={handleChange}
      placeholder="0XXX XXX XX XX"
      maxLength={14}
      className={className}
    />
  );
}
