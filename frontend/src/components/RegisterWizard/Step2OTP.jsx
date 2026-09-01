import React from "react";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { Box, VStack, Text, Input, Button, Flex } from "@chakra-ui/react";

const Step2OTP = ({
  formData,
  handleChange,
  handleVerifyOTP,
  handleResendOTP,
  resendCountdown = 0,
  resendLoading = false,
  resendNotice = "",
  prevStep,
  loading,
}) => {
  return (
    <form onSubmit={handleVerifyOTP}>
      <VStack gap={5}>
        <Text
          color="slate.400"
          fontSize="xs"
          textAlign="center"
          lineHeight="relaxed"
        >
          Check your inbox at <br />
          <Text as="span" color="var(--color-accent)" fontWeight="bold">
            {formData.email}
          </Text>
        </Text>

        {resendNotice && (
          <Text color="green.400" fontSize="xs" fontWeight="medium" textAlign="center">
            {resendNotice}
          </Text>
        )}

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
              boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
            }}
          />
        </Box>

        <Button
          as={motion.button}
          whileHover={{ scale: 1.01, translateY: -1 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          loading={loading}
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

        <Flex justify="space-between" align="center" w="full" px={1}>
          <Button
            variant="ghost"
            type="button"
            onClick={prevStep}
            color="slate.500"
            _hover={{
              color: "var(--color-accent)",
              bg: "transparent",
            }}
            fontSize="0.7rem"
            fontWeight="bold"
            textTransform="uppercase"
            p={0}
            height="auto"
          >
            Wrong email? Go back
          </Button>

          <Button
            variant="ghost"
            type="button"
            disabled={resendCountdown > 0 || resendLoading}
            onClick={handleResendOTP}
            color={resendCountdown > 0 ? "slate.600" : "var(--color-accent)"}
            _hover={{
              bg: "transparent",
            }}
            fontSize="0.7rem"
            fontWeight="bold"
            textTransform="uppercase"
            p={0}
            height="auto"
            cursor={resendCountdown > 0 ? "not-allowed" : "pointer"}
          >
            {resendLoading
              ? "Resending..."
              : resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : "Resend Code"}
          </Button>
        </Flex>
      </VStack>
    </form>
  );
};

export default Step2OTP;
