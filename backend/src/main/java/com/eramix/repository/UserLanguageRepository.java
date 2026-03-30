package com.eramix.repository;

import com.eramix.entity.UserLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserLanguageRepository extends JpaRepository<UserLanguage, UserLanguage.UserLanguageId> {

    List<UserLanguage> findByUserId(Long userId);
}
