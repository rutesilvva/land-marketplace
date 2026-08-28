package com.landmarketplace.land;

public class LandOverlapException extends RuntimeException {
    public LandOverlapException() { super("The land area overlaps an existing listing."); }
}

