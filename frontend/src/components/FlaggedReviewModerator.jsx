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

  if (loading) return <Text color="white">Loading review moderator...</Text>;

  return (
    <Box
      p={6}
      bg="whiteAlpha.50"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(12px)"
    >
      <VStack align="stretch" gap={6}>
        <Box mb={2}>
          <Heading size="md" color="var(--color-text-primary)" mb={1}>
            Flagged Reviews Moderation
          </Heading>
          <Text fontSize="xs" color="whiteAlpha.600">
            Review submissions flagged by users. Clean up content or remove inappropriate reviews.
          </Text>
        </Box>

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

        {flaggedReviews.length === 0 ? (
          <Flex py={16} direction="column" align="center" justify="center" gap={3}>
            <Circle size="12" bg="green.900/20" color="green.400">
              <Check size={24} />
            </Circle>
            <Text color="whiteAlpha.500" fontSize="sm" fontWeight="medium">
              No flagged reviews in queue. Good job!
            </Text>
          </Flex>
        ) : (
          <Grid templateColumns="1fr" gap={4}>
            {flaggedReviews.map((review) => (
              <Box
                key={`${review.review_type}-${review.id}`}
                p={5}
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
                bg="whiteAlpha.50"
                transition="all 0.2s"
                _hover={{ borderColor: "whiteAlpha.200", bg: "whiteAlpha.100" }}
              >
                <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
                  <VStack align="start" gap={3} flex={1}>
                    <HStack gap={2.5}>
                      <Badge
                        fontSize="2xs"
                        px={2.5}
                        py={0.5}
                        borderRadius="md"
                        colorScheme={review.review_type === "company" ? "blue" : "purple"}
                        variant="subtle"
                      >
                        {review.review_type === "company" ? "Company Review" : "Freelancer Review"}
                      </Badge>
                      <Text fontSize="2xs" color="whiteAlpha.500">
                        {new Date(review.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </HStack>

                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.600" mb={0.5}>
                        Submitted by: <strong style={{ color: "white" }}>{review.reviewer_name}</strong> ({review.reviewer_email})
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.600">
                        About: <strong style={{ color: "white" }}>{review.subject_name}</strong>
                      </Text>
                    </Box>

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

                    <Box
                      p={3}
                      borderRadius="lg"
                      bg="blackAlpha.400"
                      borderLeft="3px solid"
                      borderLeftColor="var(--color-accent)"
                      w="full"
                    >
                      <Text fontSize="sm" color="whiteAlpha.900" style={{ whiteSpace: "pre-wrap" }}>
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
            bg="#0b1120"
            border="1px solid"
            borderColor="whiteAlpha.200"
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
                  <Heading size="xs" color="white" fontWeight="bold">
                    Moderate Review
                  </Heading>
                </HStack>
                <Button
                  onClick={handleCloseEditModal}
                  size="xs"
                  bg="whiteAlpha.100"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  Close
                </Button>
              </HStack>

              <Text fontSize="2xs" color="whiteAlpha.500">
                Editing review ID #{editingReview.id} submitted for {editingReview.subject_name}.
              </Text>

              {/* Edit Rating */}
              <Box>
                <Text color="whiteAlpha.600" fontSize="10px" fontWeight="bold" letterSpacing="wider" mb="1.5">
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

              {/* Edit Text */}
              <Box>
                <Text color="whiteAlpha.600" fontSize="10px" fontWeight="bold" letterSpacing="wider" mb="1.5">
                  EDIT REVIEW CONTENT
                </Text>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Review content..."
                  rows={5}
                  bg="whiteAlpha.100"
                  color="white"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
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
                  bg="whiteAlpha.100"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
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
