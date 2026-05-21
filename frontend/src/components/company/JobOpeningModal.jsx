import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Portal,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  AlignLeft,
  Settings,
  X,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);

const JOB_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

const fieldStyle = {
  bg: "rgba(255,255,255,0.05)",
  color: "white",
  h: "11",
  borderRadius: "lg",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.12)",
  _focus: { borderColor: "var(--color-accent)", boxShadow: "0 0 0 2px rgba(205,36,38,0.25)" },
  _placeholder: { color: "rgba(255,255,255,0.25)" },
  fontSize: "sm",
  px: "4",
};

const labelStyle = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "10px",
  fontWeight: "black",
  letterSpacing: "widest",
  mb: "2",
};

const SelectField = ({ value, onChange, options, placeholder }) => (
  <Box
    as="select"
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: "rgba(255,255,255,0.05)",
      color: value ? "white" : "rgba(255,255,255,0.25)",
      height: "44px",
      borderRadius: "lg",
      border: "1px solid rgba(255,255,255,0.12)",
      fontSize: "14px",
      padding: "0 16px",
      width: "100%",
      outline: "none",
      cursor: "pointer",
      appearance: "none",
      WebkitAppearance: "none",
    }}
  >
    <option value="" disabled style={{ background: "#0f172a" }}>
      {placeholder}
    </option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value} style={{ background: "#0f172a", color: "white" }}>
        {opt.label}
      </option>
    ))}
  </Box>
);

const JobOpeningModal = ({ isOpen, onClose, companyId, job, onSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    job_type: "full_time",
    location: "",
    salary_range: "",
    description: "",
    requirements: "",
    is_active: true,
  });

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || "",
        job_type: job.job_type || "full_time",
        location: job.location || "",
        salary_range: job.salary_range || "",
        description: job.description || "",
        requirements: job.requirements || "",
        is_active: job.is_active !== undefined ? job.is_active : true,
      });
    } else {
      setForm({
        title: "",
        job_type: "full_time",
        location: "",
        salary_range: "",
        description: "",
        requirements: "",
        is_active: true,
      });
    }
  }, [job, isOpen]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        company: companyId,
      };

      if (job) {
        await api.put(`jobs/${job.id}/`, payload);
      } else {
        await api.post("jobs/", payload);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving job opening.", err);
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field) => (val) => setForm((prev) => ({ ...prev, [field]: val }));
  const setE = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Dialog open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <Portal>
        <DialogBackdrop
          bg="rgba(0,0,0,0.85)"
          backdropFilter="blur(16px)"
          zIndex={99990}
        />
        <DialogPositioner
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={99995}
          p={4}
        >
          <DialogContent
            bg="transparent"
            border="none"
            boxShadow="none"
            maxW="650px"
            w="full"
            m="auto"
            overflow="visible"
          >
            <MotionBox
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              borderRadius="lg"
              overflow="hidden"
              border="1px solid rgba(255,255,255,0.1)"
              style={{
                background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(20,30,55,0.97) 100%)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              {/* ─── Header ─── */}
              <Box
                px={8}
                py={6}
                borderBottom="1px solid rgba(255,255,255,0.07)"
                style={{
                  background: "linear-gradient(90deg, rgba(205,36,38,0.08) 0%, transparent 60%)",
                }}
              >
                <Flex align="center" justify="space-between">
                  <HStack gap={4}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{ background: "rgba(205,36,38,0.15)", border: "1px solid rgba(205,36,38,0.3)" }}
                    >
                      <Briefcase size={20} color="var(--color-accent)" />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text color="white" fontWeight="black" fontSize="lg" letterSpacing="tight">
                        {job ? "EDIT JOB OPENING" : "ADD JOB OPENING"}
                      </Text>
                      <Text color="rgba(255,255,255,0.35)" fontSize="xs" fontWeight="medium">
                        Post an employment opportunity for this company
                      </Text>
                    </VStack>
                  </HStack>

                  <DialogCloseTrigger asChild>
                    <Box
                      as="button"
                      w="8"
                      h="8"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                      _hover={{ background: "rgba(255,255,255,0.12)" }}
                      transition="all 0.2s"
                      onClick={onClose}
                    >
                      <X size={16} color="rgba(255,255,255,0.7)" />
                    </Box>
                  </DialogCloseTrigger>
                </Flex>
              </Box>

              {/* ─── Body ─── */}
              <Box px={8} py={7} maxH="60vh" overflowY="auto">
                <VStack gap={5} align="stretch">
                  {/* Title & Job Type */}
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={2}>
                      <Text {...labelStyle}>JOB TITLE *</Text>
                      <Input
                        {...fieldStyle}
                        value={form.title}
                        onChange={setE("title")}
                        placeholder="Ex: Senior React Developer"
                      />
                    </Box>
                    <Box flex={1}>
                      <Text {...labelStyle}>JOB TYPE</Text>
                      <SelectField
                        value={form.job_type}
                        onChange={set("job_type")}
                        options={JOB_TYPE_OPTIONS}
                        placeholder="Select type..."
                      />
                    </Box>
                  </Flex>

                  {/* Location & Salary */}
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={1}>
                      <Text {...labelStyle}>LOCATION</Text>
                      <Box position="relative">
                        <Input
                          {...fieldStyle}
                          pl="10"
                          value={form.location}
                          onChange={setE("location")}
                          placeholder="Ex: Remote or San Francisco, CA"
                        />
                        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                          <MapPin size={14} color="rgba(255,255,255,0.3)" />
                        </Box>
                      </Box>
                    </Box>
                    <Box flex={1}>
                      <Text {...labelStyle}>SALARY RANGE</Text>
                      <Box position="relative">
                        <Input
                          {...fieldStyle}
                          pl="10"
                          value={form.salary_range}
                          onChange={setE("salary_range")}
                          placeholder="Ex: $120k - $150k"
                        />
                        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                          <DollarSign size={14} color="rgba(255,255,255,0.3)" />
                        </Box>
                      </Box>
                    </Box>
                  </Flex>

                  {/* Description */}
                  <Box>
                    <Text {...labelStyle}>DESCRIPTION *</Text>
                    <Box
                      as="textarea"
                      value={form.description}
                      onChange={setE("description")}
                      placeholder="Detail the responsibilities, project scope, and daily tasks..."
                      rows={4}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        borderRadius: "lg",
                        border: "1px solid rgba(255,255,255,0.12)",
                        fontSize: "14px",
                        padding: "12px 16px",
                        width: "100%",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </Box>

                  {/* Requirements */}
                  <Box>
                    <Text {...labelStyle}>REQUIREMENTS & SKILLS</Text>
                    <Box
                      as="textarea"
                      value={form.requirements}
                      onChange={setE("requirements")}
                      placeholder="List required experience, languages, frameworks, or certifications..."
                      rows={3}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        borderRadius: "lg",
                        border: "1px solid rgba(255,255,255,0.12)",
                        fontSize: "14px",
                        padding: "12px 16px",
                        width: "100%",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </Box>

                  {/* Active Status Select */}
                  {job && (
                    <Box>
                      <Text {...labelStyle}>STATUS</Text>
                      <SelectField
                        value={form.is_active ? "true" : "false"}
                        onChange={(val) => set("is_active")(val === "true")}
                        options={[
                          { value: "true", label: "Active (Visible)" },
                          { value: "false", label: "Inactive (Hidden)" },
                        ]}
                        placeholder="Select status..."
                      />
                    </Box>
                  )}
                </VStack>
              </Box>

              {/* ─── Footer ─── */}
              <Flex
                px={8}
                py={5}
                borderTop="1px solid rgba(255,255,255,0.07)"
                justify="space-between"
                align="center"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <Text color="rgba(255,255,255,0.2)" fontSize="xs" fontWeight="medium">
                  Provide descriptive information to attract candidates
                </Text>
                <HStack gap={3}>
                  <Button
                    variant="ghost"
                    color="rgba(255,255,255,0.45)"
                    fontWeight="black"
                    fontSize="xs"
                    letterSpacing="widest"
                    h="10"
                    px={5}
                    borderRadius="lg"
                    _hover={{ color: "white", bg: "rgba(255,255,255,0.07)" }}
                    onClick={onClose}
                  >
                    CANCEL
                  </Button>
                  <Button
                    h="10"
                    px={7}
                    borderRadius="lg"
                    fontWeight="black"
                    fontSize="xs"
                    letterSpacing="widest"
                    color="white"
                    loading={isLoading}
                    loadingText="SAVING..."
                    onClick={handleSave}
                    disabled={!form.title.trim()}
                    style={{
                      background: "linear-gradient(135deg, var(--color-accent) 0%, rgba(139,92,246,0.8) 100%)",
                      boxShadow: "0 4px 20px rgba(205,36,38,0.35)",
                    }}
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 25px rgba(205,36,38,0.5)",
                    }}
                    transition="all 0.2s"
                  >
                    <Save size={13} style={{ marginRight: "6px" }} />
                    {job ? "UPDATE JOB" : "POST JOB"}
                  </Button>
                </HStack>
              </Flex>
            </MotionBox>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog>
  );
};

export default JobOpeningModal;
