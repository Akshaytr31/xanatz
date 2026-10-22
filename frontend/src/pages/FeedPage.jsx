import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import api, { backendUrl } from "../api";
import Navbar from "../components/Navbar";
import ShareModal from "../components/ShareModal";
import ConnectButton from "../components/ConnectButton";
import FollowButton from "../components/FollowButton";
import {
  Send,
  Heart,
  Share2,
  Image as ImageIcon,
  MoreVertical,
  X,
  MessageCircle,
  Building2,
  User,
  Activity,
  Search,
  Trash2,
  Bookmark,
  Compass,
  Maximize2,
  CheckCircle2,
  RotateCcw,
  Pencil,
  Check,
  Flame,
  TrendingUp,
  ArrowRight
} from "lucide-react";

// Helper to safely format relative timestamps
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const past = new Date(dateStr);
  const diffInSec = Math.floor((now - past) / 1000);

  if (diffInSec < 45) return "Just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Helper to resolve media URLs consistently
const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const SUGGESTED_TAGS = [
  "#TechUpdate",
  "#ProjectLaunch",
  "#OpenRFP",
  "#Hiring",
  "#Networking",
  "#Innovation",
];

const FeedPage = () => {
  const navigate = useNavigate();
  const { accountMode, activeCompany, user, userCompanies, switchAccountMode } = useAccount();

  // Feed State
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'company' | 'personal' | 'media' | 'saved'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'popular'
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);

  // Bookmarks storage key scoped to current persona (Personal vs Company)
  const bookmarksStorageKey = useMemo(() => {
    if (accountMode === "company" && activeCompany?.id) {
      return `xanatz_feed_bookmarks_company_${activeCompany.id}`;
    }
    const userId = user?.id || "personal";
    return `xanatz_feed_bookmarks_user_${userId}`;
  }, [accountMode, activeCompany, user]);

  const [currentStorageKey, setCurrentStorageKey] = useState(bookmarksStorageKey);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(bookmarksStorageKey);
      if (saved !== null) return JSON.parse(saved);
      if (accountMode === "personal") {
        const legacy = localStorage.getItem("xanatz_feed_bookmarks");
        return legacy ? JSON.parse(legacy) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Adjust state during render when switching persona / company
  if (currentStorageKey !== bookmarksStorageKey) {
    setCurrentStorageKey(bookmarksStorageKey);
    let nextBookmarks = [];
    try {
      const saved = localStorage.getItem(bookmarksStorageKey);
      if (saved !== null) {
        nextBookmarks = JSON.parse(saved);
      } else if (accountMode === "personal") {
        const legacy = localStorage.getItem("xanatz_feed_bookmarks");
        nextBookmarks = legacy ? JSON.parse(legacy) : [];
      }
    } catch {
      nextBookmarks = [];
    }
    setBookmarkedIds(nextBookmarks);
  }

  // Comments state: { [postId]: Comment[] }
  const [postComments, setPostComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  // Delete confirm modal state
  const [deleteCommentPending, setDeleteCommentPending] = useState(null); // { postId, commentId }

  // Media Lightbox modal
  const [lightboxMedia, setLightboxMedia] = useState(null);

  // Share Modal state
  const [shareModalData, setShareModalData] = useState({
    isOpen: false,
    title: "",
    company: "",
    summary: "",
    url: "",
  });

  // Textarea ref for auto-focus or auto-height
  const textareaRef = useRef(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("feed/");
      setPosts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch feeds", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    api
      .get("feed/")
      .then((res) => {
        if (!isCancelled) {
          setPosts(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Failed to fetch feeds", err);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuPostId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setMedia(null);
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
  };

  const insertTag = (tag) => {
    setContent((prev) => (prev ? `${prev.trim()} ${tag} ` : `${tag} `));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !media) return;

    try {
      setIsPosting(true);
      const formData = new FormData();
      if (content.trim()) {
        formData.append("content", content.trim());
      }
      if (media) {
        formData.append("media", media);
      }
      if (accountMode === "company" && activeCompany?.id) {
        formData.append("company_id", activeCompany.id);
      }

      const res = await api.post("feed/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPosts((prev) => [res.data, ...prev]);
      setContent("");
      removeMedia();
    } catch (err) {
      console.error("Failed to post feed", err);
      alert("Failed to publish post. Please verify your connection.");
    } finally {
      setIsPosting(false);
    }
  };

  const toggleLike = async (postId, e) => {
    e?.stopPropagation();
    try {
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) return;

      const newPosts = [...posts];
      const target = { ...newPosts[postIndex] };
      const currentlyLiked = target.has_liked;

      target.has_liked = !currentlyLiked;
      target.likes_count = currentlyLiked
        ? Math.max(0, (target.likes_count || 1) - 1)
        : (target.likes_count || 0) + 1;
      newPosts[postIndex] = target;
      setPosts(newPosts);

      const res = await api.post(`feed/${postId}/toggle_like/`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, has_liked: res.data.liked, likes_count: res.data.likes_count }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to toggle like", err);
      fetchPosts();
    }
  };

  const handleDeletePost = async (postId, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await api.delete(`feed/${postId}/`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Unable to delete post. You can only delete your own posts.");
    }
  };

  const toggleBookmark = (postId, e) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      try {
        localStorage.setItem(bookmarksStorageKey, JSON.stringify(next));
      } catch (err) {
        console.warn(err);
      }
      return next;
    });
  };

  const toggleCommentsSection = async (postId) => {
    const isOpening = !expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: isOpening }));
    // Fetch comments from API when opening for the first time or if not loaded
    if (isOpening && !postComments[postId]) {
      try {
        setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
        const res = await api.get(`feed/${postId}/comments/`);
        setPostComments((prev) => ({ ...prev, [postId]: res.data || [] }));
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (postId) => {
    const text = (commentInput[postId] || "").trim();
    if (!text) return;

    try {
      const payload = { text };
      if (accountMode === "company" && activeCompany?.id) {
        payload.company_id = activeCompany.id;
      }
      const res = await api.post(`feed/${postId}/comments/`, payload);
      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data],
      }));
      // Also bump local comments_count on the post
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
        )
      );
    } catch (err) {
      console.error("Failed to add comment", err);
    }
    setCommentInput((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const handleSaveEditComment = async (postId, commentId) => {
    const text = editCommentText.trim();
    if (!text) return;
    try {
      const res = await api.patch(`feed/${postId}/comments/${commentId}/`, { text });
      setPostComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((c) => (c.id === commentId ? res.data : c)),
      }));
    } catch (err) {
      console.error("Failed to edit comment", err);
    } finally {
      setEditingCommentId(null);
      setEditCommentText("");
    }
  };

  const handleDeleteComment = (postId, commentId) => {
    // Open the custom confirm modal instead of window.confirm
    setDeleteCommentPending({ postId, commentId });
  };

  const confirmDeleteComment = async () => {
    if (!deleteCommentPending) return;
    const { postId, commentId } = deleteCommentPending;
    setDeleteCommentPending(null);
    try {
      await api.delete(`feed/${postId}/comments/${commentId}/`);
      setPostComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_count: Math.max(0, (p.comments_count || 1) - 1) } : p
        )
      );
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const openShareModal = (post, e) => {
    e?.stopPropagation();
    const postUrl = `${window.location.origin}/feeds#post-${post.id}`;
    setShareModalData({
      isOpen: true,
      title: post.company_name ? `${post.company_name} on Xanatz` : `${post.author_name || "Member"} on Xanatz`,
      company: post.company_name || "",
      summary: post.content || "Check out this update on Xanatz network!",
      url: postUrl,
    });
  };

  // Filter & Search logic
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.content && p.content.toLowerCase().includes(q)) ||
          (p.author_name && p.author_name.toLowerCase().includes(q)) ||
          (p.company_name && p.company_name.toLowerCase().includes(q))
      );
    }

    // Tabs
    if (activeTab === "company") {
      result = result.filter((p) => Boolean(p.company_name || p.company));
    } else if (activeTab === "personal") {
      result = result.filter((p) => !p.company_name && !p.company);
    } else if (activeTab === "media") {
      result = result.filter((p) => Boolean(p.media));
    } else if (activeTab === "saved") {
      result = result.filter((p) => bookmarkedIds.includes(p.id));
    }

    // Sort
    if (sortBy === "popular") {
      result.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [posts, searchQuery, activeTab, sortBy, bookmarkedIds]);

  // Current identity details
  const isCompany = accountMode === "company";
  const currentIdentityName = isCompany
    ? activeCompany?.name || "Company"
    : `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email || "You";

  const currentIdentityAvatar = isCompany
    ? activeCompany?.logo_url
    : user?.profile_picture;

  return (
    <div
      style={{
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        background: "var(--color-bg-primary, #020617)",
        color: "var(--color-text-primary, #ffffff)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      {/* ── Delete Comment Confirm Modal ── */}
      <AnimatePresence>
        {deleteCommentPending && (
          <motion.div
            key="delete-comment-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setDeleteCommentPending(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(135deg, rgba(15,20,40,0.98), rgba(20,15,40,0.98))",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                padding: "32px 28px 24px",
                maxWidth: "360px",
                width: "90%",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.15)",
                textAlign: "center",
              }}
            >
              {/* Icon */}
              <div style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <Trash2 size={22} color="#ef4444" />
              </div>

              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
                Delete Comment?
              </h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "0 0 24px", lineHeight: 1.5 }}>
                This comment will be permanently removed and cannot be recovered.
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setDeleteCommentPending(null)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteComment}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(239,68,68,0.35)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Radial Mesh Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "20%",
            width: "650px",
            height: "650px",
            borderRadius: "50%",
            background: isCompany
              ? "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "35%",
            right: "-10%",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
      </div>

      {/* Main 3-Column Shell (Fixed sidebars + Scrollable center feed) */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "calc(100vh - 72px)",
          marginTop: "72px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
            padding: "0 16px",
            alignItems: "stretch",
          }}
        >
          {/* =========================================================
              LEFT COLUMN: Fixed Side Navigation (Doesn't scroll with feed)
             ========================================================= */}
          <div
            style={{
              gridColumn: "span 3",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "100%",
              overflowY: "auto",
              padding: "16px 0 24px 0",
            }}
            className="hidden lg:flex no-scrollbar"
          >
            {/* Identity Card */}
            <div
              style={{
                background: "var(--color-card-bg, rgba(255,255,255,0.03))",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Subtle card top gradient strip */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: isCompany
                    ? "linear-gradient(90deg, #8b5cf6, #6366f1)"
                    : "linear-gradient(90deg, #10b981, #06b6d4)",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: isCompany
                      ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                      : "linear-gradient(135deg, #10b981, #06b6d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: isCompany
                      ? "0 4px 16px rgba(139, 92, 246, 0.35)"
                      : "0 4px 16px rgba(16, 185, 129, 0.35)",
                  }}
                >
                  {currentIdentityAvatar ? (
                    <img
                      src={getMediaUrl(currentIdentityAvatar)}
                      alt={currentIdentityName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : isCompany ? (
                    <Building2 size={26} color="white" />
                  ) : (
                    <User size={26} color="white" />
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "16px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {currentIdentityName}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary, rgba(255,255,255,0.65))",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "2px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: isCompany ? "#a855f7" : "#10b981",
                        boxShadow: isCompany ? "0 0 6px #a855f7" : "0 0 6px #10b981",
                      }}
                    />
                    {isCompany ? "Company Workspace" : "Personal Account"}
                  </div>
                </div>
              </div>


              {/* Platform activity metrics */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-text-primary, #ffffff)" }}>
                    {posts.length}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary, rgba(255,255,255,0.5))" }}>
                    Total Feeds
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#ec4899" }}>
                    {bookmarkedIds.length}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary, rgba(255,255,255,0.5))" }}>
                    {isCompany ? "Saved (Company)" : "Saved (Personal)"}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Streams */}
            <div
              style={{
                background: "var(--color-card-bg, rgba(255,255,255,0.03))",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                borderRadius: "20px",
                padding: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {[
                { id: "all", label: "All Network Feeds", icon: Compass },
                { id: "company", label: "Company Updates", icon: Building2 },
                { id: "personal", label: "Personal Network", icon: User },
                { id: "media", label: "Photos & Media", icon: ImageIcon },
                { id: "saved", label: isCompany ? "Company Saved Posts" : "Personal Saved Posts", icon: Bookmark },
              ].map((item) => {
                const IconComp = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "none",
                      background: active
                        ? isCompany
                          ? "rgba(139, 92, 246, 0.2)"
                          : "rgba(16, 185, 129, 0.2)"
                        : "transparent",
                      color: active
                        ? isCompany
                          ? "#c084fc"
                          : "#34d399"
                        : "var(--color-text-secondary, rgba(255,255,255,0.7))",
                      fontWeight: active ? 700 : 500,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.color = "#ffffff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--color-text-secondary, rgba(255,255,255,0.7))";
                      }
                    }}
                  >
                    <IconComp size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Links */}
            <div
              style={{
                padding: "8px 12px",
                fontSize: "12px",
                color: "var(--color-text-muted, rgba(255,255,255,0.4))",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <Link to="/rfps" style={{ color: "inherit", textDecoration: "none" }} className="hover:underline">
                Explore RFPs
              </Link>
              <span>•</span>
              <Link to="/profile" style={{ color: "inherit", textDecoration: "none" }} className="hover:underline">
                My Profile
              </Link>
              <span>•</span>
              <Link to="/notifications" style={{ color: "inherit", textDecoration: "none" }} className="hover:underline">
                Activity
              </Link>
            </div>
          </div>

          {/* =========================================================
              CENTER COLUMN: Dedicated Scrollable Feed Stream
             ========================================================= */}
          <div
            style={{
              gridColumn: "span 12",
              height: "100%",
              overflowY: "auto",
              padding: "16px 8px 80px 4px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            className="lg:!col-span-6 feed-scrollable-stream"
          >
            {/* Header Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                padding: "4px 2px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      background: isCompany
                        ? "rgba(139, 92, 246, 0.18)"
                        : "rgba(16, 185, 129, 0.18)",
                      color: isCompany ? "#c084fc" : "#34d399",
                      border: isCompany
                        ? "1px solid rgba(139, 92, 246, 0.3)"
                        : "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <Activity size={12} />
                    XANATZ PULSE
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      color: "var(--color-text-secondary, rgba(255,255,255,0.6))",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                        animation: "pulse 2s infinite",
                      }}
                    />
                    Live Feed
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    margin: "6px 0 0 0",
                    background: "linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.65) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Network Stream & Insights
                </h1>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchPosts}
                disabled={loading}
                title="Refresh feed"
                style={{
                  background: "var(--color-card-bg, rgba(255,255,255,0.05))",
                  border: "1px solid var(--color-card-border, rgba(255,255,255,0.1))",
                  borderRadius: "12px",
                  padding: "8px 14px",
                  color: "var(--color-text-secondary, #cbd5e1)",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary, #cbd5e1)")}
              >
                <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {/* POST COMPOSER STUDIO CARD */}
            <motion.div
              layout
              style={{
                background: "var(--color-card-bg, rgba(255,255,255,0.04))",
                backdropFilter: "blur(24px)",
                border: "1px solid var(--color-card-border, rgba(255,255,255,0.09))",
                borderRadius: "22px",
                padding: "20px",
                boxShadow: "0 12px 36px rgba(0,0,0,0.2)",
                position: "relative",
              }}
            >
              {/* Creator Mode Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      background: isCompany
                        ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                        : "linear-gradient(135deg, #10b981, #06b6d4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {currentIdentityAvatar ? (
                      <img
                        src={getMediaUrl(currentIdentityAvatar)}
                        alt={currentIdentityName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : isCompany ? (
                      <Building2 size={18} color="white" />
                    ) : (
                      <User size={18} color="white" />
                    )}
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--color-text-primary, #ffffff)",
                      }}
                    >
                      Posting as {currentIdentityName}
                    </span>
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "10px",
                        padding: "2px 7px",
                        borderRadius: "9999px",
                        background: isCompany
                          ? "rgba(139, 92, 246, 0.2)"
                          : "rgba(16, 185, 129, 0.2)",
                        color: isCompany ? "#c084fc" : "#34d399",
                        fontWeight: 700,
                      }}
                    >
                      {isCompany ? "Company" : "Personal"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                placeholder={`What's your latest milestone or idea, ${
                  isCompany ? activeCompany?.name || "Company" : user?.first_name || "Member"
                }?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  background: "var(--color-input-bg, rgba(0,0,0,0.2))",
                  border: "1px solid var(--color-input-border, rgba(255,255,255,0.08))",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  fontSize: "14px",
                  color: "var(--color-text-primary, #ffffff)",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "85px",
                  fontFamily: "inherit",
                  lineHeight: "1.5",
                  transition: "border 0.2s ease, box-shadow 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isCompany ? "#8b5cf6" : "#10b981";
                  e.target.style.boxShadow = isCompany
                    ? "0 0 0 3px rgba(139, 92, 246, 0.2)"
                    : "0 0 0 3px rgba(16, 185, 129, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-input-border, rgba(255,255,255,0.08))";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* Media Preview Box */}
              {mediaPreview && (
                <div
                  style={{
                    position: "relative",
                    marginTop: "12px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid var(--color-card-border, rgba(255,255,255,0.1))",
                    background: "#000000",
                    maxHeight: "320px",
                  }}
                >
                  {media?.type?.startsWith("video/") ? (
                    <video
                      src={mediaPreview}
                      controls
                      style={{ width: "100%", maxHeight: "320px", display: "block" }}
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Upload preview"
                      style={{
                        width: "100%",
                        maxHeight: "320px",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  )}
                  <button
                    onClick={removeMedia}
                    title="Remove attachment"
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Hashtag Suggestions */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginTop: "10px",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-muted, rgba(255,255,255,0.4))",
                    fontWeight: 600,
                  }}
                >
                  Quick Tags:
                </span>
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => insertTag(tag)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "9999px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      color: "var(--color-text-secondary, #cbd5e1)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isCompany
                        ? "rgba(139, 92, 246, 0.2)"
                        : "rgba(16, 185, 129, 0.2)";
                      e.currentTarget.style.color = isCompany ? "#c084fc" : "#34d399";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "var(--color-text-secondary, #cbd5e1)";
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Composer Bottom Action Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                    color: "var(--color-text-secondary, #cbd5e1)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "var(--color-text-secondary, #cbd5e1)";
                  }}
                >
                  <ImageIcon size={17} color="#10b981" />
                  <span>Attach Media</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    hidden
                    onChange={handleMediaChange}
                  />
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePost}
                    disabled={isPosting || (!content.trim() && !media)}
                    style={{
                      background: isCompany
                        ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                        : "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "8px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor:
                        isPosting || (!content.trim() && !media)
                          ? "not-allowed"
                          : "pointer",
                      opacity: isPosting || (!content.trim() && !media) ? 0.5 : 1,
                      boxShadow: isCompany
                        ? "0 4px 18px rgba(139, 92, 246, 0.35)"
                        : "0 4px 18px rgba(16, 185, 129, 0.35)",
                    }}
                  >
                    {isPosting ? (
                      <>
                        <RotateCcw size={15} className="animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <span>Publish</span>
                        <Send size={15} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* SEARCH & FILTER CONTROLS */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Search Bar + Sort */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    flex: 1,
                  }}
                >
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted, rgba(255,255,255,0.4))",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search posts, topics, or authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--color-card-bg, rgba(255,255,255,0.03))",
                      border: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                      borderRadius: "14px",
                      padding: "10px 14px 10px 40px",
                      fontSize: "13px",
                      color: "var(--color-text-primary, #ffffff)",
                      outline: "none",
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--color-text-muted, rgba(255,255,255,0.4))",
                        cursor: "pointer",
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Sort Toggle */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: "var(--color-card-bg, rgba(255,255,255,0.03))",
                    border: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                    borderRadius: "14px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    color: "var(--color-text-secondary, #cbd5e1)",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="newest" style={{ background: "#0f172a" }}>Latest</option>
                  <option value="popular" style={{ background: "#0f172a" }}>Most Liked</option>
                </select>
              </div>

              {/* Mobile / Tablet Streams Filter Bar (Horizontal scroll) */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                  scrollbarWidth: "none",
                }}
              >
                {[
                  { id: "all", label: "All Updates" },
                  { id: "company", label: "Companies" },
                  { id: "personal", label: "Personal" },
                  { id: "media", label: "Media" },
                  { id: "saved", label: isCompany ? "Saved (Company)" : "Saved (Personal)" },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        border: active
                          ? isCompany
                            ? "1px solid rgba(139, 92, 246, 0.4)"
                            : "1px solid rgba(16, 185, 129, 0.4)"
                          : "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                        background: active
                          ? isCompany
                            ? "rgba(139, 92, 246, 0.2)"
                            : "rgba(16, 185, 129, 0.2)"
                          : "rgba(255,255,255,0.03)",
                        color: active
                          ? isCompany
                            ? "#c084fc"
                            : "#34d399"
                          : "var(--color-text-secondary, rgba(255,255,255,0.6))",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FEED STREAM CONTAINER */}
            {loading ? (
              /* Shimmer Skeletons */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[1, 2, 3].map((sk) => (
                  <div
                    key={sk}
                    style={{
                      background: "var(--color-card-bg, rgba(255,255,255,0.03))",
                      borderRadius: "20px",
                      padding: "20px",
                      border: "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "14px",
                          background: "rgba(255,255,255,0.07)",
                          animation: "pulse 1.5s infinite",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            width: "120px",
                            height: "14px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.07)",
                            marginBottom: "6px",
                            animation: "pulse 1.5s infinite",
                          }}
                        />
                        <div
                          style={{
                            width: "80px",
                            height: "10px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.05)",
                            animation: "pulse 1.5s infinite",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        width: "90%",
                        height: "12px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.06)",
                        marginBottom: "10px",
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                    <div
                      style={{
                        width: "60%",
                        height: "12px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.06)",
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              /* Empty State */
              <div
                style={{
                  background: "var(--color-card-bg, rgba(255,255,255,0.03))",
                  border: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                  borderRadius: "22px",
                  padding: "50px 24px",
                  textAlign: "center",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <MessageCircle size={28} color="var(--color-accent, #3b82f6)" />
                </div>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    margin: "0 0 6px 0",
                    color: "var(--color-text-primary, #ffffff)",
                  }}
                >
                  No feed posts found
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary, rgba(255,255,255,0.6))",
                    maxWidth: "380px",
                    margin: "0 auto 20px auto",
                    lineHeight: "1.5",
                  }}
                >
                  {searchQuery || activeTab !== "all"
                    ? "Try adjusting your search keywords or stream filters."
                    : "Be the pioneer on Xanatz! Share your recent achievement, opening, or insight above."}
                </p>
                {(searchQuery || activeTab !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveTab("all");
                    }}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              /* Post List */
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <AnimatePresence>
                  {filteredPosts.map((post) => {
                    const isAuthor =
                      user &&
                      (post.author === user.id ||
                        post.author_email === user.email ||
                        (post.company && activeCompany?.id === post.company));

                    const commentsCount = postComments[post.id]
                      ? postComments[post.id].length
                      : (post.comments_count || 0);
                    const isBookmarked = bookmarkedIds.includes(post.id);
                    const isCommentsOpen = Boolean(expandedComments[post.id]);

                    return (
                      <motion.div
                        key={post.id}
                        id={`post-${post.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          background: "var(--color-card-bg, rgba(255,255,255,0.035))",
                          backdropFilter: "blur(24px)",
                          borderRadius: "22px",
                          border: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                          padding: "20px",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                          position: "relative",
                          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--color-card-hover-border, rgba(255,255,255,0.14))";
                          e.currentTarget.style.boxShadow = "0 14px 40px rgba(0,0,0,0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--color-card-border, rgba(255,255,255,0.08))";
                          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
                        }}
                      >
                        {/* Post Header */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "14px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {/* Author Avatar Link */}
                            <Link
                              to={
                                post.company_name
                                  ? `/company/${post.company_public_id || post.company}`
                                  : `/profile/${post.author_public_id || post.author}`
                              }
                              style={{ textDecoration: "none" }}
                              onClick={(e) => e.stopPropagation()}
                              title={`View ${post.company_name || post.author_name || "profile"}`}
                            >
                              <div
                                style={{
                                  width: "46px",
                                  height: "46px",
                                  borderRadius: "14px",
                                  background: post.company_name
                                    ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                                    : "linear-gradient(135deg, #10b981, #06b6d4)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                  cursor: "pointer",
                                  transition: "transform 0.2s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                              >
                                {post.company_name ? (
                                  post.company_logo ? (
                                    <img
                                      src={getMediaUrl(post.company_logo)}
                                      alt={post.company_name}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  ) : (
                                    <Building2 size={22} color="white" />
                                  )
                                ) : post.author_profile_picture ? (
                                  <img
                                    src={getMediaUrl(post.author_profile_picture)}
                                    alt={post.author_name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <User size={22} color="white" />
                                )}
                              </div>
                            </Link>

                            {/* Author info */}
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Link
                                  to={
                                    post.company_name
                                      ? `/company/${post.company_public_id || post.company}`
                                      : `/profile/${post.author_public_id || post.author}`
                                  }
                                  style={{ textDecoration: "none", color: "inherit" }}
                                  onClick={(e) => e.stopPropagation()}
                                  title={`View ${post.company_name || post.author_name || "profile"}`}
                                >
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      fontSize: "15px",
                                      color: "var(--color-text-primary, #ffffff)",
                                      letterSpacing: "-0.01em",
                                      cursor: "pointer",
                                      transition: "color 0.2s ease",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.color = post.company_name ? "#c084fc" : "#10b981")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.color = "var(--color-text-primary, #ffffff)")
                                    }
                                  >
                                    {post.company_name || post.author_name || post.author_email}
                                  </span>
                                </Link>
                                {post.company_name ? (
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 800,
                                      padding: "1px 6px",
                                      borderRadius: "9999px",
                                      background: "rgba(139, 92, 246, 0.2)",
                                      color: "#c084fc",
                                      border: "1px solid rgba(139, 92, 246, 0.3)",
                                    }}
                                  >
                                    COMPANY
                                  </span>
                                ) : (
                                  <CheckCircle2 size={14} color="#10b981" />
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--color-text-secondary, rgba(255,255,255,0.5))",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  marginTop: "2px",
                                }}
                              >
                                <span>{formatRelativeTime(post.created_at)}</span>
                                <span>•</span>
                                <span title={new Date(post.created_at).toLocaleString()}>
                                  {new Date(post.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Context Action Menu & Connect/Follow Button */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {!isAuthor && (
                              post.company_name && post.company ? (
                                <FollowButton companyId={post.company} size="sm" />
                              ) : post.author ? (
                                <ConnectButton targetUserId={post.author} size="sm" />
                              ) : null
                            )}

                            <div style={{ position: "relative" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--color-text-secondary, rgba(255,255,255,0.6))",
                                cursor: "pointer",
                                padding: "6px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "var(--color-text-secondary, rgba(255,255,255,0.6))")
                              }
                            >
                              <MoreVertical size={18} />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuPostId === post.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  right: 0,
                                  marginTop: "6px",
                                  width: "160px",
                                  background: "var(--color-dropdown-bg, #090e21)",
                                  border: "1px solid var(--color-card-border, rgba(255,255,255,0.12))",
                                  borderRadius: "14px",
                                  padding: "6px",
                                  boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
                                  zIndex: 50,
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    openShareModal(post, e);
                                    setActiveMenuPostId(null);
                                  }}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 10px",
                                    borderRadius: "8px",
                                    background: "none",
                                    border: "none",
                                    color: "var(--color-text-primary, #ffffff)",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                  }}
                                  className="hover:bg-white/10"
                                >
                                  <Share2 size={14} />
                                  <span>Share Post</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    toggleBookmark(post.id, e);
                                    setActiveMenuPostId(null);
                                  }}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 10px",
                                    borderRadius: "8px",
                                    background: "none",
                                    border: "none",
                                    color: "var(--color-text-primary, #ffffff)",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                  }}
                                  className="hover:bg-white/10"
                                >
                                  <Bookmark size={14} />
                                  <span>
                                    {isBookmarked
                                      ? isCompany
                                        ? "Remove Company Bookmark"
                                        : "Remove Personal Bookmark"
                                      : isCompany
                                      ? "Save for Company"
                                      : "Save for Personal"}
                                  </span>
                                </button>

                                {isAuthor && (
                                  <button
                                    onClick={(e) => {
                                      handleDeletePost(post.id, e);
                                      setActiveMenuPostId(null);
                                    }}
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "8px 10px",
                                      borderRadius: "8px",
                                      background: "none",
                                      border: "none",
                                      color: "#ef4444",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                      textAlign: "left",
                                    }}
                                    className="hover:bg-red-500/10"
                                  >
                                    <Trash2 size={14} />
                                    <span>Delete Post</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                        {/* Post Text Content */}
                        {post.content && (
                          <div
                            style={{
                              color: "var(--color-text-primary, #f1f5f9)",
                              fontSize: "14.5px",
                              lineHeight: "1.65",
                              whiteSpace: "pre-wrap",
                              marginBottom: post.media ? "14px" : "16px",
                              letterSpacing: "-0.005em",
                            }}
                          >
                            {post.content.split(/(\s+)/).map((word, wIdx) => {
                              if (word.startsWith("#") && word.length > 1) {
                                return (
                                  <span
                                    key={wIdx}
                                    onClick={() => setSearchQuery(word)}
                                    style={{
                                      color: "var(--color-accent, #3b82f6)",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                    className="hover:underline"
                                  >
                                    {word}
                                  </span>
                                );
                              }
                              return word;
                            })}
                          </div>
                        )}

                        {/* Post Media Display */}
                        {post.media && (
                          <div
                            style={{
                              borderRadius: "16px",
                              overflow: "hidden",
                              marginBottom: "16px",
                              border: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                              background: "rgba(0,0,0,0.4)",
                              position: "relative",
                            }}
                          >
                            {post.media.match(/\.(mp4|webm|mov|ogg)$/i) ? (
                              <video
                                src={getMediaUrl(post.media)}
                                controls
                                style={{
                                  width: "100%",
                                  maxHeight: "500px",
                                  display: "block",
                                  background: "#000000",
                                }}
                              />
                            ) : (
                              <div
                                onClick={() => setLightboxMedia(getMediaUrl(post.media))}
                                style={{ cursor: "pointer", position: "relative" }}
                              >
                                <img
                                  src={getMediaUrl(post.media)}
                                  alt="Post attachment"
                                  style={{
                                    width: "100%",
                                    maxHeight: "500px",
                                    objectFit: "contain",
                                    display: "block",
                                    background: "#050814",
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    right: "10px",
                                    background: "rgba(0,0,0,0.6)",
                                    backdropFilter: "blur(6px)",
                                    padding: "4px 8px",
                                    borderRadius: "8px",
                                    fontSize: "11px",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <Maximize2 size={12} />
                                  <span>Preview</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interactive Engagement Bar */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderTop: "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                            paddingTop: "12px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {/* Like Action */}
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={(e) => toggleLike(post.id, e)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: post.has_liked
                                  ? "rgba(236, 72, 153, 0.12)"
                                  : "rgba(255,255,255,0.03)",
                                border: post.has_liked
                                  ? "1px solid rgba(236, 72, 153, 0.3)"
                                  : "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                                color: post.has_liked
                                  ? "#ec4899"
                                  : "var(--color-text-secondary, rgba(255,255,255,0.7))",
                                padding: "6px 14px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 600,
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Heart
                                size={17}
                                fill={post.has_liked ? "#ec4899" : "none"}
                                color={post.has_liked ? "#ec4899" : "currentColor"}
                              />
                              <span>
                                {post.likes_count > 0 ? post.likes_count : "Like"}
                              </span>
                            </motion.button>

                            {/* Comment Trigger */}
                            <button
                              onClick={() => toggleCommentsSection(post.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: isCommentsOpen
                                  ? "rgba(59, 130, 246, 0.12)"
                                  : "rgba(255,255,255,0.03)",
                                border: isCommentsOpen
                                  ? "1px solid rgba(59, 130, 246, 0.3)"
                                  : "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                                color: isCommentsOpen
                                  ? "#3b82f6"
                                  : "var(--color-text-secondary, rgba(255,255,255,0.7))",
                                padding: "6px 14px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 600,
                                transition: "all 0.2s ease",
                              }}
                            >
                              <MessageCircle size={17} />
                              <span>{commentsCount > 0 ? commentsCount : "Comment"}</span>
                            </button>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {/* Bookmark Toggle */}
                            <button
                              onClick={(e) => toggleBookmark(post.id, e)}
                              title={
                                isBookmarked
                                  ? isCompany
                                    ? "Saved to Company"
                                    : "Saved to Personal"
                                  : isCompany
                                  ? "Save to Company"
                                  : "Save to Personal"
                              }
                              style={{
                                background: isBookmarked
                                  ? "rgba(245, 158, 11, 0.12)"
                                  : "transparent",
                                border: "none",
                                color: isBookmarked
                                  ? "#f59e0b"
                                  : "var(--color-text-secondary, rgba(255,255,255,0.6))",
                                padding: "6px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Bookmark
                                size={17}
                                fill={isBookmarked ? "#f59e0b" : "none"}
                              />
                            </button>

                            {/* Share Button */}
                            <button
                              onClick={(e) => openShareModal(post, e)}
                              title="Share post"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                                color: "var(--color-text-secondary, rgba(255,255,255,0.7))",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 600,
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "var(--color-text-secondary, rgba(255,255,255,0.7))")
                              }
                            >
                              <Share2 size={16} />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>

                        {/* Expandable Comments Drawer */}
                        {isCommentsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                              marginTop: "14px",
                              paddingTop: "14px",
                              borderTop: "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                            }}
                          >
                            {/* Loading shimmer */}
                            {commentsLoading[post.id] && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                                {[1, 2].map((sk) => (
                                  <div key={sk} style={{ display: "flex", gap: "10px", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.07)", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ width: "80px", height: "10px", borderRadius: "5px", background: "rgba(255,255,255,0.07)", animation: "pulse 1.5s infinite", marginBottom: "6px" }} />
                                      <div style={{ width: "160px", height: "10px", borderRadius: "5px", background: "rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite" }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Comments List */}
                            {!commentsLoading[post.id] && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                                {(postComments[post.id] || []).length === 0 && (
                                  <div style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.4)", padding: "12px 0" }}>
                                    No comments yet — be the first!
                                  </div>
                                )}
                                {(postComments[post.id] || []).map((comm) => {
                                  const isMyComment = user && comm.author_id === user.id;
                                  const isEditing = editingCommentId === comm.id;
                                  return (
                                    <div
                                      key={comm.id}
                                      style={{
                                        display: "flex",
                                        gap: "10px",
                                        padding: "10px 12px",
                                        background: "rgba(255,255,255,0.025)",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      {/* Avatar Link */}
                                      <Link
                                        to={
                                          comm.is_company
                                            ? `/company/${comm.company_public_id || comm.company_id}`
                                            : `/profile/${comm.author_public_id || comm.author_id}`
                                        }
                                        style={{ textDecoration: "none" }}
                                        onClick={(e) => e.stopPropagation()}
                                        title={`View ${comm.author_name}'s profile`}
                                      >
                                        <div
                                          style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "8px",
                                            background: comm.is_company ? "#8b5cf6" : "#10b981",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                            flexShrink: 0,
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            color: "white",
                                            cursor: "pointer",
                                          }}
                                        >
                                          {comm.author_profile_picture ? (
                                            <img
                                              src={getMediaUrl(comm.author_profile_picture)}
                                              alt={comm.author_name}
                                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                          ) : (
                                            (comm.author_name || "?").charAt(0).toUpperCase()
                                          )}
                                        </div>
                                      </Link>

                                      {/* Content */}
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "space-between" }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Link
                                              to={
                                                comm.is_company
                                                  ? `/company/${comm.company_public_id || comm.company_id}`
                                                  : `/profile/${comm.author_public_id || comm.author_id}`
                                              }
                                              style={{ textDecoration: "none", color: "inherit" }}
                                              onClick={(e) => e.stopPropagation()}
                                              title={`View ${comm.author_name}'s profile`}
                                            >
                                              <span
                                                style={{
                                                  fontSize: "12px",
                                                  fontWeight: 700,
                                                  cursor: "pointer",
                                                  transition: "color 0.2s ease",
                                                }}
                                                onMouseEnter={(e) =>
                                                  (e.currentTarget.style.color = comm.is_company ? "#c084fc" : "#10b981")
                                                }
                                                onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                                              >
                                                {comm.author_name}
                                              </span>
                                            </Link>
                                            {comm.is_company && (
                                              <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "9999px", background: "rgba(139,92,246,0.2)", color: "#c084fc", fontWeight: 700 }}>Co.</span>
                                            )}
                                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                                              {formatRelativeTime(comm.created_at)}
                                            </span>
                                          </div>
                                          {/* Edit / Delete (author only) */}
                                          {isMyComment && !isEditing && (
                                            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                              <button
                                                onClick={() => handleStartEditComment(comm)}
                                                title="Edit comment"
                                                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                                              >
                                                <Pencil size={13} />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteComment(post.id, comm.id)}
                                                title="Delete comment"
                                                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        {/* Edit mode */}
                                        {isEditing ? (
                                          <div style={{ display: "flex", gap: "6px", marginTop: "6px", alignItems: "center" }}>
                                            <input
                                              autoFocus
                                              value={editCommentText}
                                              onChange={(e) => setEditCommentText(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                  e.preventDefault();
                                                  handleSaveEditComment(post.id, comm.id);
                                                } else if (e.key === "Escape") {
                                                  setEditingCommentId(null);
                                                }
                                              }}
                                              style={{
                                                flex: 1,
                                                background: "rgba(0,0,0,0.3)",
                                                border: "1px solid rgba(59,130,246,0.4)",
                                                borderRadius: "8px",
                                                padding: "5px 10px",
                                                fontSize: "13px",
                                                color: "#ffffff",
                                                outline: "none",
                                              }}
                                            />
                                            <button
                                              onClick={() => handleSaveEditComment(post.id, comm.id)}
                                              style={{ background: "#3b82f6", border: "none", borderRadius: "8px", color: "white", padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
                                            >
                                              <Check size={14} />
                                            </button>
                                            <button
                                              onClick={() => setEditingCommentId(null)}
                                              style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", color: "white", padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        ) : (
                                          <div style={{ fontSize: "13px", color: "var(--color-text-primary, #ffffff)", marginTop: "3px", lineHeight: "1.45" }}>
                                            {comm.text}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Add Comment Input Bar */}
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <input
                                type="text"
                                placeholder="Write a response..."
                                value={commentInput[post.id] || ""}
                                onChange={(e) =>
                                  setCommentInput({ ...commentInput, [post.id]: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post.id);
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  background: "var(--color-input-bg, rgba(0,0,0,0.2))",
                                  border: "1px solid var(--color-input-border, rgba(255,255,255,0.08))",
                                  borderRadius: "10px",
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  color: "var(--color-text-primary, #ffffff)",
                                  outline: "none",
                                }}
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                style={{
                                  background: isCompany ? "#8b5cf6" : "#10b981",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "10px",
                                  padding: "8px 14px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Post
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* =========================================================
              RIGHT COLUMN: Fixed Ecosystem & Trends (Doesn't scroll with feed)
             ========================================================= */}
          <div
            style={{
              gridColumn: "span 3",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "100%",
              overflowY: "auto",
              padding: "16px 0 24px 0",
            }}
            className="hidden lg:flex no-scrollbar"
          >
            {/* Trending Topics Card */}
            <div
              style={{
                background: "var(--color-card-bg, rgba(255,255,255,0.03))",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--color-card-border, rgba(255,255,255,0.08))",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "var(--color-text-primary, #ffffff)",
                  letterSpacing: "-0.01em",
                }}
              >
                <Flame size={18} color="#f97316" />
                <span>Trending on Xanatz</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { tag: "#AITools", count: "142 discussions", badge: "Hot" },
                  { tag: "#NextGenRFP", count: "89 updates", badge: "Trending" },
                  { tag: "#FullStackGigs", count: "76 openings" },
                  { tag: "#DesignSystems", count: "54 posts" },
                  { tag: "#RemoteCollaboration", count: "41 posts" },
                ].map((item) => (
                  <div
                    key={item.tag}
                    onClick={() => setSearchQuery(item.tag)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
                    className="hover:bg-white/5"
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--color-text-primary, #ffffff)",
                        }}
                      >
                        {item.tag}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--color-text-secondary, rgba(255,255,255,0.5))",
                        }}
                      >
                        {item.count}
                      </div>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: "6px",
                          background: item.badge === "Hot" ? "rgba(249, 115, 22, 0.15)" : "rgba(59, 130, 246, 0.15)",
                          color: item.badge === "Hot" ? "#fb923c" : "#60a5fa",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Network Pulse Stats Card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#93c5fd",
                }}
              >
                <TrendingUp size={18} />
                <span>Ecosystem Opportunities</span>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-secondary, rgba(255,255,255,0.65))",
                  lineHeight: "1.5",
                  marginBottom: "14px",
                }}
              >
                Connect directly with companies requesting proposals and discover new project requirements.
              </p>

              <button
                onClick={() => navigate("/rfps")}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                }}
              >
                <span>Browse Active RFPs</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Community Standards */}
            <div
              style={{
                background: "var(--color-card-bg, rgba(255,255,255,0.02))",
                border: "1px solid var(--color-card-border, rgba(255,255,255,0.06))",
                borderRadius: "16px",
                padding: "16px",
                fontSize: "12px",
                color: "var(--color-text-secondary, rgba(255,255,255,0.5))",
                lineHeight: "1.5",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--color-text-primary, #ffffff)",
                  marginBottom: "4px",
                }}
              >
                Professional Guidelines
              </div>
              Share verified business milestones, opportunities, and constructive tech insights. Keep discussions collaborative and productive.
            </div>
          </div>
        </div>
      </div>

      {/* Media Lightbox Preview Modal */}
      <AnimatePresence>
        {lightboxMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxMedia(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(0,0,0,0.92)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
            <button
              onClick={() => setLightboxMedia(null)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%",
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
            <img
              src={lightboxMedia}
              alt="Full resolution"
              style={{
                maxWidth: "92vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rich Native & Social Share Modal */}
      <ShareModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData({ ...shareModalData, isOpen: false })}
        title={shareModalData.title}
        company={shareModalData.company}
        summary={shareModalData.summary}
        url={shareModalData.url}
        type="feed"
      />
    </div>
  );
};

export default FeedPage;
