package com.halisaha.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TotpService — Google Authenticator TOTP-Logik")
class TotpServiceTest {

    private TotpService totpService;

    @BeforeEach
    void setUp() {
        totpService = new TotpService();
    }


    @Nested
    @DisplayName("Secret-Erzeugung")
    class SecretGenerationTests {

        @Test
        @DisplayName("Generiert nicht-leeren Secret")
        void generateSecret_returnsNonEmptyString() {
            String secret = totpService.generateSecret();

            assertThat(secret).isNotNull().isNotEmpty();
        }

        @Test
        @DisplayName("Generiert immer unterschiedliche Secrets")
        void generateSecret_returnsDifferentValues() {
            String secret1 = totpService.generateSecret();
            String secret2 = totpService.generateSecret();

            assertThat(secret1).isNotEqualTo(secret2);
        }

        @Test
        @DisplayName("Secret ist Base32-kompatibel (nur Grossbuchstaben und Zahlen)")
        void generateSecret_isBase32Compatible() {
            String secret = totpService.generateSecret();

            assertThat(secret).matches("[A-Z2-7]+");
        }

        @Test
        @DisplayName("Secret hat ausreichende Laenge fuer Sicherheit")
        void generateSecret_hasSufficientLength() {
            String secret = totpService.generateSecret();

            assertThat(secret.length()).isGreaterThanOrEqualTo(16);
        }
    }


    @Nested
    @DisplayName("QR-Code-URI-Erzeugung")
    class QrCodeUriTests {

        @Test
        @DisplayName("QR-URI beginnt mit otpauth://totp/")
        void generateQrCodeUri_startsWithOtpAuth() {
            String secret = totpService.generateSecret();
            String uri = totpService.generateQrCodeUri(secret, "user@test.com");

            assertThat(uri).startsWith("otpauth://totp/");
        }

        @Test
        @DisplayName("QR-URI enthaelt Issuer HaliSaha")
        void generateQrCodeUri_containsIssuer() {
            String secret = totpService.generateSecret();
            String uri = totpService.generateQrCodeUri(secret, "user@test.com");

            assertThat(uri).contains("HaliSaha");
        }

        @Test
        @DisplayName("QR-URI enthaelt E-Mail-Adresse")
        void generateQrCodeUri_containsEmail() {
            String secret = totpService.generateSecret();
            String uri = totpService.generateQrCodeUri(secret, "admin@halisaha.at");

            assertThat(uri).satisfiesAnyOf(
                    u -> assertThat(u).contains("admin%40halisaha.at"),
                    u -> assertThat(u).contains("admin@halisaha.at")
            );
        }

        @Test
        @DisplayName("QR-URI enthaelt Secret-Parameter")
        void generateQrCodeUri_containsSecretParam() {
            String secret = totpService.generateSecret();
            String uri = totpService.generateQrCodeUri(secret, "user@test.com");

            assertThat(uri).contains("secret=" + secret);
        }
    }


    @Nested
    @DisplayName("Code-Verifizierung")
    class CodeVerificationTests {

        @Test
        @DisplayName("Ungueltiger Code wird abgelehnt")
        void verifyCode_invalidCode_returnsFalse() {
            String secret = totpService.generateSecret();

            boolean result = totpService.verifyCode(secret, 0);

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Negativer Code wird abgelehnt")
        void verifyCode_negativeCode_returnsFalse() {
            String secret = totpService.generateSecret();

            boolean result = totpService.verifyCode(secret, -1);

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Code mit 7 Stellen wird abgelehnt")
        void verifyCode_sevenDigitCode_returnsFalse() {
            String secret = totpService.generateSecret();

            boolean result = totpService.verifyCode(secret, 1234567);

            assertThat(result).isFalse();
        }
    }
}
