package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.rps.notesbook.Domain.Interfaces.Services.IUserService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final IUserService userService;

    @GetMapping("/login")
    public Map<String, Object> login() {
        return Map.of(
                "endpoint", "/login",
                "message", "Use Spring Security form login (POST) or your auth endpoint"
        );
    }

    @GetMapping("/register")
    public Map<String, Object> registerForm() {
        return Map.of(
                "endpoint", "/register",
                "message", "Registration endpoint is not implemented yet"
        );
    }

//    @PostMapping("/register")
//    public String registerSubmit(
//            @RequestParam String name,
//            @RequestParam String surname,
//            @RequestParam String email,
//            @RequestParam(required = false) String birthday,
//            @RequestParam String password,
//            @RequestParam String passwordConfirm,
//            RedirectAttributes redirectAttributes) {
//        if (!password.equals(passwordConfirm)) {
//            redirectAttributes.addFlashAttribute("error", "Пароли не совпадают");
//            return "redirect:/register";
//        }
//        LocalDate birthdayDate = null;
//        if (birthday != null && !birthday.isBlank()) {
//            try {
//                birthdayDate = LocalDate.parse(birthday);
//            } catch (Exception ex) {
//                redirectAttributes.addFlashAttribute("error", "Некорректная дата рождения");
//                return "redirect:/register";
//            }
//        }
//        try {
//            Optional<String> error = userRegistrationService.tryRegister(
//                    name, surname, email, birthdayDate, password);
//            if (error.isPresent()) {
//                redirectAttributes.addFlashAttribute("error", error.get());
//                return "redirect:/register";
//            }
//        } catch (IllegalArgumentException ex) {
//            redirectAttributes.addFlashAttribute("error", ex.getMessage());
//            return "redirect:/register";
//        }
//        redirectAttributes.addFlashAttribute("message", "Регистрация успешна. Войдите в систему.");
//        return "redirect:/login";
//    }
}
