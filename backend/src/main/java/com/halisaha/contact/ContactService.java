package com.halisaha.contact;

import com.halisaha.common.AppConstants;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.contact.dto.ContactRequest;
import com.halisaha.contact.dto.ContactResponse;
import com.halisaha.contact.entity.ContactMessage;
import com.halisaha.contact.entity.ContactMessage.Status;
import com.halisaha.contact.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository repository;

    @Transactional
    public ContactResponse submit(ContactRequest request) {
        ContactMessage message = ContactMessage.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .subject(request.getSubject())
                .message(request.getMessage().trim())
                .build();

        message = repository.save(message);
        log.info("New contact message saved (id={})", message.getId());
        return ContactResponse.from(message);
    }


    @Transactional(readOnly = true)
    public List<ContactResponse> getAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(ContactResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getByStatus(Status status) {
        return repository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(ContactResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContactResponse getById(Long id) {
        return ContactResponse.from(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public long countNew() {
        return repository.countByStatus(Status.NEW);
    }

    @Transactional
    public ContactResponse markAsRead(Long id) {
        ContactMessage msg = findOrThrow(id);
        if (msg.getStatus() == Status.NEW) {
            msg.setStatus(Status.READ);
            msg.setReadAt(ZonedDateTime.now(AppConstants.VIENNA));
            repository.save(msg);
        }
        return ContactResponse.from(msg);
    }

    @Transactional
    public ContactResponse markAsReplied(Long id) {
        ContactMessage msg = findOrThrow(id);
        msg.setStatus(Status.REPLIED);
        msg.setRepliedAt(ZonedDateTime.now(AppConstants.VIENNA));
        repository.save(msg);
        return ContactResponse.from(msg);
    }

    @Transactional
    public ContactResponse archive(Long id) {
        ContactMessage msg = findOrThrow(id);
        msg.setStatus(Status.ARCHIVED);
        repository.save(msg);
        return ContactResponse.from(msg);
    }

    @Transactional
    public ContactResponse updateNotes(Long id, String notes) {
        ContactMessage msg = findOrThrow(id);
        msg.setAdminNotes(notes);
        repository.save(msg);
        return ContactResponse.from(msg);
    }

    private ContactMessage findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nachricht nicht gefunden"));
    }
}
