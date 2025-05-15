import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

export function Badge({ 
  className, 
  variant = "default", 
  ...props 
}: BadgeProps) {
  const variantClasses = {
    default: "bg-[#7356ff] text-white",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-200 bg-transparent",
    success: "bg-[#b1c840] text-white",
  };
  
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className
      )} 
      {...props}
    />
  );
}