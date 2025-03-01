import { MapChartService } from './mapChartService';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import { MapConfig, MapLocation } from "../types";

// Mock amcharts modules
jest.mock("@amcharts/amcharts5", () => {
  const originalModule = jest.requireActual("@amcharts/amcharts5");
  
  return {
    __esModule: true,
    ...originalModule,
    Root: {
      new: jest.fn().mockImplementation(() => ({
        setThemes: jest.fn(),
        container: {
          children: {
            push: jest.fn().mockImplementation((chart) => chart)
          }
        },
        dispose: jest.fn()
      }))
    },
    Container: {
      new: jest.fn().mockImplementation(() => ({
        children: {
          push: jest.fn()
        },
        events: {
          on: jest.fn()
        }
      }))
    },
    Circle: {
      new: jest.fn().mockImplementation(() => ({}))
    },
    Label: {
      new: jest.fn().mockImplementation(() => ({}))
    },
    Bullet: {
      new: jest.fn().mockImplementation(() => ({
        sprite: {}
      }))
    },
    color: jest.fn().mockImplementation((color) => ({ color })),
    p50: 0.5
  };
});

jest.mock("@amcharts/amcharts5/map", () => {
  return {
    __esModule: true,
    MapChart: {
      new: jest.fn().mockImplementation(() => ({
        series: {
          push: jest.fn().mockImplementation((series) => series)
        },
        set: jest.fn(),
        appear: jest.fn(),
        goHome: jest.fn()
      }))
    },
    MapPolygonSeries: {
      new: jest.fn().mockImplementation(() => ({
        mapPolygons: {
          template: {
            setAll: jest.fn()
          }
        },
        events: {
          on: jest.fn().mockImplementation((event, callback) => {
            if (event === "datavalidated") {
              callback();
            }
          })
        }
      }))
    },
    ClusteredPointSeries: {
      new: jest.fn().mockImplementation(() => ({
        set: jest.fn(),
        bullets: {
          push: jest.fn()
        },
        data: {
          push: jest.fn()
        },
        zoomToCluster: jest.fn()
      }))
    },
    ZoomControl: {
      new: jest.fn().mockImplementation(() => ({
        homeButton: {
          set: jest.fn()
        }
      }))
    },
    geoMercator: jest.fn().mockReturnValue({})
  };
});

jest.mock("@amcharts/amcharts5/themes/Animated", () => {
  return {
    __esModule: true,
    default: {
      new: jest.fn().mockReturnValue({})
    }
  };
});

jest.mock("@amcharts/amcharts5-geodata/indonesiaLow", () => {
  return {
    __esModule: true,
    default: {}
  };
});

describe('MapChartService', () => {
  let mapService: MapChartService;
  const mockConfig: MapConfig = {
    zoomLevel: 5,
    centerPoint: { longitude: 120, latitude: -5 }
  };
  
  beforeEach(() => {
    // Create div for chart
    document.body.innerHTML = '<div id="chartdiv"></div>';
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Create new instance of MapChartService
    mapService = new MapChartService();
  });
  
  afterEach(() => {
    mapService.dispose();
  });
  
  test('initialize creates root and chart elements', () => {
    mapService.initialize('chartdiv', mockConfig);
    
    expect(am5.Root.new).toHaveBeenCalledWith('chartdiv');
    expect(am5map.MapChart.new).toHaveBeenCalled();
  });
  
  test('setupZoomControl adds zoom control to chart', () => {
    mapService.initialize('chartdiv', mockConfig);
    
    // Access private method through any type
    const setupZoomControlSpy = jest.spyOn(mapService as any, 'setupZoomControl');
    
    // Execute the private method
    (mapService as any).setupZoomControl();
    
    expect(setupZoomControlSpy).toHaveBeenCalled();
    expect(am5map.ZoomControl.new).toHaveBeenCalled();
  });
  
  test('setupPolygonSeries adds polygon series to chart', () => {
    mapService.initialize('chartdiv', mockConfig);
    
    // Access private method through any type
    const setupPolygonSeriesSpy = jest.spyOn(mapService as any, 'setupPolygonSeries');
    
    // Execute the private method
    (mapService as any).setupPolygonSeries();
    
    expect(setupPolygonSeriesSpy).toHaveBeenCalled();
    expect(am5map.MapPolygonSeries.new).toHaveBeenCalled();
  });
  
  test('setupPointSeries adds clustered point series to chart', () => {
    mapService.initialize('chartdiv', mockConfig);
    
    // Access private method through any type
    const setupPointSeriesSpy = jest.spyOn(mapService as any, 'setupPointSeries');
    
    // Execute the private method
    (mapService as any).setupPointSeries();
    
    expect(setupPointSeriesSpy).toHaveBeenCalled();
    expect(am5map.ClusteredPointSeries.new).toHaveBeenCalled();
  });
  
  test('populateLocations adds location data to point series', () => {
    const mockLocations: MapLocation[] = [
      { latitude: -6.2, longitude: 106.8, city: 'Jakarta', location: 'Jakarta Office' },
      { latitude: -7.8, longitude: 110.4, city: 'Yogyakarta', location: 'Yogyakarta Office' }
    ];
    
    mapService.initialize('chartdiv', mockConfig);
    mapService.populateLocations(mockLocations);
    
    // Since pointSeries is private, we need to get it creatively
    const pointSeries = (mapService as any).pointSeries;
    
    expect(pointSeries.data.push).toHaveBeenCalledTimes(2);
    expect(pointSeries.data.push).toHaveBeenCalledWith({
      geometry: { type: 'Point', coordinates: [106.8, -6.2] },
      city: 'Jakarta',
      location: 'Jakarta Office'
    });
    expect(pointSeries.data.push).toHaveBeenCalledWith({
      geometry: { type: 'Point', coordinates: [110.4, -7.8] },
      city: 'Yogyakarta',
      location: 'Yogyakarta Office'
    });
  });
  
  test('dispose cleans up resources', () => {
    mapService.initialize('chartdiv', mockConfig);
    mapService.dispose();
    
    // Get the root object that was created
    const root = (mapService as any).root;
    
    // Check that root is null after dispose
    expect(root).toBeNull();
  });
  
  test('setupClusterBullet configures cluster bullet correctly', () => {
    mapService.initialize('chartdiv', mockConfig);
    
    // Access private method through any type
    const setupClusterBulletSpy = jest.spyOn(mapService as any, 'setupClusterBullet');
    
    // Execute the private method
    (mapService as any).setupClusterBullet();
    
    expect(setupClusterBulletSpy).toHaveBeenCalled();
    
    const pointSeries = (mapService as any).pointSeries;
    expect(pointSeries.set).toHaveBeenCalledWith('clusteredBullet', expect.any(Function));
  });
  
  test('setupRegularBullet configures regular bullet correctly', () => {
    mapService.initialize('chartdiv', mockConfig);
    
    // Access private method through any type
    const setupRegularBulletSpy = jest.spyOn(mapService as any, 'setupRegularBullet');
    
    // Execute the private method
    (mapService as any).setupRegularBullet();
    
    expect(setupRegularBulletSpy).toHaveBeenCalled();
    
    const pointSeries = (mapService as any).pointSeries;
    expect(pointSeries.bullets.push).toHaveBeenCalled();
  });
});