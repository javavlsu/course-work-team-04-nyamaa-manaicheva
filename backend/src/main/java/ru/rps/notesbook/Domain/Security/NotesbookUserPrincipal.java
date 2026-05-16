package ru.rps.notesbook.Domain.Security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

/**
 * Принципал после form/session-login: сессия уходит клиенту cookie {@code JSESSIONID} автоматически.
 * Так вы получаете {@link #getUserId()} в контроллере, а не общий Spring {@code User} без id.
 */
public final class NotesbookUserPrincipal implements UserDetails {

    private final UUID userId;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public NotesbookUserPrincipal(
            UUID userId,
            String email,
            String password,
            Collection<? extends GrantedAuthority> authorities
    ) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public UUID getUserId() {
        return userId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
