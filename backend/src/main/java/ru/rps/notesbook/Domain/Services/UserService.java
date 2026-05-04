package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IUserService;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

//    @Override
//    public List<User> GetUsers() {
//        return new
//    }

    @Override
    public void register(String name, String surname, String email,
                        LocalDate birthday, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.GetUserByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("Пользователь с таким email уже зарегистрирован");
        }
        
        User user = new User(
            UUID    .randomUUID(),
            name,
            surname,
            normalizedEmail,
            birthday,
            passwordEncoder.encode(rawPassword),
            RoleTypeEnum.Client
        );

        userRepository.SaveUser(user);
    }
}