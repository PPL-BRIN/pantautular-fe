module.exports = {
  Root: {
    new: jest.fn(() => {
      throw new Error("Mocked amCharts initialization error");
    }),
  },
  registry: { rootElements: [] },
  MapChart: { new: jest.fn(() => ({ set: jest.fn(), series: { push: jest.fn() } })) },
  MapPolygonSeries: { new: jest.fn(() => ({ setAll: jest.fn(), states: { create: jest.fn() } })) },
  ZoomControl: { new: jest.fn() },
  geoMercator: jest.fn(),

  // Mock for themes/Animated
  themes: {
    Animated: {},
  },

  // Mock for geodata
  geodata: {
    indonesiaLow: {},
  },
};