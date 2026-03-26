package com.moodify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MoodifyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MoodifyApplication.class, args);
    }
}
