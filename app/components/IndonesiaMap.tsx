"use client";

import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_indonesiaLow from "@amcharts/amcharts5-geodata/indonesiaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface IndonesiaMapProps {
  readonly onError: (message: string) => void;
}

class MapInitializer {
  private root: am5.Root;
  private chart: am5map.MapChart;

  constructor(private containerId: string, private onError: (message: string) => void) {
    try {
      this.root = am5.Root.new(this.containerId);
      this.root.setThemes([am5themes_Animated.new(this.root)]);
      this.chart = this.createMapChart();
      this.configureSeries();
      this.addInteractivity();
    } catch (err) {
      this.onError("Gagal memuat peta. Silakan coba lagi.");
    }
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

export default function IndonesiaMap({ onError }: IndonesiaMapProps) {
  const chartRef = useRef<MapInitializer | null>(null);

  useEffect(() => {
    if (!chartRef.current) {
      chartRef.current = new MapInitializer("chartdiv", onError);
    }
  }, []);

  return <div id="chartdiv" data-testid="chartdiv" style={{ width: "100%", height: "500px" }}></div>;
}
