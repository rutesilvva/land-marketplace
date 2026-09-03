# Land Marketplace

Land Marketplace is an interactive platform for publishing and discovering land listings through geospatial data.

## Current scope: complete mandatory project

The implemented application currently provides:

- a Spring Boot REST API for creating and listing land records;
- GeoJSON `Polygon` input and output using WGS 84 (`SRID 4326`);
- server-side geometry validation;
- overlap detection performed by PostGIS (`ST_Intersects` and `ST_Touches`);
- versioned database migrations with Flyway;
- PostgreSQL/PostGIS and API containers;
- a responsive React interface built with OpenLayers;
- mouse-driven polygon drawing and a land publication form;
- rendering of persisted parcels and listing detail popups;
- mouse-driven circular search with a live radius indicator;
- server-side PostGIS search for parcels intersecting the selected radius;
- transaction-level protection against concurrent overlapping registrations;
- user registration and sign-in with BCrypt password hashing;
- authenticated listing publication and listing ownership;
- purchase proposals with buyer and seller inboxes;
- proposal acceptance, rejection, and withdrawal workflows;
- advanced price, area, owner, and ordering filters;
- PostGIS-based parcel area calculation;
- 30-minute buyer reservations with ownership controls;
- automatic rejection of competing pending proposals after an offer is accepted;
- a complete three-service Docker Compose environment;
- automated backend and frontend tests with enforced 80% coverage gates.

## Architecture

The API follows a feature-oriented package structure. `LandController` owns the HTTP contract, `LandService` coordinates the use cases, `GeoJsonMapper` isolates geometry serialization, and `LandRepository` owns database access and spatial queries. Geometry is stored as a PostGIS `geometry(Polygon, 4326)` column with a GiST index. The frontend separates the HTTP client, React workflow, form, popup, and OpenLayers adapter.

For registration, the API validates the request and polygon, asks PostGIS whether the candidate has a positive-area intersection with an existing listing, and persists it only when the area is available. Boundary-only contact is accepted because touching parcels do not overlap.

Registration requests use a transaction-scoped advisory lock around the overlap check and insert. This prevents two concurrent requests from registering intersecting parcels before either transaction becomes visible to the other.

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

### Search by circular area

```http
GET /api/lands/search?longitude=-38.54&latitude=-3.73&radiusMeters=2500
```

The endpoint returns every parcel whose geometry intersects the search circle. Longitude, latitude, and a positive radius in meters are required. In the interface, choose **Search by circle**, drag on the map, and use **Clear search** to restore all listings.

## Accounts and proposals

Map browsing and spatial search are public. Create an account or sign in before publishing a listing or opening the proposal workspace. Passwords are stored only as BCrypt hashes. Authenticated requests use HTTP Basic credentials over the application's same-origin API proxy; production deployments must provide HTTPS.

Select a land owned by another user and choose **Make proposal** to send an amount and message. The **Proposals** workspace separates received and sent proposals. A land owner may accept or reject a pending offer, while its buyer may withdraw it. Each buyer can have only one pending proposal per land.

Use the filter bar to constrain visible listings by price, area, or owner and to order results by date, price, or area. Filters can also refine circular map-search results. Authenticated buyers may reserve an available listing for 30 minutes; only the reservation holder can cancel it. Accepting an offer automatically rejects every other pending offer for that listing.

Account endpoints are available below `/api/auth`; proposal endpoints are available below `/api/proposals`. All endpoints except registration require authentication.

## Run with Docker

Requirements: Docker with Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

Open `http://localhost:3000` to use the application. The API remains available at `http://localhost:8080/api/lands` and PostgreSQL at `localhost:5432`. Stop the environment with `docker compose down`. Add `--volumes` only when the database data should also be removed.

If a default port is already in use, override it for that run, for example `API_PORT=18080 FRONTEND_PORT=13000 docker compose up --build`. `DATABASE_PORT` is also configurable. The PostGIS service explicitly uses its published `linux/amd64` image and Docker Desktop emulates it on Apple Silicon.

## Run without Docker

Requirements: Java 21, Maven 3.9+, Node.js 20.19+ or 22.12+, PostgreSQL 17, and PostGIS 3.5. Create a database and credentials matching `.env.example`, enable PostGIS, then run the API:

```bash
cd backend
mvn spring-boot:run
```

In a second terminal, run the web client:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies API requests to the backend. Alternative database connection settings can be supplied through `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.

## Tests and coverage

```bash
cd backend
mvn verify

cd ../frontend
npm test
```

Docker must be running for `mvn verify`: the repository integration test always starts a real PostGIS container and fails instead of being silently skipped when Docker is unavailable. Testcontainers 1.21.4 is pinned so the standard command works with recent Docker Engine releases, including Docker 29.

Both builds fail if coverage drops below 80%. Backend coverage is generated at `backend/target/site/jacoco/index.html`, and frontend coverage at `frontend/coverage/index.html`. The backend has 27 passing tests with no skips, including the real PostGIS repository test, and 82.63% line coverage. The frontend has 34 tests with 94.54% line coverage, 90.84% statement coverage, 87.62% function coverage, and 82.66% branch coverage. Map, filters, authentication, and proposal components are included in these metrics; only the React bootstrap entry point and test support files are excluded.

## Delivery roadmap

- Part 1: spatial backend foundation and land registration — complete.
- Part 2: React/OpenLayers map, polygon drawing, registration form, and listing popups — complete.
- Part 3: mouse-driven circular search and PostGIS intersection query — complete.
- Part 4: integration hardening, complete Compose environment, end-to-end validation, and final documentation — complete.

The mandatory requirements and the authentication, advanced discovery, reservation, and purchase-proposal extensions are complete.
