export interface MapLocation {
    city: string;
    location: string;
    latitude: number;
    longitude: number;
  }
  
  export interface MapConfig {
    zoomLevel: number;
    centerPoint: { longitude: number; latitude: number };
  }