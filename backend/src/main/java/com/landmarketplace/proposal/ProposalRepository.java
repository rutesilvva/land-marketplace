package com.landmarketplace.proposal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProposalRepository extends JpaRepository<Proposal, UUID> {
    boolean existsByLandIdAndBuyerIdAndStatus(UUID landId, UUID buyerId, ProposalStatus status);
    List<Proposal> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);
    List<Proposal> findByLandOwnerIdOrderByCreatedAtDesc(UUID ownerId);
}
