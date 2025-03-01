// services/mapChartService.test.ts
import { MapChartService } from '../services/mapChartService';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import { MapLocation, MapConfig } from '../types';
import '@testing-library/jest-dom';

// Mock the modules
jest.mock('@amcharts/amcharts5');
jest.mock('@amcharts/amcharts5/map');
jest.mock('@amcharts/amcharts5-geodata/indonesiaLow', () => ({}));
jest.mock('@amcharts/amcharts5/themes/Animated', () => ({
  __esModule: true,
  default: { new: jest.fn() }
}));

describe('MapChartService', () => {
  let service: MapChartService;
  const mockConfig: MapConfig = {
    zoomLevel: 2,
    centerPoint: { longitude: 113, latitude: 0 }
  };
  
  const testLocations: MapLocation[] = [
    { city: "Test City", location: "Test Location", latitude: 1, longitude: 2 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MapChartService();
  });

  test('initialize should create root and chart', () => {
    service.initialize('test-container', mockConfig);
    expect(am5.Root.new).toHaveBeenCalledWith('test-container');
  });

  test('setupZoomControl should set up a zoom control when chart and root exist', () => {
    service.initialize('test-container', mockConfig);
    
    const setupZoomControl = (service as any).setupZoomControl.bind(service);
    setupZoomControl();
    
    expect((service as any).chart.set).toHaveBeenCalledWith('zoomControl', am5map.ZoomControl.new((service as any).root, {}));
    expect(am5map.ZoomControl.new((service as any).root, {}).homeButton.set).toHaveBeenCalledWith('visible', true);
  });
  
  test('setupPolygonSeries should set up polygon series when chart exists', () => {
    service.initialize('test-container', mockConfig);
    
    const setupPolygonSeries = (service as any).setupPolygonSeries.bind(service);
    setupPolygonSeries();
    
    expect(am5map.MapPolygonSeries.new).toHaveBeenCalled();
  });

  test('setupPointSeries should set up point series when chart exists', () => {
    service.initialize('test-container', mockConfig);
    
    const setupPointSeries = (service as any).setupPointSeries.bind(service);
    setupPointSeries();
    
    expect(am5map.ClusteredPointSeries.new).toHaveBeenCalled();
  });

  test('setupClusterBullet should set up cluster bullet when pointSeries exists', () => {
    service.initialize('test-container', mockConfig);
    
    // Setup pointSeries first
    const setupPointSeries = (service as any).setupPointSeries.bind(service);
    setupPointSeries();
    
    const setupClusterBullet = (service as any).setupClusterBullet.bind(service);
    setupClusterBullet();
    
    // Verify cluster bullet was set
    expect((service as any).pointSeries.set).toHaveBeenCalledWith('clusteredBullet', expect.any(Function));
  });

  test('setupRegularBullet should set up regular bullet when pointSeries exists', () => {
    service.initialize('test-container', mockConfig);
    
    // Setup pointSeries first
    const setupPointSeries = (service as any).setupPointSeries.bind(service);
    setupPointSeries();
    
    const setupRegularBullet = (service as any).setupRegularBullet.bind(service);
    setupRegularBullet();
    
    // Verify regular bullet was pushed
    expect((service as any).pointSeries.bullets.push).toHaveBeenCalled();
  });

  test('populateLocations should add locations to pointSeries', () => {
    service.initialize('test-container', mockConfig);
    
    // Setup pointSeries first
    const setupPointSeries = (service as any).setupPointSeries.bind(service);
    setupPointSeries();
    
    service.populateLocations(testLocations);
    
    // Verify data was pushed to pointSeries
    expect((service as any).pointSeries.data.push).toHaveBeenCalled();
  });

  test('dispose should clean up resources', () => {
    service.initialize('test-container', mockConfig);
    service.dispose();
    
    // Verify root was disposed
    expect((am5.Root.new('test-container') as any).dispose).toHaveBeenCalled();
  });

  // Test the no-op scenarios (early returns)
  test('setupZoomControl should do nothing when chart does not exist', () => {
    // Don't initialize first
    const setupZoomControl = (service as any).setupZoomControl.bind(service);
    setupZoomControl();
    
    // Verify ZoomControl was not created
    expect(am5map.ZoomControl.new).not.toHaveBeenCalled();
  });

  test('setupPolygonSeries should do nothing when chart does not exist', () => {
    const setupPolygonSeries = (service as any).setupPolygonSeries.bind(service);
    setupPolygonSeries();
    
    expect(am5map.MapPolygonSeries.new).not.toHaveBeenCalled();
  });

  test('setupPointSeries should do nothing when chart does not exist', () => {
    const setupPointSeries = (service as any).setupPointSeries.bind(service);
    setupPointSeries();
    
    expect(am5map.ClusteredPointSeries.new).not.toHaveBeenCalled();
  });

  test('setupClusterBullet should do nothing when pointSeries does not exist', () => {
    const setupClusterBullet = (service as any).setupClusterBullet.bind(service);
    setupClusterBullet();
    
    // Test would fail if it tried to access pointSeries.set
  });

  test('setupRegularBullet should do nothing when pointSeries does not exist', () => {
    const setupRegularBullet = (service as any).setupRegularBullet.bind(service);
    setupRegularBullet();
    
    // Test would fail if it tried to access pointSeries.bullets.push
  });

  test('populateLocations should do nothing when pointSeries does not exist', () => {
    service.populateLocations(testLocations);
    
    // No error should be thrown
  });

  test('dispose should do nothing when root does not exist', () => {
    service.dispose();
    
    // No error should be thrown
  });

  
 test('initialize should call all setup methods and animate chart', () => {
    const mockConfig: MapConfig = {
    zoomLevel: 2,
    centerPoint: { longitude: 113, latitude: 0 }
    };
    
    const spySetupZoomControl = jest.spyOn(service as any, 'setupZoomControl');
    const spySetupPolygonSeries = jest.spyOn(service as any, 'setupPolygonSeries');
    const spySetupPointSeries = jest.spyOn(service as any, 'setupPointSeries');
    
    service.initialize('test-container', mockConfig);
    
    expect(spySetupZoomControl).toHaveBeenCalled()
    expect(spySetupPolygonSeries).toHaveBeenCalled();
    expect(spySetupPointSeries).toHaveBeenCalled();
    expect((service as any).chart.appear).toHaveBeenCalledWith(1000, 100);
   });
});