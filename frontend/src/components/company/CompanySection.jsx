import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Badge,
  Circle,
  Heading,
  Textarea,
  Spinner,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import {
  Building2,
  Search,
  Settings2,
  UserMinus,
  UserPlus,
  ChevronRight,
  Globe,
  MapPin,
  Users,
  Star,
  MessageSquare,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";
import CompanyProfileModal from "./CompanyProfileModal";

const MotionBox = motion.create(Box);

const CompanySection = ({ user, refreshTrigger, onCompanyChange }) => {
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Leave & Rating Modal State
  const [leaveModalState, setLeaveModalState] = useState({
    isOpen: false,
    company: null,
    rating: 5,
    hoverRating: 0,
    reviewText: "",
    submitting: false,
    errorMsg: "",
  });

  const fetchCompanies = async () => {
    try {
      const res = await api.get("companies/");
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [refreshTrigger]);

  const handleAttachUser = async (companyId) => {
    try {
      await api.post(`companies/${companyId}/join/`);
      fetchCompanies();
      if (onCompanyChange) onCompanyChange();
    } catch (err) {
      console.error("Error joining company.", err);
    }
  };

  const handleOpenLeaveModal = (company) => {
    setLeaveModalState({
      isOpen: true,
      company: company,
      rating: 5,
      hoverRating: 0,
      reviewText: "",
      submitting: false,
      errorMsg: "",
    });
  };

  const handleConfirmLeave = async (skipReview = false) => {
    const { company, rating, reviewText } = leaveModalState;
    if (!company) return;

    setLeaveModalState((prev) => ({ ...prev, submitting: true, errorMsg: "" }));

    try {
      // 1. If not skipping review, submit Company Review
      if (!skipReview && rating > 0) {
        await api.post("reviews/", {
          company: company.id,
          company_name: company.name,
          rating: rating,
          review_text: reviewText.trim() || `Left company ${company.name}`,
        });
      }

      // 2. Perform leave action
      await api.post(`companies/${company.id}/leave/`);

      setLeaveModalState({
        isOpen: false,
        company: null,
        rating: 5,
        hoverRating: 0,
        reviewText: "",
        submitting: false,
        errorMsg: "",
      });

      fetchCompanies();
      if (onCompanyChange) onCompanyChange();
    } catch (err) {
      console.error("Error leaving company", err);
      setLeaveModalState((prev) => ({
        ...prev,
        submitting: false,
        errorMsg: err.response?.data?.error || err.response?.data?.detail || "Failed to complete operation.",
      }));
    }
  };

  const handleManageCompany = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleModalSaved = () => {
    fetchCompanies();
    if (onCompanyChange) onCompanyChange();
  };

  const filteredCompanies = companies.filter((company) => {
    const isMember = company.members.includes(user.id);
    const isCreator = company.creator === user.id;

    if (searchQuery.trim() === "") {
      return isMember || isCreator;
    } else {
      return company.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const INDUSTRY_LABELS = {
    tech: "Information Technology",
    fintech: "Financial Technology",
    healthcare: "Healthcare & Biotech",
    ecom: "E-Commerce & Retail",
    edu: "Education & EdTech",
    media: "Media & Entertainment",
    other: "Other Industry",
  };

  const currentHoverRating = leaveModalState.hoverRating || leaveModalState.rating;

  return (
    <>
      <Box className="glass-card" p={6}>
        <VStack align="stretch" gap={6}>
          {/* Header & Search */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "stretch", sm: "center" }}
            gap={4}
          >
            <VStack align="start" gap={1}>
              <Heading
                size="sm"
                color="var(--color-text-primary)"
                fontWeight="black"
                letterSpacing="wide"
              >
                ORGANIZATIONS & TEAMS
              </Heading>

              <Text color="var(--color-text-muted)" fontSize="xs">
                Manage organizations you belong to or discover new teams.
              </Text>
            </VStack>

            <HStack
              bg="var(--color-bg-subtle)"
              px={3}
              py={1.5}
              borderRadius="xl"
              border="1px solid var(--color-card-border)"
              w={{ base: "full", sm: "240px" }}
            >
              <Search size={14} color="var(--color-text-muted)" />
              <Input
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="plain"
                size="sm"
                fontSize="xs"
                color="var(--color-text-primary)"
                _placeholder={{ color: "var(--color-text-muted)" }}
              />
            </HStack>
          </Flex>

          {/* List of Companies */}
          <AnimatePresence>
            {filteredCompanies.map((company) => {
              const isMember = company.members.includes(user.id);
              const isCreator = company.creator === user.id;

              return (
                <MotionBox
                  key={company.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  p={4}
                  borderRadius="xl"
                  border="1px solid var(--color-card-border)"
                  bg="rgba(255, 255, 255, 0.01)"
                  _hover={{
                    borderColor: "var(--color-card-hover-border)",
                    bg: "var(--color-card-hover-bg)",
                  }}
                  transition="all 0.2s"
                >
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "start", md: "center" }}
                    gap={4}
                  >
                    {/* Left: Info */}
                    <HStack gap={4} align="center">
                      <Box
                        w="48px"
                        h="48px"
                        borderRadius="xl"
                        overflow="hidden"
                        flexShrink={0}
                        bg="var(--color-surface)"
                        border="1px solid var(--color-card-border)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Building2
                            size={20}
                            color="var(--color-text-muted)"
                          />
                        )}
                      </Box>

                      <VStack align="start" gap={1}>
                        <HStack gap={2} flexWrap="wrap">
                          <Text
                            color="var(--color-text-primary)"
                            fontWeight="bold"
                            fontSize="sm"
                          >
                            {company.name}
                          </Text>

                          {isCreator && (
                            <Badge
                              size="xs"
                              bg="rgba(66,153,225,0.15)"
                              color="var(--color-accent)"
                              border="1px solid rgba(66,153,225,0.3)"
                              fontSize="9px"
                              fontWeight="bold"
                              borderRadius="md"
                            >
                              CREATOR / OWNER
                            </Badge>
                          )}

                          {isMember && !isCreator && (
                            <Badge
                              size="xs"
                              bg="rgba(72,199,116,0.15)"
                              color="#48C774"
                              border="1px solid rgba(72,199,116,0.3)"
                              fontSize="9px"
                              fontWeight="bold"
                              borderRadius="md"
                            >
                              MEMBER
                            </Badge>
                          )}
                        </HStack>

                        <HStack
                          gap={3}
                          flexWrap="wrap"
                          color="var(--color-text-muted)"
                          fontSize="xs"
                        >
                          <Text>
                            {INDUSTRY_LABELS[company.industry] ||
                              company.industry}
                          </Text>

                          <Text>•</Text>

                          <HStack gap={1}>
                            <Users size={12} color="var(--color-text-muted)" />
                            <Text>{company.members?.length || 0} members</Text>
                          </HStack>

                          {company.website && (
                            <>
                              <Text>•</Text>
                              <HStack gap={1}>
                                <Globe size={10} color="rgba(66,153,225,0.6)" />
                                <Text
                                  as="a"
                                  href={company.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  color="rgba(66,153,225,0.7)"
                                  fontSize="10px"
                                  fontWeight="bold"
                                  letterSpacing="widest"
                                  _hover={{ color: "var(--color-accent)" }}
                                >
                                  WEBSITE
                                </Text>
                              </HStack>
                            </>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>

                    {/* Right: Action Buttons */}
                    <VStack gap={2} flexShrink={0}>
                      {isCreator && (
                        <Button
                          size="sm"
                          h="8"
                          px={4}
                          borderRadius="lg"
                          fontWeight="black"
                          fontSize="10px"
                          letterSpacing="widest"
                          color="white"
                          onClick={() => handleManageCompany(company)}
                          style={{
                            background:
                              "linear-gradient(135deg, var(--color-accent) 0%, rgba(100,150,255,0.9) 100%)",
                            boxShadow: "0 2px 12px rgba(66,153,225,0.3)",
                          }}
                          _hover={{
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 20px rgba(66,153,225,0.5)",
                          }}
                          transition="all 0.2s"
                        >
                          <Settings2 size={11} style={{ marginRight: "5px" }} />
                          MANAGE
                        </Button>
                      )}

                      {!isMember ? (
                        <Button
                          size="sm"
                          h="8"
                          px={4}
                          bg="var(--color-bg-subtle)"
                          color="var(--color-text-primary)"
                          borderRadius="lg"
                          fontWeight="black"
                          fontSize="10px"
                          letterSpacing="widest"
                          border="1px solid var(--color-card-border)"
                          _hover={{ bg: "var(--color-card-border)" }}
                          onClick={() => handleAttachUser(company.id)}
                        >
                          <UserPlus size={11} style={{ marginRight: "5px" }} />
                          JOIN
                        </Button>
                      ) : !isCreator ? (
                        <Button
                          size="sm"
                          h="8"
                          px={4}
                          variant="ghost"
                          color="rgba(255,100,100,0.7)"
                          borderRadius="lg"
                          fontWeight="black"
                          fontSize="10px"
                          letterSpacing="widest"
                          _hover={{ bg: "rgba(255,100,100,0.1)", color: "rgba(255,100,100,1)" }}
                          onClick={() => handleOpenLeaveModal(company)}
                        >
                          <UserMinus size={11} style={{ marginRight: "5px" }} />
                          LEAVE
                        </Button>
                      ) : null}
                    </VStack>
                  </Flex>
                </MotionBox>
              );
            })}
          </AnimatePresence>

          {filteredCompanies.length === 0 && (
            <Flex direction="column" align="center" py={12} gap={4}>
              <Building2 size={48} color="var(--color-text-muted)" style={{ opacity: 0.2 }} />
              <Text
                color="var(--color-text-muted)"
                fontSize="sm"
                fontWeight="medium"
                textAlign="center"
              >
                {searchQuery.trim() === ""
                  ? "You haven't joined any organizations yet."
                  : "No organizations match your inquiry."}
              </Text>
            </Flex>
          )}
        </VStack>
      </Box>

      {/* Company Profile Modal */}
      <CompanyProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={selectedCompany}
        onSaved={handleModalSaved}
      />

      {/* ── LEAVE COMPANY & RATING MODAL ────────────────────────────────────── */}
      <Dialog
        open={leaveModalState.isOpen}
        onOpenChange={(e) =>
          !e.open &&
          setLeaveModalState((prev) => ({ ...prev, isOpen: false }))
        }
        size="md"
      >
        <DialogBackdrop bg="blackAlpha.800" backdropFilter="blur(12px)" zIndex={99990} />
        <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={99995}>
          <DialogContent
            bg="var(--color-surface, #0a0f1e)"
            border="1px solid var(--color-card-border, rgba(255,255,255,0.15))"
            borderRadius="2xl"
            maxW="540px"
            w="full"
            m="auto"
            overflow="hidden"
            style={{ backdropFilter: "blur(24px)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
          >
            <DialogHeader py={6} px={7} borderBottom="1px solid var(--color-card-border, rgba(255,255,255,0.1))">
              <HStack gap={3}>
                <Box p={2.5} borderRadius="xl" bg="rgba(239, 68, 68, 0.15)" border="1px solid rgba(239, 68, 68, 0.3)">
                  <LogOut size={20} color="#ef4444" />
                </Box>
                <VStack align="start" gap={0}>
                  <Heading size="xs" color="white" fontWeight="900" letterSpacing="wide">
                    LEAVE {leaveModalState.company?.name?.toUpperCase()}
                  </Heading>
                  <Text color="var(--color-text-muted, rgba(255,255,255,0.5))" fontSize="xs">
                    Share your rating & experience working with this organization.
                  </Text>
                </VStack>
              </HStack>
            </DialogHeader>

            <DialogCloseTrigger color="whiteAlpha.600" top={6} right={6} />

            <DialogBody p={7}>
              <VStack gap={5} align="stretch">
                {leaveModalState.errorMsg && (
                  <Box p={3} borderRadius="lg" bg="rgba(239,68,68,0.15)" border="1px solid rgba(239,68,68,0.3)">
                    <Text fontSize="xs" color="#f87171" fontWeight="bold">
                      {leaveModalState.errorMsg}
                    </Text>
                  </Box>
                )}

                {/* Rating Stars Section */}
                <Box textAlign="center" py={2} bg="rgba(255,255,255,0.02)" p={4} borderRadius="xl" border="1px solid rgba(255,255,255,0.05)">
                  <Text color="var(--color-text-secondary, rgba(255,255,255,0.7))" fontSize="xs" fontWeight="bold" mb={3} letterSpacing="wide">
                    HOW WAS YOUR EXPERIENCE AT {leaveModalState.company?.name?.toUpperCase()}?
                  </Text>
                  <HStack justify="center" gap={3} mb={2}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setLeaveModalState((prev) => ({
                            ...prev,
                            rating: star,
                          }))
                        }
                        onMouseEnter={() =>
                          setLeaveModalState((prev) => ({
                            ...prev,
                            hoverRating: star,
                          }))
                        }
                        onMouseLeave={() =>
                          setLeaveModalState((prev) => ({
                            ...prev,
                            hoverRating: 0,
                          }))
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          transition: "transform 0.15s",
                          transform: star <= currentHoverRating ? "scale(1.15)" : "scale(1)",
                        }}
                      >
                        <Star
                          size={28}
                          color={star <= currentHoverRating ? "#f59e0b" : "rgba(255,255,255,0.2)"}
                          style={{
                            fill: star <= currentHoverRating ? "#f59e0b" : "none",
                            filter: star <= currentHoverRating ? "drop-shadow(0 0 8px rgba(245,158,11,0.5))" : "none",
                          }}
                        />
                      </button>
                    ))}
                  </HStack>
                  <Text fontSize="xs" color="#fbbf24" fontWeight="800">
                    {currentHoverRating === 5 && "★★★★★ Excellent"}
                    {currentHoverRating === 4 && "★★★★☆ Good"}
                    {currentHoverRating === 3 && "★★★☆☆ Average"}
                    {currentHoverRating === 2 && "★★☆☆☆ Needs Improvement"}
                    {currentHoverRating === 1 && "★☆☆☆☆ Poor"}
                  </Text>
                </Box>

                {/* Review Text Input */}
                <Box>
                  <Text color="var(--color-text-secondary, rgba(255,255,255,0.7))" fontSize="xs" fontWeight="bold" mb={2} letterSpacing="wide">
                    WRITTEN REVIEW / FEEDBACK (OPTIONAL)
                  </Text>
                  <Textarea
                    placeholder="Describe culture, projects, management, or your reason for departure..."
                    value={leaveModalState.reviewText}
                    onChange={(e) =>
                      setLeaveModalState((prev) => ({
                        ...prev,
                        reviewText: e.target.value,
                      }))
                    }
                    minH="100px"
                    bg="rgba(0,0,0,0.3)"
                    border="1px solid rgba(255,255,255,0.12)"
                    color="white"
                    _focus={{ borderColor: "var(--color-accent, #8b5cf6)" }}
                    fontSize="xs"
                  />
                </Box>
              </VStack>
            </DialogBody>

            <DialogFooter p={7} bg="rgba(0,0,0,0.2)" borderTop="1px solid rgba(255,255,255,0.08)" flexWrap="wrap" gap={3}>
              <Button
                variant="ghost"
                color="var(--color-text-muted, rgba(255,255,255,0.5))"
                size="sm"
                onClick={() =>
                  setLeaveModalState((prev) => ({ ...prev, isOpen: false }))
                }
                _hover={{ bg: "rgba(255,255,255,0.08)" }}
              >
                Cancel
              </Button>

              <HStack gap={2.5} ml="auto">
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="rgba(255,255,255,0.15)"
                  color="rgba(255,255,255,0.7)"
                  isLoading={leaveModalState.submitting}
                  onClick={() => handleConfirmLeave(true)}
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  fontSize="xs"
                >
                  Skip & Leave
                </Button>

                <Button
                  size="sm"
                  style={{
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "white",
                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.35)",
                  }}
                  isLoading={leaveModalState.submitting}
                  onClick={() => handleConfirmLeave(false)}
                  fontWeight="bold"
                  fontSize="xs"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(239, 68, 68, 0.5)" }}
                >
                  Submit Rating & Leave
                </Button>
              </HStack>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </Dialog>
    </>
  );
};

export default CompanySection;
