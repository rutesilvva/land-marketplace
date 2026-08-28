package com.landmarketplace.land;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.locationtech.jts.geom.Polygon;

@Entity
@Table(name = "lands")
public class Land {
    @Id
    private UUID id;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String contact;

    @Column(nullable = false, columnDefinition = "geometry(Polygon,4326)")
    private Polygon geometry;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Land() {}

    public Land(UUID id, BigDecimal price, String description, String contact, Polygon geometry, Instant createdAt) {
        this.id = id;
        this.price = price;
        this.description = description;
        this.contact = contact;
        this.geometry = geometry;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public BigDecimal getPrice() { return price; }
    public String getDescription() { return description; }
    public String getContact() { return contact; }
    public Polygon getGeometry() { return geometry; }
    public Instant getCreatedAt() { return createdAt; }
}

