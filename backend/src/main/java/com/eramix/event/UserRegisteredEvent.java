package com.eramix.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Evento publicado cuando un usuario se registra exitosamente.
 * Se usa para auto-crear/asignar comunidades de universidad y ciudad.
 */
@Getter
public class UserRegisteredEvent extends ApplicationEvent {

    private final Long userId;
    private final String universityName;  // nombre de la host university
    private final String destinationCity;
    private final String destinationCountry;

    public UserRegisteredEvent(Object source, Long userId, String universityName,
                                String destinationCity, String destinationCountry) {
        super(source);
        this.userId = userId;
        this.universityName = universityName;
        this.destinationCity = destinationCity;
        this.destinationCountry = destinationCountry;
    }
}
