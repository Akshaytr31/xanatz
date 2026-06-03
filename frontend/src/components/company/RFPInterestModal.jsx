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
  Mail,
  User,
  Phone,
  Send,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);

const fieldStyle = {
  bg: "var(--color-input-bg)",
  color: "white",
  h: "11",
  borderRadius: "xl",
  border: "1px solid",
  borderColor: "var(--color-card-border)",
  px: "3.5",
  fontSize: "xs",
  width: "100%",
  _focus: { borderColor: "#10b981", boxShadow: "0 0 0 1px #10b981" },
  _placeholder: { color: "var(--color-card-border)" },
};

const labelStyle = {
  color: "var(--color-text-muted)",
  fontSize: "2xs",
  fontWeight: "black",
  letterSpacing: "wider",
  mb: "2",
};

const RFPInterestModal = ({ isOpen, onClose, rfp }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    company_name: "",
    email: "",
    phone_number: "",
    proposal_summary: "",
  });
  const [attachedFile, setAttachedFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setErrorMsg("");
      setAttachedFile(null);
      
      // Attempt to load current user details to pre-fill
      const loadUser = async () => {
        try {
          const res = await api.get("me/");
          const name = `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim();
          setForm({
            company_name: name || res.data.email.split("@")[0],
            email: res.data.email || "",
            phone_number: "",
            proposal_summary: "",
          });
        } catch (err) {
          console.error(err);
        }
      };
      loadUser();
    }
  }, [isOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.email.trim() || !form.proposal_summary.trim()) {
      setErrorMsg("Company/Individual name, email and proposal summary are required.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("rfp", rfp.id);
      formData.append("company_name", form.company_name);
      formData.append("email", form.email);
      formData.append("phone_number", form.phone_number);
      formData.append("proposal_summary", form.proposal_summary);
      if (attachedFile) {
        formData.append("attached_file", attachedFile);
      }

      await api.post("rfp-interests/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail || "Failed to submit proposal. Please check fields."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
            maxW="600px"
            w="full"
            m="auto"
            overflow="visible"
          >
            <MotionBox
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              borderRadius="2xl"
              overflow="hidden"
              border="1px solid var(--color-card-border)"
              style={{
                background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(20,30,55,0.97) 100%)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px var(--color-glass)",
              }}
            >
              {/* ─── Header ─── */}
              <Box
                px={8}
                py={6}
                borderBottom="1px solid var(--color-card-border)"
                style={{
                  background: "linear-gradient(90deg, rgba(16,185,129,0.08) 0%, transparent 60%)",
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
                      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
                    >
                      <Send size={20} color="#10b981" />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text color="var(--color-text-primary)" fontWeight="black" fontSize="lg" letterSpacing="tight">
                        EXPRESS INTEREST
                      </Text>
                      <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="medium">
                        Contact company about RFP: <strong>{rfp?.title}</strong>
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
                      style={{ background: "var(--color-card-border)" }}
                      _hover={{ background: "var(--color-card-border)" }}
                      transition="all 0.2s"
                      onClick={onClose}
                    >
                      <X size={16} color="var(--color-text-secondary)" />
                    </Box>
                  </DialogCloseTrigger>
                </Flex>
              </Box>

              {/* ─── Body ─── */}
              <Box px={8} py={7} maxH="60vh" overflowY="auto">
                <AnimatePresence mode="wait">
                  {success ? (
                    <MotionBox
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      py={8}
                      textAlign="center"
                    >
                      <Flex direction="column" align="center" gap={4}>
                        <Box
                          w="60px"
                          h="60px"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          style={{
                            background: "rgba(16,185,129,0.1)",
                            border: "2px solid rgba(16,185,129,0.4)",
                            boxShadow: "0 0 20px rgba(16,185,129,0.2)",
                          }}
                        >
                          <CheckCircle size={30} color="#10b981" />
                        </Box>
                        <VStack gap={1}>
                          <Text fontSize="lg" fontWeight="black" color="var(--color-text-primary)" letterSpacing="tight">
                            Proposal Submitted!
                          </Text>
                          <Text color="var(--color-text-muted)" fontSize="xs" maxW="380px" mx="auto">
                            Your expressions of interest has been sent successfully to the company. They will review and contact you shortly.
                          </Text>
                        </VStack>
                      </Flex>
                    </MotionBox>
                  ) : (
                    <VStack gap={5} align="stretch" key="form">
                      {errorMsg && (
                        <Flex bg="rgba(239, 68, 68, 0.1)" border="1px solid rgba(239, 68, 68, 0.2)" p={4} borderRadius="xl" align="center" gap={3}>
                          <AlertCircle size={18} color="#ef4444" />
                          <Text color="#f87171" fontSize="xs" fontWeight="bold">{errorMsg}</Text>
                        </Flex>
                      )}

                      {/* Company Name */}
                      <Box>
                        <Text {...labelStyle}>YOUR NAME / COMPANY NAME *</Text>
                        <HStack {...fieldStyle} _focusWithin={{ borderColor: "#10b981" }}>
                          <User size={14} color="var(--color-text-muted)" />
                          <Input
                            placeholder="Enter your name or your company name"
                            variant="unstyled"
                            color="white"
                            fontSize="xs"
                            py={2.5}
                            value={form.company_name}
                            onChange={setE("company_name")}
                          />
                        </HStack>
                      </Box>

                      {/* Email & Phone */}
                      <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                        <Box flex={1}>
                          <Text {...labelStyle}>EMAIL ADDRESS *</Text>
                          <HStack {...fieldStyle} _focusWithin={{ borderColor: "#10b981" }}>
                            <Mail size={14} color="var(--color-text-muted)" />
                            <Input
                              type="email"
                              placeholder="you@domain.com"
                              variant="unstyled"
                              color="white"
                              fontSize="xs"
                              py={2.5}
                              value={form.email}
                              onChange={setE("email")}
                            />
                          </HStack>
                        </Box>
                        <Box flex={1}>
                          <Text {...labelStyle}>PHONE NUMBER</Text>
                          <HStack {...fieldStyle} _focusWithin={{ borderColor: "#10b981" }}>
                            <Phone size={14} color="var(--color-text-muted)" />
                            <Input
                              placeholder="+1 (555) 000-0000"
                              variant="unstyled"
                              color="white"
                              fontSize="xs"
                              py={2.5}
                              value={form.phone_number}
                              onChange={setE("phone_number")}
                            />
                          </HStack>
                        </Box>
                      </Flex>

                      {/* Proposal Summary */}
                      <Box>
                        <Text {...labelStyle}>PROPOSAL SUMMARY / INTEREST DETAILS *</Text>
                        <Box
                          as="textarea"
                          value={form.proposal_summary}
                          onChange={setE("proposal_summary")}
                          placeholder="Summarize your experience, why you are qualified, and how you plan to deliver on this RFP..."
                          rows={4}
                          style={{
                            background: "var(--color-input-bg)",
                            color: "white",
                            borderRadius: "xl",
                            border: "1px solid var(--color-card-border)",
                            fontSize: "13px",
                            padding: "12px 14px",
                            width: "100%",
                            outline: "none",
                            resize: "vertical",
                            fontFamily: "inherit",
                          }}
                          _focus={{ borderColor: "#10b981" }}
                        />
                      </Box>

                      {/* File Upload */}
                      <Box>
                        <Text {...labelStyle}>ATTACH PROPOSAL DOCUMENT (PDF/DOCX/ZIP)</Text>
                        <Box
                          border="1px dashed var(--color-card-border)"
                          borderRadius="xl"
                          p={4}
                          bg="var(--color-input-bg)"
                          textAlign="center"
                          position="relative"
                          _hover={{ borderColor: "var(--color-card-border)" }}
                          transition="all 0.2s"
                        >
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.zip,.rar"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              opacity: 0,
                              cursor: "pointer",
                            }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setAttachedFile(e.target.files[0]);
                              }
                            }}
                          />
                          <Flex direction="column" align="center" gap={2}>
                            <FileText size={20} color={attachedFile ? "#10b981" : "var(--color-text-muted)"} />
                            {attachedFile ? (
                              <Text color="#10b981" fontSize="xs" fontWeight="bold">
                                Selected: {attachedFile.name} ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)
                              </Text>
                            ) : (
                              <Text color="var(--color-text-muted)" fontSize="xs">
                                Click or drag files to upload proposal document (max 10MB)
                              </Text>
                            )}
                          </Flex>
                        </Box>
                      </Box>
                    </VStack>
                  )}
                </AnimatePresence>
              </Box>

              {/* ─── Footer ─── */}
              {!success && (
                <Flex
                  px={8}
                  py={5}
                  borderTop="1px solid var(--color-card-border)"
                  justify="space-between"
                  align="center"
                  style={{ background: "var(--color-glass)" }}
                >
                  <Text color="var(--color-card-border)" fontSize="xs" fontWeight="medium">
                    Your contact information will be visible to company admins
                  </Text>
                  <HStack gap={3}>
                    <Button
                      variant="ghost"
                      color="var(--color-text-muted)"
                      fontWeight="black"
                      fontSize="xs"
                      letterSpacing="widest"
                      h="10"
                      px={5}
                      borderRadius="lg"
                      _hover={{ color: "white", bg: "var(--color-card-border)" }}
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
                      loadingText="SUBMITTING..."
                      onClick={handleSave}
                      disabled={!form.company_name.trim() || !form.email.trim() || !form.proposal_summary.trim()}
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
                      }}
                      _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 25px rgba(16,185,129,0.4)",
                      }}
                      transition="all 0.2s"
                    >
                      <Send size={13} style={{ marginRight: "6px" }} />
                      SEND PROPOSAL
                    </Button>
                  </HStack>
                </Flex>
              )}
            </MotionBox>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog>
  );
};

export default RFPInterestModal;
