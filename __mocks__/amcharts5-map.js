const createMock = (methods) => {
  const mock = {};
  methods.forEach((method) => {
    mock[method] = jest.fn();
  });
  return mock;
};

module.exports = {
  __esModule: true,
  MapChart: {
    new: jest.fn().mockImplementation(() => ({
      series: { push: jest.fn((series) => series) },
      ...createMock(["set", "appear", "goHome"]),
    })),
  },
  MapPolygonSeries: {
    new: jest.fn().mockImplementation(() => ({
      mapPolygons: { template: { setAll: jest.fn() } },
      events: {
        on: jest.fn((event, callback) => {
          if (event === "datavalidated") callback();
        }),
      },
    })),
  },
  ClusteredPointSeries: {
    new: jest.fn().mockImplementation(() => ({
      ...createMock(["set", "zoomToCluster"]),
      bullets: { push: jest.fn() },
      data: { push: jest.fn() },
    })),
  },
  ZoomControl: {
    new: jest.fn().mockImplementation(() => ({
      homeButton: { set: jest.fn() },
    })),
  },
  geoMercator: jest.fn().mockReturnValue({}),
};
