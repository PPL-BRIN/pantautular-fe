// page.tsx - Main page component
"use client";

import React from "react";
import { IndonesiaMap } from "../../components/IndonesiaMap";
import { indonesiaLocations, defaultMapConfig } from "../../data/indonesiaLocations";

export default function MapPage() {
  return <IndonesiaMap 
    locations={indonesiaLocations} 
    config={defaultMapConfig} 
  />;
}