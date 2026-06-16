package com.halisaha.payment;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.payment.dto.CreatePaymentRequest;
import com.halisaha.payment.dto.PaymentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPaymentIntent(
            @Valid @RequestBody CreatePaymentRequest request,
            @RequestHeader(value = "X-Manage-Token", required = false) String manageTokenHeader,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        boolean isAdmin = isAdmin(authentication);
        PaymentResponse response = paymentService.initiatePayment(
                request.getReservationId(),
                userId,
                isAdmin,
                resolveManageToken(manageTokenHeader, request.getManageToken()));
        return ResponseEntity.ok(ApiResponse.success("Zahlung erstellt", response));
    }

    @PostMapping("/{reservationId}/on-site")
    public ResponseEntity<ApiResponse<Void>> markOnSite(
            @PathVariable Long reservationId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        boolean isAdmin = isAdmin(authentication);
        paymentService.markAsOnSite(reservationId, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Als Vor-Ort-Zahlung markiert", null));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{reservationId}/refund")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refund(@PathVariable Long reservationId) {
        BigDecimal amount = paymentService.processRefund(reservationId);
        return ResponseEntity.ok(ApiResponse.success("Erstattung verarbeitet",
                Map.of("refundedAmount", amount)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/{reservationId}/refund")
    public ResponseEntity<ApiResponse<Map<String, Object>>> adminRefund(
            @PathVariable Long reservationId,
            @RequestParam BigDecimal amount) {
        BigDecimal refunded = paymentService.processAdminRefund(reservationId, amount);
        return ResponseEntity.ok(ApiResponse.success("Admin-Erstattung verarbeitet",
                Map.of("refundedAmount", refunded)));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        return principal instanceof Long ? (Long) principal : null;
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private String resolveManageToken(String headerValue, String bodyValue) {
        if (headerValue != null && !headerValue.isBlank()) {
            return headerValue.trim();
        }
        if (bodyValue != null && !bodyValue.isBlank()) {
            return bodyValue.trim();
        }
        return null;
    }
}
