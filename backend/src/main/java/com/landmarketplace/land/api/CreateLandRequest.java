package com.landmarketplace.land.api;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateLandRequest(
    @NotNull @DecimalMin(value = "0.01") BigDecimal price,
    @NotBlank @Size(max = 1000) String description,
    @NotBlank @Size(max = 255) String contact,
    @NotNull JsonNode geometry
) {}

