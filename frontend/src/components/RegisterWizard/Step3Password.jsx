import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Box, VStack, Input, Button } from "@chakra-ui/react";

const Step3Password = ({ formData, handleChange, handlePasswordSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="NEW PASSWORD *"
            required
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="lg"
            py="6"
            pl="11"
            pr="11"
            color="white"
            fontSize="sm"
            _focus={{
              borderColor: "var(--color-accent)",
              boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
            }}
          />
          <Box
            as="button"
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            position="absolute"
            right="3.5"
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
            bg="none"
            border="none"
            cursor="pointer"
            color="slate.500"
            _hover={{ color: "white" }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Box>
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
            type={showConfirmPassword ? "text" : "password"}
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="CONFIRM PASSWORD *"
            required
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="lg"
            py="6"
            pl="11"
            pr="11"
            color="white"
            fontSize="sm"
            _focus={{
              borderColor: "var(--color-accent)",
              boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
            }}
          />
          <Box
            as="button"
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            position="absolute"
            right="3.5"
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
            bg="none"
            border="none"
            cursor="pointer"
            color="slate.500"
            _hover={{ color: "white" }}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Box>
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
        >
          CONTINUE
        </Button>
      </VStack>
    </form>
  );
};

export default Step3Password;
