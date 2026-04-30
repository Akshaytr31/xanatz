import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  Flex,
} from "@chakra-ui/react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const SkillsSection = ({ user, onUpdate }) => {
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const skills = user?.profile?.skills || [];

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) return;

    setLoading(true);
    try {
      const updatedSkills = [...skills, newSkill.trim()];
      await api.patch("me/", { skills: updatedSkills });
      onUpdate();
      setNewSkill("");
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      const updatedSkills = skills.filter((s) => s !== skillToRemove);
      await api.patch("me/", { skills: updatedSkills });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="xl"
      p={6}
    >
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="bold" color="white">
          Skills
        </Text>
        <IconButton
          aria-label="Toggle add skill"
          variant="ghost"
          color="whiteAlpha.700"
          _hover={{ color: "white", bg: "whiteAlpha.100" }}
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
        </IconButton>
      </HStack>

      <VStack align="stretch" gap={4}>
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <HStack>
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g. React, Python)"
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  autoFocus
                  _focus={{ borderColor: "blue.400" }}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                />
                <IconButton
                  aria-label="Add skill"
                  bg="blue.600"
                  color="white"
                  _hover={{ bg: "blue.700" }}
                  onClick={handleAddSkill}
                  isLoading={loading}
                >
                  <Plus size={18} />
                </IconButton>
              </HStack>
            </motion.div>
          )}
        </AnimatePresence>

        <Flex wrap="wrap" gap={2}>
          {skills.length > 0 ? (
            skills.map((skill) => (
              <HStack
                key={skill}
                bg="blue.500"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                <Text>{skill}</Text>
                <Box
                  as="span"
                  cursor="pointer"
                  onClick={() => handleRemoveSkill(skill)}
                  display="flex"
                  alignItems="center"
                  _hover={{ color: "whiteAlpha.800" }}
                >
                  <X size={14} />
                </Box>
              </HStack>
            ))
          ) : (
            !isAdding && <Text color="whiteAlpha.600">No skills added yet.</Text>
          )}
        </Flex>
      </VStack>
    </Box>
  );
};

export default SkillsSection;
