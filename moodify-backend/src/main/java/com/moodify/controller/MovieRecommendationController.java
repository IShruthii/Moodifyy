package com.moodify.controller;

import com.moodify.dto.ApiResponse;
import com.moodify.dto.MovieRecommendationResponse;
import com.moodify.service.EmotionMovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommend/movies")
public class MovieRecommendationController {

    private final EmotionMovieService emotionMovieService;

    public MovieRecommendationController(EmotionMovieService emotionMovieService) {
        this.emotionMovieService = emotionMovieService;
    }

    @GetMapping("/{emotion}")
    public ResponseEntity<ApiResponse<List<MovieRecommendationResponse>>> getMovies(
            @PathVariable String emotion) {
        List<MovieRecommendationResponse> recommendations =
            emotionMovieService.getMovieRecommendations(emotion);
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }
}
