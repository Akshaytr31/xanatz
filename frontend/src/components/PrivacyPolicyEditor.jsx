import React, { useState, useEffect } from "react";
import { Box, Heading, Text, VStack, Button, Textarea } from "@chakra-ui/react";
import api from "../api";

const PrivacyPolicyEditor = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await api.get("privacy-policy/");
        setContent(response.data.content);
      } catch (err) {
        console.error("Failed to fetch privacy policy", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.post("privacy-policy/", { content });
      setMessage("Privacy Policy updated successfully!");
    } catch (err) {
      setMessage("Failed to update Privacy Policy.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Text color="white">Loading editor...</Text>;

  return (
    <Box
      p={6}
      bg="whiteAlpha.50"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(12px)"
    >
      <VStack align="stretch" gap={4}>
        <Box>
          <Heading size="md" color="white" mb={2}>
            Edit Privacy Policy
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.600">
            This content will be displayed to users during registration.
          </Text>
        </Box>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter Privacy Policy content here..."
          minH="400px"
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
          color="white"
          _focus={{ borderColor: "var(--color-accent)", outline: "none" }}
          fontSize="sm"
          p={4}
        />

        {message && (
          <Text
            fontSize="xs"
            color={message.includes("success") ? "green.400" : "var(--color-accent)"}
            fontWeight="bold"
          >
            {message}
          </Text>
        )}

        <Button
          onClick={handleSave}
          isLoading={saving}
          bg="var(--color-accent)"
          color="white"
          _hover={{ opacity: 0.9 }}
          w="fit-content"
          px={8}
        >
          Save Policy
        </Button>
      </VStack>
    </Box>
  );
};

export default PrivacyPolicyEditor;
