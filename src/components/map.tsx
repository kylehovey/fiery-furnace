import React from 'react';
import ReactMapGL, { Source, Layer, PointerEvent } from 'react-map-gl';
import { Feature, LineString } from 'geojson';
import TrackData from '../data/route.json';
import ImagePoints from '../builders/image_points';

const Data: Feature<LineString> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: TrackData.coordinates,
  },
};

interface Viewport {
  readonly width: number | string;
  readonly height: number | string;
  readonly latitude: number;
  readonly longitude: number;
  readonly zoom: number;
}

interface Location {
  readonly x: number;
  readonly y: number;
}

interface State {
  readonly viewport: Viewport;
  readonly hoveredFeature: Feature | null;
  readonly hoveredLocation: Location | null;
  readonly tooltipShown: boolean;
  readonly overlayShown: boolean;
}

export default class extends React.Component<{}, State> {
  state: State = {
    viewport: {
      width: '100vw',
      height: '100vh',
      latitude: 38.74433850188757,
      longitude: -109.56237695591732,
      zoom: 15,
    },
    hoveredFeature: null,
    hoveredLocation: null,
    tooltipShown: false,
    overlayShown: false,
  };

  setViewport = (viewport: Viewport): void => {
    this.setState({ tooltipShown: false });
    this.setState({ viewport });
  }

  onHover = ({ features, srcEvent }: PointerEvent): void => {
    const { overlayShown } = this.state;
    const { offsetX, offsetY } = srcEvent;

    // Ignore hover while overlay is open
    if (overlayShown) return;

    if (features === undefined) {
      this.setState({ tooltipShown: false });

      return;
    };

    const hoveredFeature = features.find(({ source }) => source === 'pictures');

    if (hoveredFeature === undefined) {
      this.setState({ tooltipShown: false });

      return;
    };

    this.setState({
      tooltipShown: true,
      hoveredFeature,
      hoveredLocation: {
        x: offsetX,
        y: offsetY,
      },
    });
  }

  getCursor = (): string => {
    const { hoveredFeature, hoveredLocation } = this.state;

    if (hoveredFeature === null || hoveredLocation === null) {
      return 'default';
    };

    return 'pointer';
  }

  onClick = (): void => {
    const { overlayShown, hoveredFeature, hoveredLocation } = this.state;

    // Ignore clicks while overlay is open
    if (overlayShown) return;

    if (hoveredFeature === null || hoveredLocation === null) {
      return;
    };

    this.openOverlay();
  }

  get tooltip() {
    const { tooltipShown, hoveredFeature, hoveredLocation } = this.state;

    if (!tooltipShown) return null;
    if (hoveredFeature === null || hoveredLocation === null) return null;

    const name = hoveredFeature.properties && hoveredFeature.properties.name;
    const { x, y } = hoveredLocation;

    return (
      <div className="tooltip" style={{ top: y, left: x }}>
        <img src={require(`../images/IMG_${name}.jpg`)} />
      </div>
    );
  }

  openOverlay = () => this.setState({
    overlayShown: true,
    tooltipShown: false,
  });

  closeOverlay = () => this.setState({
    overlayShown: false,
    hoveredFeature: null,
    hoveredLocation: null,
  });

  get overlay() {
    const { overlayShown } = this.state;

    if (!overlayShown) return null;

    const { hoveredFeature } = this.state;

    if (hoveredFeature === null) return null;

    const name = hoveredFeature.properties && hoveredFeature.properties.name;

    return (
      <div className="overlay">
        <button onClick={this.closeOverlay}>X</button>
        <img src={require(`../images/IMG_${name}.jpg`)} />
      </div>
    );
  }

  render() {
    return (
      <ReactMapGL
        {...this.state.viewport}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        onViewportChange={this.setViewport}
        onHover={this.onHover}
        onClick={this.onClick}
        getCursor={this.getCursor}
        mapboxApiAccessToken="pk.eyJ1IjoidXBlbCIsImEiOiJjajllZ29reTUyYTJoMndsc3ZtdGg2NXpsIn0.Y6sKlsUA9ZIm8rHfklQPaQ"
      >
        <Source id='route' type="geojson" data={Data} lineMetrics>
          <Layer
            id="route-string"
            type="line"
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
            paint={{
              'line-color': 'skyblue',
              'line-gradient': [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0,
                '#02c4e9',
                1,
                '#8b02e9'
              ],
              'line-width': 5,
            }}
          />
        </Source>
        <Source id='pictures' type="geojson" data={ImagePoints}>
          <Layer
            id="pictures-markers"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': '#ea5700',
            }}
          />
        </Source>
        {this.tooltip}
        {this.overlay}
      </ReactMapGL>
    );
  }
}
