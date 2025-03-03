import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_indonesiaLow from "@amcharts/amcharts5-geodata/indonesiaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { MapLocation, MapConfig } from "../types";
import { getTooltipHTML } from "../utils/tooltipUtils";

export class MapChartService {
  private root: am5.Root | null = null;
  private chart: am5map.MapChart | null = null;
  private pointSeries: am5map.ClusteredPointSeries | null = null;
 
  initialize(containerId: string, config: MapConfig): void {
    // Create root element
    // if (!am5.Root) return;

    this.root = am5.Root.new(containerId);
    this.root.setThemes([am5themes_Animated.new(this.root)]);

    // Create chart
    this.chart = this.root.container.children.push(
      am5map.MapChart.new(this.root, {
        panX: "rotateX",
        panY: "translateY",
        homeZoomLevel: config.zoomLevel,
        projection: am5map.geoMercator(),
        homeGeoPoint: config.centerPoint,
        minZoomLevel: 2.6
      })
    );

    // Add zoom control
    this.setupZoomControl();
    
    // Add map polygons
    this.setupPolygonSeries();
    
    // Create point series
    this.setupPointSeries();
    
    // Animate chart appearance
    this.chart.appear(1000, 100);

  }

  private setupZoomControl(): void {
    if (!this.chart || !this.root) return;
    
    let zoomControl = this.chart.set("zoomControl", am5map.ZoomControl.new(this.root, {}));
    if (zoomControl?.homeButton) {
        zoomControl.homeButton.set("visible", true);
    }
  }

  private setupPolygonSeries(): void {
    if (!this.chart || !this.root) return;
    
    let polygonSeries = this.chart.series.push(
      am5map.MapPolygonSeries.new(this.root, {
        geoJSON: am5geodata_indonesiaLow,
        exclude: ["AQ"],
      })
    );
    
    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0xdadada),
    });
    
    polygonSeries.events.on("datavalidated", () => {
      this.chart?.goHome();
    });
  }

  private setupPointSeries(): void {
    if (!this.chart || !this.root) return;
    
    this.pointSeries = this.chart.series.push(
      am5map.ClusteredPointSeries.new(this.root, {
        groupIdField: "city",
        minDistance: 30,
        scatterDistance: 10,
        scatterRadius: 10,
        stopClusterZoom: 0.9
      })
    );

    this.setupClusterBullet();
    this.setupRegularBullet();
  }

  private setupClusterBullet(): void {
    if (!this.pointSeries || !this.root) return;
    
    this.pointSeries.set("clusteredBullet", (root) => {
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

      container.events.on("click", (e) => {
        this.pointSeries?.zoomToCluster(e.target.dataItem);
      });

      return am5.Bullet.new(root, {
        sprite: container,
      });
    });
  }

  private setupRegularBullet(): void {
    if (!this.pointSeries || !this.root) return;

    const tooltipData = {
        id: "NP00IP05K100B",
        location: "Kota Bekasi, Jawa Barat",
        summary: "Pemerintah Kota Bekasi melalui Dinas Kesehatan Kota Bekasi mengkonfirmasi kasus Cacar Moriyet sebanyak 8 kasus suspek diantaranya 1 orang positif sedang menjalani isolasi RS.",
        gender: "Pria",
        age: "Tidak diketahui",
        alertLevel: "Wespoda",
        relatedSearch: "Apa itu Cacar Moriyet?",
        source: "(1/2) 09Nov2023 Sudah 4 Warga Jabar Positif Cacar Moriyet (detik.com)",
      };
    
      const tooltipHTML = getTooltipHTML(tooltipData);
    
    this.pointSeries.bullets.push(() =>
      am5.Bullet.new(this.root, {
        sprite: am5.Circle.new(this.root, {
          radius: 6,
          tooltipY: 0,
          fill: am5.color(0xff8c00),
          cursorOverStyle: "pointer",
          showTooltipOn: "click",
          tooltipHTML: tooltipHTML,
        }),
      })
    );
  }

  populateLocations(locations: MapLocation[]): void {
    if (!this.pointSeries) return;
    
    locations.forEach(location => {
      this.pointSeries!.data.push({
        geometry: { 
          type: "Point", 
          coordinates: [location.longitude, location.latitude] 
        },
        city: location.city,
        location: location.location,
      });
    });
  }

  dispose(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
      this.chart = null;
      this.pointSeries = null;
    }
  }

  
}

