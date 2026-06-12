import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  VStack,
  IconButton,
  Button,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Portal,
  Input,
  Textarea,
  Separator,
  Tooltip,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Briefcase, Edit2, Plus, Trash2, Calendar, Target } from "lucide-react";
import api from "../../api";

const MotionBox = motion.create(Box);

const CareerTimeline = ({ user, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    title: "",
    location: "",
    company_website: "",
    start_date: "",
    end_date: "",
    current: false,
    description: "",
  });

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        company: item.company,
        title: item.title,
        location: item.location || "",
        company_website: item.company_website || "",
        start_date: item.start_date,
        end_date: item.end_date || "",
        current: item.current,
        description: item.description || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        company: "",
        title: "",
        location: "",
        company_website: "",
        start_date: "",
        end_date: "",
        current: false,
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];

    if (!formData.title || !formData.company || !formData.start_date) {
      alert("Please fill in all required fields (*)");
      return;
    }
    if (formData.start_date > today) {
      alert("Start date cannot be in the future.");
      return;
    }
    if (!formData.current && formData.end_date && formData.end_date > today) {
      alert("End date cannot be in the future.");
      return;
    }

    const submissionData = { ...formData };
    if (!submissionData.end_date || submissionData.current) submissionData.end_date = null;
    if (!submissionData.location) submissionData.location = null;
    if (!submissionData.description) submissionData.description = null;

    setLoading(true);
    try {
      if (editingItem) {
        await api.patch(`experience/${editingItem.id}/`, submissionData);
      } else {
        const currentExp = experiences.find((exp) => exp.current);
        if (currentExp && submissionData.start_date) {
          const newStartDate = new Date(submissionData.start_date);
          const prevEndDate = new Date(newStartDate);
          prevEndDate.setDate(prevEndDate.getDate() - 1);
          const formattedEndDate = prevEndDate.toISOString().split("T")[0];
          await api.patch(`experience/${currentExp.id}/`, {
            current: false,
            end_date: formattedEndDate,
          });
        }
        await api.post("experience/", submissionData);
      }
      onUpdate();
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Experience submission error:", err.response?.data || err.message);
      alert("Error saving experience. Please check the form and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    try {
      await api.delete(`experience/${id}/`);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const experiences = user?.profile?.experiences || [];

  return (
    <Box className="glass-card" p={{ base: 5, md: 8 }} mt={6} position="relative">
      {/* ── Section Header ── */}
      <Flex justify="space-between" align="center" mb={8}>
        <HStack gap={3}>
          <Box
            p={2}
            borderRadius="md"
            color="white"
            style={{ background: "linear-gradient(135deg, var(--color-accent), #8b5cf6)" }}
            boxShadow="0 0 15px rgba(59, 130, 246, 0.3)"
          >
            <Target size={20} />
          </Box>
          <VStack align="start" gap={0}>
            <Text
              fontSize="lg"
              fontWeight="black"
              color="var(--color-text-primary)"
              letterSpacing="tight"
              fontFamily="var(--font-heading)"
            >
              CAREER ARCHITECTURE
            </Text>
            <Text fontSize="10px" color="var(--color-text-muted)" fontWeight="bold" letterSpacing="widest">
              PROFESSIONAL MILESTONES &amp; GROWTH
            </Text>
          </VStack>
        </HStack>

        <Button
          bg="var(--color-accent)"
          color="white"
          size="xs"
          borderRadius="md"
          px={4}
          h="8"
          onClick={() => handleOpen()}
          _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
          transition="all 0.2s"
          fontSize="10px"
          fontWeight="black"
        >
          <Plus size={14} style={{ marginRight: "6px" }} /> NEW MILESTONE
        </Button>
      </Flex>

      {/* ── Timeline Area ── */}
      <Box
        overflowX="auto"
        pb={4}
        css={{
          "&::-webkit-scrollbar": { height: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "var(--color-card-border)",
            borderRadius: "10px",
          },
        }}
      >
        {experiences.length === 0 ? (
          <Flex h="200px" align="center" justify="center" direction="column" gap={4}>
            <Calendar size={48} color="var(--color-text-muted)" style={{ opacity: 0.25 }} />
            <Text color="var(--color-text-muted)" fontWeight="medium">
              Start building your career timeline...
            </Text>
          </Flex>
        ) : (
          <TimelineChart experiences={experiences} handleOpen={handleOpen} />
        )}
      </Box>

      {/* ── Edit Modal ── */}
      <Dialog open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)} size="md">
        <Portal>
          <DialogBackdrop
            backdropFilter="blur(10px)"
            zIndex={99999}
            style={{ background: "rgba(0,0,0,0.5)" }}
          />
          <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
            <DialogContent
              bg="var(--color-surface)"
              border="1px solid"
              borderColor="var(--color-card-border)"
              borderRadius="xl"
              maxW="550px"
              m="auto"
              overflow="hidden"
              boxShadow="0 25px 60px rgba(0,0,0,0.25)"
            >
              <DialogHeader
                color="var(--color-text-primary)"
                py={6}
                px={8}
                borderBottom="1px solid"
                borderColor="var(--color-card-border)"
                fontWeight="bold"
                fontSize="lg"
              >
                {editingItem ? "Refine Experience" : "Add New Milestone"}
              </DialogHeader>
              <DialogCloseTrigger color="var(--color-text-muted)" top={6} right={6} />

              <DialogBody p={8} bg="var(--color-surface)">
                <VStack gap={6}>
                  {/* Role Title */}
                  <Box w="full">
                    <Text mb={2} color="var(--color-text-muted)" fontSize="xs" fontWeight="bold" letterSpacing="widest">
                      ROLE TITLE *
                    </Text>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ex: Lead Solutions Architect"
                      bg="var(--color-input-bg)"
                      border="1px solid"
                      borderColor="var(--color-input-border)"
                      color="var(--color-text-primary)"
                      _focus={{ borderColor: "var(--color-accent)", boxShadow: "0 0 0 1px var(--color-accent)" }}
                    />
                  </Box>

                  {/* Organization */}
                  <Box w="full">
                    <Text mb={2} color="var(--color-text-muted)" fontSize="xs" fontWeight="bold" letterSpacing="widest">
                      ORGANIZATION *
                    </Text>
                    <Input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Ex: Global Tech Corp"
                      bg="var(--color-input-bg)"
                      border="1px solid"
                      borderColor="var(--color-input-border)"
                      color="var(--color-text-primary)"
                      _focus={{ borderColor: "var(--color-accent)", boxShadow: "0 0 0 1px var(--color-accent)" }}
                    />
                  </Box>

                  {/* Company Website */}
                  <Box w="full">
                    <Text mb={2} color="var(--color-text-muted)" fontSize="xs" fontWeight="bold" letterSpacing="widest">
                      COMPANY WEBSITE
                    </Text>
                    <Input
                      name="company_website"
                      value={formData.company_website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      bg="var(--color-input-bg)"
                      border="1px solid"
                      borderColor="var(--color-input-border)"
                      color="var(--color-text-primary)"
                      _focus={{ borderColor: "var(--color-accent)", boxShadow: "0 0 0 1px var(--color-accent)" }}
                    />
                  </Box>

                  {/* Dates */}
                  <HStack w="full" gap={6}>
                    <Box flex="1">
                      <Text mb={2} color="var(--color-text-muted)" fontSize="xs" fontWeight="bold" letterSpacing="widest">
                        START DATE *
                      </Text>
                      <Input
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleChange}
                        max={new Date().toISOString().split("T")[0]}
                        bg="var(--color-input-bg)"
                        border="1px solid"
                        borderColor="var(--color-input-border)"
                        color="var(--color-text-primary)"
                        _focus={{ borderColor: "var(--color-accent)" }}
                      />
                    </Box>
                    {!formData.current && (
                      <Box flex="1">
                        <Text mb={2} color="var(--color-text-muted)" fontSize="xs" fontWeight="bold" letterSpacing="widest">
                          END DATE
                        </Text>
                        <Input
                          name="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={handleChange}
                          max={new Date().toISOString().split("T")[0]}
                          bg="var(--color-input-bg)"
                          border="1px solid"
                          borderColor="var(--color-input-border)"
                          color="var(--color-text-primary)"
                          _focus={{ borderColor: "var(--color-accent)" }}
                        />
                      </Box>
                    )}
                  </HStack>

                  {/* Current role checkbox */}
                  <HStack w="full" px={1} gap={3}>
                    <input
                      type="checkbox"
                      name="current"
                      checked={formData.current}
                      onChange={handleChange}
                      style={{ width: "18px", height: "18px", accentColor: "var(--color-accent)" }}
                    />
                    <Text fontSize="sm" color="var(--color-text-secondary)" fontWeight="medium">
                      I am currently navigating this role
                    </Text>
                  </HStack>

                  {/* Description */}
                  <Box w="full">
                    <Text mb={2} color="var(--color-text-muted)" fontSize="xs" fontWeight="bold" letterSpacing="widest">
                      IMPACT &amp; RESPONSIBILITIES
                    </Text>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      minH="120px"
                      bg="var(--color-input-bg)"
                      border="1px solid"
                      borderColor="var(--color-input-border)"
                      color="var(--color-text-primary)"
                      placeholder="Describe your key achievements..."
                      _focus={{ borderColor: "var(--color-accent)", boxShadow: "0 0 0 1px var(--color-accent)" }}
                    />
                  </Box>

                  {editingItem && (
                    <Button
                      mt={2}
                      w="full"
                      colorPalette="red"
                      variant="ghost"
                      onClick={() => handleDelete(editingItem.id)}
                      _hover={{ bg: "rgba(239,68,68,0.1)" }}
                    >
                      Remove Milestone
                    </Button>
                  )}
                </VStack>
              </DialogBody>

              <DialogFooter
                p={8}
                bg="var(--color-card-bg)"
                borderTop="1px solid"
                borderColor="var(--color-card-border)"
              >
                <Button
                  bg="var(--color-accent)"
                  color="white"
                  w="full"
                  size="lg"
                  onClick={handleSubmit}
                  isLoading={loading}
                >
                  {editingItem ? "Save Refinements" : "Launch Milestone"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </Dialog>
    </Box>
  );
};

/* ─── Timeline Chart ─────────────────────────────────────────────────────── */
const TimelineChart = ({ experiences, handleOpen }) => {
  const parsedExps = experiences
    .map((exp) => {
      const startDate = new Date(exp.start_date);
      const endDate = exp.current || !exp.end_date ? new Date() : new Date(exp.end_date);
      const startFraction = startDate.getFullYear() + startDate.getMonth() / 12;
      const endFraction = endDate.getFullYear() + (endDate.getMonth() + 1) / 12;
      return { ...exp, startFraction, endFraction };
    })
    .sort((a, b) => a.startFraction - b.startFraction);

  const currentYear = new Date().getFullYear();
  const minYear = Math.floor(Math.min(...parsedExps.map((e) => e.startFraction)));
  let maxYear = Math.max(...parsedExps.map((e) => Math.ceil(e.endFraction)));
  if (maxYear > currentYear) maxYear = currentYear;

  const startAxis = minYear;
  const endAxis = maxYear > minYear ? maxYear : minYear + 1;
  const totalYears = endAxis - startAxis + 1;
  const years = Array.from({ length: totalYears }, (_, i) => startAxis + i);

  // Prevent label overlap
  const labelWidthPercent = 18;
  const occupiedUntil = [];
  const experiencesWithLevels = parsedExps.map((exp) => {
    const leftPercent = ((exp.startFraction - startAxis) / totalYears) * 100;
    let level = 0;
    while (occupiedUntil[level] !== undefined && leftPercent < occupiedUntil[level]) level++;
    occupiedUntil[level] = leftPercent + labelWidthPercent;
    return { ...exp, leftPercent, level };
  });

  const maxLevel = Math.max(...experiencesWithLevels.map((e) => e.level), 1);

  const colors = [
    "linear-gradient(90deg, #3b82f6, #60a5fa)",
    "linear-gradient(90deg, #8b5cf6, #a78bfa)",
    "linear-gradient(90deg, #06b6d4, #22d3ee)",
    "linear-gradient(90deg, #10b981, #34d399)",
  ];
  const glowColors = [
    "rgba(59, 130, 246, 0.35)",
    "rgba(139, 92, 246, 0.35)",
    "rgba(6, 182, 212, 0.35)",
    "rgba(16, 185, 129, 0.35)",
  ];

  return (
    <Box position="relative" minW="800px" minH={`${220 + maxLevel * 70}px`} mt={4}>
      {experiencesWithLevels.map((exp, index) => {
        let widthPercent = ((exp.endFraction - exp.startFraction) / totalYears) * 100;
        if (widthPercent < (1.5 / 12 / totalYears) * 100) {
          widthPercent = (1.5 / 12 / totalYears) * 100;
        }
        const color = colors[index % colors.length];
        const glow = glowColors[index % glowColors.length];
        const { leftPercent, level } = exp;

        return (
          <Box
            key={exp.id}
            position="absolute"
            left={`${leftPercent}%`}
            bottom="50px"
            width={`${widthPercent}%`}
            h="100%"
          >
            {/* Label Card */}
            <MotionBox
              position="absolute"
              bottom={`${80 + level * 70}px`}
              left="0"
              zIndex={10}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <VStack
                align="start"
                gap={1.5}
                p={3}
                borderRadius="lg"
                border="1px solid"
                borderColor="var(--color-card-border)"
                backdropFilter="blur(12px)"
                minW="145px"
                style={{
                  background: "var(--color-surface)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                }}
              >
                <HStack w="full" justify="space-between" align="center">
                  <Text fontWeight="black" color="var(--color-text-primary)" fontSize="10px" letterSpacing="tight">
                    {exp.company.toUpperCase()}
                  </Text>
                  <IconButton
                    aria-label="Edit milestone"
                    variant="ghost"
                    size="xs"
                    color="var(--color-text-muted)"
                    h="16px"
                    w="16px"
                    minW="16px"
                    _hover={{ color: "var(--color-text-primary)", bg: "var(--color-card-hover-bg)" }}
                    onClick={() => handleOpen(exp)}
                  >
                    <Edit2 size={10} />
                  </IconButton>
                </HStack>
                <Text color="var(--color-accent)" fontSize="9px" fontWeight="bold" lineHeight="1.2">
                  {exp.title}
                </Text>
              </VStack>
            </MotionBox>

            {/* Connector Line */}
            <Box
              position="absolute"
              left="0"
              bottom="20px"
              height={`${65 + level * 70}px`}
              borderLeft="2px solid"
              style={{ borderLeftColor: "var(--color-accent)", opacity: 0.5 }}
              _after={{
                content: '""',
                position: "absolute",
                top: 0,
                left: "-4px",
                width: "6px",
                height: "6px",
                borderRadius: "full",
                bg: "var(--color-accent)",
              }}
            />

            {/* Timeline Bar */}
            <MotionBox
              position="absolute"
              bottom="0"
              left="0"
              w="100%"
              h="14px"
              borderRadius="md"
              zIndex={2}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: index * 0.1 }}
              style={{ background: color, boxShadow: `0 0 18px ${glow}` }}
            />
          </Box>
        );
      })}

      {/* Background Track */}
      <Box
        position="absolute"
        bottom="50px"
        left="0"
        w="100%"
        h="14px"
        borderRadius="md"
        zIndex={1}
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}
      />

      {/* Axis Bar */}
      <Flex
        position="absolute"
        bottom="0"
        left="0"
        w="100%"
        h="34px"
        align="stretch"
        borderRadius="md"
        border="1px solid"
        borderColor="var(--color-card-border)"
        overflow="hidden"
        style={{ background: "var(--color-card-bg)" }}
      >
        {years.map((year, index) => (
          <Box
            key={year}
            flex={1}
            position="relative"
            borderRight={index < years.length - 1 ? "1px solid" : "none"}
            borderColor="var(--color-card-border)"
          >
            {/* Month sub-ticks */}
            <Flex position="absolute" top="0" left="0" w="100%" h="100%">
              {Array.from({ length: 12 }).map((_, mIndex) => (
                <Box
                  key={mIndex}
                  flex={1}
                  borderRight={mIndex < 11 ? "1px solid" : "none"}
                  borderColor="var(--color-card-border)"
                  opacity={0.4}
                />
              ))}
            </Flex>

            {/* Year Label */}
            <Flex position="absolute" top="0" left="0" w="100%" h="100%" align="center" justify="center">
              <Text fontSize="xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="widest" zIndex={1}>
                {year}
              </Text>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default CareerTimeline;
