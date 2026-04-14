import { AnimatePresence, motion } from "framer-motion";
import {
  Heart, MessageCircle, Share2, X, Plus, Camera,
  Edit2, Trash2, MoreVertical,
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
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const myUsername = user?.username;
  const myName = profile?.name || user?.name || "Farmer";

  // State
  const [posts, setPosts] = useState([]);
  const [postStats, setPostStats] = useState({});
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

  // Helper: base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  // Format timestamp
  const formatTime = (ts) => new Date(ts).toLocaleString();

  // Load feed
  useEffect(() => {
    if (!myUsername) return;
    fetchFeed();
  }, [myUsername]);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setPosts(data || []);
      const postIds = (data || []).map(p => p.id);
      if (postIds.length) {
        const [{ data: likes }, { data: comments }] = await Promise.all([
          supabase.from("community_post_likes").select("*").in("post_id", postIds),
          supabase.from("community_post_comments").select("post_id").in("post_id", postIds),
        ]);
        const stats = {};
        postIds.forEach(pid => {
          stats[pid] = {
            likeCount: likes?.filter(l => l.post_id === pid).length || 0,
            likedByMe: likes?.some(l => l.post_id === pid && l.user_username === myUsername),
            commentCount: comments?.filter(c => c.post_id === pid).length || 0,
          };
        });
        setPostStats(stats);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // Create post
  const handleCreatePost = async () => {
    if (!draftContent.trim() && !draftImage) return;
    let imageUrl = null;
    if (draftImage) imageUrl = await toBase64(draftImage);
    const { data, error } = await supabase
      .from("community_posts")
      .insert([{
        author: myName,
        author_username: myUsername,
        content: draftContent,
        image_url: imageUrl,
        category_key: "farmer",
      }])
      .select();
    if (!error && data) {
      setPosts([data[0], ...posts]);
      setPostStats(prev => ({ ...prev, [data[0].id]: { likeCount: 0, likedByMe: false, commentCount: 0 } }));
    }
    setDraftContent("");
    setDraftImage(null);
    setDraftImagePreview("");
  };

  // Edit post
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
    const { error } = await supabase
      .from("community_posts")
      .update({ content: editContent })
      .eq("id", postId);
    if (!error) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent } : p));
      setEditingPostId(null);
      setEditContent("");
    }
  };

  // Delete post
  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      setShowMenuForPost(null);
    }
  };

  // Like / Unlike
  const toggleLike = async (postId) => {
    if (!myUsername) return;
    const liked = postStats[postId]?.likedByMe;
    setIsLiking(prev => ({ ...prev, [postId]: true }));
    if (liked) {
      await supabase
        .from("community_post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_username", myUsername);
    } else {
      await supabase
        .from("community_post_likes")
        .insert({ post_id: postId, user_username: myUsername, user_name: myName });
    }
    setPostStats(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        likedByMe: !liked,
        likeCount: prev[postId].likeCount + (liked ? -1 : 1)
      }
    }));
    setIsLiking(prev => ({ ...prev, [postId]: false }));
  };

  // Comments
  const fetchComments = async (postId) => {
    setLoadingCommentsPostId(postId);
    const { data } = await supabase
      .from("community_post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setCommentsByPost(prev => ({ ...prev, [postId]: data || [] }));
    setLoadingCommentsPostId(null);
  };

  const addComment = async (postId) => {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    await supabase
      .from("community_post_comments")
      .insert({
        post_id: postId,
        author: myName,
        author_username: myUsername,
        comment: text,
      });
    setCommentDrafts(prev => ({ ...prev, [postId]: "" }));
    await fetchComments(postId);
    setPostStats(prev => ({
      ...prev,
      [postId]: { ...prev[postId], commentCount: prev[postId].commentCount + 1 }
    }));
  };

  // Share post (copy link)
  const sharePost = (post) => {
    const text = `${post.content}\n\n— Posted on Kisaan Network`;
    navigator.clipboard.writeText(text);
    alert("Post copied to clipboard!");
  };

  if (!myUsername) {
    return <div className="flex items-center justify-center h-screen">Please log in to continue</div>;
  }

  return (
    <PageWrapper className="bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <Header title="Kisaan Network" subtitle="Share farming tips & ask questions" location={profile?.district} showBack maxWidth="max-w-4xl" />

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Create post card */}
        <Card className="rounded-2xl border border-emerald-100 bg-white shadow-md p-4 mb-6">
          <textarea
            rows="3"
            value={draftContent}
            onChange={e => setDraftContent(e.target.value)}
            placeholder="Share a farming tip, ask a question, or post a photo..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-emerald-400"
          />
          {draftImagePreview && (
            <div className="relative mt-2 inline-block">
              <img src={draftImagePreview} alt="preview" className="h-24 w-24 rounded-lg object-cover" />
              <button
                onClick={() => { setDraftImage(null); setDraftImagePreview(""); }}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex justify-between items-center mt-3">
            <label className="cursor-pointer rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-emerald-100">
              <Camera size={20} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files[0]) {
                    setDraftImage(e.target.files[0]);
                    setDraftImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </label>
            <Button onClick={handleCreatePost} className="bg-emerald-700 hover:bg-emerald-800 px-6">Post</Button>
          </div>
        </Card>

        {/* Feed posts */}
        <div className="space-y-4">
          {isLoading && <p className="text-center text-slate-500">Loading posts...</p>}
          {!isLoading && posts.length === 0 && <EmptyState icon="📭" title="No posts yet" description="Be the first to share something!" />}
          {posts.map(post => {
            const isMyPost = post.author_username === myUsername;
            return (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md border border-emerald-50 overflow-hidden">
                <div className="p-4">
                  {/* Header with menu */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center text-white font-bold uppercase">
                        {post.author?.charAt(0) || "F"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{post.author}</p>
                        <p className="text-xs text-slate-400">{formatTime(post.created_at)}</p>
                      </div>
                    </div>
                    {isMyPost && (
                      <div className="relative">
                        <button onClick={() => setShowMenuForPost(showMenuForPost === post.id ? null : post.id)} className="p-1 rounded-full hover:bg-slate-100">
                          <MoreVertical size={18} className="text-slate-500" />
                        </button>
                        {showMenuForPost === post.id && (
                          <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border z-10 w-32">
                            <button onClick={() => startEditPost(post)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                            <button onClick={() => deletePost(post.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  {editingPostId === post.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm"
                        rows="3"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={cancelEdit} className="px-3 py-1 bg-slate-200 rounded text-sm">Cancel</button>
                        <button onClick={() => saveEdit(post.id)} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
                      {post.image_url && (
                        <div className="mt-3 rounded-xl overflow-hidden">
                          <img src={post.image_url} alt="post" className="max-h-80 w-full object-cover" />
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 mt-4 text-slate-600">
                    <button onClick={() => toggleLike(post.id)} disabled={isLiking[post.id]} className={`flex items-center gap-1 ${postStats[post.id]?.likedByMe ? "text-red-500" : ""}`}>
                      <Heart size={18} fill={postStats[post.id]?.likedByMe ? "currentColor" : "none"} /> Like ({postStats[post.id]?.likeCount || 0})
                    </button>
                    <button onClick={() => { if (activeCommentPostId !== post.id) fetchComments(post.id); setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id); }} className="flex items-center gap-1">
                      <MessageCircle size={18} /> Comment ({postStats[post.id]?.commentCount || 0})
                    </button>
                    <button onClick={() => sharePost(post)} className="flex items-center gap-1">
                      <Share2 size={18} /> Share
                    </button>
                  </div>

                  {/* Comments section */}
                  {activeCommentPostId === post.id && (
                    <div className="mt-4 border-t pt-3">
                      {loadingCommentsPostId === post.id && <p className="text-sm text-slate-500">Loading comments...</p>}
                      {commentsByPost[post.id]?.map(c => (
                        <div key={c.id} className="bg-slate-50 rounded-lg p-2 mb-2">
                          <p className="text-xs font-bold text-slate-600">{c.author} • {formatTime(c.created_at)}</p>
                          <p className="text-sm">{c.comment}</p>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <input
                          value={commentDrafts[post.id] || ""}
                          onChange={e => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="flex-1 rounded-lg border p-2 text-sm"
                        />
                        <button onClick={() => addComment(post.id)} className="bg-emerald-700 text-white px-3 rounded-lg text-sm">Post</button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}