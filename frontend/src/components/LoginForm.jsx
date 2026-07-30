import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
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
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSetupError, setPasswordSetupError] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [pendingRedirection, setPendingRedirection] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

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
      const from =
        location.state?.from?.pathname ||
        (userRes.data.is_staff ? "/admin" : "/dashboard");
      navigate(from, { replace: true });
    } catch (err) {
      setError("Invalid credentials, please try again.");
    }
  };

  const handlePasswordSubmit = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      setPasswordSetupError("Password must be at least 6 characters long.");
      return;
    }
    setSetupLoading(true);
    setPasswordSetupError("");
    try {
      await api.post("auth/set-password/", { password: newPassword });
      setShowPasswordSetup(false);
      navigate(pendingRedirection, { replace: true });
    } catch (err) {
      setPasswordSetupError("Failed to set password. Please try again.");
    } finally {
      setSetupLoading(false);
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
      const from =
        location.state?.from?.pathname ||
        (userRes.data.is_staff ? "/admin" : "/dashboard");

      if (response.data.needs_password) {
        setPendingRedirection(from);
        setShowPasswordSetup(true);
      } else {
        navigate(from, { replace: true });
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
            color="var(--color-text-primary)"
            letterSpacing="tighter"
          >
            Xanatz
            <Text as="span" color="var(--color-accent)">
              .
            </Text>
          </Heading>
        </Box>
        <Box>
          <Heading
            size="2xl"
            color="var(--color-text-primary)"
            mb={2}
            lineHeight="tight"
          >
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
            bg="rgba(var(--color-accent-rgb), 0.1)"
            border="1px solid"
            borderColor="var(--color-accent)/20"
            borderRadius="lg"
            color="var(--color-accent)"
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
                boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
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
                boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
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
            boxShadow="0 10px 20px -5px rgba(var(--color-accent-rgb), 0.3)"
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

      <AnimatePresence>
        {showPasswordSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(10, 15, 30, 0.85)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1.5rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                width: "100%",
                maxWidth: "400px",
                background: "var(--color-dropdown-bg, #0d1326)",
                border: "1px solid var(--color-card-border, rgba(255,255,255,0.1))",
                borderRadius: "1.5rem",
                padding: "2.25rem",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <VStack align="start" gap={2}>
                <Heading size="md" fontWeight="black" color="white" letterSpacing="tight">
                  Set Account Password
                </Heading>
                <Text fontSize="xs" color="var(--color-text-muted, #9ca3af)">
                  Set a password for your account so you can also log in using your email and password later.
                </Text>
              </VStack>

              {passwordSetupError && (
                <Text color="red.400" fontSize="xs" fontWeight="medium">
                  {passwordSetupError}
                </Text>
              )}

              <Box>
                <Text fontSize="2xs" fontWeight="bold" color="var(--color-text-muted, #9ca3af)" mb={1.5} letterSpacing="wider">
                  NEW PASSWORD
                </Text>
                <Input
                  type="password"
                  placeholder="Enter secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "var(--color-card-border, rgba(255,255,255,0.1))",
                    color: "white",
                  }}
                />
              </Box>

              <Button
                onClick={handlePasswordSubmit}
                loading={setupLoading}
                style={{
                  background: "linear-gradient(135deg, var(--color-accent) 0%, #60a5fa 100%)",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "0.75rem",
                  width: "100%",
                }}
              >
                SAVE PASSWORD
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default LoginForm;
