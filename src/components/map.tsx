import React from 'react';
import ReactMapGL, { Source, Layer } from 'react-map-gl';
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

interface State {
  readonly viewport: Viewport;
}

export default class extends React.Component<{}, State> {
  state: State = {
    viewport: {
      width: '100vw',
      height: '100vh',
      latitude: 38.74433850188757,
      longitude: -109.56237695591732,
      zoom: 15,
    }
  };

  setViewport = (viewport: Viewport): void => {
    this.setState({ viewport });
  }

  render() {
    return (
      <ReactMapGL
        {...this.state.viewport}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        onViewportChange={this.setViewport}
        mapboxApiAccessToken="pk.eyJ1IjoidXBlbCIsImEiOiJjajllZ29reTUyYTJoMndsc3ZtdGg2NXpsIn0.Y6sKlsUA9ZIm8rHfklQPaQ"
      >
        <Source type="geojson" data={Data} lineMetrics>
          <Layer
            id="route"
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
        <Source type="geojson" data={ImagePoints}>
          <Layer
            id="pictures"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': '#ea5700',
            }}
          />
        </Source>
      </ReactMapGL>
    );
  }
}
