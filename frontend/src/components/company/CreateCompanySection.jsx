import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Flex,
  HStack,
  Input,
  Portal,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
  Badge,
} from "@chakra-ui/react";
import {
  Plus,
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  Link2,
  AtSign,
  Upload,
  X,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);

const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "media", label: "Media & Entertainment" },
  { value: "real_estate", label: "Real Estate" },
  { value: "consulting", label: "Consulting" },
  { value: "logistics", label: "Logistics & Supply Chain" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "other", label: "Other" },
];

const SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1000 employees" },
  { value: "1001+", label: "1001+ employees" },
];

const fieldStyle = {
  bg: "rgba(255,255,255,0.05)",
  color: "white",
  h: "11",
  borderRadius: "lg",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.12)",
  _focus: { borderColor: "var(--color-accent)", boxShadow: "0 0 0 2px rgba(66,153,225,0.25)" },
  _placeholder: { color: "rgba(255,255,255,0.25)" },
  fontSize: "sm",
  px: "4",
};

const labelStyle = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "10px",
  fontWeight: "black",
  letterSpacing: "widest",
  mb: "2",
};

const SelectField = ({ value, onChange, options, placeholder }) => (
  <Box
    as="select"
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: "rgba(255,255,255,0.05)",
      color: value ? "white" : "rgba(255,255,255,0.25)",
      height: "44px",
      borderRadius: "lg",
      border: "1px solid rgba(255,255,255,0.12)",
      fontSize: "14px",
      padding: "0 16px",
      width: "100%",
      outline: "none",
      cursor: "pointer",
      appearance: "none",
      WebkitAppearance: "none",
    }}
  >
    <option value="" disabled style={{ background: "#0f172a" }}>
      {placeholder}
    </option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value} style={{ background: "#0f172a", color: "white" }}>
        {opt.label}
      </option>
    ))}
  </Box>
);

const EMPTY_FORM = {
  name: "",
  tagline: "",
  description: "",
  industry: "",
  company_size: "",
  location: "",
  founded_year: "",
  website: "",
  linkedin_url: "",
  twitter_url: "",
};

const CreateCompanySection = ({ onCreated }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  const set = (field) => (val) => setForm((prev) => ({ ...prev, [field]: val }));
  const setE = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleOpen = () => {
    setForm(EMPTY_FORM);
    setLogoPreview(null);
    setLogoFile(null);
    setActiveTab("overview");
    setIsDialogOpen(true);
  };

  const handleClose = () => setIsDialogOpen(false);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setIsLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== "" && val !== null && val !== undefined) {
          data.append(key, val);
        }
      });
      if (logoFile) data.append("logo", logoFile);

      await api.post("companies/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      handleClose();
      if (onCreated) onCreated();
    } catch (err) {
      console.error("Error creating company.", err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "OVERVIEW", icon: Building2 },
    { id: "social", label: "SOCIAL", icon: Globe },
  ];

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
        onClick={handleOpen}
      >
        <Plus size={14} style={{ marginRight: "6px" }} /> CREATE ORGANIZATION
      </Button>

      {/* ─── Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={(e) => !e.open && handleClose()} size="xl">
        <Portal>
          <DialogBackdrop
            bg="rgba(0,0,0,0.85)"
            backdropFilter="blur(16px)"
            zIndex={99990}
          />
          <DialogPositioner
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={99995}
            p={4}
          >
            <DialogContent
              bg="transparent"
              border="none"
              boxShadow="none"
              maxW="700px"
              w="full"
              m="auto"
              overflow="visible"
            >
              <MotionBox
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                borderRadius="lg"
                overflow="hidden"
                border="1px solid rgba(255,255,255,0.1)"
                style={{
                  background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(20,30,55,0.97) 100%)",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
                {/* ─── Header ─── */}
                <Box
                  px={8}
                  py={6}
                  borderBottom="1px solid rgba(255,255,255,0.07)"
                  style={{
                    background: "linear-gradient(90deg, rgba(66,153,225,0.08) 0%, transparent 60%)",
                  }}
                >
                  <Flex align="center" justify="space-between">
                    <HStack gap={4}>
                      {/* Logo upload */}
                      <Box position="relative" flexShrink={0}>
                        <Box
                          w="56px"
                          h="56px"
                          borderRadius="lg"
                          border="2px dashed rgba(255,255,255,0.2)"
                          overflow="hidden"
                          cursor="pointer"
                          onClick={() => fileInputRef.current?.click()}
                          _hover={{ borderColor: "var(--color-accent)" }}
                          transition="all 0.2s"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          {logoPreview ? (
                            <Box
                              as="img"
                              src={logoPreview}
                              alt="logo"
                              w="full"
                              h="full"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <Flex w="full" h="full" align="center" justify="center" direction="column" gap={1}>
                              <Upload size={14} color="rgba(255,255,255,0.3)" />
                              <Text fontSize="7px" color="rgba(255,255,255,0.3)" fontWeight="black" letterSpacing="widest">
                                LOGO
                              </Text>
                            </Flex>
                          )}
                        </Box>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleLogoChange}
                        />
                      </Box>

                      <VStack align="start" gap={0}>
                        <Text color="white" fontWeight="black" fontSize="lg" letterSpacing="tight">
                          {form.name ? form.name.toUpperCase() : "NEW ORGANIZATION"}
                        </Text>
                        <Text color="rgba(255,255,255,0.35)" fontSize="xs" fontWeight="medium">
                          Click logo to upload · Fill details below
                        </Text>
                      </VStack>
                    </HStack>

                    <DialogCloseTrigger asChild>
                      <Box
                        as="button"
                        w="8"
                        h="8"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                        _hover={{ background: "rgba(255,255,255,0.12)" }}
                        transition="all 0.2s"
                        onClick={handleClose}
                      >
                        <X size={16} color="rgba(255,255,255,0.7)" />
                      </Box>
                    </DialogCloseTrigger>
                  </Flex>

                  {/* Tabs */}
                  <HStack gap={1} mt={5}>
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <Box
                          as="button"
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          px={4}
                          py={2}
                          borderRadius="lg"
                          transition="all 0.2s"
                          style={{
                            background: isActive ? "rgba(66,153,225,0.15)" : "transparent",
                            border: isActive ? "1px solid rgba(66,153,225,0.3)" : "1px solid transparent",
                          }}
                        >
                          <HStack gap={2}>
                            <Icon size={12} color={isActive ? "var(--color-accent)" : "rgba(255,255,255,0.4)"} />
                            <Text
                              fontSize="10px"
                              fontWeight="black"
                              letterSpacing="widest"
                              color={isActive ? "var(--color-accent)" : "rgba(255,255,255,0.4)"}
                            >
                              {tab.label}
                            </Text>
                          </HStack>
                        </Box>
                      );
                    })}
                  </HStack>
                </Box>

                {/* ─── Tab Body ─── */}
                <Box px={8} py={7} maxH="60vh" overflowY="auto">
                  <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                      <MotionBox
                        key="overview"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <VStack gap={5} align="stretch">
                          {/* Name & Tagline */}
                          <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                            <Box flex={1}>
                              <Text {...labelStyle}>LEGAL NAME *</Text>
                              <Input
                                {...fieldStyle}
                                value={form.name}
                                onChange={setE("name")}
                                placeholder="Ex: Future Horizons Inc."
                              />
                            </Box>
                            <Box flex={1}>
                              <Text {...labelStyle}>TAGLINE</Text>
                              <Input
                                {...fieldStyle}
                                value={form.tagline}
                                onChange={setE("tagline")}
                                placeholder="Short company motto..."
                              />
                            </Box>
                          </Flex>

                          {/* Description */}
                          <Box>
                            <Text {...labelStyle}>MISSION STATEMENT</Text>
                            <Box
                              as="textarea"
                              value={form.description}
                              onChange={setE("description")}
                              placeholder="Describe the company's purpose and what it does..."
                              rows={3}
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                color: "white",
                                borderRadius: "lg",
                                border: "1px solid rgba(255,255,255,0.12)",
                                fontSize: "14px",
                                padding: "12px 16px",
                                width: "100%",
                                outline: "none",
                                resize: "vertical",
                                fontFamily: "inherit",
                              }}
                            />
                          </Box>

                          {/* Industry & Size */}
                          <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                            <Box flex={1}>
                              <Text {...labelStyle}>INDUSTRY</Text>
                              <SelectField
                                value={form.industry}
                                onChange={set("industry")}
                                options={INDUSTRY_OPTIONS}
                                placeholder="Select industry..."
                              />
                            </Box>
                            <Box flex={1}>
                              <Text {...labelStyle}>COMPANY SIZE</Text>
                              <SelectField
                                value={form.company_size}
                                onChange={set("company_size")}
                                options={SIZE_OPTIONS}
                                placeholder="Select size..."
                              />
                            </Box>
                          </Flex>

                          {/* Location & Founded */}
                          <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                            <Box flex={1}>
                              <Text {...labelStyle}>HEADQUARTERS</Text>
                              <Box position="relative">
                                <Input
                                  {...fieldStyle}
                                  pl="10"
                                  value={form.location}
                                  onChange={setE("location")}
                                  placeholder="City, Country"
                                />
                                <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                  <MapPin size={14} color="rgba(255,255,255,0.3)" />
                                </Box>
                              </Box>
                            </Box>
                            <Box flex={1}>
                              <Text {...labelStyle}>FOUNDED YEAR</Text>
                              <Box position="relative">
                                <Input
                                  {...fieldStyle}
                                  pl="10"
                                  type="number"
                                  value={form.founded_year}
                                  onChange={setE("founded_year")}
                                  placeholder="e.g. 2020"
                                  min="1800"
                                  max={new Date().getFullYear()}
                                />
                                <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                  <Calendar size={14} color="rgba(255,255,255,0.3)" />
                                </Box>
                              </Box>
                            </Box>
                          </Flex>

                          {/* Website */}
                          <Box>
                            <Text {...labelStyle}>WEBSITE</Text>
                            <Box position="relative">
                              <Input
                                {...fieldStyle}
                                pl="10"
                                value={form.website}
                                onChange={setE("website")}
                                placeholder="https://yourcompany.com"
                              />
                              <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                <Globe size={14} color="rgba(255,255,255,0.3)" />
                              </Box>
                            </Box>
                          </Box>
                        </VStack>
                      </MotionBox>
                    )}

                    {activeTab === "social" && (
                      <MotionBox
                        key="social"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <VStack gap={6} align="stretch">
                          <Box
                            p={4}
                            borderRadius="lg"
                            border="1px solid rgba(255,255,255,0.06)"
                            style={{ background: "rgba(255,255,255,0.03)" }}
                          >
                            <Text color="rgba(255,255,255,0.3)" fontSize="xs" fontWeight="medium" textAlign="center">
                              Add social links to help people find and connect with your organization.
                            </Text>
                          </Box>

                          {/* LinkedIn */}
                          <Box>
                            <Text {...labelStyle}>LINKEDIN</Text>
                            <Box position="relative">
                              <Input
                                {...fieldStyle}
                                pl="10"
                                value={form.linkedin_url}
                                onChange={setE("linkedin_url")}
                                placeholder="https://linkedin.com/company/yourcompany"
                              />
                              <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                <Link2 size={14} color="rgba(66,153,225,0.6)" />
                              </Box>
                            </Box>
                          </Box>

                          {/* Twitter */}
                          <Box>
                            <Text {...labelStyle}>TWITTER / X</Text>
                            <Box position="relative">
                              <Input
                                {...fieldStyle}
                                pl="10"
                                value={form.twitter_url}
                                onChange={setE("twitter_url")}
                                placeholder="https://twitter.com/yourcompany"
                              />
                              <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                <AtSign size={14} color="rgba(100,200,255,0.6)" />
                              </Box>
                            </Box>
                          </Box>
                        </VStack>
                      </MotionBox>
                    )}
                  </AnimatePresence>
                </Box>

                {/* ─── Footer ─── */}
                <Flex
                  px={8}
                  py={5}
                  borderTop="1px solid rgba(255,255,255,0.07)"
                  justify="space-between"
                  align="center"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <Text color="rgba(255,255,255,0.2)" fontSize="xs" fontWeight="medium">
                    * Legal name is required
                  </Text>
                  <HStack gap={3}>
                    <Button
                      variant="ghost"
                      color="rgba(255,255,255,0.45)"
                      fontWeight="black"
                      fontSize="xs"
                      letterSpacing="widest"
                      h="10"
                      px={5}
                      borderRadius="lg"
                      _hover={{ color: "white", bg: "rgba(255,255,255,0.07)" }}
                      onClick={handleClose}
                    >
                      CANCEL
                    </Button>
                    <Button
                      h="10"
                      px={7}
                      borderRadius="lg"
                      fontWeight="black"
                      fontSize="xs"
                      letterSpacing="widest"
                      color="white"
                      loading={isLoading}
                      loadingText="CREATING..."
                      disabled={!form.name.trim()}
                      onClick={handleCreate}
                      style={{
                        background: form.name.trim()
                          ? "linear-gradient(135deg, var(--color-accent) 0%, rgba(100,150,255,0.9) 100%)"
                          : "rgba(255,255,255,0.1)",
                        boxShadow: form.name.trim() ? "0 4px 20px rgba(66,153,225,0.35)" : "none",
                      }}
                      _hover={{
                        transform: form.name.trim() ? "translateY(-1px)" : "none",
                        boxShadow: form.name.trim() ? "0 6px 25px rgba(66,153,225,0.5)" : "none",
                      }}
                      transition="all 0.2s"
                    >
                      <Save size={13} style={{ marginRight: "6px" }} />
                      ESTABLISH
                    </Button>
                  </HStack>
                </Flex>
              </MotionBox>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </Dialog>
    </Box>
  );
};

export default CreateCompanySection;
