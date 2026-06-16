package com.halisaha.admin;

import com.halisaha.common.AppConstants;

import com.halisaha.admin.dto.DailyReportResponse;
import com.halisaha.admin.dto.MonthlyReportResponse;
import com.halisaha.admin.dto.PeakHoursResponse;
import com.halisaha.equipment.entity.EquipmentRental;
import com.halisaha.equipment.repository.EquipmentRentalRepository;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.payment.ReservationPaymentStatus;
import com.halisaha.reservation.ReservationStatus;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

        private final ReservationRepository reservationRepository;
        private final FieldRepository fieldRepository;
        private final EquipmentRentalRepository equipmentRentalRepository;

        @Transactional(readOnly = true)
        public DailyReportResponse getDailyReport(LocalDate date) {
                ZonedDateTime dayStart = date.atStartOfDay(AppConstants.VIENNA);
                ZonedDateTime dayEnd = date.plusDays(1).atStartOfDay(AppConstants.VIENNA);

                List<Reservation> all = reservationRepository.findByDateRange(dayStart, dayEnd);

                long total = all.stream().filter(r -> r.getStatus() != ReservationStatus.CANCELLED).count();
                long cancelled = all.stream().filter(r -> r.getStatus() == ReservationStatus.CANCELLED).count();
                long completed = all.stream().filter(r -> r.getStatus() == ReservationStatus.COMPLETED).count();

                BigDecimal paidRevenue = sumByPaymentStatus(all, ReservationPaymentStatus.PAID);
                BigDecimal onSiteRevenue = sumByPaymentStatus(all, ReservationPaymentStatus.ON_SITE);
                BigDecimal refundedAmount = sumByPaymentStatus(all, ReservationPaymentStatus.REFUNDED);
                BigDecimal totalRevenue = paidRevenue.add(onSiteRevenue);
                BigDecimal netRevenue = totalRevenue.subtract(refundedAmount);

                BigDecimal equipmentRevenue = calculateEquipmentRevenue(all);

                List<Object[]> fieldRows = reservationRepository.getFieldStats(dayStart, dayEnd);
                List<DailyReportResponse.FieldBreakdown> fieldBreakdown = fieldRows.stream()
                                .map(row -> DailyReportResponse.FieldBreakdown.builder()
                                                .fieldId((Long) row[0])
                                                .fieldName((String) row[1])
                                                .reservationCount((long) row[2])
                                                .revenue((BigDecimal) row[3])
                                                .build())
                                .collect(Collectors.toList());

                Map<Integer, Long> hourly = new LinkedHashMap<>();
                for (int h = 9; h <= 22; h++) {
                        final int hour = h;
                        long count = all.stream()
                                        .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                                        .filter(r -> r.getStartTime().getHour() == hour)
                                        .count();
                        hourly.put(hour, count);
                }

                return DailyReportResponse.builder()
                                .date(date.toString())
                                .totalReservations(total)
                                .cancelledReservations(cancelled)
                                .completedReservations(completed)
                                .totalRevenue(totalRevenue)
                                .paidRevenue(paidRevenue)
                                .onSiteRevenue(onSiteRevenue)
                                .refundedAmount(refundedAmount)
                                .netRevenue(netRevenue)
                                .equipmentRentalRevenue(equipmentRevenue)
                                .fieldBreakdown(fieldBreakdown)
                                .hourlyBreakdown(hourly)
                                .build();
        }

        @Transactional(readOnly = true)
        public MonthlyReportResponse getMonthlyReport(YearMonth month) {
                ZonedDateTime monthStart = month.atDay(1).atStartOfDay(AppConstants.VIENNA);
                ZonedDateTime monthEnd = month.plusMonths(1).atDay(1).atStartOfDay(AppConstants.VIENNA);

                List<Reservation> all = reservationRepository.findByDateRange(monthStart, monthEnd);

                long total = all.stream().filter(r -> r.getStatus() != ReservationStatus.CANCELLED).count();
                long cancelled = all.stream().filter(r -> r.getStatus() == ReservationStatus.CANCELLED).count();

                BigDecimal paidRevenue = sumByPaymentStatus(all, ReservationPaymentStatus.PAID);
                BigDecimal onSiteRevenue = sumByPaymentStatus(all, ReservationPaymentStatus.ON_SITE);
                BigDecimal refundedAmount = sumByPaymentStatus(all, ReservationPaymentStatus.REFUNDED);
                BigDecimal totalRevenue = paidRevenue.add(onSiteRevenue);
                BigDecimal netRevenue = totalRevenue.subtract(refundedAmount);
                BigDecimal equipmentRevenue = calculateEquipmentRevenue(all);

                int daysInMonth = month.lengthOfMonth();
                BigDecimal avgDaily = daysInMonth > 0
                                ? totalRevenue.divide(BigDecimal.valueOf(daysInMonth), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                Map<LocalDate, Long> dailyCounts = all.stream()
                                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                                .collect(Collectors.groupingBy(r -> r.getStartTime().toLocalDate(),
                                                Collectors.counting()));
                String busiestDay = dailyCounts.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(e -> e.getKey().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")))
                                .orElse("-");

                Map<Integer, Long> hourlyCounts = buildHourlyCounts(all);
                int busiestHour = hourlyCounts.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey).orElse(18);
                int quietestHour = hourlyCounts.entrySet().stream()
                                .min(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey).orElse(9);

                Map<String, Long> paymentBreakdown = all.stream()
                                .filter(r -> r.getPaymentMethod() != null)
                                .collect(Collectors.groupingBy(r -> r.getPaymentMethod().name(),
                                                Collectors.counting()));

                List<Object[]> fieldRows = reservationRepository.getFieldStats(monthStart, monthEnd);
                List<DailyReportResponse.FieldBreakdown> fieldComparison = fieldRows.stream()
                                .map(row -> DailyReportResponse.FieldBreakdown.builder()
                                                .fieldId((Long) row[0])
                                                .fieldName((String) row[1])
                                                .reservationCount((long) row[2])
                                                .revenue((BigDecimal) row[3])
                                                .build())
                                .collect(Collectors.toList());

                YearMonth prevMonth = month.minusMonths(1);
                ZonedDateTime prevStart = prevMonth.atDay(1).atStartOfDay(AppConstants.VIENNA);
                ZonedDateTime prevEnd = month.atDay(1).atStartOfDay(AppConstants.VIENNA);
                long prevCount = reservationRepository.countByDateRange(prevStart, prevEnd);
                BigDecimal prevRevenue = reservationRepository.sumRevenueByDateRange(prevStart, prevEnd);

                BigDecimal revenueChange = totalRevenue.subtract(prevRevenue);
                double changePercent = prevRevenue.compareTo(BigDecimal.ZERO) > 0
                                ? revenueChange.divide(prevRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100
                                : 0;

                return MonthlyReportResponse.builder()
                                .month(month.toString())
                                .totalReservations(total)
                                .cancelledReservations(cancelled)
                                .totalRevenue(totalRevenue)
                                .paidRevenue(paidRevenue)
                                .onSiteRevenue(onSiteRevenue)
                                .refundedAmount(refundedAmount)
                                .netRevenue(netRevenue)
                                .averageDailyRevenue(avgDaily)
                                .equipmentRentalRevenue(equipmentRevenue)
                                .busiestDay(busiestDay)
                                .busiestHour(busiestHour)
                                .quietestHour(quietestHour)
                                .paymentMethodBreakdown(paymentBreakdown)
                                .fieldComparison(fieldComparison)
                                .comparison(MonthlyReportResponse.ComparisonToPreviousMonth.builder()
                                                .revenueChange(revenueChange)
                                                .revenueChangePercent(changePercent)
                                                .reservationChange(total - prevCount)
                                                .build())
                                .build();
        }

        @Transactional(readOnly = true)
        public PeakHoursResponse getPeakHours(YearMonth month) {
                ZonedDateTime monthStart = month.atDay(1).atStartOfDay(AppConstants.VIENNA);
                ZonedDateTime monthEnd = month.plusMonths(1).atDay(1).atStartOfDay(AppConstants.VIENNA);

                List<Reservation> all = reservationRepository.findByDateRange(monthStart, monthEnd);

                long totalFields = fieldRepository.count();
                int daysInMonth = month.lengthOfMonth();
                double maxSlotsPerHour = totalFields * daysInMonth;

                Map<Integer, Long> hourlyCounts = buildHourlyCounts(all);

                Map<Integer, Double> occupancy = new LinkedHashMap<>();
                List<Integer> peakHours = new ArrayList<>();
                List<Integer> quietHours = new ArrayList<>();

                for (int h = 9; h <= 22; h++) {
                        long count = hourlyCounts.getOrDefault(h, 0L);
                        double rate = maxSlotsPerHour > 0 ? (count / maxSlotsPerHour) * 100 : 0;
                        occupancy.put(h, Math.round(rate * 10.0) / 10.0);

                        if (rate >= 70)
                                peakHours.add(h);
                        if (rate < 30)
                                quietHours.add(h);
                }

                String recommendation = buildRecommendation(quietHours, peakHours, month);

                return PeakHoursResponse.builder()
                                .month(month.toString())
                                .hourlyOccupancy(occupancy)
                                .peakHours(peakHours)
                                .quietHours(quietHours)
                                .recommendation(recommendation)
                                .build();
        }

        private BigDecimal sumByPaymentStatus(List<Reservation> reservations, ReservationPaymentStatus status) {
                return reservations.stream()
                                .filter(r -> r.getPaymentStatus() == status)
                                .map(Reservation::getTotalPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        private BigDecimal calculateEquipmentRevenue(List<Reservation> reservations) {
                List<Long> ids = reservations.stream()
                                .map(Reservation::getId)
                                .collect(Collectors.toList());
                if (ids.isEmpty())
                        return BigDecimal.ZERO;

                return equipmentRentalRepository.findByReservationIdIn(ids).stream()
                                .map(EquipmentRental::getRentalPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        private Map<Integer, Long> buildHourlyCounts(List<Reservation> reservations) {
                Map<Integer, Long> counts = new LinkedHashMap<>();
                for (int h = 9; h <= 22; h++) {
                        counts.put(h, 0L);
                }
                reservations.stream()
                                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                                .forEach(r -> {
                                        int hour = r.getStartTime().getHour();
                                        counts.merge(hour, 1L, (a, b) -> a + b);
                                });
                return counts;
        }

        private String buildRecommendation(List<Integer> quietHours, List<Integer> peakHours, YearMonth month) {
                if (quietHours.isEmpty()) {
                        return "Alle Zeitfenster sind gut ausgelastet. Keine Rabattaktion nötig.";
                }

                String quietRange = quietHours.stream()
                                .map(h -> String.format("%02d:00", h))
                                .collect(Collectors.joining(", "));

                String monthName = month.getMonth().getDisplayName(TextStyle.FULL, Locale.GERMAN);

                return String.format(
                                "Die Zeiten %s sind im %s wenig gebucht (unter 30%% Auslastung). " +
                                                "Eine Rabattaktion oder ein Sonderangebot könnte hier mehr Kunden anziehen.",
                                quietRange, monthName);
        }
}
