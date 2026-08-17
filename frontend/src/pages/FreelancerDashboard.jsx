import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  Flex,
  Text,
  Spinner,
  Button,
  HStack,
  Badge,
  Heading,
  Input,
  Textarea,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import api, { backendUrl } from "../api";
import { useNavigate } from "react-router-dom";
import CompleteProfileModal, { getProfileCompletionDetails } from "../components/Profile/CompleteProfileModal";
import {
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Briefcase,
  DollarSign,
  ArrowLeft,
  Image as ImageIcon,
  Star,
  FileText,
  MessageSquare,
  TrendingUp,
  UserCheck,
  FolderGit2,
  LayoutDashboard,
  Settings,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const MotionBox = motion.create(Box);

const FreelancerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | portfolio | proposals | reviews | settings

  const [savingSettings, setSavingSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stats & Feeds
  const [rfpInterests, setRfpInterests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    hourly_rate: "",
    freelancer_currency: "AED",
    freelancer_availability: "available",
    headline: "",
    about: "",
    skillsString: "",
  });

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    id: null,
    title: "",
    description: "",
    project_url: "",
    technologies: "",
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const response = await api.get("me/");
      const userData = response.data;
      setUser(userData);
      const profile = userData.profile || {};

      setSettingsForm({
        hourly_rate: profile.hourly_rate || "",
        freelancer_currency: profile.freelancer_currency || "AED",
        freelancer_availability: profile.freelancer_availability || "available",
        headline: profile.headline || "",
        about: profile.about || "",
        skillsString: (profile.skills || []).join(", "),
      });

      // Fetch RFP Interests and Freelancer Reviews for dashboard analytics
      fetchFeeds(userData.id);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeds = async (userId) => {
    setLoadingFeeds(true);
    try {
      const [interestsRes, reviewsRes] = await Promise.allSettled([
        api.get("rfp-interests/"),
        api.get(`freelancer-reviews/?freelancer_id=${userId}`),
      ]);

      if (interestsRes.status === "fulfilled") {
        setRfpInterests(interestsRes.value.data || []);
      }
      if (reviewsRes.status === "fulfilled") {
        setReviews(reviewsRes.value.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch feeds", err);
    } finally {
      setLoadingFeeds(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleCopyLink = () => {
    if (!user?.profile?.public_id) return;
    const publicLink = `${window.location.origin}/p/${user.profile.public_id}`;
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvailabilityChange = async (newAvailability) => {
    try {
      const response = await api.patch("me/", { freelancer_availability: newAvailability });
      setUser(response.data);
      setSettingsForm((prev) => ({ ...prev, freelancer_availability: newAvailability }));
    } catch (err) {
      console.error("Failed to update availability status", err);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      const skillsArray = settingsForm.skillsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        hourly_rate: settingsForm.hourly_rate || null,
        freelancer_currency: settingsForm.freelancer_currency,
        freelancer_availability: settingsForm.freelancer_availability,
        headline: settingsForm.headline,
        about: settingsForm.about,
        skills: skillsArray,
      };

      const response = await api.patch("me/", payload);
      setUser(response.data);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenProjectModal = (project = null) => {
    if (project) {
      setProjectForm({
        id: project.id,
        title: project.title,
        description: project.description || "",
        project_url: project.project_url || "",
        technologies: (project.technologies || []).join(", "),
      });
    } else {
      setProjectForm({
        id: null,
        title: "",
        description: "",
        project_url: "",
        technologies: "",
      });
    }
    setSelectedFile(null);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title.trim()) return;
    setSavingProject(true);
    try {
      const techArray = projectForm.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const formData = new FormData();
      formData.append("title", projectForm.title);
      formData.append("description", projectForm.description);
      formData.append("project_url", projectForm.project_url);
      formData.append("technologies", JSON.stringify(techArray));
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (projectForm.id) {
        await api.patch(`portfolio-projects/${projectForm.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("portfolio-projects/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsProjectModalOpen(false);
      fetchProfile();
    } catch (err) {
      console.error("Failed to save project", err);
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setDeletingProjectId(projectId);
    try {
      await api.delete(`portfolio-projects/${projectId}/`);
      fetchProfile();
    } catch (err) {
      console.error("Failed to delete project", err);
    } finally {
      setDeletingProjectId(null);
    }
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary, #07090e)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="var(--color-accent-purple, #8b5cf6)" />
          <Text color="whiteAlpha.700" fontWeight="medium" letterSpacing="wide" fontSize="xs">
            LOADING FREELANCER DASHBOARD...
          </Text>
        </VStack>
      </Flex>
    );
  }

  const publicLink = user?.profile?.public_id
    ? `${window.location.origin}/p/${user.profile.public_id}`
    : "";

  const projectsCount = user?.profile?.projects?.length || 0;
  const ratingAvg = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "New";

  // Calculate unified profile completion score
  const { items: completionItems, completedCount, pct: completionPct } = getProfileCompletionDetails(user);

  return (
    <Box minH="100vh" bg="var(--color-primary, #07090e)" color="white" overflow="hidden" pb="60px">
      <Navbar handleLogout={handleLogout} />

      <Container maxW="1280px" mt="90px" px={{ base: 4, md: 6 }}>
        {/* ── Top Header Navigation & Badge ─────────────────────────────── */}
        <HStack mb={6} justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Button
            size="sm"
            variant="ghost"
            color="var(--color-text-secondary, rgba(255,255,255,0.7))"
            onClick={() => navigate("/profile")}
            leftIcon={<ArrowLeft size={16} />}
            _hover={{ color: "white", bg: "whiteAlpha.100" }}
          >
            Back to Profile
          </Button>

          <HStack gap={2}>
            <Badge
              fontSize="10px"
              fontWeight="black"
              letterSpacing="widest"
              px={3.5}
              py={1.5}
              borderRadius="full"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
              }}
            >
              FREELANCER HUB
            </Badge>
          </HStack>
        </HStack>

        {/* ── Hero Profile & Availability Banner ────────────────────────────── */}
        <Box
          p={{ base: 5, md: 7 }}
          borderRadius="2xl"
          mb={6}
          position="relative"
          overflow="hidden"
          style={{
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(59, 130, 246, 0.12))",
            border: "1px solid rgba(124, 58, 237, 0.3)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
          }}
        >
          <Box
            position="absolute"
            top="-60px" right="-60px"
            w="240px" h="240px"
            borderRadius="full"
            pointerEvents="none"
            style={{ background: "radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)" }}
          />

          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={6}>
            <HStack gap={5} align="center">
              {/* User Avatar / Initials */}
              <Box
                w="64px" h="64px"
                borderRadius="xl"
                overflow="hidden"
                flexShrink={0}
                border="2px solid rgba(255,255,255,0.15)"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                display="flex" alignItems="center" justifyContent="center"
              >
                {user?.profile?.profile_picture ? (
                  <img src={`${backendUrl}${user.profile.profile_picture}`} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Text fontSize="2xl" fontWeight="black" color="white">
                    {(user?.first_name || user?.email || "F")[0].toUpperCase()}
                  </Text>
                )}
              </Box>

              <VStack align="start" gap={1}>
                <HStack gap={3} flexWrap="wrap">
                  <Heading size="md" color="white" fontWeight="900" letterSpacing="tight">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.email}
                  </Heading>
                </HStack>

                <Text color="#c4b5fd" fontSize="xs" fontWeight="600">
                  {user?.profile?.headline || "Freelancer Specialist"}
                </Text>

                {/* Availability Pills Selector */}
                <HStack gap={2} mt={1} flexWrap="wrap">
                  <Text fontSize="10px" color="rgba(255,255,255,0.4)" fontWeight="700">AVAILABILITY:</Text>
                  {[
                    { key: "available", label: "Available", color: "#10b981", bg: "rgba(16,185,129,0.2)", border: "rgba(16,185,129,0.4)" },
                    { key: "busy", label: "Busy", color: "#f59e0b", bg: "rgba(245,158,11,0.2)", border: "rgba(245,158,11,0.4)" },
                    { key: "unavailable", label: "Unavailable", color: "#ef4444", bg: "rgba(239,68,68,0.2)", border: "rgba(239,68,68,0.4)" },
                  ].map((opt) => {
                    const isSelected = (user?.profile?.freelancer_availability || "available") === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleAvailabilityChange(opt.key)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: isSelected ? 800 : 600,
                          cursor: "pointer",
                          border: isSelected ? `1px solid ${opt.border}` : "1px solid rgba(255,255,255,0.08)",
                          background: isSelected ? opt.bg : "rgba(0,0,0,0.2)",
                          color: isSelected ? "white" : "rgba(255,255,255,0.5)",
                          transition: "all 0.2s",
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: opt.color, boxShadow: isSelected ? `0 0 6px ${opt.color}` : "none" }} />
                        {opt.label}
                      </button>
                    );
                  })}
                </HStack>
              </VStack>
            </HStack>

            {/* Quick Actions & Landing Page Link */}
            <HStack gap={3} flexWrap="wrap" w={{ base: "full", md: "auto" }}>
              <Button
                size="sm"
                onClick={handleCopyLink}
                bg="rgba(255,255,255,0.06)"
                color="white"
                border="1px solid rgba(255,255,255,0.12)"
                _hover={{ bg: "rgba(255,255,255,0.12)" }}
                borderRadius="lg"
                fontSize="xs"
              >
                {copied ? <Check size={14} color="#34d399" style={{ marginRight: 6 }} /> : <Copy size={14} style={{ marginRight: 6 }} />}
                {copied ? "Copied Link!" : "Copy Profile Link"}
              </Button>

              {user?.profile?.public_id && (
                <Button
                  size="sm"
                  borderRadius="lg"
                  fontSize="xs"
                  fontWeight="bold"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                    color: "white",
                    boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
                  }}
                  onClick={() => window.open(`/p/${user.profile.public_id}`, "_blank")}
                >
                  Public Profile <ExternalLink size={13} style={{ marginLeft: 6 }} />
                </Button>
              )}
            </HStack>
          </Flex>
        </Box>

        {/* ── Key Metrics Analytics Bar ──────────────────────────────────────── */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
          gap={4}
          mb={8}
        >
          {/* Stat 1: Client Rating */}
          <Box p={5} borderRadius="xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
            <Flex justify="space-between" align="start" mb={2}>
              <Text fontSize="2xs" color="rgba(255,255,255,0.4)" fontWeight="800" letterSpacing="wider">CLIENT RATING</Text>
              <Box p={1.5} borderRadius="md" bg="rgba(245,158,11,0.15)">
                <Star size={14} color="#f59e0b" style={{ fill: "#f59e0b" }} />
              </Box>
            </Flex>
            <Heading size="lg" color="white" fontWeight="900" mb={1}>{ratingAvg}</Heading>
            <Text fontSize="11px" color="rgba(255,255,255,0.45)">
              {reviews.length} client review{reviews.length !== 1 ? "s" : ""}
            </Text>
          </Box>

          {/* Stat 2: Active Portfolio */}
          <Box p={5} borderRadius="xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
            <Flex justify="space-between" align="start" mb={2}>
              <Text fontSize="2xs" color="rgba(255,255,255,0.4)" fontWeight="800" letterSpacing="wider">PORTFOLIO PROJECTS</Text>
              <Box p={1.5} borderRadius="md" bg="rgba(124,58,237,0.15)">
                <FolderGit2 size={14} color="#a78bfa" />
              </Box>
            </Flex>
            <Heading size="lg" color="white" fontWeight="900" mb={1}>{projectsCount}</Heading>
            <Text fontSize="11px" color="#c4b5fd" cursor="pointer" onClick={() => handleOpenProjectModal(null)}>
              + Add new project
            </Text>
          </Box>

          {/* Stat 3: RFP Bids Submitted */}
          <Box p={5} borderRadius="xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
            <Flex justify="space-between" align="start" mb={2}>
              <Text fontSize="2xs" color="rgba(255,255,255,0.4)" fontWeight="800" letterSpacing="wider">RFP BIDS SUBMITTED</Text>
              <Box p={1.5} borderRadius="md" bg="rgba(59,130,246,0.15)">
                <FileText size={14} color="#60a5fa" />
              </Box>
            </Flex>
            <Heading size="lg" color="white" fontWeight="900" mb={1}>{rfpInterests.length}</Heading>
            <Text fontSize="11px" color="#93c5fd" cursor="pointer" onClick={() => navigate("/rfps")}>
              Browse new RFPs →
            </Text>
          </Box>

          {/* Stat 4: Hourly Rate & Potential */}
          <Box p={5} borderRadius="xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
            <Flex justify="space-between" align="start" mb={2}>
              <Text fontSize="2xs" color="rgba(255,255,255,0.4)" fontWeight="800" letterSpacing="wider">HOURLY RATE</Text>
              <Box p={1.5} borderRadius="md" bg="rgba(16,185,129,0.15)">
                <DollarSign size={14} color="#34d399" />
              </Box>
            </Flex>
            <Heading size="lg" color="#6ee7b7" fontWeight="900" mb={1}>
              {user?.profile?.hourly_rate ? `AED ${user.profile.hourly_rate} / hr` : "Not set"}
            </Heading>
            <Text fontSize="11px" color="rgba(255,255,255,0.45)">
              {user?.profile?.hourly_rate ? `~AED ${(parseFloat(user.profile.hourly_rate) * 120).toLocaleString()} /mo est.` : "Set rate in settings"}
            </Text>
          </Box>
        </Box>

        {/* ── Main Tab Navigation Bar ────────────────────────────────────────── */}
        <Flex
          gap={2} mb={6} borderBottom="1px solid rgba(255,255,255,0.08)" pb={3} overflowX="auto"
        >
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "portfolio", label: `Portfolio (${projectsCount})`, icon: FolderGit2 },
            { id: "proposals", label: `RFP Proposals (${rfpInterests.length})`, icon: FileText },
            { id: "reviews", label: `Client Reviews (${reviews.length})`, icon: Star },
            { id: "settings", label: "Service Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: isActive ? "rgba(124, 58, 237, 0.2)" : "transparent",
                  color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                  border: isActive ? "1px solid rgba(124, 58, 237, 0.4)" : "1px solid transparent",
                  fontSize: 12, fontWeight: isActive ? 800 : 500, transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={14} color={isActive ? "#a78bfa" : "currentColor"} />
                {tab.label}
              </button>
            );
          })}
        </Flex>

        {/* ═════════════════════════════════════════════════════════════════════
           TAB CONTENT PANELS
        ═════════════════════════════════════════════════════════════════════ */}

        {/* ── TAB 1: OVERVIEW ──────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <VStack gap={6} align="stretch">
            {/* Completion Widget */}
            <Box
              p={6} borderRadius="2xl" border="1px solid rgba(124, 58, 237, 0.25)"
              style={{ background: "rgba(124, 58, 237, 0.05)", backdropFilter: "blur(12px)" }}
            >
              <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={3}>
                <HStack gap={2}>
                  <UserCheck size={16} color="#a78bfa" />
                  <Heading size="xs" color="white" fontWeight="800" letterSpacing="wide">
                    FREELANCER PROFILE SETUP — {completionPct}% COMPLETE
                  </Heading>
                </HStack>
                <HStack gap={3}>
                  <Text fontSize="xs" color="#c4b5fd" fontWeight="700">
                    {completedCount} of {completionItems.length} steps completed
                  </Text>
                  <Button
                    size="xs"
                    px={3}
                    py={1.5}
                    borderRadius="lg"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
                      color: "white",
                      boxShadow: "0 2px 10px rgba(124, 58, 237, 0.3)",
                    }}
                    fontWeight="bold"
                    fontSize="10px"
                    onClick={() => setIsCompletionModalOpen(true)}
                    _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.5)" }}
                  >
                    <CheckCircle2 size={11} style={{ marginRight: 4 }} />
                    {completionPct < 100 ? "Complete Profile Now" : "Manage Profile Details"}
                  </Button>
                </HStack>
              </Flex>

              {/* Progress Bar */}
              <Box w="full" h="6px" borderRadius="full" bg="rgba(255,255,255,0.08)" mb={4} overflow="hidden">
                <Box h="100%" w={`${completionPct}%`} bg="linear-gradient(90deg, #7c3aed, #3b82f6, #10b981)" transition="width 0.4s ease" />
              </Box>

              <Flex gap={2.5} flexWrap="wrap">
                {completionItems.map((item, idx) => (
                  <HStack
                    key={idx}
                    px={2.5}
                    py={1}
                    borderRadius="md"
                    bg={item.done ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)"}
                    border={item.done ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(245,158,11,0.3)"}
                    fontSize="11px"
                    color={item.done ? "#6ee7b7" : "#fbbf24"}
                    fontWeight={item.done ? "700" : "600"}
                    cursor="pointer"
                    onClick={() => setIsCompletionModalOpen(true)}
                    _hover={{ bg: item.done ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.18)" }}
                  >
                    <CheckCircle2 size={12} color={item.done ? "#34d399" : "#f59e0b"} />
                    <Text>{item.title || item.label}</Text>
                    <Text fontSize="9px" fontWeight="900" color={item.done ? "#34d399" : "#f59e0b"} ml={1}>
                      • {item.done ? "EDIT" : "COMPLETE"}
                    </Text>
                  </HStack>
                ))}
              </Flex>
            </Box>

            {/* Overview 2-Column Grid */}
            <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Recent Proposals Card */}
              <Box p={6} borderRadius="2xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="xs" color="white" fontWeight="800" letterSpacing="wide">
                    RECENT RFP PROPOSALS
                  </Heading>
                  <Button size="xs" variant="ghost" color="#93c5fd" onClick={() => setActiveTab("proposals")}>
                    View All →
                  </Button>
                </Flex>

                {rfpInterests.length === 0 ? (
                  <VStack py={8} gap={2} textAlign="center">
                    <FileText size={28} color="rgba(255,255,255,0.2)" />
                    <Text fontSize="xs" color="rgba(255,255,255,0.4)">No proposals submitted yet.</Text>
                    <Button size="xs" mt={2} bg="rgba(59,130,246,0.15)" color="#60a5fa" border="1px solid rgba(59,130,246,0.25)" onClick={() => navigate("/rfps")}>
                      Browse RFPs
                    </Button>
                  </VStack>
                ) : (
                  <VStack gap={3} align="stretch">
                    {rfpInterests.slice(0, 3).map((bid) => (
                      <Box key={bid.id} p={3} borderRadius="lg" bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.05)">
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontSize="xs" fontWeight="800" color="white" isTruncated maxW="220px">
                            {bid.rfp_title || `RFP #${bid.rfp || bid.id}`}
                          </Text>
                          <Badge
                            fontSize="9px" fontWeight="bold" px={2} py={0.5} borderRadius="md"
                            bg={bid.status === "accepted" ? "rgba(16,185,129,0.15)" : bid.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)"}
                            color={bid.status === "accepted" ? "#34d399" : bid.status === "rejected" ? "#f87171" : "#fbbf24"}
                            border={bid.status === "accepted" ? "1px solid rgba(16,185,129,0.3)" : bid.status === "rejected" ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(245,158,11,0.3)"}
                          >
                            {(bid.status || "PENDING").toUpperCase()}
                          </Badge>
                        </Flex>
                        {bid.rfp_company_name && (
                          <Text fontSize="10px" color="#93c5fd" mb={1}>
                            Client: {bid.rfp_company_name}
                          </Text>
                        )}
                        <Text fontSize="11px" color="rgba(255,255,255,0.6)" lineClamp={1}>
                          {bid.proposal_summary || bid.message || "Proposal submitted"}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              {/* Client Reviews Feed Snippet */}
              <Box p={6} borderRadius="2xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="xs" color="white" fontWeight="800" letterSpacing="wide">
                    CLIENT REVIEWS & REPUTATION
                  </Heading>
                  <Button size="xs" variant="ghost" color="#c4b5fd" onClick={() => setActiveTab("reviews")}>
                    View All →
                  </Button>
                </Flex>

                {reviews.length === 0 ? (
                  <VStack py={8} gap={2} textAlign="center">
                    <Star size={28} color="rgba(255,255,255,0.2)" />
                    <Text fontSize="xs" color="rgba(255,255,255,0.4)">No client reviews submitted yet.</Text>
                    <Text fontSize="10px" color="rgba(255,255,255,0.3)">Complete RFP bids and contracts to receive verified reviews.</Text>
                  </VStack>
                ) : (
                  <VStack gap={3} align="stretch">
                    {reviews.slice(0, 3).map((rev) => (
                      <Box key={rev.id} p={3} borderRadius="lg" bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.05)">
                        <Flex justify="space-between" align="center" mb={1}>
                          <HStack gap={1}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} color={i < (rev.rating || 5) ? "#f59e0b" : "rgba(255,255,255,0.2)"} style={{ fill: i < (rev.rating || 5) ? "#f59e0b" : "none" }} />
                            ))}
                          </HStack>
                          <Text fontSize="9px" color="rgba(255,255,255,0.35)">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </Text>
                        </Flex>
                        <Text fontSize="11px" color="rgba(255,255,255,0.7)" fontStyle="italic">
                          "{rev.review_text}"
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </Box>
          </VStack>
        )}

        {/* ── TAB 2: PORTFOLIO PROJECTS ────────────────────────────────────── */}
        {activeTab === "portfolio" && (
          <Box p={6} borderRadius="2xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" gap={0}>
                <Heading size="sm" color="white" fontWeight="900">
                  Showcase Portfolio Projects
                </Heading>
                <Text color="rgba(255,255,255,0.4)" fontSize="xs">
                  Display your best work to clients on your public landing page.
                </Text>
              </VStack>

              <Button
                size="sm"
                onClick={() => handleOpenProjectModal(null)}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                  color: "white",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                <Plus size={15} style={{ marginRight: 6 }} /> Add Project
              </Button>
            </Flex>

            {(!user?.profile?.projects || user.profile.projects.length === 0) ? (
              <Flex
                direction="column" align="center" justify="center" py={16}
                border="1px dashed rgba(255,255,255,0.15)" borderRadius="2xl" bg="rgba(0,0,0,0.2)"
              >
                <FolderGit2 size={40} color="#a78bfa" style={{ marginBottom: 12 }} />
                <Text color="white" fontWeight="bold" fontSize="sm" mb={1}>
                  No portfolio projects added yet
                </Text>
                <Text color="rgba(255,255,255,0.4)" fontSize="xs" mb={4}>
                  Add projects to show your technical skills to potential clients.
                </Text>
                <Button size="sm" bg="rgba(124,58,237,0.2)" color="#c4b5fd" border="1px solid rgba(124,58,237,0.4)" onClick={() => handleOpenProjectModal(null)}>
                  + Add First Project
                </Button>
              </Flex>
            ) : (
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={5}>
                {user.profile.projects.map((project) => (
                  <Box
                    key={project.id}
                    p={4} borderRadius="xl" border="1px solid rgba(255,255,255,0.08)"
                    style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)" }}
                    _hover={{ borderColor: "rgba(124,58,237,0.4)", transform: "translateY(-2px)" }}
                    transition="all 0.25s"
                  >
                    {project.image && (
                      <Box h="150px" borderRadius="lg" overflow="hidden" mb={3} border="1px solid rgba(255,255,255,0.1)">
                        <img src={`${backendUrl}${project.image}`} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    )}

                    <Flex justify="space-between" align="start" mb={2}>
                      <Heading size="xs" color="white" fontWeight="800" isTruncated>
                        {project.title}
                      </Heading>
                      <HStack gap={1}>
                        <Button size="xs" variant="ghost" color="rgba(255,255,255,0.5)" _hover={{ color: "#a78bfa" }} onClick={() => handleOpenProjectModal(project)}>
                          <Edit size={12} />
                        </Button>
                        <Button size="xs" variant="ghost" color="rgba(255,255,255,0.5)" _hover={{ color: "#f87171" }} isLoading={deletingProjectId === project.id} onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 size={12} />
                        </Button>
                      </HStack>
                    </Flex>

                    <Text fontSize="xs" color="rgba(255,255,255,0.5)" lineClamp={3} mb={3} minH="45px">
                      {project.description}
                    </Text>

                    {project.project_url && (
                      <a href={project.project_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>
                        Visit Project <ExternalLink size={10} />
                      </a>
                    )}

                    {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                      <Flex wrap="wrap" gap={1.5} pt={2} borderTop="1px solid rgba(255,255,255,0.06)">
                        {project.technologies.map((tech, i) => (
                          <Badge key={i} fontSize="9px" px={1.5} py={0.2} borderRadius="md" bg="rgba(124,58,237,0.12)" color="#c4b5fd" border="1px solid rgba(124,58,237,0.2)">
                            {tech}
                          </Badge>
                        ))}
                      </Flex>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* ── TAB 3: RFP PROPOSALS & BIDS ──────────────────────────────────── */}
        {activeTab === "proposals" && (
          <Box p={6} borderRadius="2xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" gap={0}>
                <Heading size="sm" color="white" fontWeight="900">
                  RFP Proposals & Submitted Bids
                </Heading>
                <Text color="rgba(255,255,255,0.4)" fontSize="xs">
                  Track all project proposals you have submitted to client RFPs.
                </Text>
              </VStack>

              <Button size="sm" onClick={() => navigate("/rfps")} style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "10px", fontSize: "12px", fontWeight: "bold" }}>
                Browse Active RFPs →
              </Button>
            </Flex>

            {loadingFeeds ? (
              <VStack py={12}>
                <Spinner size="md" color="#60a5fa" />
              </VStack>
            ) : rfpInterests.length === 0 ? (
              <VStack py={14} textAlign="center" gap={2}>
                <FileText size={36} color="rgba(255,255,255,0.2)" />
                <Text color="white" fontWeight="bold" fontSize="sm">No RFP proposals submitted yet</Text>
                <Text color="rgba(255,255,255,0.4)" fontSize="xs" maxW="400px">
                  Explore client RFPs to submit project bids, present your proposal, and win freelance contracts.
                </Text>
                <Button size="sm" mt={3} bg="linear-gradient(135deg, #7c3aed, #3b82f6)" color="white" borderRadius="10px" onClick={() => navigate("/rfps")}>
                  Explore Available RFPs
                </Button>
              </VStack>
            ) : (
              <VStack gap={3} align="stretch">
                {rfpInterests.map((bid) => (
                  <Box key={bid.id} p={4} borderRadius="xl" border="1px solid rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.02)">
                    <Flex justify="space-between" align="start" mb={2} flexWrap="wrap" gap={2}>
                      <VStack align="start" gap={0.5}>
                        <HStack gap={2}>
                          {bid.quotation_id && (
                            <Badge fontSize="9px" px={1.5} py={0.2} borderRadius="sm" bg="rgba(255,255,255,0.06)" color="rgba(255,255,255,0.5)" border="1px solid rgba(255,255,255,0.1)">
                              {bid.quotation_id}
                            </Badge>
                          )}
                          <Text fontSize="sm" fontWeight="800" color="white">
                            {bid.rfp_title || `RFP #${bid.rfp || bid.id}`}
                          </Text>
                        </HStack>
                        {bid.rfp_company_name && (
                          <Text fontSize="11px" color="#93c5fd" fontWeight="600">
                            Client Company: {bid.rfp_company_name}
                          </Text>
                        )}
                        <Text fontSize="11px" color="rgba(255,255,255,0.4)">
                          Submitted on {new Date(bid.created_at || Date.now()).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <Badge
                        fontSize="10px" fontWeight="bold" px={2.5} py={0.5} borderRadius="full"
                        bg={bid.status === "accepted" ? "rgba(16,185,129,0.15)" : bid.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)"}
                        color={bid.status === "accepted" ? "#34d399" : bid.status === "rejected" ? "#f87171" : "#fbbf24"}
                        border={bid.status === "accepted" ? "1px solid rgba(16,185,129,0.3)" : bid.status === "rejected" ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(245,158,11,0.3)"}
                      >
                        {(bid.status || "PENDING").toUpperCase()}
                      </Badge>
                    </Flex>

                    {(bid.proposal_summary || bid.message) && (
                      <Text fontSize="xs" color="rgba(255,255,255,0.8)" mb={3} lineHeight="1.6" bg="rgba(0,0,0,0.2)" p={3} borderRadius="lg" border="1px solid rgba(255,255,255,0.05)">
                        "{bid.proposal_summary || bid.message}"
                      </Text>
                    )}

                    <HStack justify="space-between" fontSize="11px" color="rgba(255,255,255,0.4)">
                      <Text>Pitch Status: <span style={{ color: bid.status === "accepted" ? "#34d399" : "#fbbf24", fontWeight: 700 }}>{bid.status || "pending"}</span></Text>
                      {bid.rfp && (
                        <Button size="xs" variant="link" color="#60a5fa" onClick={() => navigate(`/rfps/${bid.rfp}`)}>
                          View RFP Detail →
                        </Button>
                      )}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        )}

        {/* ── TAB 4: CLIENT REVIEWS ────────────────────────────────────────── */}
        {activeTab === "reviews" && (
          <Box p={6} borderRadius="2xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" gap={0}>
                <Heading size="sm" color="white" fontWeight="900">
                  Verified Client Reviews
                </Heading>
                <Text color="rgba(255,255,255,0.4)" fontSize="xs">
                  Reviews and feedback submitted by clients who worked with you.
                </Text>
              </VStack>

              <Badge fontSize="11px" px={3} py={1} borderRadius="full" bg="rgba(245,158,11,0.15)" color="#fbbf24" border="1px solid rgba(245,158,11,0.3)">
                ★ {ratingAvg} Rating ({reviews.length})
              </Badge>
            </Flex>

            {reviews.length === 0 ? (
              <VStack py={14} textAlign="center" gap={2}>
                <Star size={36} color="rgba(255,255,255,0.2)" />
                <Text color="white" fontWeight="bold" fontSize="sm">No client reviews yet</Text>
                <Text color="rgba(255,255,255,0.4)" fontSize="xs" maxW="400px">
                  Once clients complete projects with you and submit reviews, they will display here and on your public landing page.
                </Text>
              </VStack>
            ) : (
              <VStack gap={4} align="stretch">
                {reviews.map((rev) => (
                  <Box key={rev.id} p={5} borderRadius="xl" border="1px solid rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.02)">
                    <Flex justify="space-between" align="center" mb={2}>
                      <HStack gap={1}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} color={i < (rev.rating || 5) ? "#f59e0b" : "rgba(255,255,255,0.2)"} style={{ fill: i < (rev.rating || 5) ? "#f59e0b" : "none" }} />
                        ))}
                        <Text fontSize="xs" fontWeight="bold" color="white" ml={2}>
                          {rev.rating || 5}.0 / 5.0
                        </Text>
                      </HStack>
                      <Text fontSize="11px" color="rgba(255,255,255,0.4)">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </Text>
                    </Flex>

                    <Text fontSize="xs" color="rgba(255,255,255,0.8)" lineHeight="1.6" mb={2}>
                      "{rev.review_text}"
                    </Text>

                    <Text fontSize="10px" color="#c4b5fd" fontWeight="700">
                      Verified Client Review
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        )}

        {/* ── TAB 5: SERVICE & PROFILE SETTINGS ────────────────────────────── */}
        {activeTab === "settings" && (
          <Box p={6} borderRadius="2xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}>
            <Heading size="xs" color="white" fontWeight="900" letterSpacing="wider" mb={6}>
              FREELANCER SERVICE & PROFILE SETTINGS
            </Heading>

            <form onSubmit={handleSaveSettings}>
              <VStack gap={5} align="stretch">
                <Flex gap={4} direction={{ base: "column", md: "row" }}>
                  <Box flex={1}>
                    <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                      HOURLY RATE
                    </Text>
                    <Input
                      type="number"
                      placeholder="e.g. 75"
                      value={settingsForm.hourly_rate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hourly_rate: e.target.value })}
                      bg="rgba(0, 0, 0, 0.3)"
                      border="1px solid rgba(255,255,255,0.1)"
                      color="white"
                      _focus={{ borderColor: "#8b5cf6" }}
                    />
                  </Box>
                  <Box w={{ base: "full", md: "140px" }}>
                    <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                      CURRENCY
                    </Text>
                    <Box
                      as="select"
                      value={settingsForm.freelancer_currency}
                      onChange={(e) => setSettingsForm({ ...settingsForm, freelancer_currency: e.target.value })}
                      bg="rgba(0, 0, 0, 0.3)"
                      border="1px solid rgba(255,255,255,0.1)"
                      color="white"
                      h="10" px="3" borderRadius="md" w="100%" outline="none" cursor="pointer"
                      style={{ background: "#0a0f1e" }}
                    >
                      <option value="AED" style={{ background: "#0a0f1e", color: "white" }}>AED (Dhs)</option>
                      <option value="USD" style={{ background: "#0a0f1e", color: "white" }}>USD ($)</option>
                      <option value="INR" style={{ background: "#0a0f1e", color: "white" }}>INR (₹)</option>
                      <option value="EUR" style={{ background: "#0a0f1e", color: "white" }}>EUR (€)</option>
                      <option value="GBP" style={{ background: "#0a0f1e", color: "white" }}>GBP (£)</option>
                    </Box>
                  </Box>
                </Flex>

                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                    AVAILABILITY STATUS
                  </Text>
                  <Box
                    as="select"
                    value={settingsForm.freelancer_availability}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freelancer_availability: e.target.value })}
                    bg="rgba(0, 0, 0, 0.3)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    h="10" px="3" borderRadius="md" w="100%" outline="none" cursor="pointer"
                    style={{ background: "#0a0f1e" }}
                  >
                    <option value="available" style={{ background: "#0a0f1e", color: "white" }}>Available for Hire (Green)</option>
                    <option value="busy" style={{ background: "#0a0f1e", color: "white" }}>Busy / Fully Booked (Orange)</option>
                    <option value="unavailable" style={{ background: "#0a0f1e", color: "white" }}>Not Available (Red)</option>
                  </Box>
                </Box>

                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                    FREELANCER HEADLINE / TITLE
                  </Text>
                  <Input
                    placeholder="Ex: Senior Full Stack Developer & UI/UX Designer"
                    value={settingsForm.headline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, headline: e.target.value })}
                    bg="rgba(0, 0, 0, 0.3)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    _focus={{ borderColor: "#8b5cf6" }}
                  />
                </Box>

                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                    SKILLS & SERVICES (COMMA SEPARATED)
                  </Text>
                  <Input
                    placeholder="React, Node.js, UI/UX, Python, GraphQL"
                    value={settingsForm.skillsString}
                    onChange={(e) => setSettingsForm({ ...settingsForm, skillsString: e.target.value })}
                    bg="rgba(0, 0, 0, 0.3)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    _focus={{ borderColor: "#8b5cf6" }}
                  />
                </Box>

                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                    ABOUT / FREELANCER SUMMARY
                  </Text>
                  <Textarea
                    placeholder="Describe your expertise, experience, industries served, and what you deliver for clients..."
                    value={settingsForm.about}
                    onChange={(e) => setSettingsForm({ ...settingsForm, about: e.target.value })}
                    minH="130px"
                    bg="rgba(0, 0, 0, 0.3)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    _focus={{ borderColor: "#8b5cf6" }}
                  />
                </Box>

                <Button
                  type="submit"
                  w="full"
                  h="11"
                  borderRadius="xl"
                  fontWeight="900"
                  fontSize="xs"
                  letterSpacing="widest"
                  color="white"
                  isLoading={savingSettings}
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
                    boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
                  }}
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 25px rgba(124, 58, 237, 0.5)",
                  }}
                >
                  SAVE FREELANCER SETTINGS
                </Button>
              </VStack>
            </form>
          </Box>
        )}
      </Container>

      {/* ── PROJECT MODAL DIALOG ────────────────────────────────────────────── */}
      <Dialog open={isProjectModalOpen} onOpenChange={(e) => setIsProjectModalOpen(e.open)} size="md">
        <DialogBackdrop bg="blackAlpha.900" backdropFilter="blur(12px)" zIndex={99999} />
        <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
          <DialogContent
            bg="#0a0f1e"
            border="1px solid rgba(255,255,255,0.15)"
            borderRadius="2xl"
            maxW="560px"
            m="auto"
            overflow="hidden"
            style={{ backdropFilter: "blur(24px)" }}
          >
            <DialogHeader color="white" py={6} px={8} borderBottom="1px solid rgba(255,255,255,0.08)">
              <Heading size="sm" fontWeight="900" color="white">
                {projectForm.id ? "Edit Portfolio Project" : "Add Portfolio Project"}
              </Heading>
            </DialogHeader>
            <DialogCloseTrigger color="whiteAlpha.600" top={6} right={6} />

            <DialogBody p={8}>
              <VStack gap={5} align="stretch">
                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                    PROJECT TITLE <span style={{ color: "#ef4444" }}>*</span>
                  </Text>
                  <Input
                    placeholder="Ex: SaaS Analytics Dashboard"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    bg="rgba(0,0,0,0.3)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    _focus={{ borderColor: "#8b5cf6" }}
                  />
                </Box>

                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                    DESCRIPTION
                  </Text>
                  <Textarea
                    placeholder="Describe the project, client challenge, solution built, and tech stack used..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    minH="100px"
                    bg="rgba(0,0,0,0.3)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    _focus={{ borderColor: "#8b5cf6" }}
                  />
                </Box>

                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                    PROJECT LIVE URL / GITHUB
                  </Text>
                  <Input
                    placeholder="Ex: https://myportfolio.com or https://github.com/..."
                    value={projectForm.project_url}
                    onChange={(e) => setProjectForm({ ...projectForm, project_url: e.target.value })}
                    bg="rgba(0,0,0,0.3)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    _focus={{ borderColor: "#8b5cf6" }}
                  />
                </Box>

                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                    TECHNOLOGIES USED (COMMA SEPARATED)
                  </Text>
                  <Input
                    placeholder="React, TypeScript, Tailwind CSS, Python"
                    value={projectForm.technologies}
                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                    bg="rgba(0,0,0,0.3)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    _focus={{ borderColor: "#8b5cf6" }}
                  />
                </Box>

                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2}>
                    PROJECT COVER IMAGE
                  </Text>
                  <HStack gap={4}>
                    <Button
                      as="label"
                      htmlFor="project-image-upload"
                      size="sm"
                      bg="rgba(255,255,255,0.08)"
                      border="1px solid rgba(255,255,255,0.15)"
                      color="white"
                      cursor="pointer"
                      _hover={{ bg: "rgba(255,255,255,0.15)" }}
                    >
                      <ImageIcon size={15} style={{ marginRight: 6 }} /> Choose Image
                      <input
                        id="project-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ display: "none" }}
                      />
                    </Button>
                    <Text fontSize="xs" color="rgba(255,255,255,0.4)" isTruncated maxW="280px">
                      {selectedFile ? selectedFile.name : "No image selected"}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </DialogBody>

            <DialogFooter p={8} bg="rgba(0,0,0,0.2)" borderTop="1px solid rgba(255,255,255,0.08)">
              <Button
                variant="ghost"
                color="rgba(255,255,255,0.6)"
                onClick={() => setIsProjectModalOpen(false)}
                _hover={{ bg: "rgba(255,255,255,0.08)" }}
                mr={3}
              >
                Cancel
              </Button>
              <Button
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "white" }}
                isLoading={savingProject}
                onClick={handleSaveProject}
                fontWeight="bold"
                px={6}
              >
                {projectForm.id ? "Update Project" : "Add Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </Dialog>

      <CompleteProfileModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        user={user}
        onProfileUpdated={fetchProfile}
      />
    </Box>
  );
};

export default FreelancerDashboard;
