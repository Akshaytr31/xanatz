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
import { backendUrl } from "../api";

const getAvatarUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const BrandingSection = ({ quote, author, stats, communityText, randomUsers = [] }) => {
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

          <HStack gap={{ base: 2.5, md: stats.length > 2 ? 3 : 6 }} mt={10} align="stretch">
            {stats.map((stat, index) => (
              <Box
                key={index}
                p={{ base: 3, md: stats.length > 2 ? 3.5 : 4 }}
                borderRadius="lg"
                bg="whiteAlpha.200"
                border="1px solid"
                borderColor="whiteAlpha.300"
                flex="1"
                minW="0"
              >
                <Heading
                  fontSize={stats.length > 2 ? { base: "2xl", md: "3xl" } : "3xl"}
                  fontWeight="bold"
                  color="var(--color-text-primary)"
                  mb={1}
                >
                  {stat.value}
                </Heading>
                <Text
                  color="slate.400"
                  fontSize={{ base: "2xs", md: "xs" }}
                  fontWeight="semibold"
                  letterSpacing="wider"
                  textTransform="uppercase"
                >
                  {stat.label}
                </Text>
              </Box>
            ))}
          </HStack>

          <HStack gap={4} mt={12}>
            <Flex align="center">
              {randomUsers && randomUsers.length > 0 ? (
                randomUsers.slice(0, 4).map((u, i) => (
                  <Box
                    key={u.id || i}
                    w="10"
                    h="10"
                    borderRadius="full"
                    overflow="hidden"
                    border="2px solid var(--color-primary, #0b0f19)"
                    ml={i === 0 ? 0 : "-3"}
                    zIndex={10 - i}
                    bg="rgba(59, 130, 246, 0.25)"
                    position="relative"
                    boxShadow="0 2px 8px rgba(0,0,0,0.4)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    title={u.name}
                  >
                    {u.profile_picture ? (
                      <img
                        src={getAvatarUrl(u.profile_picture)}
                        alt={u.name || "Member"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Text fontSize="2xs" fontWeight="black" color="white">
                        {u.initials || "?"}
                      </Text>
                    )}
                  </Box>
                ))
              ) : (
                [1, 2, 3, 4].map((i) => (
                  <Circle
                    key={i}
                    size="10"
                    bg="whiteAlpha.300"
                    border="2px solid"
                    borderColor="var(--color-primary)"
                    ml={i === 1 ? 0 : "-3"}
                  />
                ))
              )}
            </Flex>
            <Text color="slate.300" fontSize="sm" fontWeight="medium">
              {communityText || "Join our verified platform today"}
            </Text>
          </HStack>
        </VStack>
      </motion.div>
    </Box>
  );
};

export default BrandingSection;
