package com.landmarketplace.land;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.landmarketplace.land.api.CreateLandRequest;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Polygon;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LandServiceTest {
    @Mock private LandRepository repository;
    private GeoJsonMapper mapper;
    private LandService service;
    private CreateLandRequest request;

    @BeforeEach
    void setUp() throws Exception {
        mapper = new GeoJsonMapper(new ObjectMapper());
        service = new LandService(repository, mapper,
            Clock.fixed(Instant.parse("2026-08-20T12:00:00Z"), ZoneOffset.UTC));
        var geometry = new ObjectMapper().readTree("""
            {"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}
            """);
        request = new CreateLandRequest(new BigDecimal("120000.00"), "  Rural lot  ", " seller@example.com ", geometry);
    }

    @Test
    void createsLandWhenAreaIsAvailable() {
        when(repository.overlaps(org.mockito.ArgumentMatchers.any(Polygon.class))).thenReturn(false);
        when(repository.save(org.mockito.ArgumentMatchers.any(Land.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        var response = service.create(request);
        assertThat(response.description()).isEqualTo("Rural lot");
        assertThat(response.contact()).isEqualTo("seller@example.com");
        assertThat(response.createdAt()).isEqualTo(Instant.parse("2026-08-20T12:00:00Z"));
    }

    @Test
    void refusesOverlappingLand() {
        when(repository.overlaps(org.mockito.ArgumentMatchers.any(Polygon.class))).thenReturn(true);
        assertThatThrownBy(() -> service.create(request)).isInstanceOf(LandOverlapException.class);
        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void listsStoredLands() {
        Polygon polygon = mapper.toPolygon(request.geometry());
        Land land = new Land(java.util.UUID.randomUUID(), request.price(), "Rural lot", "seller@example.com",
            polygon, Instant.parse("2026-08-20T12:00:00Z"));
        when(repository.findAll()).thenReturn(List.of(land));
        assertThat(service.findAll()).singleElement().extracting(response -> response.description()).isEqualTo("Rural lot");
    }
}
