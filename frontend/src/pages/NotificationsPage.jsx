import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  Badge,
  Input,
} from "@chakra-ui/react";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Search,
  ArrowLeft,
  MessageSquare,
  ExternalLink,
  CheckCheck,
  RefreshCw,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api, { backendUrl } from "../api";
import { formatDate } from "../utils/dateUtils";

const MotionBox = motion.create(Box);

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all', 'unread', 'read'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${backendUrl}${path}`;
  };

  const fetchNotifications = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    try {
      const res = await api.get("notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post("notifications/mark-all-read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoadingId(id);
      await api.post(`notifications/${id}/mark-read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoadingId(id);
      await api.delete(`notifications/${id}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.target_url) {
      const url = notif.target_url === "/admin/moderation" ? "/admin?tab=flagged_reviews" : notif.target_url;
      navigate(url);
    }
  };

  const handleNavigateToChat = async (notif, e) => {
    if (e) e.stopPropagation();
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    navigate("/messages", {
      state: {
        startChatWith: {
          id: notif.sender,
          email: notif.sender_email,
          name: notif.sender_name || notif.sender_email,
          profile_picture: notif.sender_profile_picture,
        },
      },
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((notif) => {
    if (filterTab === "unread" && notif.is_read) return false;
    if (filterTab === "read" && !notif.is_read) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const msgMatch = notif.message?.toLowerCase().includes(q);
      const senderMatch =
        notif.sender_name?.toLowerCase().includes(q) ||
        notif.sender_email?.toLowerCase().includes(q);
      return msgMatch || senderMatch;
    }

    return true;
  });

  return (
    <Box minH="100vh" bg="var(--color-bg-primary)" color="var(--color-text-primary)" fontFamily="'Outfit', sans-serif">
      <Navbar />

      <Container maxW="1100px" pt="100px" pb="80px" px={{ base: 4, md: 8 }}>
        {/* Header Navigation & Title */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          mb={8}
        >
          <Button
            leftIcon={<ArrowLeft size={16} />}
            variant="ghost"
            onClick={() => navigate(-1)}
            color="var(--color-text-muted)"
            _hover={{ color: "var(--color-text-primary)", bg: "var(--color-card-border)" }}
            size="sm"
            mb={4}
            borderRadius="full"
          >
            Back
          </Button>

          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={4}
          >
            <Box>
              <HStack spacing={3} align="center">
                <Text fontSize={{ base: "1.8rem", md: "2.3rem" }} fontWeight="800" letterSpacing="-0.03em">
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <Badge
                    bg="rgba(239, 68, 68, 0.15)"
                    color="#ef4444"
                    border="1px solid rgba(239, 68, 68, 0.3)"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="0.8rem"
                    fontWeight="700"
                  >
                    {unreadCount} New
                  </Badge>
                )}
              </HStack>
              <Text color="var(--color-text-muted)" fontSize="0.95rem" mt={1}>
                Stay updated with messages, proposal status changes, and activity updates across Xanatz.
              </Text>
            </Box>

            <HStack spacing={3} w={{ base: "100%", md: "auto" }} justify="flex-end">
              {unreadCount > 0 && (
                <Button
                  leftIcon={<CheckCheck size={16} />}
                  onClick={handleMarkAllRead}
                  variant="outline"
                  borderColor="var(--color-card-border)"
                  color="var(--color-text-primary)"
                  _hover={{ bg: "rgba(59, 130, 246, 0.1)", borderColor: "#3b82f6" }}
                  size="sm"
                  borderRadius="xl"
                >
                  Mark all read
                </Button>
              )}
              <Button
                leftIcon={<RefreshCw size={15} className={refreshing ? "spin" : ""} />}
                onClick={() => fetchNotifications(true)}
                isLoading={refreshing}
                variant="ghost"
                color="var(--color-text-muted)"
                _hover={{ color: "var(--color-text-primary)", bg: "var(--color-card-border)" }}
                size="sm"
                borderRadius="xl"
              >
                Refresh
              </Button>
            </HStack>
          </Flex>
        </MotionBox>

        {/* Filter Controls Bar */}
        <MotionBox
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          bg="var(--color-dropdown-bg)"
          backdropFilter="blur(20px)"
          border="1px solid var(--color-card-border)"
          borderRadius="2xl"
          p={4}
          mb={6}
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.2)"
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align="center"
            gap={4}
          >
            {/* Filter Tabs */}
            <HStack bg="rgba(0,0,0,0.2)" p={1} borderRadius="xl" border="1px solid var(--color-card-border)" w={{ base: "100%", sm: "auto" }}>
              {[
                { id: "all", label: "All", count: notifications.length },
                { id: "unread", label: "Unread", count: unreadCount },
                { id: "read", label: "Read", count: notifications.length - unreadCount },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  size="sm"
                  variant="ghost"
                  flex={{ base: 1, sm: "none" }}
                  borderRadius="lg"
                  bg={filterTab === tab.id ? "var(--color-card-border)" : "transparent"}
                  color={filterTab === tab.id ? "var(--color-text-primary)" : "var(--color-text-muted)"}
                  fontWeight={filterTab === tab.id ? "700" : "500"}
                  fontSize="0.85rem"
                  _hover={{ bg: "var(--color-card-border)", color: "var(--color-text-primary)" }}
                  transition="all 0.2s"
                >
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </HStack>

            {/* Search Input */}
            <Box position="relative" w={{ base: "100%", sm: "300px" }}>
              <Input
                placeholder="Filter notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="rgba(0,0,0,0.15)"
                border="1px solid var(--color-card-border)"
                borderRadius="xl"
                pl="36px"
                size="sm"
                _focus={{ borderColor: "#3b82f6", boxShadow: "0 0 0 1px #3b82f6" }}
                fontSize="0.85rem"
                color="var(--color-text-primary)"
              />
              <Box
                position="absolute"
                left="12px"
                top="50%"
                transform="translateY(-50%)"
                pointerEvents="none"
                color="var(--color-text-muted)"
              >
                <Search size={15} />
              </Box>
            </Box>
          </Flex>
        </MotionBox>

        {/* Notifications Content Area */}
        {loading ? (
          <Flex justify="center" align="center" py={16}>
            <VStack spacing={4}>
              <Spinner size="lg" color="#3b82f6" thickness="3px" />
              <Text color="var(--color-text-muted)" fontSize="0.9rem">
                Loading notifications...
              </Text>
            </VStack>
          </Flex>
        ) : filteredNotifications.length === 0 ? (
          <MotionBox
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            bg="var(--color-dropdown-bg)"
            border="1px solid var(--color-card-border)"
            borderRadius="2xl"
            p={12}
            textAlign="center"
          >
            <VStack spacing={4} maxW="400px" mx="auto">
              <Box
                p={4}
                borderRadius="full"
                bg="rgba(59, 130, 246, 0.1)"
                color="#3b82f6"
              >
                <Bell size={36} />
              </Box>
              <Text fontSize="1.2rem" fontWeight="700">
                {searchQuery || filterTab !== "all"
                  ? "No matching notifications"
                  : "All caught up!"}
              </Text>
              <Text fontSize="0.88rem" color="var(--color-text-muted)">
                {searchQuery || filterTab !== "all"
                  ? "Try resetting your search query or filter tab."
                  : "You don't have any notifications right now. Check back later for updates."}
              </Text>
              {(searchQuery || filterTab !== "all") && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterTab("all");
                  }}
                  variant="outline"
                  borderColor="var(--color-card-border)"
                  mt={2}
                  borderRadius="xl"
                >
                  Clear Filters
                </Button>
              )}
            </VStack>
          </MotionBox>
        ) : (
          <VStack spacing={3} align="stretch">
            <AnimatePresence>
              {filteredNotifications.map((notif, index) => (
                <MotionBox
                  key={notif.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  bg={notif.is_read ? "var(--color-card-bg)" : "rgba(59, 130, 246, 0.07)"}
                  border="1px solid"
                  borderColor={notif.is_read ? "var(--color-card-border)" : "rgba(59, 130, 246, 0.3)"}
                  borderRadius="2xl"
                  p={{ base: 4, md: 5 }}
                  cursor={notif.target_url ? "pointer" : "default"}
                  onClick={() => handleNotificationClick(notif)}
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    borderColor: notif.is_read ? "rgba(255,255,255,0.2)" : "#3b82f6",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                    transform: "translateY(-1px)",
                    transition: "all 0.25s ease",
                  }}
                >
                  {/* Left edge unread indicator bar */}
                  {!notif.is_read && (
                    <Box
                      position="absolute"
                      left={0}
                      top={0}
                      bottom={0}
                      w="4px"
                      bg="linear-gradient(180deg, #3b82f6, #8b5cf6)"
                    />
                  )}

                  <Flex justify="space-between" align="flex-start" gap={4}>
                    <HStack spacing={4} align="flex-start" flex={1}>
                      {/* Avatar or Icon */}
                      <Box flexShrink={0} mt={1}>
                        {notif.sender_profile_picture ? (
                          <img
                            src={getImageUrl(notif.sender_profile_picture)}
                            alt="Sender"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              objectFit: "cover",
                              border: "1px solid var(--color-card-border)",
                            }}
                          />
                        ) : (
                          <Flex
                            w="40px"
                            h="40px"
                            borderRadius="12px"
                            align="center"
                            justify="center"
                            bg={notif.is_read ? "rgba(255,255,255,0.05)" : "rgba(59, 130, 246, 0.15)"}
                            color={notif.is_read ? "var(--color-text-muted)" : "#3b82f6"}
                            border="1px solid"
                            borderColor={notif.is_read ? "var(--color-card-border)" : "rgba(59, 130, 246, 0.3)"}
                          >
                            <Bell size={18} />
                          </Flex>
                        )}
                      </Box>

                      {/* Notification Message & Meta */}
                      <Box flex={1}>
                        <Flex align="center" gap={2} flexWrap="wrap" mb={1}>
                          {notif.sender_name && (
                            <Text fontSize="0.88rem" fontWeight="700" color="var(--color-text-primary)">
                              {notif.sender_name}
                            </Text>
                          )}
                          {!notif.is_read && (
                            <Badge
                              bg="#3b82f6"
                              color="white"
                              fontSize="0.65rem"
                              px={2}
                              py={0.5}
                              borderRadius="full"
                              fontWeight="bold"
                            >
                              NEW
                            </Badge>
                          )}
                        </Flex>

                        <Text
                          fontSize="0.92rem"
                          color={notif.is_read ? "var(--color-text-secondary)" : "var(--color-text-primary)"}
                          lineHeight="1.5"
                          fontWeight={notif.is_read ? "400" : "500"}
                        >
                          {notif.message}
                        </Text>

                        <HStack spacing={4} mt={3} color="var(--color-text-muted)" fontSize="0.75rem">
                          <HStack spacing={1}>
                            <Clock size={12} />
                            <Text>{formatDate(notif.created_at)}</Text>
                          </HStack>
                          {notif.target_url && (
                            <HStack spacing={1} color="#3b82f6" fontWeight="600">
                              <Text>Click to view</Text>
                              <ExternalLink size={12} />
                            </HStack>
                          )}
                        </HStack>
                      </Box>
                    </HStack>

                    {/* Right Action Buttons */}
                    <HStack spacing={2} flexShrink={0} align="center">
                      {notif.sender && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleNavigateToChat(notif, e)}
                          color="#3b82f6"
                          bg="rgba(59, 130, 246, 0.1)"
                          _hover={{ bg: "rgba(59, 130, 246, 0.25)" }}
                          borderRadius="xl"
                          p={2}
                          title="Chat with user"
                        >
                          <MessageSquare size={16} />
                        </Button>
                      )}

                      {!notif.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          isLoading={actionLoadingId === notif.id}
                          color="var(--color-text-muted)"
                          _hover={{ color: "#48C774", bg: "rgba(72, 199, 116, 0.1)" }}
                          borderRadius="xl"
                          p={2}
                          title="Mark as read"
                        >
                          <CheckCircle2 size={16} />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        isLoading={actionLoadingId === notif.id}
                        color="var(--color-text-muted)"
                        _hover={{ color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" }}
                        borderRadius="xl"
                        p={2}
                        title="Delete notification"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </HStack>
                  </Flex>
                </MotionBox>
              ))}
            </AnimatePresence>
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default NotificationsPage;
