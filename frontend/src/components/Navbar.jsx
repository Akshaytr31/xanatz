import React, { useState, useEffect, useRef } from "react";
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
  LogOut,
  LayoutDashboard,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api, { backendUrl } from "../api";

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <HStack
    onClick={onClick}
    cursor="pointer"
    px={active ? 4 : 2.5}
    py={2}
    borderRadius="full"
    bg={active ? "rgba(255, 255, 255, 0.12)" : "transparent"}
    color={active ? "white" : "whiteAlpha.600"}
    _hover={{ bg: active ? "rgba(255, 255, 255, 0.15)" : "whiteAlpha.100", color: "white" }}
    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    gap={2}
  >
    <Icon size={16} strokeWidth={active ? 2.5 : 2} />
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          style={{ overflow: "hidden", whiteSpace: "nowrap" }}
        >
          <Text fontSize="sm" fontWeight="600" display={{ base: "none", md: "block" }}>
            {label}
          </Text>
        </motion.div>
      )}
    </AnimatePresence>
  </HStack>
);

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

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

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

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      zIndex={1000}
      paddingInline={"20px"}
      paddingTop={"10px "}
      w="full"
      display="flex"
      justifyContent="center"
      pointerEvents="none"
    >
      <Flex
        pointerEvents="auto"
        bg="rgba(2, 6, 23, 0.6)"
        backdropFilter="blur(20px) saturate(180%)"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="lg"
        boxShadow="0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255,255,255,0.05)"
        h="60px"
        px={4}
        w="full"
        maxW="1400px"
        align="center"
        justify="space-between"
      >
        {/* Left: Logo */}
        <Flex flex={1} justify="flex-start">
          <Circle
            size="36px"
            bgGradient="linear(to-br, var(--color-accent), purple.500)"
            cursor="pointer"
            onClick={() => navigate("/dashboard")}
            transition="all 0.3s"
            _hover={{ transform: "rotate(90deg) scale(1.05)" }}
            boxShadow="0 4px 14px rgba(66, 153, 225, 0.4)"
          >
            <Text color="white" fontWeight="900" fontSize="lg" lineHeight={1} transform="rotate(-90deg)">
              X
            </Text>
          </Circle>
        </Flex>

        {/* Center: Minimalist Nav Items */}
        <Flex flex={2} justify="center">
          <HStack gap={1} bg="rgba(0,0,0,0.2)" p={1} borderRadius="full" border="1px solid" borderColor="whiteAlpha.100">
            <NavItem icon={Home} label="Home" active={location.pathname === "/dashboard"} onClick={() => navigate("/dashboard")} />
            <NavItem icon={Users} label="Network" active={location.pathname === "/network"} />
            <NavItem icon={Briefcase} label="Jobs" active={location.pathname === "/jobs"} />
            <NavItem icon={MessageSquare} label="Chats" active={location.pathname === "/messages"} />
            <NavItem icon={Bell} label="Alerts" active={location.pathname === "/notifications"} />
          </HStack>
        </Flex>

        {/* Right: Expandable Search & Profile */}
        <Flex flex={1} justify="flex-end" align="center" gap={3}>
          
          <HStack
            bg="rgba(0,0,0,0.2)"
            borderRadius="full"
            p={1}
            border="1px solid"
            borderColor="whiteAlpha.100"
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            w={isSearchExpanded ? "220px" : "36px"}
            overflow="hidden"
          >
            <Circle
              size="28px"
              cursor="pointer"
              onClick={toggleSearch}
              _hover={{ bg: "whiteAlpha.200" }}
              transition="all 0.2s"
              color="whiteAlpha.700"
            >
              <Search size={14} />
            </Circle>
            {isSearchExpanded && (
              <Input
                ref={searchInputRef}
                placeholder="Search Xanatz..."
                variant="unstyled"
                color="white"
                fontSize="sm"
                px={2}
                w="full"
                _placeholder={{ color: "whiteAlpha.400" }}
                onBlur={() => setIsSearchExpanded(false)}
              />
            )}
          </HStack>

          <Box position="relative">
            <Circle
              size="36px"
              p="1.5px"
              bgGradient="linear(to-tr, var(--color-accent), purple.500)"
              cursor="pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              transition="transform 0.2s"
              _hover={{ transform: "scale(1.05)" }}
            >
              <Circle size="full" bg="gray.900" overflow="hidden">
                {user?.profile?.profile_picture ? (
                  <Image src={getImageUrl(user.profile.profile_picture)} w="full" h="full" objectFit="cover" />
                ) : (
                  <User size={18} color="white" />
                )}
              </Circle>
            </Circle>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    position: "absolute",
                    top: "130%",
                    right: "0",
                    width: "300px",
                    zIndex: 2000,
                  }}
                >
                  <Box
                    bg="rgba(18, 18, 36, 0.95)"
                    backdropFilter="blur(40px)"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="2xl"
                    boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05) inset"
                    overflow="hidden"
                  >
                    <Box p={5} position="relative" overflow="hidden">
                      {/* Decorative gradient orb */}
                      <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" bg="purple.500" filter="blur(50px)" opacity={0.3} borderRadius="full" />
                      
                      <HStack gap={4} position="relative" zIndex={1}>
                        <Circle size="60px" p="2px" bgGradient="linear(to-tr, var(--color-accent), purple.500)">
                          <Circle size="full" bg="gray.800" overflow="hidden">
                            {user?.profile?.profile_picture ? (
                              <Image src={getImageUrl(user.profile.profile_picture)} w="full" h="full" objectFit="cover" />
                            ) : (
                              <User size={28} color="white" />
                            )}
                          </Circle>
                        </Circle>
                        <VStack align="start" gap={0} flex={1}>
                          <Text color="white" fontWeight="bold" fontSize="lg" lineHeight="1.2">
                            {user?.first_name} {user?.last_name}
                          </Text>
                          <Text color="var(--color-accent)" fontSize="sm" mt={1} noOfLines={1} fontWeight="medium">
                            {user?.profile?.headline || "Professional at Xanatz"}
                          </Text>
                        </VStack>
                      </HStack>
                      
                      <Button
                        mt={5}
                        w="full"
                        size="md"
                        bg="whiteAlpha.100"
                        color="white"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        borderRadius="xl"
                        _hover={{ bg: "whiteAlpha.200", transform: "translateY(-1px)" }}
                        _active={{ bg: "whiteAlpha.300", transform: "translateY(0)" }}
                        transition="all 0.2s"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/profile");
                        }}
                      >
                        View Profile
                      </Button>
                    </Box>

                    <Box p={2} bg="rgba(0,0,0,0.2)">
                      {user?.is_staff && (
                        <MenuLink 
                          icon={LayoutDashboard} 
                          label="Admin Dashboard" 
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate("/admin");
                          }}
                        />
                      )}
                      <MenuLink icon={Settings} label="Preferences" />
                      <MenuLink icon={HelpCircle} label="Help & Support" />
                      <Box h="1px" bg="whiteAlpha.100" my={2} mx={3} />
                      <MenuLink 
                        icon={LogOut} 
                        label="Sign Out" 
                        color="var(--color-accent)"
                        onClick={handleLogout}
                      />
                    </Box>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
