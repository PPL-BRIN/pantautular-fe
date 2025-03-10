"use client";

import React, { useEffect, useRef, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_indonesiaLow from "@amcharts/amcharts5-geodata/indonesiaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useLocationHandlers } from "../../hooks/useLocationHandlers";
import { LocationError } from "../../services/LocationService";
import LocationButton from "./LocationButton";
import LocationErrorPopup from "./LocationErrorPopup";
import LocationPermissionPopup from "./LocationPermissionPopup";

interface IndonesiaMapProps {
  readonly onError: (message: string) => void;
}

interface MapProvider {
  initialize(containerId: string): void;
  zoomToLocation?(latitude: number, longitude: number): void;
}

class AmChartsMapProvider implements MapProvider {
  private root!: am5.Root;
  private chart!: am5map.MapChart;
  private pointSeries: any;
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
      this.createLocationMarker();
      this.addInteractivity();
    } catch (err) {
      this.onError("Gagal memuat peta. Silakan coba lagi.");
    }
  }

  public zoomToLocation(latitude: number, longitude: number): void {
    try {
      this.pointSeries.data.clear();
      this.pointSeries.data.push({
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        title: "Your Location"
      });

      this.chart.zoomToGeoPoint({ longitude, latitude }, 5, true);
    } catch (error) {
      console.error("Failed to zoom to location: ", error);
      throw error;
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
    ) as any;

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

  private createLocationMarker(): void {
    this.pointSeries = this.chart.series.push(
      am5map.MapPointSeries.new(this.root, {})
    ) as any;

    this.pointSeries.bullets.push(() =>
      am5.Bullet.new(this.root, {
        sprite: am5.Circle.new(this.root, {
          radius: 8,
          fill: am5.color(0x2196F3),
          strokeWidth: 2,
          stroke: am5.color(0xFFFFFF),
        }),
      })
    );

    this.pointSeries.bullets.push(() =>
      am5.Bullet.new(this.root, {
        sprite: am5.Circle.new(this.root, {
          radius: 12,
          fill: am5.color(0x2196F3),
          fillOpacity: 0.3,
        }),
      })
    );
  }

  private addInteractivity(): void {
    this.chart.set("zoomControl", am5map.ZoomControl.new(this.root, {}));
    this.chart.chartContainer.get("background")?.events.on("click", () => {
      this.chart.goHome();
    });
    this.chart.appear(1000, 100);
  }
}

export default function IndonesiaMap({ onError }: IndonesiaMapProps) {
  const chartRef = useRef<MapProvider | null>(null);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [locationError, setLocationError] = useState<LocationError | null>(null);
  const [, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { handleAllow, handleDeny } = useLocationHandlers(
    setShowPermissionPopup,
    setLocationError,
    (latitude, longitude) => {
      setLocation({ latitude, longitude }); // Simpan lokasi pengguna
      if (chartRef.current?.zoomToLocation) {
        chartRef.current.zoomToLocation(latitude, longitude);
      }
    },
    () => setLocationError({ type: "PERMISSION_DENIED", message: "Anda menolak izin lokasi." })
  );

  useEffect(() => {
    if (!chartRef.current) {
      chartRef.current = new AmChartsMapProvider(onError);
      chartRef.current.initialize("chartdiv");
    }
  }, [onError]);

  return (
    <div className="relative w-full">
      <div id="chartdiv" data-testid="chartdiv" style={{ width: "100%", height: "500px" }}></div>
      
      <LocationButton 
        onClick={() => setShowPermissionPopup(true)}
        className="absolute top-4 left-4 z-10"
        variant="default"
        size="md"
        aria-label="Temukan lokasi saya"
      />
      
      <LocationPermissionPopup 
        open={showPermissionPopup} 
        onClose={() => setShowPermissionPopup(false)} 
        onAllow={handleAllow} 
        onDeny={handleDeny} 
      />
      
      {locationError && (
        <LocationErrorPopup 
          open={!!locationError} 
          onOpenChange={() => setLocationError(null)} 
          errorType={locationError.type} 
        />
      )}
    </div>
  );
}
