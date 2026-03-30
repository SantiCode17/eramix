package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "friendship",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id_1", "user_id_2"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Friendship extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id_1", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id_2", nullable = false)
    private User user2;
}
