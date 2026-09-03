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
    Instant createdAt,
    UUID ownerId,
    String ownerName,
    double areaSquareMeters,
    boolean reserved,
    UUID reservedById,
    Instant reservedUntil
) {
    public LandResponse(UUID id, BigDecimal price, String description, String contact, JsonNode geometry,
                        Instant createdAt, UUID ownerId, String ownerName) {
        this(id, price, description, contact, geometry, createdAt, ownerId, ownerName, 0, false, null, null);
    }
}
