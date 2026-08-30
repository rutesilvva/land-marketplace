package com.landmarketplace.proposal.api;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.landmarketplace.land.Land;
import com.landmarketplace.proposal.*;
import com.landmarketplace.shared.ApiExceptionHandler;
import com.landmarketplace.user.User;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ProposalControllerTest {
 @Test void createsListsAndUpdates() throws Exception {ProposalService service=mock(ProposalService.class);User owner=new User(UUID.randomUUID(),"Owner","owner@test.com","x",Instant.now());User buyer=new User(UUID.randomUUID(),"Buyer","buyer@test.com","x",Instant.now());Land land=new Land(UUID.randomUUID(),BigDecimal.TEN,"Lot","x",null,Instant.now(),owner);Proposal proposal=new Proposal(UUID.randomUUID(),land,buyer,BigDecimal.ONE,"Offer",Instant.now());when(service.create(eq(land.getId()),any(),eq("Offer"),eq("buyer@test.com"))).thenReturn(proposal);when(service.mine("buyer@test.com")).thenReturn(List.of(proposal));when(service.received("owner@test.com")).thenReturn(List.of(proposal));when(service.update(proposal.getId(),ProposalStatus.ACCEPTED,"owner@test.com")).thenAnswer(i->{proposal.changeStatus(ProposalStatus.ACCEPTED);return proposal;});var mvc=MockMvcBuilders.standaloneSetup(new ProposalController(service)).setControllerAdvice(new ApiExceptionHandler()).build();mvc.perform(post("/api/proposals").principal(()->"buyer@test.com").contentType(MediaType.APPLICATION_JSON).content("{\"landId\":\""+land.getId()+"\",\"amount\":1,\"message\":\"Offer\"}")).andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("PENDING"));mvc.perform(get("/api/proposals/mine").principal(()->"buyer@test.com")).andExpect(status().isOk()).andExpect(jsonPath("$[0].buyerName").value("Buyer"));mvc.perform(get("/api/proposals/received").principal(()->"owner@test.com")).andExpect(status().isOk());mvc.perform(patch("/api/proposals/"+proposal.getId()+"/status").principal(()->"owner@test.com").contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"ACCEPTED\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACCEPTED"));}
}
