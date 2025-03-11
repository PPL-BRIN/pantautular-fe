import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the context type
interface SelectedCountContextType {
  countSelectedPoints: number;
  setCountSelectedPoints: (count: number) => void;
}

// Create the context with default value as undefined
const SelectedCountContext = createContext<SelectedCountContextType | undefined>(undefined);

// Custom hook to use the selected count context
export const useSelectedCount = (): SelectedCountContextType => {
  const context = useContext(SelectedCountContext);
  if (!context) {
    throw new Error("useSelectedCount must be used within a SelectedCountProvider");
  }
  return context;
};

// Provider component to wrap around the page/component where you need it
export const SelectedCountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [countSelectedPoints, setCountSelectedPoints] = useState<number>(0);

  return (
    <SelectedCountContext.Provider value={{ countSelectedPoints, setCountSelectedPoints }}>
      {children}
    </SelectedCountContext.Provider>
  );
};
