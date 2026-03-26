package com.moodify.repository;

import com.moodify.entity.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {
    List<UserFeedback> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<UserFeedback> findByUserIdAndCreatedAtBetweenOrderByCreatedAtAsc(
            Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT AVG(f.rating) FROM UserFeedback f WHERE f.user.id = :userId")
    Double findAverageRatingByUserId(@Param("userId") Long userId);

    long countByUserId(Long userId);
}
