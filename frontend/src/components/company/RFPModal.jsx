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
  FileText,
  DollarSign,
  Calendar,
  X,
  Save,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);

const fieldStyle = {
  bg: "rgba(255,255,255,0.05)",
  color: "white",
  h: "11",
  borderRadius: "lg",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.12)",
  _focus: { borderColor: "#8b5cf6", boxShadow: "0 0 0 2px rgba(139,92,246,0.25)" },
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

const RFPModal = ({ isOpen, onClose, companyId, rfp, onSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    budget: "",
    deadline: "",
    description: "",
    requirements: "",
    is_active: true,
  });

  useEffect(() => {
    if (rfp) {
      setForm({
        title: rfp.title || "",
        budget: rfp.budget || "",
        deadline: rfp.deadline || "",
        description: rfp.description || "",
        requirements: rfp.requirements || "",
        is_active: rfp.is_active !== undefined ? rfp.is_active : true,
      });
    } else {
      setForm({
        title: "",
        budget: "",
        deadline: "",
        description: "",
        requirements: "",
        is_active: true,
      });
    }
  }, [rfp, isOpen]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        company: companyId,
        // If deadline is empty string, serialize it as null for django DateField
        deadline: form.deadline ? form.deadline : null,
      };

      if (rfp) {
        await api.put(`rfps/${rfp.id}/`, payload);
      } else {
        await api.post("rfps/", payload);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving RFP.", err);
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
                  background: "linear-gradient(90deg, rgba(139,92,246,0.08) 0%, transparent 60%)",
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
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}
                    >
                      <FileText size={20} color="#8b5cf6" />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text color="white" fontWeight="black" fontSize="lg" letterSpacing="tight">
                        {rfp ? "EDIT PUBLIC RFP" : "POST PUBLIC RFP"}
                      </Text>
                      <Text color="rgba(255,255,255,0.35)" fontSize="xs" fontWeight="medium">
                        Request proposals from qualified vendors or individuals
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
                  {/* Title */}
                  <Box>
                    <Text {...labelStyle}>RFP TITLE *</Text>
                    <Input
                      {...fieldStyle}
                      value={form.title}
                      onChange={setE("title")}
                      placeholder="Ex: Redesign E-Commerce Platform"
                    />
                  </Box>

                  {/* Budget & Deadline */}
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={1}>
                      <Text {...labelStyle}>ESTIMATED BUDGET</Text>
                      <Box position="relative">
                        <Input
                          {...fieldStyle}
                          pl="10"
                          value={form.budget}
                          onChange={setE("budget")}
                          placeholder="Ex: $15,000 - $25,000"
                        />
                        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                          <DollarSign size={14} color="rgba(255,255,255,0.3)" />
                        </Box>
                      </Box>
                    </Box>
                    <Box flex={1}>
                      <Text {...labelStyle}>SUBMISSION DEADLINE</Text>
                      <Box position="relative">
                        <Input
                          {...fieldStyle}
                          type="date"
                          pl="10"
                          value={form.deadline}
                          onChange={setE("deadline")}
                          style={{
                            ...fieldStyle,
                            paddingLeft: "40px",
                            colorScheme: "dark"
                          }}
                        />
                        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                          <Calendar size={14} color="rgba(255,255,255,0.3)" />
                        </Box>
                      </Box>
                    </Box>
                  </Flex>

                  {/* Description */}
                  <Box>
                    <Text {...labelStyle}>PROJECT DESCRIPTION & OBJECTIVE *</Text>
                    <Box
                      as="textarea"
                      value={form.description}
                      onChange={setE("description")}
                      placeholder="Detail the scope of work, objectives, timeline requirements..."
                      rows={5}
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
                    <Text {...labelStyle}>VENDOR / PROPOSAL REQUIREMENTS</Text>
                    <Box
                      as="textarea"
                      value={form.requirements}
                      onChange={setE("requirements")}
                      placeholder="List criteria, experience levels, tech stacks, or proposal format guidelines..."
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
                  {rfp && (
                    <Box>
                      <Text {...labelStyle}>STATUS</Text>
                      <SelectField
                        value={form.is_active ? "true" : "false"}
                        onChange={(val) => set("is_active")(val === "true")}
                        options={[
                          { value: "true", label: "Active (Accepting Proposals)" },
                          { value: "false", label: "Inactive (Closed / Hidden)" },
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
                  Visible to everyone looking for RFP listings
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
                    disabled={!form.title.trim() || !form.description.trim()}
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6 0%, rgba(139,92,246,0.8) 100%)",
                      boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
                    }}
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 25px rgba(139,92,246,0.5)",
                    }}
                    transition="all 0.2s"
                  >
                    <Save size={13} style={{ marginRight: "6px" }} />
                    {rfp ? "UPDATE RFP" : "POST RFP"}
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

export default RFPModal;
