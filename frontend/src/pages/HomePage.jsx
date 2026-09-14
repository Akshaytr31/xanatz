import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  Building2,
  Briefcase,
  Users,
  FileText,
  Search,
  ArrowRight,
  Sparkles,
  Plus,
  CheckCircle2,
  MapPin,
  Globe,
  Star,
  User,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Send,
  SlidersHorizontal,
  ChevronRight,
  ClipboardList,
  Layers,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAccount } from "../context/AccountContext";
import api from "../api";

const MotionBox = motion.create(Box);

const INDUSTRY_OPTIONS = [
  "All",
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Media",
  "Consulting",
  "Real Estate",
];

const HomePage = () => {
  const navigate = useNavigate();
  const { accountMode, activeCompany, userCompanies, user } = useAccount();

  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [rfps, setRfps] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
      return;
    }

    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [compRes, jobsRes, rfpsRes, appsRes] = await Promise.all([
          api.get("companies/").catch(() => ({ data: [] })),
          api.get("jobs/").catch(() => ({ data: [] })),
          api.get("rfps/").catch(() => ({ data: [] })),
          api.get("applications/").catch(() => ({ data: [] })),
        ]);

        setCompanies(compRes.data || []);
        setJobs(jobsRes.data || []);
        setRfps(rfpsRes.data || []);
        setMyApplications(appsRes.data || []);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [navigate]);

  // Derive companies that are providing jobs for Personal mode
  const jobProvidingCompanies = useMemo(() => {
    // Map job count per company
    const companyJobCount = {};
    jobs.forEach((job) => {
      const compId = job.company?.id || job.company;
      if (compId) {
        companyJobCount[compId] = (companyJobCount[compId] || 0) + 1;
      }
    });

    return companies.map((c) => ({
      ...c,
      open_jobs_count: companyJobCount[c.id] || 0,
    }));
  }, [companies, jobs]);

  // Filtered companies based on search and industry tag
  const filteredCompanies = useMemo(() => {
    return jobProvidingCompanies.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tagline && c.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesIndustry =
        selectedIndustry === "All" ||
        (c.industry && c.industry.toLowerCase().includes(selectedIndustry.toLowerCase()));

      return matchesSearch && matchesIndustry;
    });
  }, [jobProvidingCompanies, searchQuery, selectedIndustry]);

  return (
    <Box minH="100vh" style={{ background: "var(--color-bg, #0b0f19)" }}>
      <Navbar />

      <Box maxW="1280px" mx="auto" px={{ base: 4, md: 8 }} pt="95px" pb={16}>
        {/* ═════════════════════════════════════════════════════════════════════
           MODE HERO BANNER
        ═════════════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <MotionBox
            key={accountMode + (activeCompany?.id || "personal")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            mb={8}
            p={{ base: 6, md: 8 }}
            borderRadius="24px"
            position="relative"
            overflow="hidden"
            style={{
              background:
                accountMode === "company"
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.25) 50%, rgba(17, 24, 39, 0.8) 100%)"
                  : "linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(139, 92, 246, 0.18) 50%, rgba(17, 24, 39, 0.8) 100%)",
              border:
                accountMode === "company"
                  ? "1px solid rgba(16, 185, 129, 0.3)"
                  : "1px solid rgba(59, 130, 246, 0.25)",
              backdropFilter: "blur(20px)",
              boxShadow:
                accountMode === "company"
                  ? "0 20px 50px -15px rgba(16, 185, 129, 0.15)"
                  : "0 20px 50px -15px rgba(59, 130, 246, 0.15)",
            }}
          >
            {/* Background Decorative Glow */}
            <Box
              position="absolute"
              top="-50%"
              right="-10%"
              w="400px"
              h="400px"
              borderRadius="full"
              style={{
                background:
                  accountMode === "company"
                    ? "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
                filter: "blur(50px)",
                pointerEvents: "none",
              }}
            />

            <Flex
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              align={{ base: "flex-start", lg: "center" }}
              gap={6}
              position="relative"
              zIndex={2}
            >
              <VStack align="flex-start" gap={3} maxW="720px">
                <HStack gap={2}>
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="800"
                    letterSpacing="0.05em"
                    style={{
                      background:
                        accountMode === "company"
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(59, 130, 246, 0.2)",
                      color: accountMode === "company" ? "#34d399" : "#60a5fa",
                      border:
                        accountMode === "company"
                          ? "1px solid rgba(16, 185, 129, 0.4)"
                          : "1px solid rgba(59, 130, 246, 0.4)",
                    }}
                  >
                    {accountMode === "company" ? (
                      <Flex align="center" gap={1.5}>
                        <Building2 size={13} /> COMPANY WORKSPACE MODE
                      </Flex>
                    ) : (
                      <Flex align="center" gap={1.5}>
                        <User size={13} /> PERSONAL ACCOUNT MODE
                      </Flex>
                    )}
                  </Badge>
                  {userCompanies.length > 0 && accountMode === "personal" && (
                    <Badge
                      px={2.5}
                      py={1}
                      borderRadius="full"
                      fontSize="10px"
                      fontWeight="bold"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                    >
                      {userCompanies.length} Connected Company Account{userCompanies.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </HStack>

                <Heading
                  size={{ base: "xl", md: "2xl" }}
                  fontWeight="900"
                  color="white"
                  letterSpacing="tight"
                  lineHeight="1.15"
                >
                  {accountMode === "company" ? (
                    <>
                      Workspace:{" "}
                      <Text
                        as="span"
                        style={{
                          background: "linear-gradient(135deg, #34d399, #10b981)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {activeCompany?.name || "Company Portal"}
                      </Text>
                    </>
                  ) : (
                    <>
                      Welcome back,{" "}
                      <Text
                        as="span"
                        style={{
                          background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {user?.first_name || "Professional"}
                      </Text>{" "}
                      👋
                    </>
                  )}
                </Heading>

                <Text fontSize={{ base: "sm", md: "md" }} color="var(--color-text-secondary, #9ca3af)" lineHeight="1.6">
                  {accountMode === "company"
                    ? activeCompany?.tagline ||
                      "Collaborate with registered platform companies, manage open job postings, and submit company proposals for market RFPs."
                    : "Discover top verified companies providing jobs, apply for open positions, and connect with platform leaders."}
                </Text>

                {/* Company Mode Quick Action Buttons */}
                {accountMode === "company" && activeCompany && (
                  <HStack gap={3} pt={2} wrap="wrap">
                    <Box
                      as="button"
                      onClick={() => navigate(`/company/${activeCompany.id}/openings`)}
                      px={4}
                      py={2.5}
                      borderRadius="12px"
                      fontSize="13px"
                      fontWeight="700"
                      cursor="pointer"
                      style={{
                        background: "#10b981",
                        color: "#022c22",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                      }}
                      _hover={{ background: "#34d399", transform: "translateY(-1px)" }}
                      transition="all 0.2s"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Plus size={16} />
                      Post New Job
                    </Box>

                    <Box
                      as="button"
                      onClick={() => navigate(`/company/${activeCompany.id}/rfps`)}
                      px={4}
                      py={2.5}
                      borderRadius="12px"
                      fontSize="13px"
                      fontWeight="700"
                      cursor="pointer"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                      _hover={{ background: "rgba(255,255,255,0.15)" }}
                      transition="all 0.2s"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <FileText size={16} color="#34d399" />
                      Manage RFPs
                    </Box>

                    <Box
                      as="button"
                      onClick={() => navigate(`/company/${activeCompany.id}/members`)}
                      px={4}
                      py={2.5}
                      borderRadius="12px"
                      fontSize="13px"
                      fontWeight="700"
                      cursor="pointer"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                      _hover={{ background: "rgba(255,255,255,0.15)" }}
                      transition="all 0.2s"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Users size={16} color="#60a5fa" />
                      Team Members
                    </Box>
                  </HStack>
                )}
              </VStack>

              {/* Quick Metrics Grid */}
              <SimpleGrid columns={{ base: 2, sm: 2 }} gap={3} w={{ base: "100%", lg: "340px" }} flexShrink={0}>
                {accountMode === "personal" ? (
                  <>
                    <Box
                      p={3.5}
                      borderRadius="16px"
                      style={{ background: "rgba(17, 24, 39, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <HStack gap={2} mb={1}>
                        <Building2 size={16} color="#60a5fa" />
                        <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">
                          Hiring Companies
                        </Text>
                      </HStack>
                      <Text fontSize="22px" fontWeight="900" color="white">
                        {jobProvidingCompanies.filter((c) => c.open_jobs_count > 0).length || companies.length}
                      </Text>
                    </Box>

                    <Box
                      p={3.5}
                      borderRadius="16px"
                      style={{ background: "rgba(17, 24, 39, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <HStack gap={2} mb={1}>
                        <Briefcase size={16} color="#a78bfa" />
                        <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">
                          Open Jobs
                        </Text>
                      </HStack>
                      <Text fontSize="22px" fontWeight="900" color="white">
                        {jobs.length}
                      </Text>
                    </Box>

                    <Box
                      p={3.5}
                      borderRadius="16px"
                      style={{ background: "rgba(17, 24, 39, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <HStack gap={2} mb={1}>
                        <ClipboardList size={16} color="#34d399" />
                        <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">
                          My Applications
                        </Text>
                      </HStack>
                      <Text fontSize="22px" fontWeight="900" color="white">
                        {myApplications.length}
                      </Text>
                    </Box>

                    <Box
                      p={3.5}
                      borderRadius="16px"
                      style={{ background: "rgba(17, 24, 39, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <HStack gap={2} mb={1}>
                        <FileText size={16} color="#f43f5e" />
                        <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">
                          Active RFPs
                        </Text>
                      </HStack>
                      <Text fontSize="22px" fontWeight="900" color="white">
                        {rfps.length}
                      </Text>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box
                      p={3.5}
                      borderRadius="16px"
                      style={{ background: "rgba(17, 24, 39, 0.6)", border: "1px solid rgba(16, 185, 129, 0.2)" }}
                    >
                      <HStack gap={2} mb={1}>
                        <Building2 size={16} color="#34d399" />
                        <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">
                          Platform Directory
                        </Text>
                      </HStack>
                      <Text fontSize="22px" fontWeight="900" color="white">
                        {companies.length}
                      </Text>
                    </Box>

                    <Box
                      p={3.5}
                      borderRadius="16px"
                      style={{ background: "rgba(17, 24, 39, 0.6)", border: "1px solid rgba(16, 185, 129, 0.2)" }}
                    >
                      <HStack gap={2} mb={1}>
                        <Briefcase size={16} color="#60a5fa" />
                        <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">
                          Company Jobs
                        </Text>
                      </HStack>
                      <Text fontSize="22px" fontWeight="900" color="white">
                        {jobs.filter((j) => (j.company?.id || j.company) === activeCompany?.id).length}
                      </Text>
                    </Box>

                    <Box
                      p={3.5}
                      borderRadius="16px"
                      style={{ background: "rgba(17, 24, 39, 0.6)", border: "1px solid rgba(16, 185, 129, 0.2)" }}
                    >
                      <HStack gap={2} mb={1}>
                        <FileText size={16} color="#f59e0b" />
                        <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">
                          Market RFPs
                        </Text>
                      </HStack>
                      <Text fontSize="22px" fontWeight="900" color="white">
                        {rfps.length}
                      </Text>
                    </Box>

                    <Box
                      p={3.5}
                      borderRadius="16px"
                      style={{ background: "rgba(17, 24, 39, 0.6)", border: "1px solid rgba(16, 185, 129, 0.2)" }}
                    >
                      <HStack gap={2} mb={1}>
                        <Users size={16} color="#a78bfa" />
                        <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">
                          Team Members
                        </Text>
                      </HStack>
                      <Text fontSize="22px" fontWeight="900" color="white">
                        {activeCompany?.members?.length || 1}
                      </Text>
                    </Box>
                  </>
                )}
              </SimpleGrid>
            </Flex>
          </MotionBox>
        </AnimatePresence>

        {/* ═════════════════════════════════════════════════════════════════════
           SECTION 1: COMPANIES DIRECTORY / HIRING COMPANIES
        ═════════════════════════════════════════════════════════════════════ */}
        <VStack align="stretch" gap={6} mb={12}>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "flex-end" }}
            gap={4}
          >
            <VStack align="flex-start" gap={1}>
              <HStack gap={2}>
                <Building2 size={20} color={accountMode === "company" ? "#34d399" : "#60a5fa"} />
                <Heading size="lg" fontWeight="900" color="white" letterSpacing="tight">
                  {accountMode === "company"
                    ? "Companies Registered on Platform"
                    : "Companies Providing Jobs"}
                </Heading>
              </HStack>
              <Text fontSize="sm" color="var(--color-text-secondary, #9ca3af)">
                {accountMode === "company"
                  ? "Explore partner organizations, potential clients, and B2B connections on Xanatz"
                  : "Discover active employers offering career opportunities on this platform"}
              </Text>
            </VStack>

            {/* Search Input */}
            <Flex gap={3} w={{ base: "100%", md: "auto" }} wrap="wrap">
              <Box
                position="relative"
                w={{ base: "100%", sm: "240px" }}
                borderRadius="12px"
                overflow="hidden"
                style={{ background: "rgba(17, 24, 39, 0.7)", border: "1px solid var(--color-card-border)" }}
              >
                <Box position="absolute" left="12px" top="50%" style={{ transform: "translateY(-50%)" }}>
                  <Search size={15} color="gray" />
                </Box>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search company or industry..."
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: "12px",
                  }}
                />
              </Box>
            </Flex>
          </Flex>

          {/* Industry Filter Pills */}
          <Flex gap={2} overflowX="auto" pb={2} style={{ scrollbarWidth: "none" }}>
            {INDUSTRY_OPTIONS.map((ind) => {
              const active = selectedIndustry === ind;
              return (
                <Box
                  key={ind}
                  as="button"
                  onClick={() => setSelectedIndustry(ind)}
                  px={3.5}
                  py={1.5}
                  borderRadius="full"
                  fontSize="12px"
                  fontWeight={active ? "700" : "500"}
                  cursor="pointer"
                  whiteSpace="nowrap"
                  style={{
                    background: active
                      ? accountMode === "company"
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(59, 130, 246, 0.2)"
                      : "rgba(255,255,255,0.04)",
                    color: active
                      ? accountMode === "company"
                        ? "#34d399"
                        : "#60a5fa"
                      : "var(--color-text-secondary, #9ca3af)",
                    border: active
                      ? accountMode === "company"
                        ? "1px solid rgba(16, 185, 129, 0.4)"
                        : "1px solid rgba(59, 130, 246, 0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.2s",
                  }}
                >
                  {ind}
                </Box>
              );
            })}
          </Flex>

          {/* Company Cards Grid */}
          {loading ? (
            <Flex justify="center" py={12}>
              <Spinner color="#3b82f6" size="lg" />
            </Flex>
          ) : filteredCompanies.length === 0 ? (
            <Box
              p={8}
              borderRadius="20px"
              textAlign="center"
              style={{ background: "rgba(17, 24, 39, 0.5)", border: "1px dashed rgba(255,255,255,0.1)" }}
            >
              <Building2 size={36} color="gray" style={{ margin: "0 auto 12px", opacity: 0.5 }} />
              <Text fontSize="md" fontWeight="bold" color="white">
                No companies found
              </Text>
              <Text fontSize="xs" color="gray.400" mt={1}>
                Try adjusting your search query or industry filter.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
              {filteredCompanies.map((company) => (
                <MotionBox
                  key={company.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  p={5}
                  borderRadius="20px"
                  style={{
                    background: "rgba(17, 24, 39, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <VStack align="flex-start" gap={3} w="100%">
                    <Flex justify="space-between" align="flex-start" w="100%">
                      <HStack gap={3}>
                        {company.logo_url || company.logo ? (
                          <img
                            src={company.logo_url || company.logo}
                            alt={company.name}
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "14px",
                              objectFit: "cover",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          />
                        ) : (
                          <Flex
                            w="48px"
                            h="48px"
                            borderRadius="14px"
                            align="center"
                            justify="center"
                            fontWeight="900"
                            fontSize="18px"
                            color="white"
                            style={{
                              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            }}
                          >
                            {company.name.slice(0, 2).toUpperCase()}
                          </Flex>
                        )}
                        <VStack align="flex-start" gap={0}>
                          <Heading size="sm" fontWeight="bold" color="white" lineClamp={1}>
                            {company.name}
                          </Heading>
                          <Text fontSize="11px" color="gray.400" lineClamp={1}>
                            {company.industry || "General Industry"}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Open Jobs Tag / Badge */}
                      {company.open_jobs_count > 0 && (
                        <Badge
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs?company=${company.id}&company_name=${encodeURIComponent(company.name)}`);
                          }}
                          px={2.5}
                          py={1}
                          borderRadius="full"
                          fontSize="10px"
                          fontWeight="800"
                          cursor="pointer"
                          style={{
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#34d399",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                          }}
                          _hover={{ background: "rgba(16, 185, 129, 0.3)" }}
                        >
                          ⚡ {company.open_jobs_count} Open Jobs
                        </Badge>
                      )}
                    </Flex>

                    {company.tagline && (
                      <Text fontSize="12px" color="gray.300" lineClamp={2} lineHeight="1.5">
                        {company.tagline}
                      </Text>
                    )}

                    <HStack gap={3} wrap="wrap" pt={1}>
                      {company.location && (
                        <HStack gap={1} fontSize="11px" color="gray.400">
                          <MapPin size={12} color="#60a5fa" />
                          <Text>{company.location}</Text>
                        </HStack>
                      )}
                      {company.company_size && (
                        <HStack gap={1} fontSize="11px" color="gray.400">
                          <Users size={12} color="#a78bfa" />
                          <Text>{company.company_size} employees</Text>
                        </HStack>
                      )}
                    </HStack>
                  </VStack>

                  {/* Actions footer */}
                  <Flex gap={2} pt={4} mt={3} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <Box
                      as="button"
                      onClick={() => navigate(`/company/${company.public_id || company.id}`)}
                      flex={1}
                      py={2}
                      px={3}
                      borderRadius="10px"
                      fontSize="12px"
                      fontWeight="700"
                      cursor="pointer"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      _hover={{ background: "rgba(255,255,255,0.12)" }}
                      transition="all 0.2s"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1.5}
                    >
                      <Building2 size={13} />
                      View Profile
                    </Box>

                    {accountMode === "personal" ? (
                      <Box
                        as="button"
                        onClick={() => navigate(`/jobs?company=${company.id}&company_name=${encodeURIComponent(company.name)}`)}
                        flex={1}
                        py={2}
                        px={3}
                        borderRadius="10px"
                        fontSize="12px"
                        fontWeight="700"
                        cursor="pointer"
                        style={{
                          background: "rgba(59, 130, 246, 0.12)",
                          color: "#60a5fa",
                          border: "1px solid rgba(59, 130, 246, 0.25)",
                        }}
                        _hover={{ background: "rgba(59, 130, 246, 0.22)" }}
                        transition="all 0.2s"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1.5}
                      >
                        <Briefcase size={13} />
                        View Jobs
                      </Box>
                    ) : (
                      <Box
                        as="button"
                        onClick={() => navigate("/messages")}
                        flex={1}
                        py={2}
                        px={3}
                        borderRadius="10px"
                        fontSize="12px"
                        fontWeight="700"
                        cursor="pointer"
                        style={{
                          background: "rgba(16, 185, 129, 0.12)",
                          color: "#34d399",
                          border: "1px solid rgba(16, 185, 129, 0.25)",
                        }}
                        _hover={{ background: "rgba(16, 185, 129, 0.22)" }}
                        transition="all 0.2s"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1.5}
                      >
                        <MessageSquare size={13} />
                        Contact
                      </Box>
                    )}
                  </Flex>
                </MotionBox>
              ))}
            </SimpleGrid>
          )}
        </VStack>

        {/* ═════════════════════════════════════════════════════════════════════
           SECTION 2: FEATURED JOBS (PERSONAL) OR RFPMARKET (COMPANY)
        ═════════════════════════════════════════════════════════════════════ */}
        {accountMode === "personal" ? (
          <VStack align="stretch" gap={6} mb={12}>
            <Flex justify="space-between" align="center">
              <VStack align="flex-start" gap={1}>
                <HStack gap={2}>
                  <Briefcase size={20} color="#a78bfa" />
                  <Heading size="lg" fontWeight="900" color="white" letterSpacing="tight">
                    Featured Job Opportunities
                  </Heading>
                </HStack>
                <Text fontSize="sm" color="var(--color-text-secondary, #9ca3af)">
                  Explore recent active job openings posted by registered companies
                </Text>
              </VStack>

              <Box
                as="button"
                onClick={() => navigate("/jobs")}
                px={4}
                py={2}
                borderRadius="12px"
                fontSize="13px"
                fontWeight="700"
                cursor="pointer"
                style={{
                  background: "rgba(59, 130, 246, 0.12)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                }}
                _hover={{ background: "rgba(59, 130, 246, 0.22)", transform: "translateX(2px)" }}
                transition="all 0.2s"
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <span>Explore All Jobs</span>
                <ArrowRight size={14} />
              </Box>
            </Flex>

            {jobs.length === 0 ? (
              <Box p={6} borderRadius="16px" style={{ background: "rgba(17, 24, 39, 0.5)" }}>
                <Text fontSize="sm" color="gray.400">
                  No active job postings available at the moment.
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {jobs.slice(0, 4).map((job) => (
                  <MotionBox
                    key={job.id}
                    whileHover={{ y: -2 }}
                    p={5}
                    borderRadius="18px"
                    style={{
                      background: "rgba(17, 24, 39, 0.7)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <Flex justify="space-between" align="flex-start" mb={3}>
                      <HStack gap={3}>
                        {job.company_logo_url ? (
                          <img
                            src={job.company_logo_url}
                            alt=""
                            style={{ width: "40px", height: "40px", borderRadius: "10px", objectFit: "cover" }}
                          />
                        ) : (
                          <Flex
                            w="40px"
                            h="40px"
                            borderRadius="10px"
                            align="center"
                            justify="center"
                            fontWeight="bold"
                            color="white"
                            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                          >
                            {(job.company_name || "C").slice(0, 2).toUpperCase()}
                          </Flex>
                        )}
                        <VStack align="flex-start" gap={0}>
                          <Heading size="xs" fontWeight="bold" color="white">
                            {job.title}
                          </Heading>
                          <Text fontSize="11px" color="gray.400">
                            {job.company_name} · {job.location || "Remote"}
                          </Text>
                        </VStack>
                      </HStack>

                      <Badge
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        fontSize="10px"
                        fontWeight="bold"
                        style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}
                      >
                        {job.job_type || "Full Time"}
                      </Badge>
                    </Flex>

                    {job.salary_range && (
                      <Text fontSize="12px" fontWeight="700" color="#34d399" mb={3}>
                        💰 {job.salary_range.trim().toUpperCase().startsWith("AED") ? job.salary_range : `AED ${job.salary_range.replace(/[$₹]/g, "").replace(/\bUSD\b/gi, "").trim()}`}
                      </Text>
                    )}

                    <Flex justify="space-between" align="center" pt={3} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <Text fontSize="11px" color="gray.500">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </Text>
                      <Box
                        as="button"
                        onClick={() => navigate(`/jobs/${job.id}/apply`)}
                        px={3.5}
                        py={1.5}
                        borderRadius="8px"
                        fontSize="11px"
                        fontWeight="700"
                        cursor="pointer"
                        style={{ background: "#3b82f6", color: "white" }}
                        _hover={{ background: "#2563eb" }}
                      >
                        Apply Now
                      </Box>
                    </Flex>
                  </MotionBox>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        ) : (
          <VStack align="stretch" gap={6} mb={12}>
            <Flex justify="space-between" align="center">
              <VStack align="flex-start" gap={1}>
                <HStack gap={2}>
                  <FileText size={20} color="#34d399" />
                  <Heading size="lg" fontWeight="900" color="white" letterSpacing="tight">
                    Market RFPs & B2B Proposals
                  </Heading>
                </HStack>
                <Text fontSize="sm" color="var(--color-text-secondary, #9ca3af)">
                  Discover open RFPs posted by companies and submit proposals on behalf of {activeCompany?.name || "your company"}
                </Text>
              </VStack>

              <Box
                as="button"
                onClick={() => navigate("/rfps")}
                px={4}
                py={2}
                borderRadius="12px"
                fontSize="13px"
                fontWeight="700"
                cursor="pointer"
                style={{
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
                _hover={{ background: "rgba(16, 185, 129, 0.22)", transform: "translateX(2px)" }}
                transition="all 0.2s"
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <span>Browse All RFPs</span>
                <ArrowRight size={14} />
              </Box>
            </Flex>

            {rfps.length === 0 ? (
              <Box p={6} borderRadius="16px" style={{ background: "rgba(17, 24, 39, 0.5)" }}>
                <Text fontSize="sm" color="gray.400">
                  No active RFPs currently available.
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {rfps.slice(0, 4).map((rfp) => (
                  <MotionBox
                    key={rfp.id}
                    whileHover={{ y: -2 }}
                    p={5}
                    borderRadius="18px"
                    style={{
                      background: "rgba(17, 24, 39, 0.7)",
                      border: "1px solid rgba(16, 185, 129, 0.15)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <Flex justify="space-between" align="flex-start" mb={2}>
                      <Heading size="xs" fontWeight="bold" color="white" lineClamp={1}>
                        {rfp.title}
                      </Heading>
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontSize="10px"
                        fontWeight="bold"
                        style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}
                      >
                        {rfp.category || "RFP"}
                      </Badge>
                    </Flex>

                    <Text fontSize="12px" color="gray.300" lineClamp={2} mb={3}>
                      {rfp.description}
                    </Text>

                    <Flex justify="space-between" align="center" pt={3} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <Text fontSize="11px" color="#34d399" fontWeight="bold">
                        Budget: {rfp.budget_range ? (rfp.budget_range.trim().toUpperCase().startsWith("AED") ? rfp.budget_range : `AED ${rfp.budget_range.replace(/[$₹]/g, "").replace(/\bUSD\b/gi, "").trim()}`) : "Negotiable"}
                      </Text>
                      <Box
                        as="button"
                        onClick={() => navigate(`/rfps/${rfp.id}`)}
                        px={3.5}
                        py={1.5}
                        borderRadius="8px"
                        fontSize="11px"
                        fontWeight="700"
                        cursor="pointer"
                        style={{ background: "#10b981", color: "#022c22" }}
                        _hover={{ background: "#34d399" }}
                      >
                        View & Proposal
                      </Box>
                    </Flex>
                  </MotionBox>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
           SECTION 3: QUICK SHORTCUTS & PLATFORM LINKS
        ═════════════════════════════════════════════════════════════════════ */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
          <MotionBox
            whileHover={{ y: -3 }}
            onClick={() => navigate("/freelancers")}
            p={5}
            borderRadius="20px"
            cursor="pointer"
            style={{
              background: "rgba(17, 24, 39, 0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <HStack gap={3} mb={2}>
              <Flex w="36px" h="36px" borderRadius="10px" align="center" justify="center" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                <Users size={18} />
              </Flex>
              <Heading size="xs" fontWeight="bold" color="white">
                Find Freelancers
              </Heading>
            </HStack>
            <Text fontSize="12px" color="gray.400">
              Browse top independent talent and specialized professionals.
            </Text>
          </MotionBox>

          <MotionBox
            whileHover={{ y: -3 }}
            onClick={() => navigate("/rfps")}
            p={5}
            borderRadius="20px"
            cursor="pointer"
            style={{
              background: "rgba(17, 24, 39, 0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <HStack gap={3} mb={2}>
              <Flex w="36px" h="36px" borderRadius="10px" align="center" justify="center" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                <FileText size={18} />
              </Flex>
              <Heading size="xs" fontWeight="bold" color="white">
                Browse RFPs
              </Heading>
            </HStack>
            <Text fontSize="12px" color="gray.400">
              Explore contract proposals and enterprise project requisitions.
            </Text>
          </MotionBox>

          <MotionBox
            whileHover={{ y: -3 }}
            onClick={() => navigate("/profile")}
            p={5}
            borderRadius="20px"
            cursor="pointer"
            style={{
              background: "rgba(17, 24, 39, 0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <HStack gap={3} mb={2}>
              <Flex w="36px" h="36px" borderRadius="10px" align="center" justify="center" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                <User size={18} />
              </Flex>
              <Heading size="xs" fontWeight="bold" color="white">
                My Profile & Settings
              </Heading>
            </HStack>
            <Text fontSize="12px" color="gray.400">
              Manage personal info, skills, experience, and company registration.
            </Text>
          </MotionBox>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default HomePage;
