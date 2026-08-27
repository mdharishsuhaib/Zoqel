package com.zoqel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZoqelApplication {
    public static void main(String[] args) {
        SpringApplication.run(ZoqelApplication.class, args);
    }
}
