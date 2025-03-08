import React from "react";
import { render } from "@testing-library/react";
import CaseLocationPoints from "../../app/components/CaseLocationPoints";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";

// First, declare all mock objects
const MockContainer = {
  new: jest.fn(() => {
    console.log("✅ MockContainer.new() dipanggil!");
    return {
      children: { push: jest.fn() }
    };
  })
};

const MockCircle = {
  new: jest.fn(() => {
    console.log("✅ MockCircle.new() dipanggil!");
    return {};
  })
};

const MockBullet = {
  new: jest.fn(() => {
    console.log("✅ MockBullet.new() dipanggil!");
    return {};
  })
};

// **Mock Root object**
const MockRoot = {
  new: jest.fn(() => ({}))
};

// THEN use the mocks in jest.mock
jest.mock("@amcharts/amcharts5", () => ({
  Root: MockRoot,
  Container: MockContainer,
  Circle: MockCircle,
  Bullet: MockBullet,
  color: jest.fn(() => ({
    toCSS: jest.fn(() => "#ff0000"),
  })),
}));

jest.mock("@amcharts/amcharts5/map", () => {
  const MockMapPointSeries = {
    new: jest.fn(() => {
      console.log("✅ MapPointSeries.new() dipanggil!");
      return {
        bullets: {
          push: jest.fn((callback) => {
            console.log("✅ bullets.push() dipanggil!");
            return callback ? callback() : undefined;
          }),
        },
        data: { setAll: jest.fn() }
      };
    })
  };

  return {
    MapChart: jest.fn(() => ({
      series: {
        each: jest.fn(),
        push: jest.fn(),
        removeIndex: jest.fn(),
        indexOf: jest.fn(() => 0),
      },
    })),
    MapPointSeries: MockMapPointSeries
  };
});

describe("CaseLocationPoints Component", () => {
  let mockChart: am5map.MapChart;
  let mockRoot: am5.Root;
  let mockSeries: any;

  beforeEach(() => {
    mockSeries = {
      constructor: { name: "MapPointSeries" },
      bullets: { push: jest.fn((callback) => callback && callback()) },
      data: { setAll: jest.fn() },
    };

    mockChart = {
      series: {
        each: jest.fn((callback) => {
          callback(mockSeries);
        }),
        push: jest.fn(),
        removeIndex: jest.fn(),
        indexOf: jest.fn().mockReturnValue(0),
      },
    } as unknown as am5map.MapChart;

    mockRoot = MockRoot.new() as unknown as am5.Root;
  });
  
  test("Harus menghapus data lama sebelum menambahkan data baru", () => {
    const mockLocations = [
      { id: "1", city: "Jakarta", location__latitude: -6.2, location__longitude: 106.8 },
    ];

    render(<CaseLocationPoints chart={mockChart} root={mockRoot} locations={mockLocations} />);
    render(<CaseLocationPoints chart={mockChart} root={mockRoot} locations={[]} />);

    expect(mockChart.series.each).toHaveBeenCalled();
    expect(mockChart.series.removeIndex).toHaveBeenCalled();
  });

  test("Harus menangani kasus ketika chart tidak tersedia", () => {
    render(<CaseLocationPoints chart={null} root={mockRoot} locations={[]} />);

    expect(mockChart.series.push).not.toHaveBeenCalled();
  });

  test("Harus menangani kasus ketika locations kosong", () => {
    render(<CaseLocationPoints chart={mockChart} root={mockRoot} locations={[]} />);

    expect(mockChart.series.push).not.toHaveBeenCalled();
  });

  test("Harus membersihkan event listener saat unmount", () => {
    const { unmount } = render(
      <CaseLocationPoints
        chart={mockChart}
        root={mockRoot}
        locations={[{ id: "1", city: "Jakarta", location__latitude: -6.2, location__longitude: 106.8 }]}
      />
    );

    unmount();
    expect(mockChart.series.each).toHaveBeenCalled();
  });
});
