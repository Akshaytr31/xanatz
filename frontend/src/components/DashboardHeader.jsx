import React from "react";
import { LogOut, User } from "lucide-react";
import {
  Flex,
  HStack,
  Circle,
  Box,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";

const DashboardHeader = ({ handleLogout }) => {
  return (
    <Flex
      as="header"
      justify="space-between"
      align="center"
      mb={12}
      position="relative"
      zIndex={10}
      bg="whiteAlpha.100"
      backdropFilter="blur(12px)"
      p={4}
      borderRadius="lg"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <HStack gap={3}>
        <Circle
          size="10"
          bgGradient="to-tr"
          gradientFrom="var(--color-primary)"
          gradientTo="var(--color-secondary)"
          color="white"
          boxShadow="lg"
        >
          <User size={20} />
        </Circle>
        <Box>
          <Heading size="md" fontWeight="bold" color="white">
            My Dashboard
          </Heading>
          <Text fontSize="xs" color="var(--color-secondary)">
            Welcome to your secure space
          </Text>
        </Box>
      </HStack>
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        gap={2}
        bg="var(--color-primary)"
        borderColor="var(--color-secondary)"
        color="var(--color-secondary)"
        _hover={{ bg: "whiteAlpha.50", borderColor: "whiteAlpha.300" }}
        borderRadius="lg"
      >
        <LogOut size={16} />
        <Text as="span" display={{ base: "none", sm: "inline" }}>
          Logout
        </Text>
      </Button>
    </Flex>
  );
};

export default DashboardHeader;
