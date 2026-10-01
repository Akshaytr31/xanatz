import React from "react";
import { Box, Flex, HStack, VStack, Text, Badge, Button } from "@chakra-ui/react";
import { User, Building2, ChevronRight, Plus, ArrowRight, ShieldCheck, Briefcase, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAccount } from "../context/AccountContext";

const PageModeHeader = ({ title, subtitle, actions }) => {
  const navigate = useNavigate();
  const { accountMode, activeCompany, user, userCompanies, switchAccountMode } = useAccount();

  const isCompany = accountMode === "company";

  return (
    <Box
      mb={6}
      p={{ base: 4, md: 5 }}
      borderRadius="18px"
      position="relative"
      overflow="hidden"
      style={{
        background: isCompany
          ? "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(88, 28, 135, 0.2) 100%)"
          : "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.2) 100%)",
        border: isCompany
          ? "1px solid rgba(139, 92, 246, 0.3)"
          : "1px solid rgba(16, 185, 129, 0.3)",
        backdropFilter: "blur(16px)",
        boxShadow: isCompany
          ? "0 8px 30px -10px rgba(139, 92, 246, 0.15)"
          : "0 8px 30px -10px rgba(16, 185, 129, 0.15)",
        transition: "all 0.3s ease",
      }}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        gap={4}
      >
        <VStack align="flex-start" gap={1.5} maxW="750px">
          {/* Mode Context Badge */}
          <HStack gap={2} flexWrap="wrap">
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              fontSize="11px"
              fontWeight="800"
              letterSpacing="0.06em"
              style={{
                background: isCompany
                  ? "rgba(139, 92, 246, 0.22)"
                  : "rgba(16, 185, 129, 0.22)",
                color: isCompany ? "#c084fc" : "#34d399",
                border: isCompany
                  ? "1px solid rgba(16, 185, 129, 0)"
                  : "1px solid rgba(16, 185, 129, 0.3)",
                boxShadow: isCompany
                  ? "0 0 10px rgba(139, 92, 246, 0.25)"
                  : "0 0 10px rgba(16, 185, 129, 0.25)",
              }}
            >
              <Flex align="center" gap={1.5}>
                {isCompany ? <Building2 size={13} /> : <User size={13} />}
                <span>
                  {isCompany
                    ? `COMPANY WORKSPACE: ${activeCompany?.name || "Corporate Account"}`
                    : `PERSONAL PROFILE: ${user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Candidate Mode"}`}
                </span>
              </Flex>
            </Badge>

            {isCompany && activeCompany?.access_role && (
              <Badge
                px={2.5}
                py={0.8}
                borderRadius="full"
                fontSize="10px"
                fontWeight="700"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#e9d5ff",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                Role: {activeCompany.access_role.replace("_", " ").toUpperCase()}
              </Badge>
            )}

            {!isCompany && userCompanies?.length > 0 && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => switchAccountMode("company", userCompanies[0])}
                style={{
                  height: "22px",
                  fontSize: "10px",
                  borderRadius: "9999px",
                  color: "#c084fc",
                  background: "rgba(139, 92, 246, 0.15)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  cursor: "pointer",
                }}
                _hover={{ background: "rgba(139, 92, 246, 0.3)" }}
              >
                Switch to {userCompanies[0].name} <ChevronRight size={12} />
              </Button>
            )}
          </HStack>

          {title && (
            <Text
              fontSize={{ base: "1.25rem", md: "1.5rem" }}
              fontWeight="800"
              color="white"
              letterSpacing="-0.02em"
              m={0}
            >
              {title}
            </Text>
          )}

          {subtitle && (
            <Text fontSize="0.85rem" color="var(--color-text-muted)" m={0}>
              {subtitle}
            </Text>
          )}
        </VStack>

        {/* Custom actions or quick mode switcher */}
        <HStack gap={2} flexWrap="wrap">
          {actions}
          {isCompany && activeCompany?.id && (
            <Button
              size="sm"
              onClick={() => navigate(`/company/${activeCompany.id}/openings`)}
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                color: "white",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.78rem",
                boxShadow: "0 4px 15px rgba(139, 92, 246, 0.35)",
              }}
              _hover={{ opacity: 0.9 }}
            >
              <Plus size={14} style={{ marginRight: 6 }} /> Post Opening
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default PageModeHeader;
