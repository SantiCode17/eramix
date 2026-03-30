package com.eramix.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException() {
        super("Token inválido");
    }

    public InvalidTokenException(String message) {
        super(message);
    }
}
