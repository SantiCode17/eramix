package com.eramix.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "roommate_preference")
@Getter @Setter @NoArgsConstructor
public class RoommatePreference extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "max_budget")
    private BigDecimal maxBudget;

    @Column(name = "preferred_city", length = 100)
    private String preferredCity;

    @Column(name = "move_in_date")
    private LocalDate moveInDate;

    @Column
    private Boolean smoking = false;

    @Column(name = "pets_ok")
    private Boolean petsOk = true;

    @Column(name = "night_owl")
    private Boolean nightOwl = false;

    @Column(length = 500)
    private String bio;
}
