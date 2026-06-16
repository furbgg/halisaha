package com.halisaha.contact;

import com.halisaha.contact.dto.ContactRequest;
import com.halisaha.contact.dto.ContactResponse;
import com.halisaha.contact.entity.ContactMessage;
import com.halisaha.contact.repository.ContactMessageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactMessageRepository repository;

    @InjectMocks
    private ContactService contactService;

    @Test
    void submitContactForm_shouldSaveMessage() {
        ContactRequest request = new ContactRequest();
        request.setName("Test User");
        request.setEmail("test@email.com");
        request.setMessage("Test message body.");

        ContactMessage saved = new ContactMessage();
        saved.setId(1L);
        saved.setName("Test User");
        saved.setStatus(ContactMessage.Status.NEW);

        when(repository.save(any())).thenReturn(saved);

        ContactResponse response = contactService.submit(request);

        ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
        verify(repository).save(captor.capture());

        assertThat(captor.getValue().getName()).isEqualTo("Test User");
        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    void getContactMessages_shouldReturnResults() {
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(new ContactMessage()));

        List<ContactResponse> list = contactService.getAll();

        assertThat(list).isNotEmpty();
        verify(repository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void markAsRead_shouldUpdateStatus() {
        ContactMessage msg = new ContactMessage();
        msg.setStatus(ContactMessage.Status.NEW);
        when(repository.findById(1L)).thenReturn(Optional.of(msg));

        contactService.markAsRead(1L);

        assertThat(msg.getStatus()).isEqualTo(ContactMessage.Status.READ);
        assertThat(msg.getReadAt()).isNotNull();
        verify(repository).save(msg);
    }

    @Test
    void archiveMessage_shouldUpdateStatus() {
        ContactMessage msg = new ContactMessage();
        msg.setStatus(ContactMessage.Status.READ);
        when(repository.findById(1L)).thenReturn(Optional.of(msg));

        contactService.archive(1L);

        assertThat(msg.getStatus()).isEqualTo(ContactMessage.Status.ARCHIVED);
        verify(repository).save(msg);
    }

    @Test
    void updateNotes_shouldSaveAdminNotes() {
        ContactMessage msg = new ContactMessage();
        when(repository.findById(1L)).thenReturn(Optional.of(msg));

        contactService.updateNotes(1L, "Some notes");

        assertThat(msg.getAdminNotes()).isEqualTo("Some notes");
        verify(repository).save(msg);
    }
}
