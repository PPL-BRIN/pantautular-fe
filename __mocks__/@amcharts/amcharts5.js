const mockDispose = jest.fn();
const mockSetThemes = jest.fn();
const mockPush = jest.fn(() => ({
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
}));

const mockRoot = {
  setThemes: mockSetThemes,
  container: {
    children: {
      push: mockPush,
    }
  },
  dispose: mockDispose,
};

const am5 = {
  Root: {
    new: jest.fn(() => mockRoot),
  },
  Container: {
    new: jest.fn(() => ({
      children: {
        push: jest.fn(),
      },
      events: {
        on: jest.fn(),
      }
    })),
  },
  Circle: {
    new: jest.fn(() => ({})),
  },
  Label: {
    new: jest.fn(() => ({})),
  },
  Bullet: {
    new: jest.fn(() => ({})),
  },
  color: jest.fn(() => ({})),
  p50: 0.5,
  registry: {
    rootElements: [],
  },
};

export default am5;
