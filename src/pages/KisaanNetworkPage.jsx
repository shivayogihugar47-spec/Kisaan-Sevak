import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, BarChart2, Edit2, Heart,
  MapPin, MessageCircle, Mic, MicOff, MoreVertical,
  Share2, Sparkles, TrendingUp, Trash2, Users, X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { requestJson } from "../lib/api";

// ─── category config ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "pest",   emoji: "🐛", color: "bg-red-100 text-red-700 ring-red-200",         dark: "bg-red-600",     grad: "from-red-50/70 via-white to-white"     },
  { key: "water",  emoji: "💧", color: "bg-sky-100 text-sky-700 ring-sky-200",         dark: "bg-sky-600",     grad: "from-sky-50/70 via-white to-white"     },
  { key: "price",  emoji: "📈", color: "bg-amber-100 text-amber-700 ring-amber-200",   dark: "bg-amber-600",   grad: "from-amber-50/70 via-white to-white"   },
  { key: "crop",   emoji: "🌱", color: "bg-emerald-100 text-emerald-700 ring-emerald-200", dark: "bg-emerald-600", grad: "from-emerald-50/70 via-white to-white" },
  { key: "farmer", emoji: "👨‍🌾", color: "bg-slate-100 text-slate-700 ring-slate-200",   dark: "bg-slate-600",   grad: "from-slate-50/60 via-white to-white"   },
];

const TRENDING_STYLES = {
  pest:  { bg: "bg-red-600",   light: "bg-red-50 border-red-200 text-red-800",   icon: "🐛" },
  water: { bg: "bg-sky-600",   light: "bg-sky-50 border-sky-200 text-sky-800",   icon: "💧" },
  price: { bg: "bg-amber-500", light: "bg-amber-50 border-amber-200 text-amber-800", icon: "📈" },
};

function catInfo(key) { return CATEGORIES.find(c => c.key === key) || CATEGORIES[4]; }

function timeAgo(ts) {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60)    return "just now";
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function StatPill({ icon: Icon, value, label, color = "text-emerald-600" }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200/60 backdrop-blur-sm">
      <Icon size={13} className={color} />
      <span className={`font-black ${color}`}>{value}</span>
      <span className="text-slate-500">{label}</span>
    </span>
  );
}

// ─── Voice hook ──────────────────────────────────────────────────────────────
function useVoiceInput({ lang, onResult }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recogRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = lang || "kn-IN";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend   = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }, [lang, onResult]);

  const stop = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function KisaanNetworkPage() {
  const { user, profile } = useAuth();
  const { content, language } = useLanguage();
  const t = content?.network || {};

  const district = profile?.district || "";
  const state    = profile?.state    || "";
  const myUsername = user?.username  || "";
  const myName     = profile?.name || user?.name || "Farmer";

  // speech lang based on app language
  const speechLang = language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";

  // ── state ────────────────────────────────────────────────────────────────
  const [posts, setPosts]               = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // composer
  const [draftContent, setDraftContent]   = useState("");
  const [draftCategory, setDraftCategory] = useState("farmer");
  const [isEnhancing, setIsEnhancing]     = useState(false);
  const [aiEnhanced, setAiEnhanced]       = useState(false);

  // feed controls
  const [feedView, setFeedView]           = useState("nearby"); // default = nearby
  const [feedCategory, setFeedCategory]   = useState("all");
  const [nearbyOnly, setNearbyOnly]       = useState(true);

  // follows
  const [followingSet, setFollowingSet]   = useState(new Set());
  const [followLoading, setFollowLoading] = useState({});

  // comments
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentsByPost, setCommentsByPost]     = useState({});
  const [commentDrafts, setCommentDrafts]       = useState({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState(null);

  // likes
  const [isLiking, setIsLiking] = useState({});

  // edit/delete
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent]     = useState("");
  const [showMenuForPost, setShowMenuForPost] = useState(null);

  // author modal
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // stats + trending
  const [stats, setStats]                   = useState(null);
  const [trendingAlerts, setTrendingAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [sseConnected, setSseConnected]     = useState(false);
  const [freshPostIds, setFreshPostIds]     = useState(new Set());

  const sseRef = useRef(null);

  // ── voice ────────────────────────────────────────────────────────────────
  const { listening, supported: voiceSupported, start: startVoice, stop: stopVoice } = useVoiceInput({
    lang: speechLang,
    onResult: (transcript) => {
      setDraftContent(prev => prev ? `${prev} ${transcript}` : transcript);
      setAiEnhanced(false);
    },
  });

  // ── SSE connect ──────────────────────────────────────────────────────────
  const connectSSE = useCallback(() => {
    if (!myUsername) return;
    // Always close existing connection before opening a new one
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
      setSseConnected(false);
    }

    const params = new URLSearchParams({ username: myUsername });
    if (district) params.set("district", district);

    const es = new EventSource(`/api/community-stream?${params}`);
    sseRef.current = es;

    es.addEventListener("connected", () => setSseConnected(true));

    // New post from ANOTHER user — never from ourselves (we add optimistically)
    es.addEventListener("new_post", (e) => {
      try {
        const { post } = JSON.parse(e.data);
        if (!post) return;
        // Skip if it's our own post (already added optimistically in handleCreatePost)
        if (post.author_username === myUsername) return;
        setPosts(prev => {
          if (prev.some(p => p.id === post.id)) return prev;
          return [post, ...prev];
        });
        setFreshPostIds(prev => new Set([...prev, post.id]));
        setTimeout(() => setFreshPostIds(prev => { const n = new Set(prev); n.delete(post.id); return n; }), 4000);
      } catch {}
    });

    // Like count update — always apply (just a number update, idempotent)
    es.addEventListener("like_update", (e) => {
      try {
        const { post_id, like_count } = JSON.parse(e.data);
        setPosts(prev => prev.map(p =>
          // Only update if count actually changed to avoid flicker
          p.id === post_id && p.like_count !== like_count
            ? { ...p, like_count }
            : p
        ));
      } catch {}
    });

    // New comment from ANOTHER user — skip our own (already added optimistically)
    es.addEventListener("new_comment", (e) => {
      try {
        const { post_id, comment_count, comment } = JSON.parse(e.data);
        // Update count badge on card
        setPosts(prev => prev.map(p =>
          p.id === post_id ? { ...p, comment_count } : p
        ));
        // Only append comment if it's from another user
        // (our own comment was already appended in addComment)
        if (comment && comment.author_username !== myUsername) {
          setCommentsByPost(prev => {
            const existing = prev[post_id] || [];
            if (existing.some(c => c.id === comment.id)) return prev;
            return { ...prev, [post_id]: [...existing, comment] };
          });
        }
      } catch {}
    });

    es.onerror = () => {
      setSseConnected(false);
      // Don't reconnect if this connection was intentionally closed
      if (sseRef.current === es) {
        sseRef.current = null;
        setTimeout(() => connectSSE(), 5000);
      }
    };
  }, [myUsername, district]);

  // ── boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!myUsername) return;

    // Guard against React StrictMode double-invoke
    let active = true;

    fetchFeed();
    fetchFollows();
    fetchStats();

    // Small delay so StrictMode cleanup runs first before we open SSE
    const sseTimer = setTimeout(() => {
      if (active) connectSSE();
    }, 50);

    const statsPoll = setInterval(fetchStats, 60_000);

    return () => {
      active = false;
      clearTimeout(sseTimer);
      clearInterval(statsPoll);
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      setSseConnected(false);
    };
  }, [myUsername, nearbyOnly]);

  // ── API ──────────────────────────────────────────────────────────────────
  const fetchFeed = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setErrorMessage("");
    try {
      const params = new URLSearchParams();
      if (myUsername) params.set("user_username", myUsername);
      if (nearbyOnly && district) params.set("district", district);
      const resp = await requestJson(`/api/community-posts?${params}`, { method: "GET" });
      setPosts(Array.isArray(resp?.data) ? resp.data : []);
    } catch (err) {
      if (!silent) setErrorMessage(err?.message || t.errorLoad || "Unable to load posts.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [myUsername, nearbyOnly, district, t.errorLoad]);

  const fetchFollows = useCallback(async () => {
    if (!myUsername) return;
    try {
      const resp = await requestJson(`/api/community-follows?follower_username=${encodeURIComponent(myUsername)}`, { method: "GET" });
      if (Array.isArray(resp?.data)) setFollowingSet(new Set(resp.data));
    } catch {}
  }, [myUsername]);

  const fetchStats = useCallback(async () => {
    try {
      const params = district ? `?district=${encodeURIComponent(district)}` : "";
      const resp = await requestJson(`/api/community-stats${params}`, { method: "GET" });
      if (resp?.data) {
        setStats(resp.data);
        setTrendingAlerts(resp.data.trending_alerts || []);
      }
    } catch {}
  }, [district]);

  // ── nearbyOnly toggle re-fetches ──────────────────────────────────────────
  const toggleNearby = () => {
    setNearbyOnly(prev => !prev);
    setFeedView(nearbyOnly ? "community" : "nearby");
  };

  // ── computed feed ─────────────────────────────────────────────────────────
  const displayedPosts = useMemo(() => {
    let list = [...posts];
    if (feedCategory !== "all") list = list.filter(p => p.category_key === feedCategory);
    if (feedView === "mine")      list = list.filter(p => p.author_username === myUsername);
    else if (feedView === "following") list = list.filter(p => followingSet.has(p.author_username));
    else if (feedView === "trending")  list = [...list].sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    else list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }, [posts, feedView, feedCategory, myUsername, followingSet]);

  // ── AI enhance ────────────────────────────────────────────────────────────
  const handleEnhance = async () => {
    if (!draftContent.trim()) return;
    setIsEnhancing(true);
    try {
      const resp = await requestJson("/api/community-post-enhance", {
        method: "POST",
        body: JSON.stringify({ text: draftContent, district, state }),
      });
      if (resp?.data?.enhanced) {
        setDraftContent(resp.data.enhanced);
        if (resp.data.category_key) setDraftCategory(resp.data.category_key);
        setAiEnhanced(true);
      }
    } catch {}
    setIsEnhancing(false);
  };

  // ── create post ───────────────────────────────────────────────────────────
  const handleCreatePost = async () => {
    if (!draftContent.trim()) return;
    try {
      const resp = await requestJson("/api/community-posts", {
        method: "POST",
        body: JSON.stringify({ author: myName, author_username: myUsername, content: draftContent.trim(), image_url: null, category_key: draftCategory }),
      });
      if (resp?.data) {
        setPosts(prev => [resp.data, ...prev]);
        setDraftContent(""); setDraftCategory("farmer"); setAiEnhanced(false);
        fetchStats();
      }
    } catch (err) { setErrorMessage(err?.message || t.errorCreate || "Unable to create post."); }
  };

  // ── edit ──────────────────────────────────────────────────────────────────
  const startEditPost = (post) => { setEditingPostId(post.id); setEditContent(post.content); setShowMenuForPost(null); };
  const cancelEdit    = ()      => { setEditingPostId(null); setEditContent(""); };
  const saveEdit = async (postId) => {
    if (!editContent.trim()) return;
    try {
      const resp = await requestJson("/api/community-posts", {
        method: "PATCH",
        body: JSON.stringify({ id: postId, content: editContent.trim(), author_username: myUsername }),
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: resp?.data?.content || editContent } : p));
      cancelEdit();
    } catch (err) { setErrorMessage(err?.message || t.errorSave || "Unable to save."); }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const deletePost = async (postId) => {
    if (!window.confirm(t.confirmDelete || "Delete this post?")) return;
    try {
      await requestJson(`/api/community-posts?id=${encodeURIComponent(postId)}&author_username=${encodeURIComponent(myUsername)}`, { method: "DELETE" });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setShowMenuForPost(null);
    } catch (err) { setErrorMessage(err?.message || t.errorDelete || "Unable to delete."); }
  };

  // ── like ──────────────────────────────────────────────────────────────────
  const toggleLike = async (postId) => {
    if (!myUsername) return;
    setIsLiking(prev => ({ ...prev, [postId]: true }));
    try {
      const resp = await requestJson("/api/community-post-likes", {
        method: "POST",
        body: JSON.stringify({ post_id: postId, user_username: myUsername, user_name: myName }),
      });
      const u = resp?.data || {};
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked_by_me: u.liked_by_me, like_count: u.like_count } : p));
    } catch (err) { setErrorMessage(err?.message || t.errorLike || "Unable to like."); }
    finally { setIsLiking(prev => ({ ...prev, [postId]: false })); }
  };

  // ── comments ──────────────────────────────────────────────────────────────
  const fetchComments = async (postId) => {
    setLoadingCommentsPostId(postId);
    try {
      const resp = await requestJson(`/api/community-post-comments?post_id=${encodeURIComponent(postId)}`, { method: "GET" });
      setCommentsByPost(prev => ({ ...prev, [postId]: Array.isArray(resp?.data) ? resp.data : [] }));
    } catch { setCommentsByPost(prev => ({ ...prev, [postId]: [] })); }
    finally { setLoadingCommentsPostId(null); }
  };

  const addComment = async (postId) => {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    try {
      const resp = await requestJson("/api/community-post-comments", {
        method: "POST",
        body: JSON.stringify({ post_id: postId, author: myName, author_username: myUsername, comment: text }),
      });
      setCommentsByPost(prev => ({ ...prev, [postId]: [...(prev[postId] || []), resp.data] }));
      setCommentDrafts(prev => ({ ...prev, [postId]: "" }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p));
    } catch (err) { setErrorMessage(err?.message || t.errorComment || "Unable to comment."); }
  };

  const deleteComment = async (postId, commentId) => {
    if (!window.confirm(t.confirmDeleteComment || "Delete comment?")) return;
    try {
      await requestJson(`/api/community-post-comments?id=${encodeURIComponent(commentId)}&author_username=${encodeURIComponent(myUsername)}`, { method: "DELETE" });
      setCommentsByPost(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c.id !== commentId) }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count || 1) - 1) } : p));
    } catch {}
  };

  // ── follow ────────────────────────────────────────────────────────────────
  const toggleFollow = async (authorUsername) => {
    if (!authorUsername || authorUsername === myUsername) return;
    setFollowLoading(prev => ({ ...prev, [authorUsername]: true }));
    try {
      const resp = await requestJson("/api/community-follows", {
        method: "POST",
        body: JSON.stringify({ follower_username: myUsername, following_username: authorUsername }),
      });
      const isNow = resp?.data?.is_following;
      setFollowingSet(prev => { const n = new Set(prev); isNow ? n.add(authorUsername) : n.delete(authorUsername); return n; });
    } catch (err) { setErrorMessage(err?.message || t.errorFollow || "Unable to follow."); }
    finally { setFollowLoading(prev => ({ ...prev, [authorUsername]: false })); }
  };

  // ── share ─────────────────────────────────────────────────────────────────
  const sharePost = (post) => {
    navigator.clipboard?.writeText(`${post.content}\n\n— Posted on Kisaan Network`).catch(() => {});
    alert(t.copiedToClipboard || "Copied to clipboard!");
  };

  // ── author modal ──────────────────────────────────────────────────────────
  const openAuthorProfile = (post) => {
    if (!post) return;
    const ap = posts.filter(p => p.author_username === post.author_username);
    const tl = ap.reduce((s, p) => s + (p.like_count || 0), 0);
    setSelectedAuthor({ author: post.author, author_username: post.author_username, category: post.category_key || "farmer", postCount: ap.length, totalLikes: tl, trustScore: Math.min(99, 70 + ap.length * 3 + tl) });
  };

  // ── login gate ────────────────────────────────────────────────────────────
  if (!myUsername) {
    return (
      <PageWrapper>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-slate-500">{t.loginRequired || "Please log in to continue"}</p>
        </div>
      </PageWrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <PageWrapper className="bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/30">
      <Header
        title={t.pageTitle || "Kisaan Network"}
        subtitle={t.pageSubtitle || "Real farmer conversations, tips, and trusted community support"}
        location={district}
        showBack
        maxWidth="max-w-5xl"
      />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-4">

        {/* ── Trending alert banners (district-specific) ── */}
        <AnimatePresence>
          {trendingAlerts.filter(a => !dismissedAlerts.has(a.category_key)).map((alert) => {
            const s = TRENDING_STYLES[alert.category_key] || TRENDING_STYLES.pest;
            const label = alert.category_key === "pest"
              ? `⚠️ ${alert.count} farmers near ${district} reported a pest issue in the last 3 hours`
              : alert.category_key === "water"
              ? `💧 ${alert.count} water updates posted near ${district} recently`
              : `📈 ${alert.count} price tips from ${district} farmers in the last 3 hours`;

            return (
              <motion.div
                key={alert.category_key}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-3 overflow-hidden"
              >
                <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${s.light}`}>
                  <span className="text-base mt-0.5">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black leading-snug">{label}</p>
                    {alert.sample && (
                      <p className="mt-1 text-[11px] font-medium opacity-75 line-clamp-1">"{alert.sample}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDismissedAlerts(prev => new Set([...prev, alert.category_key]))}
                    className="shrink-0 rounded-lg p-1 opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Live stats bar ── */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50/50 px-4 py-3"
          >
            <span className="mr-1 text-[11px] font-black uppercase tracking-wider text-emerald-700">
              {t.statsLabel || "Live community"}
            </span>
            <span className="h-3 w-px bg-emerald-200" />
            <StatPill icon={Users}        value={stats.total_farmers}    label="farmers"    color="text-emerald-600" />
            <StatPill icon={BarChart2}    value={stats.posts_today}       label="today"      color="text-slate-500"   />
            {stats.pest_alerts_hour  > 0 && <StatPill icon={AlertTriangle} value={stats.pest_alerts_hour}  label="pest alerts"  color="text-red-600"   />}
            {stats.price_tips_hour   > 0 && <StatPill icon={TrendingUp}    value={stats.price_tips_hour}   label="price tips"   color="text-amber-600" />}
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
              <span className={`h-1.5 w-1.5 rounded-full ${sseConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              {sseConnected ? "live" : "connecting…"}
            </span>
          </motion.div>
        )}

        {/* ── Composer ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl"
        >
          <div className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              {/* My avatar */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-black text-white shadow-md">
                {myName?.charAt(0)?.toUpperCase() || "F"}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{t.shareTitle || "Share your latest farming update"}</p>
                  <p className="text-[11px] text-slate-400">{t.shareSubtitle || "Ask for advice, post harvest stories, or share crop care tips."}</p>
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setDraftCategory(cat.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black ring-1 transition-all duration-150 ${
                        draftCategory === cat.key
                          ? `${cat.color} ring-current shadow-sm scale-105`
                          : "bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat.emoji} {t.categories?.[cat.key] || cat.key}
                    </button>
                  ))}
                </div>

                {/* Textarea + voice indicator */}
                <div className="relative">
                  <textarea
                    rows={3}
                    value={draftContent}
                    onChange={e => { setDraftContent(e.target.value); setAiEnhanced(false); }}
                    placeholder={listening
                      ? (language === "kn" ? "ಮಾತನಾಡಿ..." : language === "hi" ? "बोलिए..." : "Listening...")
                      : (t.sharePlaceholder || "What would you like to share today?")}
                    className={`w-full resize-none rounded-2xl border p-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition-all ${
                      listening
                        ? "border-red-400 bg-red-50/30 ring-4 ring-red-100 placeholder:text-red-400"
                        : "border-slate-200 bg-slate-50 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                    }`}
                  />
                  {/* AI enhanced badge */}
                  {aiEnhanced && !listening && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                      <Sparkles size={10} /> {t.aiEnhancedBadge || "AI Enhanced"}
                    </span>
                  )}
                  {/* Mic pulsing indicator */}
                  {listening && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black text-red-600">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      {language === "kn" ? "ಕೇಳುತ್ತಿದೆ" : language === "hi" ? "सुन रहा है" : "Listening"}
                    </span>
                  )}
                </div>

                {/* Action bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Voice button */}
                  {voiceSupported && (
                    <button
                      onClick={listening ? stopVoice : startVoice}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-black transition-all ${
                        listening
                          ? "bg-red-600 text-white shadow-md shadow-red-200 animate-pulse"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      }`}
                      title={language === "kn" ? "ಧ್ವನಿಯಲ್ಲಿ ಮಾತನಾಡಿ" : language === "hi" ? "आवाज़ से बोलें" : "Speak to post"}
                    >
                      {listening ? <MicOff size={14} /> : <Mic size={14} />}
                      {listening
                        ? (language === "kn" ? "ನಿಲ್ಲಿಸಿ" : language === "hi" ? "रोकें" : "Stop")
                        : (language === "kn" ? "ಮಾತನಾಡಿ" : language === "hi" ? "बोलें" : "Speak")}
                    </button>
                  )}

                  {/* AI enhance */}
                  <button
                    onClick={handleEnhance}
                    disabled={!draftContent.trim() || isEnhancing}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
                  >
                    <Sparkles size={13} />
                    {isEnhancing ? (t.enhancing || "Enhancing...") : (t.enhanceBtn || "Enhance with AI")}
                  </button>

                  {/* Post button */}
                  <button
                    onClick={handleCreatePost}
                    disabled={!draftContent.trim()}
                    className="ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-black text-white shadow-md shadow-emerald-200/60 transition hover:shadow-lg disabled:opacity-40"
                  >
                    {t.postBtn || "Post Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Feed controls ── */}
        <div className="mb-5 space-y-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-slate-900">{t.feedTitle || "Community feed"}</p>
              <p className="text-[11px] text-slate-400">{t.feedSubtitle || "Browse posts from farmers across the network."}</p>
            </div>

            {/* Nearby toggle */}
            {district && (
              <button
                onClick={toggleNearby}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-all ${
                  nearbyOnly
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                }`}
              >
                <MapPin size={13} />
                {nearbyOnly
                  ? (language === "kn" ? `📍 ${district}` : language === "hi" ? `📍 ${district}` : `📍 Near ${district}`)
                  : (language === "kn" ? "ಎಲ್ಲ ರೈತರು" : language === "hi" ? "सभी किसान" : "All farmers")}
              </button>
            )}
          </div>

          {/* Feed view tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "community", label: t.tabAll      || "All" },
              { key: "following", label: t.tabFollowing || "Following" },
              { key: "mine",      label: t.tabMine      || "My posts" },
              { key: "trending",  label: t.tabTrending  || "Trending" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFeedView(tab.key)}
                className={`rounded-full px-4 py-2 text-[11px] font-black transition ${
                  feedView === tab.key
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
            <button
              onClick={() => setFeedCategory("all")}
              className={`rounded-full px-3 py-1.5 text-[11px] font-black transition ${
                feedCategory === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setFeedCategory(cat.key)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black ring-1 transition ${
                  feedCategory === cat.key ? cat.color : "bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat.emoji} {t.categories?.[cat.key] || cat.key}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage("")}><X size={14} /></button>
          </div>
        )}

        {/* ── Feed ── */}
        <div className="space-y-4">
          {isLoading && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
              <p className="text-sm font-semibold text-slate-400">{t.loadingFeed || "Loading feed..."}</p>
            </div>
          )}
          {!isLoading && displayedPosts.length === 0 && (
            <EmptyState icon="🌱" title={t.emptyTitle || "Quiet fields"} description={t.emptyDescription || "No updates yet."} />
          )}

          <AnimatePresence>
            {displayedPosts.map((post) => {
              const isMyPost       = post.author_username === myUsername;
              const cat            = catInfo(post.category_key);
              const isCommentsOpen = activeCommentPostId === post.id;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className={`group relative overflow-hidden rounded-[26px] border bg-gradient-to-br ${cat.grad} shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                    freshPostIds.has(post.id)
                      ? "border-emerald-400 ring-2 ring-emerald-300/60 shadow-emerald-100"
                      : "border-slate-200/70"
                  }`}
                >
                  {/* Left stripe */}
                  <div className={`absolute left-0 top-0 h-full w-1 ${cat.dark}`} />
                  {/* SSE "just arrived" badge */}
                  {freshPostIds.has(post.id) && (
                    <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black text-white shadow-md animate-bounce">
                      ✦ NEW
                    </span>
                  )}

                  <div className="pl-5 pr-5 pt-5 md:pl-6 md:pr-6 md:pt-6">

                    {/* ── Header ── */}
                    <div className="flex items-start gap-3">
                      <button type="button" onClick={() => openAuthorProfile(post)} className="shrink-0">
                        <div className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${cat.dark} text-base font-black text-white shadow-md ring-2 ring-white transition-transform group-hover:scale-105`}>
                          {post.author?.charAt(0)?.toUpperCase() || "F"}
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                        </div>
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <button
                            type="button"
                            onClick={() => openAuthorProfile(post)}
                            className="text-sm font-extrabold text-slate-900 hover:text-emerald-700 transition-colors max-w-[150px] truncate"
                          >
                            {post.author}
                          </button>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${cat.color}`}>
                            {cat.emoji} {t.categories?.[post.category_key] || post.category_key}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-400 truncate">
                          @{post.author_username} · {timeAgo(post.created_at)}
                        </p>
                      </div>

                      <div className="ml-auto flex shrink-0 items-center gap-1.5">
                        {!isMyPost && (
                          <button
                            onClick={() => toggleFollow(post.author_username)}
                            disabled={!!followLoading[post.author_username]}
                            className={`rounded-full px-3 py-1.5 text-[11px] font-black transition-all ${
                              followingSet.has(post.author_username)
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "border border-slate-200 bg-white/80 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                            }`}
                          >
                            {followingSet.has(post.author_username) ? `✓ ${t.following || "Following"}` : `+ ${t.follow || "Follow"}`}
                          </button>
                        )}
                        {isMyPost && (
                          <div className="relative">
                            <button
                              onClick={() => setShowMenuForPost(showMenuForPost === post.id ? null : post.id)}
                              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                              <MoreVertical size={15} />
                            </button>
                            {showMenuForPost === post.id && (
                              <div className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                <button onClick={() => startEditPost(post)} className="flex w-full items-center gap-2 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                                  <Edit2 size={12} className="text-slate-400" /> {t.edit || "Edit"}
                                </button>
                                <div className="mx-4 h-px bg-slate-100" />
                                <button onClick={() => deletePost(post.id)} className="flex w-full items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50">
                                  <Trash2 size={12} /> {t.delete || "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="mt-4">
                      {editingPostId === post.id ? (
                        <div className="space-y-3">
                          <textarea rows={3} value={editContent} onChange={e => setEditContent(e.target.value)}
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                          />
                          <div className="flex gap-2">
                            <button onClick={cancelEdit} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500">{t.cancel || "Cancel"}</button>
                            <button onClick={() => saveEdit(post.id)} className="rounded-full bg-emerald-700 px-5 py-2 text-xs font-black text-white">{t.save || "Save"}</button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line text-[14px] font-medium leading-relaxed text-slate-800">{post.content}</p>
                      )}
                    </div>

                    {/* ── Action bar ── */}
                    <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-1">
                      <button
                        onClick={() => toggleLike(post.id)}
                        disabled={!!isLiking[post.id]}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-black transition-all ${
                          post.liked_by_me ? "bg-red-50 text-red-600" : "text-slate-500 hover:bg-slate-50 hover:text-red-500"
                        }`}
                      >
                        <Heart size={14} fill={post.liked_by_me ? "currentColor" : "none"} strokeWidth={post.liked_by_me ? 0 : 2} />
                        <span>{post.like_count || 0}</span>
                      </button>
                      <div className="h-4 w-px bg-slate-100" />
                      <button
                        onClick={() => {
                          if (!isCommentsOpen) fetchComments(post.id);
                          setActiveCommentPostId(isCommentsOpen ? null : post.id);
                        }}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-black transition-all ${
                          isCommentsOpen ? "bg-sky-50 text-sky-600" : "text-slate-500 hover:bg-slate-50 hover:text-sky-600"
                        }`}
                      >
                        <MessageCircle size={14} />
                        <span>{post.comment_count || 0}</span>
                      </button>
                      <div className="h-4 w-px bg-slate-100" />
                      <button
                        onClick={() => sharePost(post)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-black text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-all"
                      >
                        <Share2 size={14} />
                        <span className="hidden sm:inline">{t.share || "Share"}</span>
                      </button>
                    </div>
                  </div>

                  {/* ── Comments drawer ── */}
                  {isCommentsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-t border-slate-100 bg-white/70 px-5 py-4 md:px-6 backdrop-blur-sm"
                    >
                      {loadingCommentsPostId === post.id && (
                        <p className="py-2 text-xs font-semibold text-slate-400">{t.loadingComments || "Loading..."}</p>
                      )}
                      {(commentsByPost[post.id] || []).length === 0 && loadingCommentsPostId !== post.id && (
                        <p className="py-2 text-xs font-semibold text-slate-400">{t.noComments || "No comments yet."}</p>
                      )}
                      <div className="space-y-2 mb-3">
                        {(commentsByPost[post.id] || []).map(comment => (
                          <div key={comment.id} className="group/c flex items-start gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-black text-slate-600">
                              {comment.author?.charAt(0)?.toUpperCase() || "F"}
                            </div>
                            <div className="flex-1 min-w-0 rounded-2xl bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-slate-100">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="text-[11px] font-extrabold text-slate-800">{comment.author}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(comment.created_at)}</span>
                              </div>
                              <p className="text-xs font-medium leading-relaxed text-slate-600">{comment.comment}</p>
                            </div>
                            {comment.author_username === myUsername && (
                              <button
                                onClick={() => deleteComment(post.id, comment.id)}
                                className="mt-2 shrink-0 rounded-lg p-1 text-slate-300 opacity-0 transition-all group-hover/c:opacity-100 hover:bg-red-50 hover:text-red-400"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-[11px] font-black text-white">
                          {myName?.charAt(0)?.toUpperCase() || "F"}
                        </div>
                        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white pl-3.5 pr-1.5 py-1.5 shadow-sm focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-50 transition-all">
                          <input
                            value={commentDrafts[post.id] || ""}
                            onChange={e => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && addComment(post.id)}
                            placeholder={t.writeComment || "Write a comment..."}
                            className="flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 text-slate-800"
                          />
                          <button
                            onClick={() => addComment(post.id)}
                            disabled={!commentDrafts[post.id]?.trim()}
                            className="rounded-xl bg-emerald-700 px-3.5 py-2 text-[11px] font-black text-white hover:bg-emerald-800 disabled:opacity-40"
                          >
                            {t.postComment || "Post"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Author modal ── */}
      <AnimatePresence>
        {selectedAuthor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-4 pb-6 sm:items-center"
            onClick={e => { if (e.target === e.currentTarget) setSelectedAuthor(null); }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${catInfo(selectedAuthor.category).dark} text-xl font-black text-white shadow-md`}>
                    {selectedAuthor.author?.charAt(0)?.toUpperCase() || "F"}
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{selectedAuthor.author}</p>
                    <p className="text-sm text-slate-500">@{selectedAuthor.author_username}</p>
                    <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black ring-1 ${catInfo(selectedAuthor.category).color}`}>
                      {catInfo(selectedAuthor.category).emoji} {t.categories?.[selectedAuthor.category] || selectedAuthor.category}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedAuthor(null)} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
                  <X size={15} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: t.posts || "Posts",  value: selectedAuthor.postCount  },
                  { label: "Trust",              value: `${selectedAuthor.trustScore}` },
                  { label: "Likes",              value: selectedAuthor.totalLikes },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 max-h-40 space-y-2 overflow-y-auto">
                {posts.filter(p => p.author_username === selectedAuthor.author_username).slice(0, 3).map(p => (
                  <div key={p.id} className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="line-clamp-2 text-xs font-medium text-slate-700">{p.content}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{timeAgo(p.created_at)}</p>
                  </div>
                ))}
              </div>

              {selectedAuthor.author_username !== myUsername && (
                <button
                  onClick={() => { toggleFollow(selectedAuthor.author_username); setSelectedAuthor(null); }}
                  className={`mt-5 w-full rounded-2xl py-3 text-sm font-black transition ${
                    followingSet.has(selectedAuthor.author_username)
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {followingSet.has(selectedAuthor.author_username) ? (t.following || "Following") : (t.follow || "Follow")}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
