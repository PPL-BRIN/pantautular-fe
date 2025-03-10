"use client"

import { MapPin } from "lucide-react"
import type { ButtonHTMLAttributes } from "react"

interface LocationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  size?: "sm" | "md" | "lg"
}

export default function LocationButton({
  onClick,
  className = "",
  variant = "default",
  size = "md",
  disabled,
  ...props
}: LocationButtonProps) {
  // Size mappings with fixed width and height like WarningButton
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  const variantClasses = {
    default: "bg-white hover:bg-gray-100 text-black shadow-sm",
    outline: "border border-gray-300 hover:bg-gray-50 text-black"
  }

  // Icon size based on button size, matching WarningButton approach
  const iconSize = size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-8 h-8"

  return (
    <button
      aria-label="Location"
      onClick={onClick}
      className={`rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      <MapPin className={`text-primary ${iconSize}`} />
    </button>
  )
}