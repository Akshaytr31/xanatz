import React, { useState } from "react";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api";

export const AIEnhancedTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  textareaStyle = {},
  labelStyle = {},
  required = false
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!value || !value.trim()) return;
    setIsEnhancing(true);

    const startTime = Date.now();
    try {
      const res = await api.post("ai/enhance/", { text: value });
      
      // Ensure the magic animation runs for at least 1000ms for satisfying visual feedback
      const elapsedTime = Date.now() - startTime;
      const delay = Math.max(1000 - elapsedTime, 0);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (res.data && res.data.enhanced_text) {
        onChange(res.data.enhanced_text);
      }
    } catch (err) {
      console.error("AI Enhance error:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Box w="100%">
      <Flex justify="space-between" align="center" mb={1.5}>
        {label && (
          <Text {...labelStyle} mb={0}>
            {label} {required && "*"}
          </Text>
        )}
        <Button
          size="xs"
          onClick={handleEnhance}
          loading={isEnhancing}
          disabled={isEnhancing || !value || !value.trim()}
          variant="ghost"
          fontSize="2xs"
          height="24px"
          style={{
            background: "rgba(205, 36, 38, 0.1)",
            color: "rgba(255, 130, 130, 0.9)",
            border: "1px solid rgba(205, 36, 38, 0.2)",
            cursor: isEnhancing ? "not-allowed" : "pointer"
          }}
        >
          <motion.span
            animate={isEnhancing ? { rotate: 360, scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: isEnhancing ? Infinity : 0, duration: 1, ease: "linear" }}
            style={{ display: "inline-flex", marginRight: "4px" }}
          >
            <Wand2 size={12} />
          </motion.span>
          Enhance with AI
        </Button>
      </Flex>
      
      <motion.div
        animate={isEnhancing ? {
          boxShadow: [
            "0 0 0px rgba(139, 92, 246, 0)",
            "0 0 20px rgba(139, 92, 246, 0.8)",
            "0 0 0px rgba(139, 92, 246, 0)"
          ],
          borderColor: ["rgba(205, 36, 38, 0.2)", "#CD2426", "rgba(205, 36, 38, 0.2)"]
        } : {
          boxShadow: "0 0 0px rgba(139, 92, 246, 0)",
          borderColor: "rgba(205, 36, 38, 0.2)"
        }}
        transition={isEnhancing ? {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        } : {
          duration: 0.3
        }}
        style={{ borderRadius: "12px", width: "100%", overflow: "hidden" }}
      >
        <Box
          as="textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
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
            ...textareaStyle
          }}
        />
      </motion.div>
    </Box>
  );
};

export default AIEnhancedTextarea;
