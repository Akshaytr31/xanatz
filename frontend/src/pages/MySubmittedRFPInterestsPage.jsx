import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Heading, Input
} from "@chakra-ui/react";
import {
  ArrowLeft, FileText, Building2, Clock, Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";

const MySubmittedRFPInterestsPage = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const fetchMyInterests = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await api.get("rfp-interests/");
      setInterests(res.data || []);
    } catch (err) {
      console.error("Error fetching submitted RFP interests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInterests();
  }, []);

  const filteredInterests = interests.filter((item) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (item.rfp_title || "").toLowerCase().includes(q);
    const companyMatch = (item.rfp_company_name || "").toLowerCase().includes(q);
    const qtnMatch = (item.quotation_id || "").toLowerCase().includes(q);
    const matchesSearch = !q || titleMatch || companyMatch || qtnMatch;

    if (statusFilter === "accepted") return matchesSearch && item.status === "accepted";
    if (statusFilter === "pending") return matchesSearch && item.status !== "accepted" && item.status !== "rejected";
    if (statusFilter === "rejected") return matchesSearch && item.status === "rejected";
    return matchesSearch;
  });

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary, #07090e)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color="#8b5cf6" />
          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="black" letterSpacing="widest">
            LOADING SUBMITTED INTERESTS...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="var(--color-primary, #07090e)" pb="80px" color="white">
      <Navbar handleLogout={handleLogout} />

      <Container maxW="1100px" px={{ base: 4, md: 6, lg: 8 }} pt={24}>
        {/* Back Button */}
        <Button
          size="sm"
          variant="ghost"
          color="rgba(255,255,255,0.7)"
          _hover={{ color: "white", bg: "rgba(255,255,255,0.1)" }}
          onClick={() => navigate("/rfps")}
          mb={6}
        >
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to RFPs Feed
        </Button>

        {/* Page Header */}
        <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
          <VStack align="start" gap={1}>
            <Heading size="lg" fontWeight="900" letterSpacing="tight">
              My Submitted RFP Interests
            </Heading>
            <Text color="rgba(255,255,255,0.5)" fontSize="xs">
              All proposal submissions and status updates across public client RFPs.
            </Text>
          </VStack>

          <HStack gap={2}>
            <Badge bg="rgba(139, 92, 246, 0.2)" color="#c4b5fd" px={3} py={1.5} borderRadius="full" fontSize="xs" fontWeight="bold">
              Total: {interests.length}
            </Badge>
            <Badge bg="rgba(16, 185, 129, 0.2)" color="#34d399" px={3} py={1.5} borderRadius="full" fontSize="xs" fontWeight="bold">
              Accepted: {interests.filter((i) => i.status === "accepted").length}
            </Badge>
          </HStack>
        </Flex>

        {/* Filter Controls */}
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
          <HStack
            bg="rgba(255,255,255,0.05)"
            border="1px solid rgba(255,255,255,0.1)"
            px={4}
            py={1.5}
            borderRadius="xl"
            maxW="400px"
            w="full"
          >
            <Search size={16} color="rgba(255,255,255,0.4)" />
            <Input
              placeholder="Search by title, company, or quotation ID..."
              variant="unstyled"
              fontSize="xs"
              color="white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </HStack>

          <HStack gap={2} flexWrap="wrap">
            {["all", "accepted", "pending", "rejected"].map((st) => (
              <Button
                key={st}
                size="xs"
                px={3}
                py={1.5}
                borderRadius="lg"
                bg={statusFilter === st ? "#8b5cf6" : "rgba(255,255,255,0.06)"}
                color={statusFilter === st ? "white" : "rgba(255,255,255,0.7)"}
                fontWeight="bold"
                fontSize="11px"
                onClick={() => setStatusFilter(st)}
                _hover={{ bg: statusFilter === st ? "#8b5cf6" : "rgba(255,255,255,0.12)" }}
              >
                {st.toUpperCase()}
              </Button>
            ))}
          </HStack>
        </Flex>

        {/* Cards Grid */}
        {filteredInterests.length === 0 ? (
          <Box py={16} textAlign="center" borderRadius="2xl" border="1px dashed rgba(255,255,255,0.1)" bg="rgba(255,255,255,0.02)">
            <FileText size={40} color="rgba(255,255,255,0.2)" style={{ margin: "0 auto 12px auto" }} />
            <Text fontWeight="bold" fontSize="md" color="white" mb={1}>No RFP Interests Found</Text>
            <Text color="rgba(255,255,255,0.4)" fontSize="xs">
              {interests.length === 0 ? "You haven't submitted any RFP proposals yet." : "No proposals match your search filter."}
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" gap={4}>
            {filteredInterests.map((item) => {
              const isAccepted = item.status === "accepted";
              const isRejected = item.status === "rejected";
              const targetRfpId = typeof item.rfp === "object" ? item.rfp?.id : item.rfp;

              return (
                <Box
                  key={item.id}
                  p={5}
                  borderRadius="2xl"
                  bg="rgba(15, 23, 42, 0.7)"
                  border={
                    isAccepted
                      ? "1px solid rgba(16, 185, 129, 0.4)"
                      : isRejected
                      ? "1px solid rgba(239, 68, 68, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.1)"
                  }
                  boxShadow="0 8px 32px rgba(0,0,0,0.3)"
                  cursor="pointer"
                  onClick={() => targetRfpId && navigate(`/rfps/${targetRfpId}`)}
                  _hover={{ bg: "rgba(15, 23, 42, 0.95)", transform: "translateY(-2px)", borderColor: "#8b5cf6" }}
                  transition="all 0.2s"
                >
                  <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
                    <VStack align="start" gap={2} flex={1}>
                      <HStack gap={2.5} flexWrap="wrap">
                        <Heading size="xs" color="white" fontWeight="bold" _hover={{ color: "#c4b5fd" }}>
                          {item.rfp_title || `RFP Proposal #${item.id}`}
                        </Heading>
                        {item.quotation_id && (
                          <Badge bg="rgba(139, 92, 246, 0.15)" color="#c4b5fd" fontSize="10px" px={2.5} py={0.5} borderRadius="md">
                            {item.quotation_id}
                          </Badge>
                        )}
                      </HStack>

                      <HStack gap={3} color="rgba(255,255,255,0.6)" fontSize="xs" flexWrap="wrap">
                        <HStack gap={1}>
                          <Building2 size={13} color="#a78bfa" />
                          <Text fontWeight="600">{item.rfp_company_name || "Company Client"}</Text>
                        </HStack>
                        <Text color="rgba(255,255,255,0.3)">•</Text>
                        <HStack gap={1}>
                          <Clock size={12} />
                          <Text>{new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</Text>
                        </HStack>
                      </HStack>

                      {item.proposal_summary && (
                        <Box bg="rgba(0,0,0,0.3)" p={3} borderRadius="xl" w="full" mt={1}>
                          <Text fontSize="xs" color="rgba(255,255,255,0.7)" lineHeight="1.6">
                            {item.proposal_summary}
                          </Text>
                        </Box>
                      )}
                    </VStack>

                    <VStack align="flex-end" gap={3}>
                      <Badge
                        px={3.5}
                        py={1.5}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="800"
                        bg={
                          isAccepted
                            ? "rgba(16, 185, 129, 0.15)"
                            : isRejected
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(245, 158, 11, 0.15)"
                        }
                        color={isAccepted ? "#34d399" : isRejected ? "#f87171" : "#fbbf24"}
                        border={
                          isAccepted
                            ? "1px solid rgba(16, 185, 129, 0.3)"
                            : isRejected
                            ? "1px solid rgba(239, 68, 68, 0.3)"
                            : "1px solid rgba(245, 158, 11, 0.3)"
                        }
                      >
                        {isAccepted ? "✓ ACCEPTED" : isRejected ? "✕ REJECTED" : "⏳ PENDING"}
                      </Badge>

                      <Button
                        size="xs"
                        variant="ghost"
                        color="#c4b5fd"
                        fontSize="11px"
                        fontWeight="bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (targetRfpId) navigate(`/rfps/${targetRfpId}`);
                        }}
                        _hover={{ bg: "rgba(139, 92, 246, 0.2)", color: "white" }}
                      >
                        View RFP Details →
                      </Button>
                    </VStack>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default MySubmittedRFPInterestsPage;
