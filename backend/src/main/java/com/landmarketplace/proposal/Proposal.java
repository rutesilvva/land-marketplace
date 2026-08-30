package com.landmarketplace.proposal;

import com.landmarketplace.land.Land;
import com.landmarketplace.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "proposals")
public class Proposal {
    @Id private UUID id;
    @ManyToOne(optional=false) @JoinColumn(name="land_id") private Land land;
    @ManyToOne(optional=false) @JoinColumn(name="buyer_id") private User buyer;
    @Column(nullable=false, precision=14, scale=2) private BigDecimal amount;
    @Column(nullable=false, length=1000) private String message;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private ProposalStatus status;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    @Column(name="updated_at", nullable=false) private Instant updatedAt;
    protected Proposal() {}
    public Proposal(UUID id, Land land, User buyer, BigDecimal amount, String message, Instant now) {
        this.id=id; this.land=land; this.buyer=buyer; this.amount=amount; this.message=message;
        this.status=ProposalStatus.PENDING; this.createdAt=now; this.updatedAt=now;
    }
    public UUID getId(){return id;} public Land getLand(){return land;} public User getBuyer(){return buyer;}
    public BigDecimal getAmount(){return amount;} public String getMessage(){return message;}
    public ProposalStatus getStatus(){return status;} public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
    public void changeStatus(ProposalStatus status){this.status=status; this.updatedAt=Instant.now();}
}
