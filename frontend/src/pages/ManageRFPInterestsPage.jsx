import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, Heading
} from "@chakra-ui/react";
import {
  ArrowLeft, FileText, Link2, AlertCircle, Building2, CheckCircle,
  Mail, Phone, User, Clock, ChevronDown, ChevronUp, Download, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api, { backendUrl } from "../api";

const MotionBox = motion.create(Box);

const ManageRFPInterestsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [rfps, setRfps] = useState([]);
  const [interests, setInterests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRfpId, setSelectedRfpId] = useState("all");

  // Expanded proposal summary tracking
  const [expandedInterests, setExpandedInterests] = useState({});

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const accentColor = "#10b981"; // Emerald brand color for approvals/success/proposals

  const [activeReviewInterestId, setActiveReviewInterestId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);

  const handleToggleReviewForm = (interest) => {
    if (!interest) {
      setActiveReviewInterestId(null);
      return;
    }
    if (activeReviewInterestId === interest.id) {
      setActiveReviewInterestId(null);
    } else {
      setActiveReviewInterestId(interest.id);
      if (interest.associated_review) {
        setReviewRating(interest.associated_review.rating);
        setReviewText(interest.associated_review.review_text);
      } else {
        setReviewRating(5);
        setReviewText("");
      }
    }
  };

  const handleSubmitReview = async (interest) => {
    if (!reviewText.trim()) {
      showError("Please write a review comment.");
      return;
    }
    setSubmitReviewLoading(true);
    try {
      let updatedReview = null;
      if (interest.associated_review) {
        // Edit existing review
        const reviewId = interest.associated_review.id;
        const reviewType = interest.associated_review.type;
        if (reviewType === "company") {
          const res = await api.patch(`reviews/${reviewId}/`, {
            rating: reviewRating,
            review_text: reviewText,
          });
          updatedReview = {
            id: res.data.id,
            rating: res.data.rating,
            review_text: res.data.review_text,
            type: "company",
          };
        } else {
          const res = await api.patch(`freelancer-reviews/${reviewId}/`, {
            rating: reviewRating,
            review_text: reviewText,
          });
          updatedReview = {
            id: res.data.id,
            rating: res.data.rating,
            review_text: res.data.review_text,
            type: "freelancer",
          };
        }
        setSuccessMsg("Feedback updated successfully.");
      } else {
        // Submit a new review
        if (interest.company_name && interest.company_name.trim() !== "") {
          // Submit a company review
          const res = await api.post("reviews/", {
            company_name: interest.company_name,
            rating: reviewRating,
            review_text: reviewText,
            rfp_interest: interest.id,
          });
          updatedReview = {
            id: res.data.id,
            rating: res.data.rating,
            review_text: res.data.review_text,
            type: "company",
          };
        } else {
          // Submit a freelancer review
          const res = await api.post("freelancer-reviews/", {
            freelancer: interest.user,
            rating: reviewRating,
            review_text: reviewText,
            rfp_interest: interest.id,
          });
          updatedReview = {
            id: res.data.id,
            rating: res.data.rating,
            review_text: res.data.review_text,
            type: "freelancer",
          };
        }
        setSuccessMsg("Feedback submitted successfully.");
      }
      setTimeout(() => setSuccessMsg(""), 4000);
      
      // Update local state
      setInterests((prev) =>
        prev.map((item) =>
          item.id === interest.id
            ? { ...item, is_reviewed: true, associated_review: updatedReview }
            : item
        )
      );
      setActiveReviewInterestId(null);
    } catch (err) {
      console.error(err);
      showError("Failed to submit review.");
    } finally {
      setSubmitReviewLoading(false);
    }
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 3000);
  };

  const fetchData = async () => {
    try {
      const [cRes, uRes, rRes, riRes] = await Promise.all([
        api.get(`companies/${id}/`),
        api.get("me/"),
        api.get(`rfps/?company_id=${id}`),
        api.get(`rfp-interests/?company_id=${id}`),
      ]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
      setRfps(rRes.data);
      setInterests(riRes.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load proposals.");
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

  const toggleExpandSummary = (interestId) => {
    setExpandedInterests((prev) => ({
      ...prev,
      [interestId]: !prev[interestId],
    }));
  };

  const handleUpdateStatus = async (interestId, newStatus) => {
    try {
      await api.patch(`rfp-interests/${interestId}/`, { status: newStatus });
      setSuccessMsg(`Proposal ${newStatus === "accepted" ? "accepted" : "declined"} successfully.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setInterests((prev) =>
        prev.map((item) => (item.id === interestId ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      console.error(err);
      showError("Failed to update proposal status.");
    }
  };

  const isOwner = currentUser && company && company.creator === currentUser.id;
  const currentUserMemberInfo = company?.members_details?.find((m) => m.id === currentUser?.id);
  const isAdmin = currentUserMemberInfo?.access_role === "admin";
  const hasAccess = isOwner || isAdmin;

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color="var(--color-accent)" />
          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="black" letterSpacing="widest">
            LOADING PROPOSALS...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (!company || !hasAccess) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)" direction="column" gap={4}>
        <AlertCircle size={48} color="#ef4444" />
        <Text color="var(--color-text-primary)" fontSize="lg" fontWeight="bold">Access Denied.</Text>
        <Button onClick={() => navigate("/dashboard")} colorScheme="blue">Back to Dashboard</Button>
      </Flex>
    );
  }

  // Apply filters
  const filteredInterests = interests.filter((interest) => {
    return selectedRfpId === "all" || String(interest.rfp) === selectedRfpId;
  });

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="hidden" pb="100px">
      {/* glows */}
      <Box position="absolute" top="-20%" left="-10%" w="50%" h="50%"
        style={{ background: `${accentColor}10`, filter: "blur(150px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        <Container maxW="900px" px={{ base: 5, md: 8 }} pt={10}>
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={8}>
            <VStack align="start" gap={1}>
              <Button variant="ghost" color="var(--color-text-muted)" fontWeight="bold" fontSize="2xs"
                letterSpacing="widest" px={0} mb={2} _hover={{ color: "white", transform: "translateX(-4px)" }}
                transition="all 0.3s" onClick={() => navigate(`/company/${id}`)}>
                <ArrowLeft size={13} style={{ marginRight: "6px" }} />
                BACK TO DASHBOARD
              </Button>
              <Heading size="xl" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                RFP Proposals Received
              </Heading>
              <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="medium">
                Review vendor proposals and pitches submitted for <strong>{company.name}</strong>'s RFPs
              </Text>
            </VStack>
          </Flex>

          {/* Toast Message */}
          <AnimatePresence>
            {errorMsg && (
              <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.3)" p={3.5} borderRadius="xl" mb={6}>
                <HStack gap={3}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text color="#ef4444" fontSize="xs" fontWeight="bold">{errorMsg}</Text>
                </HStack>
              </MotionBox>
            )}
            {successMsg && (
              <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                bg="rgba(16,185,129,0.1)" border="1px solid rgba(16,185,129,0.3)" p={3.5} borderRadius="xl" mb={6}>
                <HStack gap={3}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text color="#10b981" fontSize="xs" fontWeight="bold">{successMsg}</Text>
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Filters Bar */}
          <Box p={5} borderRadius="2xl" border="1px solid var(--color-card-border)"
            style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }} mb={8}>
            <VStack align="stretch" gap={1}>
              <Text color="var(--color-text-muted)" fontSize="2xs" fontWeight="black" letterSpacing="wider">FILTER BY SPECIFIC RFP</Text>
              <Box
                as="select"
                value={selectedRfpId}
                onChange={(e) => setSelectedRfpId(e.target.value)}
                style={{
                  background: "var(--color-card-hover-bg)",
                  color: "white",
                  height: "40px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-card-border)",
                  fontSize: "12px",
                  padding: "0 12px",
                  outline: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <option value="all" style={{ background: "#0f172a", color: "white" }}>All Public RFPs ({rfps.length})</option>
                {rfps.map((rfp) => (
                  <option key={rfp.id} value={rfp.id} style={{ background: "#0f172a", color: "white" }}>
                    {rfp.title} ({rfp.is_active ? "Active" : "Closed"})
                  </option>
                ))}
              </Box>
            </VStack>
          </Box>

          {/* Interests List */}
          <VStack gap={5} align="stretch">
            {filteredInterests.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py="80px" px={6} borderRadius="3xl"
                border="1px dashed var(--color-card-border)" bg="var(--color-glass)" textAlign="center">
                <FileText size={48} color="var(--color-card-border)" style={{ marginBottom: "16px" }} />
                <Text color="var(--color-text-primary)" fontWeight="black" fontSize="lg" mb={1}>No Proposals Found</Text>
                <Text color="var(--color-text-muted)" fontSize="xs" maxW="320px">
                  There are no submitted proposal pitches matching your filter.
                </Text>
              </Flex>
            ) : (
              <AnimatePresence>
                {filteredInterests.map((interest, idx) => {
                  const rfpTitle = rfps.find((r) => r.id === interest.rfp)?.title || "Unknown RFP";
                  const isExpanded = !!expandedInterests[interest.id];

                  return (
                    <MotionBox
                      key={interest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      p={{ base: 5, md: 6 }}
                      borderRadius="2xl"
                      border="1px solid var(--color-card-border)"
                      style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                      _hover={{ borderColor: "var(--color-card-border)", bg: "var(--color-glass)" }}
                    >
                      {/* Identity & Header Info */}
                      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4} mb={4}>
                        <HStack gap={4} align="center">
                          <Box w="10" h="10" borderRadius="xl" bg="rgba(16,185,129,0.1)" display="flex" alignItems="center" justify="center"
                            border="1px solid rgba(16,185,129,0.25)">
                            <User size={18} color={accentColor} />
                          </Box>
                          <VStack align="start" gap={0.5}>
                            <Text color="var(--color-text-primary)" fontWeight="black" fontSize="sm" letterSpacing="tight">{interest.company_name}</Text>
                            <HStack gap={3} flexWrap="wrap">
                              <HStack gap={1.5} fontSize="xs" color="var(--color-text-muted)">
                                <Mail size={12} />
                                <Text>{interest.email}</Text>
                              </HStack>
                              {interest.phone_number && (
                                <HStack gap={1.5} fontSize="xs" color="var(--color-text-muted)">
                                  <Phone size={12} />
                                  <Text>{interest.phone_number}</Text>
                                </HStack>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>

                        <VStack align={{ base: "start", md: "end" }} gap={1.5}>
                          <HStack gap={1.5}>
                            <FileText size={12} color="var(--color-text-muted)" />
                            <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="black">{rfpTitle}</Text>
                          </HStack>
                          <Flex align="center" gap={2}>
                            <HStack gap={1} fontSize="3xs" color="var(--color-text-muted)" fontWeight="bold" letterSpacing="wider">
                              <Clock size={10} />
                              <Text>{new Date(interest.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }).toUpperCase()}</Text>
                            </HStack>
                            <Badge
                              fontSize="3xs"
                              borderRadius="md"
                              px={2}
                              py={0.5}
                              fontWeight="bold"
                              style={{
                                background:
                                  interest.status === "accepted" ? "rgba(16,185,129,0.15)" :
                                  interest.status === "rejected" ? "rgba(239,68,68,0.15)" :
                                  "rgba(245,158,11,0.15)",
                                color:
                                  interest.status === "accepted" ? "#10b981" :
                                  interest.status === "rejected" ? "#ef4444" :
                                  "#f59e0b",
                                border:
                                  interest.status === "accepted" ? "1px solid rgba(16,185,129,0.3)" :
                                  interest.status === "rejected" ? "1px solid rgba(239,68,68,0.3)" :
                                  "1px solid rgba(245,158,11,0.3)",
                              }}
                            >
                              {interest.status?.toUpperCase() || "PENDING"}
                            </Badge>
                          </Flex>
                        </VStack>
                      </Flex>

                      {/* Proposal text & files */}
                      <VStack align="stretch" gap={3.5} p={4} borderRadius="xl" bg="var(--color-input-bg)" border="1px solid var(--color-glass)">
                        <Box>
                          <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="wider" mb={1.5}>
                            PROPOSAL SUMMARY / PITCH
                          </Text>
                          <Text color="var(--color-text-secondary)" fontSize="xs" lineHeight="1.6" noOfLines={isExpanded ? undefined : 3} whiteSpace="pre-wrap">
                            {interest.proposal_summary}
                          </Text>
                          {interest.proposal_summary.split("\n").length > 3 || interest.proposal_summary.length > 250 ? (
                            <Button variant="link" size="xs" color={accentColor} mt={2.5} fontWeight="bold"
                              onClick={() => toggleExpandSummary(interest.id)}
                              rightIcon={isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}>
                              {isExpanded ? "Show Less" : "Read Full Proposal"}
                            </Button>
                          ) : null}
                        </Box>

                        {/* Attachments & Action Buttons */}
                        <HStack gap={3} pt={3.5} borderTop="1px solid var(--color-card-border)" justify="space-between" flexWrap="wrap">
                          {interest.attached_file ? (
                            <Button
                              as="a"
                              href={
                                interest.attached_file.startsWith("http://") || interest.attached_file.startsWith("https://")
                                  ? interest.attached_file
                                  : `${backendUrl}${interest.attached_file}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              h="7.5"
                              px={3.5}
                              borderRadius="xl"
                              fontSize="2xs"
                              fontWeight="bold"
                              style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981" }}
                              _hover={{ background: "rgba(16, 185, 129, 0.2)" }}
                              leftIcon={<Download size={11} />}
                            >
                              Download Proposal File
                            </Button>
                          ) : (
                            <Box />
                          )}

                          {interest.status === "accepted" && (
                            <HStack gap={3}>
                              {interest.is_reviewed ? (
                                <Badge colorScheme="green" variant="subtle" px={2.5} py={1} borderRadius="lg" fontSize="3xs" fontWeight="bold">
                                  ✓ FEEDBACK SUBMITTED
                                </Badge>
                              ) : (
                                <Button
                                  h="7.5"
                                  px={4}
                                  borderRadius="xl"
                                  fontSize="2xs"
                                  fontWeight="bold"
                                  style={{
                                    background: "rgba(16, 185, 129, 0.1)",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                    color: "#10b981",
                                  }}
                                  _hover={{ background: "rgba(16, 185, 129, 0.2)" }}
                                  onClick={() => handleToggleReviewForm(interest)}
                                >
                                  {activeReviewInterestId === interest.id ? "Cancel Review" : "Rate & Review Partner"}
                                </Button>
                              )}
                            </HStack>
                          )}

                          {interest.status === "pending" && (
                            <HStack gap={3}>
                              <Button
                                h="7.5"
                                px={4}
                                borderRadius="xl"
                                fontSize="2xs"
                                fontWeight="bold"
                                variant="ghost"
                                color="#ef4444"
                                _hover={{ background: "rgba(239, 68, 68, 0.1)" }}
                                onClick={() => handleUpdateStatus(interest.id, "rejected")}
                              >
                                Decline
                              </Button>
                              <Button
                                h="7.5"
                                px={5}
                                borderRadius="xl"
                                fontSize="2xs"
                                fontWeight="bold"
                                style={{
                                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                  color: "white",
                                  boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                                }}
                                _hover={{
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 6px 16px rgba(16,185,129,0.3)",
                                }}
                                transition="all 0.2s"
                                onClick={() => handleUpdateStatus(interest.id, "accepted")}
                              >
                                Accept Proposal
                              </Button>
                            </HStack>
                          )}
                        </HStack>

                        {interest.is_reviewed && interest.associated_review && (
                          <Box mt={3} p={3.5} borderRadius="xl" border="1px solid rgba(255, 255, 255, 0.05)" bg="rgba(0, 0, 0, 0.15)">
                            <Flex justify="space-between" align="center" mb={1.5}>
                              <HStack gap={1}>
                                <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                                  YOUR FEEDBACK
                                </Text>
                                <HStack gap={0.5} ml={2}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={12}
                                      style={{
                                        fill: star <= interest.associated_review.rating ? "#F59E0B" : "none",
                                        stroke: star <= interest.associated_review.rating ? "#F59E0B" : "#4b5563",
                                      }}
                                    />
                                  ))}
                                </HStack>
                              </HStack>
                              <Button
                                size="xs"
                                h="6"
                                px={2.5}
                                variant="ghost"
                                fontSize="3xs"
                                color="var(--color-text-muted)"
                                _hover={{ color: "white", bg: "rgba(255,255,255,0.05)" }}
                                onClick={() => handleToggleReviewForm(interest)}
                              >
                                {activeReviewInterestId === interest.id ? "Cancel Edit" : "Edit Review"}
                              </Button>
                            </Flex>
                            {activeReviewInterestId !== interest.id && (
                              <Text color="var(--color-text-secondary)" fontSize="xs" fontStyle="italic">
                                "{interest.associated_review.review_text}"
                              </Text>
                            )}
                          </Box>
                        )}

                        {activeReviewInterestId === interest.id && (
                          <Box mt={4} p={4} borderRadius="xl" border="1px solid var(--color-card-border)" bg="rgba(255,255,255,0.02)">
                            <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="bold" mb={2}>
                              {interest.company_name ? `Rate & Review ${interest.company_name}` : `Rate & Review Candidate`}
                            </Text>

                            {/* Stars */}
                            <HStack gap={1} mb={4}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Box
                                  key={star}
                                  cursor="pointer"
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setReviewRating(star)}
                                >
                                  <Star
                                    size={20}
                                    style={{
                                      fill: star <= (hoverRating || reviewRating) ? "#F59E0B" : "none",
                                      stroke: star <= (hoverRating || reviewRating) ? "#F59E0B" : "#4b5563",
                                    }}
                                  />
                                </Box>
                              ))}
                            </HStack>

                            {/* Review Text */}
                            <Box
                              as="textarea"
                              placeholder="Write a brief review about your experience working on this RFP..."
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              rows={3}
                              style={{
                                width: "100%",
                                background: "var(--color-input-bg)",
                                color: "white",
                                border: "1px solid var(--color-input-border)",
                                borderRadius: "12px",
                                padding: "8px 12px",
                                fontSize: "12px",
                                outline: "none",
                                resize: "none",
                              }}
                            />

                            <HStack justify="end" gap={3} mt={3}>
                              <Button
                                size="xs"
                                variant="ghost"
                                color="var(--color-text-muted)"
                                onClick={() => handleToggleReviewForm(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="xs"
                                style={{
                                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                  color: "white",
                                }}
                                isLoading={submitReviewLoading}
                                onClick={() => handleSubmitReview(interest)}
                              >
                                {interest.associated_review ? "Update Feedback" : "Submit Feedback"}
                              </Button>
                            </HStack>
                          </Box>
                        )}
                      </VStack>
                    </MotionBox>
                  );
                })}
              </AnimatePresence>
            )}
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default ManageRFPInterestsPage;
