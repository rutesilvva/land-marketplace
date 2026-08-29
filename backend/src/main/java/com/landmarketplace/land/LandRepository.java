package com.landmarketplace.land;

import java.util.UUID;
import java.util.List;
import org.locationtech.jts.geom.Polygon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LandRepository extends JpaRepository<Land, UUID> {
    @Query(value = "SELECT pg_advisory_xact_lock(7346219)", nativeQuery = true)
    void lockSpatialRegistration();

    @Query(value = """
        SELECT EXISTS (
            SELECT 1 FROM lands
            WHERE ST_Intersects(geometry, :candidate)
              AND NOT ST_Touches(geometry, :candidate)
        )
        """, nativeQuery = true)
    boolean overlaps(@Param("candidate") Polygon candidate);

    @Query(value = """
        SELECT * FROM lands
        WHERE ST_Intersects(
            geometry,
            ST_Buffer(
                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                :radiusMeters
            )::geometry
        )
        ORDER BY created_at DESC
        """, nativeQuery = true)
    List<Land> findIntersectingCircle(
        @Param("longitude") double longitude,
        @Param("latitude") double latitude,
        @Param("radiusMeters") double radiusMeters
    );
}
