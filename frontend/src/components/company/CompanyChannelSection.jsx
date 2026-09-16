import React, { useState, useEffect, useRef, forwardRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import {
  MessageSquare,
  Send,
  Shield,
  User,
  Clock,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api";
import { formatDate } from "../../utils/dateUtils";

const MotionBox = motion.create(Box);

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const CompanyChannelSection = forwardRef(({ companyId, companyName, currentUser, accentColor = "#CD2426" }, ref) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputFieldRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const fetchMessages = async (silent = false) => {
    if (!companyId) return;
    if (!silent) {
      setLoading(true);
      setMessages([]);
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await api.get(`messages/chat/?company_id=${companyId}`);
      const newMsgs = res.data || [];
      if (!silent) {
        setMessages(newMsgs);
      } else {
        setMessages((prev) => {
          const isDifferent = prev.length !== newMsgs.length || (newMsgs.length > 0 && prev.length > 0 && prev[prev.length - 1].id !== newMsgs[newMsgs.length - 1].id);
          if (isDifferent) {
            if (scrollContainerRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
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
      await api.post("messages/mark-read/", { company_id: companyId }).catch(() => {});
    } catch (err) {
      console.error("Failed to load company channel messages:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    isInitialLoadRef.current = true;
    fetchMessages(false);
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [companyId]);

  const scrollToBottom = (behavior = "auto") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 9999999;
    }
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior, block: "end", inline: "nearest" });
      } catch (e) {
        messagesEndRef.current.scrollIntoView(false);
      }
    }
  };

  useEffect(() => {
    if (!loading && messages.length > 0 && isInitialLoadRef.current) {
      scrollToBottom("auto");
      const t1 = requestAnimationFrame(() => scrollToBottom("auto"));
      const t2 = setTimeout(() => scrollToBottom("auto"), 50);
      const t3 = setTimeout(() => scrollToBottom("auto"), 150);
      const t4 = setTimeout(() => scrollToBottom("auto"), 300);
      isInitialLoadRef.current = false;
      return () => {
        cancelAnimationFrame(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [loading, messages, companyId]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !companyId || sending) return;

    setSending(true);
    try {
      const payload = {
        company: companyId,
        content: inputText.trim(),
      };
      const res = await api.post("messages/", payload);
      setMessages((prev) => [...prev, res.data]);
      setInputText("");
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err) {
      console.error("Failed to send message to company channel:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Expose focus/scroll helper to ref
  React.useImperativeHandle(ref, () => ({
    focusInput: (prefill = "") => {
      if (prefill) {
        setInputText(prefill);
      }
      if (inputFieldRef.current) {
        inputFieldRef.current.focus();
      }
    }
  }));

  const isMessageFromAdmin = (msg) => {
    if (msg.is_xanatz_admin === true) return true;
    if (msg.sender_role === "Xanatz Admin") return true;
    if (msg.sender_email && (msg.sender_email.toLowerCase().includes("admin") || msg.sender_email.toLowerCase().includes("xanatz"))) {
      return true;
    }
    if (msg.sender_name && msg.sender_name.toLowerCase().includes("xanatz admin")) {
      return true;
    }
    return false;
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      mb={8}
      borderRadius="2xl"
      border="1px solid var(--color-card-border, rgba(255, 255, 255, 0.12))"
      overflow="hidden"
      style={{
        background: "var(--color-surface, rgba(15, 23, 42, 0.85))",
        backdropFilter: "blur(24px)",
        boxShadow: "0 12px 32px 0 rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Top Header */}
      <Flex
        align="center"
        justify="space-between"
        px={6}
        py={4}
        borderBottom="1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))"
        style={{
          background: "linear-gradient(90deg, rgba(205, 36, 38, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)",
        }}
        flexWrap="wrap"
        gap={3}
      >
        <HStack gap={3}>
          <Flex
            w="42px"
            h="42px"
            borderRadius="xl"
            align="center"
            justify="center"
            style={{
              background: "linear-gradient(135deg, rgba(205, 36, 38, 0.2), rgba(139, 92, 246, 0.2))",
              border: "1px solid rgba(205, 36, 38, 0.35)",
            }}
          >
            <MessageSquare size={20} color="#f87171" />
          </Flex>

          <VStack align="start" gap={0}>
            <HStack gap={2}>
              <Text color="var(--color-text-primary, #ffffff)" fontWeight="black" fontSize="md">
                Company Channel Messages
              </Text>
              <Badge
                colorScheme="red"
                fontSize="9px"
                px={2}
                py={0.5}
                borderRadius="full"
                variant="subtle"
              >
                OFFICIAL SUPPORT
              </Badge>
            </HStack>
            <Text color="var(--color-text-muted, #94a3b8)" fontSize="xs">
              Official channel between Platform Admins and {companyName || "your company"}
            </Text>
          </VStack>
        </HStack>

        <HStack gap={2}>
          {isRefreshing && <Spinner size="xs" color="var(--color-text-muted)" />}
          <Button
            size="xs"
            variant="ghost"
            color="var(--color-text-muted)"
            _hover={{ color: "white", bg: "rgba(255,255,255,0.08)" }}
            onClick={() => fetchMessages(false)}
            leftIcon={<RefreshCw size={12} />}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* Messages Stream */}
      <Box
        ref={scrollContainerRef}
        p={6}
        maxH="380px"
        minH="220px"
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.1)" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.15)", borderRadius: "3px" },
        }}
      >
        {loading ? (
          <Flex direction="column" align="center" justify="center" py={10} gap={3}>
            <Spinner size="md" color={accentColor} />
            <Text color="var(--color-text-muted)" fontSize="xs">
              Loading company channel history...
            </Text>
          </Flex>
        ) : messages.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={10} textAlign="center" gap={3}>
            <Flex
              w="50px"
              h="50px"
              borderRadius="full"
              align="center"
              justify="center"
              bg="rgba(255,255,255,0.04)"
              border="1px solid rgba(255,255,255,0.08)"
            >
              <MessageSquare size={24} color="#94a3b8" />
            </Flex>
            <VStack gap={1}>
              <Text color="white" fontWeight="bold" fontSize="sm">
                No messages in company channel yet
              </Text>
              <Text color="var(--color-text-muted)" fontSize="xs" maxW="380px">
                Use the reply box below to send inquiries, clarification details, or updates to Platform Admins.
              </Text>
            </VStack>
          </Flex>
        ) : (
          <VStack gap={4} align="stretch">
            {messages.map((msg) => {
              const senderId = typeof msg.sender === "object" ? msg.sender?.id : msg.sender;
              const isSelf = currentUser && (Number(senderId) === Number(currentUser.id) || String(senderId) === String(currentUser.id));
              const isAdmin = isMessageFromAdmin(msg);

              return (
                <Flex
                  key={msg.id}
                  justify={isSelf ? "flex-end" : "flex-start"}
                  w="full"
                >
                  <HStack
                    align="flex-start"
                    gap={3}
                    maxW="82%"
                    flexDirection={isSelf ? "row-reverse" : "row"}
                  >
                    {/* Avatar / Icon */}
                    <Flex
                      w="34px"
                      h="34px"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      flexShrink={0}
                      style={{
                        background: isAdmin
                          ? "linear-gradient(135deg, #ef4444, #8b5cf6)"
                          : isSelf
                          ? `linear-gradient(135deg, ${accentColor}, #8b5cf6)`
                          : "rgba(255,255,255,0.12)",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: "bold",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      {isAdmin ? (
                        <Shield size={16} color="white" />
                      ) : (
                        getInitials(msg.sender_name || (isSelf ? currentUser?.first_name : "User"))
                      )}
                    </Flex>

                    {/* Message Bubble */}
                    <Box>
                      <Flex
                        align="center"
                        gap={2}
                        mb={1}
                        justify={isSelf ? "flex-end" : "flex-start"}
                        flexWrap="wrap"
                      >
                        <Text
                          color="var(--color-text-muted, #94a3b8)"
                          fontSize="11px"
                          fontWeight="bold"
                        >
                          {isAdmin
                            ? (isSelf ? "You (Xanatz Admin)" : (msg.sender_name || "Xanatz Admin"))
                            : (isSelf ? "You" : (msg.sender_name || "Company Member"))}
                          {!isAdmin && msg.sender_role && (
                            <span style={{ fontSize: "10px", opacity: 0.8, marginLeft: "4px", fontWeight: "normal" }}>
                              ({msg.sender_role}{msg.sender_position ? ` • ${msg.sender_position}` : ""})
                            </span>
                          )}
                        </Text>

                        {isAdmin ? (
                          <Badge
                            colorScheme="red"
                            fontSize="8px"
                            px={1.5}
                            py={0}
                            borderRadius="full"
                            style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)", display: "inline-flex", alignItems: "center", gap: "3px" }}
                          >
                            <Shield size={9} /> XANATZ ADMIN
                          </Badge>
                        ) : (
                          <Badge
                            colorScheme="blue"
                            fontSize="8px"
                            px={1.5}
                            py={0}
                            borderRadius="full"
                            style={{ background: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)" }}
                          >
                            {(msg.sender_role || "COMPANY MEMBER").toUpperCase()}
                          </Badge>
                        )}

                        <Text color="rgba(255,255,255,0.4)" fontSize="10px">
                          {formatDate(msg.created_at)}
                        </Text>
                      </Flex>

                      <Box
                        px={4}
                        py={3}
                        borderRadius="2xl"
                        borderTopLeftRadius={!isSelf ? "2px" : "2xl"}
                        borderTopRightRadius={isSelf ? "2px" : "2xl"}
                        style={{
                          background: isSelf
                            ? `linear-gradient(135deg, ${accentColor}cc 0%, rgba(139,92,246,0.85) 100%)`
                            : isAdmin
                            ? "linear-gradient(135deg, rgba(30,58,138,0.7) 0%, rgba(15,23,42,0.9) 100%)"
                            : "rgba(30, 41, 59, 0.8)",
                          border: isSelf
                            ? `1px solid ${accentColor}40`
                            : isAdmin
                            ? "1px solid rgba(59,130,246,0.3)"
                            : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        }}
                      >
                        <Text
                          color="white"
                          fontSize="sm"
                          lineHeight="1.6"
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                        >
                          {msg.content}
                        </Text>
                      </Box>
                    </Box>
                  </HStack>
                </Flex>
              );
            })}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Input Box & Action */}
      <Box
        p={4}
        borderTop="1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))"
        style={{
          background: "rgba(10, 15, 30, 0.6)",
        }}
      >
        <form onSubmit={handleSend}>
          <Flex gap={3} align="center">
            <Input
              ref={inputFieldRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message to Platform Admins..."
              size="md"
              borderRadius="xl"
              bg="rgba(0, 0, 0, 0.35)"
              border="1px solid var(--color-card-border, rgba(255, 255, 255, 0.12))"
              color="white"
              _placeholder={{ color: "var(--color-text-muted, #64748b)" }}
              _focus={{
                borderColor: accentColor,
                boxShadow: `0 0 0 1px ${accentColor}`,
                bg: "rgba(0,0,0,0.5)",
              }}
            />
            <Button
              type="submit"
              isLoading={sending}
              isDisabled={!inputText.trim()}
              px={6}
              borderRadius="xl"
              fontWeight="bold"
              style={{
                background: inputText.trim()
                  ? `linear-gradient(135deg, ${accentColor}, #8b5cf6)`
                  : "rgba(255,255,255,0.08)",
                color: "white",
              }}
              _hover={{
                filter: "brightness(1.1)",
                transform: "translateY(-1px)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              leftIcon={<Send size={15} />}
            >
              Send
            </Button>
          </Flex>
        </form>
      </Box>
    </MotionBox>
  );
});

export default CompanyChannelSection;
