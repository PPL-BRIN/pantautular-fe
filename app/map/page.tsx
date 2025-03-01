"use client";

import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_indonesiaLow from "@amcharts/amcharts5-geodata/indonesiaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

export default function MapPage() {
  const chartRef = useRef<am5.Root | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new("chartdiv")
    chartRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "translateY",
        homeZoomLevel: 2,
        projection: am5map.geoMercator(),
        homeGeoPoint: { longitude: 113.9213, latitude: 0.7893 }
      })
    );

    if (!chart) return;

    let zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
    zoomControl.homeButton.set("visible", true);

    let polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_indonesiaLow,
        exclude: ["AQ"],
      })
    );

    polygonSeries.events.on("datavalidated", function() {
      chart.goHome();
    })

    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0xdadada),
    });

    let pointSeries = chart.series.push(
      am5map.ClusteredPointSeries.new(root, {
        groupIdField: "city",
      })
    );

    pointSeries.set("clusteredBullet", (root) => {
      let container = am5.Container.new(root, {
        cursorOverStyle: "pointer",
      });

      container.children.push(
        am5.Circle.new(root, { radius: 8, tooltipY: 0, fill: am5.color(0xff8c00) })
      );

      container.children.push(
        am5.Circle.new(root, { radius: 12, fillOpacity: 0.3, tooltipY: 0, fill: am5.color(0xff8c00) })
      );

      container.children.push(
        am5.Circle.new(root, { radius: 16, fillOpacity: 0.3, tooltipY: 0, fill: am5.color(0xff8c00) })
      );

      container.children.push(
        am5.Label.new(root, {
          centerX: am5.p50,
          centerY: am5.p50,
          fill: am5.color(0xffffff),
          populateText: true,
          fontSize: "8",
          text: "{value}",
        })
      );

      container.events.on("click", function(e) {
        pointSeries.zoomToCluster(e.target.dataItem);
      });

      return am5.Bullet.new(root, {
        sprite: container,
      });
    });

    pointSeries.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 6,
          tooltipY: 0,
          fill: am5.color(0xff8c00),
          cursorOverStyle: "pointer",
          showTooltipOn: "click",
          tooltipHTML: `
            <div style="background: white; padding: 10px; border-radius: 5px; color: black;">
              <strong>{location}</strong><br>
              <small>City: {city}</small><br>
            </div>
          `,
        }),
      })
    );
    
    let cities = [
      { city: "Jakarta", location: "Monas", latitude: -6.1754, longitude: 106.8272 },
      { city: "Jakarta", location: "Gelora Bung Karno", latitude: -6.2180, longitude: 106.8014 },
      { city: "Jakarta", location: "Kota Tua", latitude: -6.1352, longitude: 106.8133 },
      { city: "Bandung", location: "Alun-Alun", latitude: -6.9219, longitude: 107.6071 },
      { city: "Bandung", location: "Dago", latitude: -6.8915, longitude: 107.6107 },
      { city: "Bandung", location: "Lembang", latitude: -6.8182, longitude: 107.6186 },
      { city: "Bandung", location: "Lembang2", latitude: -6.8182, longitude: 107.6186 },
      { city: "Surabaya", location: "Tunjungan Plaza", latitude: -7.2653, longitude: 112.7457 },
      { city: "Surabaya", location: "Kenjeran Beach", latitude: -7.2235, longitude: 112.7892 },
      { city: "Surabaya", location: "Heroes Monument", latitude: -7.2458, longitude: 112.7379 },
      { city: "Yogyakarta", location: "Malioboro", latitude: -7.7931, longitude: 110.3658 },
      { city: "Yogyakarta", location: "Prambanan Temple", latitude: -7.7520, longitude: 110.4910 },
      { city: "Yogyakarta", location: "Keraton", latitude: -7.8056, longitude: 110.3648 },
      { city: "Denpasar", location: "Kuta Beach", latitude: -8.7179, longitude: 115.1683 },
      { city: "Denpasar", location: "Sanur Beach", latitude: -8.6842, longitude: 115.2620 },
      { city: "Denpasar", location: "Puputan Square", latitude: -8.6563, longitude: 115.2166 },
      { city: "Medan", location: "Maimun Palace", latitude: 3.5754, longitude: 98.6889 },
      { city: "Medan", location: "Merdeka Walk", latitude: 3.5939, longitude: 98.6765 },
      { city: "Medan", location: "Tjong A Fie Mansion", latitude: 3.5953, longitude: 98.6801 },
      { city: "Makassar", location: "Losari Beach", latitude: -5.1406, longitude: 119.4128 },
      { city: "Makassar", location: "Fort Rotterdam", latitude: -5.1335, longitude: 119.4063 },
      { city: "Makassar", location: "Trans Studio Mall", latitude: -5.1613, longitude: 119.4372 }
    ];

    for (const element of cities) {
      let city = element;
      addCity(city.longitude, city.latitude, city.city, city.location);
    }
    
    function addCity(longitude: number, latitude: number, city: string, location: string) {
      pointSeries.data.push({
        geometry: { type: "Point", coordinates: [longitude, latitude] },
        city: city,
        location: location,
      });
    }

    chart.appear(1000, 100);

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

  return (
    <div  
      id="chartdiv" 
      data-testid="map-container" 
      style={{ width: "100%", height: "550px" }} 
    />
  );
}