package com.landmarketplace.land.api;

import com.landmarketplace.land.LandService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lands")
public class LandController {
    private final LandService service;

    public LandController(LandService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<LandResponse> create(@Valid @RequestBody CreateLandRequest request) {
        LandResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/lands/" + response.id())).body(response);
    }

    @GetMapping
    public List<LandResponse> findAll() { return service.findAll(); }
}

