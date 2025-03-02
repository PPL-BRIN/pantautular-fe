import React from "react";

interface BackgroundCircleProps {
    size: { width: string; height: string };
    position: string;
}
  
export default function BackgroundCircle({ size, position }: BackgroundCircleProps) {
    return(
        <div className={`absolute ${position} transform -translate-x-1/2 bg-[#E3EFE8] rounded-full blur-2xl z-0`}
        style={{ width: size.width, height: size.height }}
        ></div>
    );
}