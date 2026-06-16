package com.halisaha.user;

import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.reservation.ReservationService;
import com.halisaha.reservation.dto.ReservationResponse;
import com.halisaha.user.dto.UpdateProfileRequest;
import com.halisaha.user.dto.UserProfileResponse;
import com.halisaha.user.entity.User;
import com.halisaha.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ReservationService reservationService;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = findUser(userId);
        return toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUser(userId);
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        userRepository.save(user);
        return toProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getUserReservations(Long userId) {
        return reservationService.getUserReservations(userId);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = findUser(userId);
        user.setName("Gelöschter Benutzer");
        user.setEmail("deleted_" + userId + "@anonymized.local");
        user.setPhone(null);
        user.setPasswordHash("DELETED");
        user.setTotpSecret(null);
        user.setActive(false);
        userRepository.save(user);
        log.info("User account {} deleted (anonymized) per DSGVO request", userId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportUserData(Long userId) {
        User user = findUser(userId);
        List<ReservationResponse> reservations = reservationService.getUserReservations(userId);

        Map<String, Object> data = new HashMap<>();
        data.put("displayId", user.getDisplayId());
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("phone", user.getPhone());
        data.put("role", user.getRole().name());
        data.put("createdAt", user.getCreatedAt());
        data.put("reservations", reservations);
        return data;
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Benutzer nicht gefunden"));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .displayId(user.getDisplayId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .totpEnabled(user.getTotpSecret() != null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
