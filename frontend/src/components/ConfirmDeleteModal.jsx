import React from "react";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Portal,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@chakra-ui/react";

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = "Remove Experience?",
  description = "Are you sure you want to remove this experience? This action cannot be undone.",
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="sm">
      <Portal>
        <DialogBackdrop
          bg="blackAlpha.800"
          backdropFilter="blur(12px)"
          zIndex={100000}
        />
        <DialogPositioner
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100001}
          p={4}
        >
          <DialogContent
            as={motion.div}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            bg="var(--color-primary, #090d16)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            maxW="420px"
            w="full"
            overflow="hidden"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          >
            <DialogHeader p={6} pb={0} position="relative">
              <VStack align="center" gap={3} textAlign="center" w="full">
                <Box
                  p={3}
                  borderRadius="full"
                  bg="rgba(239, 68, 68, 0.12)"
                  color="#ef4444"
                  border="1px solid rgba(239, 68, 68, 0.2)"
                >
                  <AlertTriangle size={28} />
                </Box>
                <Heading size="lg" color="white" fontWeight="bold">
                  {title}
                </Heading>
              </VStack>
            </DialogHeader>

            <DialogBody p={6} pt={3} textAlign="center">
              <Text color="slate.400" fontSize="sm" lineHeight="relaxed">
                {description}
              </Text>
            </DialogBody>

            <DialogFooter
              p={6}
              pt={2}
              gap={3}
              display="flex"
              justifyContent="space-between"
              borderTop="1px solid"
              borderColor="whiteAlpha.100"
              bg="whiteAlpha.50"
            >
              <Button
                flex="1"
                variant="outline"
                borderColor="whiteAlpha.200"
                color="slate.300"
                _hover={{ bg: "whiteAlpha.100", color: "white" }}
                onClick={onClose}
                disabled={loading}
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button
                flex="1"
                bg="#ef4444"
                color="white"
                _hover={{ bg: "#dc2626" }}
                onClick={onConfirm}
                loading={loading}
                borderRadius="xl"
                fontWeight="bold"
              >
                <Trash2 size={16} style={{ marginRight: "6px" }} /> Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog>
  );
};

export default ConfirmDeleteModal;
