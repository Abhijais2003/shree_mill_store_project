package com.flourmill.inventory.service;

import com.flourmill.inventory.model.dto.ActivityLogDTO;
import com.flourmill.inventory.model.entity.ActivityLog;
import com.flourmill.inventory.repository.ActivityLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void log(Long productId, String productName, ActivityLog.Action action, String details) {
        ActivityLog log = new ActivityLog(productId, productName, action, details);
        activityLogRepository.save(log);
    }

    public void log(Long productId, String productName, ActivityLog.Action action,
                    String details, String oldValue, String newValue) {
        ActivityLog log = new ActivityLog(productId, productName, action, details);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        activityLogRepository.save(log);
    }

    public Page<ActivityLogDTO> getActivity(List<String> actions, LocalDateTime from,
                                             LocalDateTime to, Pageable pageable) {
        if (actions != null && !actions.isEmpty() && from != null && to != null) {
            List<ActivityLog.Action> actionEnums = actions.stream()
                    .map(ActivityLog.Action::valueOf)
                    .collect(Collectors.toList());
            return activityLogRepository.findByActionInAndCreatedAtBetween(actionEnums, from, to, pageable)
                    .map(ActivityLogDTO::fromEntity);
        } else if (actions != null && !actions.isEmpty()) {
            List<ActivityLog.Action> actionEnums = actions.stream()
                    .map(ActivityLog.Action::valueOf)
                    .collect(Collectors.toList());
            return activityLogRepository.findByActionIn(actionEnums, pageable)
                    .map(ActivityLogDTO::fromEntity);
        } else if (from != null && to != null) {
            return activityLogRepository.findByCreatedAtBetween(from, to, pageable)
                    .map(ActivityLogDTO::fromEntity);
        } else {
            return activityLogRepository.findAll(pageable).map(ActivityLogDTO::fromEntity);
        }
    }

    public List<ActivityLogDTO> getRecentActivity() {
        return activityLogRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(ActivityLogDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
