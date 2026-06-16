package com.halisaha.common;

import java.time.ZoneId;

/**
 * Central application constants.
 * All services should use VIENNA for timezone-aware operations.
 */
public final class AppConstants {

    private AppConstants() {
    }

    /** Europe/Vienna — covers Austria (CET / CEST with DST). */
    public static final ZoneId VIENNA = ZoneId.of("Europe/Vienna");
}
