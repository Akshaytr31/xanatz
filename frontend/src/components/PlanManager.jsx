import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Flex,
  Grid,
} from "@chakra-ui/react";
import { Plus, Edit2, Check, X, Shield, PlusCircle, AlertCircle } from "lucide-react";
import api from "../api";

const fieldStyle = {
  bg: "whiteAlpha.100",
  color: "white",
  h: "10",
  borderRadius: "lg",
  border: "1px solid",
  borderColor: "whiteAlpha.200",
  _focus: { borderColor: "var(--color-accent)", outline: "none" },
  _placeholder: { color: "slate.600" },
  fontSize: "sm",
  px: "4",
};

const labelStyle = {
  color: "whiteAlpha.600",
  fontSize: "10px",
  fontWeight: "bold",
  letterSpacing: "wider",
  mb: "1.5",
};

const PlanManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    display_name: "",
    price: "",
    max_jobs: "",
    job_duration_days: "",
    description: "",
    featuresText: "",
    is_active: true,
  });

  const [editingPlanId, setEditingPlanId] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("plans/");
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch plans", err);
      setError("Failed to load plans from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlanId(plan.id);
    setError("");
    setSuccess("");
    setForm({
      name: plan.name,
      display_name: plan.display_name,
      price: plan.price.toString(),
      max_jobs: plan.max_jobs.toString(),
      job_duration_days: plan.job_duration_days.toString(),
      description: plan.description || "",
      featuresText: (plan.features || []).join("\n"),
      is_active: plan.is_active,
    });
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    clearForm();
  };

  const clearForm = () => {
    setForm({
      name: "",
      display_name: "",
      price: "",
      max_jobs: "",
      job_duration_days: "",
      description: "",
      featuresText: "",
      is_active: true,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Parse features from newlines
    const features = form.featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    // Format plan name identifier (convert to lowercase, strip invalid chars)
    const formattedName = form.name.toLowerCase().replace(/[^a-z0-9_-]/g, "");

    const payload = {
      name: formattedName,
      display_name: form.display_name,
      price: parseFloat(form.price) || 0.0,
      max_jobs: parseInt(form.max_jobs) || 1,
      job_duration_days: parseInt(form.job_duration_days) || 30,
      description: form.description,
      features: features,
      is_active: form.is_active,
    };

    try {
      if (editingPlanId) {
        await api.put(`plans/${editingPlanId}/`, payload);
        setSuccess("Plan updated successfully!");
      } else {
        await api.post("plans/", payload);
        setSuccess("New plan created successfully!");
      }
      clearForm();
      setEditingPlanId(null);
      fetchPlans();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.name?.[0] ||
          err.response?.data?.detail ||
          "Failed to save job posting plan."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Text color="white">Loading plan manager...</Text>;

  return (
    <VStack align="stretch" gap={6}>
      <Grid templateColumns={{ base: "1fr", xl: "1.2fr 1fr" }} gap={6}>
        {/* Left column: List of plans */}
        <Box
          p={6}
          bg="whiteAlpha.50"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
          backdropFilter="blur(12px)"
        >
          <VStack align="stretch" gap={4}>
            <Box mb={2}>
              <Heading size="md" color="var(--color-text-primary)" mb={1}>
                System Job Plans
              </Heading>
              <Text fontSize="xs" color="whiteAlpha.600">
                Manage all active and inactive job posting pricing packages.
              </Text>
            </Box>

            {plans.length === 0 ? (
              <Flex py={10} direction="column" align="center" justify="center">
                <Text color="whiteAlpha.500" fontSize="sm">
                  No plans configured in database.
                </Text>
              </Flex>
            ) : (
              <VStack align="stretch" gap={4}>
                {plans.map((plan) => (
                  <Box
                    key={plan.id}
                    p={4}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    bg="whiteAlpha.50"
                    position="relative"
                  >
                    <Flex justify="space-between" align="start">
                      <VStack align="start" gap={1}>
                        <HStack gap={2}>
                          <Text
                            color="white"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            {plan.display_name}
                          </Text>
                          <Text
                            fontSize="9px"
                            fontWeight="bold"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            bg="whiteAlpha.200"
                            color="whiteAlpha.700"
                          >
                            {plan.name}
                          </Text>
                          <Text
                            fontSize="9px"
                            fontWeight="bold"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            bg={plan.is_active ? "green.900" : "red.900"}
                            color={plan.is_active ? "green.300" : "red.300"}
                          >
                            {plan.is_active ? "ACTIVE" : "INACTIVE"}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="var(--color-text-muted)">
                          Price: ₹{plan.price} • Max Jobs: {plan.max_jobs} • Duration: {plan.job_duration_days} days
                        </Text>
                        {plan.description && (
                          <Text fontSize="2xs" color="whiteAlpha.600">
                            {plan.description}
                          </Text>
                        )}
                        {plan.features && plan.features.length > 0 && (
                          <HStack gap={1.5} wrap="wrap" mt={1}>
                            {plan.features.map((feat, idx) => (
                              <HStack
                                key={idx}
                                gap={1}
                                px={2}
                                py={0.5}
                                borderRadius="md"
                                bg="whiteAlpha.100"
                              >
                                <Check size={8} color="var(--color-accent)" />
                                <Text fontSize="3xs" color="whiteAlpha.800">
                                  {feat}
                                </Text>
                              </HStack>
                            ))}
                          </HStack>
                        )}
                      </VStack>

                      <Button
                        size="xs"
                        h={8}
                        px={3}
                        borderRadius="md"
                        bg="whiteAlpha.100"
                        color="white"
                        _hover={{ bg: "whiteAlpha.250" }}
                        onClick={() => handleEdit(plan)}
                      >
                        <HStack gap={1}>
                          <Edit2 size={10} />
                          <Text fontSize="3xs" fontWeight="bold">EDIT</Text>
                        </HStack>
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </VStack>
        </Box>

        {/* Right column: Add/Edit form */}
        <Box
          p={6}
          bg="whiteAlpha.50"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
          backdropFilter="blur(12px)"
          h="fit-content"
        >
          <VStack align="stretch" gap={4} as="form" onSubmit={handleSave}>
            <Box>
              <Heading size="md" color="var(--color-text-primary)" mb={1}>
                {editingPlanId ? "Edit Plan Details" : "Create New Plan"}
              </Heading>
              <Text fontSize="xs" color="whiteAlpha.600">
                {editingPlanId
                  ? "Modify parameters for this plan."
                  : "Add a custom package option to the system."}
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

            <Grid templateColumns="1fr 1fr" gap={4}>
              <Box>
                <Text {...labelStyle}>PLAN IDENTIFIER (SLUG) *</Text>
                <Input
                  {...fieldStyle}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. enterprise"
                  required
                  disabled={!!editingPlanId} // Name identifier is immutable once created to avoid subscription breakage
                />
              </Box>
              <Box>
                <Text {...labelStyle}>DISPLAY NAME *</Text>
                <Input
                  {...fieldStyle}
                  name="display_name"
                  value={form.display_name}
                  onChange={handleChange}
                  placeholder="e.g. Enterprise Plan"
                  required
                />
              </Box>
            </Grid>

            <Grid templateColumns="1fr 1fr 1fr" gap={3}>
              <Box>
                <Text {...labelStyle}>PRICE (INR) *</Text>
                <Input
                  {...fieldStyle}
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </Box>
              <Box>
                <Text {...labelStyle}>MAX JOBS *</Text>
                <Input
                  {...fieldStyle}
                  type="number"
                  name="max_jobs"
                  value={form.max_jobs}
                  onChange={handleChange}
                  placeholder="5"
                  required
                />
              </Box>
              <Box>
                <Text {...labelStyle}>DURATION (DAYS) *</Text>
                <Input
                  {...fieldStyle}
                  type="number"
                  name="job_duration_days"
                  value={form.job_duration_days}
                  onChange={handleChange}
                  placeholder="30"
                  required
                />
              </Box>
            </Grid>

            <Box>
              <Text {...labelStyle}>DESCRIPTION</Text>
              <Box
                as="textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief summary of who this plan is for..."
                rows={2}
                style={{
                  background: "whiteAlpha.100",
                  color: "white",
                  borderRadius: "var(--chakra-radii-lg)",
                  border: "1px solid var(--chakra-colors-white-alpha-200)",
                  fontSize: "14px",
                  padding: "10px 16px",
                  width: "100%",
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                }}
              />
            </Box>

            <Box>
              <Text {...labelStyle}>FEATURES (ONE PER LINE)</Text>
              <Box
                as="textarea"
                name="featuresText"
                value={form.featuresText}
                onChange={handleChange}
                placeholder="Ex: Post up to 5 jobs&#10;Jobs active for 30 days&#10;Premium support"
                rows={3}
                style={{
                  background: "whiteAlpha.100",
                  color: "white",
                  borderRadius: "var(--chakra-radii-lg)",
                  border: "1px solid var(--chakra-colors-white-alpha-200)",
                  fontSize: "14px",
                  padding: "10px 16px",
                  width: "100%",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </Box>

            <Box>
              <Text {...labelStyle}>PLAN STATUS</Text>
              <Box
                as="select"
                name="is_active"
                value={form.is_active ? "true" : "false"}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_active: e.target.value === "true" }))
                }
                style={{
                  background: "#121926",
                  color: "white",
                  height: "40px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                  padding: "0 12px",
                  width: "100%",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="true" style={{ background: "#0f172a" }}>Active (Available for companies)</option>
                <option value="false" style={{ background: "#0f172a" }}>Inactive (Hidden)</option>
              </Box>
            </Box>

            <HStack gap={3} mt={2}>
              <Button
                type="submit"
                isLoading={saving}
                bg="var(--color-accent)"
                color="white"
                _hover={{ opacity: 0.9 }}
                flex={1}
                h={10}
                borderRadius="lg"
                fontSize="sm"
                fontWeight="bold"
              >
                {editingPlanId ? "Update Plan" : "Create Plan"}
              </Button>
              {editingPlanId && (
                <Button
                  onClick={handleCancelEdit}
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
              )}
            </HStack>
          </VStack>
        </Box>
      </Grid>
    </VStack>
  );
};

export default PlanManager;
