import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  Flex,
  Circle,
  Button,
} from "@chakra-ui/react";
import { Plus, X, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);
const MotionHStack = motion.create(HStack);

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
    <Box className="glass-card" p={{ base: 5, md: 6 }}>
      <Flex justify="space-between" align="center" mb={5}>
        <HStack gap={3}>
          <Circle size="32px" bg="yellow.500/10" color="yellow.400">
            <Zap size={16} />
          </Circle>
          <Text fontSize="md" fontWeight="black" color="var(--color-text-primary)" letterSpacing="tight" fontFamily="var(--font-heading)">
            CORE COMPETENCIES
          </Text>
        </HStack>
        <IconButton
          aria-label="Toggle add skill"
          variant="ghost"
          color="var(--color-text-muted)"
          _hover={{ color: "yellow.400", bg: "yellow.400/10" }}
          onClick={() => setIsAdding(!isAdding)}
          borderRadius="full"
          size="sm"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </IconButton>
      </Flex>

      <VStack align="stretch" gap={5}>
        <AnimatePresence>
          {isAdding && (
            <MotionBox
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              overflow="hidden"
            >
              <HStack gap={3} p={1}>
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Master a new skill..."
                  bg="var(--color-input-bg)"
                  border="1px solid"
                  borderColor="var(--color-input-border)"
                  color="var(--color-text-primary)"
                  autoFocus
                  h="10"
                  fontSize="sm"
                  borderRadius="lg"
                  _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px var(--chakra-colors-yellow-400)" }}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                />
                <Button
                  bg="yellow.500"
                  color="black"
                  px={6}
                  h="10"
                  borderRadius="md"
                  fontWeight="black"
                  fontSize="xs"
                  _hover={{ bg: "yellow.400", transform: "translateY(-1px)" }}
                  onClick={handleAddSkill}
                  isLoading={loading}
                >
                  ADD
                </Button>
              </HStack>
            </MotionBox>
          )}
        </AnimatePresence>

        <Flex wrap="wrap" gap={2.5}>
          <AnimatePresence>
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <MotionHStack
                  key={skill}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  bg="var(--color-card-bg)"
                  border="1px solid"
                  borderColor="var(--color-card-border)"
                  color="var(--color-text-primary)"
                  px={3}
                  py={1.5}
                  borderRadius="sm"
                  fontSize="xs"
                  fontWeight="bold"
                  _hover={{ borderColor: "yellow.400/50", bg: "var(--color-card-hover-bg)" }}
                  cursor="default"
                >
                  <Sparkles size={10} className="text-yellow-400" />
                  <Text letterSpacing="wider">{skill.toUpperCase()}</Text>
                  <Box
                    as="span"
                    cursor="pointer"
                    onClick={() => handleRemoveSkill(skill)}
                    p={0.5}
                    borderRadius="full"
                    _hover={{ bg: "whiteAlpha.200", color: "var(--color-accent)" }}
                    transition="all 0.2s"
                  >
                    <X size={10} />
                  </Box>
                </MotionHStack>
              ))
            ) : (
              !isAdding && (
                <Flex direction="column" align="center" w="full" py={8} gap={3}>
                  <Zap size={32} color="var(--color-text-muted)" style={{ opacity: 0.15 }} />
                  <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="medium">Quantify your unique skill set...</Text>
                </Flex>
              )
            )}
          </AnimatePresence>
        </Flex>
      </VStack>
    </Box>
  );
};

export default SkillsSection;
