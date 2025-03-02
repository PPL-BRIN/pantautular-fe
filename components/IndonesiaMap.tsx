// components/IndonesiaMap.tsx - Presentation component
import React from "react";
import { useIndonesiaMap } from "../hooks/useIndonesiaMap";
import { MapLocation, MapConfig } from "../types";

interface IndonesiaMapProps {
  locations: MapLocation[];
  config?: Partial<MapConfig>;
  height?: string;
  width?: string;
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  locations,
  config = {},
  height = "550px",
  width = "100%",
}) => {
  const mapContainerId = "chartdiv";
  const fullConfig: MapConfig = {
    zoomLevel: config.zoomLevel ?? 2,
    centerPoint: config.centerPoint ?? { longitude: 113.9213, latitude: 0.7893 }
  };

  useIndonesiaMap(mapContainerId, locations, fullConfig);

  return (
    <div
      id={mapContainerId}
      data-testid="map-container"
      style={{ width, height }}
    />
  );
};
