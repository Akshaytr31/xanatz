import React from "react";
import { motion } from "framer-motion";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Circle,
} from "@chakra-ui/react";

const BrandingSection = ({ quote, author, stats }) => {
  return (
    <Box position="relative" zIndex={10} maxW="lg">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <Heading
          size="6xl"
          fontWeight="black"
          color="var(--color-text-primary)"
          mb={6}
          letterSpacing="tighter"
        >
          Xanatz
          <Text as="span" color="var(--color-accent)">
            .
          </Text>
        </Heading>

        <VStack align="stretch" gap={8}>
          <Box
            p={1}
            px={4}
            borderLeftWidth="4px"
            borderLeftColor="var(--color-accent)"
            bg="whiteAlpha.100"
            backdropFilter="blur(8px)"
            borderRadius="0 12px 12px 0"
          >
            <Text
              fontSize="2xl"
              fontWeight="light"
              color="slate.100"
              lineHeight="relaxed"
              fontStyle="italic"
            >
              "{quote}"
            </Text>
            <Text color="var(--color-accent)" fontWeight="semibold" mt={4}>
              — {author}
            </Text>
          </Box>

          <HStack gap={6} mt={12}>
            {stats.map((stat, index) => (
              <Box
                key={index}
                p={4}
                borderRadius="lg"
                bg="whiteAlpha.200"
                border="1px solid"
                borderColor="whiteAlpha.300"
                flex="1"
              >
                <Heading size="3xl" fontWeight="bold" color="var(--color-text-primary)" mb={1}>
                  {stat.value}
                </Heading>
                <Text color="slate.400" fontSize="sm">
                  {stat.label}
                </Text>
              </Box>
            ))}
          </HStack>

          <HStack gap={4} mt={12}>
            <Flex direction="row-reverse" justify="flex-end">
              {[1, 2, 3, 4].map((i) => (
                <Circle
                  key={i}
                  size="10"
                  bg="whiteAlpha.300"
                  border="2px solid"
                  borderColor="var(--color-primary)"
                  ml="-4"
                />
              ))}
            </Flex>
            <Text color="slate.300" fontSize="sm" fontWeight="medium">
              Join 50,000+ experts today
            </Text>
          </HStack>
        </VStack>
      </motion.div>
    </Box>
  );
};

export default BrandingSection;
