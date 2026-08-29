package com.landmarketplace.land.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.landmarketplace.land.InvalidGeometryException;
import com.landmarketplace.land.LandOverlapException;
import com.landmarketplace.land.LandService;
import com.landmarketplace.shared.ApiExceptionHandler;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class LandControllerTest {
    @Mock private LandService service;
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new LandController(service))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    }

    @Test
    void createsLandAndReturnsItsLocation() throws Exception {
        UUID id = UUID.randomUUID();
        var geometry = objectMapper.readTree("""
            {"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}
            """);
        when(service.create(any())).thenReturn(new LandResponse(id, new BigDecimal("100.00"),
            "Lot", "seller@example.com", geometry, Instant.parse("2026-08-20T12:00:00Z")));

        mockMvc.perform(post("/api/lands").contentType(MediaType.APPLICATION_JSON).content("""
                {"price":100,"description":"Lot","contact":"seller@example.com",
                 "geometry":{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}}
                """))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/lands/" + id))
            .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void listsLands() throws Exception {
        when(service.findAll()).thenReturn(List.of());
        mockMvc.perform(get("/api/lands"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    void reportsRequestValidationErrors() throws Exception {
        mockMvc.perform(post("/api/lands").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void reportsAnOverlapAsConflict() throws Exception {
        when(service.create(any())).thenThrow(new LandOverlapException());
        mockMvc.perform(post("/api/lands").contentType(MediaType.APPLICATION_JSON).content("""
                {"price":100,"description":"Lot","contact":"seller@example.com",
                 "geometry":{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}}
                """))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("The land area overlaps an existing listing."));
    }

    @Test
    void reportsInvalidGeoJsonAsBadRequest() throws Exception {
        when(service.create(any())).thenThrow(new InvalidGeometryException("Geometry must be valid GeoJSON."));
        mockMvc.perform(post("/api/lands").contentType(MediaType.APPLICATION_JSON).content("""
                {"price":100,"description":"Lot","contact":"seller@example.com","geometry":{}}
                """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Geometry must be valid GeoJSON."));
    }
}
