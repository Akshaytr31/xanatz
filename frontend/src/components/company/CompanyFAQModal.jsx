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
  HelpCircle,
  X,
  Save,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);

const fieldStyle = {
  bg: "var(--color-glass)",
  color: "white",
  h: "11",
  borderRadius: "lg",
  border: "1px solid",
  borderColor: "var(--color-card-border)",
  _focus: { borderColor: "#CD2426", boxShadow: "0 0 0 2px rgba(205,36,38,0.25)" },
  _placeholder: { color: "var(--color-card-border)" },
  fontSize: "sm",
  px: "4",
};

const labelStyle = {
  color: "var(--color-text-muted)",
  fontSize: "10px",
  fontWeight: "black",
  letterSpacing: "widest",
  mb: "2",
};

const CompanyFAQModal = ({ isOpen, onClose, companyId, faq, onSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    question: "",
    answer: "",
  });

  useEffect(() => {
    if (faq) {
      setForm({
        question: faq.question || "",
        answer: faq.answer || "",
      });
    } else {
      setForm({
        question: "",
        answer: "",
      });
    }
  }, [faq, isOpen]);

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        company: companyId,
      };

      if (faq) {
        await api.put(`faqs/${faq.id}/`, payload);
      } else {
        await api.post("faqs/", payload);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving FAQ:", err);
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
              borderRadius="lg"
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
                      <HelpCircle size={20} color="#CD2426" />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text color="var(--color-text-primary)" fontWeight="black" fontSize="lg" letterSpacing="tight">
                        {faq ? "EDIT FAQ" : "ADD FAQ"}
                      </Text>
                      <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="medium">
                        Provide a question and answer for visitors
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
              <Box px={8} py={7}>
                <VStack gap={5} align="stretch">
                  {/* Question */}
                  <Box>
                    <Text {...labelStyle}>QUESTION *</Text>
                    <Input
                      {...fieldStyle}
                      value={form.question}
                      onChange={setE("question")}
                      placeholder="Ex: What services do you offer?"
                    />
                  </Box>

                  {/* Answer */}
                  <Box>
                    <Text {...labelStyle}>ANSWER *</Text>
                    <Box
                      as="textarea"
                      value={form.answer}
                      onChange={setE("answer")}
                      placeholder="Detail the answer to the question..."
                      rows={6}
                      style={{
                        background: "var(--color-glass)",
                        color: "white",
                        borderRadius: "lg",
                        border: "1px solid var(--color-card-border)",
                        fontSize: "14px",
                        padding: "12px 16px",
                        width: "100%",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </Box>
                </VStack>
              </Box>

              {/* ─── Footer ─── */}
              <Flex
                px={8}
                py={5}
                borderTop="1px solid var(--color-card-border)"
                justify="space-between"
                align="center"
                style={{ background: "var(--color-glass)" }}
              >
                <Text color="var(--color-card-border)" fontSize="xs" fontWeight="medium">
                  Visible on your public shareable profile
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
                    loadingText="SAVING..."
                    onClick={handleSave}
                    disabled={!form.question.trim() || !form.answer.trim()}
                    style={{
                      background: "linear-gradient(135deg, #CD2426 0%, rgba(205,36,38,0.8) 100%)",
                      boxShadow: "0 4px 20px rgba(205,36,38,0.35)",
                    }}
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 25px rgba(205,36,38,0.5)",
                    }}
                    transition="all 0.2s"
                  >
                    <Save size={13} style={{ marginRight: "6px" }} />
                    {faq ? "UPDATE FAQ" : "SAVE FAQ"}
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

export default CompanyFAQModal;
