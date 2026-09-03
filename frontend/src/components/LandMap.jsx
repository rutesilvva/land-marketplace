import { useEffect, useRef, useState } from 'react';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import Draw from 'ol/interaction/Draw.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import { getDistance } from 'ol/sphere.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import { Fill, Stroke, Style } from 'ol/style.js';
import LandPopup from './LandPopup.jsx';

const geoJson = new GeoJSON();
const landStyle = new Style({
  fill: new Fill({ color: 'rgba(44, 126, 102, 0.3)' }),
  stroke: new Stroke({ color: '#1f705b', width: 2 }),
});
const draftStyle = new Style({
  fill: new Fill({ color: 'rgba(242, 167, 72, 0.25)' }),
  stroke: new Stroke({ color: '#e18a24', width: 3, lineDash: [8, 7] }),
});

export default function LandMap({ lands, drawMode, selectedLand, onPolygonDrawn, onCircleDrawn, onLandSelect, onClosePopup, user, onProposal, onReservation }) {
  const targetRef = useRef(null);
  const popupRef = useRef(null);
  const mapRef = useRef(null);
  const listingSourceRef = useRef(new VectorSource());
  const draftSourceRef = useRef(new VectorSource());
  const drawRef = useRef(null);
  const overlayRef = useRef(null);
  const [liveRadius, setLiveRadius] = useState(null);

  useEffect(() => {
    const overlay = new Overlay({ element: popupRef.current, positioning: 'bottom-center', offset: [0, -18] });
    const map = new Map({
      target: targetRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: listingSourceRef.current, style: landStyle }),
        new VectorLayer({ source: draftSourceRef.current, style: draftStyle }),
      ],
      overlays: [overlay],
      view: new View({ center: fromLonLat([-38.54, -3.73]), zoom: 12 }),
    });
    map.on('singleclick', (event) => {
      let match = null;
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        if (feature.get('land')) match = feature.get('land');
      });
      if (match) {
        overlay.setPosition(event.coordinate);
        onLandSelect(match);
      } else {
        overlay.setPosition(undefined);
        onClosePopup();
      }
    });
    mapRef.current = map;
    overlayRef.current = overlay;
    return () => map.setTarget(undefined);
  }, [onClosePopup, onLandSelect]);

  useEffect(() => {
    const features = lands.map((land) => {
      const feature = geoJson.readFeature(land.geometry, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
      feature.set('land', land);
      return feature;
    });
    listingSourceRef.current.clear();
    listingSourceRef.current.addFeatures(features);
  }, [lands]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    if (drawRef.current) map.removeInteraction(drawRef.current);
    draftSourceRef.current.clear();
    if (!drawMode) return undefined;

    const draw = new Draw({ source: draftSourceRef.current, type: drawMode === 'circle' ? 'Circle' : 'Polygon' });
    draw.on('drawstart', (event) => {
      if (drawMode === 'circle') {
        event.feature.getGeometry().on('change', (geometryEvent) => {
          const circle = geometryEvent.target;
          const center = circle.getCenter();
          const edge = [center[0] + circle.getRadius(), center[1]];
          setLiveRadius(Math.round(getDistance(toLonLat(center), toLonLat(edge))));
        });
      }
    });
    draw.on('drawend', (event) => {
      if (drawMode === 'circle') {
        const circle = event.feature.getGeometry();
        const center = circle.getCenter();
        const edge = [center[0] + circle.getRadius(), center[1]];
        const [longitude, latitude] = toLonLat(center);
        onCircleDrawn({ longitude, latitude, radiusMeters: Math.round(getDistance(toLonLat(center), toLonLat(edge))) });
        setLiveRadius(null);
      } else {
        const geometry = geoJson.writeGeometryObject(event.feature.getGeometry(), {
          dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857', decimals: 7,
        });
        onPolygonDrawn(geometry);
      }
      map.removeInteraction(draw);
      drawRef.current = null;
    });
    map.addInteraction(draw);
    drawRef.current = draw;
    return () => {
      if (drawRef.current === draw) map.removeInteraction(draw);
    };
  }, [drawMode, onCircleDrawn, onPolygonDrawn]);

  useEffect(() => {
    if (!selectedLand) overlayRef.current?.setPosition(undefined);
  }, [selectedLand]);

  return (
    <div className={`map-stage ${drawMode ? 'is-drawing' : ''}`}>
      <div ref={targetRef} className="map" aria-label="Interactive land map" />
      <div ref={popupRef}>
        <LandPopup land={selectedLand} onClose={onClosePopup} user={user} onProposal={onProposal} onReservation={onReservation} />
      </div>
      {drawMode === 'polygon' && <div className="draw-hint"><span>1</span> Click points to outline the land. Double-click to finish.</div>}
      {drawMode === 'circle' && <div className="draw-hint"><span>⌖</span> Click and drag to set the search radius. {liveRadius ? `${liveRadius.toLocaleString()} m` : ''}</div>}
    </div>
  );
}
