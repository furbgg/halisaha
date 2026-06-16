package com.halisaha.auth;

import com.halisaha.common.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("LoginRateLimiter — IP-basierte Rate-Limiting-Logik")
class LoginRateLimiterTest {

    private LoginRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new LoginRateLimiter();
    }


    @Nested
    @DisplayName("Grundlegende Rate-Limiting-Logik")
    class BasicRateLimitTests {

        @Test
        @DisplayName("Erste Anfrage wird nicht blockiert")
        void firstRequest_isNotBlocked() {
            assertThatCode(() -> rateLimiter.checkRateLimit("192.168.1.1"))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Weniger als 5 Versuche werden nicht blockiert")
        void underFiveAttempts_notBlocked() {
            String ip = "192.168.1.2";

            for (int i = 0; i < 4; i++) {
                rateLimiter.recordAttempt(ip);
            }

            assertThatCode(() -> rateLimiter.checkRateLimit(ip))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Genau 5 Versuche loesen Rate-Limit aus")
        void exactlyFiveAttempts_triggersRateLimit() {
            String ip = "192.168.1.3";

            for (int i = 0; i < 5; i++) {
                rateLimiter.recordAttempt(ip);
            }

            assertThatThrownBy(() -> rateLimiter.checkRateLimit(ip))
                    .isInstanceOf(RateLimitExceededException.class)
                    .hasMessageContaining("Zu viele Anmeldeversuche");
        }

        @Test
        @DisplayName("Mehr als 5 Versuche bleiben blockiert")
        void moreThanFiveAttempts_staysBlocked() {
            String ip = "192.168.1.4";

            for (int i = 0; i < 8; i++) {
                rateLimiter.recordAttempt(ip);
            }

            assertThatThrownBy(() -> rateLimiter.checkRateLimit(ip))
                    .isInstanceOf(RateLimitExceededException.class);
        }
    }


    @Nested
    @DisplayName("IP-Isolation")
    class IpIsolationTests {

        @Test
        @DisplayName("Verschiedene IPs werden unabhaengig gezaehlt")
        void differentIps_areTrackedSeparately() {
            String ip1 = "10.0.0.1";
            String ip2 = "10.0.0.2";

            for (int i = 0; i < 5; i++) {
                rateLimiter.recordAttempt(ip1);
            }

            assertThatCode(() -> rateLimiter.checkRateLimit(ip2))
                    .doesNotThrowAnyException();

            assertThatThrownBy(() -> rateLimiter.checkRateLimit(ip1))
                    .isInstanceOf(RateLimitExceededException.class);
        }

        @Test
        @DisplayName("Blockierung einer IP betrifft keine andere")
        void blockingOneIp_doesNotAffectOthers() {
            for (int i = 0; i < 5; i++) {
                rateLimiter.recordAttempt("blocked.ip");
            }

            for (int i = 0; i < 3; i++) {
                rateLimiter.recordAttempt("other.ip");
            }

            assertThatThrownBy(() -> rateLimiter.checkRateLimit("blocked.ip"))
                    .isInstanceOf(RateLimitExceededException.class);

            assertThatCode(() -> rateLimiter.checkRateLimit("other.ip"))
                    .doesNotThrowAnyException();
        }
    }


    @Nested
    @DisplayName("Zuruecksetzen der Versuche")
    class ResetTests {

        @Test
        @DisplayName("Reset nach erfolgreiche Login loescht Zaehler")
        void resetAttempts_clearsCounter() {
            String ip = "192.168.1.10";

            for (int i = 0; i < 5; i++) {
                rateLimiter.recordAttempt(ip);
            }

            assertThatThrownBy(() -> rateLimiter.checkRateLimit(ip))
                    .isInstanceOf(RateLimitExceededException.class);

            rateLimiter.resetAttempts(ip);

            assertThatCode(() -> rateLimiter.checkRateLimit(ip))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Reset auf nicht existierende IP wirft keinen Fehler")
        void resetAttempts_nonExistentIp_noError() {
            assertThatCode(() -> rateLimiter.resetAttempts("never.seen.ip"))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Nach Reset koennen neue Versuche gezaehlt werden")
        void afterReset_newAttemptsCanBeRecorded() {
            String ip = "192.168.1.11";

            for (int i = 0; i < 5; i++) {
                rateLimiter.recordAttempt(ip);
            }
            assertThatThrownBy(() -> rateLimiter.checkRateLimit(ip))
                    .isInstanceOf(RateLimitExceededException.class);

            rateLimiter.resetAttempts(ip);

            for (int i = 0; i < 4; i++) {
                rateLimiter.recordAttempt(ip);
            }
            assertThatCode(() -> rateLimiter.checkRateLimit(ip))
                    .doesNotThrowAnyException();

            rateLimiter.recordAttempt(ip);
            assertThatThrownBy(() -> rateLimiter.checkRateLimit(ip))
                    .isInstanceOf(RateLimitExceededException.class);
        }
    }


    @Nested
    @DisplayName("Fehlermeldungen")
    class ErrorMessageTests {

        @Test
        @DisplayName("Fehlermeldung enthaelt verbleibende Sekunden")
        void errorMessage_containsRemainingSeconds() {
            String ip = "192.168.1.20";

            for (int i = 0; i < 5; i++) {
                rateLimiter.recordAttempt(ip);
            }

            assertThatThrownBy(() -> rateLimiter.checkRateLimit(ip))
                    .isInstanceOf(RateLimitExceededException.class)
                    .hasMessageContaining("Sekunden");
        }
    }


    @Nested
    @DisplayName("Nebenläufigkeit")
    class ConcurrencyTests {

        @Test
        @DisplayName("Gleichzeitige Versuche von verschiedenen IPs sind sicher")
        void concurrentAttempts_fromDifferentIps_areSafe() throws InterruptedException {
            int threadCount = 10;
            Thread[] threads = new Thread[threadCount];

            for (int i = 0; i < threadCount; i++) {
                final String ip = "concurrent-" + i;
                threads[i] = new Thread(() -> {
                    for (int j = 0; j < 3; j++) {
                        rateLimiter.recordAttempt(ip);
                    }
                    rateLimiter.checkRateLimit(ip);
                });
            }

            for (Thread t : threads) t.start();
            for (Thread t : threads) t.join();

        }

        @Test
        @DisplayName("Gleichzeitige Versuche auf gleicher IP zaehlen korrekt")
        void concurrentAttempts_sameIp_countCorrectly() throws InterruptedException {
            String ip = "same-ip";
            int threadCount = 5;
            Thread[] threads = new Thread[threadCount];

            for (int i = 0; i < threadCount; i++) {
                threads[i] = new Thread(() -> rateLimiter.recordAttempt(ip));
            }

            for (Thread t : threads) t.start();
            for (Thread t : threads) t.join();

            assertThatThrownBy(() -> rateLimiter.checkRateLimit(ip))
                    .isInstanceOf(RateLimitExceededException.class);
        }
    }
}
