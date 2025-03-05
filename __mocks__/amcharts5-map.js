module.exports = {
    __esModule: true,
    MapChart: {
      new: jest.fn().mockImplementation(() => ({
        series: {
          push: jest.fn().mockImplementation((series) => series)
        },
        set: jest.fn(),
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
          push: jest.fn()
        },
        data: {
          push: jest.fn()
        },
        zoomToCluster: jest.fn()
      }))
    },
    ZoomControl: {
      new: jest.fn().mockImplementation(() => ({
        homeButton: {
          set: jest.fn()
        }
      }))
    },
    geoMercator: jest.fn().mockReturnValue({})
  };
  