ALTER TABLE lands ADD COLUMN reserved_by UUID REFERENCES users(id);
ALTER TABLE lands ADD COLUMN reserved_until TIMESTAMP WITH TIME ZONE;
CREATE INDEX lands_reserved_by_idx ON lands(reserved_by);
