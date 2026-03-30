package com.eramix.repository;

import com.eramix.entity.FriendRequest;
import com.eramix.entity.enums.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    List<FriendRequest> findByReceiverIdAndStatus(Long receiverId, FriendRequestStatus status);

    List<FriendRequest> findBySenderIdAndStatus(Long senderId, FriendRequestStatus status);

    @Query("SELECT fr FROM FriendRequest fr WHERE " +
            "((fr.sender.id = :userId1 AND fr.receiver.id = :userId2) OR " +
            " (fr.sender.id = :userId2 AND fr.receiver.id = :userId1))")
    Optional<FriendRequest> findBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    boolean existsBySenderIdAndReceiverId(Long senderId, Long receiverId);
}
