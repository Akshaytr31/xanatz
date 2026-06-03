import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Circle,
  Image,
  Button,
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
  Input,
} from "@chakra-ui/react";
import { Camera, Edit2, MapPin, Globe, Briefcase, Search, ChevronDown } from "lucide-react";
import { Country, City } from "country-state-city";
import api, { backendUrl } from "../../api";

const ProfileHeader = ({ user, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    headline: user?.profile?.headline || "",
    location: user?.profile?.location || "",
    website: user?.profile?.website || "",
  });

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  const countries = Country.getAllCountries().map(c => ({
    label: c.name,
    value: c.isoCode
  }));

  const cities = selectedCountry 
    ? City.getCitiesOfCountry(selectedCountry.value).map(c => ({
        label: c.name,
        value: c.name
      }))
    : [];

  const filteredCountries = countries.filter(c => 
    c.label.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCities = cities.filter(c => 
    c.label.toLowerCase().includes(citySearch.toLowerCase())
  );

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
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
    >
      {/* Cover Image */}
      <Box h="200px" bg="whiteAlpha.200" position="relative">
        {user?.profile?.cover_image ? (
          <Image
            src={getImageUrl(user.profile.cover_image)}
            alt="Cover"
            w="full"
            h="full"
            objectFit="cover"
          />
        ) : (
          <Box w="full" h="full" bgGradient="linear(to-r, var(--color-accent), purple.600)" />
        )}
        <Box position="absolute" top="4" right="4">
          <IconButton
            as="label"
            htmlFor="cover-upload"
            aria-label="Upload cover image"
            variant="solid"
            bg="blackAlpha.600"
            color="white"
            borderRadius="full"
            cursor="pointer"
            _hover={{ bg: "blackAlpha.800" }}
          >
            <Camera size={18} />
          </IconButton>
          <input
            type="file"
            id="cover-upload"
            hidden
            onChange={(e) => handleImageUpload(e, "cover_image")}
          />
        </Box>
      </Box>

      {/* Profile Info */}
      <Box px={6} pb={6} position="relative">
        <Flex justify="space-between" align="flex-end" mt="-50px">
          <Box position="relative">
            <Circle
              size="150px"
              bg="var(--color-primary)"
              p="4px"
              position="relative"
            >
              <Circle size="full" bg="whiteAlpha.200" overflow="hidden">
                {user?.profile?.profile_picture ? (
                  <Image
                    src={getImageUrl(user.profile.profile_picture)}
                    alt="Profile"
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                ) : (
                  <Text fontSize="4xl" color="whiteAlpha.500">
                    {user?.first_name?.[0]}
                  </Text>
                )}
              </Circle>
              <Box position="absolute" bottom="2" right="2">
                <IconButton
                  as="label"
                  htmlFor="profile-upload"
                  aria-label="Upload profile picture"
                  variant="solid"
                  bg="var(--color-accent)"
                  color="white"
                  borderRadius="full"
                  cursor="pointer"
                  size="sm"
                  _hover={{ bg: "var(--color-accent)" }}
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
            </Circle>
          </Box>
          <IconButton
            aria-label="Edit intro"
            variant="ghost"
            color="whiteAlpha.700"
            _hover={{ color: "white", bg: "whiteAlpha.100" }}
            onClick={() => setIsDialogOpen(true)}
          >
            <Edit2 size={18} />
          </IconButton>
        </Flex>

        <VStack align="start" mt={4} gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="var(--color-text-primary)">
            {user?.first_name} {user?.last_name}
          </Text>
          <Text fontSize="md" color="whiteAlpha.800">
            {user?.profile?.headline || "Add a headline to your profile"}
          </Text>
          {user?.companies?.length > 0 && (
            <HStack color="var(--color-text-primary)" mt={1} fontSize="sm">
              <Briefcase size={14} />
              <Text fontWeight="medium">
                {user.companies.map((c) => c.name).join(", ")}
              </Text>
            </HStack>
          )}
          <HStack gap={4} mt={2}>
            {user?.profile?.location && (
              <HStack color="whiteAlpha.600" fontSize="sm">
                <MapPin size={14} />
                <Text>{user.profile.location}</Text>
              </HStack>
            )}
            {user?.profile?.website && (
              <HStack color="var(--color-accent)" fontSize="sm" cursor="pointer" as="a" href={user.profile.website} target="_blank">
                <Globe size={14} />
                <Text>Website</Text>
              </HStack>
            )}
          </HStack>
          
          <HStack mt={4} gap={3}>
            <Button bg="var(--color-accent)" color="white" borderRadius="full" size="sm" _hover={{ bg: "var(--color-accent)" }}>
              Open to
            </Button>
            <Button variant="outline" borderColor="var(--color-accent)" color="var(--color-accent)" borderRadius="full" size="sm" _hover={{ bg: "var(--color-accent)", color: "white" }}>
              Add profile section
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Edit Modal (using Dialog) */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
        size="md"
      >
        <Portal>
          <DialogBackdrop bg="blackAlpha.800" backdropFilter="blur(10px)" zIndex={99999} />
          <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
            <DialogContent bg="var(--color-primary)" border="1px solid" borderColor="whiteAlpha.300" borderRadius="xl" maxW="500px" m="auto">
              <DialogHeader color="white" py={5}>Edit Intro</DialogHeader>
              <DialogCloseTrigger color="whiteAlpha.600" top={4} right={4} />
              <DialogBody p={6}>
                <VStack gap={4}>
                  <HStack w="full" gap={4}>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.700" fontSize="sm">First Name</Text>
                      <Input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        bg="whiteAlpha.100"
                        color="white"
                      />
                    </Box>
                    <Box flex="1">
                      <Text mb={2} color="whiteAlpha.700" fontSize="sm">Last Name</Text>
                      <Input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        bg="whiteAlpha.100"
                        color="white"
                      />
                    </Box>
                  </HStack>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Headline</Text>
                    <Input
                      name="headline"
                      value={formData.headline}
                      onChange={handleChange}
                      placeholder="e.g. Senior Software Engineer at Xanatz"
                      bg="whiteAlpha.100"
                      color="white"
                    />
                  </Box>
                  <VStack w="full" gap={4} align="stretch">
                    <Box w="full" position="relative">
                      <Text mb={2} color="whiteAlpha.700" fontSize="sm">Country</Text>
                      <Box
                        bg="whiteAlpha.100"
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
                        <Text color={selectedCountry ? "white" : "whiteAlpha.500"}>
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
                      <Text mb={2} color="whiteAlpha.700" fontSize="sm">Town / City</Text>
                      <Box
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        borderRadius="md"
                        p={2.5}
                        cursor={selectedCountry ? "pointer" : "not-allowed"}
                        onClick={() => selectedCountry && setShowCityList(!showCityList)}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        opacity={selectedCountry ? 1 : 0.5}
                      >
                        <Text color={selectedCity ? "white" : "whiteAlpha.500"}>
                          {selectedCity ? selectedCity.label : selectedCountry ? "Select City" : "Select Country first"}
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
                          {filteredCities.length > 0 ? (
                            filteredCities.map(c => (
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
                                    location: `${c.label}, ${selectedCountry.label}`
                                  });
                                }}
                                color="white"
                                fontSize="sm"
                              >
                                {c.label}
                              </Box>
                            ))
                          ) : (
                            <Box p={3} color="whiteAlpha.500" fontSize="xs">No cities found</Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </VStack>
                  <Box w="full">
                    <Text mb={2} color="whiteAlpha.700" fontSize="sm">Website</Text>
                    <Input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      bg="whiteAlpha.100"
                      color="white"
                    />
                  </Box>
                </VStack>
              </DialogBody>
              <DialogFooter p={6}>
                <Button
                  bg="var(--color-accent)"
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

export default ProfileHeader;
