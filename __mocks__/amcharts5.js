module.exports = {
  Root: {
    new: jest.fn(() => ({
      setThemes: jest.fn(),
      container: { children: { push: jest.fn() } },
      set: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  registry: { rootElements: [] },
  MapChart: { new: jest.fn(() => ({ set: jest.fn(), series: { push: jest.fn() } })) },
  MapPolygonSeries: { new: jest.fn(() => ({ setAll: jest.fn(), states: { create: jest.fn() } })) },
  ZoomControl: { new: jest.fn() },
  geoMercator: jest.fn(),
};