import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Portal,
  Textarea,
  Button,
} from "@chakra-ui/react";
import { Edit2 } from "lucide-react";
import api from "../../api";

const AboutSection = ({ user, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [about, setAbout] = useState(user?.profile?.about || "");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.patch("me/", { about });
      onUpdate();
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="xl"
      p={6}
    >
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="bold" color="white">
          About
        </Text>
        <IconButton
          aria-label="Edit about"
          variant="ghost"
          color="whiteAlpha.700"
          _hover={{ color: "white", bg: "whiteAlpha.100" }}
          onClick={() => setIsDialogOpen(true)}
        >
          <Edit2 size={18} />
        </IconButton>
      </HStack>
      <Text color="whiteAlpha.800" whiteSpace="pre-wrap">
        {user?.profile?.about || "Write a brief summary about yourself."}
      </Text>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
        size="md"
      >
        <Portal>
          <DialogBackdrop bg="blackAlpha.800" backdropFilter="blur(10px)" zIndex={99999} />
          <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
            <DialogContent bg="var(--color-primary)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="xl" maxW="500px" m="auto">
              <DialogHeader color="white" py={5}>Edit About</DialogHeader>
              <DialogCloseTrigger color="whiteAlpha.600" top={4} right={4} />
              <DialogBody p={6}>
                <VStack gap={4}>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">About Summary</Text>
                    <Textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="You can write about your years of experience, industry, or skills."
                      minH="200px"
                      bg="whiteAlpha.100"
                      color="white"
                      borderColor="whiteAlpha.200"
                      _focus={{ borderColor: "blue.400" }}
                    />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={6}>
                <Button
                  bg="blue.600"
                  color="white"
                  w="full"
                  onClick={handleSubmit}
                  isLoading={loading}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </Dialog>
    </Box>
  );
};

export default AboutSection;
