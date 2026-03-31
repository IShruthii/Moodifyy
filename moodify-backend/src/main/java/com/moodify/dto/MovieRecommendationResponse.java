package com.moodify.dto;

import java.util.List;

public class MovieRecommendationResponse {

    private String emotion;
    private String strategy;        // "MOOD_MATCH" | "MOOD_REPAIR" | "MOOD_ESCAPE"
    private String strategyLabel;   // "Based on your mood" | "To improve your mood"
    private List<MovieItem> movies;

    public MovieRecommendationResponse() {}

    public MovieRecommendationResponse(String emotion, String strategy, String strategyLabel, List<MovieItem> movies) {
        this.emotion = emotion;
        this.strategy = strategy;
        this.strategyLabel = strategyLabel;
        this.movies = movies;
    }

    public String getEmotion() { return emotion; }
    public void setEmotion(String emotion) { this.emotion = emotion; }
    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }
    public String getStrategyLabel() { return strategyLabel; }
    public void setStrategyLabel(String strategyLabel) { this.strategyLabel = strategyLabel; }
    public List<MovieItem> getMovies() { return movies; }
    public void setMovies(List<MovieItem> movies) { this.movies = movies; }

    public static class MovieItem {
        private String title;
        private String overview;
        private double rating;
        private String poster;
        private List<String> genres;
        private String trailerUrl;
        private List<OttPlatform> ottPlatforms;
        private int year;
        private String tmdbId;

        public MovieItem() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getOverview() { return overview; }
        public void setOverview(String overview) { this.overview = overview; }
        public double getRating() { return rating; }
        public void setRating(double rating) { this.rating = rating; }
        public String getPoster() { return poster; }
        public void setPoster(String poster) { this.poster = poster; }
        public List<String> getGenres() { return genres; }
        public void setGenres(List<String> genres) { this.genres = genres; }
        public String getTrailerUrl() { return trailerUrl; }
        public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }
        public List<OttPlatform> getOttPlatforms() { return ottPlatforms; }
        public void setOttPlatforms(List<OttPlatform> ottPlatforms) { this.ottPlatforms = ottPlatforms; }
        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
        public String getTmdbId() { return tmdbId; }
        public void setTmdbId(String tmdbId) { this.tmdbId = tmdbId; }
    }

    public static class OttPlatform {
        private String name;
        private String url;
        private String logo;

        public OttPlatform(String name, String url, String logo) {
            this.name = name; this.url = url; this.logo = logo;
        }

        public String getName() { return name; }
        public String getUrl() { return url; }
        public String getLogo() { return logo; }
    }
}
