import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPage from '../../../app/map/page';

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
