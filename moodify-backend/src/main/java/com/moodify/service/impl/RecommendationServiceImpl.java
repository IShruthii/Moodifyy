package com.moodify.service.impl;

import com.moodify.dto.RecommendationResponse;
import com.moodify.dto.RecommendationResponse.ActionLink;
import com.moodify.dto.RecommendationResponse.RecommendationItem;
import com.moodify.entity.RecommendationHistory;
import com.moodify.repository.RecommendationHistoryRepository;
import com.moodify.repository.UserRepository;
import com.moodify.service.RecommendationService;
import com.moodify.util.MoodData;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * RecommendationServiceImpl
 *
 * Each mood has a POOL of 6-8 items per category.
 * 3-4 are randomly selected per request → natural rotation without repetition.
 * Movies cover English, Telugu, Hindi, Tamil, Korean, Japanese (2000+).
 * Each item has a "reason" field for explainability.
 * Time-of-day context influences food and place suggestions.
 */
@Service
public class RecommendationServiceImpl implements RecommendationService {

    private final RecommendationHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    public RecommendationServiceImpl(RecommendationHistoryRepository historyRepository,
            UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @Override
    public RecommendationResponse getRecommendations(String mood, String musicLanguage) {
        MoodData.MoodInfo moodInfo = MoodData.getMoodInfo(mood);
        String m = mood.toUpperCase();
        String lang = musicLanguage != null ? musicLanguage.toLowerCase() : "english";
        int hour = LocalTime.now().getHour();
        String timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";

        RecommendationResponse response = new RecommendationResponse();
        response.setMood(m);
        response.setMoodEmoji(moodInfo.getEmoji());
        response.setMessage(buildMessage(m, moodInfo, timeOfDay));
        response.setMusic(pick(buildMusicPool(m, lang), 3));
        response.setMovies(pick(buildMoviePool(m), 4));
        response.setPlaces(pick(buildPlacePool(m, timeOfDay), 3));
        response.setFood(pick(buildFoodPool(m, timeOfDay), 4));
        response.setGames(pick(buildGamePool(m), 3));
        response.setJournalPrompt(moodInfo.getJournalPrompt());
        response.setChallenge(moodInfo.getChallenge());
        return response;
    }

    @Override
    public void logRecommendationClick(Long userId, String mood, String type, String title) {
        userRepository.findById(userId).ifPresent(user -> {
            RecommendationHistory h = new RecommendationHistory();
            h.setUser(user);
            h.setMood(mood);
            h.setRecommendationType(type);
            h.setRecommendationTitle(title);
            historyRepository.save(h);
        });
    }

    // ── Random pick from pool ─────────────────────────────────────────────────
    private <T> List<T> pick(List<T> pool, int count) {
        if (pool == null || pool.isEmpty()) return Collections.emptyList();
        List<T> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled, random);
        return shuffled.stream().limit(Math.min(count, shuffled.size())).collect(Collectors.toList());
    }

    // ── Message ───────────────────────────────────────────────────────────────
    private String buildMessage(String mood, MoodData.MoodInfo info, String timeOfDay) {
        String time = switch (timeOfDay) {
            case "morning" -> "this morning";
            case "afternoon" -> "this afternoon";
            case "evening" -> "this evening";
            default -> "tonight";
        };
        return switch (info.getCategory()) {
            case "POSITIVE" -> "You're feeling " + mood.toLowerCase() + " " + time + "! Here's something to match your energy. ✨";
            case "NEGATIVE" -> "It's okay to feel " + mood.toLowerCase() + ". Here's something gentle curated just for you. 💙";
            default -> "Here's a curated set for your " + mood.toLowerCase() + " mood " + time + ". 🌿";
        };
    }

    // ── Link helpers ──────────────────────────────────────────────────────────
    private ActionLink sp(String q)     { return new ActionLink("Spotify", "https://open.spotify.com/search/" + enc(q), "spotify"); }
    private ActionLink ytm(String q)    { return new ActionLink("YouTube Music", "https://music.youtube.com/search?q=" + enc(q), "youtube"); }
    private ActionLink savn(String q)   { return new ActionLink("JioSaavn", "https://www.jiosaavn.com/search/" + enc(q), "jiosaavn"); }
    private ActionLink gaana(String q)  { return new ActionLink("Gaana", "https://gaana.com/search/" + enc(q), "gaana"); }
    private ActionLink nf(String q)     { return new ActionLink("Netflix", "https://www.netflix.com/search?q=" + enc(q), "netflix"); }
    private ActionLink prime(String q)  { return new ActionLink("Prime Video", "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=" + enc(q), "prime"); }
    private ActionLink hotstar(String q){ return new ActionLink("Hotstar", "https://www.hotstar.com/in/search?q=" + enc(q), "hotstar"); }
    private ActionLink imdb(String u)   { return new ActionLink("IMDb", u, "imdb"); }
    private ActionLink trailer(String q){ return new ActionLink("Trailer", "https://www.youtube.com/results?search_query=" + enc(q + " trailer"), "youtube"); }
    private ActionLink swiggy(String q) { return new ActionLink("Swiggy", "https://www.swiggy.com/search?query=" + enc(q), "swiggy"); }
    private ActionLink zomato(String q) { return new ActionLink("Zomato", "https://www.zomato.com/search?q=" + enc(q), "zomato"); }
    private ActionLink maps(String q)   { return new ActionLink("Google Maps", "https://www.google.com/maps/search/" + enc(q + " near me"), "maps"); }
    private String enc(String s)        { return s.replace(" ", "%20"); }

    // ── Item builders ─────────────────────────────────────────────────────────
    private RecommendationItem music(String title, String desc, String emoji, String query, String reason) {
        return new RecommendationItem(title, desc, "music", emoji,
                Arrays.asList(sp(query), ytm(query), savn(query), gaana(query)), reason);
    }

    private RecommendationItem movie(String title, String desc, String emoji,
            String nfQ, String primeQ, String imdbUrl, String trailerQ, String reason) {
        return new RecommendationItem(title, desc, "movie", emoji,
                Arrays.asList(nf(nfQ), prime(primeQ), hotstar(nfQ), imdb(imdbUrl), trailer(trailerQ)), reason);
    }

    private RecommendationItem food(String title, String desc, String emoji, String q, String reason) {
        return new RecommendationItem(title, desc, "food", emoji,
                Arrays.asList(swiggy(q), zomato(q), maps(q)), reason);
    }

    private RecommendationItem place(String title, String desc, String emoji, String q, String reason) {
        return new RecommendationItem(title, desc, "place", emoji,
                Arrays.asList(maps(q)), reason);
    }

    private RecommendationItem game(String title, String desc, String emoji, String path) {
        return new RecommendationItem(title, desc, "game", emoji,
                Arrays.asList(new ActionLink("Play Now", path, "game")), null);
    }


    // ═══════════════════════════════════════════════════════════════════════════
    // MUSIC POOLS — language-aware, mood-specific, 5-6 items each
    // ═══════════════════════════════════════════════════════════════════════════
    private List<RecommendationItem> buildMusicPool(String mood, String lang) {
        boolean isTelugu  = "telugu".equals(lang);
        boolean isHindi   = "hindi".equals(lang);
        boolean isBts     = "bts".equals(lang);

        if (isTelugu) return buildTeluguMusic(mood);
        if (isHindi)  return buildHindiMusic(mood);
        if (isBts)    return buildBtsMusic(mood);
        return buildEnglishMusic(mood);
    }

    private List<RecommendationItem> buildTeluguMusic(String mood) {
        return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                music("Pelli Sandadi Hits", "Telugu wedding & celebration songs", "🎉", "Telugu happy celebration songs", "Perfect for your happy mood"),
                music("Dhamaka Party Songs", "High energy Telugu dance hits", "💃", "Telugu party dance songs", "Match your excited energy"),
                music("Jukebox — SPB & Chitra", "Classic feel-good Telugu melodies", "🎵", "SPB Chitra Telugu hits", "Timeless feel-good classics"),
                music("Pushpa Hits 2022", "Allu Arjun's blockbuster songs", "🔥", "Pushpa Telugu songs 2022", "High energy blockbuster hits"),
                music("Ala Vaikunthapurramuloo", "Upbeat Trivikram-Thaman hits", "✨", "Ala Vaikunthapurramuloo songs", "Joyful Telugu chartbusters"),
                music("RRR Naatu Naatu", "Oscar-winning Telugu dance anthem", "🏆", "RRR Naatu Naatu Telugu", "The world's favourite Telugu song"));
            case "SAD", "DISAPPOINTED" -> Arrays.asList(
                music("Manasuna Unna — Sad Melodies", "Heart-touching Telugu sad songs", "💔", "Telugu sad songs melodies", "For when words aren't enough"),
                music("Ilayaraja Telugu Classics", "Timeless emotional Telugu tracks", "🎶", "Ilayaraja Telugu emotional songs", "Timeless comfort"),
                music("Nee Kosam — Breakup Songs", "Songs for a heavy heart", "🌧️", "Telugu breakup sad songs", "You're not alone in this"),
                music("Sid Sriram Emotional Hits", "Soulful modern Telugu melodies", "🌙", "Sid Sriram Telugu sad songs", "Raw, honest emotion"),
                music("Geetha Govindam Sad Cuts", "Bittersweet Telugu love songs", "🌸", "Geetha Govindam sad songs Telugu", "Beautifully melancholic"),
                music("Ye Maaya Chesave OST", "Romantic, emotional Telugu album", "💜", "Ye Maaya Chesave Telugu songs", "A classic for heavy hearts"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                music("Carnatic Calm — Ragas", "Classical Telugu music for inner peace", "🧘", "Telugu carnatic ragas calm", "Proven to reduce stress"),
                music("Flute & Veena Instrumental", "Peaceful Telugu instrumental music", "🎵", "Telugu flute veena instrumental", "Let the music breathe for you"),
                music("Mellaga Mellaga — Soft Songs", "Slow, soothing Telugu melodies", "🌿", "Telugu slow soothing mellaga", "Gentle enough for anxious moments"),
                music("AR Rahman Telugu Calm", "Soulful, calm Telugu compositions", "☕", "AR Rahman Telugu calm melodies", "Master of peaceful soundscapes"),
                music("Ninna Ninna — Lullabies", "Gentle Telugu songs to ease your mind", "🌸", "Telugu soft lullaby calm songs", "Like a warm hug in music form"),
                music("Shankar Ehsaan Loy Telugu", "Peaceful Telugu film compositions", "🌙", "Shankar Ehsaan Loy Telugu calm", "Cinematic calm"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                music("Mahesh Babu Power Anthems", "High energy Telugu hero songs", "⚡", "Mahesh Babu Telugu power songs", "Channel your inner hero"),
                music("Pushpa — Attitude Songs", "Telugu attitude & confidence songs", "😎", "Pushpa Telugu attitude songs", "Walk like you own the room"),
                music("Jai Ho — Motivation Hits", "Telugu motivational & inspiring songs", "💪", "Telugu motivational inspiring songs", "For your unstoppable energy"),
                music("RRR Power Tracks", "Epic Telugu action anthems", "🔥", "RRR Telugu power tracks", "Epic energy for epic goals"),
                music("Naa Peru Surya Hits", "Inspiring Telugu songs", "🌟", "Naa Peru Surya Telugu songs", "Rise and conquer"),
                music("Bheemla Nayak Anthems", "Powerful Telugu songs", "💥", "Bheemla Nayak Telugu songs", "Unstoppable energy"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                music("Flute & Veena — Telugu Classical", "Peaceful Telugu instrumental music", "🎵", "Telugu flute veena classical peaceful", "Pure tranquility"),
                music("AR Rahman Telugu Melodies", "Soulful, calm Telugu compositions", "☕", "AR Rahman Telugu calm melodies", "Crafted for peaceful moments"),
                music("Nuvvu Leka Nenu Lenu Hits", "Gentle Telugu melodies for relaxation", "🌿", "Telugu gentle relaxing melodies", "Soft and unhurried"),
                music("Sekhar Kammula Melodies", "Soft, nature-inspired Telugu songs", "🌸", "Sekhar Kammula Telugu melodies", "Earthy and calming"),
                music("Mani Sharma Soft Hits", "Gentle Telugu film music", "🌙", "Mani Sharma Telugu soft songs", "Perfect background for calm"),
                music("Devi Sri Prasad Chill", "DSP's softer, melodic side", "🎶", "Devi Sri Prasad Telugu chill songs", "Melodic relaxation"));
            case "LONELY" -> Arrays.asList(
                music("Oka Laila Kosam — Longing Songs", "Songs about missing someone", "🌙", "Telugu longing missing songs", "For when you miss someone"),
                music("Nuvvu Nuvvu — Soft Melodies", "Gentle Telugu songs for quiet moments", "🎵", "Telugu soft gentle melodies", "Quiet company"),
                music("Manasantha Nuvve Hits", "Soulful Telugu love songs", "💜", "Telugu soulful love songs", "You're not truly alone"),
                music("Ye Maaya Chesave OST", "Romantic, emotional Telugu album", "🌸", "Ye Maaya Chesave Telugu songs", "Beautiful company in music"),
                music("Sid Sriram Soulful", "Modern Telugu emotional songs", "🎶", "Sid Sriram Telugu soulful", "Deeply human music"),
                music("Sekhar Kammula Love Songs", "Warm Telugu love melodies", "💙", "Sekhar Kammula Telugu love songs", "Gentle warmth"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                music("Mass Beats — Power Songs", "High energy Telugu mass songs", "💥", "Telugu mass power songs", "Release that energy"),
                music("Allu Arjun Dance Hits", "Energetic beats to release tension", "🔥", "Allu Arjun Telugu dance hits", "Dance it out"),
                music("Rowdy Anthem Mix", "Telugu action & attitude songs", "🎸", "Telugu rowdy action songs", "Channel the fire"),
                music("Pushpa Srivalli & Mass Tracks", "High energy Telugu blockbuster songs", "⚡", "Pushpa Telugu mass tracks", "Pure energy release"),
                music("Prabhas Action Anthems", "Baahubali & Saaho power tracks", "💪", "Prabhas Telugu action anthems", "Epic power"),
                music("Devi Sri Prasad Mass Beats", "DSP's high-energy compositions", "🥁", "Devi Sri Prasad mass beats Telugu", "Beats to match your fire"));
            case "TIRED" -> Arrays.asList(
                music("Mellaga Mellaga — Slow Melodies", "Slow, soothing Telugu songs", "😴", "Telugu slow soothing melodies", "Rest your mind"),
                music("Morning Raga Telugu", "Soft morning Telugu classical music", "🌅", "Telugu morning raga soft", "Gentle wake-up music"),
                music("Acoustic Telugu Covers", "Gentle acoustic versions of Telugu hits", "☕", "Telugu acoustic covers soft", "Soft and unhurried"),
                music("Sekhar Kammula Soft Hits", "Gentle, earthy Telugu melodies", "🌿", "Sekhar Kammula Telugu soft", "Low energy, high comfort"),
                music("Mani Sharma Lullabies", "Soft Telugu film music", "🌙", "Mani Sharma Telugu lullaby soft", "Perfect for tired evenings"),
                music("Flute Instrumental Telugu", "Pure flute music for rest", "🎵", "Telugu flute instrumental rest", "Let the music carry you"));
            default -> Arrays.asList(
                music("Top Telugu Hits 2024", "Most popular Telugu songs right now", "🎵", "Telugu top hits 2024", "What everyone's listening to"),
                music("SPB Golden Hits", "Timeless classics by SP Balasubrahmanyam", "🎶", "SPB Telugu golden hits", "Timeless Telugu classics"),
                music("Sid Sriram Telugu Melodies", "Soulful modern Telugu songs", "😊", "Sid Sriram Telugu songs", "Modern Telugu soul"),
                music("Devi Sri Prasad Best Of", "DSP's greatest Telugu compositions", "🔥", "Devi Sri Prasad best Telugu", "The best of DSP"),
                music("AR Rahman Telugu Best", "AR Rahman's finest Telugu work", "✨", "AR Rahman Telugu best songs", "Musical genius"),
                music("Thaman S Telugu Hits", "S. Thaman's top Telugu songs", "💫", "Thaman S Telugu hits 2024", "Current Telugu chartbusters"));
        };
    }

    private List<RecommendationItem> buildHindiMusic(String mood) {
        return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                music("Bollywood Party Hits", "High energy Hindi dance songs", "🎉", "Hindi Bollywood party hits 2024", "Perfect for your happy mood"),
                music("Badshah & Yo Yo Honey Singh", "Top Hindi rap & party tracks", "💃", "Badshah Honey Singh Hindi hits", "Unstoppable energy"),
                music("Arijit Singh Feel Good", "Upbeat Hindi melodies", "🎵", "Arijit Singh happy Hindi songs", "Warm and joyful"),
                music("Ranveer Singh Bollywood Hits", "High energy Bollywood anthems", "🔥", "Ranveer Singh Bollywood hits", "Pure celebration energy"),
                music("Dil Dhadakne Do OST", "Upbeat, feel-good Hindi album", "✨", "Dil Dhadakne Do Hindi songs", "Joyful Bollywood vibes"),
                music("Zindagi Na Milegi Dobara", "Life-affirming Hindi songs", "🌟", "Zindagi Na Milegi Dobara songs", "Celebrate being alive"));
            case "SAD", "DISAPPOINTED" -> Arrays.asList(
                music("Arijit Singh Sad Songs", "Heart-touching Hindi emotional tracks", "💔", "Arijit Singh sad Hindi songs", "For when you need to feel it"),
                music("Tum Hi Ho — Breakup Playlist", "Hindi songs for a heavy heart", "🌧️", "Hindi breakup sad songs", "You're not alone"),
                music("Lata Mangeshkar Classics", "Timeless emotional Hindi melodies", "🎶", "Lata Mangeshkar Hindi classics", "Timeless comfort"),
                music("Jubin Nautiyal Sad Hits", "Modern Hindi emotional songs", "🌙", "Jubin Nautiyal sad Hindi songs", "Raw, honest emotion"),
                music("Ae Dil Hai Mushkil OST", "Bittersweet Hindi love songs", "💜", "Ae Dil Hai Mushkil songs", "Beautiful melancholy"),
                music("Tamasha OST — Imtiaz Ali", "Deep, emotional Hindi album", "🌸", "Tamasha Hindi songs Imtiaz Ali", "Deeply human music"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                music("Rahat Fateh Ali Khan Sufi", "Soulful Sufi music to calm the mind", "🧘", "Rahat Fateh Ali Khan Sufi", "Ancient calm for modern stress"),
                music("Shankar Ehsaan Loy Calm", "Peaceful Hindi compositions", "🌿", "Shankar Ehsaan Loy calm Hindi", "Cinematic peace"),
                music("AR Rahman Hindi Calm", "Soothing AR Rahman Hindi tracks", "☕", "AR Rahman Hindi calm songs", "Master of peaceful soundscapes"),
                music("Stress Relief Hindi", "Calming Hindi melodies for peace", "🌸", "stress relief hindi songs", "Proven to reduce stress"),
                music("Kabir Singh Soft Cuts", "Gentle Hindi melodies", "🌙", "Kabir Singh Hindi soft songs", "Soft and unhurried"),
                music("Aashiqui 2 Calm Tracks", "Gentle Hindi love songs", "💙", "Aashiqui 2 Hindi calm songs", "Gentle company"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                music("Kar Har Maidan Fateh", "Hindi motivational anthems", "💪", "Hindi motivational songs Kar Har Maidan", "Rise and conquer"),
                music("Ranveer Singh Power Songs", "High energy Bollywood hits", "⚡", "Ranveer Singh Bollywood power songs", "Unstoppable energy"),
                music("Dil Bechara — Inspiring Hits", "Uplifting Hindi songs", "😎", "Hindi inspiring uplifting songs", "Life-affirming music"),
                music("Bhaag Milkha Bhaag OST", "Inspiring Hindi sports anthems", "🏃", "Bhaag Milkha Bhaag songs", "Run towards your goals"),
                music("Dangal Motivational Songs", "Aamir Khan's inspiring Hindi tracks", "🏆", "Dangal Hindi motivational songs", "Champion energy"),
                music("83 — Cricket Anthems", "Inspiring Hindi sports songs", "🏏", "83 Hindi cricket songs", "Victory mindset"));
            default -> Arrays.asList(
                music("Top Hindi Hits 2024", "Most popular Hindi songs right now", "🎵", "Hindi top hits 2024", "What everyone's listening to"),
                music("Arijit Singh Best Of", "Soulful Hindi melodies", "🎶", "Arijit Singh best Hindi songs", "The voice of a generation"),
                music("Bollywood Chill Mix", "Easy Hindi songs for any mood", "😊", "Bollywood chill mix Hindi", "Easy listening"),
                music("Pritam Best Compositions", "Bollywood's finest music director", "✨", "Pritam best Hindi songs", "Cinematic excellence"),
                music("Vishal Shekhar Hits", "Energetic Hindi film music", "🔥", "Vishal Shekhar Hindi hits", "Feel-good Bollywood"),
                music("Shankar Ehsaan Loy Best", "Iconic Hindi film compositions", "💫", "Shankar Ehsaan Loy best Hindi", "Timeless Bollywood"));
        };
    }

    private List<RecommendationItem> buildBtsMusic(String mood) {
        return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                music("BTS Dynamite & Butter", "BTS upbeat feel-good hits", "💛", "BTS Dynamite Butter", "Pure joy in music form"),
                music("BTS Permission to Dance", "High energy BTS dance tracks", "💃", "BTS Permission to Dance", "Dance like nobody's watching"),
                music("BTS Boy With Luv", "Sweet & happy BTS melodies", "🎵", "BTS Boy With Luv", "Warm and joyful"),
                music("BTS Idol", "Confident, celebratory BTS anthem", "🎉", "BTS Idol", "Celebrate yourself"),
                music("BTS Life Goes On", "Uplifting BTS feel-good track", "✨", "BTS Life Goes On", "Everything will be okay"),
                music("BTS Yet To Come", "Hopeful BTS anthem", "🌟", "BTS Yet To Come", "The best is yet to come"));
            case "SAD", "DISAPPOINTED" -> Arrays.asList(
                music("BTS Spring Day", "BTS emotional & healing songs", "💔", "BTS Spring Day emotional", "For missing someone"),
                music("BTS Magic Shop", "Comforting BTS tracks for hard days", "🌧️", "BTS Magic Shop comfort", "A safe space in music"),
                music("BTS Epiphany & Singularity", "Deep, soulful BTS solos", "🎶", "BTS Epiphany Singularity", "Raw, honest emotion"),
                music("BTS The Truth Untold", "Hauntingly beautiful BTS ballad", "🌙", "BTS The Truth Untold", "Beautiful melancholy"),
                music("BTS Blue & Grey", "BTS song about feeling lost", "💙", "BTS Blue Grey", "You're understood"),
                music("BTS Fly To My Room", "Gentle BTS introspective track", "🌸", "BTS Fly To My Room", "Quiet reflection"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                music("BTS Not Today & Fire", "BTS power & motivation anthems", "💪", "BTS Not Today Fire motivation", "Unstoppable energy"),
                music("BTS ON & Black Swan", "Intense, powerful BTS tracks", "⚡", "BTS ON Black Swan", "Epic power"),
                music("BTS Mic Drop", "BTS attitude & confidence songs", "😎", "BTS Mic Drop", "Walk like you own it"),
                music("BTS N.O & No More Dream", "BTS rebellious anthems", "🔥", "BTS NO No More Dream", "Break the rules"),
                music("BTS Dionysus", "Powerful BTS performance track", "💥", "BTS Dionysus", "Unleash your power"),
                music("BTS Dope", "High energy BTS confidence anthem", "⚡", "BTS Dope", "You're unstoppable"));
            default -> Arrays.asList(
                music("BTS Greatest Hits", "The best of BTS all time", "💜", "BTS greatest hits", "The best of BTS"),
                music("BTS Map of the Soul", "Soulful BTS album tracks", "🎵", "BTS Map of the Soul", "Deep and meaningful"),
                music("BTS Love Yourself", "BTS self-love & empowerment songs", "✨", "BTS Love Yourself", "Love yourself first"),
                music("BTS BE Album", "Intimate BTS album made in lockdown", "🌙", "BTS BE album", "Personal and heartfelt"),
                music("BTS Proof Album", "BTS anthology of their journey", "🏆", "BTS Proof album", "A decade of music"),
                music("BTS Wings Album", "BTS artistic peak album", "🎶", "BTS Wings album", "Artistic excellence"));
        };
    }

    private List<RecommendationItem> buildEnglishMusic(String mood) {
        return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                music("Happy Vibes Playlist", "Upbeat songs to match your energy", "🎵", "happy vibes playlist 2024", "Perfect for your happy mood"),
                music("Feel Good Hits 2024", "Chart-topping feel-good tracks", "🎶", "feel good hits 2024", "What everyone's loving right now"),
                music("Dance Party Mix", "Get up and move to the beat", "💃", "dance party mix 2024", "Impossible not to dance"),
                music("Pharrell Williams Happy", "The ultimate feel-good anthem", "☀️", "Pharrell Williams Happy", "Scientifically proven to make you smile"),
                music("Taylor Swift Eras Upbeat", "Taylor's most joyful tracks", "✨", "Taylor Swift upbeat happy songs", "Pure pop joy"),
                music("Dua Lipa Dance Hits", "High energy pop dance tracks", "🔥", "Dua Lipa dance hits", "Unstoppable energy"));
            case "SAD", "DISAPPOINTED" -> Arrays.asList(
                music("Healing Melodies", "Gentle songs for the soul", "🎵", "healing sad songs 2024", "For when you need to feel it"),
                music("Comfort Songs", "Songs that feel like a warm hug", "🎶", "comfort emotional songs", "You're not alone"),
                music("Rainy Day Playlist", "Soft music for quiet moments", "🌧️", "rainy day acoustic playlist", "Perfect for grey days"),
                music("Adele Sad Classics", "Adele's most emotional songs", "💔", "Adele sad songs", "The queen of heartbreak"),
                music("Billie Eilish Emotional", "Billie's most vulnerable tracks", "🌙", "Billie Eilish emotional songs", "Raw and honest"),
                music("Lewis Capaldi Heartbreak", "Deeply emotional pop ballads", "💙", "Lewis Capaldi sad songs", "Beautifully melancholic"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                music("Calm & Relax", "Soothing sounds to ease your mind", "🎵", "calm relax stress relief music", "Proven to reduce cortisol"),
                music("Meditation Music", "Deep focus and inner peace", "🧘", "meditation peaceful music", "Ancient calm for modern stress"),
                music("Nature Sounds", "Pure calm", "🌿", "nature sounds relaxing", "Let nature do the work"),
                music("Lofi Hip Hop Study", "Chill beats to calm your mind", "☕", "lofi hip hop study calm", "The internet's favourite calm"),
                music("Brian Eno Ambient", "Pioneering ambient music for peace", "🌊", "Brian Eno ambient music", "Designed for calm"),
                music("Weightless — Marconi Union", "Scientifically the most relaxing song", "🌸", "Weightless Marconi Union", "Scientifically proven to relax"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                music("Power Anthems", "Songs that make you unstoppable", "💪", "power motivation anthems 2024", "For your unstoppable energy"),
                music("Workout Motivation", "High-energy tracks to power you up", "⚡", "workout motivation music 2024", "Push past your limits"),
                music("Boss Mode", "Music for when you mean business", "😎", "boss mode focus playlist", "Walk like you own it"),
                music("Eminem Motivation Hits", "Rap anthems for the driven", "🔥", "Eminem motivation rap hits", "Relentless energy"),
                music("Eye of the Tiger", "The ultimate motivation classic", "🏆", "Eye of the Tiger Survivor", "The original power anthem"),
                music("Kendrick Lamar Power", "Confident, powerful rap tracks", "💥", "Kendrick Lamar power songs", "Unapologetically powerful"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                music("Ambient Chill", "Soft ambient sounds for deep relaxation", "🎵", "ambient chill relaxing music", "Pure tranquility"),
                music("Jazz & Coffee", "Smooth jazz for a peaceful afternoon", "☕", "jazz coffee smooth playlist", "The perfect Sunday soundtrack"),
                music("Spa & Wellness", "Tranquil sounds for mind and body", "🛁", "spa wellness music", "Treat yourself"),
                music("Norah Jones Soft Hits", "Warm, gentle jazz-pop", "🌙", "Norah Jones soft songs", "Warm and unhurried"),
                music("Jack Johnson Acoustic", "Breezy, laid-back acoustic pop", "🌊", "Jack Johnson acoustic chill", "Effortlessly calm"),
                music("Bon Iver Gentle", "Soft, atmospheric indie folk", "🌿", "Bon Iver gentle songs", "Beautifully peaceful"));
            case "LONELY" -> Arrays.asList(
                music("You Are Not Alone Playlist", "Songs about connection and belonging", "🌙", "you are not alone songs", "You're more connected than you think"),
                music("The Weeknd Emotional", "Deeply emotional R&B tracks", "💜", "The Weeknd emotional songs", "Honest and raw"),
                music("Sam Smith Lonely Songs", "Beautifully honest songs about loneliness", "💙", "Sam Smith lonely songs", "Someone understands"),
                music("Coldplay Comfort Songs", "Warm, hopeful Coldplay tracks", "✨", "Coldplay comfort songs", "Gentle company"),
                music("Ed Sheeran Soft Hits", "Warm, personal Ed Sheeran songs", "🌸", "Ed Sheeran soft songs", "Like a friend talking to you"),
                music("Hozier Soulful", "Deep, soulful indie folk", "🎶", "Hozier soulful songs", "Deeply human music"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                music("Rock Release Playlist", "Hard rock to channel your anger", "🎸", "rock release anger playlist", "Release that energy safely"),
                music("Eminem Angry Rap", "Rap to channel frustration", "💥", "Eminem angry rap songs", "Channel the fire"),
                music("Linkin Park Classics", "Cathartic rock anthems", "🔥", "Linkin Park classic songs", "Cathartic release"),
                music("Rage Against the Machine", "Powerful protest rock", "⚡", "Rage Against the Machine hits", "Righteous anger"),
                music("Billie Eilish Dark Side", "Billie's most intense tracks", "😤", "Billie Eilish dark intense songs", "Honest and fierce"),
                music("Olivia Rodrigo Angry Hits", "Pop-punk anger anthems", "🎸", "Olivia Rodrigo angry songs", "Perfectly captures frustration"));
            case "TIRED" -> Arrays.asList(
                music("Chill Lofi Beats", "Easy background music for tired minds", "😴", "lofi chill beats tired", "Rest your mind"),
                music("Acoustic Covers Soft", "Gentle acoustic versions of popular songs", "☕", "acoustic covers soft tired", "Soft and unhurried"),
                music("Norah Jones Sleepy", "Warm, gentle music for tired evenings", "🌙", "Norah Jones sleepy songs", "Perfect for tired evenings"),
                music("Sigur Rós Ambient", "Ethereal Icelandic ambient music", "🌊", "Sigur Ros ambient music", "Drift away"),
                music("Nick Drake Soft Folk", "Gentle, introspective folk music", "🌿", "Nick Drake soft folk", "Quiet and restorative"),
                music("Sufjan Stevens Gentle", "Soft, delicate indie folk", "🌸", "Sufjan Stevens gentle songs", "Beautifully restful"));
            default -> Arrays.asList(
                music("Chill Lofi Beats", "Easy background music for any mood", "🎵", "lofi chill beats", "Always a good choice"),
                music("Top Hits 2024", "The most popular tracks right now", "🎶", "top hits 2024", "What everyone's listening to"),
                music("Feel Good Mix", "A little bit of everything good", "😊", "feel good mix 2024", "Curated for good vibes"),
                music("Indie Chill Playlist", "Indie gems for any mood", "✨", "indie chill playlist 2024", "Discover something new"),
                music("Pop Essentials", "The best pop songs of the decade", "🌟", "pop essentials 2020s", "Timeless pop"),
                music("Acoustic Favourites", "Stripped-back versions of great songs", "🎸", "acoustic favourites playlist", "Music at its most honest"));
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MOVIE POOLS — multilingual (English, Telugu, Hindi, Tamil, Korean, Japanese)
    // 2000+ only, 6-8 per mood bucket, meaningfully different per mood
    // ═══════════════════════════════════════════════════════════════════════════
    private List<RecommendationItem> buildMoviePool(String mood) {
        return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                movie("La La Land (2016)", "A beautiful story of dreams and love", "🎬", "la la land", "la la land", "https://www.imdb.com/title/tt3783958/", "la la land 2016", "For your joyful, dreamy mood"),
                movie("Sing Street (2016)", "A joyful coming-of-age music film", "🎬", "sing street", "sing street", "https://www.imdb.com/title/tt3544112/", "sing street 2016", "Pure joy and music"),
                movie("Ala Vaikunthapurramuloo (2020)", "Telugu blockbuster full of energy and fun", "🎬", "Ala Vaikunthapurramuloo", "Ala Vaikunthapurramuloo", "https://www.imdb.com/title/tt9900782/", "Ala Vaikunthapurramuloo trailer", "Telugu blockbuster energy"),
                movie("3 Idiots (2009)", "A fun and motivating Bollywood classic", "🎬", "3 idiots", "3 idiots", "https://www.imdb.com/title/tt1187043/", "3 idiots trailer", "Bollywood's most joyful film"),
                movie("Parasite (2019)", "A gripping, award-winning Korean masterpiece", "🎬", "parasite bong joon ho", "parasite", "https://www.imdb.com/title/tt6751668/", "parasite 2019 trailer", "Oscar-winning brilliance"),
                movie("Spirited Away (2001)", "A magical Japanese animated adventure", "🎬", "spirited away", "spirited away", "https://www.imdb.com/title/tt0245429/", "spirited away trailer", "Magical and uplifting"),
                movie("The Secret Life of Walter Mitty (2013)", "An inspiring adventure about living fully", "🎬", "walter mitty", "walter mitty", "https://www.imdb.com/title/tt0359950/", "walter mitty trailer", "Live your adventure"),
                movie("Zindagi Na Milegi Dobara (2011)", "A life-affirming Bollywood road trip", "🎬", "Zindagi Na Milegi Dobara", "Zindagi Na Milegi Dobara", "https://www.imdb.com/title/tt1562872/", "Zindagi Na Milegi Dobara trailer", "Celebrate being alive"));
            case "SAD", "DISAPPOINTED" -> Arrays.asList(
                movie("Soul (2020)", "A heartwarming Pixar film about life's purpose", "🎬", "soul pixar", "soul pixar", "https://www.imdb.com/title/tt2948372/", "soul pixar trailer", "Beautifully healing"),
                movie("Inside Out (2015)", "A beautiful exploration of emotions", "🎬", "inside out pixar", "inside out", "https://www.imdb.com/title/tt2096673/", "inside out trailer", "Your feelings are valid"),
                movie("Good Will Hunting (1997)", "A moving story about healing and connection", "🎬", "good will hunting", "good will hunting", "https://www.imdb.com/title/tt0119217/", "good will hunting trailer", "Healing through connection"),
                movie("Ye Maaya Chesave (2010)", "A bittersweet Telugu love story", "🎬", "Ye Maaya Chesave", "Ye Maaya Chesave", "https://www.imdb.com/title/tt1640459/", "Ye Maaya Chesave trailer", "Beautiful Telugu heartbreak"),
                movie("Taare Zameen Par (2007)", "A deeply moving Hindi film about understanding", "🎬", "Taare Zameen Par", "Taare Zameen Par", "https://www.imdb.com/title/tt0986264/", "Taare Zameen Par trailer", "Deeply moving and healing"),
                movie("My Neighbor Totoro (1988)", "A gentle, magical film to rest your mind", "🎬", "my neighbor totoro", "my neighbor totoro", "https://www.imdb.com/title/tt0096283/", "my neighbor totoro trailer", "Gentle comfort"),
                movie("Eternal Sunshine of the Spotless Mind (2004)", "A poetic film about love and loss", "🎬", "eternal sunshine spotless mind", "eternal sunshine", "https://www.imdb.com/title/tt0338013/", "eternal sunshine trailer", "Beautifully melancholic"),
                movie("Coco (2017)", "A beautiful story about love and memory", "🎬", "coco pixar", "coco pixar", "https://www.imdb.com/title/tt2380307/", "coco pixar trailer", "Love transcends everything"));
            case "LONELY" -> Arrays.asList(
                movie("Her (2013)", "A tender film about connection and loneliness", "🎬", "her 2013 joaquin phoenix", "her 2013", "https://www.imdb.com/title/tt1798709/", "her 2013 trailer", "You're not as alone as you feel"),
                movie("Lost in Translation (2003)", "A quiet, beautiful film about connection", "🎬", "lost in translation", "lost in translation", "https://www.imdb.com/title/tt0335266/", "lost in translation trailer", "Finding connection in unexpected places"),
                movie("About Time (2013)", "A warm film about cherishing moments", "🎬", "about time 2013", "about time", "https://www.imdb.com/title/tt2194499/", "about time 2013 trailer", "Every moment matters"),
                movie("Oka Laila Kosam (2014)", "A sweet Telugu film about longing and love", "🎬", "Oka Laila Kosam", "Oka Laila Kosam", "https://www.imdb.com/title/tt3863552/", "Oka Laila Kosam trailer", "Telugu warmth for lonely hearts"),
                movie("Jab We Met (2007)", "A warm, funny Bollywood journey of self-discovery", "🎬", "Jab We Met", "Jab We Met", "https://www.imdb.com/title/tt1093370/", "Jab We Met trailer", "Find yourself again"),
                movie("Amélie (2001)", "A whimsical French film about finding joy", "🎬", "amelie 2001", "amelie", "https://www.imdb.com/title/tt0211915/", "amelie trailer", "Warmth in unexpected places"),
                movie("The Intouchables (2011)", "A heartwarming French film about unlikely friendship", "🎬", "the intouchables 2011", "intouchables", "https://www.imdb.com/title/tt1675434/", "intouchables trailer", "Connection heals everything"),
                movie("Forrest Gump (1994)", "A timeless story about life's journey", "🎬", "forrest gump", "forrest gump", "https://www.imdb.com/title/tt0109830/", "forrest gump trailer", "You're never truly alone"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                movie("Chef (2014)", "A relaxing feel-good movie about passion", "🎬", "chef 2014", "chef 2014", "https://www.imdb.com/title/tt2883512/", "chef 2014 trailer", "Stress melts away watching this"),
                movie("Julie & Julia (2009)", "A comforting story about finding joy", "🎬", "julie julia 2009", "julie julia", "https://www.imdb.com/title/tt1135503/", "julie julia trailer", "Warm and comforting"),
                movie("The Secret Garden (2020)", "A peaceful, healing story", "🎬", "secret garden 2020", "secret garden 2020", "https://www.imdb.com/title/tt5774060/", "secret garden 2020 trailer", "Nature heals"),
                movie("Okka Kshanam (2017)", "A gentle Telugu time-travel love story", "🎬", "Okka Kshanam Telugu", "Okka Kshanam", "https://www.imdb.com/title/tt6710474/", "Okka Kshanam trailer", "A gentle Telugu escape"),
                movie("Tamasha (2015)", "A Hindi film about finding your true self", "🎬", "Tamasha 2015", "Tamasha", "https://www.imdb.com/title/tt3799694/", "Tamasha 2015 trailer", "Find your calm centre"),
                movie("Princess Mononoke (1997)", "A beautiful, peaceful epic", "🎬", "princess mononoke", "princess mononoke", "https://www.imdb.com/title/tt0119698/", "princess mononoke trailer", "Nature's healing power"),
                movie("Midnight in Paris (2011)", "A dreamy, escapist Woody Allen film", "🎬", "midnight in paris 2011", "midnight in paris", "https://www.imdb.com/title/tt1605783/", "midnight in paris trailer", "A beautiful escape"),
                movie("Howl's Moving Castle (2004)", "A magical Studio Ghibli escape", "🎬", "howls moving castle", "howls moving castle", "https://www.imdb.com/title/tt0347149/", "howls moving castle trailer", "Drift away from your worries"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                movie("Whiplash (2014)", "Intense, cathartic, and deeply satisfying", "🎬", "whiplash 2014", "whiplash", "https://www.imdb.com/title/tt2582802/", "whiplash trailer", "Channel your intensity"),
                movie("Mad Max: Fury Road (2015)", "Pure adrenaline release", "🎬", "mad max fury road", "mad max fury road", "https://www.imdb.com/title/tt1392190/", "mad max fury road trailer", "Pure cathartic release"),
                movie("Pushpa: The Rise (2021)", "Telugu mass action film with attitude", "🎬", "Pushpa The Rise Telugu", "Pushpa The Rise", "https://www.imdb.com/title/tt8108198/", "Pushpa The Rise trailer", "Channel that fire"),
                movie("Dangal (2016)", "A powerful Hindi film about fighting back", "🎬", "Dangal 2016", "Dangal", "https://www.imdb.com/title/tt5074352/", "Dangal trailer", "Turn anger into strength"),
                movie("Train to Busan (2016)", "Intense Korean thriller — pure adrenaline", "🎬", "train to busan", "train to busan", "https://www.imdb.com/title/tt5700672/", "train to busan trailer", "Intense and cathartic"),
                movie("Oldboy (2003)", "A gripping, intense Korean revenge thriller", "🎬", "oldboy 2003 korean", "oldboy korean", "https://www.imdb.com/title/tt0364569/", "oldboy 2003 trailer", "Cathartic intensity"),
                movie("Rocky (1976)", "Channel your fire into something powerful", "🎬", "rocky 1976", "rocky", "https://www.imdb.com/title/tt0075148/", "rocky trailer", "Turn frustration into fuel"),
                movie("Baahubali: The Beginning (2015)", "Epic Telugu action spectacle", "🎬", "Baahubali The Beginning", "Baahubali", "https://www.imdb.com/title/tt2631186/", "Baahubali trailer", "Epic scale for big feelings"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                movie("The Pursuit of Happyness (2006)", "An inspiring true story of resilience", "🎬", "pursuit of happyness", "pursuit of happyness", "https://www.imdb.com/title/tt0454921/", "pursuit of happyness trailer", "Real-life inspiration"),
                movie("The Social Network (2010)", "Ambition, drive, and building something great", "🎬", "social network 2010", "social network", "https://www.imdb.com/title/tt1285016/", "social network trailer", "Build something great"),
                movie("Dangal (2016)", "A powerful story of determination", "🎬", "Dangal 2016", "Dangal", "https://www.imdb.com/title/tt5074352/", "Dangal trailer", "Champions are made, not born"),
                movie("RRR (2022)", "Epic Telugu action film about courage", "🎬", "RRR Telugu 2022", "RRR", "https://www.imdb.com/title/tt8178634/", "RRR trailer", "Epic courage and determination"),
                movie("Interstellar (2014)", "A mind-bending film about human potential", "🎬", "interstellar 2014", "interstellar", "https://www.imdb.com/title/tt0816692/", "interstellar trailer", "Humanity's potential is limitless"),
                movie("Moneyball (2011)", "A smart film about thinking differently", "🎬", "moneyball 2011", "moneyball", "https://www.imdb.com/title/tt1210166/", "moneyball trailer", "Think differently, win differently"),
                movie("The Wolf of Wall Street (2013)", "Ambitious, energetic, and relentless", "🎬", "wolf of wall street", "wolf of wall street", "https://www.imdb.com/title/tt0993846/", "wolf of wall street trailer", "Relentless ambition"),
                movie("Bhaag Milkha Bhaag (2013)", "Inspiring Hindi sports biopic", "🎬", "Bhaag Milkha Bhaag", "Bhaag Milkha Bhaag", "https://www.imdb.com/title/tt2356180/", "Bhaag Milkha Bhaag trailer", "Run towards your dreams"));
            case "TIRED" -> Arrays.asList(
                movie("My Neighbor Totoro (1988)", "A gentle, magical film to rest your mind", "🎬", "my neighbor totoro", "my neighbor totoro", "https://www.imdb.com/title/tt0096283/", "my neighbor totoro trailer", "Rest your tired mind"),
                movie("Chef (2014)", "Cozy, warm, and easy to watch", "🎬", "chef 2014", "chef 2014", "https://www.imdb.com/title/tt2883512/", "chef 2014 trailer", "Warm and effortless"),
                movie("Julie & Julia (2009)", "Comforting and easy to enjoy", "🎬", "julie julia 2009", "julie julia", "https://www.imdb.com/title/tt1135503/", "julie julia trailer", "Cozy comfort viewing"),
                movie("Kiki's Delivery Service (1989)", "A gentle, charming Studio Ghibli film", "🎬", "kikis delivery service", "kikis delivery service", "https://www.imdb.com/title/tt0097814/", "kikis delivery service trailer", "Gentle and charming"),
                movie("Piku (2015)", "A warm, slice-of-life Hindi film", "🎬", "Piku 2015 Hindi", "Piku", "https://www.imdb.com/title/tt3767372/", "Piku 2015 trailer", "Warm and unhurried"),
                movie("Midnight in Paris (2011)", "A dreamy, low-effort escape", "🎬", "midnight in paris 2011", "midnight in paris", "https://www.imdb.com/title/tt1605783/", "midnight in paris trailer", "Effortless escapism"),
                movie("Howl's Moving Castle (2004)", "A magical, easy-to-watch Ghibli film", "🎬", "howls moving castle", "howls moving castle", "https://www.imdb.com/title/tt0347149/", "howls moving castle trailer", "Magical and restful"),
                movie("Notting Hill (1999)", "A warm, easy romantic comedy", "🎬", "notting hill 1999", "notting hill", "https://www.imdb.com/title/tt0125439/", "notting hill trailer", "Easy, warm viewing"));
            case "BORED" -> Arrays.asList(
                movie("Knives Out (2019)", "A clever, twisty mystery to keep you hooked", "🎬", "knives out 2019", "knives out", "https://www.imdb.com/title/tt8946378/", "knives out trailer", "You won't see the ending coming"),
                movie("The Grand Budapest Hotel (2014)", "Quirky, colourful, and endlessly entertaining", "🎬", "grand budapest hotel", "grand budapest hotel", "https://www.imdb.com/title/tt2278388/", "grand budapest hotel trailer", "Visually stunning and fun"),
                movie("Parasite (2019)", "A gripping Korean thriller that keeps you guessing", "🎬", "parasite bong joon ho", "parasite", "https://www.imdb.com/title/tt6751668/", "parasite 2019 trailer", "You'll be glued to the screen"),
                movie("Inception (2010)", "A mind-bending thriller to engage your brain", "🎬", "inception 2010", "inception", "https://www.imdb.com/title/tt1375666/", "inception trailer", "Your brain will thank you"),
                movie("Vikram (2022)", "A gripping Tamil action thriller", "🎬", "Vikram Tamil 2022", "Vikram Tamil", "https://www.imdb.com/title/tt10370710/", "Vikram Tamil trailer", "Gripping Tamil action"),
                movie("Glass Onion (2022)", "A fun, clever mystery sequel", "🎬", "glass onion knives out", "glass onion", "https://www.imdb.com/title/tt11564570/", "glass onion trailer", "Clever and entertaining"),
                movie("Everything Everywhere All at Once (2022)", "A wild, creative multiverse adventure", "🎬", "everything everywhere all at once", "everything everywhere", "https://www.imdb.com/title/tt6710474/", "everything everywhere trailer", "Unlike anything you've seen"),
                movie("Andhadhun (2018)", "A gripping Hindi thriller full of twists", "🎬", "Andhadhun Hindi 2018", "Andhadhun", "https://www.imdb.com/title/tt8108198/", "Andhadhun trailer", "Twist after twist"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                movie("Amélie (2001)", "A whimsical, warm French classic", "🎬", "amelie 2001", "amelie", "https://www.imdb.com/title/tt0211915/", "amelie trailer", "Warm and whimsical"),
                movie("Princess Mononoke (1997)", "A beautiful, peaceful epic", "🎬", "princess mononoke", "princess mononoke", "https://www.imdb.com/title/tt0119698/", "princess mononoke trailer", "Nature's beauty on screen"),
                movie("Chef (2014)", "Slow, warm, and deeply satisfying", "🎬", "chef 2014", "chef 2014", "https://www.imdb.com/title/tt2883512/", "chef 2014 trailer", "Warm and unhurried"),
                movie("Spirited Away (2001)", "A dreamy escape into another world", "🎬", "spirited away", "spirited away", "https://www.imdb.com/title/tt0245429/", "spirited away trailer", "Drift away peacefully"),
                movie("Sekhar Kammula's Happy Days (2007)", "A warm Telugu coming-of-age film", "🎬", "Happy Days Telugu Sekhar Kammula", "Happy Days Telugu", "https://www.imdb.com/title/tt1049413/", "Happy Days Telugu trailer", "Warm Telugu nostalgia"),
                movie("Piku (2015)", "A warm, slice-of-life Hindi film", "🎬", "Piku 2015 Hindi", "Piku", "https://www.imdb.com/title/tt3767372/", "Piku 2015 trailer", "Gentle and real"),
                movie("Midnight in Paris (2011)", "A dreamy, romantic escape", "🎬", "midnight in paris 2011", "midnight in paris", "https://www.imdb.com/title/tt1605783/", "midnight in paris trailer", "Dreamy and peaceful"),
                movie("The Lunchbox (2013)", "A quiet, beautiful Hindi film about connection", "🎬", "The Lunchbox 2013 Hindi", "The Lunchbox", "https://www.imdb.com/title/tt2350496/", "The Lunchbox trailer", "Quietly beautiful"));
            case "HOPEFUL" -> Arrays.asList(
                movie("The Shawshank Redemption (1994)", "Hope and resilience at their finest", "🎬", "shawshank redemption", "shawshank redemption", "https://www.imdb.com/title/tt0111161/", "shawshank redemption trailer", "The ultimate hope film"),
                movie("Life of Pi (2012)", "A visually stunning story of survival and faith", "🎬", "life of pi 2012", "life of pi", "https://www.imdb.com/title/tt0454876/", "life of pi trailer", "Faith and resilience"),
                movie("Taare Zameen Par (2007)", "A deeply moving Hindi film about potential", "🎬", "Taare Zameen Par", "Taare Zameen Par", "https://www.imdb.com/title/tt0986264/", "Taare Zameen Par trailer", "Everyone has potential"),
                movie("Naa Peru Surya (2018)", "An inspiring Telugu film about second chances", "🎬", "Naa Peru Surya Telugu", "Naa Peru Surya", "https://www.imdb.com/title/tt7131622/", "Naa Peru Surya trailer", "Second chances are real"),
                movie("Coco (2017)", "A beautiful story about love and legacy", "🎬", "coco pixar", "coco pixar", "https://www.imdb.com/title/tt2380307/", "coco pixar trailer", "Love lives on"),
                movie("The Pursuit of Happyness (2006)", "A true story of never giving up", "🎬", "pursuit of happyness", "pursuit of happyness", "https://www.imdb.com/title/tt0454921/", "pursuit of happyness trailer", "Never stop believing"),
                movie("Slumdog Millionaire (2008)", "A hopeful story against all odds", "🎬", "slumdog millionaire", "slumdog millionaire", "https://www.imdb.com/title/tt1010048/", "slumdog millionaire trailer", "Hope against all odds"),
                movie("Zindagi Na Milegi Dobara (2011)", "A life-affirming Bollywood road trip", "🎬", "Zindagi Na Milegi Dobara", "Zindagi Na Milegi Dobara", "https://www.imdb.com/title/tt1562872/", "Zindagi Na Milegi Dobara trailer", "Life is worth living fully"));
            case "INSECURE" -> Arrays.asList(
                movie("Legally Blonde (2001)", "Proving everyone wrong with confidence", "🎬", "legally blonde", "legally blonde", "https://www.imdb.com/title/tt0250494/", "legally blonde trailer", "You're more capable than you think"),
                movie("Billy Elliot (2000)", "Courage to be yourself against all odds", "🎬", "billy elliot 2000", "billy elliot", "https://www.imdb.com/title/tt0249462/", "billy elliot trailer", "Be unapologetically yourself"),
                movie("The Devil Wears Prada (2006)", "A story about finding your own strength", "🎬", "devil wears prada", "devil wears prada", "https://www.imdb.com/title/tt0458352/", "devil wears prada trailer", "Find your strength"),
                movie("Taare Zameen Par (2007)", "A film about recognising your unique gifts", "🎬", "Taare Zameen Par", "Taare Zameen Par", "https://www.imdb.com/title/tt0986264/", "Taare Zameen Par trailer", "Your gifts are unique"),
                movie("Geetha Govindam (2018)", "A sweet Telugu film about self-worth and love", "🎬", "Geetha Govindam Telugu", "Geetha Govindam", "https://www.imdb.com/title/tt8108198/", "Geetha Govindam trailer", "You deserve love"),
                movie("Queen (2014)", "A Hindi film about a woman finding herself", "🎬", "Queen 2014 Hindi", "Queen Hindi", "https://www.imdb.com/title/tt3322420/", "Queen 2014 trailer", "Find yourself"),
                movie("Whiplash (2014)", "A film about pushing past self-doubt", "🎬", "whiplash 2014", "whiplash", "https://www.imdb.com/title/tt2582802/", "whiplash trailer", "Push past your limits"),
                movie("Soul (2020)", "A film about finding your worth", "🎬", "soul pixar", "soul pixar", "https://www.imdb.com/title/tt2948372/", "soul pixar trailer", "Your worth isn't your achievements"));
            default -> Arrays.asList(
                movie("Forrest Gump (1994)", "A timeless story about life's journey", "🎬", "forrest gump", "forrest gump", "https://www.imdb.com/title/tt0109830/", "forrest gump trailer", "A timeless classic"),
                movie("The Shawshank Redemption (1994)", "Hope and resilience at their finest", "🎬", "shawshank redemption", "shawshank redemption", "https://www.imdb.com/title/tt0111161/", "shawshank redemption trailer", "Timeless cinema"),
                movie("Coco (2017)", "A beautiful story about love and memory", "🎬", "coco pixar", "coco pixar", "https://www.imdb.com/title/tt2380307/", "coco pixar trailer", "Universally loved"),
                movie("3 Idiots (2009)", "A fun and motivating Bollywood classic", "🎬", "3 idiots", "3 idiots", "https://www.imdb.com/title/tt1187043/", "3 idiots trailer", "Bollywood at its best"),
                movie("Spirited Away (2001)", "A magical Japanese animated adventure", "🎬", "spirited away", "spirited away", "https://www.imdb.com/title/tt0245429/", "spirited away trailer", "Magical and timeless"),
                movie("Parasite (2019)", "A gripping, award-winning Korean masterpiece", "🎬", "parasite bong joon ho", "parasite", "https://www.imdb.com/title/tt6751668/", "parasite 2019 trailer", "Oscar-winning brilliance"),
                movie("Amélie (2001)", "A whimsical, warm French classic", "🎬", "amelie 2001", "amelie", "https://www.imdb.com/title/tt0211915/", "amelie trailer", "Warm and whimsical"),
                movie("RRR (2022)", "Epic Telugu action film", "🎬", "RRR Telugu 2022", "RRR", "https://www.imdb.com/title/tt8178634/", "RRR trailer", "Epic Telugu cinema"));
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PLACE POOLS — time-of-day aware, mood-specific, 5-6 per bucket
    // ═══════════════════════════════════════════════════════════════════════════
    private List<RecommendationItem> buildPlacePool(String mood, String timeOfDay) {
        boolean isEvening = "evening".equals(timeOfDay) || "night".equals(timeOfDay);
        boolean isMorning = "morning".equals(timeOfDay);

        return switch (mood) {
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                place("Peaceful Park", "Find a quiet green space to breathe and reset", "🌳", "peaceful park", "Proven to reduce cortisol"),
                place("Cozy Café", "A warm café to sit, sip, and unwind", "☕", "cozy cafe", "Warmth and quiet"),
                place("Library", "Quiet, calm, and full of good company", "📚", "library", "Silence is healing"),
                place("Botanical Garden", "Nature's gentle hug when you need it most", "🌸", "botanical garden", "Nature reduces anxiety"),
                place("Yoga Studio", "Reconnect with your breath and body", "🧘", "yoga studio", "Breathe it out"),
                place("Riverside or Lakeside", "Water has a calming effect on the nervous system", "🌊", "lake river park", "Water calms the mind"));
            case "SAD", "LONELY", "DISAPPOINTED" -> Arrays.asList(
                place("Bookstore or Library", "A calm space with good company in books", "📚", "bookstore", "Books are the best company"),
                place("Community Café", "A social café where you can feel less alone", "☕", "cafe", "Gentle social warmth"),
                place("Botanical Garden", "Nature's gentle hug when you need it most", "🌸", "botanical garden", "Nature heals"),
                place("Art Gallery", "Lose yourself in beautiful art", "🎨", "art gallery", "Art speaks when words fail"),
                place("Sunset Viewpoint", "Watch the sky change — it always does", "🌅", "sunset viewpoint", "Everything changes"),
                place("Pet Café", "Furry company for lonely moments", "🐾", "pet cafe", "Animals heal loneliness"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                place("Sports Complex / Gym", "Burn off that energy physically", "🏋️", "gym sports complex", "Physical release is healthy"),
                place("Open Ground / Park", "Space to walk, run, and breathe it out", "🌿", "open park ground", "Move the anger out"),
                place("Arcade / Gaming Zone", "Release tension through play", "🎮", "arcade gaming zone", "Play it out"),
                place("Boxing / Martial Arts Studio", "Channel anger into skill", "🥊", "boxing martial arts studio", "Turn anger into strength"),
                place("Hiking Trail", "Walk it off in nature", "🥾", "hiking trail", "Nature absorbs anger"),
                place("Bowling Alley", "Knock things down — it helps", "🎳", "bowling alley", "Satisfying release"));
            case "HAPPY", "EXCITED", "MOTIVATED" -> Arrays.asList(
                place("Rooftop Restaurant", "Celebrate with a view", "🌆", "rooftop restaurant", "Celebrate your energy"),
                place("Adventure Park", "Get active and have fun outdoors", "🎡", "adventure park", "Match your excitement"),
                place("Art Gallery / Museum", "Feed your curious, energetic mind", "🎨", "art gallery museum", "Explore and discover"),
                place("Night Market / Street Food Area", isEvening ? "Perfect evening exploration" : "Vibrant local culture", "🌮", "night market street food", "Vibrant and exciting"),
                place("Rooftop Café", "Big views for big energy", "🌆", "rooftop cafe", "Elevate your mood"),
                place("Escape Room", "Challenge your excited mind", "🔐", "escape room", "Put that energy to work"));
            case "BORED" -> Arrays.asList(
                place("Escape Room", "Challenge your mind and beat boredom", "🔐", "escape room", "Guaranteed engagement"),
                place("Night Market / Street Food Area", "Explore local food and culture", "🌮", "night market street food", "Something new to discover"),
                place("Bowling Alley / Arcade", "Fun activities to shake off the dullness", "🎳", "bowling alley arcade", "Instant fun"),
                place("Museum or Science Centre", "Discover something fascinating", "🔬", "museum science centre", "Feed your curiosity"),
                place("Comedy Club", isEvening ? "Perfect evening entertainment" : "Laughter is the cure", "😂", "comedy club", "Laughter cures boredom"),
                place("Trampoline Park", "Bounce your boredom away", "🤸", "trampoline park", "Impossible to be bored here"));
            case "TIRED" -> Arrays.asList(
                place("Spa or Wellness Centre", "Rest, recover, and recharge", "🛁", "spa wellness centre", "You deserve rest"),
                place("Quiet Café", "A peaceful corner to sit and do nothing", "☕", "quiet cafe", "Permission to do nothing"),
                place("Lakeside or Riverside", "Gentle nature to restore your energy", "🌊", "lake river park", "Let nature restore you"),
                place("Hammock Park", "Literally lie down in nature", "🌳", "hammock park", "Rest is productive"),
                place("Bookstore Café", "Browse slowly, no rush", "📚", "bookstore cafe", "Slow and restorative"),
                place("Rooftop with a View", isEvening ? "Watch the city lights wind down" : "Fresh air and open sky", "🌆", "rooftop view", "Fresh air restores energy"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                place("Sunset Viewpoint", "Watch the sky change colours in peace", "🌅", "sunset viewpoint", "Pure peace"),
                place("Café with Garden Seating", "Outdoor seating, fresh air, good vibes", "🌿", "cafe garden seating", "Outdoor calm"),
                place("Beach or Lakeside", "Water has a way of calming everything", "🏖️", "beach lake", "Water and peace"),
                place("Botanical Garden", "Slow walks among beautiful plants", "🌸", "botanical garden", "Nature at its most peaceful"),
                place("Quiet Library", "Surrounded by books and silence", "📚", "quiet library", "Peaceful and grounding"),
                place("Meditation Centre", "Deepen your calm with guided practice", "🧘", "meditation centre", "Deepen your peace"));
            case "HOPEFUL", "CONFIDENT" -> Arrays.asList(
                place("Co-working Space / Library", "Channel that energy into something productive", "💻", "coworking space library", "Turn hope into action"),
                place("Rooftop Café", "Big views for big dreams", "🌆", "rooftop cafe", "Dream big"),
                place("Bookstore", "Find your next source of inspiration", "📚", "bookstore", "Inspiration awaits"),
                place("Art Gallery", "Surround yourself with creative energy", "🎨", "art gallery", "Creative inspiration"),
                place("Sunrise Viewpoint", isMorning ? "Perfect morning energy" : "Remind yourself of new beginnings", "🌅", "sunrise viewpoint", "New beginnings"),
                place("Networking Café / Event Space", "Connect with like-minded people", "🤝", "networking cafe event space", "Build your future"));
            case "INSECURE" -> Arrays.asList(
                place("Quiet Park", "A gentle walk to clear your head", "🌳", "quiet park", "Gentle and safe"),
                place("Cozy Café", "A warm, safe space just for you", "☕", "cozy cafe", "Warmth and safety"),
                place("Yoga Studio", "Reconnect with yourself gently", "🧘", "yoga studio", "Reconnect with yourself"),
                place("Bookstore", "Lose yourself in stories of others who overcame", "📚", "bookstore", "Find your story"),
                place("Art Gallery", "Express and explore without judgment", "🎨", "art gallery", "No judgment here"),
                place("Botanical Garden", "Nature accepts you exactly as you are", "🌸", "botanical garden", "You belong here"));
            default -> Arrays.asList(
                place("Top Rated Café Nearby", "A great spot to relax and recharge", "☕", "top rated cafe", "Highly recommended"),
                place("Nature Walk Trail", "A refreshing walk in nature", "🌿", "nature walk trail", "Fresh air always helps"),
                place("Local Park", "Fresh air and open space", "🌳", "local park", "Simple and restorative"),
                place("Art Gallery", "Discover something beautiful", "🎨", "art gallery", "Beauty lifts the spirit"),
                place("Bookstore Café", "Browse and sip at your own pace", "📚", "bookstore cafe", "Slow and enjoyable"),
                place("Rooftop Café", "Great views and good coffee", "🌆", "rooftop cafe", "Elevate your perspective"));
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FOOD POOLS — time-of-day aware, mood-specific, 5-6 per bucket
    // ═══════════════════════════════════════════════════════════════════════════
    private List<RecommendationItem> buildFoodPool(String mood, String timeOfDay) {
        boolean isEvening = "evening".equals(timeOfDay) || "night".equals(timeOfDay);
        boolean isMorning = "morning".equals(timeOfDay);

        return switch (mood) {
            case "SAD", "LONELY", "DISAPPOINTED" -> Arrays.asList(
                food("Comfort Biryani", "Warm, soul-hugging biryani delivered to you", "🍛", "biryani comfort food", "Comfort food for the soul"),
                food("Hot Chocolate & Desserts", "Sweet treats to lift your spirits", "🍫", "hot chocolate desserts", "Sweetness heals"),
                food("Warm Soup & Bread", "A bowl of warmth for a heavy heart", "🥣", "soup bread warm", "Warmth from the inside"),
                food("Ice Cream & Waffles", "Sometimes sweet is the answer", "🍦", "ice cream waffles", "A little sweetness goes a long way"),
                food("Pasta & Garlic Bread", "Cosy, filling, and satisfying", "🍝", "pasta garlic bread", "Carbs are comfort"),
                food("Masala Chai & Snacks", "A warm cup and something to nibble", "☕", "masala chai snacks", "The Indian comfort ritual"));
            case "HAPPY", "EXCITED" -> Arrays.asList(
                food("Celebration Meal", "Treat yourself — you deserve it!", "🎉", "special celebration meal", "You deserve to celebrate"),
                food("Pizza Party", "Because happy moods deserve pizza", "🍕", "pizza", "Always a good idea"),
                food("Sushi & Asian Cuisine", "Fresh, vibrant food for a vibrant mood", "🍱", "sushi asian cuisine", "Fresh and exciting"),
                food("Bubble Tea & Desserts", "Fun, colourful, and delicious", "🧋", "bubble tea desserts", "Fun food for fun moods"),
                food("Tacos & Street Food", "Bold, exciting flavours", "🌮", "tacos street food", "Vibrant and exciting"),
                food("Brunch Spread", isMorning ? "Perfect morning celebration" : "Brunch is always a good idea", "🥞", "brunch spread", "Celebrate with food"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                food("Healthy Power Bowl", "Fuel your amazing energy", "🥗", "healthy power bowl salad", "Fuel your drive"),
                food("Protein-Rich Meal", "Feed your drive with the right nutrition", "💪", "protein meal grilled chicken", "Nutrition for champions"),
                food("Smoothie & Acai Bowl", "Clean energy for a productive day", "🥤", "smoothie acai bowl", "Clean fuel"),
                food("Grilled Chicken & Veggies", "Light, nutritious, and energising", "🍗", "grilled chicken vegetables", "Eat like a champion"),
                food("Avocado Toast & Eggs", "The classic high-performer breakfast", "🥑", "avocado toast eggs", "Fuel for success"),
                food("Quinoa & Grain Bowl", "Sustained energy for sustained effort", "🌾", "quinoa grain bowl", "Long-lasting energy"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                food("Herbal Tea & Light Snacks", "Calming food to ease your nerves", "🍵", "herbal tea snacks", "Proven to calm nerves"),
                food("Warm Soup", "Simple, nourishing, calming", "🥣", "warm soup", "Warmth from the inside"),
                food("Dark Chocolate", "Proven to reduce cortisol — treat yourself", "🍫", "dark chocolate", "Science says it helps"),
                food("Chamomile Tea & Honey", "The classic stress-relief drink", "🌼", "chamomile tea honey", "Ancient stress relief"),
                food("Banana & Nuts", "Natural mood-boosting snacks", "🍌", "banana nuts snack", "Natural mood boost"),
                food("Warm Oatmeal", isMorning ? "A grounding morning meal" : "Warm and grounding", "🥣", "warm oatmeal", "Grounding and nourishing"));
            case "TIRED" -> Arrays.asList(
                food("Biryani & Rice Bowls", "Hearty comfort food to refuel", "🍛", "biryani rice bowl", "Refuel your body"),
                food("Coffee & Snacks", "A gentle pick-me-up", "☕", "coffee snacks", "A gentle boost"),
                food("Energy Boosting Meal", "Protein-rich food to restore your energy", "⚡", "protein energy meal", "Restore your energy"),
                food("Pasta & Carbs", "Comforting carbs to restore your energy", "🍝", "pasta", "Carbs restore energy"),
                food("Banana Smoothie", "Quick natural energy boost", "🍌", "banana smoothie energy", "Natural energy"),
                food("Masala Dosa", "Light but filling South Indian comfort", "🫓", "masala dosa", "Light and energising"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                food("Spicy Food", "Channel that fire into flavour", "🌶️", "spicy food", "Channel the fire"),
                food("Burger & Fries", "Sometimes you just need a good burger", "🍔", "burger fries", "Satisfying and bold"),
                food("Chamomile Tea & Calm Bites", "Let food help you wind down", "🍵", "chamomile tea calm", "Calm from the inside"),
                food("Tacos & Street Food", "Bold flavours to match your energy", "🌮", "tacos street food", "Bold and satisfying"),
                food("Dark Chocolate", "Proven to reduce anger hormones", "🍫", "dark chocolate", "Science-backed calm"),
                food("Spicy Ramen", "Hot, bold, and deeply satisfying", "🍜", "spicy ramen", "Intense and satisfying"));
            case "BORED" -> Arrays.asList(
                food("Try a New Cuisine", "A cuisine you've never had before", "🌍", "new cuisine exotic", "Discover something new"),
                food("Street Food", "Exciting local bites to break the monotony", "🌮", "street food", "Adventure in every bite"),
                food("Dessert Café", "Explore a new sweet spot", "🧁", "dessert cafe", "Sweet discovery"),
                food("Korean BBQ", "Interactive, social, and delicious", "🥩", "korean bbq", "Make eating an experience"),
                food("Ethiopian Injera", "A completely different food experience", "🫓", "ethiopian injera", "Expand your palate"),
                food("DIY Cooking Kit", "Order ingredients and cook something new", "👨‍🍳", "cooking kit meal", "Create something new"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                food("Light Salad & Wraps", "Fresh, clean food for a peaceful mind", "🥗", "salad wraps light", "Light and clean"),
                food("Herbal Tea & Pastries", "A slow, mindful treat", "🍵", "herbal tea pastries", "Slow and mindful"),
                food("Sushi & Miso Soup", "Clean, calming Japanese cuisine", "🍱", "sushi miso soup", "Japanese calm"),
                food("Fruit Bowl & Yoghurt", "Light and refreshing", "🍓", "fruit bowl yoghurt", "Light and fresh"),
                food("Matcha Latte & Snacks", "Calm energy without the jitters", "🍵", "matcha latte snacks", "Calm energy"),
                food("Avocado Toast", "Clean, fresh, and satisfying", "🥑", "avocado toast", "Clean and nourishing"));
            case "HOPEFUL" -> Arrays.asList(
                food("Healthy Breakfast Bowl", "Start fresh with something nourishing", "🌅", "healthy breakfast bowl", "Fresh start"),
                food("Fresh Juice & Smoothie", "A bright, optimistic start", "🥤", "fresh juice smoothie", "Bright and optimistic"),
                food("Avocado Toast", "The classic feel-good meal", "🥑", "avocado toast", "Classic feel-good"),
                food("Granola & Berries", "Light, fresh, and full of good energy", "🫐", "granola berries", "Good energy"),
                food("Açaí Bowl", "Vibrant, nutritious, and beautiful", "🍇", "acai bowl", "Vibrant and nourishing"),
                food("Green Smoothie", "Packed with nutrients for a hopeful day", "🥬", "green smoothie", "Fuel your hope"));
            case "INSECURE" -> Arrays.asList(
                food("Comfort Food", "Warm food that feels like a hug", "🍜", "comfort food warm", "Warmth and comfort"),
                food("Hot Chocolate", "A warm, sweet moment just for you", "🍫", "hot chocolate", "You deserve sweetness"),
                food("Pasta & Garlic Bread", "Cosy, filling, and satisfying", "🍝", "pasta garlic bread", "Cosy and satisfying"),
                food("Ice Cream", "A little sweetness goes a long way", "🍦", "ice cream", "Treat yourself"),
                food("Masala Chai & Biscuits", "A warm, familiar comfort", "☕", "masala chai biscuits", "Familiar warmth"),
                food("Khichdi", "The ultimate Indian comfort food", "🍲", "khichdi comfort food", "Pure comfort"));
            default -> Arrays.asList(
                food("Top Rated Restaurant Nearby", "Highly reviewed food near you", "🍽️", "top rated restaurant", "Highly recommended"),
                food("Biryani & Indian Cuisine", "Classic comfort food", "🍛", "biryani indian", "Always satisfying"),
                food("Café & Light Bites", "A cosy spot to sit and eat", "☕", "cafe light bites", "Easy and enjoyable"),
                food("Pizza", "Always a good idea", "🍕", "pizza", "Never disappoints"),
                food("Sushi", "Fresh and satisfying", "🍱", "sushi", "Clean and delicious"),
                food("Street Food", "Local flavours and good vibes", "🌮", "street food", "Discover local flavours"));
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GAME POOLS — mood-specific, 4-5 per bucket
    // ═══════════════════════════════════════════════════════════════════════════
    private List<RecommendationItem> buildGamePool(String mood) {
        return switch (mood) {
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                game("Breathing Exercise", "Guided breathing to calm your nervous system", "🫁", "/games/breathing"),
                game("Bubble Pop Calm", "Gently pop bubbles to release tension", "🫧", "/games/bubble-pop"),
                game("Color Word Challenge", "A gentle focus game to distract your mind", "🎨", "/games/color-word"),
                game("Gratitude Jar", "Focus on what's good right now", "🫙", "/games/gratitude-jar"),
                game("Emoji Match", "A calming, low-effort matching game", "😊", "/games/emoji-match"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                game("Tap Release", "Tap to safely release that frustration", "👊", "/games/tap-release"),
                game("Reflex Tap", "Fast-paced tapping to burn off energy", "⚡", "/games/reflex-tap"),
                game("Color Word Challenge", "Redirect your focus with a brain challenge", "🎨", "/games/color-word"),
                game("Breathing Exercise", "Breathe the anger out", "🫁", "/games/breathing"),
                game("Word Scramble", "Channel energy into something constructive", "📝", "/games/word-scramble"));
            case "SAD", "LONELY", "DISAPPOINTED", "INSECURE" -> Arrays.asList(
                game("Emoji Match", "A gentle matching game to lift your mood", "😊", "/games/emoji-match"),
                game("Gratitude Jar", "Drop in things you're grateful for", "🫙", "/games/gratitude-jar"),
                game("Color Word Challenge", "A light brain game to shift your focus", "🎨", "/games/color-word"),
                game("Breathing Exercise", "Breathe and be present", "🫁", "/games/breathing"),
                game("Word Scramble", "Positive words to gently lift your spirit", "📝", "/games/word-scramble"));
            case "BORED", "NEUTRAL" -> Arrays.asList(
                game("Word Scramble", "Unscramble positive words to sharpen your mind", "📝", "/games/word-scramble"),
                game("Reflex Tap", "Test your reaction speed", "⚡", "/games/reflex-tap"),
                game("Color Word Challenge", "The word says YELLOW but it's RED — can you tell?", "🎨", "/games/color-word"),
                game("Emoji Match", "Find all matching pairs", "😊", "/games/emoji-match"),
                game("Tap Release", "Tap as fast as you can", "👊", "/games/tap-release"));
            case "TIRED" -> Arrays.asList(
                game("Emoji Match", "Low-effort, calming matching game", "😊", "/games/emoji-match"),
                game("Breathing Exercise", "Rest your mind with guided breathing", "🫁", "/games/breathing"),
                game("Gratitude Jar", "A gentle, mindful activity", "🫙", "/games/gratitude-jar"),
                game("Color Word Challenge", "Easy brain engagement", "🎨", "/games/color-word"));
            case "HAPPY", "EXCITED", "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                game("Color Word Challenge", "The word says YELLOW but it's RED — beat the trick!", "🎨", "/games/color-word"),
                game("Reflex Tap", "Test how fast you really are", "⚡", "/games/reflex-tap"),
                game("Word Scramble", "Unscramble words at full speed", "📝", "/games/word-scramble"),
                game("Tap Release", "Tap as fast as you can", "👊", "/games/tap-release"),
                game("Emoji Match", "Speed round — find all pairs", "😊", "/games/emoji-match"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                game("Breathing Exercise", "Deepen your calm with guided breathing", "🫁", "/games/breathing"),
                game("Emoji Match", "A slow, peaceful matching game", "😊", "/games/emoji-match"),
                game("Gratitude Jar", "Capture what you're grateful for", "🫙", "/games/gratitude-jar"),
                game("Color Word Challenge", "Gentle brain engagement", "🎨", "/games/color-word"));
            case "HOPEFUL" -> Arrays.asList(
                game("Gratitude Jar", "Capture what you're hopeful about", "🫙", "/games/gratitude-jar"),
                game("Color Word Challenge", "A fun brain challenge to keep momentum", "🎨", "/games/color-word"),
                game("Word Scramble", "Positive words to match your energy", "📝", "/games/word-scramble"),
                game("Reflex Tap", "Channel that hopeful energy", "⚡", "/games/reflex-tap"));
            default -> Arrays.asList(
                game("Color Word Challenge", "The word says YELLOW but it's RED — pick the ink!", "🎨", "/games/color-word"),
                game("Emoji Match", "Find all matching pairs", "😊", "/games/emoji-match"),
                game("Word Scramble", "Unscramble positive words", "📝", "/games/word-scramble"),
                game("Breathing Exercise", "A moment of calm", "🫁", "/games/breathing"),
                game("Reflex Tap", "Test your speed", "⚡", "/games/reflex-tap"));
        };
    }
}
