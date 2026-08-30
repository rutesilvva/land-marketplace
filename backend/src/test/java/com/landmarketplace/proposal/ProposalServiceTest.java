package com.landmarketplace.proposal;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.landmarketplace.land.*;
import com.landmarketplace.user.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProposalServiceTest {
 @Mock ProposalRepository repository; @Mock LandRepository lands; @Mock UserService users;
 ProposalService service; User owner,buyer; Land land;
 @BeforeEach void setup(){service=new ProposalService(repository,lands,users);owner=new User(UUID.randomUUID(),"Owner","owner@test.com","x",Instant.now());buyer=new User(UUID.randomUUID(),"Buyer","buyer@test.com","x",Instant.now());land=new Land(UUID.randomUUID(),BigDecimal.TEN,"Lot","x",null,Instant.now(),owner);}
 @Test void createsProposal(){when(users.require("buyer@test.com")).thenReturn(buyer);when(lands.findById(land.getId())).thenReturn(Optional.of(land));when(repository.save(any())).thenAnswer(i->i.getArgument(0));Proposal p=service.create(land.getId(),BigDecimal.ONE," Interested ","buyer@test.com");assertThat(p.getStatus()).isEqualTo(ProposalStatus.PENDING);assertThat(p.getMessage()).isEqualTo("Interested");}
 @Test void ownerCannotBid(){when(users.require("owner@test.com")).thenReturn(owner);when(lands.findById(land.getId())).thenReturn(Optional.of(land));assertThatThrownBy(()->service.create(land.getId(),BigDecimal.ONE,"Offer","owner@test.com")).isInstanceOf(IllegalStateException.class);}
 @Test void ownerAcceptsProposal(){Proposal p=new Proposal(UUID.randomUUID(),land,buyer,BigDecimal.ONE,"Offer",Instant.now());when(users.require("owner@test.com")).thenReturn(owner);when(repository.findById(p.getId())).thenReturn(Optional.of(p));assertThat(service.update(p.getId(),ProposalStatus.ACCEPTED,"owner@test.com").getStatus()).isEqualTo(ProposalStatus.ACCEPTED);}
 @Test void buyerWithdrawsProposal(){Proposal p=new Proposal(UUID.randomUUID(),land,buyer,BigDecimal.ONE,"Offer",Instant.now());when(users.require("buyer@test.com")).thenReturn(buyer);when(repository.findById(p.getId())).thenReturn(Optional.of(p));assertThat(service.update(p.getId(),ProposalStatus.WITHDRAWN,"buyer@test.com").getStatus()).isEqualTo(ProposalStatus.WITHDRAWN);}
}
