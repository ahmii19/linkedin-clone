import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  fallback?: string;
}

export function Avatar({ src, alt = "", size = "md", className, fallback }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
    xxl: "h-28 w-28 text-4xl",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("rounded-full object-cover ring-2 ring-white dark:ring-gray-800", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold ring-2 ring-white dark:ring-gray-800",
        sizeClasses[size],
        className
      )}
    >
      {fallback ? fallback.charAt(0).toUpperCase() : "?"}
    </div>
  );
}
