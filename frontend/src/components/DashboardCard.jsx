import React from "react";
import { motion } from "framer-motion";
import { Box, Heading } from "@chakra-ui/react";

const DashboardCard = ({ title, children, delay = 0, ...props }) => {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      bg="whiteAlpha.100"
      backdropFilter="blur(12px)"
      p={6}
      borderRadius="lg"
      border="1px solid"
      borderColor="whiteAlpha.200"
      boxShadow="2xl"
      {...props}
    >
      {title && (
        <Heading
          size="lg"
          fontWeight="semibold"
          mb={4}
          color="var(--color-secondary)"
        >
          {title}
        </Heading>
      )}
      {children}
    </Box>
  );
};

export default DashboardCard;
