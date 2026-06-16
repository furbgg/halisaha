package com.halisaha.contact.repository;

import com.halisaha.contact.entity.ContactMessage;
import com.halisaha.contact.entity.ContactMessage.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    List<ContactMessage> findByStatusOrderByCreatedAtDesc(Status status);

    List<ContactMessage> findAllByOrderByCreatedAtDesc();

    long countByStatus(Status status);
}
