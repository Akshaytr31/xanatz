import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, Heading, Input
} from "@chakra-ui/react";
import {
  FileText, Search, Clock, DollarSign, Calendar, Building2, ChevronRight, AlertCircle, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RFPInterestModal from "../components/company/RFPInterestModal";
import api from "../api";

const MotionBox = motion.create(Box);

const RFPsPage = () => {
  const navigate = useNavigate();

  const [rfps, setRfps] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Control
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInterestOpen, setIsInterestOpen] = useState(false);

  const accentColor = "#8b5cf6"; // Purple accent for RFPs to distinguish from Crimson Jobs

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

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color={accentColor} />
          <Text color="rgba(255,255,255,0.5)" fontSize="xs" fontWeight="black" letterSpacing="widest">
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
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="hidden" pb="100px">
      {/* Ambient backgrounds */}
      <Box position="absolute" top="-20%" left="-10%" w="60%" h="60%"
        style={{ background: `${accentColor}10`, filter: "blur(150px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />
      <Box position="absolute" bottom="-10%" right="-5%" w="40%" h="40%"
        style={{ background: "rgba(16,185,129,0.04)", filter: "blur(120px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        <Container maxW="1000px" px={{ base: 5, md: 8 }} pt={10}>
          {/* Header */}
          <VStack align="start" gap={1} mb={8}>
            <Heading size="xl" color="white" fontWeight="black" letterSpacing="tight">
              Request for Proposals
            </Heading>
            <Text color="rgba(255,255,255,0.4)" fontSize="xs" fontWeight="medium">
              Explore public project proposals posted by verified companies, express interest, and submit bids.
            </Text>
          </VStack>

          {/* Search bar */}
          <HStack bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.06)" px={4} py={1} borderRadius="2xl" mb={8}
            _focusWithin={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }} transition="all 0.2s">
            <Search size={16} color="rgba(255,255,255,0.3)" />
            <Input
              placeholder="Search by RFP title, company, requirements or keyword..."
              variant="unstyled"
              color="white"
              fontSize="sm"
              h="12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </HStack>

          {/* RFPs Cards Listing */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {filteredRfps.length === 0 ? (
              <Box colSpan={2} py="100px" textAlign="center" w="full" borderRadius="3xl"
                border="1px dashed rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.01)">
                <FileText size={48} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 16px auto" }} />
                <Text color="white" fontWeight="black" fontSize="lg" mb={1}>No RFPs Found</Text>
                <Text color="rgba(255,255,255,0.4)" fontSize="xs">
                  We couldn't find any public RFPs matching your search criteria.
                </Text>
              </Box>
            ) : (
              <AnimatePresence>
                {filteredRfps.map((rfp, idx) => (
                  <MotionBox
                    key={rfp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    p={6}
                    borderRadius="2xl"
                    border="1px solid rgba(255,255,255,0.05)"
                    style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}
                    _hover={{ borderColor: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.03)", transform: "translateY(-2px)" }}
                    transition="all 0.3s ease"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                  >
                    <Box>
                      {/* Company Logo & Name */}
                      <HStack gap={3.5} mb={4.5} align="center">
                        <Box w="10" h="10" borderRadius="xl" overflow="hidden" border="1px solid rgba(255,255,255,0.1)" bg="rgba(255,255,255,0.05)" flexShrink={0}>
                          {rfp.company_logo_url ? (
                            <Box as="img" src={rfp.company_logo_url} alt={rfp.company_name} w="full" h="full" style={{ objectFit: "cover" }} />
                          ) : (
                            <Flex w="full" h="full" align="center" justify="center">
                              <Building2 size={16} color={accentColor} />
                            </Flex>
                          )}
                        </Box>
                        <VStack align="start" gap={0}>
                          <Text color="var(--color-secondary)" fontSize="2xs" fontWeight="bold" letterSpacing="widest">
                            {rfp.company_name.toUpperCase()}
                          </Text>
                          <HStack gap={1.5} fontSize="3xs" color="rgba(255,255,255,0.3)" fontWeight="bold">
                            <Clock size={10} />
                            <Text>{new Date(rfp.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }).toUpperCase()}</Text>
                          </HStack>
                        </VStack>
                      </HStack>

                      {/* RFP Title & Description */}
                      <Heading size="sm" color="white" fontWeight="black" mb={2} noOfLines={1} letterSpacing="tight">
                        {rfp.title}
                      </Heading>
                      <Text color="rgba(255,255,255,0.5)" fontSize="xs" mb={5} lineHeight="1.6" noOfLines={3}>
                        {rfp.description}
                      </Text>
                    </Box>

                    {/* Metadata & Footer Button */}
                    <Box>
                      <HStack gap={4} pt={4} mb={5} borderTop="1px solid rgba(255,255,255,0.06)" wrap="wrap">
                        {rfp.budget && (
                          <HStack gap={1}>
                            <DollarSign size={12} color="#10b981" />
                            <Text color="#10b981" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                              BUDGET: {rfp.budget.toUpperCase()}
                            </Text>
                          </HStack>
                        )}
                        {rfp.deadline && (
                          <HStack gap={1}>
                            <Calendar size={12} color="rgba(255,255,255,0.4)" />
                            <Text color="rgba(255,255,255,0.5)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                              DUE: {new Date(rfp.deadline).toLocaleDateString(undefined, { dateStyle: "medium" }).toUpperCase()}
                            </Text>
                          </HStack>
                        )}
                      </HStack>

                      <Button w="full" h="9" borderRadius="xl" fontSize="2xs" fontWeight="black" letterSpacing="wider"
                        bg="rgba(139,92,246,0.12)" border="1px solid rgba(139,92,246,0.25)" color="#8b5cf6"
                        _hover={{ bg: "#8b5cf6", color: "white" }} transition="all 0.2s"
                        onClick={() => handleViewDetails(rfp)}
                        rightIcon={<ChevronRight size={12} />}
                      >
                        VIEW RFP DETAILS
                      </Button>
                    </Box>
                  </MotionBox>
                ))}
              </AnimatePresence>
            )}
          </Grid>
        </Container>
      </Box>

      {/* RFP Detailed Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedRfp && (
          <Box position="fixed" top="0" left="0" right="0" bottom="0" zIndex={999} display="flex" alignItems="center" justifyContent="center">
            {/* Backdrop */}
            <Box position="absolute" top="0" left="0" right="0" bottom="0" bg="rgba(0,0,0,0.85)" backdropFilter="blur(16px)" onClick={() => setIsDetailsOpen(false)} />
            
            <MotionBox initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              p={8} borderRadius="3xl" maxW="680px" w="full" mx={4} border="1px solid rgba(255,255,255,0.08)"
              style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(20,30,55,0.97) 100%)", boxShadow: "0 30px 90px rgba(0,0,0,0.8)" }}
              position="relative" zIndex={1000}
            >
              {/* Header */}
              <Flex gap={4.5} mb={6} align="start">
                <Box w="14" h="14" borderRadius="2xl" overflow="hidden" border="1px solid rgba(255,255,255,0.1)" bg="rgba(255,255,255,0.05)" flexShrink={0}>
                  {selectedRfp.company_logo_url ? (
                    <Box as="img" src={selectedRfp.company_logo_url} alt={selectedRfp.company_name} w="full" h="full" style={{ objectFit: "cover" }} />
                  ) : (
                    <Flex w="full" h="full" align="center" justify="center">
                      <Building2 size={24} color={accentColor} />
                    </Flex>
                  )}
                </Box>
                <VStack align="start" gap={0.5} flex={1}>
                  <Text color="var(--color-secondary)" fontSize="3xs" fontWeight="black" letterSpacing="widest">
                    {selectedRfp.company_name.toUpperCase()}
                  </Text>
                  <Heading size="md" color="white" fontWeight="black" letterSpacing="tight">
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
                        <Calendar size={12} color="rgba(255,255,255,0.4)" />
                        <Text color="rgba(255,255,255,0.5)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
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
                  <Text color="rgba(255,255,255,0.3)" fontSize="3xs" fontWeight="black" letterSpacing="widest" mb={2}>
                    PROJECT DESCRIPTION
                  </Text>
                  <Text color="rgba(255,255,255,0.75)" fontSize="xs" lineHeight="1.6" whiteSpace="pre-wrap">
                    {selectedRfp.description}
                  </Text>
                </Box>

                {/* Requirements */}
                {selectedRfp.requirements && (
                  <Box p={4} borderRadius="xl" bg="rgba(0,0,0,0.15)" border="1px solid rgba(255,255,255,0.03)">
                    <Text color="rgba(255,255,255,0.3)" fontSize="3xs" fontWeight="black" letterSpacing="widest" mb={2}>
                      PROPOSAL & VENDOR REQUIREMENTS
                    </Text>
                    <Text color="rgba(255,255,255,0.7)" fontSize="xs" lineHeight="1.6" whiteSpace="pre-wrap">
                      {selectedRfp.requirements}
                    </Text>
                  </Box>
                )}
              </VStack>

              {/* Footer */}
              <Flex justify="space-between" align="center" pt={4} borderTop="1px solid rgba(255,255,255,0.06)">
                <Button variant="ghost" color="rgba(255,255,255,0.4)" fontWeight="black" fontSize="xs" letterSpacing="wider"
                  _hover={{ color: "white", bg: "rgba(255,255,255,0.05)" }} onClick={() => setIsDetailsOpen(false)}
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
