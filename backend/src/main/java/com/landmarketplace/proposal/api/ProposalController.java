package com.landmarketplace.proposal.api;

import com.landmarketplace.proposal.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/proposals")
public class ProposalController {
    private final ProposalService service; public ProposalController(ProposalService service){this.service=service;}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public ProposalResponse create(@Valid @RequestBody CreateProposalRequest request, Principal principal){return map(service.create(request.landId(),request.amount(),request.message(),principal.getName()));}
    @GetMapping("/mine") public List<ProposalResponse> mine(Principal principal){return service.mine(principal.getName()).stream().map(this::map).toList();}
    @GetMapping("/received") public List<ProposalResponse> received(Principal principal){return service.received(principal.getName()).stream().map(this::map).toList();}
    @PatchMapping("/{id}/status") public ProposalResponse update(@PathVariable UUID id,@Valid @RequestBody UpdateStatusRequest request,Principal principal){return map(service.update(id,request.status(),principal.getName()));}
    private ProposalResponse map(Proposal p){return new ProposalResponse(p.getId(),p.getLand().getId(),p.getLand().getDescription(),p.getBuyer().getName(),p.getBuyer().getEmail(),p.getAmount(),p.getMessage(),p.getStatus(),p.getCreatedAt(),p.getUpdatedAt());}
    public record CreateProposalRequest(@NotNull UUID landId,@NotNull @DecimalMin("0.01") BigDecimal amount,@NotBlank @Size(max=1000) String message){}
    public record UpdateStatusRequest(@NotNull ProposalStatus status){}
    public record ProposalResponse(UUID id,UUID landId,String landDescription,String buyerName,String buyerEmail,BigDecimal amount,String message,ProposalStatus status,Instant createdAt,Instant updatedAt){}
}
