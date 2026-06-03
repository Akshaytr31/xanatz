import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, ShieldCheck, FileText } from "lucide-react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Link,
  Spinner,
  Separator,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Portal,
} from "@chakra-ui/react";
import api from "../../api";

const Step4Details = ({
  formData,
  handleChange,
  handleFinalSubmit,
  loading,
}) => {
  const [policy, setPolicy] = useState("");
  const [fetchingPolicy, setFetchingPolicy] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await api.get("privacy-policy/");
        setPolicy(response.data.content);
      } catch (err) {
        console.error("Failed to fetch privacy policy", err);
        setPolicy("Unable to load Privacy Policy. Please try again later.");
      } finally {
        setFetchingPolicy(false);
      }
    };
    fetchPolicy();
  }, []);
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
                boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
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
                boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
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
              boxShadow: "0 0 0 4px rgba(var(--color-accent-rgb), 0.05)",
            }}
          />
        </Box>

        <HStack w="full" px={1} gap={3} align="flex-start">
          <input
            type="checkbox"
            name="accepted_privacy_policy"
            checked={formData.accepted_privacy_policy}
            onChange={handleChange}
            style={{
              marginTop: "4px",
              width: "18px",
              height: "18px",
              accentColor: "var(--color-accent)",
              cursor: "pointer",
            }}
          />
          <Text color="whiteAlpha.800" fontSize="sm" lineHeight="tall">
            I have read and agree to the{" "}
            <Link
              color="var(--color-accent)"
              fontWeight="bold"
              textDecoration="underline"
              _hover={{ color: "var(--color-accent)" }}
            >
              Terms of Service
            </Link>{" "}
            and the dynamic{" "}
            <Text
              as="span"
              color="var(--color-accent)"
              fontWeight="bold"
              textDecoration="underline"
              cursor="pointer"
              onClick={() => setIsDialogOpen(true)}
              _hover={{ color: "var(--color-accent)" }}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </HStack>

        {/* Privacy Policy Dialog */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(e) => setIsDialogOpen(e.open)}
          size="md"
        >
          <Portal>
            <DialogBackdrop
              bg="blackAlpha.800"
              backdropFilter="blur(10px)"
              zIndex={99999}
            />
            <DialogPositioner
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={100000}
            >
              <DialogContent
                bg="var(--color-primary)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                boxShadow="dark-lg"
                borderRadius="xl"
                maxH="85vh"
                w="90vw"
                maxW="500px"
                m="auto"
              >
                <DialogHeader
                  color="white"
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.100"
                  py={5}
                >
                  <HStack gap={3}>
                    <Box bg="var(--color-accent)" p={1.5} borderRadius="md">
                      <FileText size={18} color="white" />
                    </Box>
                    <Text fontSize="lg" fontWeight="bold">
                      Privacy Policy
                    </Text>
                  </HStack>
                </DialogHeader>

                <DialogCloseTrigger
                  color="whiteAlpha.600"
                  _hover={{ color: "white", bg: "whiteAlpha.200" }}
                  top={4}
                  right={4}
                  borderRadius="full"
                />

                <DialogBody p={6} overflowY="auto">
                  {fetchingPolicy ? (
                    <VStack p={10} gap={4}>
                      <Spinner
                        size="lg"
                        color="var(--color-accent)"
                        thickness="3px"
                      />
                      <Text color="whiteAlpha.600" fontSize="sm">
                        Updating policy content...
                      </Text>
                    </VStack>
                  ) : (
                    <Box
                      pr={2}
                      css={{
                        "&::-webkit-scrollbar": { width: "5px" },
                        "&::-webkit-scrollbar-track": {
                          background: "var(--color-glass)",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "var(--color-card-border)",
                          borderRadius: "10px",
                        },
                      }}
                    >
                      <Text
                        color="whiteAlpha.900"
                        fontSize="sm"
                        whiteSpace="pre-wrap"
                        lineHeight="1.8"
                      >
                        {policy || "No privacy policy content available."}
                      </Text>
                    </Box>
                  )}
                </DialogBody>

                <DialogFooter
                  borderTop="1px solid"
                  borderColor="whiteAlpha.100"
                  pt={4}
                  pb={6}
                >
                  <Button
                    bg="var(--color-accent)"
                    color="white"
                    _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
                    _active={{ transform: "translateY(0)" }}
                    onClick={() => setIsDialogOpen(false)}
                    w="full"
                    fontWeight="bold"
                    letterSpacing="wide"
                  >
                    BACK TO REGISTRATION
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogPositioner>
          </Portal>
        </Dialog>

        <Button
          as={motion.button}
          whileHover={{ scale: 1.01, translateY: -1 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          loading={loading}
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
