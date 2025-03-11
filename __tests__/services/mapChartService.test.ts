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
            push: jest.fn().mockImplementation((chart) => chart),
          },
        },
        dispose: jest.fn(),
      })),
    },
    Container: {
      new: jest.fn().mockImplementation(() => ({
        children: { push: mockChildrenPush },
        events: { on: mockEventsOn },
      })),
    },
    Circle: {
      new: jest.fn().mockImplementation((root, config) => ({
        root,
        config,
        type: "Circle",
      })),
    },
    Label: {
      new: jest.fn().mockImplementation((root, config) => ({
        root,
        config,
      })),
    },
    Bullet: {
      new: jest.fn().mockImplementation((root, config) => ({
        root,
        sprite: config.sprite,
        type: "Bullet",
        config,
      })),
    },
    color: jest.fn().mockImplementation((color) => ({ color })),
    p50: 0.5,
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
          if (property === "zoomControl") return mockZoomControl;
          return null;
        }),
        appear: jest.fn(),
        goHome: jest.fn(),
      })),
    },
    MapPolygonSeries: {
      new: jest.fn().mockImplementation(() => ({
        mapPolygons: { template: { setAll: jest.fn() } },
        events: { on: jest.fn().mockImplementation((event, callback) => {
          if (event === "datavalidated") callback();
        }) },
      })),
    },
    ClusteredPointSeries: {
      new: jest.fn().mockImplementation(() => ({
        set: jest.fn(),
        bullets: { push: mockBulletsPush },
        data: { push: jest.fn() },
        zoomToCluster: jest.fn(),
      })),
    },
    ZoomControl: {
      new: jest.fn().mockImplementation(() => mockZoomControl),
    },
    geoMercator: jest.fn().mockReturnValue({}),
  };
});

jest.mock("@amcharts/amcharts5/themes/Animated", () => ({
  __esModule: true,
  default: { new: jest.fn().mockReturnValue({}) },
}));

jest.mock("@amcharts/amcharts5-geodata/indonesiaLow", () => ({
  __esModule: true,
  default: {},
}));

// Helper for early-return tests
const testEarlyReturn = (
  mapService: MapChartService,
  methodName: string,
  nullProps: Partial<Record<string, any>> = { chart: null, root: null }
) => {
  const spy = jest.spyOn(mapService as any, methodName);
  Object.keys(nullProps).forEach((prop) => ((mapService as any)[prop] = nullProps[prop]));
  (mapService as any)[methodName]();
  expect(spy).toHaveReturned();
};

// Helper for error-handling tests (with a small delay to allow async logging)
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

describe("MapChartService", () => {
  let mapService: MapChartService;
  const mockConfig: MapConfig = {
    zoomLevel: 5,
    centerPoint: { longitude: 120, latitude: -5 },
  };

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
      centerPoint: { longitude: 130, latitude: -8 },
    };
    mapService.initialize("chartdiv", customConfig);
    expect(am5map.MapChart.new).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        homeZoomLevel: 10,
        homeGeoPoint: { longitude: 130, latitude: -8 },
      })
    );
  });

  test("initialize applies animated theme", () => {
    mapService.initialize("chartdiv", mockConfig);
    const root = (mapService as any).root;
    expect(root.setThemes).toHaveBeenCalled();
  });

  // New test: simulate missing container with onError callback
  test("initialize calls onError when container is not found", () => {
    const onErrorMock = jest.fn();
    const originalGetElementById = document.getElementById;
    document.getElementById = jest.fn().mockReturnValue(null);
    mapService = new MapChartService(onErrorMock);
    mapService.initialize("non-existent-id", mockConfig);
    expect(onErrorMock).toHaveBeenCalledWith("Failed to load the map. Please try again.");
    document.getElementById = originalGetElementById;
  });

  // Early return tests for various methods
  test("setupZoomControl returns early if chart or root is null", () => {
    testEarlyReturn(mapService, "setupZoomControl");
  });
  test("setupPolygonSeries returns early if chart or root is null", () => {
    testEarlyReturn(mapService, "setupPolygonSeries");
  });
  test("setupPointSeries returns early if chart or root is null", () => {
    testEarlyReturn(mapService, "setupPointSeries");
  });
  test("populateLocations returns early if pointSeries is null", () => {
    testEarlyReturn(mapService, "populateLocations", { pointSeries: null });
  });
  test("setupClusterBullet returns early if chart or root is null", () => {
    testEarlyReturn(mapService, "setupClusterBullet");
  });
  test("setupRegularBullet returns early if chart or root is null", () => {
    testEarlyReturn(mapService, "setupRegularBullet");
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
        stopClusterZoom: expect.anything(),
      })
    );
  });

  test("populateLocations adds location data to point series", () => {
    const locations: MapLocation[] = [
      { location__latitude: -6.2, location__longitude: 106.8, city: "Jakarta", id: expect.anything() },
      { location__latitude: -7.8, location__longitude: 110.4, city: "Yogyakarta", id: expect.anything() },
    ];
    mapService.initialize("chartdiv", mockConfig);
    mapService.populateLocations(locations);
    const pointSeries = (mapService as any).pointSeries;
    expect(pointSeries.data.push).toHaveBeenCalledTimes(2);
    expect(pointSeries.data.push).toHaveBeenCalledWith({
      geometry: { type: "Point", coordinates: [106.8, -6.2] },
      city: "Jakarta",
      id: expect.anything(),
    });
    expect(pointSeries.data.push).toHaveBeenCalledWith({
      geometry: { type: "Point", coordinates: [110.4, -7.8] },
      city: "Yogyakarta",
      id: expect.anything(),
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
      centerPoint: { longitude: 120, latitude: -5 },
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

  // Parameterized error-handling tests with onError callback
  describe("Error handling with onError callback", () => {
    const onErrorMock = jest.fn();
    beforeEach(() => {
      mapService = new MapChartService(onErrorMock);
      mapService.initialize("chartdiv", mockConfig);
    });
    afterEach(() => {
      onErrorMock.mockClear();
    });

    const errorTestCases: Array<{
      name: string;
      method: string;
      override: () => () => void;
      expectedConsole: string;
      expectedOnError: string;
    }> = [
      {
        name: "setupPolygonSeries",
        method: "setupPolygonSeries",
        override: () => {
          const original = am5map.MapPolygonSeries.new;
          am5map.MapPolygonSeries.new = jest.fn().mockImplementationOnce(() => {
            throw new Error("Test polygon series error");
          });
          return () => (am5map.MapPolygonSeries.new = original);
        },
        expectedConsole: "Error setting up polygon series:",
        expectedOnError: "Error setting up map polygons.",
      },
      {
        name: "setupPointSeries",
        method: "setupPointSeries",
        override: () => {
          const original = am5map.ClusteredPointSeries.new;
          am5map.ClusteredPointSeries.new = jest.fn().mockImplementationOnce(() => {
            throw new Error("Test point series error");
          });
          return () => (am5map.ClusteredPointSeries.new = original);
        },
        expectedConsole: "Error setting up point series:",
        expectedOnError: "Error setting up map points.",
      },
      {
        name: "populateLocations",
        method: "populateLocations",
        override: () => {
          const pointSeries = (mapService as any).pointSeries;
          const original = pointSeries.data.push;
          pointSeries.data.push = jest.fn().mockImplementationOnce(() => {
            throw new Error("Test populate locations error");
          });
          return () => (pointSeries.data.push = original);
        },
        expectedConsole: "Error populating locations:",
        expectedOnError: "",
      },
      {
        name: "setupClusterBullet",
        method: "setupClusterBullet",
        override: () => {
          const original = (mapService as any).pointSeries.set;
          (mapService as any).pointSeries.set = jest.fn().mockImplementationOnce(() => {
            throw new Error("Test cluster bullet error");
          });
          return () => ((mapService as any).pointSeries.set = original);
        },
        expectedConsole: "Error setting up cluster bullet:",
        expectedOnError: "Error setting up cluster bullet.",
      },
      {
        name: "setupRegularBullet",
        method: "setupRegularBullet",
        override: () => {
          const original = (mapService as any).pointSeries.bullets.push;
          (mapService as any).pointSeries.bullets.push = jest.fn().mockImplementationOnce(() => {
            throw new Error("Test regular bullet error");
          });
          return () => ((mapService as any).pointSeries.bullets.push = original);
        },
        expectedConsole: "Error setting up regular bullet:",
        expectedOnError: "Error setting up regular bullet.",
      },
    ];

    test.each(errorTestCases)(
      "$name handles error",
      async ({ method, override, expectedConsole, expectedOnError }) => {
        const restore = override();
        await expectErrorHandling(
          () => (mapService as any)[method](),
          expectedConsole,
          expectedOnError || null,
          10,
          expectedOnError ? onErrorMock : undefined
        );
        restore();
      }
    );
  });

  // Parameterized error-handling tests without onError callback
  describe("Error handling without onError callback", () => {
    beforeEach(() => {
      mapService = new MapChartService();
      mapService.initialize("chartdiv", mockConfig);
    });

    const errorTestCasesNoOnError: Array<{
      name: string;
      method: string;
      override: () => () => void;
      expectedConsole: string;
    }> = [
      {
        name: "setupRegularBullet without onError",
        method: "setupRegularBullet",
        override: () => {
          const original = (mapService as any).pointSeries.bullets.push;
          (mapService as any).pointSeries.bullets.push = jest.fn().mockImplementationOnce(() => {
            throw new Error("Test regular bullet error");
          });
          return () => ((mapService as any).pointSeries.bullets.push = original);
        },
        expectedConsole: "Error setting up regular bullet:",
      },
      {
        name: "setupClusterBullet without onError",
        method: "setupClusterBullet",
        override: () => {
          const original = (mapService as any).pointSeries.set;
          (mapService as any).pointSeries.set = jest.fn().mockImplementationOnce(() => {
            throw new Error("Test cluster bullet error");
          });
          return () => ((mapService as any).pointSeries.set = original);
        },
        expectedConsole: "Error setting up cluster bullet:",
      },
      {
        name: "setupPointSeries without onError",
        method: "setupPointSeries",
        override: () => {
          const original = (mapService as any).chart.series.push;
          (mapService as any).chart.series.push = jest.fn().mockImplementation(() => {
            throw new Error("Test point series error");
          });
          return () => ((mapService as any).chart.series.push = original);
        },
        expectedConsole: "Error setting up point series:",
      },
      {
        name: "setupPolygonSeries without onError",
        method: "setupPolygonSeries",
        override: () => {
          const original = (mapService as any).chart.series.push;
          (mapService as any).chart.series.push = jest.fn().mockImplementation(() => {
            throw new Error("Test polygon series error");
          });
          return () => ((mapService as any).chart.series.push = original);
        },
        expectedConsole: "Error setting up polygon series:",
      },
      {
        name: "initialize without onError",
        method: "initialize",
        override: () => {
          const original = document.getElementById;
          document.getElementById = jest.fn().mockReturnValue(null);
          return () => (document.getElementById = original);
        },
        expectedConsole: "Error initializing map:",
      },
    ];

    test.each(errorTestCasesNoOnError)(
      "$name handles error without onError",
      async ({ method, override, expectedConsole }) => {
        const restore = override();
        await expectErrorHandling(
          () => (mapService as any)[method]("chartdiv", mockConfig),
          expectedConsole
        );
        restore();
      }
    );
  });

  // Test to cover the regular bullet creation branch in setupRegularBullet
  test("setupRegularBullet creates a regular bullet", () => {
    // Set up a fake root with a dummy dispose method and a fake pointSeries with a bullets.push spy.
    const fakeRoot = { dispose: jest.fn() } as any;
    const fakePointSeries = { bullets: { push: jest.fn() } } as any;
    (mapService as any).root = fakeRoot;
    (mapService as any).pointSeries = fakePointSeries;

    // Call setupRegularBullet.
    (mapService as any).setupRegularBullet();
    expect(fakePointSeries.bullets.push).toHaveBeenCalledTimes(1);
    const bulletFactory = fakePointSeries.bullets.push.mock.calls[0][0];

    // Override am5.Circle.new and am5.Bullet.new to simulate creation.
    const fakeCircle = {} as any;
    const fakeBullet = {} as any;
    const originalCircleNew = am5.Circle.new;
    const originalBulletNew = am5.Bullet.new;
    am5.Circle.new = jest.fn().mockReturnValue(fakeCircle);
    am5.Bullet.new = jest.fn().mockReturnValue(fakeBullet);

    // Call the bullet factory function.
    const bullet = bulletFactory();
    expect(am5.Circle.new).toHaveBeenCalledWith(fakeRoot, expect.objectContaining({
      radius: 6,
      tooltipY: 0,
      fill: expect.anything(),
      cursorOverStyle: "pointer",
      showTooltipOn: "click",
      tooltipHTML: expect.any(String),
    }));
    expect(am5.Bullet.new).toHaveBeenCalledWith(fakeRoot, { sprite: fakeCircle });
    expect(bullet).toBe(fakeBullet);

    // Restore originals.
    am5.Circle.new = originalCircleNew;
    am5.Bullet.new = originalBulletNew;
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
    expect(fakeContainer.children.push).toHaveBeenCalledTimes(4);
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