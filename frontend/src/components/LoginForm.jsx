import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Flex,
  Link,
  Separator,
} from "@chakra-ui/react";
import api from "../api";
import GoogleLoginButton from "./GoogleLoginButton";

const LoginForm = () => {
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

      // Fetch user role for redirection
      const userRes = await api.get("me/");
      if (userRes.data.is_staff) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
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

      // Fetch user role for redirection
      const userRes = await api.get("me/");
      if (userRes.data.is_staff) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Google Login failed.");
    }
  };

  return (
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

      <GoogleLoginButton
        onSuccess={handleGoogleSuccess}
        onError={() => setError("Google Login Failed")}
      />

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
  );
};

export default LoginForm;
