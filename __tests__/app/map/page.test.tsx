import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPage from '../../../app/map/page';

// Mock the dependencies
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
        children: {
          push: jest.fn()
        },
        events: {
          on: jest.fn()
        }
      }))
    },
    Circle: {
      new: jest.fn().mockImplementation(() => ({}))
    },
    Label: {
      new: jest.fn().mockImplementation(() => ({}))
    },
    Bullet: {
      new: jest.fn().mockImplementation(() => ({
        sprite: {}
      }))
    },
    color: jest.fn().mockImplementation((color) => ({ color })),
    p50: 0.5
  };
});

jest.mock("@amcharts/amcharts5/map", () => {
  return {
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

test('Should render the MapPage component without crashing', () => {
  render(<MapPage />);
  const mapContainer = screen.getByTestId('map-container');
  expect(mapContainer).toBeInTheDocument();
  expect(mapContainer).toHaveAttribute('id', 'chartdiv');
  expect(mapContainer).toHaveStyle({
    width: '100vw',
    height: '100vh',
  });
});
