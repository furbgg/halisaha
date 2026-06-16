package com.halisaha.admin;

import com.halisaha.common.AppConstants;

import com.halisaha.admin.dto.DashboardResponse;
import com.halisaha.admin.dto.InsightResponse;
import com.halisaha.equipment.repository.EquipmentRentalRepository;
import com.halisaha.field.entity.Field;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.payment.PaymentMethod;
import com.halisaha.payment.repository.PaymentRepository;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

        private final ReservationRepository reservationRepository;
        private final PaymentRepository paymentRepository;
        private final EquipmentRentalRepository equipmentRentalRepository;
        private final FieldRepository fieldRepository;

        private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
        private static final DateTimeFormatter DATE_TIME_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
        private static final String[] MONTH_LABELS = { "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep",
                        "Okt", "Nov", "Dez" };
        private static final String[] DAY_LABELS = { "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So" };
        private static final String[] DAY_FULL_LABELS = { "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag",
                        "Samstag", "Sonntag" };

        @Transactional(readOnly = true)
        public DashboardResponse getDashboard() {
                LocalDate today = LocalDate.now();
                ZonedDateTime todayStart = today.atStartOfDay(AppConstants.VIENNA);
                ZonedDateTime todayEnd = today.plusDays(1).atStartOfDay(AppConstants.VIENNA);

                ZonedDateTime yesterdayStart = today.minusDays(1).atStartOfDay(AppConstants.VIENNA);

                LocalDate weekStart = today.with(DayOfWeek.MONDAY);
                ZonedDateTime weekStartDt = weekStart.atStartOfDay(AppConstants.VIENNA);
                ZonedDateTime weekEndDt = weekStart.plusDays(7).atStartOfDay(AppConstants.VIENNA);

                LocalDate monthStart = today.withDayOfMonth(1);
                ZonedDateTime monthStartDt = monthStart.atStartOfDay(AppConstants.VIENNA);
                ZonedDateTime monthEndDt = monthStart.plusMonths(1).atStartOfDay(AppConstants.VIENNA);

                ZonedDateTime sixMonthsAgo = today.minusMonths(6).withDayOfMonth(1).atStartOfDay(AppConstants.VIENNA);

                long todayCount = reservationRepository.countByDateRange(todayStart, todayEnd);
                long yesterdayCount = reservationRepository.countByDateRange(yesterdayStart, todayStart);
                BigDecimal todayRevenue = reservationRepository.sumRevenueByDateRange(todayStart, todayEnd);

                long weekCount = reservationRepository.countByDateRange(weekStartDt, weekEndDt);
                BigDecimal weekRevenue = reservationRepository.sumRevenueByDateRange(weekStartDt, weekEndDt);

                long monthCount = reservationRepository.countByDateRange(monthStartDt, monthEndDt);
                BigDecimal monthRevenue = reservationRepository.sumRevenueByDateRange(monthStartDt, monthEndDt);

                String lastBookingAgo = calculateLastBookingAgo();

                double utilizationPercent = calculateUtilization(todayStart, todayEnd);

                BigDecimal refundedAmount = paymentRepository.sumRefundedAmount(monthStartDt, monthEndDt);
                long refundedCountLong = paymentRepository.countRefundedPayments(monthStartDt, monthEndDt);
                long failedPaymentCount = paymentRepository.countFailedPayments(monthStartDt, monthEndDt);

                List<Object[]> fieldRows = reservationRepository.getFieldStats(monthStartDt, monthEndDt);
                List<DashboardResponse.FieldStat> fieldStats = fieldRows.stream()
                                .map(row -> DashboardResponse.FieldStat.builder()
                                                .fieldId((Long) row[0])
                                                .fieldName((String) row[1])
                                                .reservationCount((long) row[2])
                                                .revenue((BigDecimal) row[3])
                                                .build())
                                .collect(Collectors.toList());

                List<Reservation> upcoming = reservationRepository.findByDate(todayStart, todayEnd.plusDays(1));
                List<DashboardResponse.UpcomingReservation> upcomingList = upcoming.stream()
                                .filter(r -> r.getStartTime().isAfter(ZonedDateTime.now(AppConstants.VIENNA)))
                                .limit(10)
                                .map(r -> DashboardResponse.UpcomingReservation.builder()
                                                .id(r.getId())
                                                .confirmationCode(r.getConfirmationCode())
                                                .fieldName(r.getField().getName())
                                                .customerName(r.getUser() != null ? r.getUser().getName()
                                                                : r.getGuestName())
                                                .startTime(r.getStartTime().format(DATE_TIME_FMT))
                                                .endTime(r.getEndTime().format(TIME_FMT))
                                                .durationMinutes(r.getDurationMinutes())
                                                .build())
                                .collect(Collectors.toList());

                List<Reservation> todayReservations = reservationRepository.findByDate(todayStart, todayEnd);
                List<DashboardResponse.TimelineEntry> todayTimeline = todayReservations.stream()
                                .map(r -> DashboardResponse.TimelineEntry.builder()
                                                .fieldName(r.getField().getName())
                                                .customerName(r.getUser() != null ? r.getUser().getName()
                                                                : r.getGuestName())
                                                .startTime(r.getStartTime().format(TIME_FMT))
                                                .endTime(r.getEndTime().format(TIME_FMT))
                                                .status(r.getStatus())
                                                .build())
                                .collect(Collectors.toList());

                List<DashboardResponse.DailyRevenue> weeklyRevenue = buildWeeklyRevenue(weekStartDt, weekEndDt);

                List<DashboardResponse.PaymentMethodStat> paymentMethodStats = buildPaymentMethodStats(monthStartDt,
                                monthEndDt);

                ZonedDateTime materialLookback = today.minusMonths(3).withDayOfMonth(1)
                                .atStartOfDay(AppConstants.VIENNA);
                List<DashboardResponse.MaterialStat> topMaterials = buildMaterialStats(materialLookback, monthEndDt);

                List<DashboardResponse.MonthlyRevenue> monthlyTrend = buildMonthlyTrend(sixMonthsAgo, monthEndDt);

                ZonedDateTime heatmapStart = today.minusWeeks(4).with(DayOfWeek.MONDAY)
                                .atStartOfDay(AppConstants.VIENNA);
                List<DashboardResponse.HeatmapCell> hourlyHeatmap = buildHourlyHeatmap(heatmapStart, weekEndDt);

                return DashboardResponse.builder()
                                .todayReservations(todayCount)
                                .yesterdayReservations(yesterdayCount)
                                .todayRevenue(todayRevenue)
                                .lastBookingAgo(lastBookingAgo)
                                .weekReservations(weekCount)
                                .weekRevenue(weekRevenue)
                                .monthReservations(monthCount)
                                .monthRevenue(monthRevenue)
                                .utilizationPercent(utilizationPercent)
                                .refundedAmount(refundedAmount)
                                .refundedCount((int) refundedCountLong)
                                .failedPaymentCount(failedPaymentCount)
                                .fieldStats(fieldStats)
                                .upcomingReservations(upcomingList)
                                .todayTimeline(todayTimeline)
                                .weeklyRevenue(weeklyRevenue)
                                .paymentMethodStats(paymentMethodStats)
                                .topMaterials(topMaterials)
                                .monthlyTrend(monthlyTrend)
                                .hourlyHeatmap(hourlyHeatmap)
                                .insights(buildMonthlyInsights())
                                .build();
        }

        private String calculateLastBookingAgo() {
                Optional<Reservation> latest = reservationRepository.findLatestReservation();
                if (latest.isEmpty())
                        return "-";

                Duration diff = Duration.between(latest.get().getCreatedAt(), ZonedDateTime.now(AppConstants.VIENNA));
                long minutes = diff.toMinutes();
                if (minutes < 1)
                        return "jetzt";
                if (minutes < 60)
                        return minutes + "m";
                long hours = diff.toHours();
                if (hours < 24)
                        return hours + "h";
                return diff.toDays() + "d";
        }

        private double calculateUtilization(ZonedDateTime dayStart, ZonedDateTime dayEnd) {
                List<Field> activeFields = fieldRepository.findByActiveTrue();
                if (activeFields.isEmpty())
                        return 0.0;

                long totalAvailableMinutes = 0;
                for (Field field : activeFields) {
                        LocalTime open = field.getOpeningTime();
                        LocalTime close = field.getClosingTime();
                        long fieldMinutes = Duration.between(open, close).toMinutes();
                        if (fieldMinutes <= 0) {
                                fieldMinutes += 24 * 60;
                        }
                        totalAvailableMinutes += fieldMinutes;
                }

                if (totalAvailableMinutes == 0)
                        return 0.0;

                long bookedMinutes = reservationRepository.sumBookedMinutes(dayStart, dayEnd);
                double utilization = (double) bookedMinutes / totalAvailableMinutes * 100;
                return Math.min(100.0, Math.round(utilization * 10.0) / 10.0);
        }

        private List<DashboardResponse.DailyRevenue> buildWeeklyRevenue(ZonedDateTime weekStart,
                        ZonedDateTime weekEnd) {
                List<Object[]> rows = reservationRepository.getDailyRevenueBreakdown(weekStart, weekEnd);

                Map<LocalDate, BigDecimal> revenueMap = rows.stream()
                                .collect(Collectors.toMap(
                                                row -> {
                                                        Object dateObj = row[0];
                                                        if (dateObj instanceof java.sql.Date) {
                                                                return ((java.sql.Date) dateObj).toLocalDate();
                                                        }
                                                        return (LocalDate) dateObj;
                                                },
                                                row -> (BigDecimal) row[1],
                                                (a, b) -> a.add(b)));

                List<DashboardResponse.DailyRevenue> result = new ArrayList<>();
                LocalDate date = weekStart.toLocalDate();
                for (int i = 0; i < 7; i++) {
                        LocalDate d = date.plusDays(i);
                        String label = DAY_LABELS[i];
                        BigDecimal rev = revenueMap.getOrDefault(d, BigDecimal.ZERO);
                        result.add(DashboardResponse.DailyRevenue.builder()
                                        .dayLabel(label)
                                        .revenue(rev)
                                        .build());
                }
                return result;
        }

        private List<DashboardResponse.PaymentMethodStat> buildPaymentMethodStats(ZonedDateTime from,
                        ZonedDateTime to) {
                List<Object[]> rows = reservationRepository.getPaymentMethodDistribution(from, to);
                long total = rows.stream().mapToLong(r -> (long) r[1]).sum();
                if (total == 0)
                        return List.of();

                return rows.stream()
                                .map(row -> {
                                        PaymentMethod method = (PaymentMethod) row[0];
                                        long count = (long) row[1];
                                        double pct = BigDecimal.valueOf(count)
                                                        .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                                                        .multiply(BigDecimal.valueOf(100))
                                                        .setScale(1, RoundingMode.HALF_UP)
                                                        .doubleValue();
                                        return DashboardResponse.PaymentMethodStat.builder()
                                                        .method(method)
                                                        .count(count)
                                                        .percentage(pct)
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        private List<DashboardResponse.MaterialStat> buildMaterialStats(ZonedDateTime from, ZonedDateTime to) {
                List<Object[]> rows = equipmentRentalRepository.getMostRentedEquipment(from, to);
                if (rows.isEmpty())
                        return List.of();

                long maxRentals = ((Number) rows.get(0)[1]).longValue();

                return rows.stream()
                                .limit(5)
                                .map(row -> DashboardResponse.MaterialStat.builder()
                                                .name((String) row[0])
                                                .rentalCount(((Number) row[1]).longValue())
                                                .maxRentals(maxRentals)
                                                .build())
                                .collect(Collectors.toList());
        }

        private List<DashboardResponse.MonthlyRevenue> buildMonthlyTrend(ZonedDateTime from, ZonedDateTime to) {
                List<Object[]> rows = reservationRepository.getMonthlyRevenueTrend(from, to);

                return rows.stream()
                                .map(row -> {
                                        int monthIndex = ((Number) row[1]).intValue() - 1;
                                        String label = monthIndex >= 0 && monthIndex < 12 ? MONTH_LABELS[monthIndex]
                                                        : "?";
                                        return DashboardResponse.MonthlyRevenue.builder()
                                                        .monthLabel(label)
                                                        .revenue((BigDecimal) row[2])
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        private List<DashboardResponse.HeatmapCell> buildHourlyHeatmap(ZonedDateTime from, ZonedDateTime to) {
                List<Object[]> rows = reservationRepository.getHourlyUtilization(from, to);
                if (rows.isEmpty())
                        return List.of();

                long maxCount = rows.stream()
                                .mapToLong(r -> ((Number) r[2]).longValue())
                                .max()
                                .orElse(1);

                return rows.stream()
                                .map(row -> {
                                        int dow = ((Number) row[0]).intValue();
                                        int hour = ((Number) row[1]).intValue();
                                        long count = ((Number) row[2]).longValue();
                                        double intensity = (double) count / maxCount;

                                        String dayLabel;
                                        switch (dow) {
                                                case 1:
                                                        dayLabel = "Mo";
                                                        break;
                                                case 2:
                                                        dayLabel = "Di";
                                                        break;
                                                case 3:
                                                        dayLabel = "Mi";
                                                        break;
                                                case 4:
                                                        dayLabel = "Do";
                                                        break;
                                                case 5:
                                                        dayLabel = "Fr";
                                                        break;
                                                case 6:
                                                        dayLabel = "Sa";
                                                        break;
                                                case 0:
                                                        dayLabel = "So";
                                                        break;
                                                default:
                                                        dayLabel = "?";
                                        }

                                        String timeSlot;
                                        if (hour >= 9 && hour < 12)
                                                timeSlot = "09-12";
                                        else if (hour >= 12 && hour < 16)
                                                timeSlot = "13-16";
                                        else if (hour >= 16 && hour < 20)
                                                timeSlot = "17-20";
                                        else
                                                timeSlot = "21-23";

                                        return DashboardResponse.HeatmapCell.builder()
                                                        .dayOfWeek(dayLabel)
                                                        .timeSlot(timeSlot)
                                                        .intensity(Math.round(intensity * 100.0) / 100.0)
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        private InsightResponse buildMonthlyInsights() {
                LocalDate today = LocalDate.now();
                LocalDate lastMonthStart = today.minusMonths(1).withDayOfMonth(1);
                LocalDate lastMonthEnd = lastMonthStart.plusMonths(1);
                ZonedDateTime from = lastMonthStart.atStartOfDay(AppConstants.VIENNA);
                ZonedDateTime to = lastMonthEnd.atStartOfDay(AppConstants.VIENNA);

                String monthLabel = MONTH_LABELS[lastMonthStart.getMonthValue() - 1] + " " + lastMonthStart.getYear();

                List<Reservation> allReservations = reservationRepository.findByDateRange(from, to);
                List<Field> activeFields = fieldRepository.findByActiveTrue();

                List<InsightResponse.FieldInsight> fieldInsights = new ArrayList<>();

                for (Field field : activeFields) {
                        List<Reservation> fieldReservations = allReservations.stream()
                                        .filter(r -> r.getField().getId().equals(field.getId()))
                                        .collect(Collectors.toList());

                        Map<DayOfWeek, Long> dayCountMap = new TreeMap<>();
                        for (DayOfWeek dow : DayOfWeek.values()) {
                                dayCountMap.put(dow, 0L);
                        }
                        for (Reservation r : fieldReservations) {
                                DayOfWeek dow = r.getStartTime().toLocalDate().getDayOfWeek();
                                dayCountMap.merge(dow, 1L, (a, b) -> a + b);
                        }

                        double totalBookings = dayCountMap.values().stream().mapToLong(v -> v).sum();
                        List<InsightResponse.WeakDay> weakestDays = dayCountMap.entrySet().stream()
                                        .sorted(Map.Entry.comparingByValue())
                                        .limit(2)
                                        .map(entry -> {
                                                int dayIdx = entry.getKey().getValue() - 1;
                                                long count = entry.getValue();
                                                double otherTotal = totalBookings - count;
                                                double avgOther = otherTotal / 6.0;
                                                return InsightResponse.WeakDay.builder()
                                                                .dayName(DAY_FULL_LABELS[dayIdx])
                                                                .bookingCount((int) count)
                                                                .avgOtherDays(Math.round(avgOther * 10.0) / 10.0)
                                                                .build();
                                        })
                                        .collect(Collectors.toList());

                        Map<String, Integer> slotCountMap = new TreeMap<>();

                        for (DayOfWeek dow : DayOfWeek.values()) {
                                LocalDate sampleDate = lastMonthStart;
                                while (sampleDate.getDayOfWeek() != dow && sampleDate.isBefore(lastMonthEnd)) {
                                        sampleDate = sampleDate.plusDays(1);
                                }
                                LocalTime openTime = field.getOpeningTimeForDate(sampleDate);
                                LocalTime closeTime = field.getClosingTimeForDate(sampleDate);
                                int startHour = openTime.getHour();
                                int endHour = closeTime.getHour();
                                if (endHour <= startHour)
                                        endHour = 23;
                                int dayIdx = dow.getValue() - 1;
                                for (int h = startHour; h < endHour; h++) {
                                        String key = DAY_FULL_LABELS[dayIdx] + "|"
                                                        + String.format("%02d:00 – %02d:00", h, h + 1);
                                        slotCountMap.put(key, 0);
                                }
                        }

                        for (Reservation r : fieldReservations) {
                                int hour = r.getStartTime().getHour();
                                int dayIdx = r.getStartTime().toLocalDate().getDayOfWeek().getValue() - 1;
                                String key = DAY_FULL_LABELS[dayIdx] + "|"
                                                + String.format("%02d:00 – %02d:00", hour, hour + 1);
                                slotCountMap.merge(key, 1, (a, b) -> a + b);
                        }

                        List<InsightResponse.WeakSlot> weakestSlots = slotCountMap.entrySet().stream()
                                        .sorted(Map.Entry.comparingByValue())
                                        .limit(5)
                                        .map(entry -> {
                                                String[] parts = entry.getKey().split("\\|");
                                                return InsightResponse.WeakSlot.builder()
                                                                .dayName(parts[0])
                                                                .timeRange(parts[1])
                                                                .bookingCount(entry.getValue())
                                                                .build();
                                        })
                                        .collect(Collectors.toList());

                        fieldInsights.add(InsightResponse.FieldInsight.builder()
                                        .fieldId(field.getId())
                                        .fieldName(field.getName())
                                        .totalBookings(fieldReservations.size())
                                        .weakestDays(weakestDays)
                                        .weakestSlots(weakestSlots)
                                        .build());
                }

                return InsightResponse.builder()
                                .analyzedMonth(monthLabel)
                                .totalReservations(allReservations.size())
                                .fieldInsights(fieldInsights)
                                .build();
        }
}
