package com.eramix.dto.auth;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 128, message = "La contraseña debe tener entre 8 y 128 caracteres")
    private String password;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100)
    private String lastName;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser pasada")
    private LocalDate dateOfBirth;

    private Long homeUniversityId;

    private Long hostUniversityId;

    @Size(max = 100)
    private String destinationCity;

    @Size(max = 100)
    private String destinationCountry;

    private LocalDate mobilityStartDate;

    private LocalDate mobilityEndDate;

    private String authProvider;

    private String providerId;

    private String degree;

    private String gender;

    private String lookingForGender;

    private Boolean showGenderOnProfile;

    private Boolean notificationsEnabled;

    private java.util.Set<String> intentions;

    private java.util.List<com.eramix.dto.user.UserLanguageRequest> languages;

    private java.util.Set<Long> interestIds;
}
