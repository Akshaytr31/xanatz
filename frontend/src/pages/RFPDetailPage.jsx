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
  Heading,
  Circle,
  Icon,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Calendar,
  Building2,
  Share2,
  Check,
  Flag,
  FileText,
  DollarSign,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import RFPInterestModal from "../components/company/RFPInterestModal";
import FlagConfirmationModal from "../components/FlagConfirmationModal";
import ShareModal from "../components/ShareModal";
import { ALL_CATEGORY_LABELS, ALL_SUBCATEGORY_LABELS } from "../components/company/JobOpeningModal";
import api, { backendUrl } from "../api";

const MotionBox = motion.create(Box);

const RFPDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${backendUrl}${path}`;
  };

  const [rfp, setRfp] = useState(null);
  const [otherRfps, setOtherRfps] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const accentColor = "#8b5cf6"; // Purple accent for RFPs

  const [flagModal, setFlagModal] = useState({
    isOpen: false,
    status: 'confirm',
    loading: false
  });

  const handleOpenFlagModal = () => {
    setFlagModal({
      isOpen: true,
      status: 'confirm',
      loading: false
    });
  };

  const handleCloseFlagModal = () => {
    const wasSuccess = flagModal.status === 'success';
    setFlagModal({
      isOpen: false,
      status: 'confirm',
      loading: false
    });
    if (wasSuccess) {
      navigate("/rfps");
    }
  };

  const handleConfirmFlag = async (reason) => {
    setFlagModal(prev => ({ ...prev, loading: true }));
    try {
      await api.post(`rfps/${id}/flag/`, { reason });
      setFlagModal(prev => ({ ...prev, loading: false, status: 'success' }));
    } catch (err) {
      console.error("Error flagging RFP:", err);
      setFlagModal(prev => ({ ...prev, loading: false, status: 'error' }));
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleExpressInterestClick = () => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setIsInterestOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rfpRes, rfpsListRes] = await Promise.all([
          api.get(`rfps/${id}/`),
          api.get("rfps/"),
        ]);
        setRfp(rfpRes.data);
        if (rfpsListRes.data) {
          setOtherRfps(rfpsListRes.data.filter(r => String(r.id) !== String(id)).slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching RFP details:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;
      try {
        const userRes = await api.get("me/");
        setCurrentUser(userRes.data);
      } catch (err) {
        console.error("Failed to fetch user in RFPDetailPage:", err);
      }
    };

    fetchData();
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color={accentColor} />
          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="black" letterSpacing="widest">
            LOADING RFP DETAILS...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (!rfp) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)" direction="column" gap={4}>
        <Text color="var(--color-text-primary)" fontSize="lg" fontWeight="black">
          RFP Not Found
        </Text>
        <Text color="var(--color-text-muted)" fontSize="xs">
          The requested Request for Proposal could not be found or has been removed.
        </Text>
        <Button
          onClick={() => navigate("/rfps")}
          bg={accentColor}
          color="white"
          fontWeight="bold"
          borderRadius="xl"
          px={6}
        >
          BACK TO RFPs
        </Button>
      </Flex>
    );
  }

  const isOwner = currentUser && rfp.company === currentUser.company_id;

  return (
    <Box
      minH="100vh"
      bg="var(--color-primary)"
      position="relative"
      overflow="clip"
      pb="100px"
    >
      {/* Ambient background glows */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="60%"
        h="60%"
        style={{ background: `${accentColor}12`, filter: "blur(150px)" }}
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
        style={{ background: "rgba(59,130,246,0.06)", filter: "blur(120px)" }}
        borderRadius="full"
        zIndex={0}
        pointerEvents="none"
      />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        <Container maxW="1350px" px={{ base: 5, md: 8 }} pt="80px">
          {/* Back button */}
          <Button
            variant="unstyled"
            display="inline-flex"
            alignItems="center"
            h="36px"
            px={4}
            borderRadius="xl"
            border="1px solid var(--color-card-border)"
            style={{
              background: "var(--color-glass)",
              backdropFilter: "blur(10px)",
              color: "var(--color-text-secondary)",
              transition: "all 0.3s ease",
            }}
            _hover={{
              background: "var(--color-card-border)",
              borderColor: "rgba(255,255,255,0.18)",
              color: "white",
              boxShadow: "0 4px 15px var(--color-input-bg)",
            }}
            fontWeight="black"
            fontSize="2xs"
            letterSpacing="widest"
            mb={6}
            onClick={() => navigate("/rfps")}
          >
            <ArrowLeft size={12} style={{ marginRight: "6px" }} />
            BACK TO RFPs STREAM
          </Button>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            w="full"
          >
            <Flex
              direction={{ base: "column", lg: "row" }}
              gap={8}
              align="start"
              w="full"
            >
              {/* Left Column: RFP Main Content */}
              <Box flex={{ base: "none", lg: "2.8" }} w="full">
                {/* Header Card */}
                <Box
                  p={{ base: 6, md: 8 }}
                  borderRadius="2xl"
                  border="1px solid var(--color-card-border)"
                  style={{
                    background: "var(--color-glass)",
                    backdropFilter: "blur(20px)",
                  }}
                  mb={8}
                >
                  <Flex
                    justify="space-between"
                    align="start"
                    wrap="wrap"
                    mb={6}
                    gap={4}
                  >
                    <HStack gap={5} align="start" flex={1}>
                      <Box
                        w="72px"
                        h="72px"
                        borderRadius="2xl"
                        overflow="hidden"
                        flexShrink={0}
                        border="1px solid var(--color-card-border)"
                        style={{ background: "var(--color-glass)" }}
                      >
                        {rfp.company_logo_url ? (
                          <Box
                            as="img"
                            src={rfp.company_logo_url}
                            alt={rfp.company_name}
                            w="full"
                            h="full"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <Flex
                            w="full"
                            h="full"
                            align="center"
                            justify="center"
                          >
                            <Building2 size={32} color={accentColor} />
                          </Flex>
                        )}
                      </Box>

                      <VStack align="start" gap={2} flex={1}>
                        <HStack gap={2.5} align="center" wrap="wrap">
                          {rfp.rfp_id && (
                            <Badge variant="outline" colorScheme="gray" fontSize="xs" px={2} py={0.5} borderRadius="md" color="var(--color-text-secondary)">
                              {rfp.rfp_id}
                            </Badge>
                          )}
                          {rfp.version && (
                            <Badge variant="subtle" colorScheme="blue" fontSize="xs" px={2} py={0.5} borderRadius="md" color="rgba(147,197,253,0.9)" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)" }}>
                              V{rfp.version}
                            </Badge>
                          )}
                          <Heading
                            size="lg"
                            color="var(--color-text-primary)"
                            fontWeight="black"
                            letterSpacing="tight"
                          >
                            {rfp.title}
                          </Heading>
                        </HStack>

                        <HStack gap={3} flexWrap="wrap">
                          <Text
                            color="var(--color-secondary)"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            {rfp.company_name}
                          </Text>
                          <Box w="1px" h="14px" bg="var(--color-card-border)" />
                          {rfp.category && (
                            <Badge
                              px={2.5}
                              py={0.5}
                              fontSize="xs"
                              fontWeight="bold"
                              borderRadius="md"
                              style={{
                                background: "rgba(59, 130, 246, 0.12)",
                                color: "rgba(147, 197, 253, 0.9)",
                                border: "1px solid rgba(59, 130, 246, 0.25)",
                              }}
                            >
                              {ALL_CATEGORY_LABELS[rfp.category] || rfp.category}
                            </Badge>
                          )}
                          {rfp.sub_category && (
                            <Badge
                              px={2.5}
                              py={0.5}
                              fontSize="xs"
                              fontWeight="bold"
                              borderRadius="md"
                              style={{
                                background: "rgba(139, 92, 246, 0.12)",
                                color: "rgba(196, 181, 253, 0.9)",
                                border: "1px solid rgba(139, 92, 246, 0.25)",
                              }}
                            >
                              {ALL_SUBCATEGORY_LABELS[rfp.sub_category] || rfp.sub_category}
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      {isOwner ? (
                        <Button
                          onClick={() => navigate(`/company/${rfp.company}/rfps`)}
                          px={6}
                          h="40px"
                          borderRadius="xl"
                          fontWeight="black"
                          fontSize="xs"
                          letterSpacing="widest"
                          color="white"
                          style={{
                            background: accentColor,
                            boxShadow: `0 8px 20px rgba(139, 92, 246, 0.3)`,
                            border: "1px solid var(--color-card-border)",
                            transition: "all 0.3s ease",
                            cursor: "pointer"
                          }}
                          _hover={{
                            transform: "translateY(-2px)",
                            filter: "brightness(1.1)",
                          }}
                        >
                          MANAGE RFP
                        </Button>
                      ) : (
                        <Button
                          onClick={handleExpressInterestClick}
                          px={6}
                          h="40px"
                          borderRadius="xl"
                          fontWeight="black"
                          fontSize="xs"
                          letterSpacing="widest"
                          color="white"
                          style={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            boxShadow: `0 8px 20px rgba(16, 185, 129, 0.3)`,
                            border: "1px solid var(--color-card-border)",
                            transition: "all 0.3s ease",
                            cursor: "pointer"
                          }}
                          _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: `0 12px 28px rgba(16, 185, 129, 0.4)`,
                            filter: "brightness(1.1)",
                          }}
                        >
                          EXPRESS INTEREST
                        </Button>
                      )}

                      <Button
                        onClick={handleShare}
                        px={4}
                        h="40px"
                        borderRadius="xl"
                        fontWeight="black"
                        fontSize="xs"
                        letterSpacing="widest"
                        variant="outline"
                        color={copied ? "#48C774" : "var(--color-text-secondary)"}
                        borderColor={copied ? "#48C774" : "var(--color-card-border)"}
                        style={{
                          background: copied ? "rgba(72, 199, 116, 0.1)" : "transparent",
                          transition: "all 0.3s ease",
                        }}
                        _hover={{
                          bg: copied ? "rgba(72, 199, 116, 0.2)" : "var(--color-card-border)",
                          color: copied ? "#48C774" : "white",
                          transform: "translateY(-2px)",
                        }}
                      >
                        {copied ? (
                          <HStack gap={1.5}>
                            <Check size={14} color="#48C774" />
                            <Text>COPIED!</Text>
                          </HStack>
                        ) : (
                          <HStack gap={1.5}>
                            <Share2 size={14} />
                            <Text>SHARE</Text>
                          </HStack>
                        )}
                      </Button>

                      {!isOwner && (
                        <Button
                          onClick={handleOpenFlagModal}
                          px={4}
                          h="40px"
                          borderRadius="xl"
                          fontWeight="black"
                          fontSize="xs"
                          letterSpacing="widest"
                          variant="outline"
                          color="var(--color-text-secondary)"
                          borderColor="var(--color-card-border)"
                          _hover={{
                            bg: "rgba(239, 68, 68, 0.1)",
                            borderColor: "#EF4444",
                            color: "#EF4444"
                          }}
                        >
                          <Flag size={14} style={{ marginRight: "6px" }} />
                          FLAG RFP
                        </Button>
                      )}
                    </HStack>
                  </Flex>

                  {/* Highlight Meta Bar */}
                  <Flex
                    gap={4}
                    wrap="wrap"
                    p={4}
                    borderRadius="xl"
                    bg="var(--color-input-bg)"
                    border="1px solid var(--color-card-border)"
                  >
                    {rfp.budget && (
                      <HStack gap={2} px={3} py={1.5} borderRadius="lg" bg="rgba(16, 185, 129, 0.1)" border="1px solid rgba(16, 185, 129, 0.2)">
                        <DollarSign size={16} color="#10b981" />
                        <VStack align="start" gap={0}>
                          <Text fontSize="4xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider">ESTIMATED BUDGET</Text>
                          <Text color="#10b981" fontSize="xs" fontWeight="black">AED {rfp.budget.replace(/[$₹]/g, '').toUpperCase()}</Text>
                        </VStack>
                      </HStack>
                    )}

                    {rfp.deadline && (
                      <HStack gap={2} px={3} py={1.5} borderRadius="lg" bg="rgba(139, 92, 246, 0.1)" border="1px solid rgba(139, 92, 246, 0.2)">
                        <Calendar size={16} color={accentColor} />
                        <VStack align="start" gap={0}>
                          <Text fontSize="4xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider">SUBMISSION DEADLINE</Text>
                          <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="black">
                            {new Date(rfp.deadline).toLocaleDateString(undefined, { dateStyle: "long" })}
                          </Text>
                        </VStack>
                      </HStack>
                    )}

                    <HStack gap={2} px={3} py={1.5} borderRadius="lg" bg="var(--color-card-border)">
                      <Clock size={16} color="var(--color-text-secondary)" />
                      <VStack align="start" gap={0}>
                        <Text fontSize="4xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider">POSTED DATE</Text>
                        <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="black">
                          {new Date(rfp.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </Text>
                      </VStack>
                    </HStack>
                  </Flex>
                </Box>

                {/* Section 1: Project Description */}
                <Box
                  p={{ base: 6, md: 8 }}
                  borderRadius="2xl"
                  border="1px solid var(--color-card-border)"
                  style={{
                    background: "var(--color-glass)",
                    backdropFilter: "blur(20px)",
                  }}
                  mb={8}
                >
                  <Heading
                    size="md"
                    color="var(--color-text-primary)"
                    fontWeight="black"
                    letterSpacing="tight"
                    mb={4}
                  >
                    Project Description
                  </Heading>
                  <Text
                    color="var(--color-text-secondary)"
                    fontSize="sm"
                    lineHeight="1.8"
                    whiteSpace="pre-wrap"
                  >
                    {rfp.description}
                  </Text>
                </Box>

                {/* Section 2: Requirements */}
                {rfp.requirements && (
                  <Box
                    p={{ base: 6, md: 8 }}
                    borderRadius="2xl"
                    border="1px solid var(--color-card-border)"
                    style={{
                      background: "var(--color-glass)",
                      backdropFilter: "blur(20px)",
                    }}
                    mb={8}
                  >
                    <Heading
                      size="md"
                      color="var(--color-text-primary)"
                      fontWeight="black"
                      letterSpacing="tight"
                      mb={4}
                    >
                      Proposal & Vendor Requirements
                    </Heading>
                    <Text
                      color="var(--color-text-secondary)"
                      fontSize="sm"
                      lineHeight="1.8"
                      whiteSpace="pre-wrap"
                    >
                      {rfp.requirements}
                    </Text>
                  </Box>
                )}

                {/* Section 3: Vendor Submission Guidelines */}
                <Box
                  p={{ base: 6, md: 8 }}
                  borderRadius="2xl"
                  border="1px solid var(--color-card-border)"
                  style={{
                    background: "var(--color-glass)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <HStack gap={2.5} mb={4}>
                    <Info size={20} color={accentColor} />
                    <Heading
                      size="md"
                      color="var(--color-text-primary)"
                      fontWeight="black"
                      letterSpacing="tight"
                    >
                      Vendor Proposal Guidelines
                    </Heading>
                  </HStack>

                  <VStack align="start" gap={3.5} fontSize="xs" color="var(--color-text-muted)">
                    <HStack align="start" gap={3}>
                      <Circle size="6px" bg={accentColor} mt="6px" />
                      <Text color="var(--color-text-secondary)">
                        Ensure your company profile and capability statements are fully up-to-date before expressing interest.
                      </Text>
                    </HStack>
                    <HStack align="start" gap={3}>
                      <Circle size="6px" bg={accentColor} mt="6px" />
                      <Text color="var(--color-text-secondary)">
                        Including relevant portfolio references and preliminary cost breakdowns increases acceptance rates.
                      </Text>
                    </HStack>
                    <HStack align="start" gap={3}>
                      <Circle size="6px" bg={accentColor} mt="6px" />
                      <Text color="var(--color-text-secondary)">
                        Once interest is expressed, the client will review your submission and initiate direct communication.
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </Box>

              {/* Right Column: Sidebar info & other RFPs */}
              <Box flex={{ base: "none", lg: "1" }} w="full">
                <VStack align="stretch" gap={6}>
                  {/* Company Summary Card */}
                  <Box
                    p={6}
                    borderRadius="2xl"
                    border="1px solid var(--color-card-border)"
                    style={{
                      background: "var(--color-glass)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <Text color="var(--color-text-muted)" fontSize="4xs" fontWeight="black" letterSpacing="widest" mb={4}>
                      ISSUING ORGANIZATION
                    </Text>

                    <Flex align="center" gap={4} mb={4}>
                      <Box
                        w="52px"
                        h="52px"
                        borderRadius="xl"
                        overflow="hidden"
                        border="1px solid var(--color-card-border)"
                        bg="var(--color-surface)"
                        flexShrink={0}
                      >
                        {rfp.company_logo_url ? (
                          <Box
                            as="img"
                            src={rfp.company_logo_url}
                            alt={rfp.company_name}
                            w="full"
                            h="full"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <Flex w="full" h="full" align="center" justify="center">
                            <Building2 size={24} color={accentColor} />
                          </Flex>
                        )}
                      </Box>

                      <VStack align="start" gap={0.5}>
                        <Text color="var(--color-text-primary)" fontWeight="black" fontSize="sm">
                          {rfp.company_name}
                        </Text>
                        <Badge bg={`${accentColor}15`} color={accentColor} fontSize="4xs" borderRadius="md">
                          VERIFIED CLIENT
                        </Badge>
                      </VStack>
                    </Flex>

                    {!isOwner && (
                      <Button
                        onClick={handleExpressInterestClick}
                        w="full"
                        h="42px"
                        borderRadius="xl"
                        fontWeight="black"
                        fontSize="xs"
                        letterSpacing="widest"
                        color="white"
                        style={{
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          boxShadow: "0 4px 15px rgba(16, 185, 129, 0.25)",
                        }}
                        _hover={{
                          transform: "translateY(-1px)",
                          filter: "brightness(1.1)",
                        }}
                      >
                        EXPRESS INTEREST NOW
                      </Button>
                    )}
                  </Box>

                  {/* Other RFPs Sidebar Stream */}
                  {otherRfps.length > 0 && (
                    <Box
                      p={6}
                      borderRadius="2xl"
                      border="1px solid var(--color-card-border)"
                      style={{
                        background: "var(--color-glass)",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      <HStack justify="space-between" align="center" mb={4}>
                        <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="black" letterSpacing="tight">
                          OTHER OPEN RFPs
                        </Text>
                        <Button
                          variant="link"
                          fontSize="4xs"
                          color={accentColor}
                          fontWeight="bold"
                          onClick={() => navigate("/rfps")}
                        >
                          VIEW ALL
                        </Button>
                      </HStack>

                      <VStack align="stretch" gap={3}>
                        {otherRfps.map((other) => (
                          <Box
                            key={other.id}
                            p={3.5}
                            borderRadius="xl"
                            border="1px solid var(--color-card-border)"
                            bg="var(--color-input-bg)"
                            cursor="pointer"
                            transition="all 0.2s"
                            _hover={{
                              borderColor: accentColor,
                              transform: "translateY(-1px)",
                            }}
                            onClick={() => navigate(`/rfps/${other.id}`)}
                          >
                            <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="black" noOfLines={1} mb={1}>
                              {other.title}
                            </Text>
                            <HStack justify="space-between" align="center">
                              <Text color="var(--color-text-muted)" fontSize="4xs" fontWeight="bold">
                                {other.company_name}
                              </Text>
                              {other.budget && (
                                <Text color="#10b981" fontSize="4xs" fontWeight="black">
                                  AED {other.budget.replace(/[$₹]/g, '').toUpperCase()}
                                </Text>
                              )}
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </Box>
            </Flex>
          </MotionBox>
        </Container>
      </Box>

      {/* Flag Confirmation Modal */}
      <FlagConfirmationModal
        isOpen={flagModal.isOpen}
        onClose={handleCloseFlagModal}
        onConfirm={handleConfirmFlag}
        loading={flagModal.loading}
        status={flagModal.status}
        contentType="rfp"
      />

      {/* RFP Interest Modal */}
      {rfp && (
        <RFPInterestModal
          isOpen={isInterestOpen}
          onClose={() => setIsInterestOpen(false)}
          rfp={rfp}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={rfp?.title || "RFP Project"}
        company={rfp?.company_name}
        summary={rfp?.description ? rfp.description.substring(0, 140) : "Request for Proposal on Xanatz"}
        url={window.location.href}
        type="rfp"
      />
    </Box>
  );
};

export default RFPDetailPage;
