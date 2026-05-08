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
  Circle,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Plus, Edit2, GraduationCap, Trash2, MapPin, Calendar, School } from "lucide-react";
import api from "../../api";

const MotionBox = motion.create(Box);

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
    <Box className="glass-card" p={{ base: 5, md: 6 }}>
      <Flex justify="space-between" align="center" mb={6}>
        <HStack gap={3}>
          <Circle size="32px" bg="purple.500/10" color="purple.400">
            <GraduationCap size={16} />
          </Circle>
          <Text fontSize="md" fontWeight="black" color="white" letterSpacing="tight" fontFamily="var(--font-heading)">
            ACADEMIC FOUNDATION
          </Text>
        </HStack>
        <IconButton
          aria-label="Add education"
          variant="ghost"
          color="whiteAlpha.400"
          _hover={{ color: "purple.400", bg: "purple.400/10" }}
          onClick={() => handleOpen()}
          borderRadius="md"
          size="sm"
        >
          <Plus size={16} />
        </IconButton>
      </Flex>

      <VStack align="stretch" gap={6}>
        {user?.profile?.educations?.length > 0 ? (
          user.profile.educations.map((edu, index) => (
            <MotionBox 
              key={edu.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Flex justify="space-between" align="start">
                <HStack align="start" gap={4} flex={1}>
                  <VStack align="start" gap={1}>
                    <Text fontSize="md" fontWeight="bold" color="white" lineHeight="1.2">
                      {edu.school}
                    </Text>
                    <Text color="purple.400" fontWeight="bold" fontSize="10px" letterSpacing="widest">
                      {edu.degree.toUpperCase()}{edu.field_of_study ? ` IN ${edu.field_of_study.toUpperCase()}` : ""}
                    </Text>
                    
                    <HStack color="whiteAlpha.500" fontSize="10px" fontWeight="medium" mt={0.5}>
                      <Calendar size={10} />
                      <Text>{edu.start_date} — {edu.end_date || "PRESENT"}</Text>
                    </HStack>

                    {edu.description && (
                      <Text mt={2} color="whiteAlpha.700" fontSize="xs" lineHeight="relaxed" borderLeft="2px solid" borderColor="whiteAlpha.100" pl={3}>
                        {edu.description}
                      </Text>
                    )}
                  </VStack>
                </HStack>
                
                <HStack gap={2}>
                  <IconButton
                    aria-label="Edit education"
                    size="sm"
                    variant="ghost"
                    color="whiteAlpha.300"
                    _hover={{ color: "white", bg: "whiteAlpha.100" }}
                    onClick={() => handleOpen(edu)}
                    borderRadius="md"
                  >
                    <Edit2 size={16} />
                  </IconButton>
                  <IconButton
                    aria-label="Delete education"
                    size="sm"
                    variant="ghost"
                    color="whiteAlpha.300"
                    _hover={{ color: "red.400", bg: "red.400/10" }}
                    onClick={() => handleDelete(edu.id)}
                    borderRadius="md"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </HStack>
              </Flex>
              {index < user.profile.educations.length - 1 && (
                <Separator mt={8} borderColor="whiteAlpha.100" />
              )}
            </MotionBox>
          ))
        ) : (
          <Flex direction="column" align="center" py={10} gap={4}>
            <GraduationCap size={40} className="text-white/5" />
            <Text color="whiteAlpha.400" fontSize="sm" fontWeight="medium">Add your educational milestones...</Text>
          </Flex>
        )}
      </VStack>

      <Dialog open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)} size="md">
        <Portal>
          <DialogBackdrop bg="blackAlpha.900" backdropFilter="blur(10px)" zIndex={99999} />
          <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
            <DialogContent bg="var(--color-primary)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="2xl" maxW="550px" m="auto" overflow="hidden">
              <DialogHeader color="white" py={6} px={8} borderBottom="1px solid" borderColor="whiteAlpha.100">
                {editingItem ? "Refine Education" : "Add New Academic Milestone"}
              </DialogHeader>
              <DialogCloseTrigger color="whiteAlpha.600" top={6} right={6} />
              <DialogBody p={8}>
                <VStack gap={6}>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">INSTITUTION *</Text>
                    <Input name="school" value={formData.school} onChange={handleChange} placeholder="Ex: Stanford University" bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" color="white" />
                  </Box>
                  <HStack w="full" gap={6}>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">DEGREE</Text>
                      <Input name="degree" value={formData.degree} onChange={handleChange} placeholder="Ex: Master of Science" bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" color="white" />
                    </Box>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">FIELD OF STUDY</Text>
                      <Input name="field_of_study" value={formData.field_of_study} onChange={handleChange} placeholder="Ex: Computer Science" bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" color="white" />
                    </Box>
                  </HStack>
                  <HStack w="full" gap={6}>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">START DATE *</Text>
                      <Input name="start_date" type="date" value={formData.start_date} onChange={handleChange} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" color="white" />
                    </Box>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">END DATE (OR EXPECTED)</Text>
                      <Input name="end_date" type="date" value={formData.end_date} onChange={handleChange} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" color="white" />
                    </Box>
                  </HStack>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">ACTIVITIES & SOCIETIES</Text>
                    <Textarea name="description" value={formData.description} onChange={handleChange} minH="150px" bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" color="white" placeholder="Outline your academic achievements..." />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={8} bg="whiteAlpha.50">
                <Button bg="blue.500" color="white" w="full" size="lg" onClick={handleSubmit} isLoading={loading}>
                  {editingItem ? "Update Education" : "Add Education"}
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
