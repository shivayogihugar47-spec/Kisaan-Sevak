import {
  BellRing,
  Heart,
  MessageCircle,
  Megaphone,
  PlayCircle,
  SendHorizontal,
  Share2,
} from "lucide-react";
import { useState, useEffect } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";

export default function KisaanNetworkPage() {
  const { content } = useLanguage();
  const { profile } = useAuth();
  const [customPosts, setCustomPosts] = useState([]);
  const [postStats, setPostStats] = useState({});
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState(null);
  const [isLiking, setIsLiking] = useState({});
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discussions");
  const [tutorialLanguage, setTutorialLanguage] = useState("All");

  const tutorials = [
    {
      id: "yt-1",
      title: "Drip Irrigation Full Guide (Hindi) - A to Z",
      category: "Irrigation",
      language: "Hindi",
      duration: "60:06",
      videoUrl: "https://www.youtube.com/watch?v=Vof1GmL2DAQ",
    },
    {
      id: "yt-2",
      title: "Soil Testing: How To Test Farm Soil",
      category: "Soil Health",
      language: "Marathi",
      duration: "Tutorial",
      videoUrl: "https://www.youtube.com/watch?v=Er-YlTegD2Y",
    },
    {
      id: "yt-3",
      title: "Integrated Pest Management (IPM) Course",
      category: "Pest Management",
      language: "English",
      duration: "Series",
      videoUrl: "https://www.youtube.com/watch?v=Zf19if__umQ",
    },
    {
      id: "yt-4",
      title: "Natural Farming Basics (Subhash Palekar)",
      category: "Natural Farming",
      language: "Hindi",
      duration: "Tutorial",
      videoUrl: "https://www.youtube.com/watch?v=KwM8jbjm4nM",
    },
    {
      id: "yt-5",
      title: "Jeevamrut Organic Fertilizer Preparation",
      category: "Organic Fertilizer",
      language: "Hindi",
      duration: "06:12",
      videoUrl: "https://www.youtube.com/watch?v=3zKq8riPxjg",
    },
    {
      id: "yt-6",
      title: "Mustard Crop Disease Diagnosis and Management",
      category: "Disease Diagnosis",
      language: "Hindi",
      duration: "Tutorial",
      videoUrl: "https://www.youtube.com/watch?v=jISwLnVYXuE",
    },
    {
      id: "yt-7",
      title: "Polyhouse Dutch Rose Farming Guide",
      category: "Polyhouse",
      language: "Kannada",
      duration: "19:30",
      videoUrl: "https://www.youtube.com/watch?v=fyLMa9D6lOc",
    },
    {
      id: "yt-8",
      title: "Guide to Polyhouse / Greenhouse Farming",
      category: "Polyhouse",
      language: "Kannada",
      duration: "19:55",
      videoUrl: "https://www.youtube.com/watch?v=uilUdFslBZY",
    },
    {
      id: "yt-9",
      title: "e-NAM Process Flow for Better Mandi Selling",
      category: "Market Strategy",
      language: "Hindi",
      duration: "Tutorial",
      videoUrl: "https://www.youtube.com/watch?v=lClh_FmFp_I",
    },
    {
      id: "yt-10",
      title: "Mandi Bhav App Usage for Price Planning",
      category: "Market Strategy",
      language: "Hindi",
      duration: "Tutorial",
      videoUrl: "https://www.youtube.com/watch?v=8SV9oyezo64",
    },
  ];
  const tutorialLanguages = ["All", "Hindi", "Kannada", "Marathi", "English"];

  useEffect(() => {
    fetchPostsAndStats();
  }, []);

  const fetchPostsAndStats = async () => {
    setIsLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      if (postsData && postsData.length > 0) {
        const formattedData = postsData.map((post) => ({
          id: post.id,
          categoryKey: post.category_key || "farmer",
          author: post.author || "Unknown",
          authorPhone: post.author_phone || "",
          message: post.content,
          createdAt: post.created_at,
        }));
        setCustomPosts(formattedData);

        const postIds = formattedData.map((p) => p.id);
        const [{ data: likesData, error: likesError }, { data: commentsData, error: commentsError }] =
          await Promise.all([
            supabase
              .from("community_post_likes")
              .select("post_id,user_phone")
              .in("post_id", postIds),
            supabase
              .from("community_post_comments")
              .select("post_id")
              .in("post_id", postIds),
          ]);

        if (likesError) throw likesError;
        if (commentsError) throw commentsError;

        const likesByPost = {};
        const commentsByPostCount = {};
        const myPhone = String(profile?.phone || "");

        (likesData || []).forEach((row) => {
          if (!likesByPost[row.post_id]) likesByPost[row.post_id] = { likeCount: 0, likedByMe: false };
          likesByPost[row.post_id].likeCount += 1;
          if (myPhone && row.user_phone === myPhone) likesByPost[row.post_id].likedByMe = true;
        });

        (commentsData || []).forEach((row) => {
          commentsByPostCount[row.post_id] = (commentsByPostCount[row.post_id] || 0) + 1;
        });

        const nextStats = {};
        postIds.forEach((postId) => {
          nextStats[postId] = {
            likeCount: likesByPost[postId]?.likeCount || 0,
            commentCount: commentsByPostCount[postId] || 0,
            likedByMe: Boolean(likesByPost[postId]?.likedByMe),
          };
        });
        setPostStats(nextStats);
      } else {
        setCustomPosts([]);
        setPostStats({});
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setCustomPosts([]);
      setPostStats({});
    } finally {
      setIsLoading(false);
    }
  };

  const toEmbedUrl = (videoUrl) => {
    if (!videoUrl) return "";
    try {
      const parsed = new URL(videoUrl);
      if (parsed.hostname.includes("youtu.be")) {
        const id = parsed.pathname.replace("/", "");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      return "";
    } catch {
      return "";
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchCommentsForPost = async (postId) => {
    if (!postId) return;
    setLoadingCommentsPostId(postId);
    try {
      const { data, error } = await supabase
        .from("community_post_comments")
        .select("id,post_id,author,comment,created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      setCommentsByPost((current) => ({ ...current, [postId]: data || [] }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      setCommentsByPost((current) => ({ ...current, [postId]: [] }));
    } finally {
      setLoadingCommentsPostId(null);
    }
  };

  const handleToggleComments = async (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }
    setActiveCommentPostId(postId);
    await fetchCommentsForPost(postId);
  };

  const handleAddComment = async (postId) => {
    const comment = String(commentDrafts[postId] || "").trim();
    if (!comment) return;
    const author = String(profile?.name || content.network?.you || "You");
    const authorPhone = String(profile?.phone || "");

    try {
      const { error } = await supabase.from("community_post_comments").insert([
        {
          post_id: postId,
          author,
          author_phone: authorPhone || null,
          comment,
        },
      ]);
      if (error) throw error;
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      await fetchCommentsForPost(postId);
      setPostStats((current) => ({
        ...current,
        [postId]: {
          ...(current[postId] || {}),
          commentCount: (current[postId]?.commentCount || 0) + 1,
        },
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleToggleLike = async (postId) => {
    const userPhone = String(profile?.phone || "");
    if (!userPhone) return;
    setIsLiking((current) => ({ ...current, [postId]: true }));
    try {
      const isLiked = Boolean(postStats[postId]?.likedByMe);
      if (isLiked) {
        const { error } = await supabase
          .from("community_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_phone", userPhone);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("community_post_likes").insert([
          {
            post_id: postId,
            user_phone: userPhone,
            user_name: String(profile?.name || "User"),
          },
        ]);
        if (error) throw error;
      }

      setPostStats((current) => {
        const prev = current[postId] || { likeCount: 0, commentCount: 0, likedByMe: false };
        const nextLiked = !prev.likedByMe;
        return {
          ...current,
          [postId]: {
            ...prev,
            likedByMe: nextLiked,
            likeCount: Math.max(0, prev.likeCount + (nextLiked ? 1 : -1)),
          },
        };
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking((current) => ({ ...current, [postId]: false }));
    }
  };

  const handleShare = async (post) => {
    const shareText = `${post.message}\n\nfrom Kisaan Network`;
    try {
      if (navigator?.share) {
        await navigator.share({ title: "Kisaan Network", text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const posts = customPosts;
  const visibleTutorials =
    tutorialLanguage === "All"
      ? tutorials
      : tutorials.filter((video) => video.language === tutorialLanguage);

  const handleBroadcast = async () => {
    if (!draft.trim()) return;

    const newPost = {
      category_key: "farmer",
      author: content.network?.you || "You",
      content: draft.trim(),
    };

    try {
      const { data, error } = await supabase.from("community_posts").insert([newPost]).select();
      if (error) throw error;

      if (data && data.length > 0) {
        setCustomPosts((current) => [
          {
            id: data[0].id,
            categoryKey: data[0].category_key || "farmer",
            author: data[0].author || newPost.author,
            authorPhone: data[0].author_phone || "",
            message: data[0].content || newPost.content,
            createdAt: data[0].created_at || new Date().toISOString(),
          },
          ...current,
        ]);
        setPostStats((current) => ({
          ...current,
          [data[0].id]: { likeCount: 0, commentCount: 0, likedByMe: false },
        }));
      } else {
        setCustomPosts((current) => [
          {
            id: crypto.randomUUID(),
            categoryKey: newPost.category_key,
            author: newPost.author,
            authorPhone: "",
            message: newPost.content,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]);
      }
    } catch (error) {
      console.error("Error inserting post:", error);
      setCustomPosts((current) => [
        {
          id: crypto.randomUUID(),
          categoryKey: "farmer",
          author: content.network?.you || "You",
          authorPhone: "",
          message: draft.trim(),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
    }

    setDraft("");
  };

  return (
    <PageWrapper className="bg-leaf-50">
      <Header
        title={content.network?.title || "Kisaan Network"}
        subtitle={content.network?.subtitle || "Share alerts with nearby farmers"}
        location={content.locationLabel}
        showBack
        maxWidth="max-w-4xl"
      />

      <div className="mx-auto max-w-4xl px-5 pb-12">
        <button
          type="button"
          onClick={() => setActiveTab("discussions")}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            activeTab === "discussions"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Discussions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tutorials")}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            activeTab === "tutorials"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Tutorials
        </button>
      </div>

      {activeTab === "discussions" ? (
        <>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-none">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                {content.network?.postLabel || "Create a Post"}
              </span>
              <textarea
                rows="3"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={content.network?.placeholder || "Share your thoughts..."}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:bg-white"
              />
            </label>
            <Button className="mt-3 w-full bg-slate-900 hover:bg-slate-800" onClick={handleBroadcast}>
              <Megaphone size={18} />
              {content.network?.broadcast || "Broadcast to Network"}
            </Button>
          </Card>

          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-slate-700">
              <BellRing size={18} />
              <h2 className="font-display text-lg font-bold">
                {content.network?.alertsTitle || "Recent Posts"}
              </h2>
            </div>

            {isLoading ? (
              <Card>
                <p className="text-sm font-semibold text-leaf-600">Loading posts...</p>
              </Card>
            ) : posts.length ? (
              <div className="space-y-3">
                {posts.map((post) => (
                  <Card key={post.id} className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
                    <article className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-soil-500 to-leaf-600 text-xs font-black text-white">
                            {String(post.author || "U").trim().slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">{post.author}</p>
                            <p className="text-[11px] font-semibold text-slate-500">{formatTime(post.createdAt)}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          {content.network?.categories?.[post.categoryKey] || post.categoryKey}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{post.message}</p>

                      <div className="mt-3 flex items-center gap-3 border-y border-slate-100 py-2 text-slate-700">
                        <button
                          type="button"
                          disabled={Boolean(isLiking[post.id])}
                          onClick={() => handleToggleLike(post.id)}
                          className={`inline-flex items-center gap-1 text-sm font-semibold ${
                            postStats[post.id]?.likedByMe ? "text-red-500" : "text-slate-700"
                          }`}
                        >
                          <Heart
                            size={18}
                            fill={postStats[post.id]?.likedByMe ? "currentColor" : "none"}
                            className="transition"
                          />
                          Like
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleComments(post.id)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700"
                        >
                          <MessageCircle size={18} />
                          Comment
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare(post)}
                          className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-slate-700"
                        >
                          <SendHorizontal size={17} />
                          Share
                        </button>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-600">
                        <span>{postStats[post.id]?.likeCount || 0} likes</span>
                        <button type="button" onClick={() => handleToggleComments(post.id)} className="hover:underline">
                          View {postStats[post.id]?.commentCount || 0} comments
                        </button>
                      </div>

                      {activeCommentPostId === post.id ? (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="space-y-2">
                            {(commentsByPost[post.id] || []).map((item) => (
                              <div key={item.id} className="rounded-lg bg-white px-3 py-2">
                                <p className="text-xs font-semibold text-slate-500">
                                  {item.author} • {formatTime(item.created_at)}
                                </p>
                                <p className="mt-1 text-sm text-slate-800">{item.comment}</p>
                              </div>
                            ))}
                            {loadingCommentsPostId === post.id ? (
                              <p className="text-xs font-semibold text-slate-500">Loading comments...</p>
                            ) : null}
                            {!loadingCommentsPostId && (commentsByPost[post.id] || []).length === 0 ? (
                              <p className="text-xs font-semibold text-slate-500">
                                No comments yet. Start the discussion.
                              </p>
                            ) : null}
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              type="text"
                              value={commentDrafts[post.id] || ""}
                              onChange={(event) =>
                                setCommentDrafts((current) => ({
                                  ...current,
                                  [post.id]: event.target.value,
                                }))
                              }
                              placeholder="Add a comment..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(post.id)}
                              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📣"
                title={content.network?.emptyTitle || "No posts yet"}
                description={
                  content.network?.emptyDescription ||
                  "Be the first one to post in your nearby farmer network."
                }
              />
            )}
          </section>
        </>
      ) : (
        <section className="space-y-3">
          <div className="mb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {tutorialLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setTutorialLanguage(lang)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  tutorialLanguage === lang
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          {visibleTutorials.map((video) => (
            <Card key={video.id}>
              <a href={video.videoUrl} target="_blank" rel="noreferrer" className="block">
                <div className="relative mb-3 h-[160px] w-full overflow-hidden rounded-2xl bg-slate-900">
                  {toEmbedUrl(video.videoUrl) ? (
                    <iframe
                      className="h-full w-full"
                      src={toEmbedUrl(video.videoUrl)}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white">
                      Open tutorial on YouTube
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-soil-700">{video.category}</span>
                <h3 className="mt-1 text-base font-bold text-leaf-800">{video.title}</h3>
                <p className="mt-1 text-xs font-semibold text-leaf-500">
                  {video.duration} • {video.language} • YouTube
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-leaf-100 bg-leaf-50 px-3 py-1.5 text-xs font-semibold text-leaf-700">
                  <PlayCircle size={14} />
                  Watch on YouTube
                </div>
              </a>
            </Card>
          ))}
        </section>
      )}
    </PageWrapper>
  );
}
