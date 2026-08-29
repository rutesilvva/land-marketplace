CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE lands ADD COLUMN owner_id UUID REFERENCES users(id);
CREATE INDEX lands_owner_idx ON lands(owner_id);

CREATE TABLE proposals (
    id UUID PRIMARY KEY,
    land_id UUID NOT NULL REFERENCES lands(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    message VARCHAR(1000) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX proposals_one_pending_per_buyer_land
    ON proposals(land_id, buyer_id) WHERE status = 'PENDING';
CREATE INDEX proposals_land_idx ON proposals(land_id);
CREATE INDEX proposals_buyer_idx ON proposals(buyer_id);
