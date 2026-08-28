package com.landmarketplace.land;

import java.util.UUID;
import org.locationtech.jts.geom.Polygon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LandRepository extends JpaRepository<Land, UUID> {
    @Query(value = """
        SELECT EXISTS (
            SELECT 1 FROM lands
            WHERE ST_Intersects(geometry, :candidate)
              AND NOT ST_Touches(geometry, :candidate)
        )
        """, nativeQuery = true)
    boolean overlaps(@Param("candidate") Polygon candidate);
}

