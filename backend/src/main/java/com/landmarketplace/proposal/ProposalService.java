package com.landmarketplace.proposal;

import com.landmarketplace.land.Land;
import com.landmarketplace.land.LandRepository;
import com.landmarketplace.user.User;
import com.landmarketplace.user.UserService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProposalService {
    private final ProposalRepository repository; private final LandRepository lands; private final UserService users;
    public ProposalService(ProposalRepository repository, LandRepository lands, UserService users) { this.repository=repository; this.lands=lands; this.users=users; }

    @Transactional public Proposal create(UUID landId, BigDecimal amount, String message, String email) {
        User buyer=users.require(email); Land land=lands.findById(landId).orElseThrow(() -> new IllegalArgumentException("Land listing was not found."));
        if (land.getOwner()==null) throw new IllegalStateException("This legacy listing cannot receive proposals.");
        if (land.getOwner().getId().equals(buyer.getId())) throw new IllegalStateException("You cannot make a proposal on your own listing.");
        if (repository.existsByLandIdAndBuyerIdAndStatus(landId,buyer.getId(),ProposalStatus.PENDING)) throw new IllegalStateException("You already have a pending proposal for this land.");
        return repository.save(new Proposal(UUID.randomUUID(),land,buyer,amount,message.trim(),Instant.now()));
    }
    @Transactional(readOnly=true) public List<Proposal> mine(String email) { return repository.findByBuyerIdOrderByCreatedAtDesc(users.require(email).getId()); }
    @Transactional(readOnly=true) public List<Proposal> received(String email) { return repository.findByLandOwnerIdOrderByCreatedAtDesc(users.require(email).getId()); }
    @Transactional public Proposal update(UUID id, ProposalStatus next, String email) {
        User actor=users.require(email); Proposal proposal=repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Proposal was not found."));
        if (proposal.getStatus()!=ProposalStatus.PENDING) throw new IllegalStateException("Only pending proposals can be changed.");
        boolean buyer=proposal.getBuyer().getId().equals(actor.getId()); boolean owner=proposal.getLand().getOwner().getId().equals(actor.getId());
        if (next==ProposalStatus.WITHDRAWN && !buyer) throw new SecurityException("Only the buyer can withdraw this proposal.");
        if ((next==ProposalStatus.ACCEPTED || next==ProposalStatus.REJECTED) && !owner) throw new SecurityException("Only the land owner can answer this proposal.");
        if (next==ProposalStatus.PENDING) throw new IllegalArgumentException("The requested status transition is invalid.");
        proposal.changeStatus(next);
        if (next == ProposalStatus.ACCEPTED) {
            java.util.Optional.ofNullable(repository.findByLandIdAndStatus(proposal.getLand().getId(), ProposalStatus.PENDING))
                .orElseGet(java.util.List::of).stream()
                .filter(other -> !other.getId().equals(proposal.getId()))
                .forEach(other -> other.changeStatus(ProposalStatus.REJECTED));
        }
        return proposal;
    }
}
