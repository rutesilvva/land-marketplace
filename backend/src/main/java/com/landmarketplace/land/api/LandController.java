package com.landmarketplace.land.api;

import com.landmarketplace.land.LandService;
import jakarta.validation.Valid;
import java.net.URI;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lands")
public class LandController {
    private final LandService service;

    public LandController(LandService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<LandResponse> create(@Valid @RequestBody CreateLandRequest request, Principal principal) {
        LandResponse response = service.create(request, principal.getName());
        return ResponseEntity.created(URI.create("/api/lands/" + response.id())).body(response);
    }

    @GetMapping
    public List<LandResponse> findAll() { return service.findAll(); }

    @GetMapping("/search")
    public List<LandResponse> search(
        @RequestParam double longitude,
        @RequestParam double latitude,
        @RequestParam double radiusMeters
    ) {
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Search coordinates are outside valid longitude and latitude ranges.");
        }
        if (!Double.isFinite(radiusMeters) || radiusMeters <= 0 || radiusMeters > 500_000) {
            throw new IllegalArgumentException("Search radius must be between 0 and 500000 meters.");
        }
        return service.search(longitude, latitude, radiusMeters);
    }

    @PostMapping("/{id}/reservation")
    public LandResponse reserve(@PathVariable java.util.UUID id, Principal principal) {
        return service.reserve(id, principal.getName());
    }

    @DeleteMapping("/{id}/reservation")
    public LandResponse cancelReservation(@PathVariable java.util.UUID id, Principal principal) {
        return service.cancelReservation(id, principal.getName());
    }
}
