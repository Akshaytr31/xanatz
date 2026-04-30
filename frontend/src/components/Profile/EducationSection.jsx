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
import { Plus, Edit2, GraduationCap, Trash2 } from "lucide-react";
import api from "../../api";

const EducationSection = ({ user, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        school: item.school,
        degree: item.degree || "",
        field_of_study: item.field_of_study || "",
        start_date: item.start_date,
        end_date: item.end_date || "",
        description: item.description || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        school: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingItem) {
        await api.patch(`education/${editingItem.id}/`, formData);
      } else {
        await api.post("education/", formData);
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
    if (!window.confirm("Are you sure you want to delete this education entry?")) return;
    try {
      await api.delete(`education/${id}/`);
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
          Education
        </Text>
        <IconButton
          aria-label="Add education"
          variant="ghost"
          color="whiteAlpha.700"
          _hover={{ color: "white", bg: "whiteAlpha.100" }}
          onClick={() => handleOpen()}
        >
          <Plus size={18} />
        </IconButton>
      </HStack>

      <VStack align="stretch" gap={6}>
        {user?.profile?.educations?.length > 0 ? (
          user.profile.educations.map((edu, index) => (
            <Box key={edu.id}>
              <Flex justify="space-between">
                <HStack align="start" gap={4}>
                  <Box p={2} bg="whiteAlpha.200" borderRadius="md">
                    <GraduationCap size={24} color="white" />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold" color="white">
                      {edu.school}
                    </Text>
                    <Text color="whiteAlpha.800">
                      {edu.degree}{edu.field_of_study ? `, ${edu.field_of_study}` : ""}
                    </Text>
                    <Text color="whiteAlpha.600" fontSize="sm">
                      {edu.start_date} - {edu.end_date || "Present"}
                    </Text>
                    {edu.description && (
                      <Text mt={2} color="whiteAlpha.700" fontSize="sm">
                        {edu.description}
                      </Text>
                    )}
                  </VStack>
                </HStack>
                <HStack>
                  <IconButton
                    aria-label="Edit education"
                    size="sm"
                    variant="ghost"
                    color="whiteAlpha.600"
                    _hover={{ color: "white", bg: "whiteAlpha.100" }}
                    onClick={() => handleOpen(edu)}
                  >
                    <Edit2 size={16} />
                  </IconButton>
                  <IconButton
                    aria-label="Delete education"
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    _hover={{ bg: "red.400", color: "white" }}
                    onClick={() => handleDelete(edu.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </HStack>
              </Flex>
              {index < user.profile.educations.length - 1 && (
                <Separator mt={6} borderColor="whiteAlpha.200" />
              )}
            </Box>
          ))
        ) : (
          <Text color="whiteAlpha.600">No education added yet.</Text>
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
                {editingItem ? "Edit Education" : "Add Education"}
              </DialogHeader>
              <DialogCloseTrigger color="whiteAlpha.600" top={4} right={4} />
              <DialogBody p={6}>
                <VStack gap={4}>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">School *</Text>
                    <Input name="school" value={formData.school} onChange={handleChange} placeholder="Ex: Boston University" bg="whiteAlpha.100" color="white" />
                  </Box>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Degree</Text>
                    <Input name="degree" value={formData.degree} onChange={handleChange} placeholder="Ex: Bachelor's" bg="whiteAlpha.100" color="white" />
                  </Box>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Field of study</Text>
                    <Input name="field_of_study" value={formData.field_of_study} onChange={handleChange} placeholder="Ex: Business" bg="whiteAlpha.100" color="white" />
                  </Box>
                  <HStack w="full">
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.700" fontSize="sm">Start Date *</Text>
                      <Input name="start_date" type="date" value={formData.start_date} onChange={handleChange} bg="whiteAlpha.100" color="white" />
                    </Box>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.700" fontSize="sm">End Date</Text>
                      <Input name="end_date" type="date" value={formData.end_date} onChange={handleChange} bg="whiteAlpha.100" color="white" />
                    </Box>
                  </HStack>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Description</Text>
                    <Textarea name="description" value={formData.description} onChange={handleChange} minH="120px" bg="whiteAlpha.100" color="white" />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={6}>
                <Button bg="blue.600" color="white" w="full" onClick={handleSubmit} isLoading={loading}>
                  {editingItem ? "Save Changes" : "Add Education"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </Dialog>
    </Box>
  );
};

export default EducationSection;
