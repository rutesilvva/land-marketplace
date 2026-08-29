package com.landmarketplace.land;

import com.landmarketplace.land.api.CreateLandRequest;
import com.landmarketplace.land.api.LandResponse;
import com.landmarketplace.user.User;
import com.landmarketplace.user.UserService;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.locationtech.jts.geom.Polygon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LandService {
    private final LandRepository repository;
    private final GeoJsonMapper geoJsonMapper;
    private final Clock clock;
    private final UserService userService;

    @Autowired
    public LandService(LandRepository repository, GeoJsonMapper geoJsonMapper, UserService userService) {
        this(repository, geoJsonMapper, userService, Clock.systemUTC());
    }

    LandService(LandRepository repository, GeoJsonMapper geoJsonMapper, UserService userService, Clock clock) {
        this.repository = repository;
        this.geoJsonMapper = geoJsonMapper;
        this.clock = clock;
        this.userService = userService;
    }

    @Transactional
    public LandResponse create(CreateLandRequest request, String ownerEmail) {
        Polygon polygon = geoJsonMapper.toPolygon(request.geometry());
        User owner = userService.require(ownerEmail);
        repository.lockSpatialRegistration();
        if (repository.overlaps(polygon)) {
            throw new LandOverlapException();
        }
        Land land = new Land(UUID.randomUUID(), request.price(), request.description().trim(),
            request.contact().trim(), polygon, Instant.now(clock), owner);
        return toResponse(repository.save(land));
    }

    @Transactional(readOnly = true)
    public List<LandResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<LandResponse> search(double longitude, double latitude, double radiusMeters) {
        return repository.findIntersectingCircle(longitude, latitude, radiusMeters).stream()
            .map(this::toResponse)
            .toList();
    }

    private LandResponse toResponse(Land land) {
        User owner = land.getOwner();
        return new LandResponse(land.getId(), land.getPrice(), land.getDescription(), land.getContact(),
            geoJsonMapper.toJson(land.getGeometry()), land.getCreatedAt(), owner == null ? null : owner.getId(),
            owner == null ? null : owner.getName());
    }
}
