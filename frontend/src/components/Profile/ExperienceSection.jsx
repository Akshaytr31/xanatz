import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
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
  Separator,
  Flex,
} from "@chakra-ui/react";
import { Plus, Edit2, Briefcase, Trash2 } from "lucide-react";
import api from "../../api";

const ExperienceSection = ({ user, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    title: "",
    location: "",
    start_date: "",
    end_date: "",
    current: false,
    description: "",
  });

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        company: item.company,
        title: item.title,
        location: item.location || "",
        start_date: item.start_date,
        end_date: item.end_date || "",
        current: item.current,
        description: item.description || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        company: "",
        title: "",
        location: "",
        start_date: "",
        end_date: "",
        current: false,
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingItem) {
        await api.patch(`experience/${editingItem.id}/`, formData);
      } else {
        await api.post("experience/", formData);
      }
      onUpdate();
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    try {
      await api.delete(`experience/${id}/`);
      onUpdate();
    } catch (err) {
      console.error(err);
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
          Experience
        </Text>
        <IconButton
          aria-label="Add experience"
          variant="ghost"
          color="whiteAlpha.700"
          _hover={{ color: "white", bg: "whiteAlpha.100" }}
          onClick={() => handleOpen()}
        >
          <Plus size={18} />
        </IconButton>
      </HStack>

      <VStack align="stretch" gap={6}>
        {user?.profile?.experiences?.length > 0 ? (
          user.profile.experiences.map((exp, index) => (
            <Box key={exp.id}>
              <Flex justify="space-between">
                <HStack align="start" gap={4}>
                  <Box p={2} bg="whiteAlpha.200" borderRadius="md">
                    <Briefcase size={24} color="white" />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold" color="white">
                      {exp.title}
                    </Text>
                    <Text color="whiteAlpha.800">{exp.company}</Text>
                    <Text color="whiteAlpha.600" fontSize="sm">
                      {exp.start_date} - {exp.current ? "Present" : exp.end_date}
                    </Text>
                    <Text color="whiteAlpha.600" fontSize="sm">
                      {exp.location}
                    </Text>
                    {exp.description && (
                      <Text mt={2} color="whiteAlpha.700" fontSize="sm">
                        {exp.description}
                      </Text>
                    )}
                  </VStack>
                </HStack>
                <HStack>
                  <IconButton
                    aria-label="Edit experience"
                    size="sm"
                    variant="ghost"
                    color="whiteAlpha.600"
                    _hover={{ color: "white", bg: "whiteAlpha.100" }}
                    onClick={() => handleOpen(exp)}
                  >
                    <Edit2 size={16} />
                  </IconButton>
                  <IconButton
                    aria-label="Delete experience"
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    _hover={{ bg: "red.400", color: "white" }}
                    onClick={() => handleDelete(exp.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </HStack>
              </Flex>
              {index < user.profile.experiences.length - 1 && (
                <Separator mt={6} borderColor="whiteAlpha.200" />
              )}
            </Box>
          ))
        ) : (
          <Text color="whiteAlpha.600">No experience added yet.</Text>
        )}
      </VStack>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
        size="md"
      >
        <Portal>
          <DialogBackdrop bg="blackAlpha.800" backdropFilter="blur(10px)" zIndex={99999} />
          <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
            <DialogContent bg="var(--color-primary)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="xl" maxW="500px" m="auto">
              <DialogHeader color="white" py={5}>
                {editingItem ? "Edit Experience" : "Add Experience"}
              </DialogHeader>
              <DialogCloseTrigger color="whiteAlpha.600" top={4} right={4} />
              <DialogBody p={6}>
                <VStack gap={4}>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Title *</Text>
                    <Input name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Retail Sales Manager" bg="whiteAlpha.100" color="white" />
                  </Box>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Company *</Text>
                    <Input name="company" value={formData.company} onChange={handleChange} placeholder="Ex: Microsoft" bg="whiteAlpha.100" color="white" />
                  </Box>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Location</Text>
                    <Input name="location" value={formData.location} onChange={handleChange} placeholder="Ex: London, United Kingdom" bg="whiteAlpha.100" color="white" />
                  </Box>
                  <HStack w="full">
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.700" fontSize="sm">Start Date *</Text>
                      <Input name="start_date" type="date" value={formData.start_date} onChange={handleChange} bg="whiteAlpha.100" color="white" />
                    </Box>
                    {!formData.current && (
                      <Box flex="1">
                        <Text mb={2} color="whiteAlpha.700" fontSize="sm">End Date</Text>
                        <Input name="end_date" type="date" value={formData.end_date} onChange={handleChange} bg="whiteAlpha.100" color="white" />
                      </Box>
                    )}
                  </HStack>
                  <HStack w="full" px={1}>
                    <input type="checkbox" name="current" checked={formData.current} onChange={handleChange} />
                    <Text fontSize="sm" color="whiteAlpha.800">I am currently working in this role</Text>
                  </HStack>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Description</Text>
                    <Textarea name="description" value={formData.description} onChange={handleChange} minH="120px" bg="whiteAlpha.100" color="white" />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={6}>
                <Button colorScheme="blue" bg="blue.600" color="white" w="full" onClick={handleSubmit} isLoading={loading}>
                  {editingItem ? "Save Changes" : "Add Experience"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </Dialog>
    </Box>
  );
};

export default ExperienceSection;
