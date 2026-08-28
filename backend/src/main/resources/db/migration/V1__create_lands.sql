CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE lands (
    id UUID PRIMARY KEY,
    price NUMERIC(14, 2) NOT NULL CHECK (price > 0),
    description VARCHAR(1000) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    geometry geometry(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX lands_geometry_gix ON lands USING GIST (geometry);

