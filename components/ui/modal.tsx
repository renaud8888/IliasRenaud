"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  className
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "glass-card fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] p-6 outline-none",
            className
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-[var(--font-heading)] text-2xl font-bold">{title}</Dialog.Title>
            <Dialog.Close className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
