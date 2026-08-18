"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export default function CopyButton({
  text,
  label,
  className = "",
  size = "sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const dims = size === "sm" ? "w-8 h-8" : "w-10 h-10";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : `Copy ${label ?? "text"}`}
      title={copied ? "Copied!" : `Copy ${label ?? "text"}`}
      className={`${dims} border-2 border-border rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${
        copied ? "bg-accent-sky text-white" : "bg-bg text-text"
      } ${className}`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
