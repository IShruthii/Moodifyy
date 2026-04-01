package com.moodify.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String name;
    private Long userId;
    private boolean profileSetup;
    private String gender;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String name, Long userId, boolean profileSetup) {
        this.token = token; this.email = email; this.name = name;
        this.userId = userId; this.profileSetup = profileSetup;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public boolean isProfileSetup() { return profileSetup; }
    public void setProfileSetup(boolean profileSetup) { this.profileSetup = profileSetup; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}
