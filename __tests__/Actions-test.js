jest.unmock('../src/actions/index')
jest.unmock('../src/constants/ActionTypes')
jest.unmock('redux-mock-store')
jest.unmock('redux-thunk')
jest.unmock('axios')
jest.unmock('axios-mock-adapter')

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as actions from '../src/actions/index'
import * as types from '../src/constants/ActionTypes'
import config from '../src/constants/config'


const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('Action on google map objects', () =>{
  it('should create RECEIVE_MAP action to store google map objects, both map and map\'s options', () => {
    const mapObj = {map: {}, maps: {}};
    const expectedAction = {
      type: types.RECEIVE_MAP,
      mapObj
    }
    expect(actions.receiveMap(mapObj)).toEqual(expectedAction)
  })
})

describe('Async actions', () => {
  let mock = new MockAdapter(axios)
  afterEach(() =>{
    mock.reset()
  })

  it('creates RECEIVE_ALL_MARKERS action when fetching markers for clustering has been done', () => {
    mock.onGet('http://map.pokego.no/geoindex.json')
      .reply(200, [{"_id":"u3qcj3m","count":1},{"_id":"u2yhu8b","count":1},{"_id":"u35erhr","count":1}])

    const expectedActions = [
      { type: types.RECEIVE_ALL_MARKERS, markersList: [{"_id":"u3qcj3m","count":1},{"_id":"u2yhu8b","count":1},{"_id":"u35erhr","count":1}]}
    ]
    const store = mockStore({ markersList: [] })

    return store.dispatch(actions.fetchAllMarkers())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions)
    })
  })

  it('creates RECEIVE_ALL_MARKERS_ERROR action when fetching markers for clustering was unsuccesful', () => {
    mock.onGet('http://map.pokego.no/geoindex.json')
      .reply(500, {});
    const expectedActionType = types.FETCH_ALL_MARKERS_ERROR

    const store = mockStore({ markersList: [] })

    return store.dispatch(actions.fetchAllMarkers())
      .then(() => {
        expect(store.getActions()[0].type).toEqual(expectedActionType)
    })
  })

  it('creates RECEIVE_SPATIAL_MARKERS action when fetching markers for given bounds', () => {
    let serverAPIAddress = 'http://pokenodebiggy.cloudapp.net/api/getSpatialMarkers'
    mock.onPost(serverAPIAddress)
      .reply(200, [{
        "_id":"5790c3d97e98544ea503504d",
        "Type":"PokeStop",
        "loc":{
          "type":"Point",
          "coordinates":[20.964438021183014,52.228233146664735]
        },
        "Text":"Pokestop-",
        "Author":"Neksi",
        "VoteCount":0,
        "DateAdded":"2016-07-21T12:45:13.062Z"}]);

    const expectedActions = [
      { type: types.RECEIVE_SPATIAL_MARKERS, spatialMarkersList: [{
        "_id":"5790c3d97e98544ea503504d",
        "Type":"PokeStop",
        "loc":{
          "type":"Point",
          "coordinates":[20.964438021183014,52.228233146664735]
        },
        "Text":"Pokestop-",
        "Author":"Neksi",
        "VoteCount":0,
        "DateAdded":"2016-07-21T12:45:13.062Z"}]} 
    ]
    const store = mockStore({ spatialMarkersList: [] })

    return store.dispatch(actions.fetchSpatialMarkers({},serverAPIAddress))
      .then(() => {
        console.log(store.getActions())
        expect(store.getActions()).toEqual(expectedActions)
    })
  })

})