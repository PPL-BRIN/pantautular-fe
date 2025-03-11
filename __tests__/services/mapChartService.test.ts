import { MapChartService } from "../../services/mapChartService";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import { MapConfig, MapLocation } from "../../types";

const mockChildrenPush = jest.fn();
const mockEventsOn = jest.fn();
const mockBulletsPush = jest.fn();

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
        children: { push: mockChildrenPush },
        events: { on: mockEventsOn }
      }))
    },
    Circle: {
      new: jest.fn().mockImplementation((root, config) => ({
        root,
        config,
        type: "Circle"
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
        type: "Bullet",
        config,
      }))
    },
    color: jest.fn().mockImplementation((color) => ({ color })),
    p50: 0.5
  };
});

jest.mock("@amcharts/amcharts5/map", () => {
  const mockHomeButton = { set: jest.fn() };
  const mockZoomControl = { homeButton: mockHomeButton };
  return {
    __esModule: true,
    MapChart: {
      new: jest.fn().mockImplementation(() => ({
        series: { push: jest.fn().mockImplementation((series) => series) },
        set: jest.fn().mockImplementation((property, value) => {
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
        mapPolygons: { template: { setAll: jest.fn() } },
        events: { on: jest.fn().mockImplementation((event, callback) => {
          if (event === "datavalidated") callback();
        }) }
      }))
    },
    ClusteredPointSeries: {
      new: jest.fn().mockImplementation(() => ({
        set: jest.fn(),
        bullets: { push: mockBulletsPush },
        data: { push: jest.fn() },
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

describe("MapChartService", () => {
  let mapService: MapChartService;
  const mockConfig: MapConfig = {
    zoomLevel: 5,
    centerPoint: { longitude: 120, latitude: -5 }
  };

  // Helper for early-return tests
  const testEarlyReturn = (
    methodName: string,
    nullProps: Partial<Record<string, any>> = { chart: null, root: null }
  ) => {
    const spy = jest.spyOn(mapService as any, methodName);
    Object.keys(nullProps).forEach((prop) => ((mapService as any)[prop] = nullProps[prop]));
    (mapService as any)[methodName]();
    expect(spy).toHaveReturned();
  };

  // Helper for error-handling tests with onError callback check
  async function expectErrorHandling(
    methodCall: () => void,
    expectedConsoleMsg: string,
    expectedOnErrorMsg: string | null = null,
    delay = 10,
    onErrorMock?: jest.Mock
  ) {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    methodCall();
    await new Promise((resolve) => setTimeout(resolve, delay));
    expect(consoleSpy).toHaveBeenCalledWith(expectedConsoleMsg, expect.any(Error));
    if (expectedOnErrorMsg && onErrorMock) {
      expect(onErrorMock).toHaveBeenCalledWith(expectedOnErrorMsg);
    }
    consoleSpy.mockRestore();
  }

  beforeEach(() => {
    document.body.innerHTML = '<div id="chartdiv"></div>';
    jest.clearAllMocks();
    mapService = new MapChartService();
  });

  afterEach(() => {
    mapService.dispose();
  });

  // Initialization tests
  test("initialize creates root and chart elements", () => {
    mapService.initialize("chartdiv", mockConfig);
    expect(am5.Root.new).toHaveBeenCalledWith("chartdiv");
    expect(am5map.MapChart.new).toHaveBeenCalled();
  });

  test("initialize applies correct chart settings", () => {
    const customConfig: MapConfig = {
      zoomLevel: 10,
      centerPoint: { longitude: 130, latitude: -8 }
    };
    mapService.initialize("chartdiv", customConfig);
    expect(am5map.MapChart.new).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        homeZoomLevel: 10,
        homeGeoPoint: { longitude: 130, latitude: -8 }
      })
    );
  });

  test("initialize applies animated theme", () => {
    mapService.initialize("chartdiv", mockConfig);
    const root = (mapService as any).root;
    expect(root.setThemes).toHaveBeenCalled();
  });

  // Early return tests
  test("setupZoomControl returns early if chart or root is null", () => {
    testEarlyReturn("setupZoomControl");
  });

  test("setupPolygonSeries returns early if chart or root is null", () => {
    testEarlyReturn("setupPolygonSeries");
  });

  test("setupPointSeries returns early if chart or root is null", () => {
    testEarlyReturn("setupPointSeries");
  });

  test("populateLocations returns early if pointSeries is null", () => {
    testEarlyReturn("populateLocations", { pointSeries: null });
  });

  test("setupClusterBullet returns early if chart or root is null", () => {
    testEarlyReturn("setupClusterBullet");
  });

  test("setupRegularBullet returns early if chart or root is null", () => {
    testEarlyReturn("setupRegularBullet");
  });

  // Functional tests
  test("setupZoomControl adds zoom control to chart", () => {
    mapService.initialize("chartdiv", mockConfig);
    expect(am5map.ZoomControl.new).toHaveBeenCalled();
    const zoomControlSet = am5map.ZoomControl.new((mapService as any).root, {}).homeButton?.set;
    expect(zoomControlSet).toHaveBeenCalledWith("visible", true);
  });

  test("setupPolygonSeries adds polygon series to chart", () => {
    mapService.initialize("chartdiv", mockConfig);
    const spy = jest.spyOn(mapService as any, "setupPolygonSeries");
    (mapService as any).setupPolygonSeries();
    expect(spy).toHaveBeenCalled();
    expect(am5map.MapPolygonSeries.new).toHaveBeenCalled();
  });

  test("setupPointSeries adds clustered point series to chart", () => {
    mapService.initialize("chartdiv", mockConfig);
    const spy = jest.spyOn(mapService as any, "setupPointSeries");
    (mapService as any).setupPointSeries();
    expect(spy).toHaveBeenCalled();
    expect(am5map.ClusteredPointSeries.new).toHaveBeenCalled();
    expect(am5map.ClusteredPointSeries.new).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        groupIdField: "city",
        minDistance: expect.anything(),
        scatterDistance: expect.anything(),
        scatterRadius: expect.anything(),
        stopClusterZoom: expect.anything()
      })
    );
  });

  test("populateLocations adds location data to point series", () => {
    const locations: MapLocation[] = [
      { location__latitude: -6.2, location__longitude: 106.8, city: "Jakarta", id: expect.anything() },
      { location__latitude: -7.8, location__longitude: 110.4, city: "Yogyakarta", id: expect.anything() }
    ];
    mapService.initialize("chartdiv", mockConfig);
    mapService.populateLocations(locations);
    const pointSeries = (mapService as any).pointSeries;
    expect(pointSeries.data.push).toHaveBeenCalledTimes(2);
    expect(pointSeries.data.push).toHaveBeenCalledWith({
      geometry: { type: "Point", coordinates: [106.8, -6.2] },
      city: "Jakarta",
      id: expect.anything()
    });
    expect(pointSeries.data.push).toHaveBeenCalledWith({
      geometry: { type: "Point", coordinates: [110.4, -7.8] },
      city: "Yogyakarta",
      id: expect.anything()
    });
  });

  test("populateLocations with empty array should not cause errors", () => {
    mapService.initialize("chartdiv", mockConfig);
    mapService.populateLocations([]);
    expect((mapService as any).pointSeries.data.push).not.toHaveBeenCalled();
  });

  test("chart handles extreme zoom levels", () => {
    const extremeZoomConfig: MapConfig = {
      zoomLevel: 100,
      centerPoint: { longitude: 120, latitude: -5 }
    };
    mapService.initialize("chartdiv", extremeZoomConfig);
    expect(am5map.MapChart.new).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ homeZoomLevel: 100 })
    );
  });

  test("dispose cleans up resources", () => {
    mapService.initialize("chartdiv", mockConfig);
    mapService.dispose();
    const root = (mapService as any).root;
    expect(root).toBeNull();
  });

  // Error handling tests with onError callback
  test("initialize handles container not found error", () => {
    jest.spyOn(document, "getElementById").mockReturnValueOnce(null);
    const mockOnError = jest.fn();
    mapService = new MapChartService(mockOnError);
    mapService.initialize("non-existent-id", mockConfig);
    expect(mockOnError).toHaveBeenCalledWith("Failed to load the map. Please try again.");
  });

  test("setupPolygonSeries handles error", async () => {
    const mockOnError = jest.fn();
    mapService = new MapChartService(mockOnError);
    mapService.initialize("chartdiv", mockConfig);
    const original = am5map.MapPolygonSeries.new;
    am5map.MapPolygonSeries.new = jest.fn().mockImplementationOnce(() => {
      throw new Error("Test polygon series error");
    });
    await expectErrorHandling(
      () => (mapService as any).setupPolygonSeries(),
      "Error setting up polygon series:",
      "Error setting up map polygons.",
      10,
      mockOnError
    );
    am5map.MapPolygonSeries.new = original;
  });

  test("setupPointSeries handles error", async () => {
    const mockOnError = jest.fn();
    mapService = new MapChartService(mockOnError);
    mapService.initialize("chartdiv", mockConfig);
    const original = am5map.ClusteredPointSeries.new;
    am5map.ClusteredPointSeries.new = jest.fn().mockImplementationOnce(() => {
      throw new Error("Test point series error");
    });
    await expectErrorHandling(
      () => (mapService as any).setupPointSeries(),
      "Error setting up point series:",
      "Error setting up map points.",
      10,
      mockOnError
    );
    am5map.ClusteredPointSeries.new = original;
  });

  test("populateLocations handles error", async () => {
    mapService.initialize("chartdiv", mockConfig);
    const pointSeries = (mapService as any).pointSeries;
    const originalPush = pointSeries.data.push;
    pointSeries.data.push = jest.fn().mockImplementationOnce(() => {
      throw new Error("Test populate locations error");
    });
    await expectErrorHandling(
      () => mapService.populateLocations([
        { location__latitude: -6.2, location__longitude: 106.8, city: "Jakarta", id: "1" }
      ]),
      "Error populating locations:"
    );
    pointSeries.data.push = originalPush;
  });

  test("setupClusterBullet handles error", async () => {
    const mockOnError = jest.fn();
    mapService = new MapChartService(mockOnError);
    // Force non-null root and pointSeries
    (mapService as any).root = { dispose: jest.fn(), setThemes: jest.fn(), container: { children: { push: jest.fn() } } };
    (mapService as any).pointSeries = {
      set: jest.fn((key, callback) => callback({})),
      bullets: { push: jest.fn() },
      data: { push: jest.fn() },
      zoomToCluster: jest.fn(),
    };
    const original = am5.Container.new;
    am5.Container.new = jest.fn().mockImplementation(() => {
      throw new Error("Test cluster bullet error");
    });
    await expectErrorHandling(
      () => (mapService as any).setupClusterBullet(),
      "Error setting up cluster bullet:",
      "Error setting up cluster bullet.",
      10,
      mockOnError
    );
    am5.Container.new = original;
  });

  test("setupRegularBullet handles error", async () => {
    const mockOnError = jest.fn();
    mapService = new MapChartService(mockOnError);
    // Force non-null root and pointSeries
    (mapService as any).root = { dispose: jest.fn(), setThemes: jest.fn(), container: { children: { push: jest.fn() } } };
    (mapService as any).pointSeries = {
      set: jest.fn((key, callback) => callback({})),
      bullets: { push: jest.fn((cb) => cb()) },
      data: { push: jest.fn() },
      zoomToCluster: jest.fn(),
    };
    const original = am5.Circle.new;
    am5.Circle.new = jest.fn().mockImplementation(() => {
      throw new Error("Test regular bullet error");
    });
    await expectErrorHandling(
      () => (mapService as any).setupRegularBullet(),
      "Error setting up regular bullet:",
      "Error setting up regular bullet.",
      10,
      mockOnError
    );
    am5.Circle.new = original;
  });

  // Error handling tests without onError callback
  test("setupRegularBullet handles error without onError callback", async () => {
    mapService = new MapChartService(); // No onError provided
    (mapService as any).root = { dispose: jest.fn(), setThemes: jest.fn(), container: { children: { push: jest.fn() } } };
    (mapService as any).pointSeries = {
      set: jest.fn((key, callback) => callback({})),
      bullets: { push: jest.fn((cb) => cb()) },
      data: { push: jest.fn() },
      zoomToCluster: jest.fn(),
    };
    const original = am5.Circle.new;
    am5.Circle.new = jest.fn().mockImplementation(() => {
      throw new Error("Test regular bullet error");
    });
    await expectErrorHandling(
      () => (mapService as any).setupRegularBullet(),
      "Error setting up regular bullet:"
    );
    am5.Circle.new = original;
  });

  test("setupClusterBullet handles error without onError callback", async () => {
    mapService = new MapChartService(); // No onError provided
    (mapService as any).root = { dispose: jest.fn(), setThemes: jest.fn(), container: { children: { push: jest.fn() } } };
    (mapService as any).pointSeries = { set: jest.fn((key, callback) => callback({})) };
    const original = am5.Container.new;
    am5.Container.new = jest.fn().mockImplementation(() => {
      throw new Error("Test cluster bullet error");
    });
    await expectErrorHandling(
      () => (mapService as any).setupClusterBullet(),
      "Error setting up cluster bullet:"
    );
    am5.Container.new = original;
  });

  test("setupPointSeries handles error without onError callback", () => {
    mapService = new MapChartService();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (mapService as any).root = { dispose: jest.fn(), setThemes: jest.fn(), container: { children: { push: jest.fn() } } };
    (mapService as any).chart = {
      series: {
        push: jest.fn().mockImplementation(() => {
          throw new Error("Test point series error");
        }),
      },
    };
    (mapService as any).setupPointSeries();
    expect(consoleSpy).toHaveBeenCalledWith("Error setting up point series:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test("setupPolygonSeries handles error without onError callback", () => {
    mapService = new MapChartService();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (mapService as any).root = { dispose: jest.fn(), setThemes: jest.fn(), container: { children: { push: jest.fn() } } };
    (mapService as any).chart = {
      series: {
        push: jest.fn().mockImplementation(() => {
          throw new Error("Test polygon series error");
        }),
      },
    };
    (mapService as any).setupPolygonSeries();
    expect(consoleSpy).toHaveBeenCalledWith("Error setting up polygon series:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test("initialize handles error without onError callback", () => {
    mapService = new MapChartService(); // No onError provided
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    document.getElementById = jest.fn().mockReturnValue(null);
    mapService.initialize("chartdiv", { zoomLevel: 5, centerPoint: { longitude: 120, latitude: -5 } });
    expect(consoleSpy).toHaveBeenCalledWith("Error initializing map:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test("setupClusterBullet covers container creation and click event", () => {
    // Setup valid root and pointSeries with a set method.
    const fakeRoot = { dispose: jest.fn() } as any;
    const zoomToClusterMock = jest.fn();
    const fakePointSeries = {
      set: jest.fn(),
      zoomToCluster: zoomToClusterMock,
    } as any;
    (mapService as any).pointSeries = fakePointSeries;
    (mapService as any).root = fakeRoot;
  
    // Call setupClusterBullet to register the clusteredBullet callback.
    (mapService as any).setupClusterBullet();
    expect(fakePointSeries.set).toHaveBeenCalledWith("clusteredBullet", expect.any(Function));
    
    // Retrieve the factory callback.
    const clusterBulletFactory = fakePointSeries.set.mock.calls[0][1];
  
    // Override am5.Container.new to simulate a container.
    const fakeContainer = {
      children: { push: jest.fn() },
      events: { on: jest.fn() },
    };
    const originalContainerNew = am5.Container.new;
    am5.Container.new = jest.fn().mockReturnValue(fakeContainer);
  
    // Override other am5 methods to simulate creation.
    const fakeCircle = {};
    const fakeLabel = {};
    const fakeBullet = {};
    const originalCircleNew = am5.Circle.new;
    const originalLabelNew = am5.Label.new;
    const originalBulletNew = am5.Bullet.new;
    am5.Circle.new = jest.fn().mockReturnValue(fakeCircle);
    am5.Label.new = jest.fn().mockReturnValue(fakeLabel);
    am5.Bullet.new = jest.fn().mockReturnValue(fakeBullet);
  
    // Invoke the factory callback with fakeRoot.
    const bullet = clusterBulletFactory(fakeRoot);
    expect(bullet).toBe(fakeBullet);
  
    // Verify that container.children.push was called four times.
    expect(fakeContainer.children.push).toHaveBeenCalledTimes(4);
  
    // Verify that a click event handler was attached.
    expect(fakeContainer.events.on).toHaveBeenCalledWith("click", expect.any(Function));
  
    // Simulate a click event.
    const clickCallback = fakeContainer.events.on.mock.calls[0][1];
    const fakeDataItem = { id: "test-cluster" };
    clickCallback({ target: { dataItem: fakeDataItem } });
    expect(zoomToClusterMock).toHaveBeenCalledWith(fakeDataItem);
  
    // Restore original implementations.
    am5.Container.new = originalContainerNew;
    am5.Circle.new = originalCircleNew;
    am5.Label.new = originalLabelNew;
    am5.Bullet.new = originalBulletNew;
  });
  
});