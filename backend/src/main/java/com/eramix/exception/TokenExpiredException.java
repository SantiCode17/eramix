package com.eramix.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class TokenExpiredException extends RuntimeException {

    public TokenExpiredException() {
        super("El token ha expirado");
    }

    public TokenExpiredException(String message) {
        super(message);
    }
}
