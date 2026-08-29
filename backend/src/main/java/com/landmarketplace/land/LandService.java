package com.landmarketplace.land;

import com.landmarketplace.land.api.CreateLandRequest;
import com.landmarketplace.land.api.LandResponse;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.locationtech.jts.geom.Polygon;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LandService {
    private final LandRepository repository;
    private final GeoJsonMapper geoJsonMapper;
    private final Clock clock;

    public LandService(LandRepository repository, GeoJsonMapper geoJsonMapper) {
        this(repository, geoJsonMapper, Clock.systemUTC());
    }

    LandService(LandRepository repository, GeoJsonMapper geoJsonMapper, Clock clock) {
        this.repository = repository;
        this.geoJsonMapper = geoJsonMapper;
        this.clock = clock;
    }

    @Transactional
    public LandResponse create(CreateLandRequest request) {
        Polygon polygon = geoJsonMapper.toPolygon(request.geometry());
        if (repository.overlaps(polygon)) {
            throw new LandOverlapException();
        }
        Land land = new Land(UUID.randomUUID(), request.price(), request.description().trim(),
            request.contact().trim(), polygon, Instant.now(clock));
        return toResponse(repository.save(land));
    }

    @Transactional(readOnly = true)
    public List<LandResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    private LandResponse toResponse(Land land) {
        return new LandResponse(land.getId(), land.getPrice(), land.getDescription(), land.getContact(),
            geoJsonMapper.toJson(land.getGeometry()), land.getCreatedAt());
    }
}

