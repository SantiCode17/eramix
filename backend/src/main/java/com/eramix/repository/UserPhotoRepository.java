package com.eramix.repository;

import com.eramix.entity.UserPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPhotoRepository extends JpaRepository<UserPhoto, Long> {

    List<UserPhoto> findByUserIdOrderByDisplayOrderAsc(Long userId);

    long countByUserId(Long userId);
}
