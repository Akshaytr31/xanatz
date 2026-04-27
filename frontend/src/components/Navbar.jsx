import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Input,
  Text,
  VStack,
  Circle,
  Button,
} from "@chakra-ui/react";
import {
  Search,
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../api";

const NavItem = ({ icon: IconComponent, label, to, isActive }) => (
  <VStack
    as={RouterLink}
    to={to}
    gap={1}
    align="center"
    justify="center"
    cursor="pointer"
    px={3}
    py={1}
    minW="70px"
    color={isActive ? "white" : "whiteAlpha.600"}
    transition="all 0.2s"
    _hover={{ color: "white" }}
    position="relative"
  >
    <Box position="relative">
      <IconComponent size={24} />
      {label === "Notifications" && (
        <Box
          position="absolute"
          top="-1px"
          right="-1px"
          bg="red.500"
          w="10px"
          h="10px"
          borderRadius="full"
          border="2px solid"
          borderColor="var(--color-primary)"
        />
      )}
    </Box>
    <Text
      fontSize="xs"
      fontWeight="medium"
      display={{ base: "none", md: "block" }}
    >
      {label}
    </Text>
    {isActive && (
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        h="2px"
        bg="white"
        borderRadius="full"
      />
    )}
  </VStack>
);

const Navbar = ({ handleLogout }) => {
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
      bg="var(--color-primary)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(150px)"
      py={2}
    >
      <Box maxW="1200px" mx="auto" px={4}>
        <Flex align="center" justify="space-between">
          {/* Left: Logo & Search */}
          <HStack gap={4} flex={1}>
            <Box
              as={RouterLink}
              to="/dashboard"
              bg="white"
              p={1.5}
              borderRadius="md"
              cursor="pointer"
            >
              <Text
                color="var(--color-primary)"
                fontWeight="black"
                fontSize="xl"
                lineHeight={1}
              >
                X
              </Text>
            </Box>

            <Box
              position="relative"
              maxW="280px"
              display={{ base: "none", lg: "block" }}
              flex={1}
            >
              <Box
                position="absolute"
                left="3"
                top="50%"
                transform="translateY(-50%)"
                zIndex={1}
                color="whiteAlpha.500"
              >
                <Search size={18} />
              </Box>
              <Input
                placeholder="Search"
                bg="whiteAlpha.100"
                border="none"
                color="white"
                pl="10"
                h="9"
                fontSize="sm"
                _placeholder={{ color: "whiteAlpha.500" }}
                _focus={{ bg: "whiteAlpha.200", outline: "none" }}
              />
            </Box>

            <Box
              display={{ base: "block", lg: "none" }}
              color="whiteAlpha.600"
              cursor="pointer"
              p={2}
            >
              <Search size={22} />
            </Box>
          </HStack>

          {/* Center: Nav Links */}
          <HStack gap={0} display={{ base: "none", sm: "flex" }}>
            <NavItem icon={Home} label="Home" to="/dashboard" isActive />
            <NavItem icon={Users} label="My Network" to="#" />
            <NavItem icon={Briefcase} label="Jobs" to="#" />
            <NavItem icon={MessageSquare} label="Messaging" to="#" />
            <NavItem icon={Bell} label="Notifications" to="#" />
          </HStack>

          {/* Right: Profile */}
          <Box position="relative" ml={4}>
            <HStack
              gap={1}
              cursor="pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              opacity={isProfileOpen ? 1 : 0.8}
              transition="opacity 0.2s"
              _hover={{ opacity: 1 }}
            >
              <VStack gap={0} align="center">
                <Circle size="6" bg="blue.500" color="white" overflow="hidden">
                  <User size={16} />
                </Circle>
                <HStack gap={1} display={{ base: "none", md: "flex" }}>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color="whiteAlpha.600"
                  >
                    Me
                  </Text>
                  <ChevronDown size={14} color="rgba(255, 255, 255, 0.6)" />
                </HStack>
              </VStack>
            </HStack>

            {isProfileOpen && (
              <Box
                position="absolute"
                top="120%"
                right="0"
                bg="var(--color-primary)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="lg"
                boxShadow="2xl"
                w="250px"
                overflow="hidden"
                zIndex={200}
              >
                <Box
                  p={4}
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <HStack gap={3}>
                    <Circle size="12" bg="blue.500" color="white">
                      <User size={24} />
                    </Circle>
                    <VStack align="start" gap={0}>
                      <Text fontWeight="bold" color="white" fontSize="sm">
                       user
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.600">
                        Senior Developer
                      </Text>
                    </VStack>
                  </HStack>
                  <Button
                    size="xs"
                    w="full"
                    mt={3}
                    variant="outline"
                    borderColor="blue.400"
                    color="blue.400"
                    borderRadius="full"
                    _hover={{ bg: "blue.400", color: "white" }}
                  >
                    View Profile
                  </Button>
                </Box>

                <VStack align="stretch" gap={0} p={1}>
                  {user?.is_staff && (
                    <>
                      <HStack
                        p={2}
                        gap={3}
                        cursor="pointer"
                        borderRadius="md"
                        _hover={{ bg: "whiteAlpha.100" }}
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/admin");
                        }}
                      >
                        <LayoutDashboard
                          size={16}
                          color="rgba(255, 255, 255, 0.6)"
                        />
                        <Text fontSize="sm" color="white">
                          Admin Dashboard
                        </Text>
                      </HStack>
                      <Box h="1px" bg="whiteAlpha.100" my={1} />
                    </>
                  )}
                  <HStack
                    p={2}
                    gap={3}
                    cursor="pointer"
                    borderRadius="md"
                    _hover={{ bg: "whiteAlpha.100" }}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={16} color="rgba(255, 255, 255, 0.6)" />
                    <Text fontSize="sm" color="white">
                      Settings & Privacy
                    </Text>
                  </HStack>
                  <Box h="1px" bg="whiteAlpha.100" my={1} />
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
                    <LogOut size={16} color="rgba(239, 68, 68, 0.8)" />
                    <Text fontSize="sm" color="red.400">
                      Sign Out
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            )}
          </Box>

          {/* Overlay to close menu */}
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
        </Flex>
      </Box>
    </Box>
  );
};

export default Navbar;
