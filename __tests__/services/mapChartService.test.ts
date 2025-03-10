import { MapChartService } from '../../services/mapChartService';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import { MapConfig, MapLocation } from "../../types";


const mockChildrenPush = jest.fn();
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

  test('initialize applies correct chart settings', () => {
    // Setup
    const customConfig: MapConfig = {
      zoomLevel: 10,
      centerPoint: { longitude: 130, latitude: -8 }
    };
    
    // Execute
    mapService.initialize('chartdiv', customConfig);
    
    // Verify
    expect(am5map.MapChart.new).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      homeZoomLevel: 10,
      homeGeoPoint: { longitude: 130, latitude: -8 }
    }));
  });
  
  test('initialize applies animated theme', () => {
    // Execute
    mapService.initialize('chartdiv', mockConfig);
    
    // Verify
    const root = (mapService as any).root;
    expect(root.setThemes).toHaveBeenCalled();
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
    // Execute
    mapService.initialize('chartdiv', mockConfig);
    
    // Verify that ZoomControl was created during initialization
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

    // Check for scatter attributes to compensate overlap bullets
    expect(am5map.ClusteredPointSeries.new).toHaveBeenCalledWith(expect.anything(), {
        groupIdField: "city",
        minDistance: expect.anything(),
        scatterDistance: expect.anything(),
        scatterRadius: expect.anything(),
        stopClusterZoom: expect.anything()
      });
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
      { location__latitude: -6.2, location__longitude: 106.8, city: 'Jakarta', id: expect.anything() },
      { location__latitude: -7.8, location__longitude: 110.4, city: 'Yogyakarta', id: expect.anything() }
    ];
    
    mapService.initialize('chartdiv', mockConfig);
    mapService.populateLocations(mockLocations);
    
    // Since pointSeries is private, we need to get it creatively
    const pointSeries = (mapService as any).pointSeries;
    
    expect(pointSeries.data.push).toHaveBeenCalledTimes(2);
    expect(pointSeries.data.push).toHaveBeenCalledWith({
      geometry: { type: 'Point', coordinates: [106.8, -6.2] },
      city: 'Jakarta',
      id: expect.anything()
    });
    expect(pointSeries.data.push).toHaveBeenCalledWith({
      geometry: { type: 'Point', coordinates: [110.4, -7.8] },
      city: 'Yogyakarta',
      id: expect.anything()
    });
  });

  test('populateLocations with invalid data should not break chart', () => {
    // Setup
    mapService.initialize('chartdiv', mockConfig);
    const pointSeries = (mapService as any).pointSeries;

    // Execute with invalid data (null values)
    const invalidLocations = [
    { latitude: null, longitude: 106.8, city: 'Jakarta', location: 'Jakarta Office' },
    { latitude: -6.2, longitude: null, city: 'Invalid', location: 'Invalid Office' },
    { latitude: -6.2, longitude: 106.8, city: null, location: 'No City' }
    ];

    // @ts-ignore - intentionally passing invalid data for test
    mapService.populateLocations(invalidLocations);

    // Verify the chart still functions after receiving invalid data
    // This would be testing that it silently fails rather than throwing exceptions
    expect(pointSeries.data.push).toHaveBeenCalled();

    // You might also verify that valid entries in the array were still processed
    expect(pointSeries.data.push).toHaveBeenCalledWith(expect.objectContaining({
    geometry: { type: 'Point', coordinates: expect.anything() }
    }));
  });

  test('populateLocations with empty array should not cause errors', () => {
    // Setup
    mapService.initialize('chartdiv', mockConfig);
    
    // Execute
    mapService.populateLocations([]);
    
    // Verify no errors - test passes if no exception thrown
    expect((mapService as any).pointSeries.data.push).not.toHaveBeenCalled();
  });
  
  test('populateLocations with extreme coordinate values should work correctly', () => {
    // Setup
    const extremeLocations: MapLocation[] = [
      { location__latitude: 90, location__longitude: 180, city: 'Edge', id: expect.anything() },
      { location__latitude: -90, location__longitude: -180, city: 'Other Edge', id: expect.anything()}
    ];
    
    mapService.initialize('chartdiv', mockConfig);
    
    // Execute
    mapService.populateLocations(extremeLocations);
    
    // Verify coordinates are passed correctly
    expect((mapService as any).pointSeries.data.push).toHaveBeenCalledWith({
      geometry: { type: 'Point', coordinates: [180, 90] },
      city: 'Edge',
      id: expect.anything()
    });
  });
  
  test('chart handles extreme zoom levels', () => {
    // Setup
    const extremeZoomConfig: MapConfig = {
      zoomLevel: 100, // Very high zoom level
      centerPoint: { longitude: 120, latitude: -5 }
    };
    
    // Execute
    mapService.initialize('chartdiv', extremeZoomConfig);
    
    // Verify chart is created successfully with this zoom level
    expect(am5map.MapChart.new).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      homeZoomLevel: 100
    }));
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
        radius: expect.anything(), 
        tooltipY: expect.anything(), 
        fill: expect.anything() 
      });
      expect(am5.Circle.new).toHaveBeenNthCalledWith(2, mockRoot, { 
        radius: expect.anything(), 
        fillOpacity: expect.anything(), 
        tooltipY: expect.anything(), 
        fill: expect.anything() 
      });
      expect(am5.Circle.new).toHaveBeenNthCalledWith(3, mockRoot, { 
        radius: expect.anything(), 
        fillOpacity: expect.anything(), 
        tooltipY: expect.anything(), 
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
      tooltipHTML: expect.anything()
    });
    
    // Verify Bullet.new was called with the circle as sprite
    expect(am5.Bullet.new).toHaveBeenCalledWith(expect.anything(), {
      sprite: expect.anything()
    });
    
    // Verify the returned object is a Bullet
    expect(createdBullet).toHaveProperty('type', 'Bullet');
  });

  // Test untuk baris 42-43 (error handling di initialize)
test('initialize handles container not found error', () => {
  // Mock untuk document.getElementById yang mengembalikan null
  jest.spyOn(document, 'getElementById').mockReturnValueOnce(null);
  
  // Mock untuk fungsi onError
  const mockOnError = jest.fn();
  mapService = new MapChartService(mockOnError);
  
  // Panggil initialize dengan id yang tidak ada
  mapService.initialize('non-existent-id', mockConfig);
  
  // Verifikasi onError dipanggil dengan pesan kesalahan yang tepat
  expect(mockOnError).toHaveBeenCalledWith("Failed to load the map. Please try again.");
});

// Test untuk baris 73-74 (error handling di setupPolygonSeries)
test('setupPolygonSeries handles error', () => {
  // Setup
  const mockOnError = jest.fn();
  mapService = new MapChartService(mockOnError);
  
  // Initialize map
  mapService.initialize('chartdiv', mockConfig);
  
  // Mock am5map.MapPolygonSeries.new untuk melempar error
  const originalMapPolygonSeries = am5map.MapPolygonSeries.new;
  am5map.MapPolygonSeries.new = jest.fn().mockImplementationOnce(() => {
    throw new Error('Test polygon series error');
  });
  
  // Panggil method privat setupPolygonSeries
  (mapService as any).setupPolygonSeries();
  
  // Verifikasi onError dipanggil
  expect(mockOnError).toHaveBeenCalledWith("Error setting up map polygons.");
  
  // Pulihkan mock
  am5map.MapPolygonSeries.new = originalMapPolygonSeries;
});

// Test untuk baris 95-96 (error handling di setupPointSeries)
test('setupPointSeries handles error', () => {
  // Setup
  const mockOnError = jest.fn();
  mapService = new MapChartService(mockOnError);
  
  // Initialize map
  mapService.initialize('chartdiv', mockConfig);
  
  // Mock am5map.ClusteredPointSeries.new untuk melempar error
  const originalClusteredPointSeries = am5map.ClusteredPointSeries.new;
  am5map.ClusteredPointSeries.new = jest.fn().mockImplementationOnce(() => {
    throw new Error('Test point series error');
  });
  
  // Panggil method privat setupPointSeries
  (mapService as any).setupPointSeries();
  
  // Verifikasi onError dipanggil
  expect(mockOnError).toHaveBeenCalledWith("Error setting up map points.");
  
  // Pulihkan mock
  am5map.ClusteredPointSeries.new = originalClusteredPointSeries;
});

// Test untuk baris 197 (error handling di populateLocations)
test('populateLocations handles error', () => {
  // Setup
  mapService.initialize('chartdiv', mockConfig);
  
  // Mock point series data push untuk melempar error
  const pointSeries = (mapService as any).pointSeries;
  const originalDataPush = pointSeries.data.push;
  pointSeries.data.push = jest.fn().mockImplementationOnce(() => {
    throw new Error('Test populate locations error');
  });
  
  // Spy console.error
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  
  const mockLocations: MapLocation[] = [
    { location__latitude: -6.2, location__longitude: 106.8, city: 'Jakarta', id: '1' }
  ];
  
  // Panggil populateLocations
  mapService.populateLocations(mockLocations);
  
  // Verifikasi console.error dipanggil
  expect(consoleSpy).toHaveBeenCalledWith(
    'Error populating locations:',
    expect.any(Error)
  );
  
  // Pulihkan mock
  pointSeries.data.push = originalDataPush;
  consoleSpy.mockRestore();
});

  // Test untuk baris 141 (error handling di setupClusterBullet)
  test("setupClusterBullet handles error", () => {
    // Setup
    const mockOnError = jest.fn();
    mapService = new MapChartService(mockOnError);
  
    // Initialize map
    mapService.initialize("chartdiv", mockConfig);
  
    // Mock `pointSeries` untuk melempar error
    const pointSeries = (mapService as any).pointSeries;
    const originalSet = pointSeries.set;
    pointSeries.set = jest.fn().mockImplementationOnce(() => {
      throw new Error("Test cluster bullet error");
    });
  
    // Spy console.error untuk menangkap error logging
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
  
    // Panggil method setupClusterBullet
    (mapService as any).setupClusterBullet();
  
    // Verifikasi bahwa `console.error` dipanggil
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error setting up cluster bullet:",
      expect.any(Error)
    );
  
    // Verifikasi bahwa `onError` dipanggil dengan pesan yang benar
    expect(mockOnError).toHaveBeenCalledWith("Error setting up cluster bullet.");
  
    // Pulihkan mock
    pointSeries.set = originalSet;
    consoleSpy.mockRestore();
  });
  

// Test untuk baris 175 (error handling di setupRegularBullet)
test("setupRegularBullet handles error", () => {
  // Setup
  const mockOnError = jest.fn();
  mapService = new MapChartService(mockOnError);

  // Initialize map
  mapService.initialize("chartdiv", mockConfig);

  // Mock bullets.push untuk melempar error
  const pointSeries = (mapService as any).pointSeries;
  const originalBulletsPush = pointSeries.bullets.push;
  pointSeries.bullets.push = jest.fn().mockImplementationOnce(() => {
    throw new Error("Test regular bullet error");
  });

  // Spy console.error untuk menangkap error logging
  const consoleSpy = jest.spyOn(console, "error").mockImplementation();

  // Panggil method setupRegularBullet
  (mapService as any).setupRegularBullet();

  // Verifikasi bahwa `console.error` dipanggil
  expect(consoleSpy).toHaveBeenCalledWith(
    "Error setting up regular bullet:",
    expect.any(Error)
  );

  // Verifikasi bahwa `onError` dipanggil dengan pesan yang benar
  expect(mockOnError).toHaveBeenCalledWith("Error setting up regular bullet.");

  // Pulihkan mock
  pointSeries.bullets.push = originalBulletsPush;
  consoleSpy.mockRestore();
});
});