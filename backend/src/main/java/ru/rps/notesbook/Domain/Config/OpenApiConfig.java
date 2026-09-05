package ru.rps.notesbook.Domain.Config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String SESSION_COOKIE_SCHEME = "sessionCookie";

    @Bean
    public OpenAPI notesbookOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Notesbook API")
                        .version("1.0")
                        .description("""
                                Сессия после входа: выполните POST /api/auth/login из этого интерфейса — браузер сохранит cookie JSESSIONID для последующих запросов.\s
                                Регистрация: POST /api/auth/register.
                                """))
                .components(new Components().addSecuritySchemes(SESSION_COOKIE_SCHEME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("JSESSIONID")
                                .description("Выставляется автоматически после успешного POST /api/auth/login")));
    }
}
