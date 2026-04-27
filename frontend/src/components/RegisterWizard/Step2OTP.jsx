import React from "react";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { Box, VStack, Text, Input, Button } from "@chakra-ui/react";

const Step2OTP = ({
  formData,
  handleChange,
  handleVerifyOTP,
  prevStep,
  loading,
}) => {
  return (
    <form onSubmit={handleVerifyOTP}>
      <VStack gap={6}>
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
  );
};

export default Step2OTP;
