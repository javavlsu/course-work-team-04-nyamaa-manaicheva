package ru.rps.notesbook.Domain.Security;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Models.User;

@Service
@RequiredArgsConstructor
public class NotesbookUserDetailsService implements UserDetailsService {

    private final IUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(@NonNull String email) throws UsernameNotFoundException {
        User appUser = userRepository.GetUserByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String role = appUser.GetRole().name().toUpperCase();
        return org.springframework.security.core.userdetails.User.builder()
                .username(appUser.GetEmail())
                .password(appUser.GetPassword())
                .roles(role)
                .build();
    }
}