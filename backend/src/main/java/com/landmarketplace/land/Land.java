package com.landmarketplace.land;

import com.landmarketplace.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToOne
    @JoinColumn(name = "reserved_by")
    private User reservedBy;

    @Column(name = "reserved_until")
    private Instant reservedUntil;

    protected Land() {}

    public Land(UUID id, BigDecimal price, String description, String contact, Polygon geometry, Instant createdAt) {
        this(id, price, description, contact, geometry, createdAt, null);
    }

    public Land(UUID id, BigDecimal price, String description, String contact, Polygon geometry, Instant createdAt, User owner) {
        this.id = id;
        this.price = price;
        this.description = description;
        this.contact = contact;
        this.geometry = geometry;
        this.createdAt = createdAt;
        this.owner = owner;
    }

    public UUID getId() { return id; }
    public BigDecimal getPrice() { return price; }
    public String getDescription() { return description; }
    public String getContact() { return contact; }
    public Polygon getGeometry() { return geometry; }
    public Instant getCreatedAt() { return createdAt; }
    public User getOwner() { return owner; }
    public User getReservedBy() { return reservedBy; }
    public Instant getReservedUntil() { return reservedUntil; }
    public boolean isReservedAt(Instant now) { return reservedBy != null && reservedUntil != null && reservedUntil.isAfter(now); }
    public void reserve(User user, Instant until) { reservedBy = user; reservedUntil = until; }
    public void clearReservation() { reservedBy = null; reservedUntil = null; }
}
