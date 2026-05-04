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
  IconButton,
  Container,
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
  Menu,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api, { backendUrl } from "../api";

const NavItem = ({ icon: Icon, label, to, active, onClick }) => (
  <Box
    position="relative"
    cursor="pointer"
    onClick={onClick}
    px={3}
    py={1.5}
    transition="all 0.3s"
    role="group"
  >
    <VStack gap={0} align="center" opacity={active ? 1 : 0.6} _groupHover={{ opacity: 1 }}>
      <Icon size={20} color="white" />
      <Text 
        fontSize="11px" 
        fontWeight="medium" 
        color="white" 
        display={{ base: "none", md: "block" }}
        mt={1}
      >
        {label}
      </Text>
    </VStack>
    {active && (
      <motion.div
        layoutId="nav-active"
        style={{
          position: "absolute",
          bottom: "-10px",
          left: 0,
          right: 0,
          height: "2.5px",
          background: "white",
          borderRadius: "1.5px 1.5px 0 0",
          boxShadow: "0 -1px 8px rgba(255,255,255,0.5)",
        }}
      />
    )}
  </Box>
);

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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
      bg="rgba(10, 10, 26, 0.85)"
      backdropFilter="blur(16px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      position="sticky"
      top={0}
      zIndex={1000}
      h="64px"
      transition="all 0.3s"
      py={1}
    >
      <Container maxW="1350px" h="full">
        <Flex h="full" align="center" justify="space-between">
          {/* Left: Logo & Search */}
          <HStack gap={7} flex={1}>
            <Box
              bgGradient="linear(to-br, blue.400, purple.500)"
              p={2}
              borderRadius="lg"
              cursor="pointer"
              onClick={() => navigate("/dashboard")}
              transition="all 0.2s"
              _hover={{ transform: "scale(1.05)" }}
            >
              <Text color="white" fontWeight="900" fontSize="xl" lineHeight={1}>
                X
              </Text>
            </Box>

            <Box 
              position="relative" 
              maxW={isSearchFocused ? "360px" : "260px"}
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
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
                <Search size={16} />
              </Box>
              <Input
                placeholder="Search..."
                bg="whiteAlpha.100"
                border="1px solid"
                borderColor="whiteAlpha.100"
                borderRadius="full"
                pl="10"
                h="38px"
                fontSize="sm"
                color="white"
                _placeholder={{ color: "whiteAlpha.400" }}
                _focus={{ 
                  bg: "whiteAlpha.200", 
                  borderColor: "blue.400",
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </Box>
          </HStack>

          {/* Center: Navigation */}
          <HStack gap={{ base: 2, md: 6 }} flex={2} justify="center">
            <NavItem icon={Home} label="Home" active={location.pathname === "/dashboard"} onClick={() => navigate("/dashboard")} />
            <NavItem icon={Users} label="Network" to="#" />
            <NavItem icon={Briefcase} label="Jobs" to="#" />
            <NavItem icon={MessageSquare} label="Messages" to="#" />
            <NavItem icon={Bell} label="Notifs" to="#" />
          </HStack>

          {/* Right: Profile & Actions */}
          <HStack flex={1} justify="flex-end" gap={4}>
            <Box position="relative">
              <HStack
                gap={2.5}
                cursor="pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                p={1.5}
                pr={3}
                borderRadius="full"
                bg={isProfileOpen ? "whiteAlpha.200" : "transparent"}
                _hover={{ bg: "whiteAlpha.100" }}
              >
                <Circle 
                  size="36px" 
                  p="2px"
                  bgGradient="linear(to-tr, blue.400, purple.500)"
                >
                  <Circle size="full" bg="gray.900" overflow="hidden">
                    {user?.profile?.profile_picture ? (
                      <Image src={getImageUrl(user.profile.profile_picture)} w="full" h="full" objectFit="cover" />
                    ) : (
                      <User size={18} color="white" />
                    )}
                  </Circle>
                </Circle>
                <VStack gap={0} align="start" display={{ base: "none", xl: "flex" }}>
                  <Text fontSize="xs" fontWeight="bold" color="white" lineHeight="1">
                    Me
                  </Text>
                  <ChevronDown size={14} color="whiteAlpha.600" />
                </VStack>
              </HStack>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      top: "125%",
                      right: "0",
                      width: "280px",
                      zIndex: 2000,
                    }}
                  >
                    <Box
                      bg="rgba(20, 20, 40, 0.98)"
                      backdropFilter="blur(30px)"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      borderRadius="xl"
                      boxShadow="0 20px 40px -12px rgba(0, 0, 0, 0.6)"
                      overflow="hidden"
                    >
                      <Box p={5} borderBottom="1px solid" borderColor="whiteAlpha.100">
                        <HStack gap={3}>
                          <Circle size="54px" p="2px" bgGradient="linear(to-tr, blue.400, purple.500)">
                            <Circle size="full" bg="gray.800" overflow="hidden">
                              {user?.profile?.profile_picture ? (
                                <Image src={getImageUrl(user.profile.profile_picture)} w="full" h="full" objectFit="cover" />
                              ) : (
                                <User size={26} color="white" />
                              )}
                            </Circle>
                          </Circle>
                          <VStack align="start" gap={0}>
                            <Text color="white" fontWeight="bold" fontSize="md">
                              {user?.first_name} {user?.last_name}
                            </Text>
                            <Text color="whiteAlpha.600" fontSize="xs" noOfLines={1}>
                              {user?.profile?.headline || "Professional at Xanatz"}
                            </Text>
                          </VStack>
                        </HStack>
                        <Button
                          mt={4}
                          w="full"
                          size="sm"
                          variant="solid"
                          bg="blue.600"
                          color="white"
                          borderRadius="xl"
                          h="34px"
                          _hover={{ bg: "blue.500" }}
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate("/profile");
                          }}
                        >
                          View Full Profile
                        </Button>
                      </Box>

                      <VStack align="stretch" gap={0} p={1.5}>
                        {user?.is_staff && (
                          <MenuLink 
                            icon={LayoutDashboard} 
                            label="Admin Console" 
                            onClick={() => {
                              setIsProfileOpen(false);
                              navigate("/admin");
                            }}
                          />
                        )}
                        <MenuLink icon={Settings} label="Settings & Privacy" />
                        <MenuLink icon={HelpCircle} label="Help Center" />
                        <Box h="1px" bg="whiteAlpha.100" my={1.5} mx={2} />
                        <MenuLink 
                          icon={LogOut} 
                          label="Sign Out" 
                          color="red.400"
                          onClick={handleLogout}
                        />
                      </VStack>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
            
            <IconButton
              display={{ base: "flex", lg: "none" }}
              variant="ghost"
              size="md"
              color="white"
              icon={<Menu size={22} />}
              aria-label="Menu"
            />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

const MenuLink = ({ icon: Icon, label, onClick, color = "white" }) => (
  <HStack
    p={3}
    gap={3.5}
    cursor="pointer"
    borderRadius="xl"
    _hover={{ bg: "whiteAlpha.100" }}
    onClick={onClick}
    role="group"
  >
    <Box color="whiteAlpha.500" _groupHover={{ color: color }}>
      <Icon size={16} />
    </Box>
    <Text fontSize="sm" fontWeight="medium" color={color}>
      {label}
    </Text>
  </HStack>
);

export default Navbar;
