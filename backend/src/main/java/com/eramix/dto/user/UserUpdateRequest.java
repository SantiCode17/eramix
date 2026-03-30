package com.eramix.dto.user;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 500)
    private String bio;

    private Long homeUniversityId;

    private Long hostUniversityId;

    @Size(max = 100)
    private String destinationCity;

    @Size(max = 100)
    private String destinationCountry;

    private LocalDate mobilityStartDate;

    private LocalDate mobilityEndDate;

    /** IDs de intereses seleccionados */
    private List<Long> interestIds;

    /** Lista de idiomas con nivel */
    private List<UserLanguageRequest> languages;
}
