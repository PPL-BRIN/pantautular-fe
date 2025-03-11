export interface MapLocation {
  id: string;
  location__longitude: number;
  location__latitude: number;
  city: string;
}

export interface FilterOptions {
  diseases: string[];
  locations: string[];
  news: string[];
}

export interface FilterState {
  diseases: string[];
  locations: string[];
  level_of_alertness: number;
  portals: string[];
  start_date: string;
  end_date: string;
}

export interface MapConfig {
  zoomLevel: number;
  centerPoint: { longitude: number; latitude: number };
}