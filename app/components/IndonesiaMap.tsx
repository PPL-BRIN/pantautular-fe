"use client";

import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_indonesiaLow from "@amcharts/amcharts5-geodata/indonesiaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface IndonesiaMapProps {
  onError: (message: string) => void; // Callback untuk menangani error
}

export default function IndonesiaMap({ onError }: IndonesiaMapProps) {
  const chartRef = useRef<am5.Root | null>(null);

  useEffect(() => {
    console.log("MOUNTED: IndonesiaMap");
    console.log("Registry before mount:", am5.registry.rootElements);

    try {
      if (!chartRef.current) {
        console.log("Creating new amCharts Root instance...");
        const root = am5.Root.new("chartdiv");
        chartRef.current = root;
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(
          am5map.MapChart.new(root, {
            panX: "translateX",
            panY: "translateY",
            projection: am5map.geoMercator(),
            homeGeoPoint: { longitude: 118, latitude: -2 },
          })
        );

        if (!chart) throw new Error("Gagal membuat peta!");

        const polygonSeries = chart.series.push(
          am5map.MapPolygonSeries.new(root, {
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

        chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
        chart.chartContainer.get("background").events.on("click", () => {
          chart.goHome();
        });

        chart.appear(1000, 100);
        console.log("Registry after mount:", am5.registry.rootElements);
      }
    } catch (err) {
      console.error("Error loading map:", err);
      onError("Gagal memuat peta. Silakan coba lagi nanti.");
    }

    return () => {
      console.log("DISPOSE FUNCTION TRIGGERED", chartRef.current);

      if (chartRef.current) {
        console.log("Calling dispose() on Root...");
        chartRef.current.dispose();
        setTimeout(() => {
          console.log("Dispose called successfully, checking chartRef:", chartRef.current);
          chartRef.current = null;
          console.log("chartRef.current set to null");
        }, 1000);
      } else {
        console.log("chartRef.current is already null, skipping dispose()");
      }
    };
  }, []);

  return <div id="chartdiv" data-testid="chartdiv" style={{ width: "100%", height: "500px" }}></div>;
}
