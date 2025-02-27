import { ReactNode } from 'react';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
}

export default function SectionContainerProps({ className, children }: SectionContainerProps) {
    return (
        <div className={`max-w-5xl mx-auto w-full ${className}`}>{children}</div>
    );
}