import React from "react";
import { Box, Flex, Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import { Building2, ExternalLink, MapPin, DollarSign, ChevronRight } from "lucide-react";
import { ALL_CATEGORY_LABELS, ALL_SUBCATEGORY_LABELS } from "./company/JobOpeningModal";

const JOB_TYPE_LABELS = {
  full_time:  "Full-time",
  part_time:  "Part-time",
  contract:   "Contract",
  internship: "Internship",
  remote:     "Remote",
};

/* ─── Shared meta badges/chips used in both views ───────────────────────── */
const MetaBadges = ({ job }) => (
  <HStack gap={2} wrap="wrap">
    <Badge
      px={2} py={0.5} fontSize="2xs" fontWeight="bold" borderRadius="md"
      style={{ background: "var(--color-card-border)", color: "var(--color-text-secondary)" }}
    >
      {JOB_TYPE_LABELS[job.job_type] || job.job_type}
    </Badge>
    {job.category && (
      <Badge px={2} py={0.5} fontSize="2xs" fontWeight="bold" borderRadius="md"
        style={{ background: "rgba(59,130,246,0.15)", color: "rgba(147,197,253,0.9)", border: "1px solid rgba(59,130,246,0.25)" }}>
        {ALL_CATEGORY_LABELS[job.category] || job.category}
      </Badge>
    )}
    {job.sub_category && (
      <Badge px={2} py={0.5} fontSize="2xs" fontWeight="bold" borderRadius="md"
        style={{ background: "rgba(139,92,246,0.15)", color: "rgba(196,181,253,0.9)", border: "1px solid rgba(139,92,246,0.25)" }}>
        {ALL_SUBCATEGORY_LABELS[job.sub_category] || job.sub_category}
      </Badge>
    )}
    {job.location && (
      <HStack gap={1} fontSize="10px" color="var(--color-text-muted)">
        <MapPin size={10} />
        <Text>{job.location}</Text>
      </HStack>
    )}
    {job.salary_range && (
      <HStack gap={1} fontSize="10px" color="var(--color-text-muted)">
        <DollarSign size={10} />
        <Text>{job.salary_range}</Text>
      </HStack>
    )}
  </HStack>
);

/* ─── Company logo box ───────────────────────────────────────────────────── */
const CompanyLogo = ({ job, size = "48px" }) => (
  <Box
    w={size} h={size} flexShrink={0}
    borderRadius="lg" overflow="hidden"
    border="1px solid var(--color-card-border)"
    style={{ background: "var(--color-glass)" }}
  >
    {job.company_logo_url ? (
      <Box as="img" src={job.company_logo_url} alt={job.company_name} w="full" h="full" style={{ objectFit: "cover" }} />
    ) : (
      <Flex w="full" h="full" align="center" justify="center">
        <Building2 size={parseInt(size) * 0.4} color="var(--color-accent)" />
      </Flex>
    )}
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════════════
   JobOpeningCard
   viewMode: "grid" (default tile card) | "list" (horizontal strip)
═══════════════════════════════════════════════════════════════════════════ */
const JobOpeningCard = ({ job, onClick, viewMode = "grid" }) => {

  /* ── LIST / STRIP VIEW ── */
  if (viewMode === "list") {
    return (
      <Flex
        align="center"
        gap={4}
        px={5} py={4}
        borderRadius="xl"
        border="1px solid var(--color-card-border)"
        style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
        _hover={{
          borderColor: "rgba(59,130,246,0.35)",
          background: "rgba(59,130,246,0.04)",
          transform: "translateX(3px)",
        }}
        transition="all 0.25s cubic-bezier(0.4,0,0.2,1)"
        cursor="pointer"
        onClick={onClick}
      >
        {/* Logo */}
        <CompanyLogo job={job} size="44px" />

        {/* Title + Company */}
        <Box flex="0 0 220px" minW={0}>
          <Text
            fontWeight="black" fontSize="sm"
            color="var(--color-text-primary)" letterSpacing="tight"
            noOfLines={1}
          >
            {job.title}
          </Text>
          <HStack gap={1} color="var(--color-secondary)" fontSize="xs" fontWeight="bold" mt={0.5}>
            <Text noOfLines={1}>{job.company_name}</Text>
            <ExternalLink size={10} />
          </HStack>
        </Box>

        {/* Description */}
        <Text
          flex={1}
          color="var(--color-text-secondary)"
          fontSize="xs"
          noOfLines={2}
          lineHeight="relaxed"
          display={{ base: "none", md: "block" }}
        >
          {job.description}
        </Text>

        {/* Badges */}
        <Box flexShrink={0} display={{ base: "none", lg: "block" }}>
          <MetaBadges job={job} />
        </Box>

        {/* ID + Arrow */}
        <HStack gap={3} flexShrink={0}>
          {job.job_id && (
            <Badge variant="outline" colorScheme="gray" fontSize="2xs" px={1.5} py={0.2} borderRadius="sm" color="var(--color-text-muted)">
              {job.job_id}
            </Badge>
          )}
          <Box color="var(--color-text-muted)">
            <ChevronRight size={16} />
          </Box>
        </HStack>
      </Flex>
    );
  }

  /* ── GRID / TILE VIEW (default) ── */
  return (
    <Box
      px={6} pb={6} pt={8}
      position="relative"
      borderRadius="lg"
      border="1px solid var(--color-card-border)"
      style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
      _hover={{
        borderColor: "rgba(59,130,246,0.35)",
        background: "rgba(205,36,38,0.05)",
        transform: "translateY(-4px)",
      }}
      transition="all 0.3s cubic-bezier(0.4,0,0.2,1)"
      cursor="pointer"
      onClick={onClick}
    >
      {job.job_id && (
        <Badge
          variant="outline"
          colorScheme="gray"
          fontSize="2xs"
          px={1.5}
          py={0.2}
          borderRadius="sm"
          color="var(--color-text-muted)"
          style={{
            position: "absolute",
            top: "8px",
            right: "16px",
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--color-card-border)",
          }}
        >
          {job.job_id}
        </Badge>
      )}

      <Flex gap={4} align="start" mb={4} justify="space-between" w="full">
        <HStack gap={4} align="start" flex={1} minW={0}>
          <CompanyLogo job={job} size="48px" />
          <VStack align="start" gap={0.5} overflow="hidden">
            <Heading size="sm" color="var(--color-text-primary)" fontWeight="black" noOfLines={1} letterSpacing="tight">
              {job.title}
            </Heading>
            <HStack gap={1.5} color="var(--color-secondary)" fontSize="xs" fontWeight="bold">
              <Text noOfLines={1}>{job.company_name}</Text>
              <ExternalLink size={10} />
            </HStack>
          </VStack>
        </HStack>
      </Flex>

      <Text color="var(--color-text-secondary)" fontSize="xs" noOfLines={3} mb={4} lineHeight="relaxed">
        {job.description}
      </Text>

      <Box pt={2} borderTop="1px solid var(--color-card-border)">
        <MetaBadges job={job} />
      </Box>
    </Box>
  );
};

export default JobOpeningCard;
