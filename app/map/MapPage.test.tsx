import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import MapPage from './page';
import * as am5 from "@amcharts/amcharts5";

// Mock the amcharts libraries
jest.mock('@amcharts/amcharts5', () => {
  const originalModule = jest.requireActual('@amcharts/amcharts5');
  return {
    __esModule: true,
    ...originalModule,
    Root: {
      new: jest.fn(() => ({
        setThemes: jest.fn(),
        container: {
          children: {
            push: jest.fn(() => ({
              set: jest.fn(),
              series: {
                push: jest.fn(() => ({
                  data: { push: jest.fn() },
                  events: { on: jest.fn() },
                  bullets: { push: jest.fn() },
                  mapPolygons: { template: { setAll: jest.fn() } },
                  zoomToCluster: jest.fn()
                }))
              },
              appear: jest.fn(),
              goHome: jest.fn()
            }))
          }
        },
        dispose: jest.fn()
      }))
    },
    p50: 0.5,
    color: jest.fn(() => 'mocked-color')
  };
});

jest.mock('@amcharts/amcharts5/map', () => ({
  __esModule: true,
  MapChart: {
    new: jest.fn(() => ({}))
  },
  MapPolygonSeries: {
    new: jest.fn(() => ({
      mapPolygons: { template: { setAll: jest.fn() } },
      events: { on: jest.fn() }
    }))
  },
  ClusteredPointSeries: {
    new: jest.fn(() => ({
      data: { push: jest.fn() },
      bullets: { push: jest.fn() },
      set: jest.fn()
    }))
  },
  ZoomControl: {
    new: jest.fn(() => ({
      homeButton: { set: jest.fn() }
    }))
  },
  geoMercator: jest.fn(() => ({}))
}));

jest.mock('@amcharts/amcharts5/themes/Animated', () => ({
  __esModule: true,
  default: {
    new: jest.fn()
  }
}));

jest.mock('@amcharts/amcharts5-geodata/indonesiaLow', () => ({
  __esModule: true,
  default: {}
}));

// Mock DOM element for chart container
window.HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 1000,
  height: 500,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  x: 0,
  y: 0,
  toJSON: jest.fn()
}));

describe('pageComponent', () => {
  // Cleanup after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the map container', () => {
    render(<MapPage />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();

  });

  test('initializes the map with correct settings', async () => {
    render(<MapPage />);

    // We need to wait as the chart initialization happens in useEffect
    await waitFor(() => {
      expect(am5.Root.new).toHaveBeenCalled();
    });
  });

  test('loads city data correctly', async () => {
    const { container } = render(<MapPage />);

    // Can't directly test internal data structure, but can check if rendering completes
    await waitFor(() => {
      expect(container.querySelector('#chartdiv')).toBeInTheDocument();
    });
  });
});