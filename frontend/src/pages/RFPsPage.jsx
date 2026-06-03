import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, Heading, Input, Circle, Avatar
} from "@chakra-ui/react";
import {
  FileText, Search, Clock, DollarSign, Calendar, Building2, ChevronRight, AlertCircle, ArrowLeft,
  TrendingUp, User as UserIcon, Briefcase, Award, Info, MapPin, Users, CheckCircle2, MessageSquare, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RFPInterestModal from "../components/company/RFPInterestModal";
import api, { backendUrl } from "../api";

const MotionBox = motion.create(Box);

const RFPsPage = () => {
  const navigate = useNavigate();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${backendUrl}${path}`;
  };

  const [rfps, setRfps] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRfps, setExpandedRfps] = useState({});

  // Modal Control
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInterestOpen, setIsInterestOpen] = useState(false);

  const accentColor = "#8b5cf6"; // Purple accent for RFPs

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const fetchData = async () => {
    try {
      const [rRes, uRes] = await Promise.all([
        api.get("rfps/"),
        api.get("me/"),
      ]);
      setRfps(rRes.data);
      setCurrentUser(uRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetails = (rfp) => {
    setSelectedRfp(rfp);
    setIsDetailsOpen(true);
  };

  const handleOpenInterest = () => {
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

  // Filter RFPs
  const filteredRfps = rfps.filter((rfp) => {
    const q = searchQuery.toLowerCase();
    return (
      rfp.title.toLowerCase().includes(q) ||
      rfp.company_name.toLowerCase().includes(q) ||
      (rfp.description && rfp.description.toLowerCase().includes(q)) ||
      (rfp.requirements && rfp.requirements.toLowerCase().includes(q))
    );
  });

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="visible" pb="100px">
      {/* Ambient glowing blobs */}
      <Box position="absolute" top="-20%" left="-10%" w="60%" h="60%"
        style={{ background: `${accentColor}06`, filter: "blur(150px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />
      <Box position="absolute" bottom="-10%" right="-5%" w="40%" h="40%"
        style={{ background: "rgba(59, 130, 246, 0.04)", filter: "blur(120px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        {/* Full-width container with responsive side margins matching standard grid pages */}
        <Container maxW="1340px" px={{ base: 4, md: 6, lg: 8 }} pt={24}>
          
          <Grid templateColumns={{ base: "1fr", lg: "280px 1fr", xl: "280px 1fr 310px" }} gap={6} alignItems="start">
            
            {/* ─── LEFT SIDEBAR: PROFILE OVERVIEW (STICKY) ─── */}
            <Box
              display={{ base: "none", lg: "block" }}
              position="sticky"
              top="88px"
              alignSelf="start"
              w="280px"
              zIndex={10}
            >
              <VStack align="stretch" gap={5}>
                <Box
                  borderRadius="2xl"
                  border="1px solid var(--color-card-border)"
                  overflow="hidden"
                  style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                >
                  {/* Decorative header banner */}
                  <Box h="60px" bg={`linear-gradient(135deg, ${accentColor} 0%, #3b82f6 100%)`} opacity={0.8} />
                  
                  {/* User Info Block */}
                  <VStack align="center" px={4} pb={5} mt="-32px" textAlign="center" borderBottom="1px solid var(--color-card-border)">
                    <Box
                      w="64px"
                      h="64px"
                      borderRadius="full"
                      border="3px solid var(--color-surface)"
                      overflow="hidden"
                      boxShadow="lg"
                      bg="var(--color-surface)"
                      mb={2}
                      position="relative"
                      zIndex={2}
                    >
                      {currentUser?.profile?.profile_picture ? (
                        <img
                          src={getImageUrl(currentUser.profile.profile_picture)}
                          alt="avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Flex w="full" h="full" align="center" justify="center" bg="var(--color-card-border)">
                          <UserIcon size={24} color="var(--color-text-primary)" />
                        </Flex>
                      )}
                    </Box>
                    <Text color="var(--color-text-primary)" fontWeight="black" fontSize="sm" lineHeight={1.2}>
                      {currentUser?.first_name} {currentUser?.last_name}
                    </Text>
                    <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold" mt={1}>
                      {currentUser?.profile?.headline?.toUpperCase() || "CREATOR / VENDOR"}
                    </Text>
                  </VStack>

                  {/* Marketplace mini-stats */}
                  <VStack align="stretch" p={4} gap={3} fontSize="2xs">
                    <HStack justify="space-between">
                      <Text color="var(--color-text-muted)" fontWeight="semibold">Total Public RFPs</Text>
                      <Badge bg={`${accentColor}15`} color={accentColor} borderRadius="md">{rfps.length}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="var(--color-text-muted)" fontWeight="semibold">Vendor Status</Text>
                      <Badge colorScheme="green" variant="subtle" borderRadius="md">Active</Badge>
                    </HStack>
                  </VStack>

                  {/* Quick actions inside left sidebar */}
                  <Box p={3} borderTop="1px solid var(--color-card-border)" bg="var(--color-input-bg)">
                    <Button
                      w="full"
                      size="sm"
                      h="8"
                      fontSize="3xs"
                      fontWeight="black"
                      letterSpacing="wider"
                      borderRadius="lg"
                      color="white"
                      bg={accentColor}
                      _hover={{ filter: "brightness(1.1)" }}
                      onClick={() => navigate("/profile")}
                    >
                      MY PROFILE
                    </Button>
                  </Box>
                </Box>

                {/* Verified Trust Card */}
                <Box
                  p={4}
                  borderRadius="xl"
                  border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                >
                  <HStack gap={2.5} mb={2}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <Text color="var(--color-text-primary)" fontWeight="black" fontSize="3xs" letterSpacing="wider">
                      VERIFIED CLIENTS
                    </Text>
                  </HStack>
                  <Text color="var(--color-text-muted)" fontSize="3xs" lineHeight="1.5">
                    All proposal listings on Xanatz are published by identity-verified corporate partners for reliable procurement.
                  </Text>
                </Box>
              </VStack>
            </Box>

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
                {filteredRfps.length === 0 ? (
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
                    {filteredRfps.map((rfp, idx) => {
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

                            {/* Options / Share button */}
                            <Button variant="ghost" size="xs" color="var(--color-text-muted)" _hover={{ color: accentColor, bg: "transparent" }}>
                              <ExternalLink size={14} />
                            </Button>
                          </Flex>

                          {/* Post Content */}
                          <Heading size="sm" color="var(--color-text-primary)" fontWeight="black" mb={2} letterSpacing="tight">
                            {rfp.title}
                          </Heading>
                          
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
                            {rfp.budget && (
                              <HStack gap={1.5} px={3} py={1.5} borderRadius="lg" bg="rgba(16, 185, 129, 0.08)" border="1px solid rgba(16, 185, 129, 0.15)">
                                <DollarSign size={13} color="#10b981" />
                                <Text color="#10b981" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                                  BUDGET: {rfp.budget.toUpperCase()}
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
                    {["All RFPs", "Development", "Design", "Consulting", "Marketing", "Writing"].map((cat) => {
                      const isActive = cat === "All RFPs" ? searchQuery === "" : searchQuery.toLowerCase() === cat.toLowerCase();
                      return (
                        <Badge
                          key={cat}
                          px={2.5}
                          py={1.5}
                          borderRadius="lg"
                          cursor="pointer"
                          fontSize="4xs"
                          fontWeight="black"
                          letterSpacing="wider"
                          bg={isActive ? accentColor : "var(--color-input-bg)"}
                          color={isActive ? "white" : "var(--color-text-secondary)"}
                          border="1px solid"
                          borderColor={isActive ? accentColor : "var(--color-card-border)"}
                          _hover={{ bg: isActive ? accentColor : "var(--color-card-hover-bg)", borderColor: isActive ? accentColor : "var(--color-card-hover-border)" }}
                          transition="all 0.2s"
                          onClick={() => setSearchQuery(cat === "All RFPs" ? "" : cat)}
                        >
                          {cat.toUpperCase()}
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

      {/* RFP Detailed Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedRfp && (
          <Box position="fixed" top="0" left="0" right="0" bottom="0" zIndex={999} display="flex" alignItems="center" justifyContent="center">
            {/* Backdrop */}
            <Box position="absolute" top="0" left="0" right="0" bottom="0" bg="rgba(0,0,0,0.8)" backdropFilter="blur(16px)" onClick={() => setIsDetailsOpen(false)} />
            
            <MotionBox initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              p={{ base: 6, md: 8 }} borderRadius="3xl" maxW="680px" w="full" mx={4} border="1px solid var(--color-card-border)"
              style={{ background: "var(--color-dropdown-bg)", backdropFilter: "blur(24px)", boxShadow: "0 30px 90px rgba(0,0,0,0.4)" }}
              position="relative" zIndex={1000}
            >
              {/* Header */}
              <Flex gap={4.5} mb={6} align="start">
                <Box w="14" h="14" borderRadius="2xl" overflow="hidden" border="1px solid var(--color-card-border)" bg="var(--color-surface)" flexShrink={0}>
                  {selectedRfp.company_logo_url ? (
                    <Box as="img" src={selectedRfp.company_logo_url} alt={selectedRfp.company_name} w="full" h="full" style={{ objectFit: "cover" }} />
                  ) : (
                    <Flex w="full" h="full" align="center" justify="center">
                      <Building2 size={24} color={accentColor} />
                    </Flex>
                  )}
                </Box>
                <VStack align="start" gap={0.5} flex={1}>
                  <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="widest">
                    {selectedRfp.company_name.toUpperCase()}
                  </Text>
                  <Heading size="md" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                    {selectedRfp.title}
                  </Heading>
                  <HStack gap={3} pt={1} wrap="wrap">
                    {selectedRfp.budget && (
                      <HStack gap={1}>
                        <DollarSign size={12} color="#10b981" />
                        <Text color="#10b981" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                          BUDGET: {selectedRfp.budget.toUpperCase()}
                        </Text>
                      </HStack>
                    )}
                    {selectedRfp.deadline && (
                      <HStack gap={1}>
                        <Calendar size={12} color="var(--color-text-muted)" />
                        <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                          DUE: {new Date(selectedRfp.deadline).toLocaleDateString(undefined, { dateStyle: "medium" }).toUpperCase()}
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              </Flex>

              {/* Scrollable details */}
              <VStack align="stretch" gap={5} maxH="45vh" overflowY="auto" pr={2} mb={8}>
                {/* Description */}
                <Box>
                  <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="widest" mb={2}>
                    PROJECT DESCRIPTION
                  </Text>
                  <Text color="var(--color-text-secondary)" fontSize="xs" lineHeight="1.6" whiteSpace="pre-wrap">
                    {selectedRfp.description}
                  </Text>
                </Box>

                {/* Requirements */}
                {selectedRfp.requirements && (
                  <Box p={4} borderRadius="xl" bg="var(--color-input-bg)" border="1px solid var(--color-card-border)">
                    <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="widest" mb={2}>
                      PROPOSAL & VENDOR REQUIREMENTS
                    </Text>
                    <Text color="var(--color-text-secondary)" fontSize="xs" lineHeight="1.6" whiteSpace="pre-wrap">
                      {selectedRfp.requirements}
                    </Text>
                  </Box>
                )}
              </VStack>

              {/* Footer */}
              <Flex justify="space-between" align="center" pt={4} borderTop="1px solid var(--color-card-border)">
                <Button variant="ghost" color="var(--color-text-secondary)" fontWeight="black" fontSize="xs" letterSpacing="wider"
                  _hover={{ color: "var(--color-text-primary)", bg: "var(--color-card-border)" }} onClick={() => setIsDetailsOpen(false)}
                >
                  CLOSE
                </Button>

                {/* If company creator, direct to manage, else show Express Interest */}
                {currentUser && selectedRfp.company === currentUser.company_id ? (
                  <Button h="10" px={6} borderRadius="xl" fontSize="xs" fontWeight="black" letterSpacing="wider" color="white"
                    bg={accentColor} _hover={{ filter: "brightness(1.1)" }} onClick={() => navigate(`/company/${selectedRfp.company}/rfps`)}
                  >
                    MANAGE RFP
                  </Button>
                ) : (
                  <Button h="10" px={6} borderRadius="xl" fontSize="xs" fontWeight="black" letterSpacing="wider" color="white"
                    bg="linear-gradient(135deg, #10b981 0%, #059669 100%)" _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 15px rgba(16,185,129,0.3)" }}
                    onClick={handleOpenInterest}
                  >
                    EXPRESS INTEREST
                  </Button>
                )}
              </Flex>
            </MotionBox>
          </Box>
        )}
      </AnimatePresence>

      {/* RFP Interest Modal */}
      {selectedRfp && (
        <RFPInterestModal
          isOpen={isInterestOpen}
          onClose={() => setIsInterestOpen(false)}
          rfp={selectedRfp}
        />
      )}
    </Box>
  );
};

export default RFPsPage;
