package ru.rps.notesbook.Domain.Interfaces.Services;

public interface IEmailService {

    void SendPasswordResetEmail(String toEmail, String resetToken);

}