package com.landmarketplace.land;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class GeoJsonMapperTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GeoJsonMapper mapper = new GeoJsonMapper(objectMapper);

    @Test
    void convertsAValidPolygonInBothDirections() throws Exception {
        var input = objectMapper.readTree("""
            {"type":"Polygon","coordinates":[[[-38.6,-3.8],[-38.5,-3.8],[-38.5,-3.7],[-38.6,-3.8]]]}
            """);
        var polygon = mapper.toPolygon(input);
        assertThat(polygon.getSRID()).isEqualTo(4326);
        assertThat(mapper.toJson(polygon).get("type").asText()).isEqualTo("Polygon");
    }

    @Test
    void rejectsNonPolygonGeometry() throws Exception {
        var point = objectMapper.readTree("{" + "\"type\":\"Point\",\"coordinates\":[0,0]}");
        assertThatThrownBy(() -> mapper.toPolygon(point))
            .isInstanceOf(InvalidGeometryException.class)
            .hasMessage("Geometry must be a Polygon.");
    }

    @Test
    void rejectsMalformedPolygon() throws Exception {
        var polygon = objectMapper.readTree("{" + "\"type\":\"Polygon\",\"coordinates\":[]}");
        assertThatThrownBy(() -> mapper.toPolygon(polygon)).isInstanceOf(InvalidGeometryException.class);
    }
}

