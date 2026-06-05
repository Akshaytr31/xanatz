import React, { useState } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Search,
  Building2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  RotateCcw,
  Layers,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  Badge,
} from "@chakra-ui/react";

/* ─── Filter option constants ────────────────────────────────────────────── */
export const SALARY_BUCKETS = [
  { label: "Any Salary",      value: "all" },
  { label: "Up to $30k",      value: "0-30" },
  { label: "$30k – $60k",     value: "30-60" },
  { label: "$60k – $100k",    value: "60-100" },
  { label: "$100k – $150k",   value: "100-150" },
  { label: "$150k+",          value: "150-999" },
];

export const JOB_TYPE_OPTIONS = [
  { value: "all",         label: "All Types" },
  { value: "full_time",   label: "Full-time" },
  { value: "part_time",   label: "Part-time" },
  { value: "contract",    label: "Contract" },
  { value: "internship",  label: "Internship" },
  { value: "remote",      label: "Remote" },
];

/** Matches Company.INDUSTRY_CHOICES in the Django backend */
export const INDUSTRY_OPTIONS = [
  { value: "all",           label: "All Industries" },
  { value: "technology",    label: "Technology" },
  { value: "finance",       label: "Finance" },
  { value: "healthcare",    label: "Healthcare" },
  { value: "education",     label: "Education" },
  { value: "retail",        label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "media",         label: "Media & Entertainment" },
  { value: "real_estate",   label: "Real Estate" },
  { value: "consulting",    label: "Consulting" },
  { value: "logistics",     label: "Logistics & Supply Chain" },
  { value: "hospitality",   label: "Hospitality & Tourism" },
  { value: "energy",        label: "Energy & Utilities" },
  { value: "other",         label: "Other" },
];

export const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First",  icon: Clock },
  { value: "oldest",     label: "Oldest First",  icon: Clock },
  { value: "title_asc",  label: "Title A → Z",   icon: TrendingUp },
  { value: "title_desc", label: "Title Z → A",   icon: TrendingUp },
];

/** Default filter state — import this wherever you initialise filter state. */
export const DEFAULT_FILTERS = {
  titleSearch:    "",
  companySearch:  "",
  locationSearch: "",
  jobTypeFilter:  "all",
  salaryBucket:   "all",
  industryFilter: "all",
  sortBy:         "newest",
};

/* ─── FilterSection accordion ────────────────────────────────────────────── */
const FilterSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box>
      <Flex
        align="center"
        justify="space-between"
        cursor="pointer"
        onClick={() => setOpen((p) => !p)}
        py={2}
        px={1}
        borderRadius="md"
        _hover={{ bg: "var(--color-card-hover-bg)" }}
        transition="all 0.2s"
        userSelect="none"
      >
        <HStack gap={2}>
          <Icon size={13} color="var(--color-accent)" />
          <Text fontSize="10px" fontWeight="black" color="var(--color-text-muted)" letterSpacing="widest">
            {title}
          </Text>
        </HStack>
        {open
          ? <ChevronUp   size={13} color="var(--color-text-muted)" />
          : <ChevronDown size={13} color="var(--color-text-muted)" />
        }
      </Flex>

      <Box
        overflow="hidden"
        maxH={open ? "600px" : "0px"}
        opacity={open ? 1 : 0}
        transition="max-height 0.35s ease, opacity 0.25s ease"
      >
        <Box pt={2} pb={3}>
          {children}
        </Box>
      </Box>

      {/* Divider */}
      <Box h="1px" bg="var(--color-card-border)" opacity={0.5} my={1} />
    </Box>
  );
};

/* ─── Radio-style pill group ─────────────────────────────────────────────── */
const PillGroup = ({ options, value, onChange }) => (
  <VStack align="stretch" gap={1}>
    {options.map((opt) => {
      const active = opt.value === value;
      return (
        <Flex
          key={opt.value}
          align="center"
          gap={2.5}
          cursor="pointer"
          onClick={() => onChange(opt.value)}
          py={1.5}
          px={2}
          borderRadius="lg"
          bg={active ? "rgba(59,130,246,0.12)" : "transparent"}
          border={active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent"}
          _hover={{ bg: active ? "rgba(59,130,246,0.15)" : "var(--color-card-hover-bg)" }}
          transition="all 0.2s"
          userSelect="none"
        >
          {active
            ? <CheckCircle2 size={14} color="var(--color-accent)"      style={{ flexShrink: 0 }} />
            : <Circle       size={14} color="var(--color-text-muted)"  style={{ flexShrink: 0 }} />
          }
          <Text
            fontSize="xs"
            fontWeight={active ? "bold" : "normal"}
            color={active ? "var(--color-text-primary)" : "var(--color-text-secondary)"}
          >
            {opt.label}
          </Text>
        </Flex>
      );
    })}
  </VStack>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FilterSidebar
   Props:
     filters       – current filter object (shape: DEFAULT_FILTERS)
     onChange      – (key, value) => void
     onReset       – () => void
     activeCount   – number of active (non-default) filters
     mobileOpen    – bool, controls slide-in on mobile
     onMobileClose – () => void
═══════════════════════════════════════════════════════════════════════════ */
const FilterSidebar = ({
  filters,
  onChange,
  onReset,
  activeCount,
  mobileOpen,
  onMobileClose,
}) => {
  const {
    titleSearch, companySearch, locationSearch,
    jobTypeFilter, salaryBucket, industryFilter, sortBy,
  } = filters;

  const inputStyle = {
    fontSize: "12px",
    color: "var(--color-text-primary)",
  };

  const inputHStack = {
    bg: "var(--color-input-bg)",
    borderRadius: "xl",
    px: 3,
    border: "1px solid var(--color-card-border)",
    w: "full",
    _focusWithin: {
      borderColor: "var(--color-accent)",
      boxShadow: "0 0 8px rgba(59,130,246,0.2)",
      bg: "var(--color-card-hover-bg)",
    },
    transition: "all 0.25s",
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <Box
          display={{ base: "block", lg: "none" }}
          position="fixed"
          inset={0}
          bg="rgba(0,0,0,0.6)"
          zIndex={199}
          onClick={onMobileClose}
          backdropFilter="blur(4px)"
        />
      )}

      <Box
        w={{ base: "280px", lg: "260px" }}
        flexShrink={0}
        position="fixed"
        top={{ base: 0, lg: "60px" }}
        left={{ base: mobileOpen ? "0" : "-320px", lg: "0" }}
        h={{ base: "100vh", lg: "calc(100vh - 60px)" }}
        overflowY="auto"
        zIndex={{ base: 200, lg: 10 }}
        transition="left 0.3s cubic-bezier(0.4,0,0.2,1)"
        p={4}
        pt={10}
        borderRight={{ base: "none", lg: "1px solid var(--color-card-border)" }}
        style={{
          background: "var(--color-glass)",
          backdropFilter: "blur(24px)",
          scrollbarWidth: "none",
        }}
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
      >
        {/* ── Header ── */}
        <Flex align="center" justify="space-between" mb={4}>
          <HStack gap={2}>
            <Box
              w="28px" h="28px" borderRadius="md"
              display="flex" alignItems="center" justifyContent="center"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)" }}
            >
              <SlidersHorizontal size={14} color="var(--color-accent)" />
            </Box>
            <Text fontWeight="black" fontSize="sm" color="var(--color-text-primary)" letterSpacing="tight">
              Filters
            </Text>
            {activeCount > 0 && (
              <Badge
                px={1.5} py={0.5} fontSize="10px" borderRadius="full" fontWeight="bold"
                style={{ background: "var(--color-accent)", color: "white" }}
              >
                {activeCount}
              </Badge>
            )}
          </HStack>

          <HStack gap={1}>
            {activeCount > 0 && (
              <Box
                as="button"
                onClick={onReset}
                display="flex" alignItems="center" gap={1}
                px={2} py={1} borderRadius="md"
                fontSize="10px" fontWeight="bold"
                color="var(--color-text-muted)"
                _hover={{ color: "var(--color-text-primary)", bg: "var(--color-card-hover-bg)" }}
                transition="all 0.2s"
              >
                <RotateCcw size={11} />
                Reset
              </Box>
            )}
            <Box
              as="button"
              display={{ base: "flex", lg: "none" }}
              onClick={onMobileClose}
              w="24px" h="24px" borderRadius="md" alignItems="center" justifyContent="center"
              _hover={{ bg: "var(--color-card-hover-bg)" }}
              transition="all 0.2s"
            >
              <X size={14} color="var(--color-text-muted)" />
            </Box>
          </HStack>
        </Flex>

        {/* ── Filter sections ── */}
        <VStack align="stretch" gap={0}>

          {/* Search */}
          <FilterSection title="SEARCH" icon={Search} defaultOpen={true}>
            <HStack {...inputHStack}>
              <Search size={13} color="var(--color-accent)" />
              <Input
                placeholder="Job title, keyword..."
                variant="unstyled"
                {...inputStyle}
                value={titleSearch}
                onChange={(e) => onChange("titleSearch", e.target.value)}
                py={2.5}
                _placeholder={{ color: "var(--color-text-muted)" }}
              />
              {titleSearch && (
                <Box as="button" onClick={() => onChange("titleSearch", "")} flexShrink={0}>
                  <X size={12} color="var(--color-text-muted)" />
                </Box>
              )}
            </HStack>
          </FilterSection>

          {/* Company */}
          <FilterSection title="COMPANY" icon={Building2}>
            <HStack {...inputHStack}>
              <Building2 size={13} color="var(--color-accent)" />
              <Input
                placeholder="Company name..."
                variant="unstyled"
                {...inputStyle}
                value={companySearch}
                onChange={(e) => onChange("companySearch", e.target.value)}
                py={2.5}
                _placeholder={{ color: "var(--color-text-muted)" }}
              />
              {companySearch && (
                <Box as="button" onClick={() => onChange("companySearch", "")} flexShrink={0}>
                  <X size={12} color="var(--color-text-muted)" />
                </Box>
              )}
            </HStack>
          </FilterSection>

          {/* Location */}
          <FilterSection title="LOCATION" icon={MapPin}>
            <HStack {...inputHStack}>
              <MapPin size={13} color="var(--color-accent)" />
              <Input
                placeholder="City, country, remote..."
                variant="unstyled"
                {...inputStyle}
                value={locationSearch}
                onChange={(e) => onChange("locationSearch", e.target.value)}
                py={2.5}
                _placeholder={{ color: "var(--color-text-muted)" }}
              />
              {locationSearch && (
                <Box as="button" onClick={() => onChange("locationSearch", "")} flexShrink={0}>
                  <X size={12} color="var(--color-text-muted)" />
                </Box>
              )}
            </HStack>
          </FilterSection>

          {/* Job Type */}
          <FilterSection title="JOB TYPE" icon={Briefcase}>
            <PillGroup
              options={JOB_TYPE_OPTIONS}
              value={jobTypeFilter}
              onChange={(v) => onChange("jobTypeFilter", v)}
            />
          </FilterSection>

          {/* Salary Range */}
          <FilterSection title="SALARY RANGE" icon={DollarSign}>
            <PillGroup
              options={SALARY_BUCKETS}
              value={salaryBucket}
              onChange={(v) => onChange("salaryBucket", v)}
            />
          </FilterSection>

          {/* Industry */}
          <FilterSection title="INDUSTRY" icon={Layers}>
            <Box
              maxH="220px"
              overflowY="auto"
              css={{
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-thumb": { background: "var(--color-card-border)", borderRadius: "4px" },
              }}
            >
              <PillGroup
                options={INDUSTRY_OPTIONS}
                value={industryFilter}
                onChange={(v) => onChange("industryFilter", v)}
              />
            </Box>
          </FilterSection>

          {/* Sort By */}
          <FilterSection title="SORT BY" icon={TrendingUp}>
            <PillGroup
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(v) => onChange("sortBy", v)}
            />
          </FilterSection>

        </VStack>
      </Box>
    </>
  );
};

export default FilterSidebar;
