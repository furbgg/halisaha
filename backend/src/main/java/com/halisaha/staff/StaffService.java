package com.halisaha.staff;

import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.staff.entity.Staff;
import com.halisaha.staff.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;

    @Transactional(readOnly = true)
    public List<Staff> getAll() {
        return staffRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Staff> getActive() {
        return staffRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public Staff getById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mitarbeiter nicht gefunden"));
    }

    @Transactional
    public Staff create(Staff staff) {
        return staffRepository.save(staff);
    }

    @Transactional
    public Staff update(Long id, Staff updated) {
        Staff staff = getById(id);
        staff.setName(updated.getName());
        staff.setRole(updated.getRole());
        staff.setPhone(updated.getPhone());
        staff.setEmail(updated.getEmail());
        staff.setNotes(updated.getNotes());
        staff.setActive(updated.getActive());
        return staffRepository.save(staff);
    }

    @Transactional
    public void delete(Long id) {
        Staff staff = getById(id);
        staff.setActive(false);
        staffRepository.save(staff);
    }
}
