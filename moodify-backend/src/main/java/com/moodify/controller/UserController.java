package com.moodify.controller;

import com.moodify.dto.ApiResponse;
import com.moodify.entity.User;
import com.moodify.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final SecurityUtils securityUtils;

    public UserController(SecurityUtils securityUtils) {
        this.securityUtils = securityUtils;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {
        User user = securityUtils.getCurrentUser();
        Map<String, Object> userData = Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "createdAt", user.getCreatedAt().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(userData));
    }
}
