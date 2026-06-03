import React, { useState, useEffect } from "react";
import { Box, Container, VStack, Flex, Text, Spinner, Button, HStack, Badge } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import VisualHeader from "../components/Profile/VisualHeader";
import CareerTimeline from "../components/Profile/CareerTimeline";
import EducationSection from "../components/Profile/EducationSection";
import SkillsSection from "../components/Profile/SkillsSection";
import CompanySection from "../components/company/CompanySection";
import CreateCompanySection from "../components/company/CreateCompanySection";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronDown, ArrowRightLeft } from "lucide-react";

const MotionBox = motion.create(Box);
const MotionVStack = motion.create(VStack);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyRefreshTrigger, setCompanyRefreshTrigger] = useState(0);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
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
            <Spinner size="xl" thickness="4px" speed="0.65s" color="var(--color-accent)" />
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
                <Text color="var(--color-text-primary)" fontSize="sm">
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

              {/* ── Switch to Company Account ── */}
              {(() => {
                const accessibleCompanies = (user?.companies || []).filter(
                  (c) => c.is_owner || c.access_role === 'admin'
                );
                if (accessibleCompanies.length === 0) return null;
                return (
                <MotionBox
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  position="relative"
                >
                  <Box
                    className="glass-card"
                    p={5}
                    border="1px solid"
                    borderColor="rgba(66,153,225,0.3)"
                    style={{
                      background: "linear-gradient(135deg, rgba(66,153,225,0.08) 0%, rgba(15,23,42,0.6) 100%)",
                    }}
                  >
                    <Text
                      color="var(--color-text-muted)"
                      fontSize="10px"
                      fontWeight="black"
                      letterSpacing="widest"
                      mb={3}
                    >
                      COMPANY ACCOUNT
                    </Text>

                    {accessibleCompanies.length === 1 ? (
                      // Single company — direct switch
                      <Button
                        w="full"
                        h="10"
                        borderRadius="lg"
                        fontWeight="black"
                        fontSize="xs"
                        letterSpacing="widest"
                        color="white"
                        onClick={() => navigate(`/company/${accessibleCompanies[0].id}`)}
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-accent) 0%, rgba(100,150,255,0.9) 100%)",
                          boxShadow: "0 4px 20px rgba(66,153,225,0.3)",
                        }}
                        _hover={{
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 25px rgba(66,153,225,0.5)",
                        }}
                        transition="all 0.2s"
                      >
                        <Building2 size={14} style={{ marginRight: "8px" }} />
                        SWITCH TO COMPANY
                      </Button>
                    ) : (
                      // Multiple companies — show picker
                      <Box position="relative">
                        <Button
                          w="full"
                          h="10"
                          borderRadius="lg"
                          fontWeight="black"
                          fontSize="xs"
                          letterSpacing="widest"
                          color="white"
                          onClick={() => setShowCompanyPicker((v) => !v)}
                          style={{
                            background:
                              "linear-gradient(135deg, var(--color-accent) 0%, rgba(100,150,255,0.9) 100%)",
                            boxShadow: "0 4px 20px rgba(66,153,225,0.3)",
                          }}
                          _hover={{
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 25px rgba(66,153,225,0.5)",
                          }}
                          transition="all 0.2s"
                        >
                          <Building2 size={14} style={{ marginRight: "8px" }} />
                          SWITCH TO COMPANY
                          <ChevronDown size={13} style={{ marginLeft: "auto" }} />
                        </Button>

                        {/* Dropdown */}
                        {showCompanyPicker && (
                          <Box
                            position="absolute"
                            top="calc(100% + 8px)"
                            left={0}
                            right={0}
                            borderRadius="xl"
                            border="1px solid rgba(66,153,225,0.25)"
                            overflow="hidden"
                            zIndex={10}
                            style={{
                              background: "rgba(15,23,42,0.97)",
                              backdropFilter: "blur(16px)",
                              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                            }}
                          >
                            {accessibleCompanies.map((company) => (
                              <Box
                                key={company.id}
                                as="button"
                                w="full"
                                px={4}
                                py={3}
                                textAlign="left"
                                borderBottom="1px solid var(--color-card-border)"
                                _hover={{ bg: "rgba(66,153,225,0.1)" }}
                                transition="all 0.15s"
                                onClick={() => {
                                  setShowCompanyPicker(false);
                                  navigate(`/company/${company.id}`);
                                }}
                              >
                                <HStack gap={3} justify="space-between">
                                  <HStack gap={3}>
                                    <Box
                                      w="7"
                                      h="7"
                                      borderRadius="lg"
                                      style={{
                                        background: company.is_owner
                                          ? "rgba(66,153,225,0.15)"
                                          : "rgba(239,68,68,0.15)",
                                      }}
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      flexShrink={0}
                                    >
                                      <Text
                                        color={company.is_owner ? "rgba(66,153,225,0.9)" : "rgba(239,68,68,0.9)"}
                                        fontWeight="black"
                                        fontSize="sm"
                                      >
                                        {company.name.charAt(0).toUpperCase()}
                                      </Text>
                                    </Box>
                                    <Text
                                      color="var(--color-text-primary)"
                                      fontWeight="bold"
                                      fontSize="xs"
                                      letterSpacing="tight"
                                    >
                                      {company.name}
                                    </Text>
                                  </HStack>
                                  {!company.is_owner && (
                                    <Box
                                      px={1.5} py={0.5} borderRadius="md"
                                      bg="rgba(239,68,68,0.2)" border="1px solid rgba(239,68,68,0.4)"
                                      flexShrink={0}
                                    >
                                      <Text fontSize="8px" fontWeight="black" color="#ef4444" letterSpacing="widest">
                                        ADMIN
                                      </Text>
                                    </Box>
                                  )}
                                </HStack>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </MotionBox>
                );
              })()}

              <MotionBox
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass-card"
                p={6}
              >
                <Text
                  color="var(--color-text-primary)"
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
                    bg="var(--color-accent)"
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
                      color="var(--color-text-primary)"
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
                      borderColor="var(--color-accent)/30"
                      color="var(--color-accent)"
                      fontSize="8px"
                      fontWeight="black"
                      px={2}
                      h="6"
                      borderRadius="md"
                      _hover={{
                        bg: "var(--color-accent)",
                        color: "white",
                        borderColor: "var(--color-accent)",
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
