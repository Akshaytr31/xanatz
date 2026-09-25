import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, Heading, Input, Circle, SimpleGrid
} from "@chakra-ui/react";
import {
  FileText, Search, Clock, DollarSign, Calendar, Building2, ChevronRight, AlertCircle,
  TrendingUp, User as UserIcon, Briefcase, Award, Info, MapPin, Users, CheckCircle2,
  Share2, Flag, LayoutGrid, List, SlidersHorizontal, Zap, Globe, ShieldCheck, ArrowUpRight, Sparkles, X as XIcon, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import RFPInterestModal from "../components/company/RFPInterestModal";
import RFPFilterSidebar from "../components/RFPFilterSidebar";
import FlagConfirmationModal from "../components/FlagConfirmationModal";
import ShareModal from "../components/ShareModal";
import { ALL_CATEGORY_LABELS, ALL_SUBCATEGORY_LABELS, CATEGORY_OPTIONS } from "../components/company/JobOpeningModal";
import api, { backendUrl } from "../api";
import { formatDate } from "../utils/dateUtils";

const MotionBox = motion.create(Box);

const getDeadlineStatus = (deadlineStr) => {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "EXPIRED", bg: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "rgba(239, 68, 68, 0.3)" };
  } else if (diffDays === 0) {
    return { text: "DUE TODAY", bg: "rgba(245, 158, 11, 0.18)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.4)" };
  } else if (diffDays <= 3) {
    return { text: `${diffDays} DAYS LEFT`, bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
  } else {
    return { text: `${diffDays} DAYS LEFT`, bg: "rgba(16, 185, 129, 0.12)", color: "#34d399", border: "rgba(16, 185, 129, 0.25)" };
  }
};

const FilterChip = ({ label, onRemove, accentColor = "#8b5cf6" }) => (
  <HStack
    gap={1.5} px={3} py={1} borderRadius="full"
    border={`1px solid ${accentColor}44`}
    style={{ background: `${accentColor}18` }}
    fontSize="11px" fontWeight="bold" color="#c4b5fd"
  >
    <Text>{label}</Text>
    <Box
      as="button" onClick={onRemove}
      display="flex" alignItems="center"
      _hover={{ color: "white" }} transition="color 0.15s"
    >
      <XIcon size={12} />
    </Box>
  </HStack>
);

const RFPsPage = () => {
  const accentColor = "#8b5cf6"; // Purple accent for RFPs
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramRfpId } = useParams();

  const [rfps, setRfps] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");
  const [selectedDatePosted, setSelectedDatePosted] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [expandedRfps, setExpandedRfps] = useState({});
  const [myInterests, setMyInterests] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "stream"
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedBudget("");
    setSelectedOwner("");
    setSelectedDatePosted("");
    setSearchQuery("");
    setSelectedSort("newest");
  };

  // Modal Control
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [isInterestOpen, setIsInterestOpen] = useState(false);

  const [shareModalData, setShareModalData] = useState({
    isOpen: false,
    title: "",
    company: "",
    summary: "",
    url: "",
    type: "rfp",
  });

  const handleShareRfp = (e, rfp) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/rfps/${rfp.id}`;
    setShareModalData({
      isOpen: true,
      title: rfp.title,
      company: rfp.company_name,
      summary: rfp.description ? rfp.description.substring(0, 140) : "Request for Proposal on Xanatz",
      url: url,
      type: "rfp",
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const [flagModal, setFlagModal] = useState({
    isOpen: false,
    rfpId: null,
    status: 'confirm',
    loading: false
  });

  const handleOpenFlagModal = (rfp) => {
    setFlagModal({
      isOpen: true,
      rfpId: rfp.id,
      status: 'confirm',
      loading: false
    });
  };

  const handleCloseFlagModal = () => {
    const wasSuccess = flagModal.status === 'success';
    setFlagModal({
      isOpen: false,
      rfpId: null,
      status: 'confirm',
      loading: false
    });
    if (wasSuccess) {
      fetchData();
    }
  };

  const handleConfirmFlag = async (reason) => {
    const { rfpId } = flagModal;
    if (!rfpId) return;
    setFlagModal(prev => ({ ...prev, loading: true }));
    try {
      await api.post(`rfps/${rfpId}/flag/`, { reason });
      setFlagModal(prev => ({ ...prev, loading: false, status: 'success' }));
    } catch (err) {
      console.error("Error flagging RFP:", err);
      setFlagModal(prev => ({ ...prev, loading: false, status: 'error' }));
    }
  };

  const fetchData = async () => {
    try {
      const rRes = await api.get("rfps/");
      setRfps(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      const uRes = await api.get("me/");
      setCurrentUser(uRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyInterests = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      const iRes = await api.get("rfp-interests/");
      setMyInterests(iRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUser();
    fetchMyInterests();
  }, []);

  useEffect(() => {
    if (!loading && rfps.length > 0) {
      const queryParams = new URLSearchParams(location.search);
      const targetId = paramRfpId || queryParams.get("rfp");
      if (targetId) {
        navigate(`/rfps/${targetId}`, { replace: true });
      }
    }
  }, [loading, rfps, location.search, paramRfpId, navigate]);

  const handleViewDetails = (rfp) => {
    navigate(`/rfps/${rfp.id}`);
  };

  const toggleExpandRfp = (id) => {
    setExpandedRfps(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to parse budget range average
  const parseBudgetRange = (str) => {
    if (!str) return 0;
    const clean = str.replace(/[$,]/g, "");
    const matches = clean.match(/\d+k?/gi);
    if (!matches) return 0;
    const vals = matches.map(m => {
      let val = parseFloat(m);
      if (m.toLowerCase().endsWith("k")) {
        val *= 1000;
      }
      return val;
    });
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  // Company Options for Filter Dropdown
  const companyOptions = useMemo(() => {
    return Array.from(new Set(rfps.map(r => r.company_name)))
      .filter(Boolean)
      .sort()
      .map(name => ({ value: name, label: name }));
  }, [rfps]);

  // Statistics for Hero
  const stats = useMemo(() => {
    const total = rfps.length;
    const active = rfps.filter(r => !r.deadline || new Date(r.deadline) > new Date()).length;
    const companies = new Set(rfps.map(r => r.company_name)).size;
    return { total, active, companies };
  }, [rfps]);

  // Active filter count
  const activeFilterCount = [
    selectedCategory, selectedBudget, selectedOwner, selectedDatePosted, searchQuery,
    selectedSort && selectedSort !== "newest" ? selectedSort : ""
  ].filter(Boolean).length;

  // Filter RFPs
  const filteredRfps = rfps.filter((rfp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      rfp.title.toLowerCase().includes(q) ||
      (rfp.rfp_id && rfp.rfp_id.toLowerCase().includes(q)) ||
      rfp.company_name.toLowerCase().includes(q) ||
      (rfp.description && rfp.description.toLowerCase().includes(q)) ||
      (rfp.requirements && rfp.requirements.toLowerCase().includes(q))
    );
    const matchesCategory = !selectedCategory || rfp.category === selectedCategory;

    let matchesBudget = true;
    if (selectedBudget) {
      const avgBudget = parseBudgetRange(rfp.budget);
      if (selectedBudget === "under-10k") {
        matchesBudget = avgBudget > 0 && avgBudget < 10000;
      } else if (selectedBudget === "10k-50k") {
        matchesBudget = avgBudget >= 10000 && avgBudget <= 50000;
      } else if (selectedBudget === "50k-100k") {
        matchesBudget = avgBudget >= 50000 && avgBudget <= 100000;
      } else if (selectedBudget === "over-100k") {
        matchesBudget = avgBudget > 100000;
      }
    }

    let matchesOwner = true;
    if (selectedOwner) {
      matchesOwner = rfp.company_name === selectedOwner;
    }

    let matchesDate = true;
    if (selectedDatePosted) {
      const createdTime = new Date(rfp.created_at).getTime();
      const now = Date.now();
      const diffMs = now - createdTime;
      if (selectedDatePosted === "past-24h") {
        matchesDate = diffMs <= 24 * 60 * 60 * 1000;
      } else if (selectedDatePosted === "past-week") {
        matchesDate = diffMs <= 7 * 24 * 60 * 60 * 1000;
      } else if (selectedDatePosted === "past-month") {
        matchesDate = diffMs <= 30 * 24 * 60 * 60 * 1000;
      }
    }

    return matchesSearch && matchesCategory && matchesBudget && matchesOwner && matchesDate;
  });

  // Sort RFPs
  const sortedRfps = [...filteredRfps].sort((a, b) => {
    if (selectedSort === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (selectedSort === "oldest") {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (selectedSort === "budget-high") {
      return parseBudgetRange(b.budget) - parseBudgetRange(a.budget);
    }
    if (selectedSort === "budget-low") {
      return parseBudgetRange(a.budget) - parseBudgetRange(b.budget);
    }
    if (selectedSort === "deadline-soon") {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return 0;
  });

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color={accentColor} />
          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="black" letterSpacing="widest">
            LOADING RFPs MARKETPLACE...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" pb="100px">
      {/* Dynamic Ambient Glowing Backdrop Blobs */}
      <Box position="fixed" inset="0" overflow="hidden" zIndex={0} pointerEvents="none">
        <Box
          position="absolute"
          top="-10%"
          left="20%"
          w="600px"
          h="600px"
          borderRadius="full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.05) 50%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
        <Box
          position="absolute"
          bottom="10%"
          right="10%"
          w="500px"
          h="500px"
          borderRadius="full"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(139,92,246,0.04) 50%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </Box>

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        {/* ─── HERO MARKETPLACE BANNER ─── */}
        <Box
          pt={{ base: 28, md: 32 }}
          pb={{ base: 10, md: 12 }}
          px={{ base: 4, md: 6, lg: 8 }}
          borderBottom="1px solid var(--color-card-border)"
          style={{
            background: "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Container maxW="1340px" px={0}>
            <VStack align="stretch" gap={6}>
              <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={6}>
                <VStack align="start" gap={2.5} maxW="720px">
                  <HStack gap={2} px={3} py={1} borderRadius="full" border="1px solid rgba(139,92,246,0.3)" bg="rgba(139,92,246,0.1)">
                    <Briefcase size={13} color="#c4b5fd" />
                    <Text fontSize="xs" fontWeight="bold" color="#c4b5fd" letterSpacing="wider">
                      PROJECT PROCUREMENT & PROPOSAL HUB
                    </Text>
                  </HStack>

                  <Heading
                    size="xl"
                    fontWeight="black"
                    letterSpacing="tight"
                    style={{
                      background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #c4b5fd 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Request for Proposals (RFPs)
                  </Heading>
                  <Text color="var(--color-text-muted)" fontSize={{ base: "xs", md: "sm" }} lineHeight="1.6">
                    Connect directly with verified businesses, showcase your company's capabilities, and submit competitive quotes for high-value tenders.
                  </Text>
                </VStack>

                {/* Hero Stats Row */}
                <HStack gap={{ base: 4, md: 6 }} wrap="wrap">
                  <Box
                    p={4}
                    borderRadius="2xl"
                    border="1px solid rgba(139,92,246,0.25)"
                    bg="rgba(139,92,246,0.08)"
                    minW="120px"
                  >
                    <HStack gap={1.5} mb={1}>
                      <Circle size="6px" bg="#34d399" />
                      <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="wider">
                        ACTIVE RFPs
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="black" color="white">
                      {stats.active}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    borderRadius="2xl"
                    border="1px solid var(--color-card-border)"
                    bg="var(--color-glass)"
                    minW="120px"
                  >
                    <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="wider" mb={1}>
                      TOTAL POSTS
                    </Text>
                    <Text fontSize="xl" fontWeight="black" color="#c4b5fd">
                      {stats.total}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    borderRadius="2xl"
                    border="1px solid var(--color-card-border)"
                    bg="var(--color-glass)"
                    minW="120px"
                  >
                    <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="wider" mb={1}>
                      COMPANIES
                    </Text>
                    <Text fontSize="xl" fontWeight="black" color="white">
                      {stats.companies}
                    </Text>
                  </Box>
                </HStack>
              </Flex>

              {/* FLOATING SEARCH BAR & CONTROLS TOOLBAR */}
              <Box
                p={{ base: 3, md: 4 }}
                borderRadius="2xl"
                border="1px solid rgba(139,92,246,0.3)"
                style={{
                  background: "linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.85) 100%)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                  {/* Search Input Box */}
                  <HStack
                    flex={1}
                    minW={{ base: "full", md: "320px" }}
                    bg="var(--color-input-bg)"
                    px={3.5}
                    py={1.5}
                    borderRadius="xl"
                    border="1px solid var(--color-card-border)"
                    _focusWithin={{ borderColor: accentColor, boxShadow: `0 0 12px ${accentColor}44` }}
                    transition="all 0.25s"
                  >
                    <Search size={16} color={accentColor} />
                    <Input
                      placeholder="Search RFPs by title, keyword, company..."
                      variant="unstyled"
                      fontSize="xs"
                      color="white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      _placeholder={{ color: "var(--color-text-muted)" }}
                    />
                    {searchQuery && (
                      <Box as="button" onClick={() => setSearchQuery("")} cursor="pointer">
                        <XIcon size={14} color="var(--color-text-muted)" />
                      </Box>
                    )}
                  </HStack>

                  {/* Right Action Tools: Mobile filter button & View mode toggles */}
                  <HStack gap={2.5} ml="auto">
                    {/* Mobile filter toggle button */}
                    <Button
                      display={{ base: "flex", lg: "none" }}
                      onClick={() => setMobileFilterOpen(true)}
                      size="sm"
                      h="10"
                      px={3.5}
                      borderRadius="xl"
                      bg="rgba(139,92,246,0.15)"
                      border="1px solid rgba(139,92,246,0.3)"
                      color="#c4b5fd"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      <SlidersHorizontal size={14} style={{ marginRight: "6px" }} />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge ml={2} px={1.5} py={0.2} borderRadius="full" bg={accentColor} color="white" fontSize="10px">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>

                    {/* View mode toggle switch */}
                    <HStack
                      gap={0}
                      borderRadius="xl"
                      border="1px solid var(--color-card-border)"
                      overflow="hidden"
                      bg="var(--color-glass)"
                      p={0.5}
                    >
                      <Box
                        as="button"
                        px={3}
                        py={2}
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={() => setViewMode("grid")}
                        cursor="pointer"
                        style={{
                          background: viewMode === "grid" ? `${accentColor}25` : "transparent",
                          color: viewMode === "grid" ? "white" : "var(--color-text-muted)",
                        }}
                        _hover={{ color: "white" }}
                        transition="all 0.2s"
                        title="Grid View"
                      >
                        <LayoutGrid size={15} color={viewMode === "grid" ? accentColor : "currentColor"} />
                      </Box>
                      <Box
                        as="button"
                        px={3}
                        py={2}
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={() => setViewMode("stream")}
                        cursor="pointer"
                        style={{
                          background: viewMode === "stream" ? `${accentColor}25` : "transparent",
                          color: viewMode === "stream" ? "white" : "var(--color-text-muted)",
                        }}
                        _hover={{ color: "white" }}
                        transition="all 0.2s"
                        title="Stream View"
                      >
                        <List size={15} color={viewMode === "stream" ? accentColor : "currentColor"} />
                      </Box>
                    </HStack>
                  </HStack>
                </Flex>

                {/* Active Filter Chips */}
                {activeFilterCount > 0 && (
                  <Flex wrap="wrap" gap={2} mt={3} pt={3} borderTop="1px solid rgba(255,255,255,0.06)">
                    <Text fontSize="10px" fontWeight="black" color="var(--color-text-muted)" alignSelf="center" mr={1}>
                      ACTIVE FILTERS:
                    </Text>
                    {searchQuery && (
                      <FilterChip label={`Search: ${searchQuery}`} onRemove={() => setSearchQuery("")} accentColor={accentColor} />
                    )}
                    {selectedCategory && (
                      <FilterChip label={`Category: ${ALL_CATEGORY_LABELS[selectedCategory] || selectedCategory}`} onRemove={() => setSelectedCategory("")} accentColor={accentColor} />
                    )}
                    {selectedBudget && (
                      <FilterChip label={`Budget: ${selectedBudget}`} onRemove={() => setSelectedBudget("")} accentColor={accentColor} />
                    )}
                    {selectedOwner && (
                      <FilterChip label={`Company: ${selectedOwner}`} onRemove={() => setSelectedOwner("")} accentColor={accentColor} />
                    )}
                    {selectedDatePosted && (
                      <FilterChip label={`Date: ${selectedDatePosted}`} onRemove={() => setSelectedDatePosted("")} accentColor={accentColor} />
                    )}
                    {selectedSort && selectedSort !== "newest" && (
                      <FilterChip label={`Sort: ${selectedSort}`} onRemove={() => setSelectedSort("newest")} accentColor={accentColor} />
                    )}

                    <Button
                      variant="link"
                      size="xs"
                      color="var(--color-text-muted)"
                      fontSize="10px"
                      fontWeight="bold"
                      onClick={handleResetFilters}
                      _hover={{ color: "white" }}
                      ml="auto"
                    >
                      Clear All
                    </Button>
                  </Flex>
                )}
              </Box>
            </VStack>
          </Container>
        </Box>

        {/* ─── MAIN CONTENT CONTAINER (2 COLUMNS: FILTERS & RFP CARDS) ─── */}
        <Container maxW="1340px" px={{ base: 4, md: 6, lg: 8 }} pt={8}>
          <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap={6} alignItems="start">
            
            {/* ─── LEFT SIDEBAR: FILTERS ─── */}
            <RFPFilterSidebar
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBudget={selectedBudget}
              setSelectedBudget={setSelectedBudget}
              selectedOwner={selectedOwner}
              setSelectedOwner={setSelectedOwner}
              selectedDatePosted={selectedDatePosted}
              setSelectedDatePosted={setSelectedDatePosted}
              searchQuery={searchQuery}
              onResetFilters={handleResetFilters}
              companyOptions={companyOptions}
              accentColor={accentColor}
              mobileOpen={mobileFilterOpen}
              onMobileClose={() => setMobileFilterOpen(false)}
            />

            {/* ─── CENTER COLUMN: MY PROPOSALS & RFP CARDS ─── */}
            <VStack align="stretch" gap={6}>

              {/* ─── RELOCATED: MY SUBMITTED PROPOSALS TOP SECTION ─── */}
              {currentUser && myInterests.length > 0 && !currentUser.companies?.some((c) => !c.is_owner) && (
                <Box
                  p={4.5}
                  borderRadius="2xl"
                  border="1px solid rgba(139, 92, 246, 0.35)"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(15,23,42,0.95) 100%)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  }}
                >
                  <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                    <HStack gap={2.5} cursor="pointer" onClick={() => navigate("/my-rfp-interests")}>
                      <Circle size="34px" bg="rgba(139, 92, 246, 0.2)" border="1px solid rgba(139, 92, 246, 0.4)">
                        <CheckCircle2 size={16} color="#c4b5fd" />
                      </Circle>
                      <VStack align="start" gap={0}>
                        <HStack gap={2}>
                          <Text color="white" fontWeight="black" fontSize="xs" letterSpacing="wide">
                            MY SUBMITTED PROPOSALS
                          </Text>
                          <Badge px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="black" bg={accentColor} color="white">
                            {myInterests.length}
                          </Badge>
                        </HStack>
                        <Text fontSize="11px" color="var(--color-text-muted)">
                          Track your submitted quotes and proposal statuses
                        </Text>
                      </VStack>
                    </HStack>

                    <Button
                      size="xs"
                      h="8"
                      px={4}
                      borderRadius="xl"
                      bg="rgba(139, 92, 246, 0.2)"
                      border="1px solid rgba(139, 92, 246, 0.4)"
                      color="#c4b5fd"
                      fontWeight="bold"
                      fontSize="11px"
                      letterSpacing="wider"
                      onClick={() => navigate("/my-rfp-interests")}
                      _hover={{ bg: accentColor, color: "white" }}
                      transition="all 0.2s"
                    >
                      VIEW ALL PROPOSALS ({myInterests.length})
                    </Button>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3} mt={3.5}>
                    {myInterests.slice(0, 3).map((item) => {
                      const isAccepted = item.status === "accepted";
                      const isRejected = item.status === "rejected";
                      const targetRfpId = typeof item.rfp === "object" ? item.rfp?.id : item.rfp;

                      return (
                        <Box
                          key={item.id}
                          p={3.5}
                          borderRadius="xl"
                          bg="rgba(15, 23, 42, 0.85)"
                          border={
                            isAccepted
                              ? "1px solid rgba(16, 185, 129, 0.35)"
                              : isRejected
                              ? "1px solid rgba(239, 68, 68, 0.35)"
                              : "1px solid rgba(255, 255, 255, 0.1)"
                          }
                          cursor="pointer"
                          onClick={() => targetRfpId && navigate(`/rfps/${targetRfpId}`)}
                          _hover={{ bg: "rgba(20, 30, 55, 0.95)", transform: "translateY(-2px)", borderColor: accentColor }}
                          transition="all 0.2s"
                        >
                          <VStack align="stretch" gap={2}>
                            <Flex justify="space-between" align="start" gap={2}>
                              <Text color="white" fontSize="xs" fontWeight="bold" noOfLines={1} flex={1}>
                                {item.rfp_title || `Proposal #${item.id}`}
                              </Text>
                              <Badge
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                fontSize="9px"
                                fontWeight="800"
                                bg={
                                  isAccepted
                                    ? "rgba(16, 185, 129, 0.18)"
                                    : isRejected
                                    ? "rgba(239, 68, 68, 0.18)"
                                    : "rgba(245, 158, 11, 0.18)"
                                }
                                color={isAccepted ? "#34d399" : isRejected ? "#f87171" : "#fbbf24"}
                                border={
                                  isAccepted
                                    ? "1px solid rgba(16, 185, 129, 0.35)"
                                    : isRejected
                                    ? "1px solid rgba(239, 68, 68, 0.35)"
                                    : "1px solid rgba(245, 158, 11, 0.35)"
                                }
                              >
                                {isAccepted ? "ACCEPTED" : isRejected ? "REJECTED" : "PENDING"}
                              </Badge>
                            </Flex>

                            <HStack gap={1.5} color="var(--color-text-muted)" fontSize="11px">
                              <Building2 size={12} color="#a78bfa" />
                              <Text fontWeight="600" noOfLines={1}>{item.rfp_company_name || "Company Client"}</Text>
                            </HStack>

                            {item.quotation_id && (
                              <Text fontSize="10px" color="rgba(255,255,255,0.4)">
                                Quotation ID: <Text as="span" color="#c4b5fd" fontWeight="bold">{item.quotation_id}</Text>
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Box>
              )}

              {/* Feed Header */}
              <Flex justify="space-between" align="center">
                <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold">
                  Showing <Text as="span" color="white" fontWeight="black">{sortedRfps.length}</Text> result{sortedRfps.length !== 1 ? 's' : ''}
                </Text>

                {sortedRfps.length > 0 && (
                  <Text color="var(--color-text-muted)" fontSize="11px">
                    Sorted by: <Text as="span" color="#c4b5fd" fontWeight="bold">{selectedSort.replace("-", " ").toUpperCase()}</Text>
                  </Text>
                )}
              </Flex>

              {sortedRfps.length === 0 ? (
                <Box
                  py="90px"
                  px={6}
                  textAlign="center"
                  w="full"
                  borderRadius="3xl"
                  border="1px dashed var(--color-card-border)"
                  style={{
                    background: "linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(20,30,55,0.6) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <Circle size="60px" bg="rgba(139,92,246,0.1)" border="1px solid rgba(139,92,246,0.2)" mx="auto" mb={4}>
                    <FileText size={26} color={accentColor} />
                  </Circle>
                  <Heading size="md" color="white" fontWeight="black" mb={2}>
                    No RFPs Match Your Search
                  </Heading>
                  <Text color="var(--color-text-muted)" fontSize="xs" maxW="400px" mx="auto" mb={6}>
                    Try clearing or broadening your filter criteria to find open procurement opportunities.
                  </Text>
                  <Button
                    onClick={handleResetFilters}
                    size="sm"
                    h="10"
                    px={6}
                    borderRadius="xl"
                    bg={accentColor}
                    color="white"
                    fontWeight="bold"
                    _hover={{ filter: "brightness(1.15)", transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                  >
                    Reset All Filters
                  </Button>
                </Box>
              ) : viewMode === "grid" ? (
                /* ─── GRID VIEW (FUTURISTIC CARDS) ─── */
                <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap={5}>
                  <AnimatePresence>
                    {sortedRfps.map((rfp, idx) => {
                      const isExpanded = expandedRfps[rfp.id] || false;
                      const descriptionSnippet = rfp.description.length > 160
                        ? `${rfp.description.slice(0, 160)}...`
                        : rfp.description;
                      const deadlineStatus = getDeadlineStatus(rfp.deadline);

                      return (
                        <MotionBox
                          key={rfp.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.25) }}
                          p={5}
                          borderRadius="2xl"
                          border="1px solid var(--color-card-border)"
                          display="flex"
                          flexDirection="column"
                          justifyContent="space-between"
                          style={{
                            background: "linear-gradient(145deg, rgba(15,23,42,0.85) 0%, rgba(20,30,55,0.85) 100%)",
                            backdropFilter: "blur(20px)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                          }}
                          _hover={{
                            borderColor: `${accentColor}88`,
                            transform: "translateY(-3px)",
                            boxShadow: `0 16px 40px -10px ${accentColor}33`,
                          }}
                        >
                          <Box>
                            {/* Card Header */}
                            <Flex justify="space-between" align="start" mb={3.5}>
                              <HStack gap={3}>
                                <Box
                                  w="42px"
                                  h="42px"
                                  borderRadius="xl"
                                  overflow="hidden"
                                  border="1px solid var(--color-card-border)"
                                  bg="var(--color-surface)"
                                  flexShrink={0}
                                >
                                  {rfp.company_logo_url ? (
                                    <Box as="img" src={rfp.company_logo_url} alt={rfp.company_name} w="full" h="full" style={{ objectFit: "cover" }} />
                                  ) : (
                                    <Flex w="full" h="full" align="center" justify="center">
                                      <Building2 size={20} color={accentColor} />
                                    </Flex>
                                  )}
                                </Box>
                                <VStack align="start" gap={0}>
                                  <Text color="white" fontSize="xs" fontWeight="black" noOfLines={1}>
                                    {rfp.company_name}
                                  </Text>
                                  <Text fontSize="10px" color="var(--color-text-muted)">
                                    {formatDate(rfp.created_at)}
                                  </Text>
                                </VStack>
                              </HStack>

                              {/* Actions */}
                              <HStack gap={1}>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  w="7"
                                  h="7"
                                  minW="0"
                                  p={0}
                                  color="var(--color-text-muted)"
                                  _hover={{ color: accentColor, bg: `${accentColor}15` }}
                                  onClick={(e) => handleShareRfp(e, rfp)}
                                  title="Share RFP"
                                >
                                  <Share2 size={13} />
                                </Button>
                              </HStack>
                            </Flex>

                            {/* Title & Badges */}
                            <VStack align="start" gap={1.5} mb={3}>
                              <HStack gap={1.5} wrap="wrap">
                                {rfp.rfp_id && (
                                  <Badge variant="outline" colorScheme="purple" fontSize="10px" px={1.5} py={0.2} borderRadius="md" color="#c4b5fd" borderColor={`${accentColor}44`}>
                                    {rfp.rfp_id}
                                  </Badge>
                                )}
                                {deadlineStatus && (
                                  <Badge
                                    px={2} py={0.5} borderRadius="md" fontSize="9px" fontWeight="black"
                                    bg={deadlineStatus.bg} color={deadlineStatus.color} border={`1px solid ${deadlineStatus.border}`}
                                  >
                                    {deadlineStatus.text}
                                  </Badge>
                                )}
                              </HStack>

                              <Heading size="sm" color="white" fontWeight="black" letterSpacing="tight" lineHeight="1.3">
                                {rfp.title}
                              </Heading>
                            </VStack>

                            <Text color="var(--color-text-secondary)" fontSize="xs" lineHeight="1.6" mb={4} noOfLines={isExpanded ? undefined : 3}>
                              {isExpanded ? rfp.description : descriptionSnippet}
                            </Text>

                            {rfp.description.length > 160 && (
                              <Button
                                variant="link"
                                size="xs"
                                color={accentColor}
                                fontWeight="bold"
                                fontSize="11px"
                                mb={3}
                                _hover={{ textDecoration: "none", opacity: 0.8 }}
                                onClick={() => toggleExpandRfp(rfp.id)}
                              >
                                {isExpanded ? "Show Less" : "Read More"}
                              </Button>
                            )}

                            {/* Category & Budget Badges */}
                            <Flex wrap="wrap" gap={2} mb={4}>
                              {rfp.category && (
                                <Badge px={2.5} py={1} borderRadius="md" fontSize="10px" fontWeight="bold" bg="rgba(59,130,246,0.12)" color="#93c5fd" border="1px solid rgba(59,130,246,0.25)">
                                  {ALL_CATEGORY_LABELS[rfp.category] || rfp.category}
                                </Badge>
                              )}
                              {rfp.budget && (
                                <Badge px={2.5} py={1} borderRadius="md" fontSize="10px" fontWeight="black" bg="rgba(16,185,129,0.12)" color="#34d399" border="1px solid rgba(16,185,129,0.25)">
                                  AED {rfp.budget.replace(/[$₹]/g, '').toUpperCase()}
                                </Badge>
                              )}
                            </Flex>
                          </Box>

                          {/* Footer Action Buttons */}
                          <Flex pt={3.5} borderTop="1px solid var(--color-card-border)" justify="space-between" align="center" gap={2}>
                            <Button
                              h="8"
                              px={3}
                              borderRadius="lg"
                              fontSize="11px"
                              fontWeight="bold"
                              variant="ghost"
                              color="var(--color-text-secondary)"
                              _hover={{ bg: "var(--color-card-border)", color: "white" }}
                              onClick={() => handleViewDetails(rfp)}
                            >
                              DETAILS
                            </Button>

                            {(() => {
                              const userComp = currentUser?.companies?.find((c) => c.id === rfp.company);
                              const isCompanyMember = Boolean(userComp || (currentUser && rfp.company === currentUser.company_id));
                              const canManage = Boolean(
                                currentUser && (
                                  rfp.company === currentUser.company_id ||
                                  userComp?.is_owner ||
                                  ['super_admin', 'admin'].includes(userComp?.access_role)
                                )
                              );

                              if (isCompanyMember) {
                                if (canManage) {
                                  return (
                                    <Button
                                      h="8"
                                      px={3.5}
                                      borderRadius="lg"
                                      fontSize="11px"
                                      fontWeight="bold"
                                      bg="rgba(139,92,246,0.15)"
                                      border="1px solid rgba(139,92,246,0.3)"
                                      color="#c4b5fd"
                                      _hover={{ bg: accentColor, color: "white" }}
                                      onClick={() => navigate(`/company/${rfp.company}/rfps`)}
                                    >
                                      MANAGE
                                    </Button>
                                  );
                                }
                              }

                              if (myInterests.some((i) => String(i.rfp) === String(rfp.id))) {
                                return (
                                  <Button
                                    h="8"
                                    px={3}
                                    borderRadius="lg"
                                    fontSize="10px"
                                    fontWeight="bold"
                                    bg="rgba(16, 185, 129, 0.15)"
                                    color="#34d399"
                                    border="1px solid rgba(16, 185, 129, 0.3)"
                                    cursor="default"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <CheckCircle2 size={12} style={{ marginRight: "4px" }} />
                                    SUBMITTED
                                  </Button>
                                );
                              }

                              return (
                                <Button
                                  h="8"
                                  px={4}
                                  borderRadius="lg"
                                  fontSize="11px"
                                  fontWeight="bold"
                                  bg={accentColor}
                                  color="white"
                                  _hover={{ filter: "brightness(1.15)", transform: "translateY(-1px)" }}
                                  transition="all 0.2s"
                                  onClick={() => {
                                    setSelectedRfp(rfp);
                                    const token = localStorage.getItem("access");
                                    if (!token) {
                                      navigate("/login", { state: { from: location } });
                                      return;
                                    }
                                    setIsInterestOpen(true);
                                  }}
                                >
                                  EXPRESS INTEREST
                                </Button>
                              );
                            })()}
                          </Flex>
                        </MotionBox>
                      );
                    })}
                  </AnimatePresence>
                </SimpleGrid>
              ) : (
                /* ─── STREAM VIEW (VERTICAL STREAM CARDS) ─── */
                <VStack align="stretch" gap={5}>
                  <AnimatePresence>
                    {sortedRfps.map((rfp, idx) => {
                      const isExpanded = expandedRfps[rfp.id] || false;
                      const descriptionSnippet = rfp.description.length > 250
                        ? `${rfp.description.slice(0, 250)}...`
                        : rfp.description;
                      const deadlineStatus = getDeadlineStatus(rfp.deadline);

                      return (
                        <MotionBox
                          key={rfp.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.25) }}
                          p={{ base: 5, md: 6 }}
                          borderRadius="2xl"
                          border="1px solid var(--color-card-border)"
                          style={{
                            background: "linear-gradient(145deg, rgba(15,23,42,0.85) 0%, rgba(20,30,55,0.85) 100%)",
                            backdropFilter: "blur(20px)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                            transition: "all 0.25s ease",
                          }}
                          _hover={{ borderColor: `${accentColor}88`, transform: "translateY(-2px)" }}
                        >
                          {/* Post Header */}
                          <Flex justify="space-between" align="start" mb={4}>
                            <HStack gap={3.5} align="center">
                              <Box w="11" h="11" borderRadius="xl" overflow="hidden" border="1px solid var(--color-card-border)" bg="var(--color-surface)" flexShrink={0}>
                                {rfp.company_logo_url ? (
                                  <Box as="img" src={rfp.company_logo_url} alt={rfp.company_name} w="full" h="full" style={{ objectFit: "cover" }} />
                                ) : (
                                  <Flex w="full" h="full" align="center" justify="center">
                                    <Building2 size={18} color={accentColor} />
                                  </Flex>
                                )}
                              </Box>
                              <VStack align="start" gap={0}>
                                <Text color="white" fontSize="xs" fontWeight="black">
                                  {rfp.company_name}
                                </Text>
                                <HStack gap={1.5} fontSize="10px" color="var(--color-text-muted)">
                                  <Clock size={11} />
                                  <Text>{formatDate(rfp.created_at)}</Text>
                                </HStack>
                              </VStack>
                            </HStack>

                            <HStack gap={1}>
                              <Button
                                variant="ghost"
                                size="xs"
                                color="var(--color-text-muted)"
                                _hover={{ color: accentColor, bg: `${accentColor}15` }}
                                onClick={(e) => handleShareRfp(e, rfp)}
                                title="Share RFP"
                              >
                                <Share2 size={14} />
                              </Button>
                              {rfp.is_flagged ? (
                                <Badge
                                  variant="subtle"
                                  px={2.5}
                                  py={1}
                                  borderRadius="lg"
                                  fontSize="10px"
                                  fontWeight="black"
                                  color="#EF4444"
                                  bg="rgba(239, 68, 68, 0.15)"
                                  border="1px solid rgba(239, 68, 68, 0.3)"
                                >
                                  <Flag size={12} fill="#EF4444" style={{ marginRight: "4px" }} />
                                  FLAGGED
                                </Badge>
                              ) : (
                                (!currentUser || rfp.company !== currentUser.company_id) && (
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    color="var(--color-text-muted)"
                                    _hover={{ color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenFlagModal(rfp);
                                    }}
                                    title="Flag RFP"
                                  >
                                    <Flag size={14} />
                                  </Button>
                                )
                              )}
                            </HStack>
                          </Flex>

                          {/* Title & Version */}
                          <HStack gap={2} align="center" mb={2} wrap="wrap">
                            {rfp.rfp_id && (
                              <Badge variant="outline" colorScheme="purple" fontSize="10px" px={2} py={0.5} borderRadius="md" color="#c4b5fd" borderColor={`${accentColor}44`}>
                                {rfp.rfp_id}
                              </Badge>
                            )}
                            {rfp.version && (
                              <Badge variant="subtle" colorScheme="blue" fontSize="10px" px={2} py={0.5} borderRadius="md" color="#93c5fd" bg="rgba(59,130,246,0.15)">
                                V{rfp.version}
                              </Badge>
                            )}
                            {deadlineStatus && (
                              <Badge px={2} py={0.5} borderRadius="md" fontSize="9px" fontWeight="black" bg={deadlineStatus.bg} color={deadlineStatus.color} border={`1px solid ${deadlineStatus.border}`}>
                                {deadlineStatus.text}
                              </Badge>
                            )}
                          </HStack>

                          <Heading size="md" color="white" fontWeight="black" letterSpacing="tight" mb={3}>
                            {rfp.title}
                          </Heading>

                          <Box mb={4}>
                            <Text color="var(--color-text-secondary)" fontSize="xs" lineHeight="1.6" whiteSpace="pre-wrap">
                              {isExpanded ? rfp.description : descriptionSnippet}
                            </Text>
                            {rfp.description.length > 250 && (
                              <Button
                                variant="link"
                                size="xs"
                                color={accentColor}
                                fontWeight="bold"
                                mt={1}
                                _hover={{ textDecoration: "none", opacity: 0.8 }}
                                onClick={() => toggleExpandRfp(rfp.id)}
                              >
                                {isExpanded ? "Show Less" : "Read More"}
                              </Button>
                            )}
                          </Box>

                          {/* Meta Badges */}
                          <HStack gap={3} py={3} borderTop="1px solid var(--color-card-border)" wrap="wrap">
                            {rfp.category && (
                              <HStack gap={1.5} px={3} py={1} borderRadius="lg" bg="rgba(59,130,246,0.1)" border="1px solid rgba(59,130,246,0.2)">
                                <Text color="#93c5fd" fontSize="10px" fontWeight="bold">
                                  {ALL_CATEGORY_LABELS[rfp.category] || rfp.category}
                                </Text>
                              </HStack>
                            )}
                            {rfp.sub_category && (
                              <HStack gap={1.5} px={3} py={1} borderRadius="lg" bg="rgba(139,92,246,0.1)" border="1px solid rgba(139,92,246,0.2)">
                                <Text color="#c4b5fd" fontSize="10px" fontWeight="bold">
                                  {ALL_SUBCATEGORY_LABELS[rfp.sub_category] || rfp.sub_category}
                                </Text>
                              </HStack>
                            )}
                            {rfp.budget && (
                              <HStack gap={1.5} px={3} py={1} borderRadius="lg" bg="rgba(16,185,129,0.1)" border="1px solid rgba(16,185,129,0.2)">
                                <Text color="#34d399" fontSize="10px" fontWeight="black">
                                  BUDGET: AED {rfp.budget.replace(/[$₹]/g, '').toUpperCase()}
                                </Text>
                              </HStack>
                            )}
                            {rfp.deadline && (
                              <HStack gap={1.5} px={3} py={1} borderRadius="lg" bg="var(--color-input-bg)" border="1px solid var(--color-card-border)">
                                <Calendar size={12} color="var(--color-text-secondary)" />
                                <Text color="var(--color-text-secondary)" fontSize="10px" fontWeight="bold">
                                  DUE: {formatDate(rfp.deadline)}
                                </Text>
                              </HStack>
                            )}
                          </HStack>

                          {/* Action Footer */}
                          <HStack gap={3} pt={3.5} borderTop="1px solid var(--color-card-border)" justify="flex-end">
                            <Button
                              h="8.5"
                              px={4.5}
                              borderRadius="xl"
                              fontSize="xs"
                              fontWeight="bold"
                              variant="ghost"
                              color="var(--color-text-secondary)"
                              _hover={{ bg: "var(--color-card-border)", color: "white" }}
                              onClick={() => handleViewDetails(rfp)}
                            >
                              VIEW DETAILS
                            </Button>

                            {(() => {
                              const userComp = currentUser?.companies?.find((c) => c.id === rfp.company);
                              const isCompanyMember = Boolean(userComp || (currentUser && rfp.company === currentUser.company_id));
                              const canManage = Boolean(
                                currentUser && (
                                  rfp.company === currentUser.company_id ||
                                  userComp?.is_owner ||
                                  ['super_admin', 'admin'].includes(userComp?.access_role)
                                )
                              );

                              if (isCompanyMember) {
                                if (canManage) {
                                  return (
                                    <Button
                                      h="8.5"
                                      px={4.5}
                                      borderRadius="xl"
                                      fontSize="xs"
                                      fontWeight="bold"
                                      bg="rgba(139,92,246,0.15)"
                                      border="1px solid rgba(139,92,246,0.3)"
                                      color="#c4b5fd"
                                      _hover={{ bg: accentColor, color: "white" }}
                                      onClick={() => navigate(`/company/${rfp.company}/rfps`)}
                                    >
                                      MANAGE RFP
                                    </Button>
                                  );
                                }
                              }

                              if (myInterests.some((i) => String(i.rfp) === String(rfp.id))) {
                                return (
                                  <Button
                                    h="8.5"
                                    px={4}
                                    borderRadius="xl"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    bg="rgba(16, 185, 129, 0.15)"
                                    color="#34d399"
                                    border="1px solid rgba(16, 185, 129, 0.3)"
                                    cursor="default"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <CheckCircle2 size={13} style={{ marginRight: "4px" }} />
                                    INTEREST SUBMITTED
                                  </Button>
                                );
                              }

                              return (
                                <Button
                                  h="8.5"
                                  px={5}
                                  borderRadius="xl"
                                  fontSize="xs"
                                  fontWeight="bold"
                                  bg={accentColor}
                                  color="white"
                                  _hover={{ filter: "brightness(1.15)", transform: "translateY(-1px)" }}
                                  transition="all 0.2s"
                                  onClick={() => {
                                    setSelectedRfp(rfp);
                                    const token = localStorage.getItem("access");
                                    if (!token) {
                                      navigate("/login", { state: { from: location } });
                                      return;
                                    }
                                    setIsInterestOpen(true);
                                  }}
                                >
                                  EXPRESS INTEREST
                                </Button>
                              );
                            })()}
                          </HStack>
                        </MotionBox>
                      );
                    })}
                  </AnimatePresence>
                </VStack>
              )}
            </VStack>

          </Grid>
        </Container>
      </Box>

      {/* RFP Interest Modal */}
      {selectedRfp && (
        <RFPInterestModal
          isOpen={isInterestOpen}
          onClose={() => setIsInterestOpen(false)}
          rfp={selectedRfp}
          onSubmitSuccess={fetchMyInterests}
        />
      )}

      {/* RFP Flag Confirmation Modal */}
      <FlagConfirmationModal
        isOpen={flagModal.isOpen}
        onClose={handleCloseFlagModal}
        onConfirm={handleConfirmFlag}
        loading={flagModal.loading}
        status={flagModal.status}
        title="Flag this RFP?"
        description="Are you sure you want to flag this RFP as inappropriate? It will be removed from your view and sent to the administrator for moderation."
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData(prev => ({ ...prev, isOpen: false }))}
        title={shareModalData.title}
        company={shareModalData.company}
        summary={shareModalData.summary}
        url={shareModalData.url}
        type={shareModalData.type || "rfp"}
      />
    </Box>
  );
};

export default RFPsPage;
