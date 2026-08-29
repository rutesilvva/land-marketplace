# Land Marketplace

Land Marketplace is an interactive platform for publishing and discovering land listings through geospatial data. This repository is being delivered in incremental, independently verifiable parts.

## Current scope: Part 1 — spatial API foundation

This first part provides:

- a Spring Boot REST API for creating and listing land records;
- GeoJSON `Polygon` input and output using WGS 84 (`SRID 4326`);
- server-side geometry validation;
- overlap detection performed by PostGIS (`ST_Intersects` and `ST_Touches`);
- versioned database migrations with Flyway;
- PostgreSQL/PostGIS and API containers;
- automated unit and HTTP-layer tests with an enforced 80% line coverage gate.

The React/OpenLayers client, mouse-driven polygon drawing, circular spatial search, and the final three-service Compose environment belong to Part 2. The current Compose file intentionally starts only the services implemented in this part.

## Architecture

The API follows a feature-oriented package structure. `LandController` owns the HTTP contract, `LandService` coordinates the use cases, `GeoJsonMapper` isolates geometry serialization, and `LandRepository` owns database access and spatial queries. Geometry is stored as a PostGIS `geometry(Polygon, 4326)` column with a GiST index.

For registration, the API validates the request and polygon, asks PostGIS whether the candidate has a positive-area intersection with an existing listing, and persists it only when the area is available. Boundary-only contact is accepted because touching parcels do not overlap.

## API

### Create a land listing

```http
POST /api/lands
Content-Type: application/json
```

```json
{
  "price": 120000.00,
  "description": "Rural lot with road access",
  "contact": "seller@example.com",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [-38.60, -3.80],
      [-38.50, -3.80],
      [-38.50, -3.70],
      [-38.60, -3.80]
    ]]
  }
}
```

The endpoint returns `201 Created`, `400 Bad Request` for invalid input, or `409 Conflict` when the polygon overlaps an existing listing.

### List land listings

```http
GET /api/lands
```

## Run with Docker

Requirements: Docker with Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

The API is available at `http://localhost:8080/api/lands` and PostgreSQL at `localhost:5432`. Stop the environment with `docker compose down`. Add `--volumes` only when the database data should also be removed.

## Run without Docker

Requirements: Java 21, Maven 3.9+, PostgreSQL 17, and PostGIS 3.5. Create a database and credentials matching `.env.example`, enable PostGIS, then run:

```bash
cd backend
mvn spring-boot:run
```

Alternative connection settings can be supplied through `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.

## Tests and coverage

```bash
cd backend
mvn verify
```

The build fails if aggregate line coverage drops below 80%. The HTML report is generated at `backend/target/site/jacoco/index.html`. Part 1 currently has 11 tests and 89.86% line coverage.

## Delivery roadmap

- Part 1: spatial backend foundation and land registration — complete.
- Part 2: React/OpenLayers map, polygon drawing, registration form, and listing popups.
- Part 3: mouse-driven circular search and PostGIS intersection query.
- Part 4: integration hardening, complete Compose environment, end-to-end tests, and final documentation.
