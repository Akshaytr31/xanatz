import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Link,
  Separator,
  Circle,
} from "@chakra-ui/react";
import api from "../api";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("auth/login/", credentials);
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials, please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post("auth/google/", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("access", response.data.tokens.access);
      localStorage.setItem("refresh", response.data.tokens.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError("Google Login failed.");
    }
  };

  return (
    <Flex
      h="100vh"
      direction={{ base: "column", md: "row" }}
      bg="var(--color-primary)"
      overflow="hidden"
    >
      {/* Left Panel: Branding & Quotes */}
      <Flex
        display={{ base: "none", md: "flex" }}
        flex="1"
        bg="var(--color-primary)"
        position="relative"
        align="center"
        justify="center"
        p={12}
        overflow="hidden"
        borderRight="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Box
          position="absolute"
          top="-10%"
          left="-10%"
          w="40vw"
          h="40vw"
          bg="var(--color-accent)"
          opacity="0.2"
          borderRadius="full"
          filter="blur(120px)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-10%"
          right="-10%"
          w="50vw"
          h="50vw"
          bg="var(--color-accent)"
          opacity="0.1"
          borderRadius="full"
          filter="blur(120px)"
          pointerEvents="none"
        />

        <Box position="relative" zIndex={10} maxW="lg">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <Heading
              size="6xl"
              fontWeight="black"
              color="white"
              mb={6}
              letterSpacing="tighter"
            >
              Xanatz
              <Text as="span" color="var(--color-accent)">
                .
              </Text>
            </Heading>

            <VStack align="stretch" gap={8}>
              <Box
                p={1}
                px={4}
                borderLeftWidth="4px"
                borderLeftColor="var(--color-accent)"
                bg="whiteAlpha.100"
                backdropFilter="blur(8px)"
                borderRadius="0 12px 12px 0"
              >
                <Text
                  fontSize="2xl"
                  fontWeight="light"
                  color="slate.100"
                  lineHeight="relaxed"
                  fontStyle="italic"
                >
                  "The bridge between talent and opportunity is built on
                  referrals."
                </Text>
                <Text color="var(--color-accent)" fontWeight="semibold" mt={4}>
                  — Global Talent Network
                </Text>
              </Box>

              <HStack gap={6} mt={12}>
                <Box
                  p={4}
                  borderRadius="lg"
                  bg="whiteAlpha.200"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  flex="1"
                >
                  <Heading size="3xl" fontWeight="bold" color="white" mb={1}>
                    50k+
                  </Heading>
                  <Text color="slate.400" fontSize="sm">
                    Active Professionals
                  </Text>
                </Box>
                <Box
                  p={4}
                  borderRadius="lg"
                  bg="whiteAlpha.200"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  flex="1"
                >
                  <Heading size="3xl" fontWeight="bold" color="white" mb={1}>
                    12k+
                  </Heading>
                  <Text color="slate.400" fontSize="sm">
                    Successful Hires
                  </Text>
                </Box>
              </HStack>

              <HStack gap={4} mt={12}>
                <Flex direction="row-reverse" justify="flex-end">
                  {[1, 2, 3, 4].map((i) => (
                    <Circle
                      key={i}
                      size="10"
                      bg="whiteAlpha.300"
                      border="2px solid"
                      borderColor="var(--color-primary)"
                      ml="-4"
                    />
                  ))}
                </Flex>
                <Text color="slate.300" fontSize="sm" fontWeight="medium">
                  Join 50,000+ experts today
                </Text>
              </HStack>
            </VStack>
          </motion.div>
        </Box>
      </Flex>

      {/* Right Panel: Login Form */}
      <Flex flex="1" align="center" justify="center" p={6} position="relative">
        {/* Mobile Background Background blur */}
        <Box
          display={{ base: "block", md: "none" }}
          position="absolute"
          inset={0}
          bg="var(--color-primary)"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-10%"
            left="-10%"
            w="80vw"
            h="80vw"
            bg="var(--color-accent)"
            opacity="0.2"
            borderRadius="full"
            filter="blur(100px)"
            pointerEvents="none"
          />
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: "100%", maxWidth: "400px", zIndex: 10 }}
        >
          <Box
            p={8}
            borderRadius="lg"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            boxShadow="dark-lg"
            backdropFilter="blur(24px)"
          >
            <VStack gap={8} mb={8} textAlign="center">
              <Box display={{ base: "block", md: "none" }} mb={6}>
                <Heading
                  size="4xl"
                  fontWeight="black"
                  color="white"
                  letterSpacing="tighter"
                >
                  Xanatz
                  <Text as="span" color="var(--color-accent)">
                    .
                  </Text>
                </Heading>
              </Box>
              <Box>
                <Heading size="2xl" color="white" mb={2} lineHeight="tight">
                  Welcome Back
                </Heading>
                <Text color="slate.400" fontSize="sm">
                  Access your referral dashboard
                </Text>
              </Box>
            </VStack>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Box
                  p={3}
                  mb={6}
                  bg="red.500/10"
                  border="1px solid"
                  borderColor="red.500/20"
                  borderRadius="lg"
                  color="red.400"
                  fontSize="0.7rem"
                  textAlign="center"
                  fontWeight="medium"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {error}
                </Box>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                <Box w="full" position="relative">
                  <Box
                    position="absolute"
                    left="4"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={1}
                    color="slate.500"
                  >
                    <Mail size={16} />
                  </Box>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="lg"
                    py="6"
                    pl="11"
                    pr="4"
                    color="white"
                    fontSize="sm"
                    _placeholder={{ color: "slate.600" }}
                    _focus={{
                      outline: "none",
                      borderColor: "var(--color-accent)",
                      boxShadow: "0 0 0 4px rgba(205, 36, 38, 0.05)",
                    }}
                    transition="all 0.5s"
                    onChange={handleChange}
                  />
                </Box>

                <Box w="full" position="relative">
                  <Box
                    position="absolute"
                    left="4"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={1}
                    color="slate.500"
                  >
                    <Lock size={16} />
                  </Box>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="lg"
                    py="6"
                    pl="11"
                    pr="4"
                    color="white"
                    fontSize="sm"
                    _placeholder={{ color: "slate.600" }}
                    _focus={{
                      outline: "none",
                      borderColor: "var(--color-accent)",
                      boxShadow: "0 0 0 4px rgba(205, 36, 38, 0.05)",
                    }}
                    transition="all 0.5s"
                    onChange={handleChange}
                  />
                </Box>

                <Flex w="full" justify="flex-end" px={1}>
                  <Link
                    as={RouterLink}
                    to="#"
                    fontSize="0.7rem"
                    fontWeight="bold"
                    color="slate.500"
                    _hover={{
                      color: "var(--color-accent)",
                      textDecoration: "none",
                    }}
                    transition="colors"
                    letterSpacing="wide"
                  >
                    FORGOT PASSWORD?
                  </Link>
                </Flex>

                <Button
                  as={motion.button}
                  whileHover={{ scale: 1.01, translateY: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  w="full"
                  bg="var(--color-accent)"
                  _hover={{ bg: "var(--color-accent)", opacity: 0.9 }}
                  color="white"
                  fontWeight="bold"
                  py="7"
                  borderRadius="lg"
                  boxShadow="0 10px 20px -5px rgba(205, 36, 38, 0.3)"
                  fontSize="sm"
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Flex my={7} align="center" gap={4}>
              <Separator flex="1" borderColor="whiteAlpha.200" />
              <Text
                color="slate.600"
                fontSize="10px"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.2em"
              >
                or
              </Text>
              <Separator flex="1" borderColor="whiteAlpha.200" />
            </Flex>

            <Box px={2}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
                theme="outline"
                shape="rectangular"
                text="signin_with"
                width="300"
              />
            </Box>

            <Box mt={8} textAlign="center">
              <Text color="slate.500" fontSize="xs" fontWeight="medium">
                New to Xanatz?{" "}
                <Link
                  as={RouterLink}
                  to="/register"
                  color="var(--color-accent)"
                  _hover={{
                    color: "var(--color-accent)",
                    borderBottom: "1px solid",
                  }}
                  fontWeight="bold"
                  ml={1}
                  transition="colors"
                >
                  Create Account
                </Link>
              </Text>
            </Box>
          </Box>
        </motion.div>
      </Flex>
    </Flex>
  );
};

export default Login;
