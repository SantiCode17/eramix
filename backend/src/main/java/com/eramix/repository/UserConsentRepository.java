package com.eramix.repository;

import com.eramix.entity.UserConsent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserConsentRepository extends JpaRepository<UserConsent, Long> {
    Optional<UserConsent> findByUserId(Long userId);
}
