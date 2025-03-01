// __mocks__/@amcharts/amcharts5/map.ts
export const MapChart = {
    new: jest.fn(() => ({
      set: jest.fn(() => ({})),
      series: {
        push: jest.fn(() => ({
          bullets: { push: jest.fn() },
          events: { on: jest.fn() },
          mapPolygons: { template: { setAll: jest.fn() } },
          data: { push: jest.fn() },
          set: jest.fn(),
          zoomToCluster: jest.fn(),
        })),
      },
      appear: jest.fn(),
      goHome: jest.fn(),
    })),
  };
  
  export const MapPolygonSeries = {
    new: jest.fn(() => ({
      mapPolygons: {
        template: {
          setAll: jest.fn(),
        }
      },
      events: {
        on: jest.fn((event, callback) => {
          if (event === 'datavalidated') {
            callback();
          }
        }),
      },
    })),
  };
  
  export const ClusteredPointSeries = {
    new: jest.fn(() => ({
      bullets: {
        push: jest.fn(),
      },
      data: {
        push: jest.fn(),
      },
      set: jest.fn(),
      zoomToCluster: jest.fn(),
    })),
  };
  
  export const ZoomControl = {
    new: jest.fn(() => ({
      homeButton: {
        set: jest.fn(),
      }
    })),
  };
  
  export const geoMercator = jest.fn();
  