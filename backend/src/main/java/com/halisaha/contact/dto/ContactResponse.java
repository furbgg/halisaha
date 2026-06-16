package com.halisaha.contact.dto;

import com.halisaha.contact.entity.ContactMessage;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
@Builder
public class ContactResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private ContactMessage.Status status;
    private String adminNotes;
    private ZonedDateTime createdAt;
    private ZonedDateTime readAt;
    private ZonedDateTime repliedAt;

    public static ContactResponse from(ContactMessage entity) {
        return ContactResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .subject(entity.getSubject())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .adminNotes(entity.getAdminNotes())
                .createdAt(entity.getCreatedAt())
                .readAt(entity.getReadAt())
                .repliedAt(entity.getRepliedAt())
                .build();
    }
}
