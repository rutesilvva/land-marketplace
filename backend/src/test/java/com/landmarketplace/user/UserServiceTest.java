package com.landmarketplace.user;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
 @Mock UserRepository repository; @Mock PasswordEncoder encoder;
 @Test void registersNormalizedAccount(){when(encoder.encode("password1")).thenReturn("hash");when(repository.save(any())).thenAnswer(i->i.getArgument(0));User user=new UserService(repository,encoder).register(" Ana ","ANA@EXAMPLE.COM ","password1");assertThat(user.getEmail()).isEqualTo("ana@example.com");assertThat(user.getName()).isEqualTo("Ana");}
 @Test void refusesDuplicateEmail(){when(repository.existsByEmailIgnoreCase("ana@example.com")).thenReturn(true);assertThatThrownBy(()->new UserService(repository,encoder).register("Ana","ana@example.com","password1")).isInstanceOf(IllegalStateException.class);}
 @Test void findsAuthenticatedUser(){User user=mock(User.class);when(repository.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(user));assertThat(new UserService(repository,encoder).require("a@b.com")).isSameAs(user);}
}
