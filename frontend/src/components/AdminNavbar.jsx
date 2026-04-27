import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  VStack,
  Circle,
  Button,
  Container,
} from "@chakra-ui/react";
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  FileText,
  LogOut,
  ChevronDown,
  User,
  ExternalLink,
} from "lucide-react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../api";

const AdminNavItem = ({ icon: IconComponent, label, to, isActive }) => (
  <HStack
    as={RouterLink}
    to={to}
    gap={2}
    cursor="pointer"
    px={4}
    py={2}
    borderRadius="md"
    color={isActive ? "white" : "whiteAlpha.600"}
    bg={isActive ? "whiteAlpha.200" : "transparent"}
    transition="all 0.2s"
    _hover={{ color: "white", bg: "whiteAlpha.100" }}
  >
    <IconComponent size={18} />
    <Text fontSize="sm" fontWeight="medium">
      {label}
    </Text>
  </HStack>
);

const AdminNavbar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("me/");
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    if (localStorage.getItem("access")) {
      fetchUser();
    }
  }, []);

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={100}
      bg="gray.900"
      borderBottom="2px solid"
      borderColor="var(--color-accent)"
      py={3}
    >
      <Container maxW="container.xl">
        <Flex align="center" justify="space-between">
          {/* Left: Branding */}
          <HStack gap={6}>
            <HStack as={RouterLink} to="/admin" gap={3} cursor="pointer">
              <Box bg="var(--color-accent)" p={1.5} borderRadius="md">
                <Shield size={20} color="white" />
              </Box>
              <VStack align="start" gap={0}>
                <Text
                  color="white"
                  fontWeight="black"
                  fontSize="lg"
                  lineHeight={1}
                >
                  XANATZ
                </Text>
                <Text
                  color="var(--color-accent)"
                  fontSize="9px"
                  fontWeight="bold"
                  letterSpacing="widest"
                >
                  ADMIN PANEL
                </Text>
              </VStack>
            </HStack>

            {/* Nav Links */}
            <HStack gap={2} display={{ base: "none", md: "flex" }} ml={8}>
              <AdminNavItem
                icon={LayoutDashboard}
                label="Overview"
                to="/admin"
                isActive
              />
              <AdminNavItem icon={FileText} label="Content" to="#" />
              <AdminNavItem icon={Users} label="Users" to="#" />
              <AdminNavItem icon={Settings} label="System" to="#" />
            </HStack>
          </HStack>

          {/* Right: Actions & Profile */}
          <HStack gap={4}>
            <Box position="relative">
              <HStack
                gap={2}
                cursor="pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <Circle
                  size="8"
                  bg="gray.700"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  <User size={18} color="white" />
                </Circle>
                <ChevronDown size={14} color="gray.500" />
              </HStack>

              {isProfileOpen && (
                <Box
                  position="absolute"
                  top="140%"
                  right="0"
                  bg="gray.800"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  borderRadius="lg"
                  boxShadow="2xl"
                  w="220px"
                  zIndex={200}
                  overflow="hidden"
                >
                  <Box
                    p={4}
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.100"
                  >
                    <Text fontWeight="bold" color="white" fontSize="xs" mb={1}>
                      {user?.email || "Administrator"}
                    </Text>
                    <Text
                      fontSize="10px"
                      color="var(--color-accent)"
                      fontWeight="bold"
                    >
                      SYSTEM ADMIN
                    </Text>
                  </Box>

                  <VStack align="stretch" gap={0} p={1}>
                    <HStack
                      p={2}
                      gap={3}
                      cursor="pointer"
                      borderRadius="md"
                      _hover={{ bg: "whiteAlpha.100" }}
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={14} color="red.400" />
                      <Text fontSize="xs" color="red.400">
                        Log Out
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
            </Box>
          </HStack>
        </Flex>
      </Container>

      {/* Overlay */}
      {isProfileOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={199}
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </Box>
  );
};

export default AdminNavbar;
