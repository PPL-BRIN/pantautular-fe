export interface TooltipData {
    id: string;
    location: string;
    summary: string;
    gender: string;
    age: string;
    alertLevel: string;
    relatedSearch: string;
    source: string;
  }
  
  export const getTooltipHTML = (data: TooltipData): string => {
    return "data";
  };