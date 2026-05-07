import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  VStack,
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
} from "@chakra-ui/react";
import { Briefcase, Edit2, Plus, Trash2 } from "lucide-react";
import api from "../../api";

const CareerTimeline = ({ user, onUpdate }) => {
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
    const today = new Date().toISOString().split("T")[0];
    
    if (!formData.title || !formData.company || !formData.start_date) {
      alert("Please fill in all required fields (*)");
      return;
    }

    if (formData.start_date > today) {
      alert("Start date cannot be in the future.");
      return;
    }
    
    if (!formData.current && formData.end_date && formData.end_date > today) {
      alert("End date cannot be in the future.");
      return;
    }

    // Clean data: replace empty strings with null for the backend
    const submissionData = { ...formData };
    if (!submissionData.end_date || submissionData.current) submissionData.end_date = null;
    if (!submissionData.location) submissionData.location = null;
    if (!submissionData.description) submissionData.description = null;

    setLoading(true);
    try {
      if (editingItem) {
        await api.patch(`experience/${editingItem.id}/`, submissionData);
      } else {
        // If adding a new experience, check for a currently active one
        const currentExp = experiences.find((exp) => exp.current);
        if (currentExp && submissionData.start_date) {
          const newStartDate = new Date(submissionData.start_date);
          const prevEndDate = new Date(newStartDate);
          prevEndDate.setDate(prevEndDate.getDate() - 1);
          const formattedEndDate = prevEndDate.toISOString().split("T")[0];

          await api.patch(`experience/${currentExp.id}/`, {
            current: false,
            end_date: formattedEndDate,
          });
        }
        await api.post("experience/", submissionData);
      }
      onUpdate();
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Experience submission error:", err.response?.data || err.message);
      alert("Error saving experience. Please check the form and try again.");
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

  const experiences = user?.profile?.experiences || [];

  return (
    <Box 
      bg="whiteAlpha.100" 
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      p={{ base: 4, md: 8 }} 
      borderRadius="xl" 
      mt={6} 
      position="relative" 
      overflowX="auto"
    >
      <HStack position="absolute" top={4} right={4} zIndex={10}>
        <Button
          colorScheme="blue"
          size="sm"
          onClick={() => handleOpen()}
        >
          <Plus size={16} style={{ marginRight: '4px' }} /> Add Experience
        </Button>
      </HStack>

      <HStack mb={1}>
        <Box p={3} bg="whiteAlpha.200" borderRadius="md" color="white">
          <Briefcase size={24} />
        </Box>
        <Text fontSize="3xl" fontWeight="bold" color="white">
          Career Timeline
        </Text>
      </HStack>

      {experiences.length === 0 ? (
        <Text color="whiteAlpha.600">No experience data available to generate timeline.</Text>
      ) : (
        <TimelineChart experiences={experiences} handleOpen={handleOpen} />
      )}

      {/* Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)} size="md">
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
                      <Input 
                        name="start_date" 
                        type="date" 
                        value={formData.start_date} 
                        onChange={handleChange} 
                        max={new Date().toISOString().split("T")[0]}
                        bg="whiteAlpha.100" 
                        color="white" 
                      />
                    </Box>
                    {!formData.current && (
                      <Box flex="1">
                        <Text mb={2} color="whiteAlpha.700" fontSize="sm">End Date</Text>
                        <Input 
                          name="end_date" 
                          type="date" 
                          value={formData.end_date} 
                          onChange={handleChange} 
                          max={new Date().toISOString().split("T")[0]}
                          bg="whiteAlpha.100" 
                          color="white" 
                        />
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
                  {editingItem && (
                    <Button mt={2} w="full" colorScheme="red" variant="outline" onClick={() => handleDelete(editingItem.id)}>
                      Delete Experience
                    </Button>
                  )}
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

const TimelineChart = ({ experiences, handleOpen }) => {
  const parsedExps = experiences.map((exp) => {
    const startDate = new Date(exp.start_date);
    const endDate = exp.current || !exp.end_date ? new Date() : new Date(exp.end_date);
    
    const startFraction = startDate.getFullYear() + (startDate.getMonth() / 12);
    const endFraction = endDate.getFullYear() + ((endDate.getMonth() + 1) / 12);

    return { ...exp, startFraction, endFraction };
  }).sort((a, b) => a.startFraction - b.startFraction);

  const currentYear = new Date().getFullYear();
  const minYear = Math.floor(Math.min(...parsedExps.map(e => e.startFraction)));
  let maxYear = Math.max(...parsedExps.map(e => Math.ceil(e.endFraction)));
  
  if (maxYear > currentYear) maxYear = currentYear;
  
  const startAxis = minYear;
  const endAxis = maxYear > minYear ? maxYear : minYear + 1;
  const totalYears = endAxis - startAxis + 1;

  const years = Array.from({ length: totalYears }, (_, i) => startAxis + i);

  const colors = ["#a8d08d", "#ffc000", "#ed7d31", "#5b9bd5", "#4472c4", "#70ad47", "#9e480e", "#997300"];

  return (
    <Box position="relative" minW="800px" minH="300px" mt={4}>
      {parsedExps.map((exp, index) => {
        const leftPercent = ((exp.startFraction - startAxis) / totalYears) * 100;
        let widthPercent = ((exp.endFraction - exp.startFraction) / totalYears) * 100;
        
        // Ensure a minimum width so it's always clickable/visible (e.g. 1 month minimum)
        if (widthPercent < (1 / 12 / totalYears) * 100) {
          widthPercent = (1 / 12 / totalYears) * 100;
        }
        
        const color = colors[index % colors.length];
        const isHigh = index % 2 === 0;

        return (
          <Box key={exp.id} position="absolute" left={`${leftPercent}%`} bottom="40px" width={`${widthPercent}%`} h="100%">
            <Box position="absolute" bottom={isHigh ? "180px" : "90px"} left="0" transform="translateX(-20%)" whiteSpace="nowrap" zIndex={10}>
              <Text fontWeight="bold" color="white" fontSize="md">{exp.company}</Text>
              <Text color="whiteAlpha.800" fontSize="sm" mb={1}>({exp.title})</Text>
              <Button size="xs" variant="solid" bg="whiteAlpha.200" color="white" _hover={{ bg: "whiteAlpha.300" }} onClick={() => handleOpen(exp)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Edit
              </Button>
            </Box>

            <Box position="absolute" left="0" bottom="10px" height={isHigh ? "170px" : "80px"} borderLeft="2px dashed" borderColor="whiteAlpha.400" />
            <Box position="absolute" left="-4px" bottom="10px" w="10px" h="10px" borderRadius="full" bg="whiteAlpha.600" />
            <Box position="absolute" bottom="0" left="0" w="100%" h="16px" bg={color} opacity={0.9} zIndex={2} />
          </Box>
        );
      })}

      <Box position="absolute" bottom="40px" left="0" w="100%" h="16px" bg="whiteAlpha.200" zIndex={1} />

      <Flex position="absolute" bottom="0" left="0" w="100%" h="30px" bg="whiteAlpha.100" align="stretch">
        {years.map((year, index) => (
          <Box 
            key={year} 
            flex={1} 
            position="relative"
            borderRight={index < years.length - 1 ? "1px solid" : "none"} 
            borderColor="whiteAlpha.400"
          >
            {/* 12 Month Ticks */}
            <Flex position="absolute" top="0" left="0" w="100%" h="100%">
              {Array.from({ length: 12 }).map((_, mIndex) => (
                <Box 
                  key={mIndex} 
                  flex={1} 
                  borderRight={mIndex < 11 ? "1px solid" : "none"} 
                  borderColor="whiteAlpha.300" 
                  opacity={0.4}
                />
              ))}
            </Flex>
            
            {/* Year Text centered */}
            <Flex position="absolute" top="0" left="0" w="100%" h="100%" align="center" justify="center">
              <Text 
                fontSize="sm" 
                fontWeight="medium" 
                color="whiteAlpha.800" 
                px={2} 
                borderRadius="sm" 
                zIndex={1}
                textShadow="0px 0px 4px rgba(0,0,0,0.8)"
              >
                {year}
              </Text>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default CareerTimeline;
