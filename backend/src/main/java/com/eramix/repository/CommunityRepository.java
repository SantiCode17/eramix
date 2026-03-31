package com.eramix.repository;

import com.eramix.entity.Community;
import com.eramix.entity.enums.CommunityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    List<Community> findByCategory(CommunityCategory category);

    @Query("SELECT c FROM Community c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Community> searchByName(@Param("query") String query);

    @Query("SELECT c FROM Community c WHERE c.category = :category AND LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Community> searchByCategoryAndName(@Param("category") CommunityCategory category, @Param("query") String query);

    Optional<Community> findByNameIgnoreCase(String name);

    @Query("SELECT c FROM Community c WHERE c.id NOT IN " +
            "(SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :userId) " +
            "AND c.isPublic = true ORDER BY c.memberCount DESC")
    List<Community> findSuggestedForUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Community c JOIN CommunityMember cm ON cm.community.id = c.id " +
            "WHERE cm.user.id = :userId ORDER BY c.name ASC")
    List<Community> findAllByMemberUserId(@Param("userId") Long userId);
}
