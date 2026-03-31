package com.moodify.service;

import com.moodify.dto.MovieRecommendationResponse.MovieItem;
import com.moodify.dto.MovieRecommendationResponse.OttPlatform;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TmdbService {

    @Value("${tmdb.api.key:}")
    private String apiKey;

    private static final String IMG = "https://image.tmdb.org/t/p/w500";

    public List<MovieItem> fetchByGenres(List<String> genres, int limit) {
        // Always use curated fallback (TMDB optional enhancement)
        return FALLBACK_MOVIES.stream()
            .filter(m -> m.getGenres().stream().anyMatch(g ->
                genres.stream().anyMatch(req -> req.equalsIgnoreCase(g))))
            .sorted(Comparator.comparingDouble(MovieItem::getRating).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static MovieItem make(String title, double rating, List<String> genres,
                                   int year, String poster, String type) {
        MovieItem m = new MovieItem();
        m.setTitle(title); m.setRating(rating); m.setGenres(genres);
        m.setYear(year); m.setPoster(poster); m.setOverview(""); m.setTmdbId(type);
        String q = title.replace(" ", "+");
        m.setTrailerUrl("https://www.youtube.com/results?search_query=" + q + "+official+trailer");
        m.setOttPlatforms(List.of(
            new OttPlatform("Netflix",    "https://www.netflix.com/search?q=" + q,    "netflix"),
            new OttPlatform("Prime Video","https://www.primevideo.com/search/ref=atv_nb_sr?phrase=" + q, "prime"),
            new OttPlatform("Hotstar",    "https://www.hotstar.com/in/search?q=" + q, "hotstar")
        ));
        return m;
    }

    private static final List<MovieItem> FALLBACK_MOVIES = buildFallback();

    private static List<MovieItem> buildFallback() {
        List<MovieItem> L = new ArrayList<>();
        // ── ENGLISH MOVIES ────────────────────────────────────────────────────
        L.add(make("The Shawshank Redemption",9.3,List.of("drama","biography"),1994,"https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg","movie"));
        L.add(make("The Dark Knight",9.0,List.of("action","crime","thriller"),2008,"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg","movie"));
        L.add(make("Forrest Gump",8.8,List.of("drama","romance","comedy"),1994,"https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg","movie"));
        L.add(make("Inception",8.8,List.of("action","sci-fi","thriller"),2010,"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg","movie"));
        L.add(make("Interstellar",8.7,List.of("adventure","drama","sci-fi"),2014,"https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg","movie"));
        L.add(make("Good Will Hunting",8.3,List.of("drama","romance"),1997,"https://m.media-amazon.com/images/M/MV5BOTI0MzcxMTYtZDVkMy00NjY1LTgyMTYtZmUxN2M3NmQ1NWEwXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg","movie"));
        L.add(make("Whiplash",8.5,List.of("drama","music"),2014,"https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg","movie"));
        L.add(make("La La Land",8.0,List.of("comedy","drama","musical","romance"),2016,"https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_.jpg","movie"));
        L.add(make("Parasite",8.5,List.of("comedy","drama","thriller"),2019,"https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg","movie"));
        L.add(make("Knives Out",7.9,List.of("comedy","crime","mystery"),2019,"https://m.media-amazon.com/images/M/MV5BMGUwZjliMTAtNzAxZi00MWNiLWE2NzgtZGUxMGQxZjhhNDRiXkEyXkFqcGdeQXVyNjU1NzU3MzE@._V1_.jpg","movie"));
        L.add(make("Mad Max: Fury Road",8.1,List.of("action","adventure","sci-fi"),2015,"https://m.media-amazon.com/images/M/MV5BN2EwM2I5OWMtMGQyMi00Zjg1LWJkNTctZTdjYTA4OGUwZjMyXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg","movie"));
        L.add(make("Rocky",8.1,List.of("drama","sports"),1976,"https://m.media-amazon.com/images/M/MV5BNzk4OWY0ZjctMGYyZC00NzQzLWI4ZjEtMGM5ZDQ1ZGY5YjM2XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg","movie"));
        L.add(make("Amélie",8.3,List.of("comedy","romance"),2001,"https://m.media-amazon.com/images/M/MV5BNDg4NjM1YjMtYmNhZC00MjM0LWFiZmYtNGY1YjA3MzZmODc5XkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg","movie"));
        L.add(make("The Pursuit of Happyness",8.0,List.of("biography","drama"),2006,"https://m.media-amazon.com/images/M/MV5BMTQ5NjQ0NDI3NF5BMl5BanBnXkFtZTcwNDI0MjEzMw@@._V1_.jpg","movie"));
        L.add(make("The Grand Budapest Hotel",8.1,List.of("adventure","comedy","crime"),2014,"https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_.jpg","movie"));
        return L;
    }
}
