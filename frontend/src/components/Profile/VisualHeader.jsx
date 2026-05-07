import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Circle,
  Image,
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
} from "@chakra-ui/react";
import { MapPin, Phone, Mail, Edit2, Camera, Briefcase, Building } from "lucide-react";
import api, { backendUrl } from "../../api";

const VisualHeader = ({ user, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const currentExperience = user?.profile?.experiences?.find(exp => exp.current);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    headline: user?.profile?.headline || "",
    location: user?.profile?.location || "",
    website: user?.profile?.website || "",
    about: user?.profile?.about || "",
  });

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${backendUrl}${path}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.patch("me/", formData);
      onUpdate();
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append(field, file);

    try {
      await api.patch("me/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <IconButton
        aria-label="Edit Profile"
        variant="ghost"
        color="whiteAlpha.600"
        _hover={{ bg: "whiteAlpha.100", color: "white" }}
        position="absolute"
        top={4}
        right={4}
        zIndex={10}
        onClick={() => setIsDialogOpen(true)}
      >
        <Edit2 size={18} />
      </IconButton>

      <Flex direction={{ base: "column", md: "row" }} align="stretch">
        {/* Left Side (Gray Area + Avatar) */}
        <Box
          w={{ base: "full", md: "35%" }}
          bg="whiteAlpha.200"
          p={8}
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
        >
          <Box position="relative">
            <Circle size="200px" bg="whiteAlpha.300" p="4px" zIndex={2}>
              <Circle size="full" bg="var(--color-primary)" overflow="hidden">
                {user?.profile?.profile_picture ? (
                  <Image
                    src={getImageUrl(user.profile.profile_picture)}
                    alt="Profile"
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                ) : (
                  <Text fontSize="6xl" color="whiteAlpha.500" fontWeight="bold">
                    {user?.first_name?.[0] || "?"}
                  </Text>
                )}
              </Circle>
            </Circle>
            <Box position="absolute" bottom="2" right="6" zIndex={3}>
              <IconButton
                as="label"
                htmlFor="profile-upload"
                aria-label="Upload profile picture"
                variant="solid"
                bg="blue.600"
                color="white"
                borderRadius="full"
                cursor="pointer"
                size="sm"
                _hover={{ bg: "blue.700" }}
              >
                <Camera size={16} />
              </IconButton>
              <input
                type="file"
                id="profile-upload"
                hidden
                onChange={(e) => handleImageUpload(e, "profile_picture")}
              />
            </Box>
          </Box>
        </Box>

        {/* Right Side (Info) */}
        <Box
          w={{ base: "full", md: "65%" }}
          p={8}
          display="flex"
          flexDirection={{ base: "column", xl: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={6}
        >
          {/* Name & About */}
          <VStack align="start" flex={1} gap={2} maxW="500px">
            <Text fontSize="4xl" fontWeight="black" color="white" lineHeight="1.1">
              {user?.first_name} {user?.last_name}
            </Text>

            {currentExperience && (
              <VStack align="start" gap={1} mt={1} mb={2}>
                <HStack color="white" fontSize="md" fontWeight="bold">
                  <Briefcase size={16} style={{ color: "var(--chakra-colors-blue-400)" }} />
                  <Text>{currentExperience.title}</Text>
                </HStack>
                <HStack color="whiteAlpha.800" fontSize="sm" fontWeight="medium">
                  <Building size={14} />
                  <Text>{currentExperience.company}</Text>
                </HStack>
              </VStack>
            )}

            <Text fontSize="lg" color="whiteAlpha.800" mt={2} whiteSpace="pre-wrap">
              {user?.profile?.about || user?.profile?.headline || "Add an about section to tell people more about yourself."}
            </Text>
          </VStack>

          {/* Contact Info */}
          <VStack align="start" gap={4} minW="250px">
            <HStack color="whiteAlpha.800">
              <Circle size="36px" bg="whiteAlpha.200" color="white">
                <MapPin size={18} />
              </Circle>
              <Text fontSize="md" fontWeight="medium">
                {user?.profile?.location || "Location not set"}
              </Text>
            </HStack>
            <HStack color="whiteAlpha.800">
              <Circle size="36px" bg="whiteAlpha.200" color="white">
                <Phone size={18} />
              </Circle>
              <Text fontSize="md" fontWeight="medium">
                {user?.phone_number || "Phone not set"}
              </Text>
            </HStack>
            <HStack color="whiteAlpha.800">
              <Circle size="36px" bg="whiteAlpha.200" color="white">
                <Mail size={18} />
              </Circle>
              <Text fontSize="md" fontWeight="medium">
                {user?.email || "Email not set"}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </Flex>

      {/* Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)} size="md">
        <Portal>
          <DialogBackdrop bg="blackAlpha.800" backdropFilter="blur(10px)" zIndex={99999} />
          <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
            <DialogContent bg="var(--color-primary)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="xl" maxW="500px" m="auto">
              <DialogHeader color="white" py={5}>Edit Profile & About</DialogHeader>
              <DialogCloseTrigger color="whiteAlpha.600" top={4} right={4} />
              <DialogBody p={6}>
                <VStack gap={4}>
                  <HStack w="full" gap={4}>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.700" fontSize="sm">First Name</Text>
                      <Input name="first_name" value={formData.first_name} onChange={handleChange} bg="whiteAlpha.100" color="white" />
                    </Box>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.700" fontSize="sm">Last Name</Text>
                      <Input name="last_name" value={formData.last_name} onChange={handleChange} bg="whiteAlpha.100" color="white" />
                    </Box>
                  </HStack>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Headline</Text>
                    <Input name="headline" value={formData.headline} onChange={handleChange} bg="whiteAlpha.100" color="white" />
                  </Box>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Location</Text>
                    <Input name="location" value={formData.location} onChange={handleChange} bg="whiteAlpha.100" color="white" />
                  </Box>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">About Summary</Text>
                    <Textarea name="about" value={formData.about} onChange={handleChange} minH="120px" bg="whiteAlpha.100" color="white" />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={6}>
                <Button bg="blue.600" color="white" w="full" onClick={handleSubmit} isLoading={loading}>
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

export default VisualHeader;
