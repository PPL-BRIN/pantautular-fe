"use client";

import React, { useEffect, useRef, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_indonesiaLow from "@amcharts/amcharts5-geodata/indonesiaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import CaseLocationPoints from "./CaseLocationPoints";

interface LocationData {
  id: string;
  city: string;
  location__latitude: number;
  location__longitude: number;
}

interface IndonesiaMapProps {
  readonly onError: (message: string) => void;
  readonly locations?: LocationData[];
}

interface MapProvider {
  initialize(containerId: string): void;
  getChart(): am5map.MapChart;
  getRoot(): am5.Root;
}

class AmChartsMapProvider implements MapProvider {
  private root!: am5.Root;
  private chart!: am5map.MapChart;
  private onError: (message: string) => void;

  constructor(onError: (message: string) => void) {
    this.onError = onError;
  }

  initialize(containerId: string): void {
    try {
      this.root = am5.Root.new(containerId);
      this.root.setThemes([am5themes_Animated.new(this.root)]);
      this.chart = this.createMapChart();
      this.configureSeries();
      this.addInteractivity();
    } catch (err) {
      this.onError("Gagal memuat peta. Silakan coba lagi.");
    }
  }

  getChart(): am5map.MapChart {
    return this.chart;
  }

  getRoot(): am5.Root {
    return this.root;
  }

  private createMapChart(): am5map.MapChart {
    return this.root.container.children.push(
      am5map.MapChart.new(this.root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
        homeGeoPoint: { longitude: 118, latitude: -2 },
      })
    );
  }

  private configureSeries(): void {
    const polygonSeries = this.chart.series.push(
      am5map.MapPolygonSeries.new(this.root, {
        geoJSON: am5geodata_indonesiaLow,
        exclude: ["MY-12", "MY-13", "BN", "TL"],
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      toggleKey: "active",
      interactive: true,
      fill: am5.color(0xdddddd),
      strokeWidth: 0.5,
      stroke: am5.color(0x999999),
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0xbbbbbb),
    });
  }

  private addInteractivity(): void {
    this.chart.set("zoomControl", am5map.ZoomControl.new(this.root, {}));
    this.chart.chartContainer.get("background").events.on("click", () => {
      this.chart.goHome();
    });
    this.chart.appear(1000, 100);
  }
}

export default function IndonesiaMap({ onError, locations = [] }: IndonesiaMapProps) {
  const chartRef = useRef<MapProvider | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!chartRef.current) {
      chartRef.current = new AmChartsMapProvider(onError);
      chartRef.current.initialize("chartdiv");
      setMapReady(true);
    }
  }, [onError]);

  return (
    <>
      <div id="chartdiv" data-testid="chartdiv" style={{ width: "100%", height: "500px" }}></div>
      {mapReady && chartRef.current && locations.length > 0 && (
        <CaseLocationPoints
          chart={chartRef.current.getChart()}
          root={chartRef.current.getRoot()}
          locations={locations}
        />
      )}
    </>
  );
}