import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import { MessageSquare, Send, Search, User, Loader2, MessageCircle } from "lucide-react";

const MessagesPage = () => {
  const location = useLocation();
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
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  // Fetch chat history with active partner
  const fetchChatHistory = async (partnerId, silent = false) => {
    if (!partnerId) return;
    if (!silent) setLoadingChat(true);
    try {
      const res = await api.get(`messages/chat/?user_id=${partnerId}`);
      setMessages(res.data);
      
      // Mark these messages as read
      await api.post("messages/mark-read/", { sender_id: partnerId });
      
      // Refresh conversations to update read badges
      fetchConversations(true);
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

  useEffect(() => {
    if (activePartner) {
      fetchChatHistory(activePartner.id, true);
      const intervalChat = setInterval(() => fetchChatHistory(activePartner.id, true), 3000);
      return () => clearInterval(intervalChat);
    } else {
      setMessages([]);
    }
  }, [activePartner]);

  // Scroll to bottom helper
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
      const payload = {
        recipient: activePartner.id,
        content: newMessage.trim(),
      };
      const res = await api.post("messages/", payload);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      
      // Refresh conversations so the partner is ranked at the top
      fetchConversations(true);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // Start chat with search result
  const handleSelectSearchResult = (partner) => {
    setActivePartner(partner);
    setSearchQuery("");
    setSearchResults([]);
    
    // Add to conversations list immediately if not present
    setConversations((prev) => {
      if (prev.some((c) => c.id === partner.id)) return prev;
      return [
        {
          id: partner.id,
          email: partner.email,
          name: `${partner.first_name || ""} ${partner.last_name || ""}`.trim() || partner.email,
          profile_picture: partner.profile_picture,
          last_message: "",
          last_message_time: null,
          unread_count: 0,
        },
        ...prev,
      ];
    });
  };

  useEffect(() => {
    if (location.state && location.state.startChatWith) {
      const partner = location.state.startChatWith;
      handleSelectSearchResult(partner);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
                    const isActive = activePartner && activePartner.id === conv.id;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActivePartner({ id: conv.id, email: conv.email, name: conv.name, profile_picture: conv.profile_picture })}
                        style={{
                          display: "flex",
                          gap: "12px",
                          padding: "12px",
                          borderRadius: "0.75rem",
                          cursor: "pointer",
                          background: isActive ? "rgba(59, 130, 246, 0.12)" : conv.unread_count > 0 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                          border: isActive ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid transparent",
                          marginBottom: "4px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = conv.unread_count > 0 ? "rgba(255, 255, 255, 0.02)" : "transparent";
                        }}
                      >
                        {conv.profile_picture ? (
                          <img
                            src={conv.profile_picture}
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
                            <span style={{ fontSize: "0.85rem", fontWeight: conv.unread_count > 0 ? 700 : 600, color: conv.unread_count > 0 ? "white" : "var(--color-text-primary)" }}>
                              {conv.name}
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
                                color: conv.unread_count > 0 ? "white" : "var(--color-text-secondary, #94a3b8)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontWeight: conv.unread_count > 0 ? 600 : 400,
                              }}
                            >
                              {conv.last_message || "No messages yet"}
                            </span>
                            {conv.unread_count > 0 && (
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
                                {conv.unread_count}
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
                          {user.profile_picture ? (
                            <img
                              src={user.profile_picture}
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(15, 23, 42, 0.15)" }}>
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
                  {activePartner.profile_picture ? (
                    <img
                      src={activePartner.profile_picture}
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
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>{activePartner.name}</h3>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{activePartner.email}</span>
                  </div>
                </div>

                {/* Message Log */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {loadingChat ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <Loader2 className="animate-spin" size={24} style={{ color: "#3b82f6" }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", color: "#64748b" }}>
                      <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
                      <p style={{ fontSize: "0.8rem" }}>Say hello to {activePartner.name}!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = currentUser && msg.sender === currentUser.id;
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
                              maxWidth: "65%",
                              background: isMe
                                ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                                : "rgba(255, 255, 255, 0.05)",
                              border: isMe
                                ? "none"
                                : "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
                              borderRadius: isMe ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
                              padding: "10px 14px",
                              color: isMe ? "white" : "var(--color-text-primary)",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              textAlign: "left",
                            }}
                          >
                            <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.4", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                              {msg.content}
                            </p>
                            <span
                              style={{
                                display: "block",
                                fontSize: "0.6rem",
                                color: isMe ? "rgba(255,255,255,0.6)" : "#64748b",
                                textAlign: "right",
                                marginTop: "4px",
                              }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
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
