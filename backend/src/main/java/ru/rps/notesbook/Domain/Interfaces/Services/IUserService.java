package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.util.List;

public interface IUserService {
//    List<User> GetUsers();
    void register(String name, String surname, String email, LocalDate birthday, String rawPassword);
}