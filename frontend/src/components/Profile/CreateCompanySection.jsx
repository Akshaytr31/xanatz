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
import { Plus, Building2 } from "lucide-react";
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
      className="glass-card"
      p={5}
      w="full"
      border="1px solid"
      borderColor="var(--color-accent)/30"
    >
      <Text color="whiteAlpha.500" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={4}>
        GOVERNANCE
      </Text>
      <Button 
        w="full" 
        bg="var(--color-accent)" 
        color="white" 
        h="10"
        borderRadius="md"
        fontWeight="black"
        fontSize="xs"
        letterSpacing="widest"
        _hover={{ bg: "var(--color-accent)", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)" }}
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus size={14} style={{ marginRight: '6px' }} /> CREATE ORGANIZATION
      </Button>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
        size="md"
      >
        <Portal>
          <DialogBackdrop bg="blackAlpha.900" backdropFilter="blur(10px)" zIndex={99999} />
          <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
            <DialogContent bg="var(--color-primary)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="lg" maxW="500px" m="auto" overflow="hidden">
              <DialogHeader color="white" py={5} px={8} borderBottom="1px solid" borderColor="whiteAlpha.100" fontSize="md" fontWeight="black">
                Establish New Organization
              </DialogHeader>
              <DialogCloseTrigger color="white" top={5} right={5} />
              <DialogBody p={8}>
                <VStack gap={6}>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">LEGAL NAME</Text>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Future Horizons Inc."
                      bg="whiteAlpha.50"
                      color="white"
                      h="12"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      _focus={{ borderColor: "var(--color-accent)" }}
                    />
                  </Box>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">MISSION STATEMENT</Text>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Define the organization's purpose..."
                      bg="whiteAlpha.50"
                      color="white"
                      minH="120px"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      _focus={{ borderColor: "var(--color-accent)" }}
                    />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={6} bg="whiteAlpha.50">
                <Button variant="ghost" mr={4} onClick={() => setIsDialogOpen(false)} color="whiteAlpha.600" fontWeight="bold" fontSize="xs">
                  CANCEL
                </Button>
                <Button bg="var(--color-accent)" color="white" px={8} h="10" borderRadius="md" fontWeight="black" fontSize="xs" onClick={handleCreateCompany} isLoading={isLoading} _hover={{ bg: "var(--color-accent)" }}>
                  ESTABLISH
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
