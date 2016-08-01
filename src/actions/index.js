import axios from 'axios';
import * as types from '../constants/ActionTypes';

export function receiveMap(mapObj) {
  return {
    type: types.RECEIVE_MAP,
    mapObj,
  };
}

export function receiveAllMarkers(markersList) {
  return {
    type: types.RECEIVE_ALL_MARKERS,
    markersList,
  };
}
export function fetchAllMarkersFailure(err) {
  return {
    type: types.FETCH_ALL_MARKERS_ERROR,
    err,
  };
}

export function fetchAllMarkers() {
  return function dispatchAllMarkersFetching(dispatch) {
    return axios.get('http://map.pokego.no/geoindex.json')
      .then(response => dispatch(receiveAllMarkers(response.data)))
      .catch(err => dispatch(fetchAllMarkersFailure(err)));
  };
}

export function receiveSpatialMarkers(spatialMarkersList) {
  return {
    type: types.RECEIVE_SPATIAL_MARKERS,
    spatialMarkersList,
  };
}

export function fetchSpatialMarkersFailure(err) {
  return {
    type: types.FETCH_SPATIAL_MARKERS_ERROR,
    err,
  };
}

export function fetchSpatialMarkers(boundsData, serverAPIAddress) {
  return function dispatchSpatialMarkersFetching(dispatch) {
    return axios.post(serverAPIAddress, boundsData)
      .then(response => dispatch(receiveSpatialMarkers(response.data)))
      .catch(err => dispatch(fetchSpatialMarkersFailure(err)));
  };
}
