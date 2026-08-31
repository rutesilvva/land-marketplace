import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ maps: [], draws: [], overlays: [], sources: [] }));

vi.mock('ol/Feature.js', () => ({ default: class Feature { constructor() { this.values = {}; } set(k,v){this.values[k]=v;} get(k){return this.values[k];} } }));
vi.mock('ol/format/GeoJSON.js', () => ({ default: class GeoJSON { readFeature(){return { values:{},set(k,v){this.values[k]=v;},get(k){return this.values[k];} };} writeGeometryObject(){return {type:'Polygon',coordinates:[]};} } }));
vi.mock('ol/Map.js', () => ({ default: class Map { constructor(options){this.options=options;this.handlers={};this.features=[];mocks.maps.push(this);} on(k,fn){this.handlers[k]=fn;} addInteraction(i){this.interaction=i;} removeInteraction(i){this.removed=i;} setTarget(v){this.target=v;} forEachFeatureAtPixel(_pixel,fn){this.features.forEach(fn);} } }));
vi.mock('ol/Overlay.js', () => ({ default: class Overlay { constructor(){this.positions=[];mocks.overlays.push(this);} setPosition(v){this.positions.push(v);} } }));
vi.mock('ol/View.js', () => ({ default: class View {} }));
vi.mock('ol/interaction/Draw.js', () => ({ default: class Draw { constructor(options){this.options=options;this.handlers={};mocks.draws.push(this);} on(k,fn){this.handlers[k]=fn;} } }));
vi.mock('ol/layer/Tile.js', () => ({ default: class TileLayer {} }));
vi.mock('ol/layer/Vector.js', () => ({ default: class VectorLayer {} }));
vi.mock('ol/proj.js', () => ({ fromLonLat: (v)=>v, toLonLat: (v)=>v }));
vi.mock('ol/sphere.js', () => ({ getDistance: ()=>1200 }));
vi.mock('ol/source/OSM.js', () => ({ default: class OSM {} }));
vi.mock('ol/source/Vector.js', () => ({ default: class VectorSource { constructor(){this.features=[];mocks.sources.push(this);} clear(){this.features=[];} addFeatures(values){this.features.push(...values);} } }));
vi.mock('ol/style.js', () => ({ Fill: class Fill {}, Stroke: class Stroke {}, Style: class Style {} }));

import LandMap from './LandMap.jsx';

describe('LandMap', () => {
  beforeEach(() => { mocks.maps.length=0; mocks.draws.length=0; mocks.overlays.length=0; mocks.sources.length=0; });

  it('renders listings and handles map selection', () => {
    const select=vi.fn(); const close=vi.fn();
    const props={lands:[{id:'l1',geometry:{type:'Polygon',coordinates:[]}}],drawMode:null,selectedLand:null,onPolygonDrawn:vi.fn(),onCircleDrawn:vi.fn(),onLandSelect:select,onClosePopup:close};
    const { unmount }=render(<LandMap {...props}/>);
    expect(screen.getByLabelText('Interactive land map')).toBeVisible();
    const map=mocks.maps[0]; const feature=mocks.sources[0].features[0]; map.features=[feature];
    act(()=>map.handlers.singleclick({pixel:[1,1],coordinate:[2,3]}));
    expect(select).toHaveBeenCalledWith(expect.objectContaining({id:'l1'}));
    map.features=[]; act(()=>map.handlers.singleclick({pixel:[1,1],coordinate:[2,3]})); expect(close).toHaveBeenCalled();
    unmount(); expect(map.target).toBeUndefined();
  });

  it('finishes polygon drawing', () => {
    const polygon=vi.fn(); const props={lands:[],drawMode:'polygon',selectedLand:null,onPolygonDrawn:polygon,onCircleDrawn:vi.fn(),onLandSelect:vi.fn(),onClosePopup:vi.fn()};
    render(<LandMap {...props}/>); const draw=mocks.draws.at(-1);
    act(()=>draw.handlers.drawend({feature:{getGeometry:()=>({})}}));
    expect(polygon).toHaveBeenCalledWith({type:'Polygon',coordinates:[]});
  });

  it('shows and submits a mouse-drawn circle radius', () => {
    const circleCallback=vi.fn(); const props={lands:[],drawMode:'circle',selectedLand:{id:'x'},onPolygonDrawn:vi.fn(),onCircleDrawn:circleCallback,onLandSelect:vi.fn(),onClosePopup:vi.fn()};
    render(<LandMap {...props}/>); const draw=mocks.draws.at(-1); let change;
    const geometry={getCenter:()=>[-38.54,-3.73],getRadius:()=>1,on:(_name,fn)=>{change=fn;}};
    act(()=>draw.handlers.drawstart({feature:{getGeometry:()=>geometry}}));
    act(()=>change({target:geometry}));
    expect(screen.getByText(/1,200 m/)).toBeVisible();
    act(()=>draw.handlers.drawend({feature:{getGeometry:()=>geometry}}));
    expect(circleCallback).toHaveBeenCalledWith({longitude:-38.54,latitude:-3.73,radiusMeters:1200});
  });
});
