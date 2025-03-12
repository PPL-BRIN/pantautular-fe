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
      new: jest.fn().mockImplementation((root, config) => ({ root, config })),
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
        set: jest.fn().mockImplementation((prop, value) => (prop === "zoomControl" ? mockZoomControl : null)),
        appear: jest.fn(),
        goHome: jest.fn(),
      })),
    },
    MapPolygonSeries: {
      new: jest.fn().mockImplementation(() => ({
        mapPolygons: { template: { setAll: jest.fn() } },
        events: { on: jest.fn().mockImplementation((event, cb) => { if (event === "datavalidated") cb(); }) },
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

// Helper to override a method to throw an error once and return a restore function.
function overrideMethod(target: any, property: string, errorMsg: string): () => void {
  const original = target[property];
  target[property] = jest.fn().mockImplementationOnce(() => { throw new Error(errorMsg); });
  return () => { target[property] = original; };
}

// Helper for early-return tests.
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

// Helper for error-handling tests (with a small delay to allow async logging).
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

  // Initialization tests.
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
    expect((mapService as any).root.setThemes).toHaveBeenCalled();
  });

  test("initialize calls onError when container is not found", () => {
    const onErrorMock = jest.fn();
    const originalGetElementById = document.getElementById;
    document.getElementById = jest.fn().mockReturnValue(null);
    mapService = new MapChartService(onErrorMock);
    mapService.initialize("non-existent-id", mockConfig);
    expect(onErrorMock).toHaveBeenCalledWith("Failed to load the map. Please try again.");
    document.getElementById = originalGetElementById;
  });

  // Early-return tests.
  const earlyReturnCases = [
    { method: "setupZoomControl", nullProps: { chart: null, root: null } },
    { method: "setupPolygonSeries", nullProps: { chart: null, root: null } },
    { method: "setupPointSeries", nullProps: { chart: null, root: null } },
    { method: "populateLocations", nullProps: { pointSeries: null } },
    { method: "setupClusterBullet", nullProps: { chart: null, root: null } },
    { method: "setupRegularBullet", nullProps: { chart: null, root: null } },
  ];
  test.each(earlyReturnCases)(
    "$method returns early if specified properties are null",
    ({ method, nullProps }) => {
      testEarlyReturn(mapService, method, nullProps);
    }
  );

  // Functional tests.
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
    expect((mapService as any).root).toBeNull();
  });

  // Combined parameterized error-handling tests.
  const errorTestCases = [
    {
      name: "setupPolygonSeries",
      method: "setupPolygonSeries",
      override: () =>
        overrideMethod(am5map.MapPolygonSeries, "new", "Test polygon series error"),
      expectedConsole: "Error setting up polygon series:",
      expectedOnError: "Error setting up map polygons.",
      withOnError: true,
    },
    {
      name: "setupPointSeries",
      method: "setupPointSeries",
      override: () =>
        overrideMethod(am5map.ClusteredPointSeries, "new", "Test point series error"),
      expectedConsole: "Error setting up point series:",
      expectedOnError: "Error setting up map points.",
      withOnError: true,
    },
    {
      name: "populateLocations",
      method: "populateLocations",
      override: () =>
        overrideMethod((mapService as any).pointSeries.data, "push", "Test populate locations error"),
      expectedConsole: "Error populating locations:",
      withOnError: true,
    },
    {
      name: "setupClusterBullet",
      method: "setupClusterBullet",
      override: () =>
        overrideMethod((mapService as any).pointSeries, "set", "Test cluster bullet error"),
      expectedConsole: "Error setting up cluster bullet:",
      expectedOnError: "Error setting up cluster bullet.",
      withOnError: true,
    },
    {
      name: "setupRegularBullet",
      method: "setupRegularBullet",
      override: () =>
        overrideMethod((mapService as any).pointSeries.bullets, "push", "Test regular bullet error"),
      expectedConsole: "Error setting up regular bullet:",
      expectedOnError: "Error setting up regular bullet.",
      withOnError: true,
    },
    // Without onError.
    {
      name: "setupRegularBullet without onError",
      method: "setupRegularBullet",
      override: () =>
        overrideMethod((mapService as any).pointSeries.bullets, "push", "Test regular bullet error"),
      expectedConsole: "Error setting up regular bullet:",
      withOnError: false,
    },
    {
      name: "setupClusterBullet without onError",
      method: "setupClusterBullet",
      override: () =>
        overrideMethod((mapService as any).pointSeries, "set", "Test cluster bullet error"),
      expectedConsole: "Error setting up cluster bullet:",
      withOnError: false,
    },
    {
      name: "setupPointSeries without onError",
      method: "setupPointSeries",
      override: () =>
        overrideMethod((mapService as any).chart.series, "push", "Test point series error"),
      expectedConsole: "Error setting up point series:",
      withOnError: false,
    },
    {
      name: "setupPolygonSeries without onError",
      method: "setupPolygonSeries",
      override: () =>
        overrideMethod((mapService as any).chart.series, "push", "Test polygon series error"),
      expectedConsole: "Error setting up polygon series:",
      withOnError: false,
    },
    {
      name: "initialize without onError",
      method: "initialize",
      override: () => {
        const original = document.getElementById;
        document.getElementById = jest.fn().mockReturnValue(null);
        return () => { document.getElementById = original; };
      },
      expectedConsole: "Error initializing map:",
      withOnError: false,
    },
  ];

  test.each(errorTestCases)(
    "$name handles error (withOnError: $withOnError)",
    async ({ method, override, expectedConsole, expectedOnError, withOnError }) => {
      const onErrorMock = withOnError ? jest.fn() : undefined;
      mapService = withOnError ? new MapChartService(onErrorMock) : new MapChartService();
      mapService.initialize("chartdiv", mockConfig);
      const restore = override();
      const callMethod = method === "initialize" 
        ? () => (mapService as any)[method]("chartdiv", mockConfig)
        : () => (mapService as any)[method]();
      await expectErrorHandling(callMethod, expectedConsole, expectedOnError || null, 10, onErrorMock);
      restore();
    }
  );

  // Test to cover regular bullet creation branch in setupRegularBullet.
  test("setupRegularBullet creates a regular bullet", () => {
    // Set up fake root (with dummy dispose) and fake pointSeries with bullets.push spy.
    const fakeRoot = { dispose: jest.fn() } as any;
    const fakePointSeries = { bullets: { push: jest.fn() } } as any;
    (mapService as any).root = fakeRoot;
    (mapService as any).pointSeries = fakePointSeries;
    (mapService as any).setupRegularBullet();
    expect(fakePointSeries.bullets.push).toHaveBeenCalledTimes(1);
    const bulletFactory = fakePointSeries.bullets.push.mock.calls[0][0];
    const fakeCircle = {} as any;
    const fakeBullet = {} as any;
    const originalCircleNew = am5.Circle.new;
    const originalBulletNew = am5.Bullet.new;
    am5.Circle.new = jest.fn().mockReturnValue(fakeCircle);
    am5.Bullet.new = jest.fn().mockReturnValue(fakeBullet);
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
    am5.Circle.new = originalCircleNew;
    am5.Bullet.new = originalBulletNew;
  });

  test("setupClusterBullet covers container creation and click event", () => {
    const fakeRoot = { dispose: jest.fn() } as any;
    const zoomToClusterMock = jest.fn();
    const fakePointSeries = { set: jest.fn(), zoomToCluster: zoomToClusterMock } as any;
    (mapService as any).pointSeries = fakePointSeries;
    (mapService as any).root = fakeRoot;
    (mapService as any).setupClusterBullet();
    expect(fakePointSeries.set).toHaveBeenCalledWith("clusteredBullet", expect.any(Function));
    const clusterBulletFactory = fakePointSeries.set.mock.calls[0][1];
    const fakeContainer = {
      children: { push: jest.fn() },
      events: { on: jest.fn() },
    };
    const originalContainerNew = am5.Container.new;
    am5.Container.new = jest.fn().mockReturnValue(fakeContainer);
    const fakeCircle = {};
    const fakeLabel = {};
    const fakeBullet = {};
    const originalCircleNew = am5.Circle.new;
    const originalLabelNew = am5.Label.new;
    const originalBulletNew = am5.Bullet.new;
    am5.Circle.new = jest.fn().mockReturnValue(fakeCircle);
    am5.Label.new = jest.fn().mockReturnValue(fakeLabel);
    am5.Bullet.new = jest.fn().mockReturnValue(fakeBullet);
    const bullet = clusterBulletFactory(fakeRoot);
    expect(bullet).toBe(fakeBullet);
    expect(fakeContainer.children.push).toHaveBeenCalledTimes(4);
    expect(fakeContainer.events.on).toHaveBeenCalledWith("click", expect.any(Function));
    const clickCallback = fakeContainer.events.on.mock.calls[0][1];
    const fakeDataItem = { id: "test-cluster" };
    clickCallback({ target: { dataItem: fakeDataItem } });
    expect(zoomToClusterMock).toHaveBeenCalledWith(fakeDataItem);
    am5.Container.new = originalContainerNew;
    am5.Circle.new = originalCircleNew;
    am5.Label.new = originalLabelNew;
    am5.Bullet.new = originalBulletNew;
  });

  test("setupClusterBullet does not call zoomToCluster when dataItem is undefined", () => {
    // Arrange: set up fake root dan pointSeries.
    const fakeRoot = { dispose: jest.fn() } as any;
    const zoomToClusterMock = jest.fn();
    const fakePointSeries = { set: jest.fn(), zoomToCluster: zoomToClusterMock } as any;
    (mapService as any).pointSeries = fakePointSeries;
    (mapService as any).root = fakeRoot;
    (mapService as any).setupClusterBullet();
  
    // Ambil factory function untuk cluster bullet.
    const clusterBulletFactory = fakePointSeries.set.mock.calls[0][1];
  
    // Buat fake container dan bullet dengan type assertion to any
    const fakeContainer = {
      children: { push: jest.fn() },
      events: { on: jest.fn() },
    } as any;
    const containerNewSpy = jest.spyOn(am5.Container, "new").mockReturnValue(fakeContainer);
    
    const fakeBullet = {} as any;
    const circleNewSpy = jest.spyOn(am5.Circle, "new").mockReturnValue({} as any);
    const bulletNewSpy = jest.spyOn(am5.Bullet, "new").mockReturnValue(fakeBullet);
  
    // Act: Panggil factory sehingga event listener didaftarkan.
    clusterBulletFactory(fakeRoot);
    expect(fakeContainer.events.on).toHaveBeenCalledWith("click", expect.any(Function));
    const clickCallback = fakeContainer.events.on.mock.calls[0][1];
  
    // Simulasikan event klik tanpa dataItem.
    clickCallback({ target: {} });
  
    // Assert: pastikan zoomToCluster tidak terpanggil.
    expect(zoomToClusterMock).not.toHaveBeenCalled();
  
    // Clean up spies.
    containerNewSpy.mockRestore();
    circleNewSpy.mockRestore();
    bulletNewSpy.mockRestore();
  });  
});