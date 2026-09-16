package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import ru.rps.notesbook.Domain.Interfaces.Services.IEmailService;

@Service
@RequiredArgsConstructor
public class EmailService implements IEmailService {

    private final JavaMailSender mailSender;

    @Value("${notesbook.mail.from}")
    private String fromAddress;

    @Value("${notesbook.frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    public void SendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendBaseUrl + "/reset-password?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Восстановление пароля — NotesBook");
        message.setText(
                "Вы запросили восстановление пароля в NotesBook.\n\n" +
                "Перейдите по ссылке, чтобы задать новый пароль (ссылка действительна 30 минут):\n" +
                resetLink + "\n\n" +
                "Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо."
        );

        mailSender.send(message);
    }

}