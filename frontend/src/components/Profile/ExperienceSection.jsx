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
import {
  Plus,
  Edit2,
  Briefcase,
  Trash2,
  MapPin,
  Calendar,
  Globe,
  Search,
  ChevronDown,
} from "lucide-react";
import { Country, City } from "country-state-city";
import api from "../../api";

const MotionBox = motion.create(Box);

const ExperienceSection = ({ user, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    title: "",
    location: "",
    company_website: "",
    start_date: "",
    end_date: "",
    current: false,
    description: "",
  });

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  const countries = Country.getAllCountries().map((c) => ({
    label: c.name,
    value: c.isoCode,
  }));

  const cities = selectedCountry
    ? City.getCitiesOfCountry(selectedCountry.value).map((c) => ({
        label: c.name,
        value: c.name,
      }))
    : [];

  const filteredCountries = countries.filter((c) =>
    c.label.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const filteredCities = cities.filter((c) =>
    c.label.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const handleOpen = (item = null) => {
    let countryObj = null;
    let cityObj = null;

    if (item?.location) {
      const parts = item.location.split(", ");
      if (parts.length === 2) {
        const cityName = parts[0];
        const countryName = parts[1];
        const foundCountry = Country.getAllCountries().find(
          (c) => c.name === countryName,
        );
        if (foundCountry) {
          countryObj = {
            label: foundCountry.name,
            value: foundCountry.isoCode,
          };
          cityObj = { label: cityName, value: cityName };
        }
      }
    }

    setSelectedCountry(countryObj);
    setSelectedCity(cityObj);
    setCountrySearch("");
    setCitySearch("");
    setShowCountryList(false);
    setShowCityList(false);

    if (item) {
      setEditingItem(item);
      setFormData({
        company: item.company,
        title: item.title,
        location: item.location || "",
        company_website: item.company_website || "",
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
        company_website: "",
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
    if (!window.confirm("Are you sure you want to delete this experience?"))
      return;
    try {
      await api.delete(`experience/${id}/`);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box className="glass-card" p={{ base: 5, md: 6 }}>
      <Flex justify="space-between" align="center" mb={6}>
        <HStack gap={3}>
          <Circle size="32px" bg="blue.500/10" color="blue.400">
            <Briefcase size={16} />
          </Circle>
          <Text
            fontSize="md"
            fontWeight="black"
            color="white"
            letterSpacing="tight"
            fontFamily="var(--font-heading)"
          >
            EXPERIENCE
          </Text>
        </HStack>
        <IconButton
          aria-label="Add experience"
          variant="ghost"
          color="whiteAlpha.400"
          _hover={{ color: "blue.400", bg: "blue.400/10" }}
          onClick={() => handleOpen()}
          borderRadius="md"
          size="sm"
        >
          <Plus size={16} />
        </IconButton>
      </Flex>

      <VStack align="stretch" gap={6}>
        {user?.profile?.experiences?.length > 0 ? (
          user.profile.experiences.map((exp, index) => (
            <MotionBox
              key={exp.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Flex justify="space-between" align="start">
                <HStack align="start" gap={4} flex={1}>
                  <VStack align="start" gap={1}>
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      color="white"
                      lineHeight="1.2"
                    >
                      {exp.title}
                    </Text>
                    <Text
                      color="blue.400"
                      fontWeight="bold"
                      fontSize="10px"
                      letterSpacing="widest"
                    >
                      {exp.company.toUpperCase()}
                    </Text>

                    <Flex gap={3} wrap="wrap" mt={0.5}>
                      <HStack
                        color="whiteAlpha.500"
                        fontSize="10px"
                        fontWeight="medium"
                      >
                        <Calendar size={10} />
                        <Text>
                          {exp.start_date} —{" "}
                          {exp.current ? "PRESENT" : exp.end_date}
                        </Text>
                      </HStack>
                      {exp.location && (
                        <HStack
                          color="whiteAlpha.500"
                          fontSize="10px"
                          fontWeight="medium"
                        >
                          <MapPin size={10} />
                          <Text>{exp.location.toUpperCase()}</Text>
                        </HStack>
                      )}
                      {exp.company_website && (
                        <HStack
                          color="blue.400"
                          fontSize="10px"
                          fontWeight="medium"
                          as="a"
                          href={exp.company_website}
                          target="_blank"
                          cursor="pointer"
                          _hover={{ textDecoration: "underline" }}
                        >
                          <Globe size={10} />
                          <Text>WEBSITE</Text>
                        </HStack>
                      )}
                    </Flex>

                    {exp.description && (
                      <Text
                        mt={2}
                        color="whiteAlpha.700"
                        fontSize="xs"
                        lineHeight="relaxed"
                        borderLeft="2px solid"
                        borderColor="whiteAlpha.100"
                        pl={3}
                      >
                        {exp.description}
                      </Text>
                    )}
                  </VStack>
                </HStack>

                <HStack gap={2}>
                  <IconButton
                    aria-label="Edit experience"
                    size="sm"
                    variant="ghost"
                    color="whiteAlpha.300"
                    _hover={{ color: "white", bg: "whiteAlpha.100" }}
                    onClick={() => handleOpen(exp)}
                  >
                    <Edit2 size={16} />
                  </IconButton>
                  <IconButton
                    aria-label="Delete experience"
                    size="sm"
                    variant="ghost"
                    color="whiteAlpha.300"
                    _hover={{ color: "red.400", bg: "red.400/10" }}
                    onClick={() => handleDelete(exp.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </HStack>
              </Flex>
              {index < user.profile.experiences.length - 1 && (
                <Separator mt={8} borderColor="whiteAlpha.100" />
              )}
            </MotionBox>
          ))
        ) : (
          <Flex direction="column" align="center" py={10} gap={4}>
            <Briefcase size={40} className="text-white/5" />
            <Text color="whiteAlpha.400" fontSize="sm" fontWeight="medium">
              Showcase your professional journey...
            </Text>
          </Flex>
        )}
      </VStack>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
        size="md"
      >
        <Portal>
          <DialogBackdrop
            bg="blackAlpha.900"
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
              borderRadius="2xl"
              maxW="550px"
              m="auto"
              overflow="hidden"
            >
              <DialogHeader
                color="white"
                py={6}
                px={8}
                borderBottom="1px solid"
                borderColor="whiteAlpha.100"
              >
                {editingItem ? "Refine Experience" : "Add New Experience"}
              </DialogHeader>
              <DialogCloseTrigger color="whiteAlpha.600" top={6} right={6} />
              <DialogBody p={8}>
                <VStack gap={6}>
                  <Box w="full">
                    <Text
                      mb={2}
                      color="whiteAlpha.500"
                      fontSize="xs"
                      fontWeight="bold"
                      letterSpacing="widest"
                    >
                      ROLE TITLE *
                    </Text>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ex: Senior Project Manager"
                      bg="whiteAlpha.50"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                    />
                  </Box>
                  <Box w="full">
                    <Text
                      mb={2}
                      color="whiteAlpha.500"
                      fontSize="xs"
                      fontWeight="bold"
                      letterSpacing="widest"
                    >
                      ORGANIZATION *
                    </Text>
                    <Input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Ex: Innovation Labs"
                      bg="whiteAlpha.50"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                    />
                  </Box>

                  <VStack w="full" gap={4} align="stretch">
                    <Box w="full" position="relative">
                      <Text
                        mb={2}
                        color="whiteAlpha.500"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="widest"
                      >
                        COUNTRY
                      </Text>
                      <Box
                        bg="whiteAlpha.50"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        borderRadius="md"
                        p={2.5}
                        cursor="pointer"
                        onClick={() => setShowCountryList(!showCountryList)}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text
                          color={selectedCountry ? "white" : "whiteAlpha.500"}
                          fontSize="sm"
                        >
                          {selectedCountry
                            ? selectedCountry.label
                            : "Select Country"}
                        </Text>
                        <ChevronDown size={16} color="gray" />
                      </Box>

                      {showCountryList && (
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          bg="#1a1a1a"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                          borderRadius="md"
                          mt={1}
                          zIndex={100001}
                          maxH="200px"
                          overflowY="auto"
                          boxShadow="2xl"
                        >
                          <Box
                            p={2}
                            borderBottom="1px solid"
                            borderColor="whiteAlpha.100"
                            position="sticky"
                            top={0}
                            bg="#1a1a1a"
                          >
                            <HStack>
                              <Search size={14} color="gray" />
                              <Input
                                size="sm"
                                variant="unstyled"
                                placeholder="Search country..."
                                value={countrySearch}
                                onChange={(e) =>
                                  setCountrySearch(e.target.value)
                                }
                                autoFocus
                                color="white"
                              />
                            </HStack>
                          </Box>
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((c) => (
                              <Box
                                key={c.value}
                                p={2.5}
                                _hover={{ bg: "whiteAlpha.200" }}
                                cursor="pointer"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setSelectedCity(null);
                                  setShowCountryList(false);
                                  setCountrySearch("");
                                }}
                                color="white"
                                fontSize="sm"
                              >
                                {c.label}
                              </Box>
                            ))
                          ) : (
                            <Box p={3} color="whiteAlpha.500" fontSize="xs">
                              No countries found
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Box w="full" position="relative">
                      <Text
                        mb={2}
                        color="whiteAlpha.500"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="widest"
                      >
                        TOWN / CITY
                      </Text>
                      <Box
                        bg="whiteAlpha.50"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        borderRadius="md"
                        p={2.5}
                        cursor={selectedCountry ? "pointer" : "not-allowed"}
                        onClick={() =>
                          selectedCountry && setShowCityList(!showCityList)
                        }
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        opacity={selectedCountry ? 1 : 0.5}
                      >
                        <Text
                          color={selectedCity ? "white" : "whiteAlpha.500"}
                          fontSize="sm"
                        >
                          {selectedCity
                            ? selectedCity.label
                            : selectedCountry
                              ? "Select City"
                              : "Select Country first"}
                        </Text>
                        <ChevronDown size={16} color="gray" />
                      </Box>

                      {showCityList && selectedCountry && (
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          bg="#1a1a1a"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                          borderRadius="md"
                          mt={1}
                          zIndex={100001}
                          maxH="200px"
                          overflowY="auto"
                          boxShadow="2xl"
                        >
                          <Box
                            p={2}
                            borderBottom="1px solid"
                            borderColor="whiteAlpha.100"
                            position="sticky"
                            top={0}
                            bg="#1a1a1a"
                          >
                            <HStack>
                              <Search size={14} color="gray" />
                              <Input
                                size="sm"
                                variant="unstyled"
                                placeholder="Search city..."
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                                autoFocus
                                color="white"
                              />
                            </HStack>
                          </Box>
                          {filteredCities.length > 0 ? (
                            filteredCities.map((c) => (
                              <Box
                                key={c.value + Math.random()}
                                p={2.5}
                                _hover={{ bg: "whiteAlpha.200" }}
                                cursor="pointer"
                                onClick={() => {
                                  setSelectedCity(c);
                                  setShowCityList(false);
                                  setCitySearch("");
                                  setFormData({
                                    ...formData,
                                    location: `${c.label}, ${selectedCountry.label}`,
                                  });
                                }}
                                color="white"
                                fontSize="sm"
                              >
                                {c.label}
                              </Box>
                            ))
                          ) : (
                            <Box p={3} color="whiteAlpha.500" fontSize="xs">
                              No cities found
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </VStack>

                  <Box w="full">
                    <Text
                      mb={2}
                      color="whiteAlpha.500"
                      fontSize="xs"
                      fontWeight="bold"
                      letterSpacing="widest"
                    >
                      COMPANY WEBSITE
                    </Text>
                    <Input
                      name="company_website"
                      value={formData.company_website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      bg="whiteAlpha.50"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                    />
                  </Box>
                  <HStack w="full" gap={6}>
                    <Box flex="1">
                      <Text
                        mb={2}
                        color="whiteAlpha.500"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="widest"
                      >
                        START DATE *
                      </Text>
                      <Input
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleChange}
                        bg="whiteAlpha.50"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        color="white"
                      />
                    </Box>
                    {!formData.current && (
                      <Box flex="1">
                        <Text
                          mb={2}
                          color="whiteAlpha.500"
                          fontSize="xs"
                          fontWeight="bold"
                          letterSpacing="widest"
                        >
                          END DATE
                        </Text>
                        <Input
                          name="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={handleChange}
                          bg="whiteAlpha.50"
                          border="1px solid"
                          borderColor="whiteAlpha.200"
                          color="white"
                        />
                      </Box>
                    )}
                  </HStack>
                  <HStack w="full" px={1} gap={3}>
                    <input
                      type="checkbox"
                      name="current"
                      checked={formData.current}
                      onChange={handleChange}
                      style={{ width: "18px", height: "18px" }}
                    />
                    <Text
                      fontSize="sm"
                      color="whiteAlpha.700"
                      fontWeight="medium"
                    >
                      I am currently navigating this role
                    </Text>
                  </HStack>
                  <Box w="full">
                    <Text
                      mb={2}
                      color="whiteAlpha.500"
                      fontSize="xs"
                      fontWeight="bold"
                      letterSpacing="widest"
                    >
                      DESCRIPTION
                    </Text>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      minH="150px"
                      bg="whiteAlpha.50"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                      placeholder="Outline your impact and achievements..."
                    />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={8} bg="whiteAlpha.50">
                <Button
                  bg="blue.500"
                  color="white"
                  w="full"
                  size="lg"
                  onClick={handleSubmit}
                  isLoading={loading}
                >
                  {editingItem ? "Update Experience" : "Add Experience"}
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
