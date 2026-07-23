import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Container,
  Spinner,
  Badge,
  Grid,
  GridItem,
  Image,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  Clock,
  Zap,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import JobOpeningModal, {
  INDUSTRY_LABELS,
} from "../components/company/JobOpeningModal";
import PricingPlansModal from "../components/company/PricingPlansModal";
import api from "../api";

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const JOB_TYPE_LABELS = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

const ManageOpeningsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const accentColor = "#CD2426";

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
      const [cRes, uRes, jRes] = await Promise.all([
        api.get(`companies/${id}/`),
        api.get("me/"),
        api.get(`jobs/?company_id=${id}`),
      ]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
      setJobs(jRes.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load data.");
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

  const handleAddJob = () => {
    // Check credits before allowing job creation
    const sub = company?.active_subscription;
    if (!sub || sub.is_credits_exhausted) {
      setIsPlanModalOpen(true);
      return;
    }
    setSelectedJob(null);
    setIsJobModalOpen(true);
  };
  const handleEditJob = (job) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Delete this job opening?")) return;
    try {
      await api.delete(`jobs/${jobId}/`);
      showSuccess("Job opening deleted.");
      fetchData();
    } catch (err) {
      showError("Failed to delete job opening.");
    }
  };

  const handleToggleActive = async (job) => {
    try {
      await api.patch(`jobs/${job.id}/`, { is_active: !job.is_active });
      showSuccess(`Job marked as ${!job.is_active ? "active" : "inactive"}.`);
      fetchData();
    } catch (err) {
      showError("Failed to update job status.");
    }
  };

  if (loading)
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color="var(--color-accent)" />
          <Text
            color="var(--color-text-muted)"
            fontSize="xs"
            fontWeight="black"
            letterSpacing="widest"
          >
            LOADING...
          </Text>
        </VStack>
      </Flex>
    );

  if (!company)
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <Text color="var(--color-text-primary)">Company not found.</Text>
      </Flex>
    );

  const isOwner = currentUser && company.creator === currentUser.id;
  const currentUserMemberInfo = company?.members_details?.find(
    (m) => m.id === currentUser?.id,
  );
  const isAdmin = currentUserMemberInfo?.access_role === "admin";
  const hasAccess = isOwner || isAdmin;

  const activeJobs = jobs.filter((j) => j.is_active);
  const inactiveJobs = jobs.filter((j) => !j.is_active);

  const sub = company?.active_subscription;
  const percentCreditsUsed = sub ? (sub.jobs_used / sub.max_jobs) * 100 : 0;

  const JOBS_PER_PAGE = 5;
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / JOBS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedJobs = sortedJobs.slice((safePage - 1) * JOBS_PER_PAGE, safePage * JOBS_PER_PAGE);

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, safePage - delta); i <= Math.min(totalPages - 1, safePage + delta); i++) {
      range.push(i);
    }
    const pages = [1];
    if (range[0] > 2) pages.push("...");
    pages.push(...range);
    if (range[range.length - 1] < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  return (
    <Box
      minH="100vh"
      bg="var(--color-primary)"
      position="relative"
      overflow="clip"
      pb="100px"
    >
      {/* Background glows */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="60%"
        h="60%"
        style={{ background: `${accentColor}08`, filter: "blur(180px)" }}
        borderRadius="full"
        zIndex={0}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        w="40%"
        h="40%"
        style={{ background: "rgba(59,130,246,0.05)", filter: "blur(150px)" }}
        borderRadius="full"
        zIndex={0}
        pointerEvents="none"
      />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        {/* Toast notifications */}
        <Box
          position="fixed"
          top="90px"
          left="50%"
          transform="translateX(-50%)"
          zIndex={100}
          w="full"
          maxW="500px"
          px={4}
        >
          <AnimatePresence>
            {errorMsg && (
              <MotionFlex
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                bg="rgba(239,68,68,0.92)"
                backdropFilter="blur(10px)"
                color="white"
                p={4}
                borderRadius="xl"
                mb={3}
                align="center"
                gap={3}
                boxShadow="2xl"
              >
                <AlertCircle size={20} />
                <Text fontSize="sm" fontWeight="bold">
                  {errorMsg}
                </Text>
              </MotionFlex>
            )}
            {successMsg && (
              <MotionFlex
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                bg="rgba(34,197,94,0.92)"
                backdropFilter="blur(10px)"
                color="white"
                p={4}
                borderRadius="xl"
                mb={3}
                align="center"
                gap={3}
                boxShadow="2xl"
              >
                <CheckCircle size={20} />
                <Text fontSize="sm" fontWeight="bold">
                  {successMsg}
                </Text>
              </MotionFlex>
            )}
          </AnimatePresence>
        </Box>

        <Container maxW="container.xl" px={{ base: 6, md: 10 }} pt={8}>
          {/* Header Action Back Button */}
          <Button
            variant="ghost"
            color="var(--color-text-muted)"
            fontWeight="black"
            fontSize="3xs"
            letterSpacing="widest"
            px={0}
            mb={6}
            _hover={{ color: "white", transform: "translateX(-4px)" }}
            transition="all 0.3s"
            onClick={() => navigate(`/company/${id}`)}
          >
            <ArrowLeft size={12} style={{ marginRight: "6px" }} />
            BACK TO COMPANY
          </Button>

          {/* Hero Banner Section */}
          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align={{ base: "stretch", lg: "center" }}
            mb={8}
            p={6}
            borderRadius="2xl"
            border="1px solid var(--color-card-border)"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,28,48,0.4) 0%, rgba(10,15,30,0.4) 100%)",
              backdropFilter: "blur(24px)",
            }}
            gap={6}
          >
            <HStack gap={5}>
              <Flex
                w="64px"
                h="64px"
                borderRadius="xl"
                align="center"
                justify="center"
                overflow="hidden"
                border="1px solid var(--color-card-border)"
                bg="var(--color-card-bg)"
              >
                {company.logo_url ? (
                  <Image
                    src={company.logo_url}
                    alt={company.name}
                    objectFit="cover"
                    w="full"
                    h="full"
                  />
                ) : (
                  <Building2 size={30} color="var(--color-text-muted)" />
                )}
              </Flex>
              <VStack align="start" gap={1}>
                <HStack gap={2}>
                  <Text
                    fontSize="2xl"
                    fontWeight="black"
                    color="var(--color-text-primary)"
                    letterSpacing="tight"
                  >
                    {company.name}
                  </Text>
                  <Badge
                    fontSize="9px"
                    fontWeight="black"
                    px={2.5}
                    py={0.5}
                    borderRadius="full"
                    style={{
                      background: "rgba(205, 36, 38, 0.1)",
                      color: accentColor,
                      border: `1px solid ${accentColor}25`,
                    }}
                  >
                    OWNER CONSOLE
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="var(--color-text-muted)">
                  Manage job vacancies, track expiration, and control
                  visibility.
                </Text>
              </VStack>
            </HStack>

            {hasAccess && (
              <Button
                px={6}
                h="48px"
                borderRadius="xl"
                fontWeight="black"
                fontSize="xs"
                letterSpacing="widest"
                color="white"
                onClick={handleAddJob}
                style={{
                  background: `linear-gradient(135deg, ${accentColor} 0%, #E53E3E 100%)`,
                  boxShadow: `0 8px 24px rgba(205, 36, 38, 0.35)`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 32px rgba(205, 36, 38, 0.5)`,
                  filter: "brightness(1.1)",
                }}
              >
                <Plus size={15} style={{ marginRight: "8px" }} />
                ADD NEW OPENING
              </Button>
            )}
          </Flex>

          {/* Main Content Grid */}
          <Grid
            templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }}
            gap={8}
            alignItems="start"
          >
            {/* Left Column: Job List (8 cols) */}
            <GridItem colSpan={{ base: 1, lg: 8 }}>
              {jobs.length === 0 ? (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  p={16}
                  borderRadius="2xl"
                  border="1px dashed var(--color-card-border)"
                  style={{ background: "var(--color-glass)" }}
                  textAlign="center"
                >
                  <Box
                    w="80px"
                    h="80px"
                    borderRadius="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={5}
                    style={{
                      background: "var(--color-glass)",
                      border: "1px solid var(--color-card-border)",
                    }}
                  >
                    <Briefcase size={32} color="var(--color-card-border)" />
                  </Box>
                  <Text
                    color="var(--color-text-muted)"
                    fontSize="lg"
                    fontWeight="bold"
                    mb={2}
                  >
                    No job openings yet
                  </Text>
                  <Text color="var(--color-card-border)" fontSize="sm" mb={6}>
                    Post your first opening to attract talent.
                  </Text>
                  {hasAccess && (
                    <Button
                      onClick={handleAddJob}
                      px={6}
                      h="44px"
                      borderRadius="lg"
                      fontWeight="black"
                      fontSize="xs"
                      letterSpacing="widest"
                      color="white"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor} 0%, #E53E3E 100%)`,
                        boxShadow: `0 6px 20px rgba(205, 36, 38, 0.25)`,
                        border: "1px solid var(--color-card-border)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                      }}
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: `0 10px 24px rgba(205, 36, 38, 0.4)`,
                        filter: "brightness(1.1)",
                      }}
                    >
                      <Plus size={14} style={{ marginRight: "7px" }} />
                      POST FIRST OPENING
                    </Button>
                  )}
                </MotionBox>
              ) : (
                <VStack gap={6} align="stretch">
                  {/* Unified Openings list with stats */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                      <HStack gap={2.5}>
                        <Box
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg="#10b981"
                          style={{ boxShadow: "0 0 10px #10b981" }}
                        />
                        <Text
                          color="var(--color-text-muted)"
                          fontSize="10px"
                          fontWeight="black"
                          letterSpacing="widest"
                        >
                          ADDED JOBS — {jobs.length}
                        </Text>
                      </HStack>
                      <HStack gap={3} fontSize="11px" color="var(--color-text-secondary)" fontWeight="bold">
                        <Text color="#10b981">● {activeJobs.length} Active</Text>
                        <Text color="var(--color-text-muted)">● {inactiveJobs.length} Inactive</Text>
                        {totalPages > 1 && (
                          <Text color="var(--color-text-muted)">· Page {safePage} of {totalPages}</Text>
                        )}
                      </HStack>
                    </Flex>

                    <Grid templateColumns={{ base: "1fr", md: "1fr" }} gap={4}>
                      <AnimatePresence mode="popLayout">
                        {pagedJobs.map((job, i) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            index={i}
                            hasAccess={hasAccess}
                            accentColor={accentColor}
                            onEdit={handleEditJob}
                            onDelete={handleDeleteJob}
                            onToggle={handleToggleActive}
                          />
                        ))}
                      </AnimatePresence>
                    </Grid>
                  </Box>

                  {/* ── Pagination Controls ── */}
                  {totalPages > 1 && (
                    <Flex align="center" justify="center" gap={1.5} mt={6} wrap="wrap">
                      {/* First */}
                      <Box
                        as="button"
                        onClick={() => setCurrentPage(1)}
                        disabled={safePage === 1}
                        p={2}
                        borderRadius="lg"
                        color={safePage === 1 ? "var(--color-text-muted)" : "var(--color-text-secondary)"}
                        opacity={safePage === 1 ? 0.35 : 1}
                        cursor={safePage === 1 ? "not-allowed" : "pointer"}
                        _hover={{ bg: safePage === 1 ? "transparent" : "var(--color-card-hover-bg)" }}
                        transition="all 0.2s"
                        display="flex"
                        alignItems="center"
                        border="1px solid var(--color-card-border)"
                        style={{ background: "var(--color-glass)" }}
                      >
                        <ChevronsLeft size={14} />
                      </Box>

                      {/* Prev */}
                      <Box
                        as="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        p={2}
                        borderRadius="lg"
                        color={safePage === 1 ? "var(--color-text-muted)" : "var(--color-text-secondary)"}
                        opacity={safePage === 1 ? 0.35 : 1}
                        cursor={safePage === 1 ? "not-allowed" : "pointer"}
                        _hover={{ bg: safePage === 1 ? "transparent" : "var(--color-card-hover-bg)" }}
                        transition="all 0.2s"
                        display="flex"
                        alignItems="center"
                        border="1px solid var(--color-card-border)"
                        style={{ background: "var(--color-glass)" }}
                      >
                        <ChevronLeft size={14} />
                      </Box>

                      {/* Page numbers */}
                      {getPageNumbers().map((page, idx) =>
                        page === "..." ? (
                          <Text key={`ellipsis-${idx}`} fontSize="xs" color="var(--color-text-muted)" px={2}>
                            …
                          </Text>
                        ) : (
                          <Box
                            key={page}
                            as="button"
                            onClick={() => setCurrentPage(page)}
                            minW="32px"
                            h="32px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="lg"
                            fontSize="xs"
                            fontWeight={safePage === page ? "black" : "medium"}
                            color={safePage === page ? "white" : "var(--color-text-secondary)"}
                            style={{
                              background: safePage === page ? accentColor : "var(--color-glass)",
                              border: safePage === page ? `1px solid ${accentColor}` : "1px solid var(--color-card-border)",
                              boxShadow: safePage === page ? `0 0 12px ${accentColor}40` : "none",
                            }}
                            _hover={{
                              bg: safePage === page ? accentColor : "var(--color-card-hover-bg)",
                              borderColor: safePage === page ? accentColor : "var(--color-accent)",
                            }}
                            transition="all 0.2s"
                            cursor="pointer"
                          >
                            {page}
                          </Box>
                        )
                      )}

                      {/* Next */}
                      <Box
                        as="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        p={2}
                        borderRadius="lg"
                        color={safePage === totalPages ? "var(--color-text-muted)" : "var(--color-text-secondary)"}
                        opacity={safePage === totalPages ? 0.35 : 1}
                        cursor={safePage === totalPages ? "not-allowed" : "pointer"}
                        _hover={{ bg: safePage === totalPages ? "transparent" : "var(--color-card-hover-bg)" }}
                        transition="all 0.2s"
                        display="flex"
                        alignItems="center"
                        border="1px solid var(--color-card-border)"
                        style={{ background: "var(--color-glass)" }}
                      >
                        <ChevronRight size={14} />
                      </Box>

                      {/* Last */}
                      <Box
                        as="button"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={safePage === totalPages}
                        p={2}
                        borderRadius="lg"
                        color={safePage === totalPages ? "var(--color-text-muted)" : "var(--color-text-secondary)"}
                        opacity={safePage === totalPages ? 0.35 : 1}
                        cursor={safePage === totalPages ? "not-allowed" : "pointer"}
                        _hover={{ bg: safePage === totalPages ? "transparent" : "var(--color-card-hover-bg)" }}
                        transition="all 0.2s"
                        display="flex"
                        alignItems="center"
                        border="1px solid var(--color-card-border)"
                        style={{ background: "var(--color-glass)" }}
                      >
                        <ChevronsRight size={14} />
                      </Box>
                    </Flex>
                  )}
                </VStack>
              )}
            </GridItem>

            <GridItem colSpan={{ base: 1, lg: 4 }} position={{ base: "static", lg: "sticky" }} top="90px" alignSelf="start">
              <VStack gap={6} align="stretch">
                {/* Subscription / Plan Panel */}
                <MotionBox
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  p={6}
                  borderRadius="2xl"
                  border="1px solid var(--color-card-border)"
                  style={{
                    background: sub
                      ? "linear-gradient(135deg, rgba(30,41,59,0.3) 0%, rgba(15,23,42,0.5) 100%)"
                      : "linear-gradient(135deg, rgba(245,158,11,0.03) 0%, rgba(15,23,42,0.5) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <Text
                    color="var(--color-text-muted)"
                    fontSize="9px"
                    fontWeight="black"
                    letterSpacing="widest"
                    mb={4}
                  >
                    PLAN & BALANCE
                  </Text>

                  {sub ? (
                    <VStack align="stretch" gap={4}>
                      <Flex justify="space-between" align="center">
                        <HStack gap={2.5}>
                          <Flex
                            w="36px"
                            h="36px"
                            borderRadius="xl"
                            align="center"
                            justify="center"
                            style={{
                              background: "rgba(59,130,246,0.1)",
                              border: "1px solid rgba(59,130,246,0.2)",
                            }}
                          >
                            <Sparkles size={16} color="#3b82f6" />
                          </Flex>
                          <VStack align="start" gap={0}>
                            <Text
                              color="var(--color-text-primary)"
                              fontSize="sm"
                              fontWeight="bold"
                            >
                              {sub.plan_display_name} Plan
                            </Text>
                            <Text
                              color="var(--color-text-muted)"
                              fontSize="10px"
                            >
                              Expires in {sub.job_duration_days} days
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge
                          px={2}
                          py={0.5}
                          borderRadius="full"
                          fontSize="8px"
                          fontWeight="black"
                          color="#3b82f6"
                          bg="rgba(59,130,246,0.1)"
                        >
                          ACTIVE
                        </Badge>
                      </Flex>

                      {/* Usage Meter */}
                      <VStack align="stretch" gap={1.5} mt={2}>
                        <Flex justify="space-between" fontSize="xs">
                          <Text
                            color="var(--color-text-secondary)"
                            fontWeight="medium"
                          >
                            Credits Used
                          </Text>
                          <Text
                            color="var(--color-text-primary)"
                            fontWeight="bold"
                          >
                            {sub.jobs_used} / {sub.max_jobs} jobs
                          </Text>
                        </Flex>
                        <Box
                          w="100%"
                          h="6px"
                          bg="var(--color-card-border)"
                          borderRadius="full"
                          overflow="hidden"
                          position="relative"
                        >
                          <MotionBox
                            initial={{ width: 0 }}
                            animate={{ width: `${percentCreditsUsed}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            h="100%"
                            style={{
                              background:
                                "linear-gradient(90deg, #3b82f680, #3b82f6)",
                              boxShadow: "0 0 8px rgba(59,130,246,0.4)",
                            }}
                            borderRadius="full"
                          />
                        </Box>
                        <Flex
                          justify="space-between"
                          fontSize="10px"
                          color="var(--color-text-muted)"
                          mt={0.5}
                        >
                          <Text>{sub.jobs_remaining} remaining</Text>
                          <Text>{sub.max_jobs - sub.jobs_used} available</Text>
                        </Flex>
                      </VStack>

                      {/* Actions */}
                      <Button
                        w="full"
                        h="38px"
                        borderRadius="lg"
                        fontWeight="black"
                        fontSize="2xs"
                        letterSpacing="wider"
                        color="white"
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                          boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                        }}
                        _hover={{ filter: "brightness(1.1)" }}
                        onClick={() => setIsPlanModalOpen(true)}
                        gap={1}
                      >
                        UPGRADE / MANAGE PLAN
                        <ChevronRight size={12} />
                      </Button>
                    </VStack>
                  ) : (
                    <VStack align="stretch" gap={4} py={2}>
                      <HStack gap={3}>
                        <Flex
                          w="36px"
                          h="36px"
                          borderRadius="xl"
                          align="center"
                          justify="center"
                          style={{
                            background: "rgba(245,158,11,0.1)",
                            border: "1px solid rgba(245,158,11,0.2)",
                          }}
                        >
                          <Zap size={16} color="#f59e0b" />
                        </Flex>
                        <VStack align="start" gap={0}>
                          <Text
                            color="var(--color-text-primary)"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            No Active Plan
                          </Text>
                          <Text color="var(--color-text-muted)" fontSize="10px">
                            Active plan required to list vacancies
                          </Text>
                        </VStack>
                      </HStack>

                      <Button
                        w="full"
                        h="38px"
                        borderRadius="lg"
                        fontWeight="black"
                        fontSize="2xs"
                        letterSpacing="wider"
                        color="white"
                        style={{
                          background:
                            "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                        }}
                        _hover={{ filter: "brightness(1.1)" }}
                        onClick={() => setIsPlanModalOpen(true)}
                      >
                        ACTIVATE PLAN
                      </Button>
                    </VStack>
                  )}
                </MotionBox>

                {/* Information Card */}
                <Box
                  p={5}
                  borderRadius="2xl"
                  border="1px solid var(--color-card-border)"
                  style={{ background: "rgba(10,15,30,0.2)" }}
                >
                  <HStack gap={2} mb={3}>
                    <Info size={14} color="var(--color-text-muted)" />
                    <Text
                      fontSize="10px"
                      color="var(--color-text-muted)"
                      fontWeight="black"
                      letterSpacing="wider"
                    >
                      QUICK TIPS
                    </Text>
                  </HStack>
                  <VStack
                    align="stretch"
                    gap={3}
                    fontSize="xs"
                    color="var(--color-text-secondary)"
                  >
                    <Text>
                      • Toggle any posting to <strong>Inactive</strong> to hide
                      it instantly from candidates.
                    </Text>
                    <Text>
                      • Deleting a job deletes all applications received for it
                      permanently.
                    </Text>
                    <Text>
                      • Standard and Premium plans grant priority listing
                      placements in search results.
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      <JobOpeningModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        companyId={company.id}
        company={company}
        job={selectedJob}
        onSaved={() => {
          fetchData();
          showSuccess("Job opening saved.");
        }}
        onCreditExhausted={() => setIsPlanModalOpen(true)}
      />

      <PricingPlansModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        companyId={company.id}
        currentPlan={company.active_subscription?.plan_name}
        onSubscribed={() => {
          fetchData();
          showSuccess("Plan activated successfully!");
        }}
      />
    </Box>
  );
};

// ── Individual Job Card ──────────────────────────────────────────────────────
const JobCard = ({
  job,
  index,
  hasAccess,
  accentColor,
  onEdit,
  onDelete,
  onToggle,
}) => (
  <MotionBox
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={{ duration: 0.25, delay: index * 0.04 }}
    p={6}
    borderRadius="xl"
    border={`1px solid ${job.is_active ? "var(--color-card-border)" : "rgba(255,255,255,0.03)"}`}
    style={{
      background: job.is_active
        ? "var(--color-glass)"
        : "rgba(255,255,255,0.01)",
      backdropFilter: "blur(12px)",
      opacity: job.is_active ? 1 : 0.65,
      transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
    }}
    _hover={{
      borderColor: `${accentColor}30`,
      background: `${accentColor}06`,
      transform: "translateY(-2px)",
    }}
  >
    <Flex align="start" justify="space-between" gap={4} wrap="wrap">
      {/* Left: job info */}
      <VStack align="start" gap={3} flex={1} minW={0}>
        <VStack align="start" gap={1.5}>
          <HStack gap={2.5} flexWrap="wrap">
            {job.job_id && (
              <Badge variant="outline" colorScheme="gray" fontSize="2xs" px={1.5} py={0.2} borderRadius="sm" color="var(--color-text-muted)">
                {job.job_id}
              </Badge>
            )}
            <Text
              color="var(--color-text-primary)"
              fontSize="md"
              fontWeight="bold"
              letterSpacing="tight"
              noOfLines={1}
            >
              {job.title}
            </Text>

            {/* Status indicators */}
            {!job.is_active && (
              <Badge
                fontSize="8px"
                fontWeight="black"
                px={2}
                py={0.5}
                borderRadius="full"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "var(--color-text-muted)",
                }}
              >
                INACTIVE
              </Badge>
            )}
            {job.is_expired && (
              <Badge
                fontSize="8px"
                fontWeight="black"
                px={2}
                py={0.5}
                borderRadius="full"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                EXPIRED
              </Badge>
            )}
            {job.expires_at && !job.is_expired && (
              <HStack
                gap={1}
                px={2}
                py={0.5}
                borderRadius="full"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <Clock size={10} color="var(--color-text-muted)" />
                <Text
                  fontSize="9px"
                  color="var(--color-text-muted)"
                  fontWeight="bold"
                >
                  Expires {new Date(job.expires_at).toLocaleDateString()}
                </Text>
              </HStack>
            )}
          </HStack>
        </VStack>

        {/* Chips Grid */}
        <HStack gap={2.5} flexWrap="wrap">
          <Badge
            px={2.5}
            py={0.5}
            fontSize="2xs"
            fontWeight="black"
            borderRadius="md"
            style={{
              background: "var(--color-card-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            {JOB_TYPE_LABELS[job.job_type] || job.job_type}
          </Badge>
          {job.industry && (
            <Badge
              px={2.5}
              py={0.5}
              fontSize="2xs"
              fontWeight="black"
              borderRadius="md"
              style={{
                background: "rgba(205, 36, 38, 0.1)",
                color: "rgba(255, 130, 130, 0.9)",
                border: "1px solid rgba(205, 36, 38, 0.2)",
              }}
            >
              {INDUSTRY_LABELS[job.industry] || job.industry}
            </Badge>
          )}
          {job.location && (
            <HStack gap={1} fontSize="xs" color="var(--color-text-muted)">
              <MapPin size={12} color="var(--color-text-muted)" />
              <Text>{job.location}</Text>
            </HStack>
          )}
          {job.salary_range && (
            <HStack gap={1} fontSize="xs" color="var(--color-text-muted)">
              <DollarSign size={12} color="var(--color-text-muted)" />
              <Text>{job.salary_range}</Text>
            </HStack>
          )}
        </HStack>

        {job.description && (
          <Text
            color="var(--color-text-muted)"
            fontSize="xs"
            lineHeight="1.8"
            noOfLines={2}
          >
            {job.description}
          </Text>
        )}
        {job.requirements && (
          <Text
            color="var(--color-text-secondary)"
            fontSize="2xs"
            noOfLines={1}
            fontStyle="italic"
          >
            Skills Required: {job.requirements}
          </Text>
        )}
      </VStack>

      {/* Right: actions */}
      {hasAccess && (
        <VStack gap={3} flexShrink={0} align="end">
          {/* Toggle active button */}
          <Button
            size="xs"
            h="7"
            px={3}
            borderRadius="full"
            fontWeight="bold"
            fontSize="2xs"
            letterSpacing="wider"
            color={job.is_active ? "#10b981" : "var(--color-text-muted)"}
            border="1px solid"
            borderColor={
              job.is_active
                ? "rgba(16,185,129,0.3)"
                : "var(--color-card-border)"
            }
            bg={job.is_active ? "rgba(16,185,129,0.08)" : "var(--color-glass)"}
            _hover={{
              bg: job.is_active
                ? "rgba(16,185,129,0.15)"
                : "var(--color-card-border)",
            }}
            onClick={() => onToggle(job)}
            gap={1}
          >
            {job.is_active ? (
              <ToggleRight size={12} />
            ) : (
              <ToggleLeft size={12} />
            )}
            {job.is_active ? "ACTIVE" : "INACTIVE"}
          </Button>

          <HStack gap={1}>
            <Button
              size="xs"
              variant="ghost"
              color="var(--color-text-muted)"
              _hover={{ bg: "var(--color-card-border)", color: "white" }}
              onClick={() => onEdit(job)}
              title="Edit"
            >
              <Edit2 size={13} />
            </Button>
            <Button
              size="xs"
              variant="ghost"
              color="rgba(239,68,68,0.7)"
              _hover={{
                bg: "rgba(239,68,68,0.12)",
                color: "rgba(239,68,68,0.9)",
              }}
              onClick={() => onDelete(job.id)}
              title="Delete"
            >
              <Trash2 size={13} />
            </Button>
          </HStack>
        </VStack>
      )}
    </Flex>
  </MotionBox>
);

export default ManageOpeningsPage;
