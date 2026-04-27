import React from "react";
import { Flex, Box } from "@chakra-ui/react";

const AuthLayout = ({ leftPanel, children }) => {
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
        {leftPanel}
      </Flex>

      {/* Right Panel: Form */}
      <Flex flex="1" align="center" justify="center" p={6} position="relative">
        {/* Mobile Background blur */}
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
        <Box w="full" maxWidth="400px" zIndex={10}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AuthLayout;
