import RawData from '../data/raw.json';
import ImageTimes from '../images/times.json';
import { Feature, FeatureCollection } from 'geojson';

interface Data {
  readonly time: string;
  readonly alt: string;
  readonly longitude: string;
  readonly latitude: string;
  readonly segment: string;
}

export default ((data: Data[]) => {

  const trackWithTime = data.map(({ time, longitude, latitude }) => ({
    time: parseInt(time) * 1000,
    longitude: parseFloat(longitude),
    latitude: parseFloat(latitude),
  }));

  const inferredLocations = ImageTimes.map(({ name, time }) => ({
    name,
    ...(([{ longitude, latitude }]) => ({ longitude, latitude }))(
      [...trackWithTime].sort(
        ({ time: A }, { time: B }) => {
          return Math.abs(time - A) - Math.abs(time - B);
        }
      )
    ),
  }));

  const ret: FeatureCollection = {
    type: 'FeatureCollection',
    features: inferredLocations.map(({ name, longitude, latitude }): Feature => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      properties: {
        name,
      },
    })),
  };

  return ret;
})(RawData as Data[]);
