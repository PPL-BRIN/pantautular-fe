// __mocks__/@amcharts/amcharts5/map.js

const mockMapChart = {
  new: jest.fn(() => ({
    set: jest.fn(),
    appear: jest.fn(),
    series: {
      push: jest.fn(() => ({
        bullets: { push: jest.fn() },
        events: { on: jest.fn() },
        mapPolygons: { template: { setAll: jest.fn() } },
        data: { push: jest.fn() },
        zoomToCluster: jest.fn(),
      })),
    },
    goHome: jest.fn(),
  })),
};

const mockZoomControl = {
  new: jest.fn(() => ({
    homeButton: {
      set: jest.fn()
    }
  }))
};

const mockMapPolygonSeries = {
  new: jest.fn(() => ({
    mapPolygons: {
      template: {
        setAll: jest.fn()
      }
    },
    events: {
      on: jest.fn((event, callback) => {
        if (event === 'datavalidated') callback();
      })
    }
  }))
};

const mockClusteredPointSeries = {
  new: jest.fn(() => ({
    set: jest.fn(),
    bullets: {
      push: jest.fn()
    },
    data: {
      push: jest.fn()
    },
    zoomToCluster: jest.fn()
  }))
};

// Export the mock components
const am5map = {
  MapChart: mockMapChart,
  ZoomControl: mockZoomControl,
  MapPolygonSeries: mockMapPolygonSeries,
  ClusteredPointSeries: mockClusteredPointSeries,
  geoMercator: jest.fn(() => ({}))
};

module.exports = am5map;