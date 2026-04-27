import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  KeyRound,
  Lock,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
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
  Checkbox,
} from "@chakra-ui/react";
import api from "../api";

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    accepted_privacy_policy: false,
  });

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
    setError("");
  };
  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
    setError("");
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("auth/send-otp/", { email: formData.email });
      nextStep();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Email may exist.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("auth/verify-otp/", {
        email: formData.email,
        otp: formData.otp,
      });
      nextStep();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Password Validation
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    nextStep();
  };

  // Step 4: Final Registration
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("auth/register/", formData);
      localStorage.setItem("access", response.data.tokens.access);
      localStorage.setItem("refresh", response.data.tokens.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Please check details.");
    } finally {
      setLoading(false);
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
      setError("Google Sign In failed.");
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
                  "Success is not just about who you know, it's about who trusts
                  you enough to refer you."
                </Text>
                <Text color="var(--color-accent)" fontWeight="semibold" mt={4}>
                  — The Referral Economy
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
                    Verify
                  </Heading>
                  <Text color="slate.400" fontSize="sm">
                    Instant OTP Security
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
                    Connect
                  </Heading>
                  <Text color="slate.400" fontSize="sm">
                    Join the Elite Circle
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
                  Be part of the next big thing.
                </Text>
              </HStack>
            </VStack>
          </motion.div>
        </Box>
      </Flex>

      {/* Right Panel: Registration Form */}
      <Flex flex="1" align="center" justify="center" p={6} position="relative">
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
            overflow="hidden"
            position="relative"
          >
            {/* Progress Bar */}
            <HStack gap={1.5} mb={8}>
              {[1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  h="1"
                  flex="1"
                  borderRadius="full"
                  transition="all 0.5s"
                  bg={step >= i ? "var(--color-accent)" : "whiteAlpha.200"}
                  boxShadow={
                    step >= i ? "0 0 12px rgba(205,36,38,0.4)" : "none"
                  }
                />
              ))}
            </HStack>

            <VStack gap={1} mb={6} textAlign="center">
              <Box display={{ base: "block", md: "none" }} mb={4}>
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
              <Heading size="2xl" color="white" mb={1}>
                {step === 1 && "Start Journey"}
                {step === 2 && "Verification"}
                {step === 3 && "Security First"}
                {step === 4 && "About You"}
              </Heading>
              <Text color="slate.400" fontSize="xs" letterSpacing="wide">
                Step {step} of 4
              </Text>
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

            <Box position="relative" minH="300px">
              <AnimatePresence custom={direction} mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                    style={{ position: "absolute", width: "100%" }}
                  >
                    <form onSubmit={handleSendOTP}>
                      <VStack gap={5}>
                        <Text
                          color="slate.400"
                          fontSize="xs"
                          textAlign="center"
                          lineHeight="relaxed"
                        >
                          Enter your email. We'll send a <br /> one-time
                          verification code.
                        </Text>
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
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            required
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            borderRadius="lg"
                            py="6"
                            pl="11"
                            color="white"
                            fontSize="sm"
                            _placeholder={{ color: "slate.600" }}
                            _focus={{
                              borderColor: "var(--color-accent)",
                              boxShadow: "0 0 0 4px rgba(205, 36, 38, 0.05)",
                            }}
                          />
                        </Box>
                        <Button
                          as={motion.button}
                          whileHover={{ scale: 1.01, translateY: -1 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          isLoading={loading}
                          w="full"
                          bg="var(--color-accent)"
                          _hover={{ bg: "var(--color-accent)", opacity: 0.9 }}
                          color="white"
                          fontWeight="bold"
                          py="6"
                          borderRadius="lg"
                          fontSize="sm"
                          boxShadow="0 10px 20px -5px rgba(205, 36, 38, 0.3)"
                        >
                          SEND CODE{" "}
                          <ArrowRight size={16} style={{ marginLeft: "8px" }} />
                        </Button>

                        <Flex w="full" align="center" gap={4} my={7}>
                          <Separator flex="1" borderColor="whiteAlpha.200" />
                          <Text
                            color="slate.600"
                            fontSize="10px"
                            fontWeight="bold"
                            textTransform="uppercase"
                            letterSpacing="0.2em"
                          >
                            OR
                          </Text>
                          <Separator flex="1" borderColor="whiteAlpha.200" />
                        </Flex>

                        <Box px={2}>
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google Sign In failed")}
                            theme="outline"
                            shape="rectangular"
                            text="continue_with"
                            width="300"
                          />
                        </Box>
                      </VStack>
                    </form>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                    style={{ position: "absolute", width: "100%" }}
                  >
                    <form onSubmit={handleVerifyOTP}>
                      <VStack gap={6}>
                        <Text
                          color="slate.400"
                          fontSize="xs"
                          textAlign="center"
                          lineHeight="relaxed"
                        >
                          Check your inbox at <br />
                          <Text
                            as="span"
                            color="var(--color-accent)"
                            fontWeight="bold"
                          >
                            {formData.email}
                          </Text>
                        </Text>
                        <Box w="full" position="relative">
                          <Box
                            position="absolute"
                            left="4"
                            top="50%"
                            transform="translateY(-50%)"
                            zIndex={1}
                            color="slate.500"
                          >
                            <KeyRound size={16} />
                          </Box>
                          <Input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            placeholder="6-DIGIT CODE"
                            maxLength={6}
                            required
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            borderRadius="lg"
                            py="6"
                            pl="11"
                            color="white"
                            textAlign="center"
                            letterSpacing="1em"
                            fontWeight="mono"
                            fontSize="lg"
                            _focus={{
                              borderColor: "var(--color-accent)",
                              boxShadow: "0 0 0 4px rgba(205, 36, 38, 0.05)",
                            }}
                          />
                        </Box>
                        <Button
                          as={motion.button}
                          whileHover={{ scale: 1.01, translateY: -1 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          isLoading={loading}
                          w="full"
                          bg="var(--color-accent)"
                          color="white"
                          fontWeight="bold"
                          py="6"
                          borderRadius="lg"
                          fontSize="sm"
                        >
                          VERIFY CODE
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={prevStep}
                          w="full"
                          color="slate.500"
                          _hover={{
                            color: "var(--color-accent)",
                            bg: "transparent",
                          }}
                          fontSize="0.7rem"
                          fontWeight="bold"
                          textTransform="uppercase"
                        >
                          wrong email? go back
                        </Button>
                      </VStack>
                    </form>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                    style={{ position: "absolute", width: "100%" }}
                  >
                    <form onSubmit={handlePasswordSubmit}>
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
                            <Lock size={16} />
                          </Box>
                          <Input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="NEW PASSWORD"
                            required
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            borderRadius="lg"
                            py="6"
                            pl="11"
                            color="white"
                            fontSize="sm"
                            _focus={{
                              borderColor: "var(--color-accent)",
                              boxShadow: "0 0 0 4px rgba(205, 36, 38, 0.05)",
                            }}
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
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="CONFIRM PASSWORD"
                            required
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            borderRadius="lg"
                            py="6"
                            pl="11"
                            color="white"
                            fontSize="sm"
                            _focus={{
                              borderColor: "var(--color-accent)",
                              boxShadow: "0 0 0 4px rgba(205, 36, 38, 0.05)",
                            }}
                          />
                        </Box>
                        <Button
                          as={motion.button}
                          whileHover={{ scale: 1.01, translateY: -1 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          w="full"
                          bg="var(--color-accent)"
                          color="white"
                          fontWeight="bold"
                          py="6"
                          borderRadius="lg"
                          fontSize="sm"
                          mt={2}
                        >
                          CONTINUE
                        </Button>
                      </VStack>
                    </form>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                    style={{ position: "absolute", width: "100%" }}
                  >
                    <form onSubmit={handleFinalSubmit}>
                      <VStack gap={4}>
                        <HStack gap={3} w="full">
                          <Box flex="1" position="relative">
                            <Box
                              position="absolute"
                              left="4"
                              top="50%"
                              transform="translateY(-50%)"
                              zIndex={1}
                              color="slate.500"
                            >
                              <User size={16} />
                            </Box>
                            <Input
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleChange}
                              placeholder="FIRST"
                              required
                              bg="whiteAlpha.100"
                              border="1px solid"
                              borderColor="whiteAlpha.200"
                              borderRadius="lg"
                              py="6"
                              pl="11"
                              color="white"
                              fontSize="sm"
                              _focus={{ borderColor: "var(--color-accent)" }}
                            />
                          </Box>
                          <Box flex="1" position="relative">
                            <Box
                              position="absolute"
                              left="4"
                              top="50%"
                              transform="translateY(-50%)"
                              zIndex={1}
                              color="slate.500"
                            >
                              <User size={16} />
                            </Box>
                            <Input
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleChange}
                              placeholder="LAST"
                              required
                              bg="whiteAlpha.100"
                              border="1px solid"
                              borderColor="whiteAlpha.200"
                              borderRadius="lg"
                              py="6"
                              pl="11"
                              color="white"
                              fontSize="sm"
                              _focus={{ borderColor: "var(--color-accent)" }}
                            />
                          </Box>
                        </HStack>

                        <Box w="full" position="relative">
                          <Box
                            position="absolute"
                            left="4"
                            top="50%"
                            transform="translateY(-50%)"
                            zIndex={1}
                            color="slate.500"
                          >
                            <Phone size={16} />
                          </Box>
                          <Input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="PHONE NUMBER"
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            borderRadius="lg"
                            py="6"
                            pl="11"
                            color="white"
                            fontSize="sm"
                            _focus={{ borderColor: "var(--color-accent)" }}
                          />
                        </Box>

                        <Box
                          w="full"
                          p={3}
                          bg="whiteAlpha.50"
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="whiteAlpha.100"
                        >
                          <HStack align="start" gap={3}>
                            <Checkbox
                              name="accepted_privacy_policy"
                              checked={formData.accepted_privacy_policy}
                              onChange={handleChange}
                              required
                              colorPalette="red"
                              size="sm"
                              mt="0.5"
                            />
                            <Text
                              fontSize="0.65rem"
                              color="slate.500"
                              lineHeight="tight"
                            >
                              I agree to the{" "}
                              <Link
                                as={RouterLink}
                                to="#"
                                color="slate.300"
                                textDecoration="underline"
                                fontWeight="bold"
                              >
                                Privacy Policy
                              </Link>{" "}
                              and network terms.
                            </Text>
                          </HStack>
                        </Box>

                        <Button
                          as={motion.button}
                          whileHover={{ scale: 1.01, translateY: -1 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          isLoading={loading}
                          isDisabled={!formData.accepted_privacy_policy}
                          w="full"
                          bg="var(--color-accent)"
                          color="white"
                          fontWeight="bold"
                          py="7"
                          borderRadius="lg"
                          fontSize="sm"
                          boxShadow="0 10px 20px -5px rgba(205, 36, 38, 0.3)"
                        >
                          <ShieldCheck
                            size={20}
                            style={{ marginRight: "8px" }}
                          />{" "}
                          JOIN XANATZ
                        </Button>
                      </VStack>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>

            {step === 1 && (
              <Box mt={8} textAlign="center">
                <Text color="slate.500" fontSize="xs" fontWeight="medium">
                  Member already?{" "}
                  <Link
                    as={RouterLink}
                    to="/login"
                    color="var(--color-accent)"
                    _hover={{ color: "var(--color-accent)", opacity: 0.8 }}
                    fontWeight="bold"
                    ml={1}
                  >
                    Sign In
                  </Link>
                </Text>
              </Box>
            )}
          </Box>
        </motion.div>
      </Flex>
    </Flex>
  );
};

export default Register;
