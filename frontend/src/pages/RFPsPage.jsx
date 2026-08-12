import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, Heading, Input, Circle, Avatar
} from "@chakra-ui/react";
import {
  FileText, Search, Clock, DollarSign, Calendar, Building2, ChevronRight, AlertCircle, ArrowLeft,
  TrendingUp, User as UserIcon, Briefcase, Award, Info, MapPin, Users, CheckCircle2, MessageSquare, ExternalLink, Flag,
  Share2, Check
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

const MotionBox = motion.create(Box);

const RFPsPage = () => {
  const accentColor = "#8b5cf6"; // Purple accent for RFPs
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramRfpId } = useParams();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${backendUrl}${path}`;
  };

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
  const [copiedId, setCopiedId] = useState(null);

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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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

  useEffect(() => {
    fetchData();
    fetchUser();
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

  const handleOpenInterest = () => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setIsDetailsOpen(false);
    setIsInterestOpen(true);
  };

  const toggleExpandRfp = (id) => {
    setExpandedRfps(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color={accentColor} />
          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="black" letterSpacing="widest">
            LOADING RFPs...
          </Text>
        </VStack>
      </Flex>
    );
  }

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

  // Extract unique companies from RFPs for Published By filter dropdown
  const companyOptions = Array.from(new Set(rfps.map(r => r.company_name)))
    .filter(Boolean)
    .sort()
    .map(name => ({ value: name, label: name }));

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

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" pb="80px">
      {/* Ambient glowing blobs — isolated in a clip wrapper so they don't cause horizontal scroll */}
      <Box position="fixed" inset="0" overflow="hidden" zIndex={0} pointerEvents="none">
        <Box position="absolute" top="0" left="0" w="50%" h="50%"
          style={{ background: `${accentColor}06`, filter: "blur(150px)" }}
          borderRadius="full" />
        <Box position="absolute" bottom="0" right="0" w="40%" h="40%"
          style={{ background: "rgba(59, 130, 246, 0.04)", filter: "blur(120px)" }}
          borderRadius="full" />
      </Box>

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        {/* Full-width container with responsive side margins matching standard grid pages */}
        <Container maxW="1340px" px={{ base: 4, md: 6, lg: 8 }} pt={24}>
          
          <Grid templateColumns={{ base: "1fr", lg: "280px 1fr", xl: "280px 1fr 310px" }} gap={6} alignItems="start">
            
            {/* ─── LEFT SIDEBAR: FILTERS & SORT (STICKY) ─── */}
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
            />

            {/* ─── CENTER COLUMN: NEWS FEED STREAM ─── */}
            <VStack align="stretch" gap={6}>
              
              {/* Top Welcome & Feed Header */}
              <Box>
                <Heading size="md" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                  Request for Proposals Feed
                </Heading>
                <Text color="var(--color-text-muted)" fontSize="xs">
                  Discover new bidding opportunities and business partnerships in your network.
                </Text>
              </Box>

              {/* Feed Search / Post Bar */}
              <HStack
                bg="var(--color-glass)"
                border="1px solid var(--color-card-border)"
                px={4.5}
                py={1.5}
                borderRadius="2xl"
                _focusWithin={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                transition="all 0.2s"
              >
                <Search size={16} color="var(--color-text-muted)" />
                <Input
                  placeholder="Search by RFP title, keyword, or company..."
                  variant="unstyled"
                  color="var(--color-text-primary)"
                  fontSize="xs"
                  h="10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </HStack>

              {/* Main vertical stream of RFP posts */}
              <VStack align="stretch" gap={5}>
                {sortedRfps.length === 0 ? (
                  <Box py="100px" textAlign="center" w="full" borderRadius="3xl"
                    border="1px dashed var(--color-card-border)" bg="var(--color-glass)">
                    <FileText size={48} color="var(--color-card-border)" style={{ margin: "0 auto 16px auto" }} />
                    <Text color="var(--color-text-primary)" fontWeight="black" fontSize="lg" mb={1}>No RFPs Found</Text>
                    <Text color="var(--color-text-muted)" fontSize="xs">
                      We couldn't find any public RFPs matching your search criteria.
                    </Text>
                  </Box>
                ) : (
                  <AnimatePresence>
                    {sortedRfps.map((rfp, idx) => {
                      const isExpanded = expandedRfps[rfp.id] || false;
                      const descriptionSnippet = rfp.description.length > 250
                        ? `${rfp.description.slice(0, 250)}...`
                        : rfp.description;

                      return (
                        <MotionBox
                          key={rfp.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3) }}
                          p={{ base: 5, md: 6 }}
                          borderRadius="2xl"
                          border="1px solid var(--color-card-border)"
                          style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)", transition: "all 0.25s ease" }}
                          _hover={{ borderColor: "var(--color-card-hover-border)", transform: "translateY(-1px)" }}
                        >
                          {/* Post Header: Creator Identity */}
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
                                <HStack gap={2}>
                                  <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="black">
                                    {rfp.company_name}
                                  </Text>
                                  <Badge bg={`${accentColor}12`} color={accentColor} fontSize="4xs" borderRadius="md" letterSpacing="wider">
                                    CLIENT
                                  </Badge>
                                </HStack>
                                <HStack gap={1.5} fontSize="4xs" color="var(--color-text-muted)" fontWeight="bold">
                                  <Clock size={10} />
                                  <Text>{new Date(rfp.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }).toUpperCase()}</Text>
                                </HStack>
                              </VStack>
                            </HStack>

                            {/* Options / Share / Flag button */}
                            <HStack gap={1}>
                              <Button
                                variant="ghost"
                                size="xs"
                                color="var(--color-text-muted)"
                                _hover={{ color: accentColor, bg: "rgba(139,92,246,0.1)" }}
                                onClick={(e) => handleShareRfp(e, rfp)}
                                title="Share RFP"
                              >
                                <Share2 size={14} />
                              </Button>
                              {(!currentUser || rfp.company !== currentUser.company_id) && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  color="var(--color-text-muted)"
                                  _hover={{ color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenFlagModal(rfp);
                                  }}
                                  title="Flag this RFP as inappropriate"
                                >
                                  <Flag size={14} />
                                </Button>
                              )}
                            </HStack>
                          </Flex>

                          {/* Post Content */}
                          <HStack gap={2} align="center" mb={2} wrap="wrap">
                            {rfp.rfp_id && (
                              <Badge variant="outline" colorScheme="gray" fontSize="2xs" px={1.5} py={0.2} borderRadius="sm" color="var(--color-text-muted)">
                                {rfp.rfp_id}
                              </Badge>
                            )}
                            {rfp.version && (
                              <Badge variant="subtle" colorScheme="blue" fontSize="2xs" px={1.5} py={0.2} borderRadius="sm" color="rgba(147,197,253,0.9)" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)" }}>
                                V{rfp.version}
                              </Badge>
                            )}
                            <Heading size="sm" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight" mb={0}>
                              {rfp.title}
                            </Heading>
                          </HStack>
                          
                          <Box mb={5}>
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

                          {/* Post Meta Badges */}
                          <HStack gap={3.5} py={3.5} borderTop="1px solid var(--color-card-border)" wrap="wrap">
                            {rfp.category && (
                              <HStack gap={1.5} px={3} py={1.5} borderRadius="lg" bg="rgba(59,130,246,0.08)" border="1px solid rgba(59,130,246,0.18)">
                                <Text color="rgba(147,197,253,0.9)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                                  {ALL_CATEGORY_LABELS[rfp.category] || rfp.category}
                                </Text>
                              </HStack>
                            )}
                            {rfp.sub_category && (
                              <HStack gap={1.5} px={3} py={1.5} borderRadius="lg" bg="rgba(139,92,246,0.08)" border="1px solid rgba(139,92,246,0.18)">
                                <Text color="rgba(196,181,253,0.9)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                                  {ALL_SUBCATEGORY_LABELS[rfp.sub_category] || rfp.sub_category}
                                </Text>
                              </HStack>
                            )}
                            {rfp.budget && (
                              <HStack gap={1.5} px={3} py={1.5} borderRadius="lg" bg="rgba(16, 185, 129, 0.08)" border="1px solid rgba(16, 185, 129, 0.15)">
                                <Text color="#10b981" fontSize="9px" fontWeight="black" style={{ marginRight: '1px' }}>AED</Text>
                                <Text color="#10b981" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                                  BUDGET: {rfp.budget.replace(/[$₹]/g, '').toUpperCase()}
                                </Text>
                              </HStack>
                            )}
                            {rfp.deadline && (
                              <HStack gap={1.5} px={3} py={1.5} borderRadius="lg" bg="var(--color-input-bg)" border="1px solid var(--color-card-border)">
                                <Calendar size={13} color="var(--color-text-secondary)" />
                                <Text color="var(--color-text-secondary)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                                  DUE: {new Date(rfp.deadline).toLocaleDateString(undefined, { dateStyle: "medium" }).toUpperCase()}
                                </Text>
                              </HStack>
                            )}
                          </HStack>

                          {/* Footer Action Buttons */}
                          <HStack gap={3.5} pt={3.5} borderTop="1px solid var(--color-card-border)" justify="flex-end">
                            <Button
                              h="8"
                              px={4.5}
                              borderRadius="lg"
                              fontSize="3xs"
                              fontWeight="black"
                              letterSpacing="wider"
                              variant="ghost"
                              color="var(--color-text-secondary)"
                              _hover={{ bg: "var(--color-card-border)", color: "var(--color-text-primary)" }}
                              onClick={() => handleViewDetails(rfp)}
                            >
                              VIEW DETAILS
                            </Button>

                            {currentUser && rfp.company === currentUser.company_id ? (
                              <Button
                                h="8"
                                px={4.5}
                                borderRadius="lg"
                                fontSize="3xs"
                                fontWeight="black"
                                letterSpacing="wider"
                                bg="rgba(139,92,246,0.15)"
                                border="1px solid rgba(139,92,246,0.25)"
                                color={accentColor}
                                _hover={{ bg: accentColor, color: "white" }}
                                onClick={() => navigate(`/company/${rfp.company}/rfps`)}
                              >
                                MANAGE
                              </Button>
                            ) : (
                              <Button
                                h="8"
                                px={4.5}
                                borderRadius="lg"
                                fontSize="3xs"
                                fontWeight="black"
                                letterSpacing="wider"
                                bg={accentColor}
                                color="white"
                                _hover={{ filter: "brightness(1.1)" }}
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
                            )}
                          </HStack>
                        </MotionBox>
                      );
                    })}
                  </AnimatePresence>
                )}
              </VStack>
            </VStack>

            {/* ─── RIGHT SIDEBAR: MARKET TRENDS & TIPS (STICKY) ─── */}
            <Box
              display={{ base: "none", xl: "block" }}
              position="sticky"
              top="88px"
              alignSelf="start"
              w="310px"
              zIndex={10}
            >
              <VStack align="stretch" gap={5}>
                {/* 1. Marketplace Stats & Analytics Card */}
                <Box
                  p={5}
                  borderRadius="2xl"
                  border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                >
                  <HStack gap={2.5} mb={4.5}>
                    <TrendingUp size={16} color={accentColor} />
                    <Text color="var(--color-text-primary)" fontWeight="black" fontSize="xs" letterSpacing="tight">
                      Market Insights
                    </Text>
                  </HStack>

                  <VStack align="stretch" gap={4}>
                    <HStack gap={3}>
                      <Circle size="8" bg={`${accentColor}12`} color={accentColor}>
                        <Briefcase size={13} />
                      </Circle>
                      <VStack align="start" gap={0}>
                        <Text color="var(--color-text-primary)" fontWeight="bold" fontSize="2xs">
                          High Demand Activity
                        </Text>
                        <Text color="var(--color-text-muted)" fontSize="4xs">
                          Procurement proposals are up 14% this week.
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Circle size="8" bg="rgba(16, 185, 129, 0.08)" color="#10b981">
                        <DollarSign size={13} />
                      </Circle>
                      <VStack align="start" gap={0}>
                        <Text color="var(--color-text-primary)" fontWeight="bold" fontSize="2xs">
                          Flexible Budget Ranges
                        </Text>
                        <Text color="var(--color-text-muted)" fontSize="4xs">
                          Verified clients offer competitive pricing tiers.
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>

                {/* 2. Interactive Category Filters Panel */}
                <Box
                  p={5}
                  borderRadius="2xl"
                  border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                >
                  <HStack gap={2.5} mb={3.5}>
                    <Award size={16} color={accentColor} />
                    <Text color="var(--color-text-primary)" fontWeight="black" fontSize="xs" letterSpacing="tight">
                      Quick Categories
                    </Text>
                  </HStack>
                  <Flex wrap="wrap" gap={2}>
                    {/* All RFPs reset badge */}
                    <Badge
                      px={2.5} py={1.5} borderRadius="lg" cursor="pointer"
                      fontSize="4xs" fontWeight="black" letterSpacing="wider"
                      bg={selectedCategory === "" ? accentColor : "var(--color-input-bg)"}
                      color={selectedCategory === "" ? "white" : "var(--color-text-secondary)"}
                      border="1px solid"
                      borderColor={selectedCategory === "" ? accentColor : "var(--color-card-border)"}
                      _hover={{ bg: selectedCategory === "" ? accentColor : "var(--color-card-hover-bg)" }}
                      transition="all 0.2s"
                      onClick={() => setSelectedCategory("")}
                    >
                      ALL RFPs
                    </Badge>
                    {CATEGORY_OPTIONS.map((cat) => {
                      const isActive = selectedCategory === cat.value;
                      return (
                        <Badge
                          key={cat.value}
                          px={2.5} py={1.5} borderRadius="lg" cursor="pointer"
                          fontSize="4xs" fontWeight="black" letterSpacing="wider"
                          bg={isActive ? accentColor : "var(--color-input-bg)"}
                          color={isActive ? "white" : "var(--color-text-secondary)"}
                          border="1px solid"
                          borderColor={isActive ? accentColor : "var(--color-card-border)"}
                          _hover={{ bg: isActive ? accentColor : "var(--color-card-hover-bg)", borderColor: isActive ? accentColor : "var(--color-card-hover-border)" }}
                          transition="all 0.2s"
                          onClick={() => setSelectedCategory(isActive ? "" : cat.value)}
                        >
                          {cat.label.toUpperCase()}
                        </Badge>
                      );
                    })}
                  </Flex>
                </Box>

                {/* 3. Vendor Proposals Guidelines Guide */}
                <Box
                  p={5}
                  borderRadius="2xl"
                  border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                >
                  <HStack gap={2.5} mb={3.5}>
                    <Info size={16} color={accentColor} />
                    <Text color="var(--color-text-primary)" fontWeight="black" fontSize="xs" letterSpacing="tight">
                      Proposals Guide
                    </Text>
                  </HStack>
                  
                  <VStack align="start" gap={3} fontSize="3xs" color="var(--color-text-muted)" fontWeight="medium" pl={1}>
                    <HStack align="start" gap={2}>
                      <Circle size="4px" bg={accentColor} mt="6px" />
                      <Text>Review constraints and requirements fully before expressing interest.</Text>
                    </HStack>
                    <HStack align="start" gap={2}>
                      <Circle size="4px" bg={accentColor} mt="6px" />
                      <Text>Submitting comprehensive company overview credentials increases proposal acceptance by 40%.</Text>
                    </HStack>
                    <HStack align="start" gap={2}>
                      <Circle size="4px" bg={accentColor} mt="6px" />
                      <Text>Communicate through in-app message logs once vendor selection initiates.</Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </Box>

          </Grid>
        </Container>
      </Box>

      {/* RFP Interest Modal */}
      {selectedRfp && (
        <RFPInterestModal
          isOpen={isInterestOpen}
          onClose={() => setIsInterestOpen(false)}
          rfp={selectedRfp}
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
