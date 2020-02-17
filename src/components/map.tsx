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
  };

  setViewport = (viewport: Viewport): void => {
    this.resetHover();
    this.setState({ viewport });
  }

  resetHover = (): void => {
    this.setState({
      hoveredFeature: null,
      hoveredLocation: null,
    });
  }

  onHover = ({ features, srcEvent }: PointerEvent): void => {
    const { offsetX, offsetY } = srcEvent;

    if (features === undefined) {
      this.resetHover();

      return;
    };

    const hoveredFeature = features.find(({ source }) => source === 'pictures');

    if (hoveredFeature === undefined) {
      this.resetHover();

      return;
    };

    this.setState({
      hoveredFeature,
      hoveredLocation: {
        x: offsetX,
        y: offsetY,
      },
    });
  }

  get tooltip() {
    const { hoveredFeature, hoveredLocation } = this.state;

    if (hoveredFeature === null || hoveredLocation === null) return null;

    const name = hoveredFeature.properties && hoveredFeature.properties.name;
    const { x, y } = hoveredLocation;

    return (
      <div className="tooltip" style={{ top: y, left: x }}>
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
      </ReactMapGL>
    );
  }
}
