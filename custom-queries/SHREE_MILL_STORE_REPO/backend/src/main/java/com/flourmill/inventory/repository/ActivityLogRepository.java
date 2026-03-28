package com.flourmill.inventory.repository;

import com.flourmill.inventory.model.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findByActionIn(List<ActivityLog.Action> actions, Pageable pageable);

    Page<ActivityLog> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<ActivityLog> findByActionInAndCreatedAtBetween(
            List<ActivityLog.Action> actions, LocalDateTime from, LocalDateTime to, Pageable pageable);

    List<ActivityLog> findTop10ByOrderByCreatedAtDesc();
}
