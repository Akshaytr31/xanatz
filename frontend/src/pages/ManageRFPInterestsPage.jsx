import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, Heading
} from "@chakra-ui/react";
import {
  ArrowLeft, FileText, Link2, AlertCircle, Building2, CheckCircle,
  Mail, Phone, User, Clock, ChevronDown, ChevronUp, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api, { backendUrl } from "../api";

const MotionBox = motion.create(Box);

const ManageRFPInterestsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [rfps, setRfps] = useState([]);
  const [interests, setInterests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRfpId, setSelectedRfpId] = useState("all");

  // Expanded proposal summary tracking
  const [expandedInterests, setExpandedInterests] = useState({});

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const accentColor = "#10b981"; // Emerald brand color for approvals/success/proposals

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 3000);
  };

  const fetchData = async () => {
    try {
      const [cRes, uRes, rRes, riRes] = await Promise.all([
        api.get(`companies/${id}/`),
        api.get("me/"),
        api.get(`rfps/?company_id=${id}`),
        api.get(`rfp-interests/?company_id=${id}`),
      ]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
      setRfps(rRes.data);
      setInterests(riRes.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleExpandSummary = (interestId) => {
    setExpandedInterests((prev) => ({
      ...prev,
      [interestId]: !prev[interestId],
    }));
  };

  const isOwner = currentUser && company && company.creator === currentUser.id;
  const currentUserMemberInfo = company?.members_details?.find((m) => m.id === currentUser?.id);
  const isAdmin = currentUserMemberInfo?.access_role === "admin";
  const hasAccess = isOwner || isAdmin;

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color="var(--color-accent)" />
          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="black" letterSpacing="widest">
            LOADING PROPOSALS...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (!company || !hasAccess) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)" direction="column" gap={4}>
        <AlertCircle size={48} color="#ef4444" />
        <Text color="var(--color-text-primary)" fontSize="lg" fontWeight="bold">Access Denied.</Text>
        <Button onClick={() => navigate("/dashboard")} colorScheme="blue">Back to Dashboard</Button>
      </Flex>
    );
  }

  // Apply filters
  const filteredInterests = interests.filter((interest) => {
    return selectedRfpId === "all" || String(interest.rfp) === selectedRfpId;
  });

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="hidden" pb="100px">
      {/* glows */}
      <Box position="absolute" top="-20%" left="-10%" w="50%" h="50%"
        style={{ background: `${accentColor}10`, filter: "blur(150px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        <Container maxW="900px" px={{ base: 5, md: 8 }} pt={10}>
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={8}>
            <VStack align="start" gap={1}>
              <Button variant="ghost" color="var(--color-text-muted)" fontWeight="bold" fontSize="2xs"
                letterSpacing="widest" px={0} mb={2} _hover={{ color: "white", transform: "translateX(-4px)" }}
                transition="all 0.3s" onClick={() => navigate(`/company/${id}`)}>
                <ArrowLeft size={13} style={{ marginRight: "6px" }} />
                BACK TO DASHBOARD
              </Button>
              <Heading size="xl" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                RFP Proposals Received
              </Heading>
              <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="medium">
                Review vendor proposals and pitches submitted for <strong>{company.name}</strong>'s RFPs
              </Text>
            </VStack>
          </Flex>

          {/* Toast Message */}
          <AnimatePresence>
            {errorMsg && (
              <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.3)" p={3.5} borderRadius="xl" mb={6}>
                <HStack gap={3}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text color="#ef4444" fontSize="xs" fontWeight="bold">{errorMsg}</Text>
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Filters Bar */}
          <Box p={5} borderRadius="2xl" border="1px solid var(--color-card-border)"
            style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }} mb={8}>
            <VStack align="stretch" gap={1}>
              <Text color="var(--color-text-muted)" fontSize="2xs" fontWeight="black" letterSpacing="wider">FILTER BY SPECIFIC RFP</Text>
              <Box
                as="select"
                value={selectedRfpId}
                onChange={(e) => setSelectedRfpId(e.target.value)}
                style={{
                  background: "var(--color-card-hover-bg)",
                  color: "white",
                  height: "40px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-card-border)",
                  fontSize: "12px",
                  padding: "0 12px",
                  outline: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <option value="all" style={{ background: "#0f172a", color: "white" }}>All Public RFPs ({rfps.length})</option>
                {rfps.map((rfp) => (
                  <option key={rfp.id} value={rfp.id} style={{ background: "#0f172a", color: "white" }}>
                    {rfp.title} ({rfp.is_active ? "Active" : "Closed"})
                  </option>
                ))}
              </Box>
            </VStack>
          </Box>

          {/* Interests List */}
          <VStack gap={5} align="stretch">
            {filteredInterests.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py="80px" px={6} borderRadius="3xl"
                border="1px dashed var(--color-card-border)" bg="var(--color-glass)" textAlign="center">
                <FileText size={48} color="var(--color-card-border)" style={{ marginBottom: "16px" }} />
                <Text color="var(--color-text-primary)" fontWeight="black" fontSize="lg" mb={1}>No Proposals Found</Text>
                <Text color="var(--color-text-muted)" fontSize="xs" maxW="320px">
                  There are no submitted proposal pitches matching your filter.
                </Text>
              </Flex>
            ) : (
              <AnimatePresence>
                {filteredInterests.map((interest, idx) => {
                  const rfpTitle = rfps.find((r) => r.id === interest.rfp)?.title || "Unknown RFP";
                  const isExpanded = !!expandedInterests[interest.id];

                  return (
                    <MotionBox
                      key={interest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      p={{ base: 5, md: 6 }}
                      borderRadius="2xl"
                      border="1px solid var(--color-card-border)"
                      style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                      _hover={{ borderColor: "var(--color-card-border)", bg: "var(--color-glass)" }}
                    >
                      {/* Identity & Header Info */}
                      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4} mb={4}>
                        <HStack gap={4} align="center">
                          <Box w="10" h="10" borderRadius="xl" bg="rgba(16,185,129,0.1)" display="flex" alignItems="center" justify="center"
                            border="1px solid rgba(16,185,129,0.25)">
                            <User size={18} color={accentColor} />
                          </Box>
                          <VStack align="start" gap={0.5}>
                            <Text color="var(--color-text-primary)" fontWeight="black" fontSize="sm" letterSpacing="tight">{interest.company_name}</Text>
                            <HStack gap={3} flexWrap="wrap">
                              <HStack gap={1.5} fontSize="xs" color="var(--color-text-muted)">
                                <Mail size={12} />
                                <Text>{interest.email}</Text>
                              </HStack>
                              {interest.phone_number && (
                                <HStack gap={1.5} fontSize="xs" color="var(--color-text-muted)">
                                  <Phone size={12} />
                                  <Text>{interest.phone_number}</Text>
                                </HStack>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>

                        <VStack align={{ base: "start", md: "end" }} gap={1}>
                          <HStack gap={1.5}>
                            <FileText size={12} color="var(--color-text-muted)" />
                            <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="black">{rfpTitle}</Text>
                          </HStack>
                          <HStack gap={1.5} fontSize="3xs" color="var(--color-text-muted)" fontWeight="bold" letterSpacing="wider">
                            <Clock size={10} />
                            <Text>{new Date(interest.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }).toUpperCase()}</Text>
                          </HStack>
                        </VStack>
                      </Flex>

                      {/* Proposal text & files */}
                      <VStack align="stretch" gap={3.5} p={4} borderRadius="xl" bg="var(--color-input-bg)" border="1px solid var(--color-glass)">
                        <Box>
                          <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="wider" mb={1.5}>
                            PROPOSAL SUMMARY / PITCH
                          </Text>
                          <Text color="var(--color-text-secondary)" fontSize="xs" lineHeight="1.6" noOfLines={isExpanded ? undefined : 3} whiteSpace="pre-wrap">
                            {interest.proposal_summary}
                          </Text>
                          {interest.proposal_summary.split("\n").length > 3 || interest.proposal_summary.length > 250 ? (
                            <Button variant="link" size="xs" color={accentColor} mt={2.5} fontWeight="bold"
                              onClick={() => toggleExpandSummary(interest.id)}
                              rightIcon={isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}>
                              {isExpanded ? "Show Less" : "Read Full Proposal"}
                            </Button>
                          ) : null}
                        </Box>

                        {/* Attachments */}
                        {interest.attached_file && (
                          <HStack gap={3} pt={2} borderTop="1px solid var(--color-card-border)" flexWrap="wrap">
                            <Button
                              as="a"
                              href={
                                interest.attached_file.startsWith("http://") || interest.attached_file.startsWith("https://")
                                  ? interest.attached_file
                                  : `${backendUrl}${interest.attached_file}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              h="7"
                              px={3}
                              borderRadius="md"
                              fontSize="2xs"
                              fontWeight="bold"
                              style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981" }}
                              _hover={{ background: "rgba(16, 185, 129, 0.2)" }}
                              leftIcon={<Download size={11} />}
                            >
                              Download Proposal File
                            </Button>
                          </HStack>
                        )}
                      </VStack>
                    </MotionBox>
                  );
                })}
              </AnimatePresence>
            )}
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default ManageRFPInterestsPage;
