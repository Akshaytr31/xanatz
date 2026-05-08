import React from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Box, VStack, Input, Button } from "@chakra-ui/react";

const Step3Password = ({ formData, handleChange, handlePasswordSubmit }) => {
  return (
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
              boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
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
              boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
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
  );
};

export default Step3Password;
