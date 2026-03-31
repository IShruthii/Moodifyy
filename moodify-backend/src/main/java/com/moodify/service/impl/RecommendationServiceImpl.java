
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

import java.util.Arrays;
import java.util.List;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private final RecommendationHistoryRepository historyRepository;
    private final UserRepository userRepository;

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

        RecommendationResponse response = new RecommendationResponse();
        response.setMood(m);
        response.setMoodEmoji(moodInfo.getEmoji());
        response.setMessage(buildMessage(m, moodInfo));
        response.setMusic(buildMusic(m, lang));
        response.setMovies(buildMovies(m));
        response.setPlaces(buildPlaces(m));
        response.setFood(buildFood(m));
        response.setGames(buildGames(m, moodInfo.getGameStrategy()));
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

    // ── helpers ──────────────────────────────────────────────────────────────

    private String buildMessage(String mood, MoodData.MoodInfo info) {
        return switch (info.getCategory()) {
            case "POSITIVE" ->
                "You're feeling " + mood.toLowerCase() + "! Let's make the most of this beautiful energy. ✨";
            case "NEGATIVE" ->
                "It's okay to feel " + mood.toLowerCase() + ". Here's something gentle to help you through. 💙";
            default -> "Here are some things curated just for your mood today. 🌿";
        };
    }

    private ActionLink sp(String q) {
        return new ActionLink("Spotify", "https://open.spotify.com/search/" + q.replace(" ", "%20"), "spotify");
    }



    private ActionLink ytm(String q) {
        return new ActionLink("YouTube Music", "https://music.youtube.com/search?q=" + q.replace(" ", "+"), "youtube");
    }

    private ActionLink savn(String q) {
        return new ActionLink("JioSaavn", "https://www.jiosaavn.com/search/" + q.replace(" ", "%20"), "jiosaavn");
    }

    private ActionLink gaana(String q) {
        return new ActionLink("Gaana", "https://gaana.com/search/" + q.replace(" ", "%20"), "gaana");
    }

    private ActionLink nf(String q) {
        return new ActionLink("Netflix", "https://www.netflix.com/search?q=" + q.replace(" ", "+"), "netflix");
    }

    private ActionLink prime(String q) {
        return new ActionLink("Prime Video",
                "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=" + q.replace(" ", "+"), "prime");
    }

    private ActionLink imdb(String u) {
        return new ActionLink("IMDb", u, "imdb");
    }

    private ActionLink trailer(String q) {
        return new ActionLink("Trailer",
                "https://www.youtube.com/results?search_query=" + q.replace(" ", "+") + "+trailer", "youtube");
    }

    private ActionLink swiggy(String q) {
        return new ActionLink("Swiggy", "https://www.swiggy.com/search?query=" + q.replace(" ", "+"), "swiggy");
    }

    private ActionLink zomato(String q) {
        return new ActionLink("Zomato", "https://www.zomato.com/search?q=" + q.replace(" ", "+"), "zomato");
    }

    private ActionLink maps(String q) {
        return new ActionLink("Google Maps", "https://www.google.com/maps/search/" + q.replace(" ", "+") + "+near+me",
                "maps");
    }

    private RecommendationItem music(String title, String desc, String emoji, String query) {
        return new RecommendationItem(title, desc, "music", emoji,
                Arrays.asList(sp(query), ytm(query), savn(query), gaana(query)));
    }

    private RecommendationItem movie(String title, String desc, String emoji,
            String nfQ, String primeQ, String imdbUrl, String trailerQ) {
        return new RecommendationItem(title, desc, "movie", emoji,
                Arrays.asList(nf(nfQ), prime(primeQ), imdb(imdbUrl), trailer(trailerQ)));
    }

    private RecommendationItem food(String title, String desc, String emoji, String q) {
        return new RecommendationItem(title, desc, "food", emoji,
                Arrays.asList(swiggy(q), zomato(q), maps(q)));
    }

    private RecommendationItem place(String title, String desc, String emoji, String q) {
        return new RecommendationItem(title, desc, "place", emoji,
                Arrays.asList(maps(q)));
    }

    private RecommendationItem game(String title, String desc, String emoji, String path) {
        return new RecommendationItem(title, desc, "game", emoji,
                Arrays.asList(new ActionLink("Play Now", path, "game")));
    }

    private List<RecommendationItem> buildMusic(String mood, String lang) {
        boolean isTelugu  = "telugu".equals(lang);
        boolean isHindi   = "hindi".equals(lang);
        boolean isBts     = "bts".equals(lang);
        boolean isPrivate = "private".equals(lang);

        String prefix = isTelugu ? "Telugu " : isHindi ? "Hindi " : isBts ? "BTS " : isPrivate ? "private album " : "";

        // Telugu-specific titles per mood
        if (isTelugu) return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                    music("Pelli Sandadi Hits", "Happy Telugu wedding & celebration songs", "🎉", "Telugu happy celebration songs"),
                    music("Dhamaka Party Songs", "High energy Telugu dance hits", "💃", "Telugu party dance songs"),
                    music("Jukebox Hits — SPB & Chitra", "Classic feel-good Telugu melodies", "🎵", "SPB Chitra Telugu hits"));
            case "SAD", "DISAPPOINTED" -> Arrays.asList(
                    music("Manasuna Unna — Sad Melodies", "Heart-touching Telugu sad songs", "💔", "Telugu sad songs melodies"),
                    music("Ilayaraja Telugu Classics", "Timeless emotional Telugu tracks", "🎶", "Ilayaraja Telugu emotional songs"),
                    music("Nee Kosam — Breakup Songs", "Songs for a heavy heart", "🌧️", "Telugu breakup sad songs"));
            case "LONELY" -> Arrays.asList(
                    music("Oka Laila Kosam — Longing Songs", "Songs about missing someone", "🌙", "Telugu longing missing songs"),
                    music("Nuvvu Nuvvu — Soft Melodies", "Gentle Telugu songs for quiet moments", "🎵", "Telugu soft gentle melodies"),
                    music("Manasantha Nuvve Hits", "Soulful Telugu love songs", "💜", "Telugu soulful love songs"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                    music("Mass Beats — Power Songs", "High energy Telugu mass songs", "💥", "Telugu mass power songs"),
                    music("Allu Arjun Dance Hits", "Energetic beats to release tension", "🔥", "Allu Arjun Telugu dance hits"),
                    music("Rowdy Anthem Mix", "Telugu action & attitude songs", "🎸", "Telugu rowdy action songs"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                    music("Stress Relief Telugu", "Calming Telugu melodies for peace", "🌿", "stress relief telugu"),
                    music("Carnatic Calm — Ragas", "Classical Telugu music for inner peace", "🧘", "Telugu carnatic ragas calm"),
                    music("Ninna Ninna — Lullabies & Soft Songs", "Gentle Telugu songs to ease your mind", "🌸", "Telugu soft lullaby calm songs"));
            case "TIRED" -> Arrays.asList(
                    music("Mellaga Mellaga — Slow Melodies", "Slow, soothing Telugu songs", "😴", "Telugu slow soothing melodies"),
                    music("Morning Raga Telugu", "Soft morning Telugu classical music", "🌅", "Telugu morning raga soft"),
                    music("Acoustic Telugu Covers", "Gentle acoustic versions of Telugu hits", "☕", "Telugu acoustic covers soft"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                    music("Jai Ho — Motivation Hits", "Telugu motivational & inspiring songs", "💪", "Telugu motivational inspiring songs"),
                    music("Mahesh Babu Power Anthems", "High energy Telugu hero songs", "⚡", "Mahesh Babu Telugu power songs"),
                    music("Pushpa — Attitude Songs", "Telugu attitude & confidence songs", "😎", "Pushpa Telugu attitude songs"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                    music("Flute & Veena — Telugu Classical", "Peaceful Telugu instrumental music", "🎵", "Telugu flute veena classical peaceful"),
                    music("AR Rahman Telugu Melodies", "Soulful, calm Telugu compositions", "☕", "AR Rahman Telugu calm melodies"),
                    music("Nuvvu Leka Nenu Lenu — Soft Hits", "Gentle Telugu melodies for relaxation", "🌿", "Telugu gentle relaxing melodies"));
            case "HOPEFUL" -> Arrays.asList(
                    music("Naa Peru Surya — Inspiring Songs", "Telugu songs full of hope & energy", "🌟", "Telugu inspiring hopeful songs"),
                    music("New Beginnings — Telugu 2024 Hits", "Fresh Telugu songs for a new chapter", "🌅", "Telugu new songs 2024 hits"),
                    music("Bheemla Nayak — Uplifting Hits", "Powerful Telugu songs to lift your spirit", "✨", "Telugu uplifting powerful songs"));
            case "INSECURE" -> Arrays.asList(
                    music("Nee Jathaga Nenundali", "Telugu songs about self-worth & love", "💜", "Telugu self love songs"),
                    music("Geetha Govindam Melodies", "Sweet, comforting Telugu love songs", "🌸", "Geetha Govindam Telugu songs"),
                    music("Manasantha Nuvve — Comfort Songs", "Warm Telugu songs for the heart", "🌿", "Telugu comfort warm songs"));
            default -> Arrays.asList(
                    music("Top Telugu Hits 2024", "Most popular Telugu songs right now", "🎵", "Telugu top hits 2024"),
                    music("SPB Golden Hits", "Timeless classics by SP Balasubrahmanyam", "🎶", "SPB Telugu golden hits"),
                    music("Sid Sriram Telugu Melodies", "Soulful modern Telugu songs", "😊", "Sid Sriram Telugu songs"));
        };

        // Hindi-specific titles
        if (isHindi) return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                    music("Bollywood Party Hits", "High energy Hindi dance songs", "🎉", "Hindi Bollywood party hits"),
                    music("Badshah & Yo Yo Honey Singh", "Top Hindi rap & party tracks", "💃", "Badshah Honey Singh Hindi hits"),
                    music("Arijit Singh Feel Good", "Upbeat Hindi melodies", "🎵", "Arijit Singh happy Hindi songs"));
            case "SAD", "DISAPPOINTED" -> Arrays.asList(
                    music("Arijit Singh Sad Songs", "Heart-touching Hindi emotional tracks", "💔", "Arijit Singh sad Hindi songs"),
                    music("Tum Hi Ho — Breakup Playlist", "Hindi songs for a heavy heart", "🌧️", "Hindi breakup sad songs"),
                    music("Lata Mangeshkar Classics", "Timeless emotional Hindi melodies", "🎶", "Lata Mangeshkar Hindi classics"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                    music("Stress Relief Hindi", "Calming Hindi melodies for peace", "🌿", "stress relief hindi songs"),
                    music("Rahat Fateh Ali Khan Sufi", "Soulful Sufi music to calm the mind", "🧘", "Rahat Fateh Ali Khan Sufi"),
                    music("Shankar Ehsaan Loy Calm", "Peaceful Hindi compositions", "🌸", "Shankar Ehsaan Loy calm Hindi"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                    music("Kar Har Maidan Fateh", "Hindi motivational anthems", "💪", "Hindi motivational songs Kar Har Maidan"),
                    music("Ranveer Singh Power Songs", "High energy Bollywood hits", "⚡", "Ranveer Singh Bollywood power songs"),
                    music("Dil Bechara — Inspiring Hits", "Uplifting Hindi songs", "😎", "Hindi inspiring uplifting songs"));
            default -> Arrays.asList(
                    music("Top Hindi Hits 2024", "Most popular Hindi songs right now", "🎵", "Hindi top hits 2024"),
                    music("Arijit Singh Best Of", "Soulful Hindi melodies", "🎶", "Arijit Singh best Hindi songs"),
                    music("Bollywood Chill Mix", "Easy Hindi songs for any mood", "😊", "Bollywood chill mix Hindi"));
        };

        // BTS-specific titles
        if (isBts) return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                    music("BTS Dynamite & Butter", "BTS upbeat feel-good hits", "💛", "BTS Dynamite Butter"),
                    music("BTS Permission to Dance", "High energy BTS dance tracks", "💃", "BTS Permission to Dance"),
                    music("BTS Boy With Luv", "Sweet & happy BTS melodies", "🎵", "BTS Boy With Luv"));
            case "SAD", "DISAPPOINTED" -> Arrays.asList(
                    music("BTS Spring Day", "BTS emotional & healing songs", "💔", "BTS Spring Day emotional"),
                    music("BTS Magic Shop", "Comforting BTS tracks for hard days", "🌧️", "BTS Magic Shop comfort"),
                    music("BTS Epiphany & Singularity", "Deep, soulful BTS solos", "🎶", "BTS Epiphany Singularity"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                    music("BTS Not Today & Fire", "BTS power & motivation anthems", "💪", "BTS Not Today Fire motivation"),
                    music("BTS ON & Black Swan", "Intense, powerful BTS tracks", "⚡", "BTS ON Black Swan"),
                    music("BTS Mic Drop", "BTS attitude & confidence songs", "😎", "BTS Mic Drop"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                    music("BTS Butterfly & 4 O'Clock", "Soft, dreamy BTS melodies", "🌙", "BTS Butterfly 4 O Clock calm"),
                    music("BTS Sweet Night & Friends", "Gentle BTS acoustic tracks", "☕", "BTS Sweet Night Friends acoustic"),
                    music("BTS Euphoria", "Beautiful, uplifting BTS melody", "🌸", "BTS Euphoria peaceful"));
            default -> Arrays.asList(
                    music("BTS Greatest Hits", "The best of BTS all time", "💜", "BTS greatest hits"),
                    music("BTS Map of the Soul", "Soulful BTS album tracks", "🎵", "BTS Map of the Soul"),
                    music("BTS Love Yourself", "BTS self-love & empowerment songs", "✨", "BTS Love Yourself"));
        };

        // Default (English or private)
        return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                    music("Happy Vibes Playlist", "Upbeat songs to match your energy", "🎵", prefix + "happy vibes playlist"),
                    music("Feel Good Hits", "Chart-topping feel-good tracks", "🎶", prefix + "feel good hits"),
                    music("Dance Party Mix", "Get up and move to the beat", "💃", prefix + "dance party mix"));
            case "SAD", "DISAPPOINTED" -> Arrays.asList(
                    music("Healing Melodies", "Gentle songs for the soul", "🎵", prefix + "healing sad songs"),
                    music("Comfort Songs", "Songs that feel like a warm hug", "🎶", prefix + "comfort emotional songs"),
                    music("Rainy Day Playlist", "Soft music for quiet moments", "🌧️", prefix + "rainy day acoustic"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                    music("Calm & Relax", "Soothing sounds to ease your mind", "🎵", prefix + "calm relax stress relief"),
                    music("Meditation Music", "Deep focus and inner peace", "🧘", prefix + "meditation peaceful music"),
                    music("Nature Sounds", "Pure calm", "🌿", prefix + "nature sounds relaxing"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                    music("Power Anthems", "Songs that make you unstoppable", "💪", prefix + "power motivation anthems"),
                    music("Workout Motivation", "High-energy tracks to power you up", "⚡", prefix + "workout motivation"),
                    music("Boss Mode", "Music for when you mean business", "😎", prefix + "boss mode focus playlist"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                    music("Ambient Chill", "Soft ambient sounds for deep relaxation", "🎵", prefix + "ambient chill relaxing"),
                    music("Jazz & Coffee", "Smooth jazz for a peaceful afternoon", "☕", prefix + "jazz coffee smooth"),
                    music("Spa & Wellness", "Tranquil sounds for mind and body", "🛁", prefix + "spa wellness music"));
            default -> Arrays.asList(
                    music("Chill Lofi Beats", "Easy background music for any mood", "🎵", prefix + "lofi chill beats"),
                    music("Top Hits 2024", "The most popular tracks right now", "🎶", prefix + "top hits 2024"),
                    music("Feel Good Mix", "A little bit of everything good", "😊", prefix + "feel good mix"));
        };
    }

    // ── MOVIES ────────────────────────────────────────────────────────────────

    private List<RecommendationItem> buildMovies(String mood) {
        return switch (mood) {
            case "HAPPY", "EXCITED" -> Arrays.asList(
                    movie("La La Land", "A beautiful story of dreams and love", "🎬", "la la land", "la la land",
                            "https://www.imdb.com/title/tt3783958/", "la la land"),
                    movie("The Secret Life of Walter Mitty", "An inspiring adventure about living fully", "🎬",
                            "walter mitty", "walter mitty", "https://www.imdb.com/title/tt0359950/", "walter mitty"),
                    movie("Sing Street", "A joyful coming-of-age music film", "🎬", "sing street", "sing street",
                            "https://www.imdb.com/title/tt3544112/", "sing street"));
            case "SAD", "DISAPPOINTED", "LONELY" -> Arrays.asList(
                    movie("Soul", "A heartwarming Pixar film about life's purpose", "🎬", "soul pixar", "soul pixar",
                            "https://www.imdb.com/title/tt2948372/", "soul pixar"),
                    movie("Inside Out", "A beautiful exploration of emotions", "🎬", "inside out", "inside out",
                            "https://www.imdb.com/title/tt2096673/", "inside out"),
                    movie("Good Will Hunting", "A moving story about healing and connection", "🎬", "good will hunting",
                            "good will hunting", "https://www.imdb.com/title/tt0119217/", "good will hunting"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                    movie("Chef", "A relaxing feel-good movie about passion", "🎬", "chef 2014", "chef 2014",
                            "https://www.imdb.com/title/tt2883512/", "chef 2014"),
                    movie("Julie & Julia", "A comforting story about finding joy", "🎬", "julie julia", "julie julia",
                            "https://www.imdb.com/title/tt1135503/", "julie julia"),
                    movie("The Secret Garden", "A peaceful, healing story", "🎬", "secret garden 2020",
                            "secret garden 2020", "https://www.imdb.com/title/tt5774060/", "secret garden 2020"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                    movie("Rocky", "Channel your fire into something powerful", "🎬", "rocky", "rocky",
                            "https://www.imdb.com/title/tt0075148/", "rocky"),
                    movie("Whiplash", "Intense, cathartic, and deeply satisfying", "🎬", "whiplash", "whiplash",
                            "https://www.imdb.com/title/tt2582802/", "whiplash"),
                    movie("Mad Max: Fury Road", "Pure adrenaline release", "🎬", "mad max fury road",
                            "mad max fury road", "https://www.imdb.com/title/tt1392190/", "mad max fury road"));
            case "MOTIVATED", "CONFIDENT", "HOPEFUL" -> Arrays.asList(
                    movie("The Pursuit of Happyness", "An inspiring true story of resilience", "🎬",
                            "pursuit of happyness", "pursuit of happyness", "https://www.imdb.com/title/tt0454921/",
                            "pursuit of happyness"),
                    movie("3 Idiots", "A fun and motivating Bollywood classic", "🎬", "3 idiots", "3 idiots",
                            "https://www.imdb.com/title/tt1187043/", "3 idiots"),
                    movie("The Social Network", "Ambition, drive, and building something great", "🎬", "social network",
                            "social network", "https://www.imdb.com/title/tt1285016/", "social network"));
            case "TIRED" -> Arrays.asList(
                    movie("My Neighbor Totoro", "A gentle, magical film to rest your mind", "🎬", "my neighbor totoro",
                            "my neighbor totoro", "https://www.imdb.com/title/tt0096283/", "my neighbor totoro"),
                    movie("Spirited Away", "A dreamy escape into another world", "🎬", "spirited away", "spirited away",
                            "https://www.imdb.com/title/tt0245429/", "spirited away"),
                    movie("Julie & Julia", "Cozy, warm, and easy to watch", "🎬", "julie julia", "julie julia",
                            "https://www.imdb.com/title/tt1135503/", "julie julia"));
            case "BORED" -> Arrays.asList(
                    movie("Knives Out", "A clever, twisty mystery to keep you hooked", "🎬", "knives out", "knives out",
                            "https://www.imdb.com/title/tt8946378/", "knives out"),
                    movie("The Grand Budapest Hotel", "Quirky, colourful, and endlessly entertaining", "🎬",
                            "grand budapest hotel", "grand budapest hotel", "https://www.imdb.com/title/tt2278388/",
                            "grand budapest hotel"),
                    movie("Interstellar", "Mind-bending sci-fi adventure", "🎬", "interstellar", "interstellar",
                            "https://www.imdb.com/title/tt0816692/", "interstellar"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                    movie("Princess Mononoke", "A beautiful, peaceful epic", "🎬", "princess mononoke",
                            "princess mononoke", "https://www.imdb.com/title/tt0119698/", "princess mononoke"),
                    movie("Amélie", "A whimsical, warm French classic", "🎬", "amelie", "amelie",
                            "https://www.imdb.com/title/tt0211915/", "amelie"),
                    movie("Chef", "Slow, warm, and deeply satisfying", "🎬", "chef 2014", "chef 2014",
                            "https://www.imdb.com/title/tt2883512/", "chef 2014"));
            case "INSECURE" -> Arrays.asList(
                    movie("The Devil Wears Prada", "A story about finding your own strength", "🎬", "devil wears prada",
                            "devil wears prada", "https://www.imdb.com/title/tt0458352/", "devil wears prada"),
                    movie("Legally Blonde", "Proving everyone wrong with confidence", "🎬", "legally blonde",
                            "legally blonde", "https://www.imdb.com/title/tt0250494/", "legally blonde"),
                    movie("Billy Elliot", "Courage to be yourself against all odds", "🎬", "billy elliot",
                            "billy elliot", "https://www.imdb.com/title/tt0249462/", "billy elliot"));
            default -> Arrays.asList(
                    movie("Forrest Gump", "A timeless story about life's journey", "🎬", "forrest gump", "forrest gump",
                            "https://www.imdb.com/title/tt0109830/", "forrest gump"),
                    movie("The Shawshank Redemption", "Hope and resilience at their finest", "🎬",
                            "shawshank redemption", "shawshank redemption", "https://www.imdb.com/title/tt0111161/",
                            "shawshank redemption"),
                    movie("Coco", "A beautiful story about love and memory", "🎬", "coco pixar", "coco pixar",
                            "https://www.imdb.com/title/tt2380307/", "coco pixar"));
        };
    }

    // ── PLACES ────────────────────────────────────────────────────────────────

    private List<RecommendationItem> buildPlaces(String mood) {
        return switch (mood) {
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                    place("Peaceful Park", "Find a quiet green space to breathe and reset", "🌳", "peaceful park"),
                    place("Cozy Café", "A warm café to sit, sip, and unwind", "☕", "cozy cafe"),
                    place("Library", "Quiet, calm, and full of good company", "📚", "library"));
            case "SAD", "LONELY", "DISAPPOINTED" -> Arrays.asList(
                    place("Bookstore or Library", "A calm space with good company in books", "📚", "bookstore"),
                    place("Community Café", "A social café where you can feel less alone", "☕", "cafe"),
                    place("Botanical Garden", "Nature's gentle hug when you need it most", "🌸", "botanical garden"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                    place("Sports Complex / Gym", "Burn off that energy physically", "🏋️", "gym sports complex"),
                    place("Open Ground / Park", "Space to walk, run, and breathe it out", "🌿", "open park ground"),
                    place("Arcade / Gaming Zone", "Release tension through play", "🎮", "arcade gaming zone"));
            case "HAPPY", "EXCITED", "MOTIVATED" -> Arrays.asList(
                    place("Rooftop Restaurant", "Celebrate with a view", "🌆", "rooftop restaurant"),
                    place("Adventure Park", "Get active and have fun outdoors", "🎡", "adventure park"),
                    place("Art Gallery / Museum", "Feed your curious, energetic mind", "🎨", "art gallery museum"));
            case "BORED" -> Arrays.asList(
                    place("Escape Room", "Challenge your mind and beat boredom", "🔐", "escape room"),
                    place("Night Market / Street Food Area", "Explore local food and culture", "🌮",
                            "night market street food"),
                    place("Bowling Alley / Arcade", "Fun activities to shake off the dullness", "🎳",
                            "bowling alley arcade"));
            case "TIRED" -> Arrays.asList(
                    place("Spa or Wellness Centre", "Rest, recover, and recharge", "🛁", "spa wellness centre"),
                    place("Quiet Café", "A peaceful corner to sit and do nothing", "☕", "quiet cafe"),
                    place("Lakeside or Riverside", "Gentle nature to restore your energy", "🌊", "lake river park"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                    place("Sunset Viewpoint", "Watch the sky change colours in peace", "🌅", "sunset viewpoint"),
                    place("Café with Garden Seating", "Outdoor seating, fresh air, good vibes", "🌿",
                            "cafe garden seating"),
                    place("Beach or Lakeside", "Water has a way of calming everything", "🏖️", "beach lake"));
            case "HOPEFUL", "CONFIDENT" -> Arrays.asList(
                    place("Co-working Space / Library", "Channel that energy into something productive", "💻",
                            "coworking space library"),
                    place("Rooftop Café", "Big views for big dreams", "🌆", "rooftop cafe"),
                    place("Bookstore", "Find your next source of inspiration", "📚", "bookstore"));
            case "INSECURE" -> Arrays.asList(
                    place("Quiet Park", "A gentle walk to clear your head", "🌳", "quiet park"),
                    place("Cozy Café", "A warm, safe space just for you", "☕", "cozy cafe"),
                    place("Yoga Studio", "Reconnect with yourself gently", "🧘", "yoga studio"));
            default -> Arrays.asList(
                    place("Top Rated Café Nearby", "A great spot to relax and recharge", "☕", "top rated cafe"),
                    place("Nature Walk Trail", "A refreshing walk in nature", "🌿", "nature walk trail"),
                    place("Local Park", "Fresh air and open space", "🌳", "local park"));
        };
    }

    // ── FOOD ──────────────────────────────────────────────────────────────────

    private List<RecommendationItem> buildFood(String mood) {
        return switch (mood) {
            case "SAD", "LONELY", "DISAPPOINTED" -> Arrays.asList(
                    food("Comfort Food", "Warm, soul-hugging food delivered to you", "🍜", "comfort food"),
                    food("Hot Chocolate & Desserts", "Sweet treats to lift your spirits", "🍫",
                            "hot chocolate desserts"),
                    food("Warm Soup & Bread", "A bowl of warmth for a heavy heart", "🥣", "soup bread"),
                    food("Ice Cream & Waffles", "Sometimes sweet is the answer", "🍦", "ice cream waffles"));
            case "HAPPY", "EXCITED" -> Arrays.asList(
                    food("Celebration Meal", "Treat yourself — you deserve it!", "🎉", "special celebration meal"),
                    food("Pizza Party", "Because happy moods deserve pizza", "🍕", "pizza"),
                    food("Sushi & Asian Cuisine", "Fresh, vibrant food for a vibrant mood", "🍱",
                            "sushi asian cuisine"),
                    food("Bubble Tea & Desserts", "Fun, colourful, and delicious", "🧋", "bubble tea desserts"));
            case "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                    food("Healthy Power Bowl", "Fuel your amazing energy", "🥗", "healthy power bowl salad"),
                    food("Protein-Rich Meal", "Feed your drive with the right nutrition", "💪", "protein meal grilled"),
                    food("Smoothie & Acai Bowl", "Clean energy for a productive day", "🥤", "smoothie acai bowl"),
                    food("Grilled Chicken & Veggies", "Light, nutritious, and energising", "🍗",
                            "grilled chicken vegetables"));
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                    food("Herbal Tea & Light Snacks", "Calming food to ease your nerves", "🍵", "herbal tea snacks"),
                    food("Warm Soup", "Simple, nourishing, calming", "🥣", "warm soup"),
                    food("Dark Chocolate", "Proven to reduce cortisol — treat yourself", "🍫", "dark chocolate"),
                    food("Smoothie & Juice", "Fresh nutrients to reset your system", "🥤", "smoothie juice bar"));
            case "TIRED" -> Arrays.asList(
                    food("Biryani & Rice Bowls", "Hearty comfort food to refuel", "🍛", "biryani rice bowl"),
                    food("Coffee & Snacks", "A gentle pick-me-up", "☕", "coffee snacks"),
                    food("Energy Boosting Meal", "Protein-rich food to restore your energy", "⚡",
                            "protein energy meal"),
                    food("Pasta & Carbs", "Comforting carbs to restore your energy", "🍝", "pasta"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                    food("Spicy Food", "Channel that fire into flavour", "🌶️", "spicy food"),
                    food("Burger & Fries", "Sometimes you just need a good burger", "🍔", "burger fries"),
                    food("Chamomile Tea & Calm Bites", "Let food help you wind down", "🍵", "chamomile tea calm"),
                    food("Tacos & Street Food", "Bold flavours to match your energy", "🌮", "tacos street food"));
            case "BORED" -> Arrays.asList(
                    food("Try a New Cuisine", "A cuisine you've never had before", "🌍", "new cuisine exotic"),
                    food("Street Food", "Exciting local bites to break the monotony", "🌮", "street food"),
                    food("Dessert Café", "Explore a new sweet spot", "🧁", "dessert cafe"),
                    food("DIY Cooking Kit", "Order ingredients and cook something new", "👨‍🍳", "cooking kit meal"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                    food("Light Salad & Wraps", "Fresh, clean food for a peaceful mind", "🥗", "salad wraps light"),
                    food("Herbal Tea & Pastries", "A slow, mindful treat", "🍵", "herbal tea pastries"),
                    food("Sushi & Miso Soup", "Clean, calming Japanese cuisine", "🍱", "sushi miso soup"),
                    food("Fruit Bowl & Yoghurt", "Light and refreshing", "🍓", "fruit bowl yoghurt"));
            case "HOPEFUL" -> Arrays.asList(
                    food("Healthy Breakfast Bowl", "Start fresh with something nourishing", "🌅",
                            "healthy breakfast bowl"),
                    food("Fresh Juice & Smoothie", "A bright, optimistic start", "🥤", "fresh juice smoothie"),
                    food("Avocado Toast", "The classic feel-good meal", "🥑", "avocado toast"),
                    food("Granola & Berries", "Light, fresh, and full of good energy", "🫐", "granola berries"));
            case "INSECURE" -> Arrays.asList(
                    food("Comfort Food", "Warm food that feels like a hug", "🍜", "comfort food warm"),
                    food("Hot Chocolate", "A warm, sweet moment just for you", "🍫", "hot chocolate"),
                    food("Pasta & Garlic Bread", "Cosy, filling, and satisfying", "🍝", "pasta garlic bread"),
                    food("Ice Cream", "A little sweetness goes a long way", "🍦", "ice cream"));
            default -> Arrays.asList(
                    food("Top Rated Restaurant Nearby", "Highly reviewed food near you", "🍽️", "top rated restaurant"),
                    food("Biryani & Indian Cuisine", "Classic comfort food", "🍛", "biryani indian"),
                    food("Café & Light Bites", "A cosy spot to sit and eat", "☕", "cafe light bites"),
                    food("Pizza", "Always a good idea", "🍕", "pizza"));
        };
    }

    // ── GAMES ─────────────────────────────────────────────────────────────────

    private List<RecommendationItem> buildGames(String mood, String strategy) {
        return switch (mood) {
            case "STRESSED", "ANXIOUS", "OVERWHELMED" -> Arrays.asList(
                    game("Breathing Exercise", "Guided breathing to calm your nervous system", "🫁",
                            "/games/breathing"),
                    game("Bubble Pop Calm", "Gently pop bubbles to release tension", "🫧", "/games/bubble-pop"),
                    game("Color Word Challenge", "A gentle focus game to distract your mind", "🎨",
                            "/games/color-word"));
            case "ANGRY", "FRUSTRATED" -> Arrays.asList(
                    game("Tap Release", "Tap to safely release that frustration", "👊", "/games/tap-release"),
                    game("Reflex Tap", "Fast-paced tapping to burn off energy", "⚡", "/games/reflex-tap"),
                    game("Color Word Challenge", "Redirect your focus with a brain challenge", "🎨",
                            "/games/color-word"));
            case "SAD", "LONELY", "DISAPPOINTED", "INSECURE" -> Arrays.asList(
                    game("Emoji Match", "A gentle matching game to lift your mood", "😊", "/games/emoji-match"),
                    game("Gratitude Jar", "Drop in things you're grateful for", "🫙", "/games/gratitude-jar"),
                    game("Color Word Challenge", "A light brain game to shift your focus", "🎨", "/games/color-word"));
            case "BORED", "NEUTRAL" -> Arrays.asList(
                    game("Word Scramble", "Unscramble positive words to sharpen your mind", "📝",
                            "/games/word-scramble"),
                    game("Reflex Tap", "Test your reaction speed", "⚡", "/games/reflex-tap"),
                    game("Color Word Challenge", "The word says YELLOW but it's RED — can you tell?", "🎨",
                            "/games/color-word"));
            case "TIRED" -> Arrays.asList(
                    game("Emoji Match", "Low-effort, calming matching game", "😊", "/games/emoji-match"),
                    game("Breathing Exercise", "Rest your mind with guided breathing", "🫁", "/games/breathing"),
                    game("Gratitude Jar", "A gentle, mindful activity", "🫙", "/games/gratitude-jar"));
            case "HAPPY", "EXCITED", "MOTIVATED", "CONFIDENT" -> Arrays.asList(
                    game("Color Word Challenge", "The word says YELLOW but it's RED — beat the trick!", "🎨",
                            "/games/color-word"),
                    game("Reflex Tap", "Test how fast you really are", "⚡", "/games/reflex-tap"),
                    game("Word Scramble", "Unscramble words at full speed", "📝", "/games/word-scramble"));
            case "RELAXED", "CALM", "PEACEFUL" -> Arrays.asList(
                    game("Mindful Coloring", "Color beautiful patterns mindfully", "🎨", "/games/coloring"),
                    game("Breathing Exercise", "Deepen your calm with guided breathing", "🫁", "/games/breathing"),
                    game("Emoji Match", "A slow, peaceful matching game", "😊", "/games/emoji-match"));
            case "HOPEFUL" -> Arrays.asList(
                    game("Gratitude Jar", "Capture what you're hopeful about", "🫙", "/games/gratitude-jar"),
                    game("Color Word Challenge", "A fun brain challenge to keep momentum", "🎨", "/games/color-word"),
                    game("Word Scramble", "Positive words to match your energy", "📝", "/games/word-scramble"));
            default -> Arrays.asList(
                    game("Color Word Challenge", "The word says YELLOW but it's RED — pick the ink!", "🎨",
                            "/games/color-word"),
                    game("Emoji Match", "Find all matching pairs", "😊", "/games/emoji-match"),
                    game("Word Scramble", "Unscramble positive words", "📝", "/games/word-scramble"));
        };
    }
}
