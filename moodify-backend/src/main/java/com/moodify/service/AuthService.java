package com.moodify.service;

import com.moodify.dto.AuthResponse;
import com.moodify.dto.LoginRequest;
import com.moodify.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
