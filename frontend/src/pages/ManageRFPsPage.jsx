import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, Heading,
} from "@chakra-ui/react";
import {
  ArrowLeft, Plus, Edit2, Trash2, FileText, DollarSign, Calendar,
  Building2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RFPModal from "../components/company/RFPModal";
import api from "../api";

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const ManageRFPsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [rfps, setRfps] = useState([]);
  const [interests, setInterests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isRfpModalOpen, setIsRfpModalOpen] = useState(false);
  const [selectedRfp, setSelectedRfp] = useState(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const accentColor = "#8b5cf6"; // Purple accent for RFPs

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };
  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg("");
    setTimeout(() => setErrorMsg(""), 3000);
  };

  const fetchData = async () => {
    try {
      const [cRes, uRes, rRes, riRes] = await Promise.all([
        api.get(`companies/${id}/`),
        api.get("me/"),
        api.get(`rfps/?company_id=${id}`),
        api.get(`rfp-interests/?company_id=${id}`).catch(() => ({ data: [] })),
      ]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
      setRfps(rRes.data);
      setInterests(riRes.data || []);
    } catch (err) {
      console.error(err);
      showError("Failed to load RFPs.");
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

  const handleAddRfp = () => {
    setSelectedRfp(null);
    setIsRfpModalOpen(true);
  };

  const handleEditRfp = (rfp) => {
    setSelectedRfp(rfp);
    setIsRfpModalOpen(true);
  };

  const handleDeleteRfp = async (rfpId) => {
    if (!window.confirm("Are you sure you want to delete this RFP?")) return;
    try {
      await api.delete(`rfps/${rfpId}/`);
      showSuccess("RFP successfully deleted.");
      fetchData();
    } catch (err) {
      showError("Failed to delete RFP.");
    }
  };

  const handleToggleActive = async (rfp) => {
    try {
      await api.patch(`rfps/${rfp.id}/`, { is_active: !rfp.is_active });
      showSuccess(`RFP marked as ${!rfp.is_active ? "active" : "inactive"}.`);
      fetchData();
    } catch (err) {
      showError("Failed to update RFP status.");
    }
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

  if (!company) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)" direction="column" gap={4}>
        <AlertCircle size={48} color="#ef4444" />
        <Text color="var(--color-text-primary)" fontSize="lg" fontWeight="bold">Company not found.</Text>
        <Button onClick={() => navigate("/dashboard")} colorScheme="blue">Back to Dashboard</Button>
      </Flex>
    );
  }

  const isOwner = currentUser && company.creator === currentUser.id;
  const currentUserMemberInfo = company?.members_details?.find((m) => m.id === currentUser?.id);
  const isAdmin = currentUserMemberInfo?.access_role === "admin";
  const hasAccess = isOwner || isAdmin;

  if (!hasAccess) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)" direction="column" gap={4}>
        <AlertCircle size={48} color="#ef4444" />
        <Text color="var(--color-text-primary)" fontSize="lg" fontWeight="bold">Access Denied.</Text>
        <Button onClick={() => navigate("/dashboard")} colorScheme="blue">Back to Dashboard</Button>
      </Flex>
    );
  }

  // Statistical calculations
  const parseBudget = (budgetStr) => {
    if (!budgetStr) return 0;
    const clean = budgetStr.replace(/,/g, "");
    const matches = clean.match(/\d+/g);
    if (!matches) return 0;
    const numbers = matches.map(Number);
    if (numbers.length >= 2) {
      return (numbers[0] + numbers[1]) / 2;
    }
    return numbers[0] || 0;
  };

  const getCurrencySymbol = (list) => {
    for (const r of list) {
      if (!r.budget) continue;
      if (r.budget.includes("₹")) return "₹";
      if (r.budget.includes("$")) return "$";
      if (r.budget.includes("Rs")) return "Rs. ";
    }
    return "$";
  };

  const formatCurrency = (value, symbol) => {
    if (!value) return `${symbol}0`;
    if (value >= 1.0e6) {
      return `${symbol}${(value / 1.0e6).toFixed(1)}M`;
    }
    if (value >= 1.0e3) {
      return `${symbol}${(value / 1.0e3).toFixed(1)}K`;
    }
    return `${symbol}${Math.round(value).toLocaleString()}`;
  };

  const activeRfps = rfps.filter((r) => r.is_active);
  const inactiveRfps = rfps.filter((r) => !r.is_active);

  const activeRfpsCount = activeRfps.length;
  const inactiveRfpsCount = inactiveRfps.length;
  const totalRfpsCount = rfps.length;

  const totalInterestsCount = interests.length;
  const pendingInterestsCount = interests.filter((i) => i.status === "pending").length;
  const acceptedInterestsCount = interests.filter((i) => i.status === "accepted").length;
  const rejectedInterestsCount = interests.filter((i) => i.status === "rejected").length;

  const currencySymbol = getCurrencySymbol(rfps);
  const totalBudgetVolume = rfps.reduce((sum, r) => sum + parseBudget(r.budget), 0);
  const rfpsWithBudget = rfps.filter((r) => parseBudget(r.budget) > 0);
  const averageBudgetVal = rfpsWithBudget.length ? totalBudgetVolume / rfpsWithBudget.length : 0;
  const highestBudgetRfp = rfps.reduce((max, r) => {
    const val = parseBudget(r.budget);
    if (!max || val > parseBudget(max.budget)) return r;
    return max;
  }, null);

  // Category breakdown
  const categoryCounts = {};
  rfps.forEach((r) => {
    const cat = r.category || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Upcoming deadlines
  const upcomingDeadlines = rfps
    .filter((r) => r.is_active && r.deadline && new Date(r.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  const RFPList = ({ list, type }) => {
    if (list.length === 0) {
      return (
        <Flex py={10} px={6} borderRadius="2xl" border="1px dashed var(--color-card-border)" bg="rgba(255,255,255,0.005)" justify="center" align="center">
          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="medium">
            No {type} RFPs posted.
          </Text>
        </Flex>
      );
    }

    return (
      <VStack gap={4} align="stretch">
        <AnimatePresence>
          {list.map((rfp, idx) => (
            <MotionBox
              key={rfp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              p={5}
              borderRadius="2xl"
              border="1px solid var(--color-glass)"
              style={{ background: "rgba(255,255,255,0.015)", backdropFilter: "blur(20px)" }}
              _hover={{ borderColor: "var(--color-card-border)", bg: "var(--color-glass)" }}
            >
              <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={4}>
                {/* Information */}
                <VStack align="start" gap={1.5} flex={1}>
                  <Heading size="xs" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                    {rfp.title}
                  </Heading>
                  <HStack gap={4} wrap="wrap">
                    {rfp.budget && (
                      <HStack gap={1}>
                        <DollarSign size={11} color="#10b981" />
                        <Text color="#10b981" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                          BUDGET: {rfp.budget}
                        </Text>
                      </HStack>
                    )}
                    {rfp.deadline && (
                      <HStack gap={1}>
                        <Calendar size={11} color="var(--color-text-muted)" />
                        <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                          DUE: {new Date(rfp.deadline).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </VStack>

                {/* Actions */}
                <HStack gap={3.5} align="center">
                  <Box cursor="pointer" onClick={() => handleToggleActive(rfp)} title={rfp.is_active ? "Mark Inactive" : "Mark Active"}>
                    {rfp.is_active ? (
                      <ToggleRight size={32} color="#10b981" />
                    ) : (
                      <ToggleLeft size={32} color="var(--color-text-muted)" />
                    )}
                  </Box>
                  <Button h="8" px={3.5} borderRadius="lg" fontSize="3xs" fontWeight="black" letterSpacing="wider"
                    bg="var(--color-glass)" border="1px solid var(--color-card-border)" color="white"
                    _hover={{ bg: "var(--color-card-border)", borderColor: "var(--color-card-border)" }}
                    onClick={() => handleEditRfp(rfp)}
                    leftIcon={<Edit2 size={11} />}
                  >
                    EDIT
                  </Button>
                  <Button h="8" px={3.5} borderRadius="lg" fontSize="3xs" fontWeight="black" letterSpacing="wider"
                    bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.25)" color="#ef4444"
                    _hover={{ bg: "rgba(239,68,68,0.2)", color: "#f87171" }}
                    onClick={() => handleDeleteRfp(rfp.id)}
                    leftIcon={<Trash2 size={11} />}
                  >
                    DELETE
                  </Button>
                </HStack>
              </Flex>
            </MotionBox>
          ))}
        </AnimatePresence>
      </VStack>
    );
  };

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="hidden" pb="100px">
      {/* glows */}
      <Box position="absolute" top="-20%" left="-10%" w="60%" h="60%"
        style={{ background: `${accentColor}12`, filter: "blur(150px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        {/* Global Notifications */}
        <Box position="fixed" top="90px" left="50%" transform="translateX(-50%)" zIndex={100} w="full" maxW="500px" px={4}>
          <AnimatePresence>
            {errorMsg && (
              <MotionFlex initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                bg="rgba(239,68,68,0.92)" backdropFilter="blur(10px)" color="white"
                p={4} borderRadius="xl" mb={3} align="center" gap={3} boxShadow="2xl">
                <AlertCircle size={20} />
                <Text fontSize="sm" fontWeight="bold">{errorMsg}</Text>
              </MotionFlex>
            )}
            {successMsg && (
              <MotionFlex initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                bg="rgba(16,185,129,0.92)" backdropFilter="blur(10px)" color="white"
                p={4} borderRadius="xl" mb={3} align="center" gap={3} boxShadow="2xl">
                <CheckCircle size={20} />
                <Text fontSize="sm" fontWeight="bold">{successMsg}</Text>
              </MotionFlex>
            )}
          </AnimatePresence>
        </Box>

        <Container maxW="1200px" px={{ base: 5, md: 8 }} pt={10}>
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
                Manage Public RFPs
              </Heading>
              <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="medium">
                Add, edit, or close public proposal requests for <strong>{company.name}</strong>
              </Text>
            </VStack>

            <Button h="10" px={5} borderRadius="xl" fontSize="xs" fontWeight="black" letterSpacing="widest" color="white"
              onClick={handleAddRfp}
              style={{
                background: `linear-gradient(135deg, ${accentColor} 0%, rgba(139,92,246,0.8) 100%)`,
                boxShadow: `0 4px 20px rgba(139,92,246,0.3)`
              }}
              _hover={{ transform: "translateY(-1px)", boxShadow: `0 6px 25px rgba(139,92,246,0.4)` }}
              leftIcon={<Plus size={14} />}
            >
              POST NEW RFP
            </Button>
          </Flex>

          <Grid templateColumns={{ base: "1fr", lg: "340px 1fr" }} gap={8} alignItems="start">
            {/* Left Column: Statistics Sidebar */}
            <VStack gap={5} align="stretch" position={{ lg: "sticky" }} top="100px">
              {/* Stat 1: Overview */}
              <Box p={5} borderRadius="2xl" border="1px solid var(--color-card-border)"
                style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}>
                <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={4}>
                  RFP OVERVIEW
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <VStack align="start" gap={0} p={3.5} borderRadius="xl" bg="var(--color-input-bg)" border="1px solid var(--color-glass)">
                    <Text color="#10b981" fontSize="xl" fontWeight="black">{activeRfpsCount}</Text>
                    <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold" letterSpacing="wider">ACTIVE</Text>
                  </VStack>
                  <VStack align="start" gap={0} p={3.5} borderRadius="xl" bg="var(--color-input-bg)" border="1px solid var(--color-glass)">
                    <Text color="var(--color-text-muted)" fontSize="xl" fontWeight="black">{inactiveRfpsCount}</Text>
                    <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold" letterSpacing="wider">INACTIVE</Text>
                  </VStack>
                </Grid>
                <Flex align="center" gap={3} mt={4} p={3.5} borderRadius="xl" bg="var(--color-input-bg)" border="1px solid var(--color-glass)" cursor="pointer" onClick={() => navigate(`/company/${id}/rfp-interests`)}>
                  <Box w="8" h="8" borderRadius="lg" bg="rgba(139,92,246,0.15)" display="flex" alignItems="center" justify="center" border="1px solid rgba(139,92,246,0.3)">
                    <FileText size={16} color={accentColor} />
                  </Box>
                  <VStack align="start" gap={0} flex={1}>
                    <Text color="white" fontSize="md" fontWeight="black">{totalInterestsCount}</Text>
                    <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold" letterSpacing="wider">PROPOSALS RECEIVED</Text>
                  </VStack>
                </Flex>
              </Box>

              {/* Stat 2: Proposal Funnel */}
              <Box p={5} borderRadius="2xl" border="1px solid var(--color-card-border)"
                style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}>
                <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={4}>
                  PROPOSAL STATUS
                </Text>
                <VStack gap={3} align="stretch">
                  <Flex align="center" justify="space-between">
                    <HStack gap={2}>
                      <Box w="2" h="2" borderRadius="full" bg="#f59e0b" />
                      <Text color="var(--color-text-secondary)" fontSize="2xs" fontWeight="bold">Pending</Text>
                    </HStack>
                    <Badge colorScheme="yellow" variant="subtle" fontSize="3xs" px={2} py={0.5} borderRadius="md">
                      {pendingInterestsCount}
                    </Badge>
                  </Flex>
                  <Flex align="center" justify="space-between">
                    <HStack gap={2}>
                      <Box w="2" h="2" borderRadius="full" bg="#10b981" />
                      <Text color="var(--color-text-secondary)" fontSize="2xs" fontWeight="bold">Accepted</Text>
                    </HStack>
                    <Badge colorScheme="green" variant="subtle" fontSize="3xs" px={2} py={0.5} borderRadius="md">
                      {acceptedInterestsCount}
                    </Badge>
                  </Flex>
                  <Flex align="center" justify="space-between">
                    <HStack gap={2}>
                      <Box w="2" h="2" borderRadius="full" bg="#ef4444" />
                      <Text color="var(--color-text-secondary)" fontSize="2xs" fontWeight="bold">Declined</Text>
                    </HStack>
                    <Badge colorScheme="red" variant="subtle" fontSize="3xs" px={2} py={0.5} borderRadius="md">
                      {rejectedInterestsCount}
                    </Badge>
                  </Flex>
                </VStack>
              </Box>

              {/* Stat 3: Budget Insights */}
              <Box p={5} borderRadius="2xl" border="1px solid var(--color-card-border)"
                style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}>
                <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={4}>
                  BUDGET INSIGHTS
                </Text>
                <VStack gap={4} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold" letterSpacing="wider">TOTAL BUDGET VOLUME</Text>
                      <Text color="white" fontSize="md" fontWeight="black">{formatCurrency(totalBudgetVolume, currencySymbol)}</Text>
                    </VStack>
                  </HStack>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold" letterSpacing="wider">AVERAGE RFP BUDGET</Text>
                      <Text color="white" fontSize="md" fontWeight="black">{formatCurrency(averageBudgetVal, currencySymbol)}</Text>
                    </VStack>
                  </HStack>
                  {highestBudgetRfp && (
                    <Box p={3} borderRadius="xl" bg="var(--color-input-bg)" border="1px solid var(--color-glass)">
                      <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold" letterSpacing="wider" mb={1}>HIGHEST BUDGET RFP</Text>
                      <Text color="white" fontSize="xs" fontWeight="black" noOfLines={1} mb={0.5}>{highestBudgetRfp.title}</Text>
                      <Text color="#10b981" fontSize="3xs" fontWeight="black">{highestBudgetRfp.budget}</Text>
                    </Box>
                  )}
                </VStack>
              </Box>

              {/* Stat 4: Categories */}
              {sortedCategories.length > 0 && (
                <Box p={5} borderRadius="2xl" border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}>
                  <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={4}>
                    TOP CATEGORIES
                  </Text>
                  <VStack gap={3.5} align="stretch">
                    {sortedCategories.map(([category, count]) => {
                      const percentage = totalRfpsCount ? (count / totalRfpsCount) * 100 : 0;
                      return (
                        <Box key={category}>
                          <Flex justify="space-between" align="center" mb={1.5}>
                            <Text color="var(--color-text-secondary)" fontSize="3xs" fontWeight="bold" noOfLines={1}>{category.toUpperCase()}</Text>
                            <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold">{count} ({Math.round(percentage)}%)</Text>
                          </Flex>
                          <Box w="full" h="1.5" bg="var(--color-input-bg)" borderRadius="full" overflow="hidden">
                            <Box w={`${percentage}%`} h="full" bg={accentColor} borderRadius="full" />
                          </Box>
                        </Box>
                      );
                    })}
                  </VStack>
                </Box>
              )}

              {/* Stat 5: Upcoming Deadlines */}
              {upcomingDeadlines.length > 0 && (
                <Box p={5} borderRadius="2xl" border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}>
                  <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={4}>
                    UPCOMING DEADLINES
                  </Text>
                  <VStack gap={3} align="stretch">
                    {upcomingDeadlines.map((rfp) => {
                      const daysLeft = Math.ceil((new Date(rfp.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <Flex key={rfp.id} justify="space-between" align="center" p={2.5} borderRadius="lg" bg="var(--color-input-bg)" border="1px solid var(--color-glass)">
                          <VStack align="start" gap={0} flex={1} overflow="hidden">
                            <Text color="white" fontSize="xs" fontWeight="black" noOfLines={1}>{rfp.title}</Text>
                            <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold">DUE: {new Date(rfp.deadline).toLocaleDateString(undefined, { dateStyle: "short" })}</Text>
                          </VStack>
                          <Badge colorScheme={daysLeft <= 7 ? "red" : "purple"} variant="subtle" fontSize="4xs" px={1.5} py={0.5} borderRadius="md" flexShrink={0} ml={2}>
                            {daysLeft === 0 ? "TODAY" : daysLeft === 1 ? "1 DAY LEFT" : `${daysLeft} DAYS LEFT`}
                          </Badge>
                        </Flex>
                      );
                    })}
                  </VStack>
                </Box>
              )}
            </VStack>

            {/* Right Column: Main Content */}
            <VStack gap={8} align="stretch">
              {/* Active RFPs */}
              <Box>
                <HStack gap={2.5} mb={4.5}>
                  <Box w="2px" h="12px" bg="#10b981" borderRadius="full" />
                  <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest">
                    ACTIVE RFPs ({activeRfpsCount})
                  </Text>
                </HStack>
                <RFPList list={activeRfps} type="active" />
              </Box>

              {/* Inactive RFPs */}
              <Box>
                <HStack gap={2.5} mb={4.5}>
                  <Box w="2px" h="12px" bg="var(--color-card-border)" borderRadius="full" />
                  <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest">
                    INACTIVE RFPs ({inactiveRfpsCount})
                  </Text>
                </HStack>
                <RFPList list={inactiveRfps} type="inactive" />
              </Box>
            </VStack>
          </Grid>
        </Container>
      </Box>

      {/* RFP Create/Edit Modal */}
      <RFPModal
        isOpen={isRfpModalOpen}
        onClose={() => setIsRfpModalOpen(false)}
        companyId={company.id}
        rfp={selectedRfp}
        onSaved={fetchData}
      />
    </Box>
  );
};

export default ManageRFPsPage;