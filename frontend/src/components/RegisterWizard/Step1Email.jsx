import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Flex,
  Separator,
  Circle,
} from "@chakra-ui/react";
import GoogleLoginButton from "../GoogleLoginButton";

const Step1Email = ({
  formData,
  handleChange,
  handleSendOTP,
  loading,
  handleGoogleSuccess,
  setError,
}) => {
  return (
    <form onSubmit={handleSendOTP}>
      <VStack gap={5}>
        <Text
          color="slate.400"
          fontSize="xs"
          textAlign="center"
          lineHeight="relaxed"
        >
          Enter your email. We'll send a <br /> one-time verification code.
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
          SEND CODE <ArrowRight size={16} style={{ marginLeft: "8px" }} />
        </Button>

        <Flex w="full" align="center" gap={4} my={4}>
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

        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google Login Failed")}
          label="JOIN WITH GOOGLE"
        />
      </VStack>
    </form>
  );
};

export default Step1Email;
