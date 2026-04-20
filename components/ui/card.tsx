import { cn } from "@/lib/utils";

export function Card({
  className,
  children
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return <div className={cn("glass-card rounded-[28px] p-5 md:p-6", className)}>{children}</div>;
}
