module.exports = {
  Root: {
    new: () => ({
      container: { children: [] },
      dispose: jest.fn(),
    }),
  },
  MapChart: {
    new: () => ({
      series: { push: jest.fn() },
    }),
  },
  MapPolygonSeries: {
    new: () => ({}),
  },
};
