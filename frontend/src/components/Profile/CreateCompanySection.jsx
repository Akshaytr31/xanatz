import React, { useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Portal,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import api from "../../api";

const CreateCompanySection = ({ onCreated }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleCreateCompany = async () => {
    setIsLoading(true);
    try {
      await api.post("companies/", formData);
      setIsDialogOpen(false);
      setFormData({ name: "", description: "" });
      if (onCreated) onCreated();
    } catch (err) {
      console.error("Error creating company.", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="xl"
      p={4}
      w="full"
    >
      <Text color="white" fontWeight="bold" mb={3}>Company Management</Text>
      <Button w="full" leftIcon={<Plus size={16} />} colorScheme="blue" onClick={() => setIsDialogOpen(true)}>
        Create New Company
      </Button>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
        size="md"
      >
        <Portal>
          <DialogBackdrop bg="blackAlpha.800" backdropFilter="blur(10px)" zIndex={99999} />
          <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
            <DialogContent bg="var(--color-primary)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="xl" maxW="500px" m="auto">
              <DialogHeader color="white" py={5}>Create Company</DialogHeader>
              <DialogCloseTrigger color="whiteAlpha.600" top={4} right={4} />
              <DialogBody p={6}>
                <VStack gap={4}>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Name</Text>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Company Name"
                      bg="whiteAlpha.100"
                      color="white"
                      borderColor="whiteAlpha.200"
                    />
                  </Box>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Description</Text>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What does this company do?"
                      bg="whiteAlpha.100"
                      color="white"
                      borderColor="whiteAlpha.200"
                    />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={6}>
                <Button variant="ghost" mr={3} onClick={() => setIsDialogOpen(false)} color="white">
                  Cancel
                </Button>
                <Button colorScheme="blue" bg="blue.600" color="white" onClick={handleCreateCompany} isLoading={isLoading}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </Dialog>
    </Box>
  );
};

export default CreateCompanySection;
