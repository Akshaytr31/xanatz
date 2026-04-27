import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Circle,
  Grid,
  GridItem,
} from "@chakra-ui/react";

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
      p={{ base: 6, md: 12 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        right="0"
        w="60vw"
        h="60vw"
        bg="var(--color-secondary)"
        opacity="0.3"
        borderRadius="full"
        filter="blur(150px)"
        mixBlendMode="screen"
        pointerEvents="none"
      />

      <Flex
        as="header"
        justify="space-between"
        align="center"
        mb={12}
        position="relative"
        zIndex={10}
        bg="whiteAlpha.100"
        backdropFilter="blur(12px)"
        p={4}
        borderRadius="lg"
        border="1px solid"
        borderColor="whiteAlpha.200"
      >
        <HStack gap={3}>
          <Circle
            size="10"
            bgGradient="to-tr"
            gradientFrom="var(--color-primary)"
            gradientTo="var(--color-secondary)"
            color="white"
            boxShadow="lg"
          >
            <User size={20} />
          </Circle>
          <Box>
            <Heading size="md" fontWeight="bold" color="white">
              My Dashboard
            </Heading>
            <Text fontSize="xs" color="var(--color-secondary)">
              Welcome to your secure space
            </Text>
          </Box>
        </HStack>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          gap={2}
          bg="var(--color-primary)"
          borderColor="var(--color-secondary)"
          color="var(--color-secondary)"
          _hover={{ bg: "whiteAlpha.50", borderColor: "whiteAlpha.300" }}
          borderRadius="lg"
        >
          <LogOut size={16} />
          <Text as="span" display={{ base: "none", sm: "inline" }}>
            Logout
          </Text>
        </Button>
      </Flex>

      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        gap={6}
        position="relative"
        zIndex={10}
      >
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <Box
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            bg="whiteAlpha.100"
            backdropFilter="blur(12px)"
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor="whiteAlpha.200"
            boxShadow="2xl"
          >
            <Heading
              size="lg"
              fontWeight="semibold"
              mb={4}
              color="var(--color-secondary)"
            >
              Account Overview
            </Heading>
            <Text color="var(--color-secondary)">
              This is your private dashboard. Your application successfully
              authenticated with the Django backend. From here you can manage
              your profile, security settings, and connect other applications.
            </Text>
          </Box>
        </GridItem>

        <GridItem colSpan={1}>
          <Box
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            bgGradient="to-br"
            gradientFrom="whiteAlpha.100"
            gradientTo="transparent"
            backdropFilter="blur(12px)"
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor="var(--color-secondary)"
            boxShadow="2xl"
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
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard;
