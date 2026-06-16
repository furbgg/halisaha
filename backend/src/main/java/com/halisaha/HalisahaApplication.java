package com.halisaha;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HalisahaApplication {

    public static void main(String[] args) {
        SpringApplication.run(HalisahaApplication.class, args);
    }
}
