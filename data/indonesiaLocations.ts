import { MapLocation, MapConfig } from "../types";


export const indonesiaLocations: MapLocation[] = [
    { city: "Jakarta", location: "Monas", latitude: -6.1754, longitude: 106.8272 },
    { city: "Jakarta", location: "Monas Juga", latitude: -6.1754, longitude: 106.8272 },
    { city: "Jakarta", location: "Gelora Bung Karno", latitude: -6.2180, longitude: 106.8014 },
    { city: "Jakarta", location: "Kota Tua", latitude: -6.1352, longitude: 106.8133 },
    { city: "Bandung", location: "Alun-Alun", latitude: -6.9219, longitude: 107.6071 },
    { city: "Bandung", location: "Dago", latitude: -6.8915, longitude: 107.6107 },
    { city: "Bandung", location: "Lembang", latitude: -6.8182, longitude: 107.6186 },
    { city: "Bandung", location: "Lembang2", latitude: -6.8182, longitude: 107.6186 },
    { city: "Surabaya", location: "Tunjungan Plaza", latitude: -7.2653, longitude: 112.7457 },
    { city: "Surabaya", location: "Kenjeran Beach", latitude: -7.2235, longitude: 112.7892 },
    { city: "Surabaya", location: "Heroes Monument", latitude: -7.2458, longitude: 112.7379 },
    { city: "Yogyakarta", location: "Malioboro", latitude: -7.7931, longitude: 110.3658 },
    { city: "Yogyakarta", location: "Prambanan Temple", latitude: -7.7520, longitude: 110.4910 },
    { city: "Yogyakarta", location: "Keraton", latitude: -7.8056, longitude: 110.3648 },
    { city: "Denpasar", location: "Kuta Beach", latitude: -8.7179, longitude: 115.1683 },
    { city: "Denpasar", location: "Sanur Beach", latitude: -8.6842, longitude: 115.2620 },
    { city: "Denpasar", location: "Puputan Square", latitude: -8.6563, longitude: 115.2166 },
    { city: "Medan", location: "Maimun Palace", latitude: 3.5754, longitude: 98.6889 },
    { city: "Medan", location: "Merdeka Walk", latitude: 3.5939, longitude: 98.6765 },
    { city: "Medan", location: "Tjong A Fie Mansion", latitude: 3.5953, longitude: 98.6801 },
    { city: "Makassar", location: "Losari Beach", latitude: -5.1406, longitude: 119.4128 },
    { city: "Makassar", location: "Fort Rotterdam", latitude: -5.1335, longitude: 119.4063 },
    { city: "Makassar", location: "Trans Studio Mall", latitude: -5.1613, longitude: 119.4372 }
  ];

  export const defaultMapConfig: MapConfig = {
    zoomLevel: 2,
    centerPoint: { longitude: 113.9213, latitude: 0.7893 }
  };