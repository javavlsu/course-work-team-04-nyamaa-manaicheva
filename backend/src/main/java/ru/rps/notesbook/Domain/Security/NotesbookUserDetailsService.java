package ru.rps.notesbook.Domain.Security;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Models.User;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotesbookUserDetailsService implements UserDetailsService {

    private final IUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(@NonNull String email) throws UsernameNotFoundException {
        User appUser = userRepository.GetUserByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String authority = "ROLE_" + appUser.GetRole().name().toUpperCase();
        var authorities = List.of(new SimpleGrantedAuthority(authority));

        return new NotesbookUserPrincipal(
                appUser.GetId(),
                appUser.GetEmail(),
                appUser.GetPassword(),
                authorities
        );
    }
}
