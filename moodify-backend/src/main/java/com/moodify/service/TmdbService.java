package com.moodify.service;

import com.moodify.dto.MovieRecommendationResponse.MovieItem;
import com.moodify.dto.MovieRecommendationResponse.OttPlatform;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TmdbService {

    @Value("${tmdb.api.key:}")
    private String apiKey;

    private static final String BASE = "https://api.themoviedb.org/3";
    private static final String IMG  = "https://image.tmdb.org/t/p/w500";

    // TMDB genre IDs
    private static final Map<String, Integer> GENRE_IDS = Map.ofEntries(
        Map.entry("action",       28),
        Map.entry("adventure",    12),
        Map.entry("animation",    16),
        Map.entry("comedy",       35),
        Map.entry("crime",        80),
        Map.entry("documentary",  99),
        Map.entry("drama",        18),
        Map.entry("family",       10751),
        Map.entry("fantasy",      14),
        Map.entry("history",      36),
        Map.entry("horror",       27),
        Map.entry("music",        10402),
        Map.entry("mystery",      9648),
        Map.entry("romance",      10749),
        Map.entry("sci-fi",       878),
        Map.entry("thriller",     53),
        Map.entry("biography",    99),
        Map.entry("sports",       10770),
        Map.entry("musical",      10402)
    );

    // Known OTT mappings for popular movies (TMDB doesn't give free OTT data)
    private static final Map<Integer, List<OttPlatform>> OTT_MAP = buildOttMap();

    private final RestTemplate restTemplate = new RestTemplate();

    public List<MovieItem> fetchByGenres(List<String> genres, int limit) {
        if (apiKey == null || apiKey.isBlank()) return fallbackMovies(genres);

        String genreIds = genres.stream()
            .map(g -> GENRE_IDS.getOrDefault(g.toLowerCase(), 18))
            .distinct()
            .map(String::valueOf)
            .collect(Collectors.joining(","));

        String url = BASE + "/discover/movie"
            + "?api_key=" + apiKey
            + "&with_genres=" + genreIds
            + "&vote_average.gte=7.0"
            + "&vote_count.gte=500"
            + "&sort_by=vote_average.desc"
            + "&language=en-US"
            + "&page=1";

        try {
            ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                url, HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {});

            if (resp.getStatusCode() == HttpStatus.OK && resp.getBody() != null) {
                List<?> results = (List<?>) resp.getBody().get("results");
                if (results != null) {
                    return results.stream()
                        .limit(limit)
                        .map(r -> toMovieItem((Map<?, ?>) r))
                        .filter(m -> m.getRating() >= 7.0)
                        .sorted(Comparator.comparingDouble(MovieItem::getRating).reversed())
                        .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            System.err.println("[TmdbService] API error: " + e.getMessage());
        }
        return fallbackMovies(genres);
    }

    private MovieItem toMovieItem(Map<?, ?> r) {
        MovieItem item = new MovieItem();
        item.setTmdbId(String.valueOf(r.get("id")));
        item.setTitle(String.valueOf(r.getOrDefault("title", "Unknown")));
        item.setOverview(String.valueOf(r.getOrDefault("overview", "")));
        item.setRating(toDouble(r.get("vote_average")));

        String poster = (String) r.get("poster_path");
        item.setPoster(poster != null ? IMG + poster : "");

        String release = (String) r.getOrDefault("release_date", "");
        item.setYear(release.length() >= 4 ? Integer.parseInt(release.substring(0, 4)) : 0);

        // Genre names from IDs
        List<?> genreIds = (List<?>) r.getOrDefault("genre_ids", List.of());
        Map<Integer, String> reverseGenre = new HashMap<>();
        GENRE_IDS.forEach((k, v) -> reverseGenre.put(v, k));
        item.setGenres(genreIds.stream()
            .map(id -> reverseGenre.getOrDefault(((Number) id).intValue(), "drama"))
            .distinct().collect(Collectors.toList()));

        // Trailer
        int tmdbId = ((Number) r.get("id")).intValue();
        item.setTrailerUrl("https://www.youtube.com/results?search_query=" +
            item.getTitle().replace(" ", "+") + "+official+trailer");

        // OTT
        item.setOttPlatforms(OTT_MAP.getOrDefault(tmdbId, defaultOtt(item.getTitle())));

        return item;
    }

    private double toDouble(Object val) {
        if (val instanceof Number n) return Math.round(n.doubleValue() * 10.0) / 10.0;
        return 0.0;
    }

    // Fallback when no API key — curated list
    private List<MovieItem> fallbackMovies(List<String> genres) {
        return FALLBACK_MOVIES.stream()
            .filter(m -> m.getGenres().stream().anyMatch(g ->
                genres.stream().anyMatch(req -> req.equalsIgnoreCase(g))))
            .sorted(Comparator.comparingDouble(MovieItem::getRating).reversed())
            .limit(8)
            .collect(Collectors.toList());
    }

    private List<OttPlatform> defaultOtt(String title) {
        String q = title.replace(" ", "+");
        return List.of(
            new OttPlatform("Netflix", "https://www.netflix.com/search?q=" + q, "netflix"),
            new OttPlatform("Prime Video", "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=" + q, "prime"),
            new OttPlatform("Hotstar", "https://www.hotstar.com/in/search?q=" + q, "hotstar")
        );
    }

    private static Map<Integer, List<OttPlatform>> buildOttMap() {
        Map<Integer, List<OttPlatform>> m = new HashMap<>();
        // Interstellar
        m.put(157336, List.of(new OttPlatform("Prime Video", "https://www.primevideo.com/detail/Interstellar/0GKZN3BNKBQNQNQNQNQNQN", "prime")));
        // The Dark Knight
        m.put(155, List.of(new OttPlatform("Netflix", "https://www.netflix.com/title/70079583", "netflix")));
        return m;
    }

    // ── Curated fallback movies ───────────────────────────────────────────────
    private static final List<MovieItem> FALLBACK_MOVIES = buildFallback();

    private static List<MovieItem> buildFallback() {
        List<MovieItem> list = new ArrayList<>();
        list.add(make("The Shawshank Redemption", 9.3, List.of("drama"), 1994, "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg"));
        list.add(make("The Godfather", 9.2, List.of("crime", "drama"), 1972, "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg"));
        list.add(make("Forrest Gump", 8.8, List.of("drama", "romance", "comedy"), 1994, "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg"));
        list.add(make("Inception", 8.8, List.of("action", "sci-fi", "thriller"), 2010, "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg"));
        list.add(make("Interstellar", 8.7, List.of("adventure", "drama", "sci-fi"), 2014, "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg"));
        list.add(make("The Dark Knight", 9.0, List.of("action", "crime", "drama"), 2008, "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg"));
        list.add(make("Spirited Away", 8.6, List.of("animation", "adventure", "family"), 2001, "https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg"));
        list.add(make("3 Idiots", 8.4, List.of("comedy", "drama"), 2009, "https://m.media-amazon.com/images/M/MV5BNTkyOGVjMGEtNmQzZi00NzFlLTlhOWQtODYyMDc2ZGJmYzFhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg"));
        list.add(make("Coco", 8.4, List.of("animation", "adventure", "family"), 2017, "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_.jpg"));
        list.add(make("Inside Out", 8.1, List.of("animation", "comedy", "drama"), 2015, "https://m.media-amazon.com/images/M/MV5BOTgxMDQwMDk0OF5BMl5BanBnXkFtZTgwNjU5OTg2NDE@._V1_.jpg"));
        list.add(make("The Pursuit of Happyness", 8.0, List.of("biography", "drama"), 2006, "https://m.media-amazon.com/images/M/MV5BMTQ5NjQ0NDI3NF5BMl5BanBnXkFtZTcwNDI0MjEzMw@@._V1_.jpg"));
        list.add(make("Whiplash", 8.5, List.of("drama", "music"), 2014, "https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg"));
        list.add(make("La La Land", 8.0, List.of("comedy", "drama", "musical", "romance"), 2016, "https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_.jpg"));
        list.add(make("Soul", 8.1, List.of("animation", "comedy", "drama"), 2020, "https://m.media-amazon.com/images/M/MV5BZGE2NjNjMWQtMDI4OS00YjQ5LTgzZTItZGM1NWM4ZjZlNDIyXkEyXkFqcGdeQXVyNjA3OTI0MDc@._V1_.jpg"));
        list.add(make("Knives Out", 7.9, List.of("comedy", "crime", "drama", "mystery"), 2019, "https://m.media-amazon.com/images/M/MV5BMGUwZjliMTAtNzAxZi00MWNiLWE2NzgtZGUxMGQxZjhhNDRiXkEyXkFqcGdeQXVyNjU1NzU3MzE@._V1_.jpg"));
        list.add(make("Rocky", 8.1, List.of("drama", "sports"), 1976, "https://m.media-amazon.com/images/M/MV5BNzk4OWY0ZjctMGYyZC00NzQzLWI4ZjEtMGM5ZDQ1ZGY5YjM2XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg"));
        list.add(make("Good Will Hunting", 8.3, List.of("drama", "romance"), 1997, "https://m.media-amazon.com/images/M/MV5BOTI0MzcxMTYtZDVkMy00NjY1LTgyMTYtZmUxN2M3NmQ1NWEwXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg"));
        list.add(make("Amélie", 8.3, List.of("comedy", "romance"), 2001, "https://m.media-amazon.com/images/M/MV5BNDg4NjM1YjMtYmNhZC00MjM0LWFiZmYtNGY1YjA3MzZmODc5XkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg"));
        list.add(make("Mad Max: Fury Road", 8.1, List.of("action", "adventure", "sci-fi"), 2015, "https://m.media-amazon.com/images/M/MV5BN2EwM2I5OWMtMGQyMi00Zjg1LWJkNTctZTdjYTA4OGUwZjMyXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg"));
        list.add(make("Parasite", 8.5, List.of("comedy", "drama", "thriller"), 2019, "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg"));
        return list;
    }

    private static MovieItem make(String title, double rating, List<String> genres, int year, String poster) {
        MovieItem m = new MovieItem();
        m.setTitle(title);
        m.setRating(rating);
        m.setGenres(genres);
        m.setYear(year);
        m.setPoster(poster);
        m.setOverview("");
        String q = title.replace(" ", "+");
        m.setTrailerUrl("https://www.youtube.com/results?search_query=" + q + "+official+trailer");
        m.setOttPlatforms(List.of(
            new OttPlatform("Netflix", "https://www.netflix.com/search?q=" + q, "netflix"),
            new OttPlatform("Prime Video", "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=" + q, "prime"),
            new OttPlatform("Hotstar", "https://www.hotstar.com/in/search?q=" + q, "hotstar")
        ));
        return m;
    }
}
