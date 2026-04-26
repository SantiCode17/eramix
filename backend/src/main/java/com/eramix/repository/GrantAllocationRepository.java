package com.eramix.repository;

import com.eramix.entity.GrantAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GrantAllocationRepository extends JpaRepository<GrantAllocation, Long> {
    List<GrantAllocation> findByUserId(Long userId);
}
