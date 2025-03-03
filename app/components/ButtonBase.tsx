import Link from "next/link";

interface ButtonBaseProps extends Readonly<{
  children: React.ReactNode;
  href: string;
  className?: string;
}>{}

export default function ButtonBase({ children, href, className = "" }: ButtonBaseProps) {
  return (
    <Link href={href} role="button" className={`button-primary ${className}`}>
      {children}
    </Link>
  );
}
