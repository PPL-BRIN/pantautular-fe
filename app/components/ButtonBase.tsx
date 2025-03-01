import Link from "next/link";

interface ButtonBaseProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}

export default function ButtonBase({ children, href, className = "" }: ButtonBaseProps) {
  return (
    <Link href={href} className={`button-primary ${className}`}>
      {children}
    </Link>
  );
}
