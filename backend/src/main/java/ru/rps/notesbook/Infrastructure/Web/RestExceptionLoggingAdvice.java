package ru.rps.notesbook.Infrastructure.Web;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.core.Ordered;
import org.springframework.validation.FieldError;

@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class RestExceptionLoggingAdvice {

    private static final Logger log = LoggerFactory.getLogger(RestExceptionLoggingAdvice.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest req
    ) {
        int code = ex.getStatusCode().value();
        if (code >= 500) {
            log.error("{} {} — {}", req.getMethod(), req.getRequestURI(), ex.getReason(), ex);
        } else {
            log.warn("{} {} — {}", req.getMethod(), req.getRequestURI(), ex.getReason());
        }
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                "message", Optional.ofNullable(ex.getReason()).orElse("")
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest req
    ) {
        log.warn("{} {} — validation failed: {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        Map<String, String> fields = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage, (a, b) -> a + "; " + b));
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Validation failed",
                "fields", fields
        ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleBadJson(
            HttpMessageNotReadableException ex,
            HttpServletRequest req
    ) {
        log.warn("{} {} — malformed JSON: {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return ResponseEntity.badRequest().body(Map.of("error", "Malformed JSON"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest req
    ) {
        String message = "Invalid value '" + ex.getValue() + "' for parameter '" + ex.getName() + "'";
        log.warn("{} {} — {}", req.getMethod(), req.getRequestURI(), message);
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, String>> handleMissingParameter(
            MissingServletRequestParameterException ex,
            HttpServletRequest req
    ) {
        log.warn("{} {} — {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<Map<String, String>> handleMissingPart(
            MissingServletRequestPartException ex,
            HttpServletRequest req
    ) {
        log.warn("{} {} — {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex, HttpServletRequest req) {
        String message = ex.getMessage();
        if (message != null && message.toLowerCase(Locale.ROOT).contains("not found")) {
            log.warn("{} {} — {}", req.getMethod(), req.getRequestURI(), message);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", message));
        }
        log.error("{} {} — необработанное исключение", req.getMethod(), req.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "message", Optional.ofNullable(message).orElse(ex.getClass().getSimpleName())
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("{} {} — необработанное исключение", req.getMethod(), req.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "message", Optional.ofNullable(ex.getMessage()).orElse(ex.getClass().getSimpleName())
        ));
    }

}