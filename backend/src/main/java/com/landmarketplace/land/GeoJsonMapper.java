package com.landmarketplace.land;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.locationtech.jts.io.geojson.GeoJsonWriter;
import org.springframework.stereotype.Component;

@Component
public class GeoJsonMapper {
    private final ObjectMapper objectMapper;

    public GeoJsonMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Polygon toPolygon(JsonNode geoJson) {
        try {
            Geometry geometry = new GeoJsonReader().read(geoJson.toString());
            if (!(geometry instanceof Polygon polygon)) {
                throw new InvalidGeometryException("Geometry must be a Polygon.");
            }
            polygon.setSRID(4326);
            if (polygon.isEmpty() || !polygon.isValid() || polygon.getArea() == 0) {
                throw new InvalidGeometryException("Geometry must be a valid, non-empty polygon.");
            }
            return polygon;
        } catch (InvalidGeometryException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new InvalidGeometryException("Geometry must be valid GeoJSON.");
        }
    }

    public JsonNode toJson(Geometry geometry) {
        try {
            return objectMapper.readTree(new GeoJsonWriter().write(geometry));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Stored geometry could not be serialized.", exception);
        }
    }
}

