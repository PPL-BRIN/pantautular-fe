export interface MapLocation {
  id: string;
  location__longitude: number;
  location__latitude: number;
  city: string;
}

export interface MapConfig {
  zoomLevel: number;
  centerPoint: { longitude: number; latitude: number };
}