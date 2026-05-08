import React, { useState, useEffect } from "react";
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
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Edit2, Camera, Briefcase, Building, Globe, ShieldCheck, Search, ChevronDown, Plus } from "lucide-react";
import { Country, State, City } from "country-state-city";
import api, { backendUrl } from "../../api";

const MotionBox = motion.create(Box);

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

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  useEffect(() => {
    if (user?.profile?.location) {
      const parts = user.profile.location.split(", ");
      if (parts.length === 3) {
        const [cityName, stateName, countryName] = parts;
        const foundCountry = Country.getAllCountries().find(c => c.name === countryName);
        if (foundCountry) {
          setSelectedCountry({ label: foundCountry.name, value: foundCountry.isoCode });
          const foundState = State.getStatesOfCountry(foundCountry.isoCode).find(s => s.name === stateName);
          if (foundState) {
            setSelectedState({ label: foundState.name, value: foundState.isoCode });
            setSelectedCity({ label: cityName, value: cityName });
          }
        }
      } else if (parts.length === 2) {
        const [cityName, countryName] = parts;
        const foundCountry = Country.getAllCountries().find(c => c.name === countryName);
        if (foundCountry) {
          setSelectedCountry({ label: foundCountry.name, value: foundCountry.isoCode });
          const states = State.getStatesOfCountry(foundCountry.isoCode);
          for (const s of states) {
            const cities = City.getCitiesOfState(foundCountry.isoCode, s.isoCode);
            const foundCity = cities.find(c => c.name === cityName);
            if (foundCity) {
              setSelectedState({ label: s.name, value: s.isoCode });
              setSelectedCity({ label: cityName, value: cityName });
              break;
            }
          }
        }
      }
    }
  }, [user]);

  const countries = Country.getAllCountries().map(c => ({ label: c.name, value: c.isoCode }));
  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry.value).map(s => ({ label: s.name, value: s.isoCode })) : [];
  const cities = selectedState ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(c => ({ label: c.name, value: c.name })) : [];

  const filteredCountries = countries.filter(c => c.label.toLowerCase().includes(countrySearch.toLowerCase()));
  const filteredStates = states.filter(s => s.label.toLowerCase().includes(stateSearch.toLowerCase()));
  const filteredCities = cities.filter(c => c.label.toLowerCase().includes(citySearch.toLowerCase()));

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
      className="glass-card"
      overflow="hidden"
      position="relative"
      p={0}
    >
      <IconButton
        aria-label="Edit Profile"
        variant="ghost"
        color="whiteAlpha.400"
        _hover={{ bg: "whiteAlpha.100", color: "white" }}
        position="absolute"
        top={6}
        right={6}
        zIndex={10}
        onClick={() => setIsDialogOpen(true)}
      >
        <Edit2 size={20} />
      </IconButton>

      <Flex direction={{ base: "column", md: "row" }} align="stretch">
        {/* Left Side (Avatar Section) */}
        <Box
          w={{ base: "full", md: "35%" }}
          bgGradient="linear(to-br, whiteAlpha.100, transparent)"
          p={8}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          position="relative"
          borderRight={{ md: "1px solid" }}
          borderColor="whiteAlpha.100"
        >
          <MotionBox
            whileHover={{ scale: 1.02 }}
            position="relative"
          >
            {/* Glowing Ring */}
            <Box
              position="absolute"
              top="-6px"
              left="-6px"
              right="-6px"
              bottom="-6px"
              borderRadius="full"
              bgGradient="linear(to-tr, blue.500, purple.500)"
              filter="blur(10px)"
              opacity={0.4}
              zIndex={0}
            />
            
            <Circle
              size="150px"
              bg="whiteAlpha.200"
              p="4px"
              zIndex={1}
              position="relative"
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
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
                  <Text fontSize="5xl" color="whiteAlpha.400" fontWeight="black">
                    {user?.first_name?.[0] || "?"}
                  </Text>
                )}
              </Circle>
            </Circle>
            
            <Box position="absolute" bottom="2" right="2" zIndex={3}>
              <IconButton
                as="label"
                htmlFor="profile-upload"
                aria-label="Upload profile picture"
                variant="solid"
                bg="blue.500"
                color="white"
                borderRadius="full"
                cursor="pointer"
                size="md"
                _hover={{ bg: "blue.400", transform: "scale(1.1)" }}
                transition="all 0.2s"
                boxShadow="lg"
              >
                <Camera size={18} />
              </IconButton>
              <input
                type="file"
                id="profile-upload"
                hidden
                onChange={(e) => handleImageUpload(e, "profile_picture")}
              />
            </Box>
          </MotionBox>
          
          <HStack mt={6} color="blue.400" fontWeight="bold" fontSize="sm" letterSpacing="widest">
            <ShieldCheck size={16} />
            <Text>VERIFIED PROFESSIONAL</Text>
          </HStack>
        </Box>

        {/* Right Side (Info Section) */}
        <Box
          w={{ base: "full", md: "65%" }}
          p={{ base: 6, md: 10 }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={6}
        >
          {/* Name & Headline */}
          <VStack align="start" gap={2}>
            <HStack align="center" gap={3}>
              <Text
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="black"
                color="white"
                lineHeight="0.9"
                letterSpacing="tight"
                fontFamily="var(--font-heading)"
              >
                {user?.first_name} {user?.last_name}
              </Text>
            </HStack>

            <Text fontSize="md" fontWeight="bold" color="blue.400" letterSpacing="widest">
              {user?.profile?.headline || "PROFESSIONAL SEEKER"}
            </Text>

            {currentExperience && (
              <HStack bg="whiteAlpha.100" px={3} py={1.5} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
                <Briefcase size={14} className="text-blue-400" />
                <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.900">
                  {currentExperience.title} @ {currentExperience.company}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* About Summary */}
          <Text fontSize="sm" color="whiteAlpha.700" lineHeight="relaxed" maxW="600px">
            {user?.profile?.about || "Elevate your professional journey with Xanatz. This user is currently crafting their unique story."}
          </Text>

          {/* Contact & Meta Info */}
          <Flex wrap="wrap" gap={5} pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
            <HStack color="whiteAlpha.600" fontSize="xs">
              <MapPin size={14} />
              <Text fontWeight="medium">{user?.profile?.location || "Remote"}</Text>
            </HStack>
            <HStack color="whiteAlpha.600" fontSize="xs">
              <Mail size={14} />
              <Text fontWeight="medium">{user?.email}</Text>
            </HStack>
            {user?.profile?.website && (
              <HStack color="blue.400" fontSize="xs" cursor="pointer" as="a" href={user.profile.website} target="_blank">
                <Globe size={14} />
                <Text fontWeight="bold">PORTFOLIO</Text>
              </HStack>
            )}
          </Flex>
        </Box>
      </Flex>

      {/* Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)} size="md">
        <Portal>
          <DialogBackdrop bg="blackAlpha.900" backdropFilter="blur(10px)" zIndex={99999} />
          <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
            <DialogContent bg="var(--color-primary)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="lg" maxW="550px" m="auto" overflow="hidden">
              <DialogHeader color="white" py={6} px={8} borderBottom="1px solid" borderColor="whiteAlpha.100">
                Edit Professional Profile
              </DialogHeader>
              <DialogCloseTrigger color="whiteAlpha.600" top={6} right={6} />
              <DialogBody p={8}>
                <VStack gap={6}>
                  <HStack w="full" gap={6}>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">FIRST NAME</Text>
                      <Input name="first_name" value={formData.first_name} onChange={handleChange} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" _focus={{ borderColor: "blue.500" }} color="white" />
                    </Box>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">LAST NAME</Text>
                      <Input name="last_name" value={formData.last_name} onChange={handleChange} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" _focus={{ borderColor: "blue.500" }} color="white" />
                    </Box>
                  </HStack>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">HEADLINE</Text>
                    <Input name="headline" value={formData.headline} onChange={handleChange} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" _focus={{ borderColor: "blue.500" }} color="white" placeholder="Ex: Senior Creative Designer" />
                  </Box>
                  <VStack w="full" gap={4} align="stretch">
                    <Box w="full" position="relative">
                      <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">COUNTRY</Text>
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
                        <Text color={selectedCountry ? "white" : "whiteAlpha.500"} fontSize="sm">
                          {selectedCountry ? selectedCountry.label : "Select Country"}
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
                          <Box p={2} borderBottom="1px solid" borderColor="whiteAlpha.100" position="sticky" top={0} bg="#1a1a1a">
                            <HStack>
                              <Search size={14} color="gray" />
                              <Input
                                size="sm"
                                variant="unstyled"
                                placeholder="Search country..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                autoFocus
                                color="white"
                              />
                            </HStack>
                          </Box>
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map(c => (
                              <Box
                                key={c.value}
                                p={2.5}
                                _hover={{ bg: "whiteAlpha.200" }}
                                cursor="pointer"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setSelectedState(null);
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
                            <Box p={3} color="whiteAlpha.500" fontSize="xs">No countries found</Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Box w="full" position="relative">
                      <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">STATE / PROVINCE</Text>
                      <Box
                        bg="whiteAlpha.50"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        borderRadius="md"
                        p={2.5}
                        cursor={selectedCountry ? "pointer" : "not-allowed"}
                        onClick={() => selectedCountry && setShowStateList(!showStateList)}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        opacity={selectedCountry ? 1 : 0.5}
                      >
                        <Text color={selectedState ? "white" : "whiteAlpha.500"} fontSize="sm">
                          {selectedState ? selectedState.label : selectedCountry ? "Select State" : "Select Country first"}
                        </Text>
                        <ChevronDown size={16} color="gray" />
                      </Box>
                      
                      {showStateList && selectedCountry && (
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
                          <Box p={2} borderBottom="1px solid" borderColor="whiteAlpha.100" position="sticky" top={0} bg="#1a1a1a">
                            <HStack>
                              <Search size={14} color="gray" />
                              <Input
                                size="sm"
                                variant="unstyled"
                                placeholder="Search state..."
                                value={stateSearch}
                                onChange={(e) => setStateSearch(e.target.value)}
                                autoFocus
                                color="white"
                              />
                            </HStack>
                          </Box>
                          {filteredStates.length > 0 ? (
                            filteredStates.map(s => (
                              <Box
                                key={s.value}
                                p={2.5}
                                _hover={{ bg: "whiteAlpha.200" }}
                                cursor="pointer"
                                onClick={() => {
                                  setSelectedState(s);
                                  setSelectedCity(null);
                                  setShowStateList(false);
                                  setStateSearch("");
                                }}
                                color="white"
                                fontSize="sm"
                              >
                                {s.label}
                              </Box>
                            ))
                          ) : (
                            <Box p={3} color="whiteAlpha.500" fontSize="xs">No states found</Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Box w="full" position="relative">
                      <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">TOWN / CITY</Text>
                      <Box
                        bg="whiteAlpha.50"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        borderRadius="md"
                        p={2.5}
                        cursor={selectedState ? "pointer" : "not-allowed"}
                        onClick={() => selectedState && setShowCityList(!showCityList)}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        opacity={selectedState ? 1 : 0.5}
                      >
                        <Text color={selectedCity ? "white" : "whiteAlpha.500"} fontSize="sm">
                          {selectedCity ? selectedCity.label : selectedState ? "Select City" : "Select State first"}
                        </Text>
                        <ChevronDown size={16} color="gray" />
                      </Box>
                      
                      {showCityList && selectedState && (
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
                          <Box p={2} borderBottom="1px solid" borderColor="whiteAlpha.100" position="sticky" top={0} bg="#1a1a1a">
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
                          {filteredCities.map(c => (
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
                                  location: `${c.label}, ${selectedState.label}, ${selectedCountry.label}`
                                });
                              }}
                              color="white"
                              fontSize="sm"
                            >
                              {c.label}
                            </Box>
                          ))}
                          
                          {/* Custom City Option */}
                          {citySearch.trim() && !filteredCities.find(c => c.label.toLowerCase() === citySearch.trim().toLowerCase()) && (
                            <Box
                              p={2.5}
                              _hover={{ bg: "whiteAlpha.200" }}
                              cursor="pointer"
                              onClick={() => {
                                const customCity = citySearch.trim();
                                setSelectedCity({ label: customCity, value: customCity });
                                setShowCityList(false);
                                setCitySearch("");
                                setFormData({
                                  ...formData,
                                  location: `${customCity}, ${selectedState.label}, ${selectedCountry.label}`
                                });
                              }}
                              color="blue.400"
                              fontSize="sm"
                              borderTop="1px solid"
                              borderColor="whiteAlpha.100"
                            >
                              <HStack gap={2}>
                                <Plus size={14} />
                                <Text>Add "{citySearch.trim()}" as custom city</Text>
                              </HStack>
                            </Box>
                          )}
                          
                          {filteredCities.length === 0 && !citySearch.trim() && (
                            <Box p={3} color="whiteAlpha.500" fontSize="xs">No cities found. Type to add custom.</Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </VStack>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">ABOUT SUMMARY</Text>
                    <Textarea name="about" value={formData.about} onChange={handleChange} minH="150px" bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" _focus={{ borderColor: "blue.500" }} color="white" placeholder="Tell your professional story..." />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={8} bg="whiteAlpha.50">
                <Button bg="blue.500" color="white" w="full" size="lg" onClick={handleSubmit} isLoading={loading} _hover={{ bg: "blue.400" }} borderRadius="md">
                  Update Profile
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
