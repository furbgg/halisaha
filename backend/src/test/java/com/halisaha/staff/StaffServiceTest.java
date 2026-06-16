package com.halisaha.staff;

import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.staff.entity.Staff;
import com.halisaha.staff.repository.StaffRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StaffService — Personel CRUD & Soft Delete")
class StaffServiceTest {

    @Mock
    private StaffRepository staffRepository;

    @InjectMocks
    private StaffService staffService;

    private Staff activeStaff;
    private Staff inactiveStaff;

    @BeforeEach
    void setUp() {
        activeStaff = Staff.builder()
                .id(1L)
                .name("Ahmet Yılmaz")
                .role("Platzwart")
                .phone("+43123456789")
                .email("ahmet@test.at")
                .active(true)
                .notes("Erfahrener Mitarbeiter")
                .build();

        inactiveStaff = Staff.builder()
                .id(2L)
                .name("Mehmet Kaya")
                .role("Kassierer")
                .phone("+43987654321")
                .email("mehmet@test.at")
                .active(false)
                .build();
    }


    @Nested
    @DisplayName("Listeleme")
    class Listing {

        @Test
        @DisplayName("tüm personel — aktif + inaktif")
        void getAll() {
            when(staffRepository.findAll()).thenReturn(List.of(activeStaff, inactiveStaff));

            List<Staff> result = staffService.getAll();

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("sadece aktif personel")
        void getActive() {
            when(staffRepository.findByActiveTrue()).thenReturn(List.of(activeStaff));

            List<Staff> result = staffService.getActive();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Ahmet Yılmaz");
            assertThat(result.get(0).getActive()).isTrue();
        }

        @Test
        @DisplayName("boş liste — hiç personel yok")
        void emptyList() {
            when(staffRepository.findAll()).thenReturn(Collections.emptyList());

            assertThat(staffService.getAll()).isEmpty();
        }
    }


    @Nested
    @DisplayName("Tekil Arama")
    class GetById {

        @Test
        @DisplayName("mevcut ID → personel döner")
        void found() {
            when(staffRepository.findById(1L)).thenReturn(Optional.of(activeStaff));

            Staff result = staffService.getById(1L);

            assertThat(result.getName()).isEqualTo("Ahmet Yılmaz");
            assertThat(result.getRole()).isEqualTo("Platzwart");
        }

        @Test
        @DisplayName("olmayan ID → ResourceNotFoundException")
        void notFound() {
            when(staffRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> staffService.getById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Mitarbeiter");
        }
    }


    @Nested
    @DisplayName("Oluşturma")
    class Create {

        @Test
        @DisplayName("yeni personel başarıyla oluşturulur")
        void createSuccess() {
            Staff newStaff = Staff.builder()
                    .name("Ayşe Demir")
                    .role("Reinigung")
                    .phone("+43555111222")
                    .active(true)
                    .build();

            when(staffRepository.save(any())).thenAnswer(i -> {
                Staff s = i.getArgument(0);
                s.setId(3L);
                return s;
            });

            Staff result = staffService.create(newStaff);

            assertThat(result.getId()).isEqualTo(3L);
            assertThat(result.getName()).isEqualTo("Ayşe Demir");
            verify(staffRepository).save(newStaff);
        }
    }


    @Nested
    @DisplayName("Güncelleme")
    class Update {

        @Test
        @DisplayName("rol değişikliği — isim ve telefon korunur")
        void updateRole() {
            when(staffRepository.findById(1L)).thenReturn(Optional.of(activeStaff));
            when(staffRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            Staff updated = Staff.builder()
                    .name("Ahmet Yılmaz")
                    .role("Manager")
                    .phone("+43123456789")
                    .email("ahmet@test.at")
                    .active(true)
                    .notes("Befördert")
                    .build();

            Staff result = staffService.update(1L, updated);

            assertThat(result.getRole()).isEqualTo("Manager");
            assertThat(result.getNotes()).isEqualTo("Befördert");
            assertThat(result.getName()).isEqualTo("Ahmet Yılmaz");
        }

        @Test
        @DisplayName("tüm alanlar güncellenir")
        void updateAllFields() {
            when(staffRepository.findById(1L)).thenReturn(Optional.of(activeStaff));
            when(staffRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            Staff updated = Staff.builder()
                    .name("Ahmet YENİ")
                    .role("Security")
                    .phone("+43999888777")
                    .email("yeni@test.at")
                    .active(false)
                    .notes("Abteilung gewechselt")
                    .build();

            Staff result = staffService.update(1L, updated);

            assertThat(result.getName()).isEqualTo("Ahmet YENİ");
            assertThat(result.getRole()).isEqualTo("Security");
            assertThat(result.getPhone()).isEqualTo("+43999888777");
            assertThat(result.getEmail()).isEqualTo("yeni@test.at");
            assertThat(result.getActive()).isFalse();
            assertThat(result.getNotes()).isEqualTo("Abteilung gewechselt");
        }

        @Test
        @DisplayName("olmayan personeli güncelle → exception")
        void updateNotFound() {
            when(staffRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> staffService.update(99L, activeStaff))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("Soft Delete")
    class SoftDelete {

        @Test
        @DisplayName("silme → active = false olur, DB'den silinmez")
        void softDeleteSetsInactive() {
            when(staffRepository.findById(1L)).thenReturn(Optional.of(activeStaff));
            when(staffRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            staffService.delete(1L);

            assertThat(activeStaff.getActive()).isFalse();
            verify(staffRepository).save(activeStaff);
            verify(staffRepository, never()).delete(any());
        }

        @Test
        @DisplayName("olmayan personeli sil → exception")
        void deleteNotFound() {
            when(staffRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> staffService.delete(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
