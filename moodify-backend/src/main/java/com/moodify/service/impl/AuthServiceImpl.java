package com.moodify.service.impl;

import com.moodify.dto.AuthResponse;
import com.moodify.dto.LoginRequest;
import com.moodify.dto.RegisterRequest;
import com.moodify.entity.NotificationLog;
import com.moodify.entity.User;
import com.moodify.entity.UserPreference;
import com.moodify.repository.NotificationLogRepository;
import com.moodify.repository.UserPreferenceRepository;
import com.moodify.repository.UserRepository;
import com.moodify.security.JwtService;
import com.moodify.service.AuthService;
import com.moodify.service.NotificationService;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthServiceImpl(UserRepository userRepository,
                           UserPreferenceRepository preferenceRepository,
                           NotificationLogRepository notificationLogRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           AuthenticationManager authenticationManager,
                           UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
        this.notificationLogRepository = notificationLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getName()
        );
        if (request.getGender() != null) user.setGender(request.getGender());
        user = userRepository.save(user);

        UserPreference preference = new UserPreference(user);
        preferenceRepository.save(preference);

        // Welcome notification — shows up in Alerts immediately
        NotificationLog welcome = new NotificationLog();
        welcome.setUser(user);
        welcome.setType("SUPPORT");
        welcome.setMessage("Welcome to Moodify, " + user.getName() + "! 🎉 I'm your companion. Start by logging your first mood — I'll be right here with you. 💜");
        notificationLogRepository.save(welcome);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        AuthResponse resp = new AuthResponse(token, user.getEmail(), user.getName(), user.getId(), false);
        resp.setGender(user.getGender());
        return resp;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        boolean profileSetup = preferenceRepository.findByUserId(user.getId())
                .map(p -> p.getDisplayName() != null && !p.getDisplayName().isEmpty())
                .orElse(false);

        AuthResponse loginResp = new AuthResponse(token, user.getEmail(), user.getName(), user.getId(), profileSetup);
        loginResp.setGender(user.getGender());
        return loginResp;
    }
}
