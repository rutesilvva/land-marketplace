package com.landmarketplace.land.api;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LandResponse(
    UUID id,
    BigDecimal price,
    String description,
    String contact,
    JsonNode geometry,
    Instant createdAt
) {}

