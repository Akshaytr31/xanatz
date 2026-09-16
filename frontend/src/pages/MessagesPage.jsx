import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api, { backendUrl } from "../api";
import { MessageSquare, Send, Search, User, Loader2, MessageCircle, Building2, Shield } from "lucide-react";

const MessagesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isInitialChatLoadRef = useRef(true);
  const hasHandledInitialRef = useRef(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${backendUrl}${path}`;
  };

  // Fetch current user details on load
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("me/");
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user profiles", err);
      }
    };
    fetchMe();
  }, []);

  // Fetch conversation threads
  const fetchConversations = async (silent = false) => {
    try {
      const res = await api.get("messages/conversations/");
      setConversations((prev) => {
        const backendIds = new Set(res.data.map((c) => String(c.id)));
        const draftConvs = prev.filter(
          (c) => !c.last_message && !backendIds.has(String(c.id))
        );
        return [...draftConvs, ...res.data];
      });
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  // Fetch chat history with active partner
  const fetchChatHistory = async (partner, silent = false) => {
    if (!partner) return;
    if (!silent) {
      setLoadingChat(true);
      setMessages([]);
    }
    try {
      let res;
      if (partner.is_company_channel && partner.company_id) {
        res = await api.get(`messages/chat/?company_id=${partner.company_id}`);
        await api.post("messages/mark-read/", { company_id: partner.company_id }).catch(() => {});
      } else {
        res = await api.get(`messages/chat/?user_id=${partner.id}`);
        await api.post("messages/mark-read/", { sender_id: partner.id }).catch(() => {});
      }
      const newMsgs = res.data || [];
      if (!silent) {
        setMessages(newMsgs);
      } else {
        setMessages((prev) => {
          const isDifferent = prev.length !== newMsgs.length || (newMsgs.length > 0 && prev.length > 0 && prev[prev.length - 1].id !== newMsgs[newMsgs.length - 1].id);
          if (isDifferent) {
            if (chatContainerRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
              const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
              if (isNearBottom) {
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }
            }
            return newMsgs;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    } finally {
      if (!silent) setLoadingChat(false);
    }
  };

  // Poll for messages and updates
  useEffect(() => {
    fetchConversations();
    const intervalConv = setInterval(() => fetchConversations(true), 6000);
    return () => clearInterval(intervalConv);
  }, []);

  const activePartnerKey = activePartner?.is_company_channel ? `company_${activePartner.company_id}` : activePartner?.id;

  useEffect(() => {
    if (activePartner) {
      isInitialChatLoadRef.current = true;
      fetchChatHistory(activePartner, false);
      const intervalChat = setInterval(() => fetchChatHistory(activePartner, true), 4000);
      return () => clearInterval(intervalChat);
    } else {
      setMessages([]);
    }
  }, [activePartnerKey]);

  // If no partner selected, auto-select specified company channel or first conversation once loaded
  useEffect(() => {
    if (conversations.length > 0 && !hasHandledInitialRef.current) {
      const searchParams = new URLSearchParams(location.search);
      const targetCompId = searchParams.get("company_id") || location.state?.company_id;
      if (targetCompId) {
        const foundCompConv = conversations.find(
          (c) => c.is_company_channel && (String(c.company_id) === String(targetCompId) || String(c.id) === `company_${targetCompId}`)
        );
        if (foundCompConv) {
          setActivePartner(foundCompConv);
          hasHandledInitialRef.current = true;
          return;
        }
      }
      if (!activePartner) {
        setActivePartner(conversations[0]);
        hasHandledInitialRef.current = true;
      }
    }
  }, [conversations, activePartner, location]);

  const scrollToBottom = (behavior = "auto") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 9999999;
    }
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior, block: "end", inline: "nearest" });
      } catch (e) {
        messagesEndRef.current.scrollIntoView(false);
      }
    }
  };

  // Initial scroll to bottom when chat opens or finishes loading
  useEffect(() => {
    if (!loadingChat && messages.length > 0 && isInitialChatLoadRef.current) {
      scrollToBottom("auto");
      const t1 = requestAnimationFrame(() => scrollToBottom("auto"));
      const t2 = setTimeout(() => scrollToBottom("auto"), 50);
      const t3 = setTimeout(() => scrollToBottom("auto"), 150);
      const t4 = setTimeout(() => scrollToBottom("auto"), 300);
      isInitialChatLoadRef.current = false;
      return () => {
        cancelAnimationFrame(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [loadingChat, messages, activePartnerKey]);

  // Handle Search Input Changes
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await api.get(`users/search/?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (err) {
          console.error("Failed to search users", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner) return;

    try {
      const payload = { content: newMessage.trim() };
      if (activePartner.is_company_channel && activePartner.company_id) {
        payload.company = activePartner.company_id;
      } else {
        payload.recipient = activePartner.id;
      }

      const res = await api.post("messages/", payload);
      setMessages((prev) => [...prev, res.data]);
      const sentText = newMessage.trim();
      setNewMessage("");

      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (String(c.id) === String(activePartner.id)) {
            return {
              ...c,
              last_message: sentText,
              last_message_time: res.data.created_at || new Date().toISOString(),
              unread_count: 0,
            };
          }
          return c;
        });
        const activeConv = updated.find((c) => String(c.id) === String(activePartner.id));
        const others = updated.filter((c) => String(c.id) !== String(activePartner.id));
        return activeConv ? [activeConv, ...others] : updated;
      });

      fetchConversations(true);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // Start chat with search result or selected partner
  const handleSelectSearchResult = (partner) => {
    if (!partner || !partner.id) return;
    const existing = conversations.find((c) => String(c.id) === String(partner.id));
    const targetPartner = existing || {
      id: partner.id,
      email: partner.email,
      name: partner.name || `${partner.first_name || ""} ${partner.last_name || ""}`.trim() || partner.email,
      profile_picture: partner.profile_picture,
    };

    setActivePartner(targetPartner);
    setSearchQuery("");
    setSearchResults([]);
    
    // Add to conversations list immediately if not present
    setConversations((prev) => {
      if (prev.some((c) => String(c.id) === String(targetPartner.id))) return prev;
      return [
        {
          id: targetPartner.id,
          email: targetPartner.email,
          name: targetPartner.name || `${targetPartner.first_name || ""} ${targetPartner.last_name || ""}`.trim() || targetPartner.email,
          profile_picture: targetPartner.profile_picture,
          last_message: "",
          last_message_time: null,
          unread_count: 0,
        },
        ...prev,
      ];
    });
  };

  useEffect(() => {
    const checkInitialChatSelection = async () => {
      let partner = null;
      if (location.state && location.state.startChatWith) {
        partner = location.state.startChatWith;
      } else if (location.search) {
        const searchParams = new URLSearchParams(location.search);
        const targetUserId = searchParams.get("user");
        if (targetUserId) {
          try {
            const res = await api.get(`users/search/?q=${targetUserId}`);
            if (res.data && res.data.length > 0) {
              partner = res.data.find((u) => String(u.id) === String(targetUserId)) || res.data[0];
            }
          } catch (err) {
            console.error("Failed to load user for chat", err);
          }
        }
      }

      if (partner && !hasHandledInitialRef.current) {
        hasHandledInitialRef.current = true;
        handleSelectSearchResult(partner);
        // Reset React Router state and URL query parameters cleanly
        navigate(location.pathname, { replace: true, state: {} });
      }
    };

    checkInitialChatSelection();
  }, [location.state, location.search, navigate]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getDisplayList = () => {
    if (!searchQuery.trim()) {
      return { local: conversations, remote: [] };
    }
    const query = searchQuery.toLowerCase();
    const localMatches = conversations.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
    const localIds = new Set(localMatches.map(c => c.id));
    const remoteMatches = searchResults.filter(r => !localIds.has(r.id));
    return { local: localMatches, remote: remoteMatches };
  };

  const { local: displayLocals, remote: displayRemotes } = getDisplayList();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #070b19, #0f172a)",
        color: "var(--color-text-primary, #f8fafc)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Navbar />

      <main style={{ padding: "80px 24px 24px", maxWidth: "1280px", margin: "0 auto", height: "calc(100vh - 20px)" }}>
        <div
          style={{
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(24px)",
            border: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
            borderRadius: "1.25rem",
            display: "flex",
            height: "100%",
            overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* LEFT SIDEBAR: Conversational threads */}
          <div
            style={{
              width: "360px",
              borderRight: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
              display: "flex",
              flexDirection: "column",
              background: "rgba(10, 15, 30, 0.3)",
            }}
          >
            {/* Search header */}
            <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Chats</h2>
              <div style={{ position: "relative" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-muted, #64748b)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    borderRadius: "0.75rem",
                    border: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
                    background: "rgba(15, 23, 42, 0.6)",
                    color: "white",
                    fontSize: "0.85rem",
                    outline: "none",
                    transition: "border 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-accent, #3b82f6)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-card-border, rgba(255, 255, 255, 0.08))"}
                />
              </div>
            </div>

            {/* Conversation list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
              {isSearching ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto" }} />
                </div>
              ) : displayLocals.length === 0 && displayRemotes.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                  <MessageSquare size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                  {searchQuery.trim() ? "No users found matching your search." : "Search users above to start a conversation."}
                </div>
              ) : (
                <>
                  {/* Display existing conversation matches */}
                  {displayLocals.map((conv) => {
                    const isActive = activePartner && String(activePartner.id) === String(conv.id);
                    const unreadCount = isActive ? 0 : (conv.unread_count || 0);
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectSearchResult(conv)}
                        style={{
                          display: "flex",
                          gap: "12px",
                          padding: "12px",
                          borderRadius: "0.75rem",
                          cursor: "pointer",
                          background: isActive ? "rgba(59, 130, 246, 0.12)" : unreadCount > 0 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                          border: isActive ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid transparent",
                          marginBottom: "4px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = unreadCount > 0 ? "rgba(255, 255, 255, 0.02)" : "transparent";
                        }}
                      >
                        {conv.is_company_channel ? (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #ef4444, #8b5cf6)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              flexShrink: 0,
                              boxShadow: "0 2px 8px rgba(239,68,68,0.35)",
                            }}
                          >
                            <Shield size={20} color="white" />
                          </div>
                        ) : getImageUrl(conv.profile_picture) ? (
                          <img
                            src={getImageUrl(conv.profile_picture)}
                            alt=""
                            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(conv.name)}
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: unreadCount > 0 ? 700 : 600, color: unreadCount > 0 ? "white" : "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                              {conv.is_company_channel ? "Xanatz Admin Support" : conv.name}
                              {conv.is_company_channel && (
                                <span style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "4px", fontSize: "9px", padding: "1px 4px", fontWeight: "bold" }}>
                                  ADMIN
                                </span>
                              )}
                            </span>
                            {conv.last_message_time && (
                              <span style={{ fontSize: "0.65rem", color: "#64748b" }}>
                                {new Date(conv.last_message_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: unreadCount > 0 ? "white" : "var(--color-text-secondary, #94a3b8)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontWeight: unreadCount > 0 ? 600 : 400,
                              }}
                            >
                              {conv.last_message || "No messages yet"}
                            </span>
                            {unreadCount > 0 && (
                              <span
                                style={{
                                  background: "#ef4444",
                                  color: "white",
                                  borderRadius: "9999px",
                                  fontSize: "0.65rem",
                                  fontWeight: "bold",
                                  padding: "2px 6px",
                                  minWidth: "18px",
                                  textAlign: "center",
                                  display: "inline-block",
                                }}
                              >
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Display remote search results section */}
                  {displayRemotes.length > 0 && (
                    <>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", padding: "10px 12px 6px", letterSpacing: "0.05em" }}>
                        Other Users
                      </div>
                      {displayRemotes.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleSelectSearchResult(user)}
                          style={{
                            display: "flex",
                            gap: "12px",
                            padding: "12px",
                            borderRadius: "0.75rem",
                            cursor: "pointer",
                            background: "transparent",
                            marginBottom: "4px",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          {getImageUrl(user.profile_picture) ? (
                            <img
                              src={getImageUrl(user.profile_picture)}
                              alt=""
                              style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "0.85rem",
                                fontWeight: "bold",
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email)}
                            </div>
                          )}

                          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                              {`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {user.headline || user.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT CHAT AREA */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", background: "rgba(15, 23, 42, 0.15)" }}>
            {activePartner ? (
              <>
                {/* Chat window Header */}
                <div
                  style={{
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "rgba(10, 15, 30, 0.2)",
                  }}
                >
                  {activePartner.is_company_channel ? (
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #ef4444, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(239,68,68,0.35)",
                      }}
                    >
                      <Shield size={18} color="white" />
                    </div>
                  ) : getImageUrl(activePartner.profile_picture) ? (
                    <img
                      src={getImageUrl(activePartner.profile_picture)}
                      alt=""
                      style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      {getInitials(activePartner.name)}
                    </div>
                  )}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
                        {activePartner.is_company_channel ? "Xanatz Admin Support" : activePartner.name}
                      </h3>
                      {activePartner.is_company_channel && (
                        <span style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "4px", fontSize: "9px", padding: "1px 5px", fontWeight: "bold" }}>
                          ADMIN SUPPORT
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                      {activePartner.is_company_channel
                        ? `Official Admin Inquiry & Clarification Channel ${activePartner.company_name ? `(${activePartner.company_name})` : ""}`
                        : activePartner.email}
                    </span>
                  </div>
                </div>

                {/* Message Log */}
                <div ref={chatContainerRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {loadingChat ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <Loader2 className="animate-spin" size={24} style={{ color: "#3b82f6" }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", color: "#64748b" }}>
                      <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
                      <p style={{ fontSize: "0.8rem" }}>
                        {activePartner.is_company_channel
                          ? "No messages yet. Send an inquiry or clarification to Xanatz Admins."
                          : `Say hello to ${activePartner.name}!`}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const senderId = typeof msg.sender === "object" ? msg.sender?.id : msg.sender;
                      const isMe = currentUser && (Number(senderId) === Number(currentUser.id) || String(senderId) === String(currentUser.id));
                      const isAdminMsg = msg.is_xanatz_admin === true || msg.sender_role === "Xanatz Admin" || (msg.sender_email && (msg.sender_email.toLowerCase().includes("admin") || msg.sender_email.toLowerCase().includes("xanatz")));
                      const timeStr = msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "";
                      return (
                        <div
                          key={msg.id || index}
                          style={{
                            display: "flex",
                            justifyContent: isMe ? "flex-end" : "flex-start",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "68%",
                              background: isMe
                                ? (isAdminMsg ? "linear-gradient(135deg, #dc2626, #991b1b)" : "linear-gradient(135deg, #2563eb, #1d4ed8)")
                                : isAdminMsg
                                ? "linear-gradient(135deg, rgba(153, 27, 27, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)"
                                : "rgba(30, 41, 59, 0.8)",
                              border: isMe
                                ? (isAdminMsg ? "1px solid rgba(239, 68, 68, 0.5)" : "none")
                                : isAdminMsg
                                ? "1px solid rgba(239, 68, 68, 0.4)"
                                : "1px solid rgba(255, 255, 255, 0.08)",
                              borderRadius: isMe ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
                              padding: "10px 14px",
                              color: isMe ? "white" : "var(--color-text-primary)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              textAlign: "left",
                            }}
                          >
                            {/* Sender Info Bar */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: isMe ? "flex-end" : "flex-start", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.74rem", fontWeight: "bold", color: isMe ? "#fecdd3" : isAdminMsg ? "#fca5a5" : "#cbd5e1" }}>
                                {isAdminMsg
                                  ? (isMe ? "You (Xanatz Admin)" : (msg.sender_name || "Xanatz Admin"))
                                  : (isMe ? "You" : (msg.sender_name || "Company Member"))}
                              </span>

                              {!isAdminMsg && msg.sender_role && (
                                <span style={{ fontSize: "0.68rem", color: isMe ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>
                                  ({msg.sender_role}{msg.sender_position ? ` • ${msg.sender_position}` : ""})
                                </span>
                              )}

                              {isAdminMsg ? (
                                <span style={{ background: "rgba(239,68,68,0.25)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.45)", borderRadius: "4px", fontSize: "8px", padding: "1px 5px", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                  <Shield size={10} /> XANATZ ADMIN
                                </span>
                              ) : (
                                <span style={{ background: isMe ? "rgba(255,255,255,0.2)" : "rgba(59, 130, 246, 0.2)", color: isMe ? "white" : "#60a5fa", border: isMe ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "4px", fontSize: "8px", padding: "1px 5px", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                  <Building2 size={9} /> {(msg.sender_role || "COMPANY MEMBER").toUpperCase()}
                                </span>
                              )}
                            </div>

                            <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.5", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                              {msg.content}
                            </p>
                            {timeStr && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.6rem",
                                  color: isMe ? "rgba(255,255,255,0.6)" : "#64748b",
                                  textAlign: "right",
                                  marginTop: "4px",
                                }}
                              >
                                {timeStr}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderTop: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
                    display: "flex",
                    gap: "12px",
                    background: "rgba(10, 15, 30, 0.2)",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
                      background: "rgba(15, 23, 42, 0.6)",
                      color: "white",
                      fontSize: "0.85rem",
                      outline: "none",
                      transition: "border 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-accent, #3b82f6)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-card-border, rgba(255, 255, 255, 0.08))"}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    style={{
                      background: newMessage.trim() ? "var(--color-accent, #2563eb)" : "rgba(255,255,255,0.03)",
                      border: "none",
                      borderRadius: "0.75rem",
                      width: "44px",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: newMessage.trim() ? "white" : "#64748b",
                      cursor: newMessage.trim() ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#64748b" }}>
                <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 4px" }}>No Conversation Selected</h3>
                <p style={{ fontSize: "0.8rem" }}>Choose a contact from the sidebar or search users to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
