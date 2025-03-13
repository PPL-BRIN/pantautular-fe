import { useState } from "react"

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
}

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
}

interface TemperatureButtonProps {
  onClick?: () => void
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function TemperatureButton({ 
  onClick, 
  className = "", 
  size = "md" 
}: Readonly<TemperatureButtonProps>) {
  const [isActive, setIsActive] = useState(false)

  const handleClick = () => {
    setIsActive(!isActive)
    if (onClick) onClick()
  }

  return (
    <button
      className={`relative flex items-center justify-center rounded-full transition-colors duration-300 ${
        isActive ? "bg-red-500 text-white" : "bg-white text-red-500 border border-gray-200"
      } ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      aria-pressed={isActive}
    >
      <svg
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-colors duration-300"
      >
        <path
          d="M8 2C6.89543 2 6 2.89543 6 4V10C5.05719 10.535 4.5 11.6619 4.5 12.75C4.5 14.706 6.044 16 8 16C9.956 16 11.5 14.706 11.5 12.75C11.5 11.6619 10.9428 10.535 10 10V4C10 2.89543 9.10457 2 8 2Z"
          fill={isActive ? "white" : "currentColor"}
        />
      </svg>
    </button>
  )
}