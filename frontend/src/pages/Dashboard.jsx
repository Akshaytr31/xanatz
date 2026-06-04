import React, { useState, useEffect } from "react";
import { Briefcase, SlidersHorizontal, X as XIcon } from "lucide-react";
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
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import JobOpeningCard from "../components/JobOpeningCard";
import FilterSidebar, {
  SALARY_BUCKETS,
  JOB_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  SORT_OPTIONS,
  DEFAULT_FILTERS,
} from "../components/FilterSidebar";
import api from "../api";

/* ─── helper: parse salary string like "$120k – $150k" ─────────────────── */
const parseSalaryNum = (str) => {
  if (!str) return null;
  const nums = str.replace(/[$,]/g, "").match(/\d+k?/gi);
  if (!nums || nums.length === 0) return null;
  const avg =
    nums.reduce((acc, n) => {
      const val = n.toLowerCase().endsWith("k")
        ? parseFloat(n)
        : parseFloat(n) / 1000;
      return acc + val;
    }, 0) / nums.length;
  return avg;
};

/* ─── Small filter chip ─────────────────────────────────────────────────── */
const FilterChip = ({ label, onRemove }) => (
  <HStack
    gap={1.5} px={2.5} py={1} borderRadius="full"
    border="1px solid rgba(59,130,246,0.3)"
    style={{ background: "rgba(59,130,246,0.1)" }}
    fontSize="11px" fontWeight="bold" color="rgba(147,197,253,0.9)"
  >
    <Text>{label}</Text>
    <Box
      as="button" onClick={onRemove}
      display="flex" alignItems="center"
      _hover={{ color: "white" }} transition="color 0.15s"
    >
      <XIcon size={11} />
    </Box>
  </HStack>
);

/* ═══════════════════════════════════════════════════════════════════════════
   Dashboard
═══════════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "sortBy") return v !== "newest";
    return v !== "all" && v !== "";
  }).length;

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
      return;
    }
    const fetchJobs = async () => {
      try {
        const response = await api.get("jobs/");
        setJobs(response.data);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ── Filter ── */
  let filteredJobs = jobs.filter((job) => {
    const { titleSearch, companySearch, locationSearch, jobTypeFilter, salaryBucket, industryFilter } = filters;

    if (titleSearch && !job.title.toLowerCase().includes(titleSearch.toLowerCase())) return false;
    if (companySearch && !job.company_name.toLowerCase().includes(companySearch.toLowerCase())) return false;
    if (locationSearch && !(job.location && job.location.toLowerCase().includes(locationSearch.toLowerCase()))) return false;
    if (jobTypeFilter !== "all" && job.job_type !== jobTypeFilter) return false;
    if (industryFilter !== "all" && job.industry !== industryFilter) return false;

    if (salaryBucket !== "all") {
      const [minK, maxK] = salaryBucket.split("-").map(Number);
      const salaryNum = parseSalaryNum(job.salary_range);
      if (salaryNum === null) return false;
      if (salaryNum < minK) return false;
      if (maxK < 999 && salaryNum > maxK) return false;
    }

    return true;
  });

  /* ── Sort ── */
  filteredJobs = [...filteredJobs].sort((a, b) => {
    switch (filters.sortBy) {
      case "oldest":     return new Date(a.created_at) - new Date(b.created_at);
      case "title_asc":  return a.title.localeCompare(b.title);
      case "title_desc": return b.title.localeCompare(a.title);
      default:           return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  return (
    <Box minH="100vh" bg="var(--color-primary)" marginTop="50px">
      <Navbar handleLogout={handleLogout} />

      <Flex align="start" minH="calc(100vh - 50px)">

        {/* ── Sidebar ── */}
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          activeCount={activeFilterCount}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* ── Main content ── */}
        <Box flex={1} p={{ base: 4, md: 6, lg: 8 }} minW={0}>

          {/* Top bar */}
          <Flex align="center" justify="space-between" mb={6}>
            <VStack align="start" gap={0}>
              <Heading size="md" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                Job Openings
              </Heading>
              <Text fontSize="xs" color="var(--color-text-muted)">
                {loading
                  ? "Loading..."
                  : `${filteredJobs.length} result${filteredJobs.length !== 1 ? "s" : ""} found`}
              </Text>
            </VStack>

            {/* Mobile filter toggle */}
            <Box
              as="button"
              display={{ base: "flex", lg: "none" }}
              alignItems="center"
              gap={2}
              px={3} py={2}
              borderRadius="xl"
              border="1px solid var(--color-card-border)"
              style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}
              onClick={() => setMobileSidebarOpen(true)}
              cursor="pointer"
            >
              <SlidersHorizontal size={14} color="var(--color-accent)" />
              <Text fontSize="xs" fontWeight="bold" color="var(--color-text-secondary)">
                Filters
              </Text>
              {activeFilterCount > 0 && (
                <Badge
                  px={1.5} py={0} fontSize="10px" borderRadius="full"
                  style={{ background: "var(--color-accent)", color: "white" }}
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Box>
          </Flex>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <Flex wrap="wrap" gap={2} mb={5}>
              {filters.titleSearch && (
                <FilterChip label={`Title: ${filters.titleSearch}`} onRemove={() => handleFilterChange("titleSearch", "")} />
              )}
              {filters.companySearch && (
                <FilterChip label={`Company: ${filters.companySearch}`} onRemove={() => handleFilterChange("companySearch", "")} />
              )}
              {filters.locationSearch && (
                <FilterChip label={`Location: ${filters.locationSearch}`} onRemove={() => handleFilterChange("locationSearch", "")} />
              )}
              {filters.jobTypeFilter !== "all" && (
                <FilterChip
                  label={JOB_TYPE_OPTIONS.find((o) => o.value === filters.jobTypeFilter)?.label}
                  onRemove={() => handleFilterChange("jobTypeFilter", "all")}
                />
              )}
              {filters.salaryBucket !== "all" && (
                <FilterChip
                  label={SALARY_BUCKETS.find((o) => o.value === filters.salaryBucket)?.label}
                  onRemove={() => handleFilterChange("salaryBucket", "all")}
                />
              )}
              {filters.industryFilter !== "all" && (
                <FilterChip
                  label={INDUSTRY_OPTIONS.find((o) => o.value === filters.industryFilter)?.label}
                  onRemove={() => handleFilterChange("industryFilter", "all")}
                />
              )}
              {filters.sortBy !== "newest" && (
                <FilterChip
                  label={`Sort: ${SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label}`}
                  onRemove={() => handleFilterChange("sortBy", "newest")}
                />
              )}
              <Box
                as="button"
                onClick={handleReset}
                px={2.5} py={1} borderRadius="full"
                fontSize="11px" fontWeight="bold"
                color="var(--color-text-muted)"
                border="1px solid var(--color-card-border)"
                _hover={{ color: "var(--color-text-primary)", borderColor: "var(--color-accent)" }}
                transition="all 0.2s"
              >
                Clear all
              </Box>
            </Flex>
          )}

          {/* Job grid */}
          {loading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner size="lg" color="var(--color-accent)" />
            </Flex>
          ) : filteredJobs.length === 0 ? (
            <Flex
              direction="column" align="center" justify="center" py={16}
              borderRadius="xl" border="1px dashed var(--color-card-border)"
              style={{ background: "var(--color-glass)", backdropFilter: "blur(12px)" }}
            >
              <Briefcase size={40} color="var(--color-card-border)" style={{ marginBottom: "12px" }} />
              <Text color="var(--color-text-muted)" fontSize="sm" fontWeight="bold" mb={1}>
                No job openings found
              </Text>
              <Text color="var(--color-text-muted)" fontSize="xs">
                Try adjusting your filters
              </Text>
            </Flex>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
              gap={5}
            >
              {filteredJobs.map((job) => (
                <JobOpeningCard
                  key={job.id}
                  job={job}
                  onClick={() => navigate(`/jobs/${job.id}/apply`)}
                />
              ))}
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Dashboard;
