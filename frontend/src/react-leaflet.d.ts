declare module "react-leaflet" {
  import type { ComponentType, ReactNode } from "react";
  import type { LatLngExpression } from "leaflet";

  export interface MapContainerProps {
    center?: LatLngExpression;
    zoom?: number;
    scrollWheelZoom?: boolean;
    zoomControl?: boolean;
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }

  export interface TileLayerProps {
    attribution?: string;
    url: string;
  }

  export interface CircleMarkerProps {
    center: LatLngExpression;
    radius?: number;
    pathOptions?: {
      color?: string;
      fillColor?: string;
      fillOpacity?: number;
      opacity?: number;
      weight?: number;
    };
    children?: ReactNode;
  }

  export interface PolylineProps {
    positions: LatLngExpression[] | LatLngExpression[][];
    pathOptions?: {
      color?: string;
      opacity?: number;
      weight?: number;
    };
    children?: ReactNode;
  }

  export interface PopupProps {
    children?: ReactNode;
  }

  export interface ZoomControlProps {
    position?: "topleft" | "topright" | "bottomleft" | "bottomright";
  }

  export const MapContainer: ComponentType<MapContainerProps>;
  export const TileLayer: ComponentType<TileLayerProps>;
  export const CircleMarker: ComponentType<CircleMarkerProps>;
  export const Polyline: ComponentType<PolylineProps>;
  export const Popup: ComponentType<PopupProps>;
  export const ZoomControl: ComponentType<ZoomControlProps>;
}