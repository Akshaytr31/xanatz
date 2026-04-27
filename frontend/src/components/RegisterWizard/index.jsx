import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, VStack, Heading, Text, HStack, Link } from "@chakra-ui/react";
import api from "../../api";
import Step1Email from "./Step1Email";
import Step2OTP from "./Step2OTP";
import Step3Password from "./Step3Password";
import Step4Details from "./Step4Details";

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

const RegisterWizard = () => {
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

  const stepTitles = {
    1: "Start Journey",
    2: "Verification",
    3: "Security First",
    4: "About You",
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
      overflow="hidden"
      position="relative"
    >
      <HStack gap={1.5} mb={8}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            h="1"
            flex="1"
            borderRadius="full"
            transition="all 0.5s"
            bg={step >= i ? "var(--color-accent)" : "whiteAlpha.200"}
            boxShadow={step >= i ? "0 0 12px rgba(205,36,38,0.4)" : "none"}
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
          {stepTitles[step]}
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
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            style={{ position: "absolute", width: "100%" }}
          >
            {step === 1 && (
              <Step1Email
                formData={formData}
                handleChange={handleChange}
                handleSendOTP={handleSendOTP}
                loading={loading}
                handleGoogleSuccess={handleGoogleSuccess}
                setError={setError}
              />
            )}
            {step === 2 && (
              <Step2OTP
                formData={formData}
                handleChange={handleChange}
                handleVerifyOTP={handleVerifyOTP}
                prevStep={prevStep}
                loading={loading}
              />
            )}
            {step === 3 && (
              <Step3Password
                formData={formData}
                handleChange={handleChange}
                handlePasswordSubmit={handlePasswordSubmit}
              />
            )}
            {step === 4 && (
              <Step4Details
                formData={formData}
                handleChange={handleChange}
                handleFinalSubmit={handleFinalSubmit}
                loading={loading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Box mt={8} textAlign="center">
        <Text color="slate.500" fontSize="xs" fontWeight="medium">
          Already have an account?{" "}
          <Link
            as={RouterLink}
            to="/login"
            color="var(--color-accent)"
            _hover={{ color: "var(--color-accent)", borderBottom: "1px solid" }}
            fontWeight="bold"
            ml={1}
            transition="colors"
          >
            Sign In
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default RegisterWizard;
