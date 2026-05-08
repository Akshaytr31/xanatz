import React, { useState, useEffect } from "react";
import { Box, Container, VStack, Flex, Text, Spinner } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import VisualHeader from "../components/Profile/VisualHeader";
import CareerTimeline from "../components/Profile/CareerTimeline";
import EducationSection from "../components/Profile/EducationSection";
import SkillsSection from "../components/Profile/SkillsSection";
import CompanySection from "../components/Profile/CompanySection";
import CreateCompanySection from "../components/Profile/CreateCompanySection";
import api from "../api";
import { useNavigate } from "react-router-dom";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyRefreshTrigger, setCompanyRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  const handleCompanyChange = () => {
    fetchProfile();
    setCompanyRefreshTrigger((prev) => prev + 1);
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get("me/");
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <AnimatePresence>
          <MotionVStack
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            gap={4}
          >
            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
            <Text
              color="whiteAlpha.700"
              fontWeight="medium"
              letterSpacing="wide"
            >
              PREPARING YOUR PROFILE...
            </Text>
          </MotionVStack>
        </AnimatePresence>
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="var(--color-primary)"
      position="relative"
      overflow="hidden"
      paddingBottom="30px"
    >
      {/* Premium Background Mesh */}
      <Box className="bg-mesh">
        <Box className="bg-blob" top="-10%" left="-10%" />
        <Box
          className="bg-blob"
          bottom="-10%"
          right="-10%"
          style={{
            animationDelay: "-5s",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
          }}
        />
      </Box>

      <Navbar handleLogout={handleLogout} />

      <Container maxW="1100px" mt="100px" px={4}>
        <Flex gap={6} direction={{ base: "column", lg: "row" }}>
          {/* Main Content */}
          <VStack flex={1} gap={6} align="stretch">
            {user ? (
              <>
                <MotionBox
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <VisualHeader user={user} onUpdate={fetchProfile} />
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <CareerTimeline user={user} onUpdate={fetchProfile} />
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <EducationSection user={user} onUpdate={fetchProfile} />
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <SkillsSection user={user} onUpdate={fetchProfile} />
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <CompanySection
                    user={user}
                    refreshTrigger={companyRefreshTrigger}
                    onCompanyChange={handleCompanyChange}
                  />
                </MotionBox>
              </>
            ) : (
              <Box className="glass-card" p={8} textAlign="center">
                <Text color="white" fontSize="sm">
                  Unable to load profile details.
                </Text>
              </Box>
            )}
          </VStack>

          {/* Sidebar */}
          <Box
            w={{ base: "full", lg: "300px" }}
            position={{ lg: "sticky" }}
            top={20}
            height="fit-content"
          >
            <VStack gap={5} align="stretch" w="full">
              <MotionBox
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <CreateCompanySection
                  onCreated={handleCompanyChange}
                  width="100%"
                />
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass-card"
                p={6}
              >
                <Text
                  color="white"
                  fontWeight="black"
                  mb={5}
                  fontSize="10px"
                  letterSpacing="widest"
                >
                  PROFILE STRENGTH
                </Text>

                <Box
                  position="relative"
                  h="3.5"
                  bg="whiteAlpha.100"
                  borderRadius="md"
                  mb={4}
                  overflow="hidden"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                >
                  {/* Base track for visibility */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    h="full"
                    w="100%"
                    bg="whiteAlpha.50"
                  />
                  <MotionBox
                    bg="blue.400"
                    animate={{
                      width: `${Math.max(user?.profile_completion_percentage || 0, 2)}%`,
                    }}
                    h="full"
                    borderRadius="md"
                    initial={{ width: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    boxShadow="0 0 25px rgba(66, 153, 225, 0.8)"
                  />
                </Box>

                <Flex justify="space-between" align="center">
                  <VStack align="start" gap={0}>
                    <Text
                      color="white"
                      fontSize="xl"
                      fontWeight="black"
                      lineHeight="1"
                    >
                      {user?.profile_completion_percentage || 0}%
                    </Text>
                    <Text
                      color="whiteAlpha.400"
                      fontSize="9px"
                      fontWeight="bold"
                      letterSpacing="widest"
                      mt={1}
                    >
                      OPTIMIZATION LEVEL
                    </Text>
                  </VStack>
                  {user?.profile_completion_percentage < 100 && (
                    <Button
                      size="xs"
                      variant="outline"
                      borderColor="blue.500/30"
                      color="blue.400"
                      fontSize="8px"
                      fontWeight="black"
                      px={2}
                      h="6"
                      borderRadius="md"
                      _hover={{
                        bg: "blue.500",
                        color: "white",
                        borderColor: "blue.500",
                      }}
                    >
                      ENHANCE
                    </Button>
                  )}
                </Flex>
              </MotionBox>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Profile;
