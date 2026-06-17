import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Circle,
  Button,
} from "@chakra-ui/react";
import { LayoutDashboard, ShieldCheck, Users, Settings, FileText, CreditCard } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import PrivacyPolicyEditor from "../components/PrivacyPolicyEditor";
import PlanManager from "../components/PlanManager";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("plans");

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
    }
    // In a real app, we would verify if the user is actually an admin here
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
      <AdminNavbar handleLogout={handleLogout} />

      <Box p={{ base: 6, md: 10 }} position="relative">
        <HStack gap={4} mb={8} justify="space-between" align="center">
          <HStack gap={4}>
            <Circle size="12" bg="var(--color-accent)" color="white" shadow="lg">
              <LayoutDashboard size={24} />
            </Circle>
            <Box>
              <Heading
                size="xl"
                color="var(--color-text-primary)"
                fontWeight="black"
                letterSpacing="tight"
              >
                Admin Control Panel
              </Heading>
              <Text color="whiteAlpha.600" fontSize="sm">
                Manage Xanatz system settings, plans, and content.
              </Text>
            </Box>
          </HStack>
        </HStack>

        {/* Navigation Tabs */}
        <HStack gap={3} mb={6} borderBottom="1px solid" borderColor="whiteAlpha.100" pb={4}>
          <Button
            size="sm"
            onClick={() => setActiveTab("plans")}
            style={{
              background: activeTab === "plans" ? "var(--color-accent)" : "rgba(255,255,255,0.05)",
              color: "white",
              border: "1px solid",
              borderColor: activeTab === "plans" ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            _hover={{ opacity: 0.9 }}
          >
            <HStack gap={2} px={1}>
              <CreditCard size={14} />
              <Text fontSize="xs">Job Posting Plans</Text>
            </HStack>
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveTab("policy")}
            style={{
              background: activeTab === "policy" ? "var(--color-accent)" : "rgba(255,255,255,0.05)",
              color: "white",
              border: "1px solid",
              borderColor: activeTab === "policy" ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            _hover={{ opacity: 0.9 }}
          >
            <HStack gap={2} px={1}>
              <FileText size={14} />
              <Text fontSize="xs">Privacy Policy</Text>
            </HStack>
          </Button>
        </HStack>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={8}>
          <GridItem>
            <VStack align="stretch" gap={8}>
              {activeTab === "plans" ? <PlanManager /> : <PrivacyPolicyEditor />}
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="stretch" gap={6}>
              <Box
                p={6}
                bg="whiteAlpha.50"
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <Heading size="sm" color="var(--color-text-primary)" mb={4}>
                  System Overview
                </Heading>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <HStack gap={3}>
                      <Users size={16} color="var(--color-text-muted)" />
                      <Text color="whiteAlpha.700" fontSize="sm">
                        Total Users
                      </Text>
                    </HStack>
                    <Text color="var(--color-text-primary)" fontWeight="bold">
                      1,284
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <HStack gap={3}>
                      <ShieldCheck size={16} color="var(--color-text-muted)" />
                      <Text color="whiteAlpha.700" fontSize="sm">
                        Active Sessions
                      </Text>
                    </HStack>
                    <Text color="var(--color-text-primary)" fontWeight="bold">
                      42
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <HStack gap={3}>
                      <Settings size={16} color="var(--color-text-muted)" />
                      <Text color="whiteAlpha.700" fontSize="sm">
                        Server Status
                      </Text>
                    </HStack>
                    <Text color="green.400" fontWeight="bold">
                      Healthy
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
