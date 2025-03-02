import { MapChartService } from './mapChartService';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import { MapConfig, MapLocation } from "../types";

// Mock for container.children.push
const mockChildrenPush = jest.fn();

// Mock for container.events.on
const mockEventsOn = jest.fn();

const mockBulletsPush = jest.fn();

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
            push: mockChildrenPush
          },
          events: {
            on: mockEventsOn
          }
        }))
      },
      Circle: {
        new: jest.fn().mockImplementation((root, config) => ({
          root,
          config,
          type: 'Circle'
        }))
      },
      Label: {
        new: jest.fn().mockImplementation((root, config) => ({
          root,
          config
        }))
      },
      Bullet: {
      new: jest.fn().mockImplementation((root, config) => ({
        root,
        sprite: config.sprite,
        type: 'Bullet',
        config,
      }))
    },
      color: jest.fn().mockImplementation((color) => ({ color })),
      p50: 0.5
    };
});

jest.mock("@amcharts/amcharts5/map", () => {
    const mockHomeButton = {
        set: jest.fn()
      };
      
    // Mock for the ZoomControl with the homeButton
    const mockZoomControl = {
     homeButton: mockHomeButton
    };
    
  return {
    __esModule: true,
    MapChart: {
      new: jest.fn().mockImplementation(() => ({
        series: {
          push: jest.fn().mockImplementation((series) => series)
        },
        set: jest.fn().mockImplementation((property, value) => {
            // When setting zoomControl, return the mockZoomControl
            if (property === "zoomControl") {
              return mockZoomControl;
            }
            return null;
          }),
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
          push: mockBulletsPush
        },
        data: {
          push: jest.fn()
        },
        zoomToCluster: jest.fn()
      }))
    },
    ZoomControl: {
        new: jest.fn().mockImplementation(() => mockZoomControl)
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
  
  test("setupZoomControl should return early if chart or root is null", () => {
    // Spy on the method to check if it executes fully
    const setupZoomControlSpy = jest.spyOn((mapService as any), "setupZoomControl");

    // Ensure chart and root are null
    (mapService as any).chart = null;
    (mapService as any).root = null;

    // Call the method
    (mapService as any).setupZoomControl();

    // Expect the spy to have been called, but nothing beyond the return statement executes
    expect(setupZoomControlSpy).toHaveReturned();
  });

  test('setupZoomControl adds zoom control to chart', () => {
    mapService.initialize('chartdiv', mockConfig);
    
    // Access private method through any type
    const setupZoomControlSpy = jest.spyOn(mapService as any, 'setupZoomControl');
    
    // Execute the private method
    (mapService as any).setupZoomControl();
    
    expect(setupZoomControlSpy).toHaveBeenCalled();
    expect(am5map.ZoomControl.new).toHaveBeenCalled();

    const zoomControlSet = am5map.ZoomControl.new((mapService as any).root, {}).homeButton?.set;
    
    // Verify it was called with the correct parameters
    expect(zoomControlSet).toHaveBeenCalledWith("visible", true);
  });
  
  test("setupPolygonSeries should return early if chart or root is null", () => {
    // Spy on the method to check if it executes fully
    const setupPolygonSeries = jest.spyOn((mapService as any), "setupPolygonSeries");

    // Ensure chart and root are null
    (mapService as any).chart = null;
    (mapService as any).root = null;

    // Call the method
    (mapService as any).setupPolygonSeries();

    // Expect the spy to have been called, but nothing beyond the return statement executes
    expect(setupPolygonSeries).toHaveReturned();
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
  
  test("setupPointSeries should return early if chart or root is null", () => {
    // Spy on the method to check if it executes fully
    const setupPointSeriesSpy = jest.spyOn((mapService as any), "setupPointSeries");

    // Ensure chart and root are null
    (mapService as any).chart = null;
    (mapService as any).root = null;

    // Call the method
    (mapService as any).setupPointSeries();

    // Expect the spy to have been called, but nothing beyond the return statement executes
    expect(setupPointSeriesSpy).toHaveReturned();
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
  
  test("populateLocations should return early if chart or root is null", () => {
    // Spy on the method to check if it executes fully
    const populateLocationsSpy = jest.spyOn((mapService as any), "populateLocations");

    // Ensure chart and root are null
    (mapService as any).pointSeries = null;

    // Call the method
    (mapService as any).populateLocations();

    // Expect the spy to have been called, but nothing beyond the return statement executes
    expect(populateLocationsSpy).toHaveReturned();
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
  
  test("setupClusterBullet should return early if chart or root is null", () => {
    // Spy on the method to check if it executes fully
    const setupClusterBulletSpy = jest.spyOn((mapService as any), "setupClusterBullet");

    // Ensure chart and root are null
    (mapService as any).chart = null;
    (mapService as any).root = null;

    // Call the method
    (mapService as any).setupClusterBullet();

    // Expect the spy to have been called, but nothing beyond the return statement executes
    expect(setupClusterBulletSpy).toHaveReturned();
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

    // Extract the factory function passed to set()
    const factoryFn = pointSeries.set.mock.calls.find(
        (call: string[]) => call[0] === 'clusteredBullet'
      )[1];
      
      // Create a mock root to pass to the factory function
      const mockRoot = {};
      
      // Call the factory function to test the container creation logic
      factoryFn(mockRoot);
      
      // Verify Container.new was called with correct params
      expect(am5.Container.new).toHaveBeenCalledWith(mockRoot, {
        cursorOverStyle: "pointer"
      });
      
      // Verify Circle.new was called multiple times with different radii
      expect(am5.Circle.new).toHaveBeenCalledTimes(3);
      expect(am5.Circle.new).toHaveBeenNthCalledWith(1, mockRoot, { 
        radius: 8, 
        tooltipY: 0, 
        fill: expect.anything() 
      });
      expect(am5.Circle.new).toHaveBeenNthCalledWith(2, mockRoot, { 
        radius: 12, 
        fillOpacity: 0.3, 
        tooltipY: 0, 
        fill: expect.anything() 
      });
      expect(am5.Circle.new).toHaveBeenNthCalledWith(3, mockRoot, { 
        radius: 16, 
        fillOpacity: 0.3, 
        tooltipY: 0, 
        fill: expect.anything() 
      });
      
      // Verify Label.new was called
      expect(am5.Label.new).toHaveBeenCalledWith(mockRoot, {
        centerX: am5.p50,
        centerY: am5.p50,
        fill: expect.anything(),
        populateText: true,
        fontSize: "8",
        text: "{value}"
      });
      
      // Verify children.push was called for each element (3 circles + 1 label)
      expect(mockChildrenPush).toHaveBeenCalledTimes(4);
      
      // Verify events.on was called with 'click'
      expect(mockEventsOn).toHaveBeenCalledWith('click', expect.any(Function));
      
      // Verify Bullet.new was called and returned
      expect(am5.Bullet.new).toHaveBeenCalledWith(mockRoot, {
        sprite: expect.anything()
      });
  });

  test('click handler on cluster bullet calls zoomToCluster', () => {
    // Initialize the map
    mapService.initialize('chartdiv', mockConfig);
    
    // Setup to access the click handler
    const pointSeries = (mapService as any).pointSeries;
    const factoryFn = pointSeries.set.mock.calls.find(
        (call: string[]) => call[0] === 'clusteredBullet'
    )[1];
    
    // Call the factory function
    factoryFn({});
    
    // Get the click handler
    const clickHandler = mockEventsOn.mock.calls.find(
      call => call[0] === 'click'
    )[1];
    
    // Create a mock event with target and dataItem
    const mockEvent = {
      target: {
        dataItem: { id: 'test-cluster' }
      }
    };
    
    // Execute the click handler
    clickHandler(mockEvent);
    
    // Verify zoomToCluster was called with the dataItem
    expect(pointSeries.zoomToCluster).toHaveBeenCalledWith(mockEvent.target.dataItem);
  });

  test("setupRegularBullet should return early if chart or root is null", () => {
    // Spy on the method to check if it executes fully
    const setupRegularBulletSpy = jest.spyOn((mapService as any), "setupRegularBullet");

    // Ensure chart and root are null
    (mapService as any).chart = null;
    (mapService as any).root = null;

    // Call the method
    (mapService as any).setupRegularBullet();

    // Expect the spy to have been called, but nothing beyond the return statement executes
    expect(setupRegularBulletSpy).toHaveReturned();
  });
  
  test('setupRegularBullet configures regular bullet correctly', () => {
    // Initialize the map
    mapService.initialize('chartdiv', mockConfig);
    
    // Directly call setupRegularBullet to test it
    (mapService as any).setupRegularBullet();
    
    // Verify bullets.push was called
    expect(mockBulletsPush).toHaveBeenCalled();
    
    // Extract the factory function passed to bullets.push
    const bulletFactory = mockBulletsPush.mock.calls[0][0];
    expect(typeof bulletFactory).toBe('function');
    
    // Call the factory function to test the bullet creation
    const createdBullet = bulletFactory();
    
    // Verify Circle.new was called with correct parameters
    expect(am5.Circle.new).toHaveBeenCalledWith(expect.anything(), {
      radius: 6,
      tooltipY: 0,
      fill: expect.anything(),
      cursorOverStyle: "pointer",
      showTooltipOn: "click",
      tooltipHTML: expect.stringContaining("<strong>{location}</strong>")
    });
    
    // Verify Bullet.new was called with the circle as sprite
    expect(am5.Bullet.new).toHaveBeenCalledWith(expect.anything(), {
      sprite: expect.anything()
    });
    
    // Verify the returned object is a Bullet
    expect(createdBullet).toHaveProperty('type', 'Bullet');
  });
});