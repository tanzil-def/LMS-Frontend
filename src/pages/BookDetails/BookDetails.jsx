// src/pages/BookDetails/BookDetails.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  Star,
  PlayCircle,
  PauseCircle,
  Download,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  RotateCw,
  Gauge,
} from "lucide-react";
import BookCard from "../../components/BookCard/BookCard";
import api from "../../api";

/** Demo reviews DB */
const REVIEWS_DB = {
  "18": {
    heading: "Book Reviews",
    overall: 4.7,
    total: 2713,
    breakdown: { 5: 82, 4: 12, 3: 4, 2: 1, 1: 1 },
    images: [
      "https://images.unsplash.com/photo-1544937950-fa07a98d237f?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop",
    ],
    reviews: [
      { id: "r1", name: "Humayun Kabir", title: "An absolute masterpiece even in 2025", stars: 5, country: "Bangladesh", date: "July 2, 2025", verified: true, body: "Moves you from low-level to high-level architectural thinking. Evergreen patterns and trade-offs. Senior engineers loved it.", helpful: 56 },
      { id: "r2", name: "Lubaba Jahan", title: "Must Read", stars: 5, country: "Bangladesh", date: "May 26, 2025", verified: false, body: "Seminal work. Not a quick read, but worth the effort. Clear patterns and timeless insights.", helpful: 14 },
      { id: "r3", name: "Rashedul Zaman", title: "Great print, good quality cover", stars: 4, country: "Bangladesh", date: "April 22, 2025", verified: true, body: "Well packaged, arrived flat. Solid examples and commentary.", helpful: 9 },
      { id: "r4", name: "Tasmania Rosa .", title: "Practical patterns", stars: 5, country: "Bangladesh", date: "March 02, 2025", verified: true, body: "Explains trade-offs clearly. Helped our team refactor services.", helpful: 11 },
      { id: "r5", name: "Shuvo Rahman", title: "Dense but rewarding", stars: 4, country: "Bangladesh", date: "Feb 18, 2025", verified: false, body: "Take it slow. Examples are timeless.", helpful: 7 },
      { id: "r6", name: "Maruf Islam", title: "Go-to reference", stars: 5, country: "Bangladesh", date: "January 11, 2025", verified: true, body: "Keep it on my desk. Patterns map to modern stacks easily.", helpful: 18 },
      { id: "r7", name: "Sazal Uddin.", title: "Bridges theory and practice", stars: 5, country: "Bangladesh", date: "Nov 3, 2024", verified: true, body: "Rare book that improves code quality quickly.", helpful: 6 },
      { id: "r8", name: "Naimur Hasan", title: "A classic", stars: 5, country: "Bangladesh", date: "Sep 1, 2024", verified: false, body: "Still relevant, even with new frameworks.", helpful: 4 },
    ],
  },
  "28": {
    heading: "Book Reviews",
    overall: 4.9,
    total: 1045,
    breakdown: { 5: 88, 4: 9, 3: 2, 2: 1, 1: 0 },
    images: [],
    reviews: [
      { id: "r9", name: "Nadia Zahan.", title: "Clear cloud strategy playbook", stars: 5, country: "Bangladesh", date: "May 10, 2024", verified: true, body: "Vendor-neutral frameworks. Helped us choose a service model and avoid re-architecture.", helpful: 22 },
      { id: "r10", name: "Vitul Shohan", title: "Strong patterns", stars: 4, country: "Bangladesh", date: "Aug 8, 2024", verified: false, body: "Good balance of business & tech requirements.", helpful: 5 },
      { id: "r11", name: "Purification Meril", title: "Great case studies", stars: 5, country: "Bangladesh", date: "Jan 20, 2025", verified: true, body: "Real migrations and pitfalls. Very useful.", helpful: 9 },
    ],
  },
  "31": {
    heading: "Book Reviews",
    overall: 4.0,
    total: 1,
    breakdown: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
    images: [],
    reviews: [
      { id: "r12", name: "Alisha Rahman", title: "Inspiring for founders", stars: 5, country: "Bangladesh", date: "March 5, 2023", verified: true, body: "Concise, motivating, and practical.", helpful: 3 },
    ],
  },
};

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookData, setBookData] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewStats, setReviewStats] = useState({ average_rating: 0, total_reviews: 0 });

  // Spec & Summary state
  const [pdTab, setPdTab] = useState("summary");
  const [pdExpanded, setPdExpanded] = useState(false);

  // ===== Refs =====
  const specRef = useRef(null);
  const audioRef = useRef(null);
  const relRowRef = useRef(null);

  // Author follow modal/state
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorFollowers, setAuthorFollowers] = useState(0);
  const [rolePicked, setRolePicked] = useState("");

  // Toast
  const [toast, setToast] = useState({ open: false, msg: "" });

  // Reviews UI
  const [expanded, setExpanded] = useState({});
  const [votes, setVotes] = useState({});
  const [bump, setBump] = useState({});
  const [feedbackToast, setFeedbackToast] = useState({ open: false, type: "", msg: "" });

  // ✅ Enhanced Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [curTime, setCurTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  
  // NEW: Audio controls state
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // ---------- utils ----------
  const splitSentences = (txt = "") =>
    (txt || "")
      .replace(/\n+/g, " ")
      .trim()
      .split(/(?<=[.!?\u0964\u0965])\s+/)
      .filter(Boolean);

  const makeIntroTail = (txt = "", introCount = 6, tailCount = 4) => {
    const parts = splitSentences(txt);
    if (!parts.length) return { intro: "", tail: "" };
    const intro = parts.slice(0, introCount).join(" ");
    const tail = parts.slice(Math.max(parts.length - tailCount, 0)).join(" ");
    return { intro, tail };
  };

  // ✅ FIXED: Audio validation function - prevents double "audio/" in path
  const pickAudio = (b) => {
    const audio = b?.audio_file || b?.audioSrc || b?.audioLink || b?.audio_clip || b?.audioURL;
    if (!audio) {
      console.log("No audio file found for book");
      return null;
    }

    if (typeof audio === "string") {
      // If it's already a full URL, return as is
      if (audio.startsWith("http")) {
        console.log("Using full audio URL:", audio);
        return audio;
      }

      // Clean the path to avoid double "audio/" folders
      let cleanPath = audio;
      // Remove leading slash if present
      if (cleanPath.startsWith("/")) {
        cleanPath = cleanPath.slice(1);
      }
      // Remove duplicate "audio/" prefix if exists
      if (cleanPath.startsWith("audio/")) {
        cleanPath = cleanPath.replace(/^audio\//, "");
      }

      const fullUrl = `http://127.0.0.1:8000/media/audio/${cleanPath}`;
      console.log("Constructed audio URL:", fullUrl);
      return fullUrl;
    }

    return null;
  };

  const normalize = (b) =>
  !b
    ? null
    : {
        id: b.id,
        title: b.title,
        authors: b.authors || b.author || "Unknown",
        coverImage: b.coverImage || b.cover || b.image || "https://via.placeholder.com/400x600?text=No+Cover",
        image: b.image || b.coverImage || b.cover || "https://via.placeholder.com/400x600?text=No+Image",
        rating: b.average_rating || b.rating || 0,
        ratingCount: b.ratingCount || 0,
        publisher: b.publisher ?? "—",
        publishDate: b.publishDate ?? "",
        category: b.category ?? "General",
        pdfLink: b.pdf_file || b.pdfLink || "#",
        status: b.status || "UNKNOWN",
        summary: b.longSummary || b.summary || b.description || "",
        summaryIntro: b.summaryIntro || b.summary_intro || null,
        summaryTail: b.summaryTail || b.summary_tail || null,
        authorPhoto:
          b.authorPhoto ||
          b.author_image ||
          b.authorImage ||
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=240&h=240&fit=crop",
        authorFollowers: Number(b.authorFollowers || b.followers || 16),
        authorBio: b.authorBio || b.author_bio || b.authorStory || "",
        audioSrc: pickAudio(b) || null, 
        copies_available: b.copies_available || 0,
        copies_total: b.copies_total || 0,
        format: b.format || "HARD_COPY",
        created_at: b.created_at || "",
        updated_at: b.updated_at || "",
      };

  // Fetch book details from API
useEffect(() => {
  const fetchBookData = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookResponse = await api.get(`/book/retrieve/${id}`);
      const book = bookResponse.data;

      try {
        const statsResponse = await api.get(`/reviews/book/${id}/stats`);
        setReviewStats(statsResponse.data);
      } catch (err) {
        console.log("No review stats available");
        setReviewStats({ average_rating: 0, total_reviews: 0 });
      }

      // ✅ Related books
      const booksResponse = await api.get("/book/list");
      const allBooks = booksResponse.data;

      // Normalize current book
      const normalizedBook = normalize(book);
      console.log("Normalized book data:", normalizedBook);
      console.log("Audio source:", normalizedBook.audioSrc);
      setBookData(normalizedBook);
      setAuthorFollowers(normalizedBook.authorFollowers);

      // Get related books (exclude current book, take first 3)
      const related = allBooks
        .filter((b) => b.id !== parseInt(id))
        .slice(0, 3)
        .map(normalize)
        .filter(Boolean);
      setRelatedBooks(related);

    } catch (err) {
      console.error("Error fetching book data:", err);
      setError("Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    fetchBookData();
  }
}, [id]);

  // init votes when book changes
  useEffect(() => {
    if (!bookData?.id) return;
    const p = REVIEWS_DB[String(bookData.id)];
    if (p?.reviews) {
      const next = {};
      p.reviews.forEach((r) => {
        next[r.id] = { up: r.helpful || 0, down: 0, my: null };
      });
      setVotes(next);
      setExpanded({});
    } else {
      setVotes({});
      setExpanded({});
    }
  }, [bookData?.id]);

  // ====== Audio DOM event listeners ======
  useEffect(() => {
    const el = audioRef.current;
    if (!el) {
      console.log("Audio ref not available yet");
      return;
    }

    console.log("Setting up audio event listeners");

    const onLoaded = () => {
      console.log('✅ Audio loaded, duration:', el.duration);
      setDuration(el.duration || 0);
      setAudioError(false);
      setAudioLoading(false);
    };
    
    const onTime = () => {
      setCurTime(el.currentTime || 0);
    };
    
    const onEnded = () => {
      console.log("✅ Audio playback ended");
      setIsPlaying(false);
      setCurTime(0);
    };
    
    const onError = (e) => {
      console.error('❌ Audio error event:', e);
      console.error('Audio error details:', el.error);
      setAudioError(true);
      setIsPlaying(false);
      setAudioLoading(false);
    };
    
    const onWaiting = () => {
      console.log("⏳ Audio waiting/buffering");
      setAudioLoading(true);
    };
    
    const onCanPlay = () => {
      console.log("✅ Audio can start playing");
      setAudioLoading(false);
    };

    // Add event listeners
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("canplay", onCanPlay);

    // Cleanup
    return () => {
      console.log("Cleaning up audio event listeners");
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("canplay", onCanPlay);
    };
  }, [bookData?.audioSrc]);

  // ✅ FIXED: Reset when audio src changes - properly loads new audio
  useEffect(() => {
    console.log("🔄 Resetting audio state for new source:", bookData?.audioSrc);
    setIsPlaying(false);
    setCurTime(0);
    setDuration(0);
    setAudioError(false);
    setAudioLoading(false);
    setPlaybackRate(1.0);
    
    if (audioRef.current && bookData?.audioSrc) {
      try {
        console.log("🎵 Setting audio source and loading:", bookData.audioSrc);
        // Use direct src attribute and call load()
        audioRef.current.src = bookData.audioSrc;
        audioRef.current.load(); // This is crucial for reloading audio
        
        // Preload the audio
        audioRef.current.preload = "metadata";
      } catch (err) {
        console.error('Error setting audio source:', err);
        setAudioError(true);
      }
    } else if (audioRef.current) {
      // Clear audio if no source
      audioRef.current.src = "";
    }
  }, [bookData?.audioSrc]);

  // ✅ Apply playback rate when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // ✅ FIXED: Audio Player - properly handles audio loading and playback
  const toggleAudio = async () => {
    console.log("🎵 toggleAudio called");
    console.log("Audio ref:", audioRef.current);
    console.log("Audio source:", bookData?.audioSrc);
    console.log("Currently playing:", isPlaying);
    console.log("Audio error state:", audioError);

    const el = audioRef.current;
    if (!el) {
      console.error("❌ Audio element not found");
      setAudioError(true);
      return;
    }

    if (!bookData?.audioSrc) {
      console.error("❌ No audio source available");
      setAudioError(true);
      setToast({ 
        open: true, 
        msg: "Audio file is not available for this book." 
      });
      setTimeout(() => setToast({ open: false, msg: "" }), 3000);
      return;
    }

    try {
      if (isPlaying) {
        // Pause audio
        console.log("⏸️ Pausing audio");
        el.pause();
        setIsPlaying(false);
      } else {
        // Play audio
        console.log("▶️ Attempting to play audio");
        setAudioLoading(true);
        setAudioError(false);
        
        // Ensure audio is properly loaded
        if (el.readyState < 2) { // HAVE_CURRENT_DATA or better
          console.log("🔄 Audio not ready, loading first");
          await el.load();
        }

        // Modern browsers require a user gesture to play audio
        const playPromise = el.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("✅ Audio playback started successfully");
              setIsPlaying(true);
              setAudioError(false);
            })
            .catch((err) => {
              console.error("❌ Audio play() promise rejected:", err);
              setAudioError(true);
              setIsPlaying(false);
              
              let errorMsg = "Audio playback failed. ";
              switch (err.name) {
                case "NotAllowedError":
                  errorMsg += "Browser blocked autoplay. Please interact with the page first.";
                  break;
                case "NotSupportedError":
                  errorMsg += "Audio format not supported.";
                  break;
                default:
                  errorMsg += "Please check your connection and try again.";
              }
              
              setToast({ 
                open: true, 
                msg: errorMsg 
              });
              setTimeout(() => setToast({ open: false, msg: "" }), 4000);
            })
            .finally(() => {
              setAudioLoading(false);
            });
        }
      }
    } catch (err) {
      console.error("❌ Unexpected error in toggleAudio:", err);
      setAudioError(true);
      setIsPlaying(false);
      setAudioLoading(false);
    }
  };

  // ✅ NEW: Speed control function
  const changePlaybackSpeed = (speed) => {
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
    
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // ✅ NEW: Rewind function (10 seconds)
  const rewind = () => {
    if (!audioRef.current || audioError) return;
    const newTime = Math.max(0, curTime - 10);
    audioRef.current.currentTime = newTime;
    setCurTime(newTime);
  };

  // ✅ NEW: Fast forward function (10 seconds)
  const fastForward = () => {
    if (!audioRef.current || audioError) return;
    const newTime = Math.min(duration, curTime + 10);
    audioRef.current.currentTime = newTime;
    setCurTime(newTime);
  };

  const format = (sec = 0) => {
    if (!isFinite(sec) || isNaN(sec)) return "0:00";
    const s = Math.floor(sec % 60);
    const m = Math.floor(sec / 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const progress = duration ? Math.min(1, Math.max(0, curTime / duration)) : 0;

  const onSeekClick = (e) => {
    if (!audioRef.current || !duration || audioError) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
    setCurTime(pct * duration);
  };

  const onSeekKeyDown = (e) => {
    if (!audioRef.current || audioError) return;
    if (e.key === "ArrowRight") {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
    } else if (e.key === "ArrowLeft") {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < (rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
      />
    ));

  const renderStarsLarge = (val) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.round(val || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
      />
    ));

  // ✅ Borrow Button – WORKING
  const handleBorrow = () => {
    if (!bookData || bookData.copies_available === 0) return;
    
    // Store book data for the form
    localStorage.setItem('borrowNow', JSON.stringify(bookData));
    
    // Navigate to fill-up form
    navigate('/fill-up-form', { 
      state: { 
        borrowNow: bookData,
        from: location.pathname 
      } 
    });
  };

  // ✅ Votes / Reviews UI
  const vote = (id, dir) => {
    const cur = votes[id] || { up: 0, down: 0, my: null };
    let { up, down, my } = cur;

    if (dir === "up") {
      if (my === "up") {
        up -= 1;
        my = null;
      } else {
        if (my === "down") down -= 1;
        up += 1;
        my = "up";
      }
    } else {
      if (my === "down") {
        down -= 1;
        my = null;
      } else {
        if (my === "up") up -= 1;
        down += 1;
        my = "down";
      }
    }

    const next = { up: Math.max(0, up), down: Math.max(0, down), my };
    setVotes((prev) => ({ ...prev, [id]: next }));

    setBump((p) => ({ ...p, [id]: { ...(p[id] || {}), [dir]: true } }));
    setTimeout(() => {
      setBump((p) => ({ ...p, [id]: { ...(p[id] || {}), [dir]: false } }));
    }, 220);

    const type = my === "up" ? "up" : my === "down" ? "down" : "clear";
    const msg =
      type === "up"
        ? "Marked as Helpful"
        : type === "down"
        ? "Marked as Not Helpful"
        : "Feedback removed";

    setFeedbackToast({ open: true, type, msg });
    clearTimeout(vote._t);
    vote._t = setTimeout(() => setFeedbackToast({ open: false, type: "", msg: "" }), 1700);
  };

  // ✅ Related Books Scrolling
  const scrollRel = (dir = 1) => {
    const node = relRowRef.current;
    if (!node) return;
    const step = Math.min(360, node.clientWidth * 0.8);
    node.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-20">
        Loading book details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-20">
        {error}
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="text-center text-gray-600 py-20">
        Book not found.
      </div>
    );
  }

  const pack = REVIEWS_DB[String(bookData.id)] || null;
  const localReviewCount = pack?.reviews?.length ?? 0;
  const ratingCountDisplay = pack ? localReviewCount : reviewStats.total_reviews;
  const reviewsTextDisplay = pack
    ? localReviewCount > 0
      ? `${localReviewCount} Reviews`
      : "No Reviews"
    : reviewStats.total_reviews > 0 
      ? `${reviewStats.total_reviews} Reviews` 
      : "No Reviews";

  const baseSummary = bookData.summary || "No summary available.";
  const introTail = makeIntroTail(baseSummary);
  const summaryIntro = bookData.summaryIntro ?? introTail.intro;
  const summaryTail = bookData.summaryTail ?? introTail.tail;

  const countFor = (stars) =>
    Math.round(((pack?.total || 0) * ((pack?.breakdown?.[stars] || 0) / 100)));

  return (
    <div className="bg-white py-8 sm:py-10 px-3 sm:px-6 lg:px-8">
      {/* Page grid */}
      <div className="mx-auto max-w-7xl grid gap-8 sm:gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* LEFT COLUMN (cover) */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <div className="w-full max-w-[340px] border border-gray-300 rounded-md p-3 sm:p-4 bg-white">
            <img
              src={bookData.coverImage}
              alt={bookData.title}
              loading="lazy"
              className="w-full h-auto max-h-[460px] object-contain"
            />
          </div>
        </div>

        {/* RIGHT COLUMN (book info) */}
        <div className="lg:col-span-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            {bookData.title}
          </h1>
          <p className="text-gray-600 mt-1 text-base">
            by <span className="text-sky-600 font-medium">{bookData.authors}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {bookData.publisher}, {bookData.publishDate} —{" "}
            <Link
              to="/all-genres"
              state={{ filter: { type: "category", value: bookData.category } }}
              className="text-sky-600 hover:underline"
            >
              {bookData.category}
            </Link>
          </p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {renderStars(reviewStats.average_rating || bookData.rating)}
            <span className="text-sm text-gray-600 font-semibold shrink-0">
              {ratingCountDisplay} Ratings
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="text-sm text-gray-500">{reviewsTextDisplay}</span>
          </div>

          {/* Short summary teaser */}
          <div className="mt-6">
            <h3 className="font-bold text-gray-800">Summary of the Book</h3>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-line">
               {summaryIntro}...
                <button
               onClick={() => {
              setPdTab("summary");
               setPdExpanded(true);
               specRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
             }}
             className="ml-2 font-semibold hover:underline text-sky-600"
            >
           Read More
          </button>
         </p>

          </div>

          {/* Availability + Enhanced Audio + PDF */}
          <div className="mt-6">
            <span className={`font-medium text-sm inline-flex items-center ${
              bookData.copies_available > 0 ? "text-green-600" : "text-red-600"
            }`}>
              <span className={`h-3 w-3 rounded-full mr-2 ${
                bookData.copies_available > 0 ? "bg-green-500 animate-ping" : "bg-red-500"
              }`}></span>
              {bookData.copies_available > 0 ? "Available" : "Out of Stock"}
            </span>

            {/* ✅ ENHANCED: Audio row with speed, rewind, fast forward */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleAudio}
                disabled={!bookData.audioSrc || audioError || audioLoading}
                className={`flex items-center gap-2 text-sm min-w-[120px] ${
                  bookData.audioSrc && !audioError && !audioLoading
                    ? "text-gray-700 hover:text-sky-600 disabled:text-gray-400"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {audioLoading ? (
                  <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <PauseCircle className="w-5 h-5" />
                ) : (
                  <PlayCircle className="w-5 h-5" />
                )}
                <span>
                  {audioLoading ? "Loading..." : isPlaying ? "Playing" : "Audio Clip"}
                </span>
              </button>

              {/* Progress bar */}
              {bookData.audioSrc && !audioError && duration > 0 && (
                <>
                  <div
                    className="w-40 sm:w-56 h-1 bg-gray-200 rounded-full mx-2 sm:mx-3 relative cursor-pointer select-none"
                    onClick={onSeekClick}
                    onKeyDown={onSeekKeyDown}
                    role="slider"
                    tabIndex={0}
                    aria-valuemin={0}
                    aria-valuemax={Math.max(1, Math.floor(duration))}
                    aria-valuenow={Math.floor(curTime)}
                    aria-label="Seek audio"
                  >
                    <div
                      className="absolute left-0 top-0 h-full bg-sky-500 rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>

                  {/* Timing */}
                  <div className="text-xs text-gray-600 min-w-[84px]">
                    {format(curTime)} / {format(duration)}
                  </div>
                </>
              )}

              {/* ✅ NEW: Audio Controls - Speed, Rewind, Fast Forward */}
              {bookData.audioSrc && !audioError && duration > 0 && (
                <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-2">
                  {/* Speed Control */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-sky-600 px-2 py-1 rounded hover:bg-gray-100"
                      aria-label="Playback speed"
                    >
                      <Gauge className="w-4 h-4" />
                      <span>{playbackRate}x</span>
                    </button>
                    
                    {showSpeedMenu && (
                      <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[80px]">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => changePlaybackSpeed(speed)}
                            className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                              playbackRate === speed ? 'bg-sky-50 text-sky-600 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rewind */}
                  <button
                    type="button"
                    onClick={rewind}
                    disabled={!bookData.audioSrc || audioError}
                    className="text-gray-600 hover:text-sky-600 p-1 rounded hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    aria-label="Rewind 10 seconds"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Fast Forward */}
                  <button
                    type="button"
                    onClick={fastForward}
                    disabled={!bookData.audioSrc || audioError}
                    className="text-gray-600 hover:text-sky-600 p-1 rounded hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    aria-label="Fast forward 10 seconds"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ✅ FIXED: Audio element - uses direct src and proper loading */}
              <audio
                ref={audioRef}
                preload="metadata"
                crossOrigin="anonymous"
                src={bookData?.audioSrc || ""}
                onError={() => {
                  console.error('Audio element onError triggered');
                  setAudioError(true);
                }}
              />

              {/* ✅ FIXED: PDF Download - handles both full URLs and relative paths */}
              <a
                href={
                  bookData.pdfLink?.startsWith("http")
                    ? bookData.pdfLink
                    : bookData.pdfLink?.startsWith("/")
                    ? `http://127.0.0.1:8000${bookData.pdfLink}`
                    : `http://127.0.0.1:8000/media/${bookData.pdfLink}`
                }
                download
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-sm text-gray-700 font-semibold border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                <Download className="w-4 h-4" />
                PDF
              </a>
            </div>

            {audioError && (
              <div className="mt-2 text-xs text-red-500">
                Audio clip could not be loaded. Please check the audio file.
              </div>
            )}

            {!bookData.audioSrc && (
              <div className="mt-2 text-xs text-gray-500">
                No audio clip provided for this book.
              </div>
            )}
          </div>

          {/* ✅ Borrow Button */}
          <div className="mt-6">
            <button
              onClick={handleBorrow}
              disabled={bookData.copies_available === 0}
              className={`font-semibold px-6 py-3 rounded-md w-full sm:w-auto block text-center ${
                bookData.copies_available > 0
                  ? "bg-sky-500 hover:bg-sky-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {bookData.copies_available > 0 ? "Borrow Book" : "Out of Stock"}
            </button>
          </div>
        </div>
        
        {/* ============== SPECIFICATION & SUMMARY ============== */}
        <div ref={specRef} className="lg:col-span-2">
          <div className="mt-10 rounded-lg border border-gray-300 overflow-hidden bg-white">
            <div className="px-4 sm:px-5 py-3">
              <h3 className="text-lg font-bold text-gray-800">Specification &amp; Summary</h3>
            </div>

            <div className="border-t border-gray-300">
              <div className="px-4 sm:px-5 pt-3">
                {/* Summary & Spec Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  {["summary", "spec", "author"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setPdTab(t)}
                      className={`px-3 py-1.5 text-sm rounded-md border ${
                        pdTab === t
                          ? "bg-green-100 border-green-300 text-green-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {t === "summary" ? "Summary" : t === "spec" ? "Specification" : "Author"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {pdTab === "summary" && (
                  <>
                    {!pdExpanded ? (
                      <>
                        <div className="text-gray-800 text-[15px] leading-7 space-y-4">
                          <div className="relative">
                            <p className="line-clamp-3">{summaryIntro}</p>
                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
                          </div>

                          <div className="border-t border-gray-200" />

                          <p className="italic text-gray-700">{summaryTail}</p>
                        </div>

                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => setPdExpanded(true)}
                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Show More
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-gray-800 text-[15px] leading-7 whitespace-pre-line">
                          {baseSummary}
                        </div>
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => setPdExpanded(false)}
                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Show Less
                          </button>
                        </div>
                      </>
                    )}

                    <div className="mt-4 border-t border-b border-gray-300 py-3">
                      <div className="text-center">
                        <button className="inline-flex items-center gap-2 text-red-500 hover:text-sky-600 text-sm">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-current">
                            <span className="text-[10px] font-bold">i</span>
                          </span>
                          Report incorrect information
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {pdTab === "spec" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Title</span>
                      <div className="font-medium text-gray-800">{bookData.title}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Author</span>
                      <div className="font-medium text-gray-800">{bookData.authors}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Category</span>
                      <div className="font-medium text-gray-800">{bookData.category}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Format</span>
                      <div className="font-medium text-gray-800">{bookData.format}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Available Copies</span>
                      <div className="font-medium text-gray-800">{bookData.copies_available} / {bookData.copies_total}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Rating</span>
                      <div className="font-medium text-gray-800">
                        {(reviewStats.average_rating || bookData.rating || 0).toFixed(1)}
                      </div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Status</span>
                      <div className="font-medium text-gray-800">
                        {bookData.copies_available > 0 ? "Available" : "Out of Stock"}
                      </div>
                    </div>
                  </div>
                )}

                {pdTab === "author" && (
                  <div className="flex items-start gap-5">
                    <div className="w-32 sm:w-36 shrink-0 text-center mx-auto sm:mx-0">
                      <img
                        src={bookData.authorPhoto}
                        alt={bookData.authors}
                        loading="lazy"
                        className="w-24 h-24 rounded-full object-cover border mx-auto"
                      />
                      <div className="mt-2 text-xs text-gray-600">{authorFollowers} followers</div>
                      <button
                        onClick={() => setShowFollowModal(true)}
                        className={`mt-2 w-24 text-sm font-semibold rounded-full px-3 py-1.5 transition ${
                          isFollowing ? "bg-gray-200 text-gray-700 cursor-default" : "bg-sky-500 text-white hover:bg-sky-600"
                        }`}
                        disabled={isFollowing}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{bookData.authors}</h4>
                      <p className="mt-2 text-[15px] leading-7 text-gray-800 whitespace-pre-line">
                        {bookData.authorBio || "No additional author story provided."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== REVIEWS & RATINGS ===== */}
        <div className="lg:col-span-2 mt-10">
          <h3 className="text-2xl font-semibold text-gray-900">Reviews and Ratings</h3>
        </div>

        {/* LEFT SIDE: rate + reviews list */}
        <div className="lg:col-span-1">
          <div className="">
            <div className="text-sm text-gray-700 font-semibold">Rate this product</div>
            <div className="mt-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-gray-300" />
              ))}
            </div>
            <button className="mt-3 inline-flex items-center border border-gray-300 text-sky-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-sky-50">
              Write Review
            </button>
          </div>

          {!pack || pack.total === 0 ? (
            <div className="text-sm text-gray-500 mt-6">No reviews yet for this book.</div>
          ) : (
            <div className="space-y-6 mt-10 sm:mt-20">
              {pack.reviews.map((r) => {
                const isLong = (r.body || "").length > 220;
                const open = !!expanded[r.id];
                const body = !isLong || open ? r.body : r.body.slice(0, 220) + "…";
                const firstLetter = r.name?.trim()?.[0]?.toUpperCase() || "?";
                const v = votes[r.id] || { up: r.helpful || 0, down: 0, my: null };
                return (
                  <article key={r.id} className="border-b border-gray-300 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {firstLetter}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">{r.name}</span>
                          <span className="text-gray-500 ml-1.5">{r.country}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-0.5 text-gray-500">
                          {renderStars(r.stars)}
                          <span className="ml-1 font-medium">{r.stars.toFixed(1)}</span>
                          <span className="text-gray-300 mx-1">|</span>
                          <time dateTime={r.date}>{r.date}</time>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-800 mt-2">{r.title}</h4>
                    {r.verified && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-green-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Purchase
                      </div>
                    )}
                    <p className="text-[15px] leading-7 text-gray-800 mt-2 whitespace-pre-line">
                      {body}
                      {isLong && (
                        <button
                          onClick={() => setExpanded((p) => ({ ...p, [r.id]: !p[r.id] }))}
                          className="text-sky-600 hover:underline font-semibold ml-1 text-sm"
                        >
                          {open ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <span className="text-xs">
                        Was this helpful? <span className="text-gray-800 font-semibold">{v.up}</span>
                      </span>
                      <button
                        onClick={() => vote(r.id, "up")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${v.my === "up" ? "text-sky-600 bg-sky-100" : "hover:bg-gray-100"}`}
                      >
                        <ThumbsUp className={`w-4 h-4 transition-transform ${bump[r.id]?.up ? 'scale-125' : ''}`} />
                      </button>
                      <button
                        onClick={() => vote(r.id, "down")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${v.my === "down" ? "text-red-600 bg-red-100" : "hover:bg-gray-100"}`}
                      >
                        <ThumbsDown className={`w-4 h-4 transition-transform ${bump[r.id]?.down ? 'scale-125' : ''}`} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: rating breakdown + images */}
        <div className="lg:col-span-1">
          {pack?.total > 0 && (
            <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
              <h4 className="text-xl font-semibold text-gray-900">{pack.heading}</h4>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-5xl font-bold text-gray-900 leading-none">
                  {pack.overall.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-gray-600">
                  out of 5
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                {renderStarsLarge(pack.overall)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Based on <span className="font-medium">{pack.total}</span> ratings
              </p>

              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-4">{n}</span>
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 shrink-0" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${pack.breakdown[n] || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">
                      {countFor(n)}
                    </span>
                  </div>
                ))}
              </div>

              {pack.images.length > 0 && (
                <div className="mt-8">
                  <h5 className="text-sm font-semibold text-gray-700">Images from reviews</h5>
                  <div className="flex overflow-x-auto gap-3 mt-3 pb-2 scrollbar-hide">
                    {pack.images.map((src, i) => (
                      <div key={i} className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={src}
                          alt={`Review image ${i + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== RELATED BOOKS ===== */}
      <div className="mt-16 mx-auto max-w-7xl">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          Related Books
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Explore more titles in our collection.
        </p>

        <div className="relative mt-6">
          <div
            ref={relRowRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          >
            {relatedBooks.map((b) => (
              <div key={b.id} className="flex-shrink-0 w-[200px] sm:w-[240px] snap-start">
                <BookCard book={b} fromSlider={true} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollRel(-1)}
            aria-label="Scroll left"
            className="hidden sm:inline-flex absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-300 items-center justify-center shadow-md hover:bg-gray-50 z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => scrollRel(1)}
            aria-label="Scroll right"
            className="hidden sm:inline-flex absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-300 items-center justify-center shadow-md hover:bg-gray-50 z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Author Follow Modal */}
      {showFollowModal && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/75 flex items-center justify-center px-4"
          onClick={() => setShowFollowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold text-gray-900">
                Follow {bookData.authors}
              </h4>
              <button
                onClick={() => setShowFollowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Choose your role to get relevant updates.
            </p>
            <div className="mt-4 space-y-3">
              {["Reader", "Writer", "Both"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRolePicked(role)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all border ${
                    rolePicked === role
                      ? "bg-sky-100 border-sky-400 text-sky-800 font-semibold"
                      : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setIsFollowing(true);
                setAuthorFollowers((prev) => prev + 1);
                setShowFollowModal(false);
              }}
              disabled={!rolePicked}
              className={`mt-6 w-full font-semibold px-4 py-3 rounded-md transition-colors ${
                rolePicked
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm Follow
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300">
          {toast.msg}
        </div>
      )}
      {feedbackToast.open && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 text-sm px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300 ${
            feedbackToast.type === "up" ? "bg-sky-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {feedbackToast.msg}
        </div>
      )}
    </div>
  );
}