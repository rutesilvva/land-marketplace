package com.landmarketplace.user.api;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.landmarketplace.shared.ApiExceptionHandler;
import com.landmarketplace.user.*;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AuthControllerTest {
 @Test void registersAndReadsProfile() throws Exception {UserService service=mock(UserService.class);User user=new User(UUID.randomUUID(),"Ana","ana@test.com","hash",Instant.now());when(service.register("Ana","ana@test.com","password1")).thenReturn(user);when(service.require("ana@test.com")).thenReturn(user);var mvc=MockMvcBuilders.standaloneSetup(new AuthController(service)).setControllerAdvice(new ApiExceptionHandler()).build();mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Ana\",\"email\":\"ana@test.com\",\"password\":\"password1\"}")).andExpect(status().isCreated()).andExpect(jsonPath("$.name").value("Ana"));mvc.perform(get("/api/auth/me").principal(()->"ana@test.com")).andExpect(status().isOk()).andExpect(jsonPath("$.email").value("ana@test.com"));}
}
