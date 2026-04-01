package com.eramix.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── Domain exceptions ──────────────────────────────────

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(
            UserNotFoundException ex, HttpServletRequest request) {
        log.warn("Usuario no encontrado: {} | path={}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleEmailExists(
            EmailAlreadyExistsException ex, HttpServletRequest request) {
        log.warn("Email duplicado: {} | path={}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(
            InvalidCredentialsException ex, HttpServletRequest request) {
        log.warn("Credenciales inválidas: IP={} | path={}", request.getRemoteAddr(), request.getRequestURI());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos", request);
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<Map<String, Object>> handleTokenExpired(
            TokenExpiredException ex, HttpServletRequest request) {
        log.warn("Token expirado: {} | path={}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Sesión expirada. Inicia sesión de nuevo.", request);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidToken(
            InvalidTokenException ex, HttpServletRequest request) {
        log.warn("Token inválido: {} | path={}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Token de autenticación inválido", request);
    }

    // ── Validation errors ──────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        log.warn("Validación fallida: {} | path={}", errors, request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, errors, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleBadBody(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Body no legible: {} | path={}", ex.getMostSpecificCause().getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST,
                "El cuerpo de la petición tiene un formato incorrecto o está vacío", request);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        String msg = "Parámetro obligatorio '" + ex.getParameterName() + "' no proporcionado";
        log.warn("Parámetro faltante: {} | path={}", msg, request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, msg, request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String msg = "El parámetro '" + ex.getName() + "' tiene un tipo incorrecto. Se esperaba: "
                + (ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "desconocido");
        log.warn("Tipo incorrecto: {} | path={}", msg, request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, msg, request);
    }

    // ── Security exceptions ────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Acceso denegado: IP={} | path={} | user={}",
                request.getRemoteAddr(), request.getRequestURI(), request.getRemoteUser());
        return buildResponse(HttpStatus.FORBIDDEN,
                "No tienes permisos para realizar esta acción", request);
    }

    // ── HTTP method not supported ──────────────────────────

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotAllowed(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        String msg = "Método HTTP '" + ex.getMethod() + "' no soportado para esta ruta";
        log.warn("Método no permitido: {} | path={}", msg, request.getRequestURI());
        return buildResponse(HttpStatus.METHOD_NOT_ALLOWED, msg, request);
    }

    // ── Resource not found (404 for paths) ─────────────────

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResource(
            NoResourceFoundException ex, HttpServletRequest request) {
        log.debug("Ruta no encontrada: {} {}", request.getMethod(), request.getRequestURI());
        return buildResponse(HttpStatus.NOT_FOUND,
                "La ruta '" + request.getRequestURI() + "' no existe", request);
    }

    // ── Generic fallbacks ──────────────────────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("Argumento inválido: {} | path={}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex, HttpServletRequest request) {
        log.error("Error no controlado: {} | path={} | class={}",
                ex.getMessage(), request.getRequestURI(), ex.getClass().getSimpleName(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno del servidor. Referencia: " + generateRequestId(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Excepción inesperada: {} | path={} | class={}",
                ex.getMessage(), request.getRequestURI(), ex.getClass().getSimpleName(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Error inesperado del servidor. Referencia: " + generateRequestId(), request);
    }

    // ── Helpers ────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status, String message, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", request.getRequestURI());
        body.put("method", request.getMethod());
        return ResponseEntity.status(status).body(body);
    }

    private String generateRequestId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
