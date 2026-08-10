import { AnimatePresence, motion } from "framer-motion";
import {
  Heart, MessageCircle, Share2, X, Camera,
  Edit2, Trash2, MoreVertical,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { requestJson } from "../lib/api";

export default function KisaanNetworkPage() {
  const { user, profile } = useAuth();
  const myUsername = user?.username;
  const myName = profile?.name || user?.name || "Farmer";

  const [posts, setPosts] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState(null);
  const [isLiking, setIsLiking] = useState({});
  const [draftContent, setDraftContent] = useState("");
  const [draftImage, setDraftImage] = useState(null);
  const [draftImagePreview, setDraftImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showMenuForPost, setShowMenuForPost] = useState(null);
  const [feedView, setFeedView] = useState("community");
  const [followingAuthors, setFollowingAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const formatTime = (ts) => new Date(ts).toLocaleString();

  useEffect(() => {
    if (!myUsername) return;
    fetchFeed();
    try {
      const saved = JSON.parse(window.localStorage.getItem("kisaan-network-following") || "[]");
      setFollowingAuthors(Array.isArray(saved) ? saved : []);
    } catch {
      setFollowingAuthors([]);
    }
  }, [myUsername]);

  const saveFollowingAuthors = (authors) => {
    setFollowingAuthors(authors);
    try {
      window.localStorage.setItem("kisaan-network-following", JSON.stringify(authors));
    } catch {
      // ignore storage failures
    }
  };

  const toggleFollowingAuthor = (authorUsername) => {
    if (!authorUsername || authorUsername === myUsername) return;
    const next = followingAuthors.includes(authorUsername)
      ? followingAuthors.filter((username) => username !== authorUsername)
      : [...followingAuthors, authorUsername];
    saveFollowingAuthors(next);
  };

  const isFollowingAuthor = (authorUsername) => followingAuthors.includes(authorUsername);

  const openAuthorProfile = (post) => {
    if (!post) return;
    setSelectedAuthor({
      author: post.author,
      author_username: post.author_username,
      category: post.category_key || "Farmer",
      bio: `Community leader sharing practical advice for ${post.category_key || "sustainable farming"}.`,
      trustScore: 82 + (post.author_username?.length || 0) % 18,
    });
  };

  const closeAuthorProfile = () => setSelectedAuthor(null);

  const fetchFeed = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const query = myUsername ? `?user_username=${encodeURIComponent(myUsername)}` : "";
      const response = await requestJson(`/api/community-posts${query}`, { method: "GET" });
      const postsData = Array.isArray(response?.data) ? response.data : [];
      setPosts(postsData);
    } catch (err) {
      console.error(err);
      setPosts([]);
      setErrorMessage(err?.message || "Unable to load community posts.");
    } finally {
      setIsLoading(false);
    }
  };

  const displayedPosts = useMemo(() => {
    const normalized = Array.isArray(posts) ? posts : [];

    if (feedView === "mine") {
      return normalized.filter((post) => post.author_username === myUsername);
    }

    if (feedView === "following") {
      return normalized.filter((post) => followingAuthors.includes(post.author_username));
    }

    const sorted = [...normalized].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (feedView === "trending") {
      return [...sorted].sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    }

    return sorted;
  }, [posts, feedView, myUsername, followingAuthors, followingAuthors]);

  const handleCreatePost = async () => {
    if (!draftContent.trim() && !draftImage) return;

    let imageUrl = null;
    if (draftImage) {
      imageUrl = await toBase64(draftImage);
    }

    try {
      const response = await requestJson("/api/community-posts", {
        method: "POST",
        body: JSON.stringify({
          author: myName,
          author_username: myUsername,
          content: draftContent.trim(),
          image_url: imageUrl,
          category_key: "farmer",
        }),
      });

      const createdPost = response?.data;
      if (createdPost) {
        setPosts((prev) => [createdPost, ...prev]);
        setDraftContent("");
        setDraftImage(null);
        setDraftImagePreview("");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.message || "Unable to create post.");
    }
  };

  const startEditPost = (post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setShowMenuForPost(null);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const saveEdit = async (postId) => {
    if (!editContent.trim()) return;

    try {
      const response = await requestJson("/api/community-posts", {
        method: "PATCH",
        body: JSON.stringify({
          id: postId,
          content: editContent.trim(),
          author_username: myUsername,
        }),
      });

      const updated = response?.data;
      setPosts((prev) => prev.map((post) => post.id === postId ? { ...post, content: updated?.content || editContent } : post));
      setEditingPostId(null);
      setEditContent("");
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.message || "Unable to save changes.");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await requestJson(`/api/community-posts?id=${encodeURIComponent(postId)}&author_username=${encodeURIComponent(myUsername)}`, {
        method: "DELETE",
      });
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setShowMenuForPost(null);
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.message || "Unable to delete post.");
    }
  };

  const toggleLike = async (postId) => {
    if (!myUsername) return;
    setIsLiking((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await requestJson("/api/community-post-likes", {
        method: "POST",
        body: JSON.stringify({
          post_id: postId,
          user_username: myUsername,
          user_name: myName,
        }),
      });

      const updated = response?.data || {};
      setPosts((prev) => prev.map((post) => post.id === postId ? {
        ...post,
        liked_by_me: updated.liked_by_me,
        like_count: updated.like_count,
      } : post));
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.message || "Unable to update like.");
    } finally {
      setIsLiking((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const fetchComments = async (postId) => {
    setLoadingCommentsPostId(postId);
    setErrorMessage("");

    try {
      const response = await requestJson(`/api/community-post-comments?post_id=${encodeURIComponent(postId)}`, { method: "GET" });
      const data = Array.isArray(response?.data) ? response.data : [];
      setCommentsByPost((prev) => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error(err);
      setCommentsByPost((prev) => ({ ...prev, [postId]: [] }));
      setErrorMessage(err?.message || "Unable to load comments.");
    } finally {
      setLoadingCommentsPostId(null);
    }
  };

  const addComment = async (postId) => {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;

    try {
      const response = await requestJson("/api/community-post-comments", {
        method: "POST",
        body: JSON.stringify({
          post_id: postId,
          author: myName,
          author_username: myUsername,
          comment: text,
        }),
      });

      const newComment = response?.data;
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) => prev.map((post) => post.id === postId ? ({
        ...post,
        comment_count: (post.comment_count || 0) + 1,
      }) : post));
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.message || "Unable to post comment.");
    }
  };

  const sharePost = (post) => {
    const text = `${post.content}\n\n— Posted on Kisaan Network`;
    navigator.clipboard.writeText(text);
    alert("Post copied to clipboard!");
  };

  if (!myUsername) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to continue</div>;
  }

  return (
    <PageWrapper className="bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <Header title="Kisaan Network" subtitle="Real farmer conversations, tips, and trusted community support" location={profile?.district} showBack maxWidth="max-w-5xl" />

      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card className="rounded-3xl border border-emerald-100 bg-white shadow-xl p-6 mb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-600 text-lg font-semibold text-white">
              {myName?.charAt(0) || "F"}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">Share your latest farming update</p>
                <p className="text-sm text-slate-500">Ask for advice, post harvest stories, or share crop care tips.</p>
              </div>
              <textarea
                rows="4"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="What would you like to share today?"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-400"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer rounded-full bg-slate-100 p-3 text-slate-600 transition hover:bg-emerald-100">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setDraftImage(e.target.files[0]);
                          setDraftImagePreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                    />
                  </label>
                  {draftImagePreview && (
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200">
                      <img src={draftImagePreview} alt="preview" className="h-16 w-16 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setDraftImage(null); setDraftImagePreview(""); }}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <Button onClick={handleCreatePost} className="rounded-full bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800">Post Update</Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Community feed</p>
            <p className="text-xs text-slate-500">Browse posts from all farmers across the network.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "community", label: "All farmers" },
              { key: "following", label: "Following" },
              { key: "mine", label: "My posts" },
              { key: "trending", label: "Trending" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFeedView(tab.key)}
                className={`rounded-full px-4 py-2 text-sm transition ${feedView === tab.key ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">{errorMessage}</div>
        )}

        <div className="space-y-6">
          {isLoading && <p className="text-center text-slate-500">Loading feed...</p>}
          {!isLoading && displayedPosts.length === 0 && (
            <EmptyState icon="🌱" title="Quiet fields" description="No updates yet. Share a post to start the conversation." />
          )}

          <AnimatePresence>
            {displayedPosts.map((post) => {
              const isMyPost = post.author_username === myUsername;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <button
                      type="button"
                      onClick={() => openAuthorProfile(post)}
                      className="flex items-center gap-3 text-left transition group"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-600 text-lg font-semibold text-white">
                        {post.author?.charAt(0) || "F"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">{post.author}</p>
                        <p className="text-xs text-slate-500">@{post.author_username} · {post.category_key || "Farmer"}</p>
                        <p className="text-xs text-slate-400">Trusted community contributor</p>
                      </div>
                    </button>
                      <div className="ml-auto flex items-center gap-2">
                        {post.author_username !== myUsername && (
                          <button
                            onClick={() => toggleFollowingAuthor(post.author_username)}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${isFollowingAuthor(post.author_username) ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
                          >
                            {isFollowingAuthor(post.author_username) ? "Following" : "Follow"}
                          </button>
                        )}
                      </div>
                      {isMyPost && (
                        <div className="relative">
                          <button
                            onClick={() => setShowMenuForPost(showMenuForPost === post.id ? null : post.id)}
                            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {showMenuForPost === post.id && (
                            <div className="absolute right-0 z-10 mt-2 w-40 rounded-3xl border border-slate-200 bg-white shadow-lg">
                              <button
                                onClick={() => startEditPost(post)}
                                className="w-full rounded-t-3xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                              >
                                <div className="flex items-center gap-2"><Edit2 size={16} /> Edit</div>
                              </button>
                              <button
                                onClick={() => deletePost(post.id)}
                                className="w-full rounded-b-3xl px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                              >
                                <div className="flex items-center gap-2"><Trash2 size={16} /> Delete</div>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 space-y-4">
                      {editingPostId === post.id ? (
                        <div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows="4"
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-400"
                          />
                          <div className="mt-3 flex flex-wrap gap-3">
                            <button onClick={cancelEdit} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">Cancel</button>
                            <button onClick={() => saveEdit(post.id)} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Save</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-line text-slate-700">{post.content}</p>
                          {post.image_url && (
                            <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200">
                              <img src={post.image_url} alt="Post preview" className="h-full w-full object-cover" />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
                      <button
                        onClick={() => toggleLike(post.id)}
                        disabled={isLiking[post.id]}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${post.liked_by_me ? "bg-red-50 text-red-600" : "hover:bg-slate-100"}`}
                      >
                        <Heart size={18} fill={post.liked_by_me ? "currentColor" : "none"} />
                        Like{post.like_count ? ` (${post.like_count})` : ""}
                      </button>
                      <button
                        onClick={() => {
                          if (activeCommentPostId !== post.id) fetchComments(post.id);
                          setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 hover:bg-slate-100"
                      >
                        <MessageCircle size={18} />
                        Comment{post.comment_count ? ` (${post.comment_count})` : ""}
                      </button>
                      <button onClick={() => sharePost(post)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 hover:bg-slate-100">
                        <Share2 size={18} /> Share
                      </button>
                    </div>

                    {activeCommentPostId === post.id && (
                      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        {loadingCommentsPostId === post.id && <p className="text-sm text-slate-500">Loading comments...</p>}
                        {commentsByPost[post.id]?.length > 0 ? (
                          <div className="space-y-3">
                            {commentsByPost[post.id].map((comment) => (
                              <div key={comment.id} className="rounded-3xl bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                                  <span className="font-semibold text-slate-700">{comment.author}</span>
                                  <span>{formatTime(comment.created_at)}</span>
                                </div>
                                <p className="mt-3 text-sm text-slate-700">{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No comments yet. Start the conversation.</p>
                        )}
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <input
                            value={commentDrafts[post.id] || ""}
                            onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a comment..."
                            className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400"
                          />
                          <button onClick={() => addComment(post.id)} className="rounded-3xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">Post Comment</button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 px-4 py-6 sm:items-center">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 text-2xl font-black text-white">
                  {selectedAuthor.author?.charAt(0) || "F"}
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">{selectedAuthor.author}</p>
                  <p className="text-sm text-slate-500">@{selectedAuthor.author_username}</p>
                  <p className="text-sm text-emerald-700">{selectedAuthor.category}</p>
                </div>
              </div>
              <button onClick={closeAuthorProfile} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Close</button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-semibold text-slate-900">{posts.filter((post) => post.author_username === selectedAuthor.author_username).length}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Posts</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-semibold text-slate-900">{selectedAuthor.trustScore}%</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Trust score</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-semibold text-slate-900">{isFollowingAuthor(selectedAuthor.author_username) ? "Following" : "Follow"}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-700">{selectedAuthor.bio}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => toggleFollowingAuthor(selectedAuthor.author_username)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${isFollowingAuthor(selectedAuthor.author_username) ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              >
                {isFollowingAuthor(selectedAuthor.author_username) ? "Following" : "Follow"}
              </button>
              <span className="text-sm text-slate-500">Tap the author name to open this profile anytime.</span>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-900">Recent posts</p>
              <div className="mt-3 space-y-3">
                {posts.filter((post) => post.author_username === selectedAuthor.author_username).slice(0, 3).map((post) => (
                  <div key={post.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{post.content.slice(0, 90)}{post.content.length > 90 ? "..." : ""}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatTime(post.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
