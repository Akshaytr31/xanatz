import React, { useEffect } from "react";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Box
      minH="100vh"
      bg="var(--color-primary)"
      position="relative"
      overflow="hidden"
    >
      <Navbar handleLogout={handleLogout} />

      <Box p={{ base: 6, md: 10 }} position="relative">
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={6}
          position="relative"
          zIndex={10}
        >
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <DashboardCard title="Account Overview" delay={0.1}>
              <Text color="var(--color-secondary)">
                This is your private dashboard. Your application successfully
                authenticated with the Django backend. From here you can manage
                your profile, security settings, and connect other applications.
              </Text>
            </DashboardCard>
          </GridItem>

          <GridItem colSpan={1}>
            <DashboardCard
              delay={0.2}
              border="1px solid"
              borderColor="var(--color-secondary)"
            >
              <HStack gap={3} mb={4}>
                <Shield size={20} color="var(--color-secondary)" />
                <Heading size="md" fontWeight="semibold" color="white">
                  Security Status
                </Heading>
              </HStack>
              <VStack align="stretch" gap={3}>
                <Flex justify="space-between" align="center" fontSize="sm">
                  <Text color="var(--color-secondary)">Email Verification</Text>
                  <Box
                    bg="var(--color-secondary)"
                    color="green.400"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    Verified
                  </Box>
                </Flex>
                <Flex justify="space-between" align="center" fontSize="sm">
                  <Text color="var(--color-secondary)">Privacy Policy</Text>
                  <Box
                    bg="var(--color-secondary)"
                    color="green.400"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    Accepted
                  </Box>
                </Flex>
              </VStack>
            </DashboardCard>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
