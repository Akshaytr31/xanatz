import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Circle } from "@chakra-ui/react";
import { GoogleLogin } from "@react-oauth/google";
import GoogleIcon from "./GoogleIcon";

const GoogleLoginButton = ({
  onSuccess,
  onError,
  label = "SIGN IN WITH GOOGLE",
}) => {
  const [isGoogleHovered, setIsGoogleHovered] = useState(false);

  return (
    <Box px={2}>
      <Flex justify="center" w="full">
        <Box
          position="relative"
          onMouseEnter={() => setIsGoogleHovered(true)}
          onMouseLeave={() => setIsGoogleHovered(false)}
          cursor="pointer"
        >
          {/* Real Google Login - Transparent but active */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="full"
            h="full"
            zIndex={20}
            opacity="0.01"
            overflow="hidden"
          >
            <GoogleLogin
              onSuccess={onSuccess}
              onError={onError}
              type="icon"
              shape="circle"
              size="large"
              width={isGoogleHovered ? "280" : "48"}
            />
          </Box>

          {/* Custom UI - Visible to user */}
          <Flex
            align="center"
            bg={isGoogleHovered ? "whiteAlpha.200" : "whiteAlpha.100"}
            borderRadius="full"
            p="1"
            gap={isGoogleHovered ? 4 : 0}
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            maxW={isGoogleHovered ? "280px" : "48px"}
            minW="48px"
            minH="48px"
            overflow="hidden"
            border="1px solid"
            borderColor={
              isGoogleHovered ? "var(--color-accent)" : "whiteAlpha.200"
            }
            boxShadow={
              isGoogleHovered ? "0 0 20px rgba(205, 36, 38, 0.15)" : "none"
            }
            position="relative"
            zIndex={10}
          >
            <Circle size="40px" bg="white" shadow="sm">
              <GoogleIcon />
            </Circle>
            <AnimatePresence>
              {isGoogleHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    whiteSpace: "nowrap",
                    paddingRight: "20px",
                  }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="black"
                    color="white"
                    letterSpacing="tight"
                  >
                    {label}
                  </Text>
                </motion.div>
              )}
            </AnimatePresence>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default GoogleLoginButton;
