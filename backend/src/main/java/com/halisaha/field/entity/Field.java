package com.halisaha.field.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "fields")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "supported_sports", nullable = false)
    private String[] supportedSports;

    @Column(name = "hourly_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyPrice;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allowed_durations", nullable = false)
    private Integer[] allowedDurations;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean active = true;

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    @Column(name = "weekday_opening")
    private LocalTime weekdayOpening;

    @Column(name = "weekday_closing")
    private LocalTime weekdayClosing;

    @Column(name = "weekend_opening")
    private LocalTime weekendOpening;

    @Column(name = "weekend_closing")
    private LocalTime weekendClosing;

    /**
     * Returns opening time for a specific date.
     * Mo-Do (weekday) vs Fr-So (weekend).
     * Falls back to openingTime if schedule not configured.
     */
    public LocalTime getOpeningTimeForDate(LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        boolean isWeekend = dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
        if (isWeekend && weekendOpening != null) {
            return weekendOpening;
        }
        if (!isWeekend && weekdayOpening != null) {
            return weekdayOpening;
        }
        return openingTime;
    }

    /**
     * Returns closing time for a specific date.
     * If closing < opening, it means next day (midnight crossing).
     * Falls back to closingTime if schedule not configured.
     */
    public LocalTime getClosingTimeForDate(LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        boolean isWeekend = dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
        if (isWeekend && weekendClosing != null) {
            return weekendClosing;
        }
        if (!isWeekend && weekdayClosing != null) {
            return weekdayClosing;
        }
        return closingTime;
    }

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
