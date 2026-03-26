package com.moodify.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String emoji;

    @Column(name = "required_streak")
    private Integer requiredStreak;

    public Badge() {}

    public Badge(String code, String name, String description, String emoji, Integer requiredStreak) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.emoji = emoji;
        this.requiredStreak = requiredStreak;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public Integer getRequiredStreak() { return requiredStreak; }
    public void setRequiredStreak(Integer requiredStreak) { this.requiredStreak = requiredStreak; }
}
