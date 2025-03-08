"use client";

import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";

interface LocationData {
  id: string;
  city: string;
  location__latitude: number;
  location__longitude: number;
}

interface CaseLocationPointsProps {
  chart: am5map.MapChart | null;
  root: am5.Root | null;
  locations: LocationData[];
}

const CaseLocationPoints: React.FC<CaseLocationPointsProps> = ({ chart, root, locations }) => {
  useEffect(() => {
    if (!chart || !root || locations.length === 0) return;

    // Hapus point series yang mungkin sudah ada sebelumnya
    chart.series.each((series) => {
      if (series.constructor?.name === "MapPointSeries") {
        chart.series.removeIndex(chart.series.indexOf(series));
      }
    });

    // Buat point series baru
    const pointSeries = am5map.MapPointSeries.new(root, {});
   
    // Konfigurasi bullet untuk point series
    pointSeries.bullets.push(() => {
      if (!root || !am5 || !am5.Bullet || !am5.Bullet.new) {
        console.log("Missing required objects or methods");
        return undefined;
      }

      const container = am5.Container.new(root, {
        cursorOverStyle: "pointer"
      });

      container.children.push(am5.Circle.new(root, {
        radius: 15,
        tooltipY: 0,
        fill: am5.color(0xff0000),
        fillOpacity: 0.6,
        strokeWidth: 2,
        stroke: am5.color(0xff0000)
      }));

      return am5.Bullet.new(root, {
        sprite: container
      });
    });

    // Tambahkan data lokasi ke point series
    pointSeries.data.setAll(
      locations.map((location) => ({
        geometry: { type: "Point", coordinates: [location.location__longitude, location.location__latitude] },
      }))
    );

    chart.series.push(pointSeries);

    // Cleanup function
    return () => {
      chart.series.each((series) => {
        if (series.constructor?.name === "MapPointSeries") {
          chart.series.removeIndex(chart.series.indexOf(series));
        }
      });
    };
  }, [chart, root, locations]);

  return null;
};


export default CaseLocationPoints;