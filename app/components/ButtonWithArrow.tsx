import { ArrowRight } from "lucide-react";

interface ButtonWithArrowProps {
  children: React.ReactNode;
}

export default function ButtonWithArrow({ children }: ButtonWithArrowProps) {
  return (
    <button className="button-primary flex items-center gap-2">
      {children}
      <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
        <ArrowRight size={16} className="text-green-600" />
      </div>
    </button>
  );
}
