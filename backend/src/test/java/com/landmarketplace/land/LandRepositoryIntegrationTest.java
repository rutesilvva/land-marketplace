package com.landmarketplace.land;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.io.WKTReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@DataJpaTest
@Testcontainers
class LandRepositoryIntegrationTest {
    @Container
    static final PostgreSQLContainer<?> POSTGIS = new PostgreSQLContainer<>(
        org.testcontainers.utility.DockerImageName.parse("postgis/postgis:17-3.5")
            .asCompatibleSubstituteFor("postgres")
    ).withCreateContainerCmdModifier(command -> command.withPlatform("linux/amd64"));

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGIS::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGIS::getUsername);
        registry.add("spring.datasource.password", POSTGIS::getPassword);
        registry.add("spring.flyway.enabled", () -> true);
    }

    @Autowired private LandRepository repository;

    @Test
    void detectsOverlapAndFindsOnlyLandsInsideSearchCircle() throws Exception {
        var reader = new WKTReader();
        var near = (org.locationtech.jts.geom.Polygon) reader.read(
            "POLYGON((-38.55 -3.74,-38.53 -3.74,-38.53 -3.72,-38.55 -3.74))");
        near.setSRID(4326);
        repository.saveAndFlush(new Land(UUID.randomUUID(), new BigDecimal("100000"), "Near", "near@example.com", near, Instant.now()));

        var overlapping = (org.locationtech.jts.geom.Polygon) reader.read(
            "POLYGON((-38.545 -3.735,-38.525 -3.735,-38.525 -3.715,-38.545 -3.735))");
        overlapping.setSRID(4326);
        assertThat(repository.overlaps(overlapping)).isTrue();
        assertThat(repository.findIntersectingCircle(-38.54, -3.73, 2500))
            .extracting(Land::getDescription).containsExactly("Near");
        assertThat(repository.findIntersectingCircle(-40, -5, 1000)).isEmpty();
    }
}
