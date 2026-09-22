"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export function ConfirmButton({
  action,
  confirmText = "Yakin ingin menghapus?",
  className,
  children,
  title,
}: {
  action: () => Promise<void>;
  confirmText?: string | null;
  className?: string;
  children: React.ReactNode;
  title?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      className={className}
      onClick={() => {
        if (confirmText && !window.confirm(confirmText)) return;
        start(() => action());
      }}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}
