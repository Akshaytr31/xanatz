import React from "react";
import { motion } from "framer-motion";
import { User, Phone, ShieldCheck } from "lucide-react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Link,
  Checkbox,
} from "@chakra-ui/react";

const Step4Details = ({
  formData,
  handleChange,
  handleFinalSubmit,
  loading,
}) => {
  return (
    <form onSubmit={handleFinalSubmit}>
      <VStack gap={4}>
        <HStack w="full" gap={4}>
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
              placeholder="First Name"
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
              placeholder="Last Name"
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
            placeholder="Phone Number"
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

        <Box
          w="full"
          p={4}
          bg="whiteAlpha.100"
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <HStack gap={3} align="flex-start">
            <Checkbox
              name="accepted_privacy_policy"
              isChecked={formData.accepted_privacy_policy}
              onChange={handleChange}
              colorScheme="red"
              mt={1}
            />
            <Text color="slate.400" fontSize="xs" lineHeight="short">
              I agree to the{" "}
              <Link color="var(--color-accent)" fontWeight="bold">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link color="var(--color-accent)" fontWeight="bold">
                Privacy Policy
              </Link>
              .
            </Text>
          </HStack>
        </Box>

        <Button
          as={motion.button}
          whileHover={{ scale: 1.01, translateY: -1 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          isLoading={loading}
          disabled={!formData.accepted_privacy_policy}
          w="full"
          bg="var(--color-accent)"
          color="white"
          fontWeight="bold"
          py="6"
          borderRadius="lg"
          fontSize="sm"
          mt={2}
          gap={2}
        >
          <ShieldCheck size={18} />
          COMPLETE REGISTRATION
        </Button>
      </VStack>
    </form>
  );
};

export default Step4Details;
