import React, { useState, useEffect } from "react";
import { Box, Container, VStack, Flex, Text, Spinner } from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import ProfileHeader from "../components/Profile/ProfileHeader";
import AboutSection from "../components/Profile/AboutSection";
import ExperienceSection from "../components/Profile/ExperienceSection";
import EducationSection from "../components/Profile/EducationSection";
import SkillsSection from "../components/Profile/SkillsSection";
import CompanySection from "../components/Profile/CompanySection";
import CreateCompanySection from "../components/Profile/CreateCompanySection";
import api from "../api";
import { useNavigate } from "react-router-dom";

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
      console.log("Fetching profile data...");
      const response = await api.get("me/");
      console.log("Profile data received:", response.data);
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
        <VStack gap={4}>
          <Spinner size="xl" color="white" />
          <Text color="whiteAlpha.700">Loading your profile...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="var(--color-primary)" pb={10}>
      <Navbar handleLogout={handleLogout} />

      <Container maxW="1200px" mt={6}>
        <Flex gap={6} direction={{ base: "column", lg: "row" }}>
          {/* Main Content */}
          <VStack flex={1} gap={6} align="stretch">
            {user ? (
              <>
                <ProfileHeader user={user} onUpdate={fetchProfile} />
                <AboutSection user={user} onUpdate={fetchProfile} />
                <ExperienceSection user={user} onUpdate={fetchProfile} />
                <EducationSection user={user} onUpdate={fetchProfile} />
                <SkillsSection user={user} onUpdate={fetchProfile} />
                <CompanySection
                  user={user}
                  refreshTrigger={companyRefreshTrigger}
                  onCompanyChange={handleCompanyChange}
                />
              </>
            ) : (
              <Box
                p={10}
                bg="whiteAlpha.100"
                borderRadius="xl"
                textAlign="center"
              >
                <Text color="white">Unable to load profile details.</Text>
              </Box>
            )}
          </VStack>

          {/* Sidebar */}
          <Box
            w={{ base: "full", lg: "300px" }}
            display={{ base: "none", lg: "block" }}
            position="sticky"
            top={20}
            height="fit-content"
          >
            <VStack gap={4} align="stretch" w="full">
              <CreateCompanySection onCreated={handleCompanyChange} width="100%"/>
              <Box
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="xl"
                p={4}
              >
                <Text color="white" fontWeight="bold" mb={4}>
                  Profile Completion
                </Text>
                <Box bg="whiteAlpha.200" h="2" borderRadius="full" mb={2}>
                  <Box
                    bg="blue.400"
                    h="full"
                    borderRadius="full"
                    w={`${user?.profile_completion_percentage || 0}%`}
                    transition="width 0.5s ease-in-out"
                  />
                </Box>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {user?.profile_completion_percentage || 0}% completed
                </Text>
              </Box>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Profile;
