import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPage from './page';

// Mock the dependencies
jest.mock("@amcharts/amcharts5", () => {
  const actualAm5 = jest.requireActual("@amcharts/amcharts5");
  return {
    ...actualAm5,
    Root: {
      new: jest.fn(() => ({
        setThemes: jest.fn(),
        container: {
          children: {
            push: jest.fn(), // Ensure this is mocked
          },
        },
        set: jest.fn(), // Ensure this is mocked
        dispose: jest.fn(),
      })),
    },
    registry: {
      rootElements: [],
    },
  };
});

const mockPush = jest.fn();
jest.mock("@amcharts/amcharts5/map", () => ({
  MapChart: {
    new: jest.fn(() => ({
      set: jest.fn(), // Ensure this is mocked
      series: { push: jest.fn() },
    })),
  },
  MapPolygonSeries: { new: jest.fn(() => ({})) },
  ZoomControl: {
    new: jest.fn(() => ({
      homeButton: {
        set: jest.fn(), // Ensure this is mocked
      },
    })),
  },
  geoMercator: jest.fn(),
}));



jest.mock("@amcharts/amcharts5-geodata/indonesiaLow", () => jest.fn());
jest.mock("@amcharts/amcharts5/themes/Animated", () => ({ new: jest.fn() }));


test('Should render the MapPage component without crashing', () => {
  render(<MapPage />);
  const mapContainer = screen.getByTestId('map-container');
  expect(mapContainer).toBeInTheDocument();
  expect(mapContainer).toHaveAttribute('id', 'chartdiv');
  expect(mapContainer).toHaveStyle({
    width: '100%',
    height: '550px',
  });
});
