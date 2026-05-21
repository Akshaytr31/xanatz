import React from "react";
import { Box, Flex, Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import { Building2, ExternalLink, MapPin, DollarSign } from "lucide-react";

const JOB_TYPE_LABELS = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

const JobOpeningCard = ({ job, onClick }) => {
  return (
    <Box
      p={6}
      borderRadius="lg"
      border="1px solid rgba(255,255,255,0.07)"
      style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}
      _hover={{
        borderColor: "rgba(205,36,38,0.4)",
        background: "rgba(205,36,38,0.05)",
        transform: "translateY(-4px)"
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      cursor="pointer"
      onClick={onClick}
    >
      <Flex gap={4} align="start" mb={4}>
        {/* Company Logo or placeholder */}
        <Box
          w="48px"
          h="48px"
          borderRadius="lg"
          overflow="hidden"
          flexShrink={0}
          border="1px solid rgba(255,255,255,0.1)"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {job.company_logo_url ? (
            <Box as="img" src={job.company_logo_url} alt={job.company_name} w="full" h="full" style={{ objectFit: "cover" }} />
          ) : (
            <Flex w="full" h="full" align="center" justify="center">
              <Building2 size={20} color="var(--color-accent)" />
            </Flex>
          )}
        </Box>

        <VStack align="start" gap={0.5} overflow="hidden">
          <Heading size="sm" color="white" fontWeight="black" noOfLines={1} letterSpacing="tight">
            {job.title}
          </Heading>
          <HStack gap={1.5} color="var(--color-secondary)" fontSize="xs" fontWeight="bold">
            <Text>{job.company_name}</Text>
            <ExternalLink size={10} />
          </HStack>
        </VStack>
      </Flex>

      <Text color="rgba(255,255,255,0.6)" fontSize="xs" noOfLines={3} mb={4} lineHeight="relaxed">
        {job.description}
      </Text>

      <HStack gap={2} wrap="wrap" pt={2} borderTop="1px solid rgba(255,255,255,0.06)">
        <Badge px={2} py={0.5} fontSize="2xs" fontWeight="bold" borderRadius="md" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}>
          {JOB_TYPE_LABELS[job.job_type] || job.job_type}
        </Badge>
        {job.location && (
          <HStack gap={1} fontSize="10px" color="rgba(255,255,255,0.4)">
            <MapPin size={10} />
            <Text>{job.location}</Text>
          </HStack>
        )}
        {job.salary_range && (
          <HStack gap={1} fontSize="10px" color="rgba(255,255,255,0.4)">
            <DollarSign size={10} />
            <Text>{job.salary_range}</Text>
          </HStack>
        )}
      </HStack>
    </Box>
  );
};

export default JobOpeningCard;
