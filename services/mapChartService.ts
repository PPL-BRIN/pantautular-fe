import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_indonesiaLow from "@amcharts/amcharts5-geodata/indonesiaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { MapLocation, MapConfig } from "../types";
import { getTooltipHTML } from "../utils/tooltipUtils";
import { useMapStore } from "../store/store";

export class MapChartService {
  private root: am5.Root | null = null;
  private chart: am5map.MapChart | null = null;
  private pointSeries: am5map.ClusteredPointSeries | null = null;
  private locations: MapLocation[] | null = null;
  private _countSelectedPoints: number = 0;

  initialize(containerId: string, config: MapConfig): void {
    // Create root element
    this.root = am5.Root.new(containerId);
    this.root.setThemes([am5themes_Animated.new(this.root)]);

    // Create chart
    this.chart = this.root.container.children.push(
      am5map.MapChart.new(this.root, {
        panX: 'rotateX',
        panY: 'translateY',
        homeZoomLevel: config.zoomLevel,
        projection: am5map.geoMercator(),
        homeGeoPoint: config.centerPoint,
        minZoomLevel: config.zoomLevel,
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

    let zoomControl = this.chart.set('zoomControl', am5map.ZoomControl.new(this.root, {}));
    zoomControl.homeButton.set('visible', true);
    this.chart.on('zoomLevel', this.getPointsInSelection.bind(this));
    this.chart.on('translateX', this.getPointsInSelection.bind(this));
    this.chart.on('translateY', this.getPointsInSelection.bind(this));
  }

  get countSelectedPoints(): number {
    return this._countSelectedPoints;
  }

  // Private setter for countSelectedPoints
  private set countSelectedPoints(value: number) {
    this._countSelectedPoints = value;
    // Update Zustand store
    useMapStore.getState().setCountSelectedPoints(value); // Update global state
  }

  // Your method that updates the count of selected points
  private getPointsInSelection(): void {
    console.log('Runnnnn');
    const tl = this.chart?.invert({ x: 0, y: 0 });
    const br = this.chart?.invert({ x: this.chart.innerWidth(), y: this.chart.innerHeight() });

    // Check if tl or br is undefined and handle the case
    if (!tl || !br) {
      console.error('Failed to get points in selection: tl or br is undefined');
      return;
    }

    // Now safely use tl and br since they are guaranteed to be defined
    if (tl.longitude > br.longitude) {
      tl.longitude = -180;
      br.longitude = 180;
    }

    const selectedPoints: string[] = [];

    this.locations?.forEach((dataItem) => {
      const longitude = dataItem.location__longitude;
      const latitude = dataItem.location__latitude;

      if (
        longitude >= tl.longitude &&
        longitude <= br.longitude &&
        latitude <= tl.latitude &&
        latitude >= br.latitude
      ) {
        selectedPoints.push(dataItem.id);
      }
    });

    // Set the countSelectedPoints using the private setter
    this.countSelectedPoints = selectedPoints.length;
    console.log(this._countSelectedPoints);
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
        am5.Circle.new(root, { radius: 8, tooltipY: 0, fill: am5.color(0xfc0339) })
      );

      container.children.push(
        am5.Circle.new(root, { radius: 12, fillOpacity: 0.3, tooltipY: 0, fill: am5.color(0xfc0339) })
      );

      container.children.push(
        am5.Circle.new(root, { radius: 16, fillOpacity: 0.3, tooltipY: 0, fill: am5.color(0xfc0339) })
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
        const dataItem = e.target.dataItem;
        this.pointSeries?.zoomToCluster(dataItem as any);
      });

      return am5.Bullet.new(root, {
        sprite: container,
      });
    });
  }

  private setupRegularBullet(): void {
    if (!this.pointSeries || !this.root) return;

    const tooltipData = {
        id: "{id}",
        location: "{city}",
        summary: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo",
        gender: "Lorem",
        age: "0",
        alertLevel: "Lorem",
        relatedSearch: "Lorem ipsum dolor sit",
        source: "https://www.detik.com",
      };
    
    const tooltipHTML = getTooltipHTML(tooltipData);
    
    this.pointSeries.bullets.push(() =>
      am5.Bullet.new(this.root, {
        sprite: am5.Circle.new(this.root, {
          radius: 6,
          tooltipY: 0,
          fill: am5.color(0xfc0339),
          cursorOverStyle: "pointer",
          showTooltipOn: "click",
          tooltipHTML: tooltipHTML,
        }),
      })
    );
  }

  populateLocations(locations: MapLocation[]): void {
    if (!this.pointSeries) return;
    this.locations = locations
    locations.forEach(location => {
      this.pointSeries!.data.push({
        geometry: { 
          type: "Point", 
          coordinates: [
            parseFloat(location.location__longitude), 
            parseFloat(location.location__latitude),
          ] 
        },
        city: location.city,
        id: location.id,
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

