import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Input,
  Circle,
  VStack,
  Image,
  Button,
} from "@chakra-ui/react";
import {
  Search,
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  User,
  ChevronDown,
  Settings,
  HelpCircle,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { backendUrl } from "../api";

const NavItem = ({ icon: Icon, label, to, active }) => (
  <VStack
    gap={0}
    align="center"
    cursor="pointer"
    opacity={active ? 1 : 0.6}
    _hover={{ opacity: 1 }}
    transition="opacity 0.2s"
    onClick={() => window.location.href = to}
  >
    <Icon size={24} color="white" />
    <Text fontSize="xs" fontWeight="medium" color="white" display={{ base: "none", md: "block" }}>
      {label}
    </Text>
  </VStack>
);

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("me/");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user in navbar", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${backendUrl}${path}`;
  };

  return (
    <Box
      bg="var(--color-primary)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      position="sticky"
      top={0}
      zIndex={100}
      px={4}
      h="64px"
    >
      <Flex h="full" maxW="1200px" mx="auto" align="center" justify="space-between">
        {/* Left: Logo & Search */}
        <HStack gap={4} flex={1}>
          <Box
            bg="white"
            p={1.5}
            borderRadius="md"
            cursor="pointer"
            onClick={() => navigate("/dashboard")}
          >
            <Text color="var(--color-primary)" fontWeight="black" fontSize="xl" lineHeight={1}>
              X
            </Text>
          </Box>

          <Box position="relative" maxW="280px" display={{ base: "none", lg: "block" }} flex={1}>
            <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" zIndex={1} color="whiteAlpha.500">
              <Search size={18} />
            </Box>
            <Input
              placeholder="Search"
              bg="whiteAlpha.100"
              border="none"
              pl="10"
              color="white"
              _placeholder={{ color: "whiteAlpha.500" }}
              _focus={{ bg: "whiteAlpha.200", boxShadow: "none" }}
            />
          </Box>
        </HStack>

        {/* Center: Navigation */}
        <HStack gap={{ base: 4, md: 8 }} flex={2} justify="center">
          <NavItem icon={Home} label="Home" to="/dashboard" active={location.pathname === "/dashboard"} />
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
                {user?.profile?.profile_picture ? (
                  <Image src={getImageUrl(user.profile.profile_picture)} w="full" h="full" objectFit="cover" />
                ) : (
                  <User size={16} />
                )}
              </Circle>
              <HStack gap={1} display={{ base: "none", md: "flex" }}>
                <Text fontSize="xs" fontWeight="medium" color="whiteAlpha.600">
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
              <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                <HStack gap={3}>
                  <Circle size="12" bg="blue.500" color="white" overflow="hidden">
                    {user?.profile?.profile_picture ? (
                      <Image src={getImageUrl(user.profile.profile_picture)} w="full" h="full" objectFit="cover" />
                    ) : (
                      <User size={24} />
                    )}
                  </Circle>
                  <VStack align="start" gap={0}>
                    <Text color="white" fontWeight="bold" fontSize="sm">
                      {user?.first_name} {user?.last_name}
                    </Text>
                    <Text color="whiteAlpha.600" fontSize="xs" noOfLines={1}>
                      {user?.profile?.headline || "Professional at Xanatz"}
                    </Text>
                  </VStack>
                </HStack>
                <Box mt={3}>
                  <Button
                    w="full"
                    size="sm"
                    variant="outline"
                    borderColor="blue.400"
                    color="blue.400"
                    borderRadius="full"
                    _hover={{ bg: "blue.400", color: "white" }}
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/profile");
                    }}
                  >
                    View Profile
                  </Button>
                </Box>
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
                      <LayoutDashboard size={16} color="rgba(255, 255, 255, 0.6)" />
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
                <HStack
                  p={2}
                  gap={3}
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: "whiteAlpha.100" }}
                  onClick={() => setIsProfileOpen(false)}
                >
                  <HelpCircle size={16} color="rgba(255, 255, 255, 0.6)" />
                  <Text fontSize="sm" color="white">
                    Help
                  </Text>
                </HStack>
                <Box h="1px" bg="whiteAlpha.100" my={1} />
                <HStack
                  p={2}
                  gap={3}
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: "whiteAlpha.100" }}
                  onClick={handleLogout}
                >
                  <LogOut size={16} color="rgba(255, 255, 255, 0.6)" />
                  <Text fontSize="sm" color="white">
                    Sign Out
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
