import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Textarea,
  Badge,
  Circle,
  Flex,
  Grid,
} from "@chakra-ui/react";
import { Check, Edit2, Trash2, Star, AlertCircle, ShieldAlert } from "lucide-react";
import api from "../api";

const FlaggedReviewModerator = () => {
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit Modal State
  const [editingReview, setEditingReview] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredReviews = flaggedReviews.filter(review => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "job") return review.review_type === "job";
    if (selectedFilter === "rfp") return review.review_type === "rfp";
    if (selectedFilter === "reviews") return review.review_type === "company" || review.review_type === "freelancer";
    return true;
  });

  const sortedAndFiltered = [...filteredReviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  useEffect(() => {
    fetchFlaggedReviews();
  }, []);

  const fetchFlaggedReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("admin/reviews/flagged/");
      setFlaggedReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch flagged reviews", err);
      setError("Failed to load flagged reviews from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismissFlag = async (review) => {
    if (!window.confirm("Are you sure you want to dismiss this flag? The review will remain visible on the profile.")) {
      return;
    }
    setError("");
    setSuccess("");
    try {
      await api.post("admin/reviews/flagged/", {
        review_id: review.id,
        review_type: review.review_type,
        action: "dismiss",
      });
      setSuccess("Flag dismissed successfully.");
      fetchFlaggedReviews();
    } catch (err) {
      console.error("Failed to dismiss flag", err);
      setError("Failed to dismiss flag.");
    }
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }
    setError("");
    setSuccess("");
    try {
      await api.post("admin/reviews/flagged/", {
        review_id: review.id,
        review_type: review.review_type,
        action: "delete",
      });
      setSuccess("Review deleted successfully.");
      fetchFlaggedReviews();
    } catch (err) {
      console.error("Failed to delete review", err);
      setError("Failed to delete review.");
    }
  };

  const handleOpenEditModal = (review) => {
    setEditingReview(review);
    setEditText(review.review_text);
    setEditRating(review.rating);
  };

  const handleCloseEditModal = () => {
    setEditingReview(null);
    setEditText("");
    setEditRating(5);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      alert("Review text cannot be empty.");
      return;
    }
    setSavingEdit(true);
    setError("");
    setSuccess("");
    try {
      await api.post("admin/reviews/flagged/", {
        review_id: editingReview.id,
        review_type: editingReview.review_type,
        action: "edit",
        review_text: editText.trim(),
        rating: editRating,
      });
      setSuccess("Review updated and unflagged successfully.");
      handleCloseEditModal();
      fetchFlaggedReviews();
    } catch (err) {
      console.error("Failed to update review", err);
      setError("Failed to update review.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) return <Text color="var(--color-text-primary)">Loading review moderator...</Text>;

  return (
    <Box
      p={6}
      bg="var(--color-card-bg)"
      borderRadius="xl"
      border="1px solid"
      borderColor="var(--color-card-border)"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <VStack align="stretch" gap={6}>
        <Box mb={2}>
          <Heading size="md" color="var(--color-text-primary)" mb={1}>
            Flagged Content Moderation
          </Heading>
          <Text fontSize="xs" color="var(--color-text-secondary)">
            Content flagged by users for violations. Moderate, edit, or delete items.
          </Text>
        </Box>

        {/* Filter Tabs / Buttons */}
        <HStack gap={2} mb={2} wrap="wrap">
          <Button
            size="xs"
            onClick={() => setSelectedFilter("all")}
            style={{
              background: selectedFilter === "all" ? "var(--color-accent)" : "var(--color-input-bg)",
              color: selectedFilter === "all" ? "white" : "var(--color-text-secondary)",
              border: "1px solid",
              borderColor: selectedFilter === "all" ? "var(--color-accent)" : "var(--color-input-border)",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            _hover={{ opacity: 0.9 }}
          >
            All Content ({flaggedReviews.length})
          </Button>
          <Button
            size="xs"
            onClick={() => setSelectedFilter("job")}
            style={{
              background: selectedFilter === "job" ? "#0D9488" : "var(--color-input-bg)",
              color: selectedFilter === "job" ? "white" : "var(--color-text-secondary)",
              border: "1px solid",
              borderColor: selectedFilter === "job" ? "#0D9488" : "var(--color-input-border)",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            _hover={{ opacity: 0.9 }}
          >
            Job Openings ({flaggedReviews.filter(r => r.review_type === 'job').length})
          </Button>
          <Button
            size="xs"
            onClick={() => setSelectedFilter("rfp")}
            style={{
              background: selectedFilter === "rfp" ? "#EA580C" : "var(--color-input-bg)",
              color: selectedFilter === "rfp" ? "white" : "var(--color-text-secondary)",
              border: "1px solid",
              borderColor: selectedFilter === "rfp" ? "#EA580C" : "var(--color-input-border)",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            _hover={{ opacity: 0.9 }}
          >
            RFP Proposals ({flaggedReviews.filter(r => r.review_type === 'rfp').length})
          </Button>
          <Button
            size="xs"
            onClick={() => setSelectedFilter("reviews")}
            style={{
              background: selectedFilter === "reviews" ? "#7C3AED" : "var(--color-input-bg)",
              color: selectedFilter === "reviews" ? "white" : "var(--color-text-secondary)",
              border: "1px solid",
              borderColor: selectedFilter === "reviews" ? "#7C3AED" : "var(--color-input-border)",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            _hover={{ opacity: 0.9 }}
          >
            Reviews & Comments ({flaggedReviews.filter(r => r.review_type === 'company' || r.review_type === 'freelancer').length})
          </Button>
        </HStack>

        {error && (
          <HStack
            p={3}
            bg="red.900/30"
            border="1px solid"
            borderColor="red.500/30"
            borderRadius="lg"
            color="red.300"
            gap={2}
          >
            <AlertCircle size={14} />
            <Text fontSize="2xs" fontWeight="bold">
              {error.toUpperCase()}
            </Text>
          </HStack>
        )}

        {success && (
          <HStack
            p={3}
            bg="green.900/30"
            border="1px solid"
            borderColor="green.500/30"
            borderRadius="lg"
            color="green.300"
            gap={2}
          >
            <Check size={14} />
            <Text fontSize="2xs" fontWeight="bold">
              {success.toUpperCase()}
            </Text>
          </HStack>
        )}

        {sortedAndFiltered.length === 0 ? (
          <Flex py={16} direction="column" align="center" justify="center" gap={3}>
            <Circle size="12" bg="green.900/20" color="green.400">
              <Check size={24} />
            </Circle>
            <Text color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">
              {flaggedReviews.length === 0 
                ? "No flagged content in queue. Good job!" 
                : `No flagged ${
                    selectedFilter === "job" 
                      ? "job openings" 
                      : selectedFilter === "rfp" 
                      ? "RFP proposals" 
                      : "reviews or comments"
                  } in queue.`}
            </Text>
          </Flex>
        ) : (
          <Grid templateColumns="1fr" gap={4}>
            {sortedAndFiltered.map((review) => (
              <Box
                key={`${review.review_type}-${review.id}`}
                p={5}
                borderRadius="xl"
                border="1px solid"
                borderColor="var(--color-card-border)"
                bg="var(--color-card-bg)"
                transition="all 0.2s"
                _hover={{ borderColor: "var(--color-card-hover-border)", bg: "var(--color-card-hover-bg)" }}
              >
                <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
                  <VStack align="start" gap={3} flex={1}>
                    <HStack gap={2.5}>
                      <Badge
                        fontSize="2xs"
                        px={2.5}
                        py={0.5}
                        borderRadius="md"
                        colorScheme={
                          review.review_type === "company"
                            ? "blue"
                            : review.review_type === "freelancer"
                            ? "purple"
                            : review.review_type === "job"
                            ? "teal"
                            : "orange"
                        }
                        variant="subtle"
                      >
                        {review.review_type === "company"
                          ? "Company Review"
                          : review.review_type === "freelancer"
                          ? "Freelancer Review"
                          : review.review_type === "job"
                          ? "Job Opening"
                          : "RFP Proposal"}
                      </Badge>
                      <Text fontSize="2xs" color="var(--color-text-muted)">
                        {new Date(review.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </HStack>

                    <Box>
                      <Text fontSize="xs" color="var(--color-text-secondary)" mb={0.5}>
                        {review.review_type === "job" || review.review_type === "rfp"
                          ? `Owner Email: `
                          : `Submitted by: `}
                        <strong style={{ color: "var(--color-text-primary)" }}>{review.reviewer_name}</strong> ({review.reviewer_email})
                      </Text>
                      <Text fontSize="xs" color="var(--color-text-secondary)">
                        About: <strong style={{ color: "var(--color-text-primary)" }}>{review.subject_name}</strong>
                      </Text>
                    </Box>

                    {review.rating !== null && review.rating !== undefined && (
                      <HStack gap={1} py={0.5}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={13}
                            style={{
                              fill: star <= review.rating ? "#F59E0B" : "none",
                              stroke: star <= review.rating ? "#F59E0B" : "#4b5563",
                            }}
                          />
                        ))}
                      </HStack>
                    )}

                    {review.flag_reason && (
                      <Box
                        p={3}
                        borderRadius="lg"
                        bg="rgba(239, 68, 68, 0.08)"
                        border="1px solid rgba(239, 68, 68, 0.2)"
                        w="full"
                      >
                        <Text fontSize="2xs" fontWeight="bold" color="red.400" mb={1} letterSpacing="wider">
                          FLAG REASON / COMMENT:
                        </Text>
                        <Text fontSize="xs" color="var(--color-text-primary)" style={{ whiteSpace: "pre-wrap" }}>
                          {review.flag_reason}
                        </Text>
                      </Box>
                    )}

                    <Box
                      p={3}
                      borderRadius="lg"
                      bg="var(--color-input-bg)"
                      borderLeft="3px solid"
                      borderLeftColor="var(--color-accent)"
                      w="full"
                    >
                      <Text fontSize="2xs" fontWeight="bold" color="var(--color-text-muted)" mb={1} letterSpacing="wider">
                        {review.review_type === "job" || review.review_type === "rfp"
                          ? "DESCRIPTION CONTENT:"
                          : "REVIEW CONTENT:"}
                      </Text>
                      <Text fontSize="sm" color="var(--color-text-primary)" style={{ whiteSpace: "pre-wrap" }}>
                        {review.review_text}
                      </Text>
                    </Box>
                  </VStack>

                  <HStack gap={2} alignSelf={{ base: "stretch", sm: "start" }} width={{ base: "full", sm: "auto" }} justify="end">
                    <Button
                      size="sm"
                      h={9}
                      px={3}
                      bg="green.600"
                      color="white"
                      _hover={{ bg: "green.700" }}
                      onClick={() => handleDismissFlag(review)}
                    >
                      <HStack gap={1.5}>
                        <Check size={12} />
                        <Text fontSize="xs" fontWeight="bold">DISMISS</Text>
                      </HStack>
                    </Button>
                    <Button
                      size="sm"
                      h={9}
                      px={3}
                      bg="blue.600"
                      color="white"
                      _hover={{ bg: "blue.700" }}
                      onClick={() => handleOpenEditModal(review)}
                    >
                      <HStack gap={1.5}>
                        <Edit2 size={12} />
                        <Text fontSize="xs" fontWeight="bold">EDIT</Text>
                      </HStack>
                    </Button>
                    <Button
                      size="sm"
                      h={9}
                      px={3}
                      bg="red.600"
                      color="white"
                      _hover={{ bg: "red.700" }}
                      onClick={() => handleDeleteReview(review)}
                    >
                      <HStack gap={1.5}>
                        <Trash2 size={12} />
                        <Text fontSize="xs" fontWeight="bold">DELETE</Text>
                      </HStack>
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            ))}
          </Grid>
        )}
      </VStack>

      {/* Premium Edit Modal Dialog overlay */}
      {editingReview && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.800"
          backdropFilter="blur(8px)"
          zIndex="9999"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="var(--color-surface)"
            border="1px solid"
            borderColor="var(--color-card-border)"
            borderRadius="2xl"
            p={6}
            w="full"
            maxW="md"
            boxShadow="2xl"
          >
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between" align="center">
                <HStack gap={2}>
                  <ShieldAlert size={16} color="var(--color-accent)" />
                  <Heading size="xs" color="var(--color-text-primary)" fontWeight="bold">
                    {editingReview.review_type === "job"
                      ? "Moderate Job Opening"
                      : editingReview.review_type === "rfp"
                      ? "Moderate RFP Proposal"
                      : "Moderate Review"}
                  </Heading>
                </HStack>
                <Button
                  onClick={handleCloseEditModal}
                  size="xs"
                  bg="var(--color-input-bg)"
                  color="var(--color-text-secondary)"
                  border="1px solid"
                  borderColor="var(--color-input-border)"
                  style={{ cursor: "pointer" }}
                  _hover={{ bg: "var(--color-card-hover-bg)" }}
                >
                  Close
                </Button>
              </HStack>

              <Text fontSize="2xs" color="var(--color-text-muted)">
                Editing {editingReview.review_type} ID #{editingReview.id} for {editingReview.subject_name}.
              </Text>

              {/* Edit Rating (Only for company/freelancer reviews) */}
              {editingReview.rating !== null && editingReview.rating !== undefined && (
                <Box>
                  <Text color="var(--color-text-secondary)" fontSize="10px" fontWeight="bold" letterSpacing="wider" mb="1.5">
                    EDIT RATING (1-5 STARS)
                  </Text>
                  <HStack gap={2}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditRating(star)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                      >
                        <Star
                          size={20}
                          style={{
                            fill: star <= editRating ? "#F59E0B" : "none",
                            stroke: star <= editRating ? "#F59E0B" : "#4b5563",
                          }}
                        />
                      </button>
                    ))}
                  </HStack>
                </Box>
              )}

              {/* Edit Text */}
              <Box>
                <Text color="var(--color-text-secondary)" fontSize="10px" fontWeight="bold" letterSpacing="wider" mb="1.5">
                  {editingReview.review_type === "job" || editingReview.review_type === "rfp"
                    ? "EDIT DESCRIPTION CONTENT"
                    : "EDIT REVIEW CONTENT"}
                </Text>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Content description..."
                  rows={5}
                  bg="var(--color-input-bg)"
                  color="var(--color-text-primary)"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="var(--color-input-border)"
                  _focus={{ borderColor: "var(--color-accent)", outline: "none" }}
                  fontSize="sm"
                  p={3}
                />
              </Box>

              <HStack gap={3} mt={2}>
                <Button
                  onClick={handleSaveEdit}
                  isLoading={savingEdit}
                  bg="var(--color-accent)"
                  color="white"
                  style={{ cursor: "pointer" }}
                  _hover={{ opacity: 0.9 }}
                  flex={1}
                  h={10}
                  borderRadius="lg"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  Save & Approve
                </Button>
                <Button
                  onClick={handleCloseEditModal}
                  bg="var(--color-input-bg)"
                  color="var(--color-text-secondary)"
                  border="1px solid"
                  borderColor="var(--color-input-border)"
                  style={{ cursor: "pointer" }}
                  _hover={{ bg: "var(--color-card-hover-bg)" }}
                  px={5}
                  h={10}
                  borderRadius="lg"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FlaggedReviewModerator;
