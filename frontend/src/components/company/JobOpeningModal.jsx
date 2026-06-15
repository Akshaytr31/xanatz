import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Portal,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  AlignLeft,
  Settings,
  X,
  Save,
  ChevronDown,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);

const JOB_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

export const CATEGORY_OPTIONS = [
  { value: "professional_services", label: "Professional Services" },
  { value: "retail_shopping", label: "Retail & Shopping" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "health_beauty", label: "Health & Beauty" },
  { value: "automotive_transportation", label: "Automotive & Transportation" },
  { value: "home_construction", label: "Home & Construction" },
  { value: "education", label: "Education" },
  { value: "banking_insurance", label: "Banking & Insurance" },
  { value: "information_technology", label: "Information Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "distributors_wholesalers", label: "Distributors & Wholesalers" },
  { value: "services", label: "Services" }
];

export const SUBCATEGORY_OPTIONS = {
  professional_services: [
    { value: "accountants", label: "Accountants" },
    { value: "consultants", label: "Consultants" },
    { value: "lawyers", label: "Lawyers" },
    { value: "realtors", label: "Realtors" },
    { value: "photographers", label: "Photographers" },
    { value: "it_services", label: "IT Services" },
    { value: "advertising_agencies", label: "Advertising Agencies" },
    { value: "typing_center", label: "Typing Center" },
    { value: "government_services", label: "Government Services" },
    { value: "others", label: "Others" }
  ],
  retail_shopping: [
    { value: "clothing_stores", label: "Clothing Stores" },
    { value: "furniture_shops", label: "Furniture Shops" },
    { value: "bookstores", label: "Bookstores" },
    { value: "electronics_retailers", label: "Electronics Retailers" },
    { value: "grocery_stores", label: "Grocery Stores" },
    { value: "pet_shops", label: "Pet Shops" },
    { value: "leasing_company", label: "Leasing Company" },
    { value: "textile_apparel", label: "Textile and Apparel" },
    { value: "general_trading", label: "General Trading company" },
    { value: "others", label: "Others" }
  ],
  food_beverage: [
    { value: "restaurants", label: "Restaurants" },
    { value: "cafes", label: "Cafes" },
    { value: "bakeries", label: "Bakeries" },
    { value: "bars", label: "Bars" },
    { value: "catering_services", label: "Catering Services" },
    { value: "food_delivery", label: "Food Delivery" },
    { value: "others", label: "Others" }
  ],
  health_beauty: [
    { value: "hospitals", label: "Hospitals" },
    { value: "clinics", label: "Clinics" },
    { value: "laboratory", label: "Laboratory" },
    { value: "gyms", label: "Gyms" },
    { value: "salons", label: "Salons" },
    { value: "spas", label: "Spas" },
    { value: "pharmacies", label: "Pharmacies" },
    { value: "dentist", label: "Dentist" },
    { value: "others", label: "Others" }
  ],
  automotive_transportation: [
    { value: "car_dealers", label: "Car Dealers" },
    { value: "repair_shops", label: "Repair Shops" },
    { value: "car_washes", label: "Car Washes" },
    { value: "transporter", label: "Transporter" },
    { value: "rent_car", label: "Rent a car" },
    { value: "detailing", label: "Detailing" },
    { value: "tyre", label: "Tyre" },
    { value: "others", label: "Others" }
  ],
  home_construction: [
    { value: "contractors", label: "Contractors" },
    { value: "electricians", label: "Electricians" },
    { value: "plumbers", label: "Plumbers" },
    { value: "landscapers", label: "Landscapers" },
    { value: "furniture_dealers", label: "Furniture Dealers" },
    { value: "interior_work", label: "Interior work" },
    { value: "others", label: "Other" }
  ],
  education: [
    { value: "schools", label: "Schools" },
    { value: "colleges", label: "Colleges" },
    { value: "coaching_centers", label: "Coaching Centers" },
    { value: "vocational_training", label: "Vocational Training" },
    { value: "others", label: "Others" }
  ],
  banking_insurance: [
    { value: "banks", label: "Banks" },
    { value: "financial_institutes", label: "Financial Institutes" },
    { value: "insurance_companies", label: "Insurance Companies" },
    { value: "traders", label: "Traders" },
    { value: "exchanges_brokers", label: "Exchanges & Brokers" },
    { value: "others", label: "Others" }
  ],
  information_technology: [
    { value: "it", label: "IT" },
    { value: "it_services", label: "IT Services" },
    { value: "apps", label: "Apps" },
    { value: "ai", label: "AI" },
    { value: "cctv", label: "CCTV" },
    { value: "digital_services", label: "Digital Services" },
    { value: "erp_solutions", label: "ERP Solutions" },
    { value: "others", label: "Others" }
  ],
  manufacturing: [
    { value: "metal_fabrication", label: "Metal & Fabrication" },
    { value: "tools_machinery", label: "Tools & machinery" },
    { value: "chemical_pharmaceutical", label: "Chemical & Pharmaceutical" },
    { value: "wood_paper_printing", label: "Wood paper printing" },
    { value: "textile_apparel", label: "Textile and Apparel" },
    { value: "light_manufacturing", label: "Light Manufacturing" },
    { value: "heavy_manufacturing", label: "Heavy Manufacturing" },
    { value: "minerals_metallics", label: "Minerals and Metallics" },
    { value: "electronic", label: "Electronic" },
    { value: "electrical", label: "Electrical" },
    { value: "food_consumable", label: "Food and Consumable" },
    { value: "others", label: "Others" }
  ],
  distributors_wholesalers: [
    { value: "electronics_technologies", label: "Electronics & Technologies" },
    { value: "health_medical", label: "Health & medical" },
    { value: "construction_industrial", label: "Construction and Industrial" },
    { value: "fashion_beauty", label: "Fashion & Beauty" },
    { value: "automotive", label: "Automotive" },
    { value: "others", label: "Others" }
  ],
  services: [
    { value: "other_services", label: "Other Services" }
  ]
};

export const ALL_CATEGORY_LABELS = {
  professional_services: "Professional Services",
  retail_shopping: "Retail & Shopping",
  food_beverage: "Food & Beverage",
  health_beauty: "Health & Beauty",
  automotive_transportation: "Automotive & Transportation",
  home_construction: "Home & Construction",
  education: "Education",
  banking_insurance: "Banking & Insurance",
  information_technology: "Information Technology",
  manufacturing: "Manufacturing",
  distributors_wholesalers: "Distributors & Wholesalers",
  services: "Services",
};

export const ALL_SUBCATEGORY_LABELS = {
  accountants: "Accountants",
  consultants: "Consultants",
  lawyers: "Lawyers",
  realtors: "Realtors",
  photographers: "Photographers",
  it_services: "IT Services",
  advertising_agencies: "Advertising Agencies",
  typing_center: "Typing Center",
  government_services: "Government Services",
  clothing_stores: "Clothing Stores",
  furniture_shops: "Furniture Shops",
  bookstores: "Bookstores",
  electronics_retailers: "Electronics Retailers",
  grocery_stores: "Grocery Stores",
  pet_shops: "Pet Shops",
  leasing_company: "Leasing Company",
  textile_apparel: "Textile and Apparel",
  general_trading: "General Trading company",
  restaurants: "Restaurants",
  cafes: "Cafes",
  bakeries: "Bakeries",
  bars: "Bars",
  catering_services: "Catering Services",
  food_delivery: "Food Delivery",
  hospitals: "Hospitals",
  clinics: "Clinics",
  laboratory: "Laboratory",
  gyms: "Gyms",
  salons: "Salons",
  spas: "Spas",
  pharmacies: "Pharmacies",
  dentist: "Dentist",
  car_dealers: "Car Dealers",
  repair_shops: "Repair Shops",
  car_washes: "Car Washes",
  transporter: "Transporter",
  rent_car: "Rent a car",
  detailing: "Detailing",
  tyre: "Tyre",
  contractors: "Contractors",
  electricians: "Electricians",
  plumbers: "Plumbers",
  landscapers: "Landscapers",
  furniture_dealers: "Furniture Dealers",
  interior_work: "Interior work",
  schools: "Schools",
  colleges: "Colleges",
  coaching_centers: "Coaching Centers",
  vocational_training: "Vocational Training",
  banks: "Banks",
  financial_institutes: "Financial Institutes",
  insurance_companies: "Insurance Companies",
  traders: "Traders",
  exchanges_brokers: "Exchanges & Brokers",
  it: "IT",
  apps: "Apps",
  ai: "AI",
  cctv: "CCTV",
  digital_services: "Digital Services",
  erp_solutions: "ERP Solutions",
  metal_fabrication: "Metal & Fabrication",
  tools_machinery: "Tools & machinery",
  chemical_pharmaceutical: "Chemical & Pharmaceutical",
  wood_paper_printing: "Wood paper printing",
  light_manufacturing: "Light Manufacturing",
  heavy_manufacturing: "Heavy Manufacturing",
  minerals_metallics: "Minerals and Metallics",
  electronic: "Electronic",
  electrical: "Electrical",
  food_consumable: "Food and Consumable",
  electronics_technologies: "Electronics & Technologies",
  health_medical: "Health & medical",
  construction_industrial: "Construction and Industrial",
  fashion_beauty: "Fashion & Beauty",
  automotive: "Automotive",
  other_services: "Other Services",
  others: "Others",
};

export const INDUSTRY_LABELS = {
  technology: "Technology",
  finance: "Finance",
  healthcare: "Healthcare",
  education: "Education",
  retail: "Retail & E-commerce",
  manufacturing: "Manufacturing",
  media: "Media & Entertainment",
  real_estate: "Real Estate",
  consulting: "Consulting",
  logistics: "Logistics & Supply Chain",
  hospitality: "Hospitality & Tourism",
  energy: "Energy & Utilities",
  other: "Other",
};

const fieldStyle = {
  bg: "var(--color-glass)",
  color: "white",
  h: "11",
  borderRadius: "lg",
  border: "1px solid",
  borderColor: "var(--color-card-border)",
  _focus: { borderColor: "var(--color-accent)", boxShadow: "0 0 0 2px rgba(205,36,38,0.25)" },
  _placeholder: { color: "var(--color-card-border)" },
  fontSize: "sm",
  px: "4",
};

const labelStyle = {
  color: "var(--color-text-muted)",
  fontSize: "10px",
  fontWeight: "black",
  letterSpacing: "widest",
  mb: "2",
};

export const SearchableSelect = ({ value, onChange, options, placeholder, isDisabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box ref={containerRef} position="relative" w="full">
      <Box
        as="button"
        type="button"
        disabled={isDisabled}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        style={{
          background: "var(--color-glass)",
          color: selectedOption ? "white" : "var(--color-card-border)",
          height: "44px",
          borderRadius: "8px",
          border: "1px solid var(--color-card-border)",
          fontSize: "14px",
          padding: "0 16px",
          width: "100%",
          textAlign: "left",
          outline: "none",
          cursor: isDisabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: isDisabled ? 0.5 : 1
        }}
      >
        <Text noOfLines={1} style={{ fontSize: "14px" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={16} style={{ opacity: 0.5 }} />
      </Box>

      <AnimatePresence>
        {isOpen && (
          <Box
            position="absolute"
            top="105%"
            left="0"
            right="0"
            zIndex={1000}
            borderRadius="lg"
            border="1px solid var(--color-card-border)"
            p={2}
            style={{
              background: "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(20,30,55,0.98) 100%)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              backdropFilter: "blur(20px)"
            }}
          >
            {/* Search Input */}
            <Box mb={2}>
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
                bg="var(--color-card-hover-bg)"
                color="white"
                borderColor="var(--color-card-border)"
                _hover={{ borderColor: "var(--color-card-border)" }}
                _focus={{ borderColor: "var(--color-accent)", boxShadow: "0 0 0 1px var(--color-accent)" }}
                borderRadius="md"
                autoFocus
                height="32px"
                fontSize="12px"
                px={3}
              />
            </Box>

            {/* Options List */}
            <Box maxH="200px" overflowY="auto">
              {filteredOptions.length === 0 ? (
                <Box py={2} px={3}>
                  <Text color="var(--color-text-muted)" fontSize="xs" textAlign="center">
                    No options found
                  </Text>
                </Box>
              ) : (
                filteredOptions.map((opt) => (
                  <Box
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    py={2}
                    px={3}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "rgba(205,36,38,0.15)", color: "white" }}
                    bg={opt.value === value ? "rgba(205,36,38,0.1)" : "transparent"}
                    color={opt.value === value ? "var(--color-accent)" : "var(--color-text-primary)"}
                    transition="all 0.15s"
                  >
                    <Text fontSize="xs" fontWeight={opt.value === value ? "bold" : "normal"}>
                      {opt.label}
                    </Text>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

const SelectField = ({ value, onChange, options, placeholder }) => (
  <Box
    as="select"
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: "var(--color-glass)",
      color: value ? "white" : "var(--color-card-border)",
      height: "44px",
      borderRadius: "lg",
      border: "1px solid var(--color-card-border)",
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

const JobOpeningModal = ({ isOpen, onClose, companyId, company, job, onSaved, onCreditExhausted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({
    title: "",
    job_type: "full_time",
    location: "",
    salary_range: "",
    description: "",
    requirements: "",
    is_active: true,
  });

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || "",
        job_type: job.job_type || "full_time",
        location: job.location || "",
        salary_range: job.salary_range || "",
        description: job.description || "",
        requirements: job.requirements || "",
        is_active: job.is_active !== undefined ? job.is_active : true,
      });
    } else {
      setForm({
        title: "",
        job_type: "full_time",
        location: "",
        salary_range: "",
        description: "",
        requirements: "",
        is_active: true,
      });
    }
  }, [job, isOpen]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setIsLoading(true);
    setSaveError("");
    try {
      const payload = {
        ...form,
        company: companyId,
      };

      if (job) {
        await api.put(`jobs/${job.id}/`, payload);
      } else {
        await api.post("jobs/", payload);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving job opening.", err);
      const errorData = err.response?.data;
      const errorMsg = errorData?.error 
        ? (Array.isArray(errorData.error) ? errorData.error[0] : errorData.error) 
        : "";
      
      if (errorMsg && (errorMsg.includes("credits exhausted") || errorMsg.includes("No active plan"))) {
        if (onCreditExhausted) {
          onClose();
          onCreditExhausted();
        } else {
          setSaveError(errorMsg);
        }
      } else if (errorMsg) {
        setSaveError(errorMsg);
      } else {
        setSaveError("Failed to save job opening. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field) => (val) => setForm((prev) => ({ ...prev, [field]: val }));
  const setE = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Dialog open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
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
            maxW="650px"
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
              border="1px solid var(--color-card-border)"
              style={{
                background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(20,30,55,0.97) 100%)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px var(--color-glass)",
              }}
            >
              {/* ─── Header ─── */}
              <Box
                px={8}
                py={6}
                borderBottom="1px solid var(--color-card-border)"
                style={{
                  background: "linear-gradient(90deg, rgba(205,36,38,0.08) 0%, transparent 60%)",
                }}
              >
                <Flex align="center" justify="space-between">
                  <HStack gap={4}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{ background: "rgba(205,36,38,0.15)", border: "1px solid rgba(205,36,38,0.3)" }}
                    >
                      <Briefcase size={20} color="var(--color-accent)" />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text color="var(--color-text-primary)" fontWeight="black" fontSize="lg" letterSpacing="tight">
                        {job ? "EDIT JOB OPENING" : "ADD JOB OPENING"}
                      </Text>
                      <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="medium">
                        Post an employment opportunity for this company
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
                      style={{ background: "var(--color-card-border)" }}
                      _hover={{ background: "var(--color-card-border)" }}
                      transition="all 0.2s"
                      onClick={onClose}
                    >
                      <X size={16} color="var(--color-text-secondary)" />
                    </Box>
                  </DialogCloseTrigger>
                </Flex>
              </Box>

              {/* Credit info banner for new jobs */}
              {!job && company?.active_subscription && (
                <Box
                  px={8}
                  py={3}
                  borderBottom="1px solid var(--color-card-border)"
                  style={{ background: "rgba(59,130,246,0.05)" }}
                >
                  <HStack gap={2} justify="center">
                    <CreditCard size={13} color="#3b82f6" />
                    <Text fontSize="xs" fontWeight="bold" color="#3b82f6">
                      {company.active_subscription.jobs_remaining} credit{company.active_subscription.jobs_remaining !== 1 ? 's' : ''} remaining
                    </Text>
                    <Text fontSize="2xs" color="var(--color-text-muted)">•</Text>
                    <Text fontSize="2xs" color="var(--color-text-muted)" fontWeight="bold">
                      {company.active_subscription.plan_display_name} Plan — {company.active_subscription.job_duration_days} day duration
                    </Text>
                  </HStack>
                </Box>
              )}

              {/* Error banner */}
              {saveError && (
                <Box
                  px={8}
                  py={3}
                  borderBottom="1px solid rgba(239,68,68,0.2)"
                  style={{ background: "rgba(239,68,68,0.08)" }}
                >
                  <HStack gap={2} justify="center">
                    <AlertTriangle size={13} color="#ef4444" />
                    <Text fontSize="xs" fontWeight="bold" color="#ef4444">
                      {saveError}
                    </Text>
                  </HStack>
                </Box>
              )}

              {/* ─── Body ─── */}
              <Box px={8} py={7} maxH="60vh" overflowY="auto">
                <VStack gap={5} align="stretch">
                  {/* Title & Job Type */}
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={2}>
                      <Text {...labelStyle}>JOB TITLE *</Text>
                      <Input
                        {...fieldStyle}
                        value={form.title}
                        onChange={setE("title")}
                        placeholder="Ex: Senior React Developer"
                      />
                    </Box>
                    <Box flex={1}>
                      <Text {...labelStyle}>JOB TYPE</Text>
                      <SelectField
                        value={form.job_type}
                        onChange={set("job_type")}
                        options={JOB_TYPE_OPTIONS}
                        placeholder="Select type..."
                      />
                    </Box>
                  </Flex>


                  {/* Location & Salary */}
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={1}>
                      <Text {...labelStyle}>LOCATION</Text>
                      <Box position="relative">
                        <Input
                          {...fieldStyle}
                          pl="10"
                          value={form.location}
                          onChange={setE("location")}
                          placeholder="Ex: Remote or San Francisco, CA"
                        />
                        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                          <MapPin size={14} color="var(--color-text-muted)" />
                        </Box>
                      </Box>
                    </Box>
                    <Box flex={1}>
                      <Text {...labelStyle}>SALARY RANGE</Text>
                      <Box position="relative">
                        <Input
                          {...fieldStyle}
                          pl="10"
                          value={form.salary_range}
                          onChange={setE("salary_range")}
                          placeholder="Ex: $120k - $150k"
                        />
                        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" pointerEvents="none">
                          <DollarSign size={14} color="var(--color-text-muted)" />
                        </Box>
                      </Box>
                    </Box>
                  </Flex>

                  {/* Description */}
                  <Box>
                    <Text {...labelStyle}>DESCRIPTION *</Text>
                    <Box
                      as="textarea"
                      value={form.description}
                      onChange={setE("description")}
                      placeholder="Detail the responsibilities, project scope, and daily tasks..."
                      rows={4}
                      style={{
                        background: "var(--color-glass)",
                        color: "white",
                        borderRadius: "lg",
                        border: "1px solid var(--color-card-border)",
                        fontSize: "14px",
                        padding: "12px 16px",
                        width: "100%",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </Box>

                  {/* Requirements */}
                  <Box>
                    <Text {...labelStyle}>REQUIREMENTS & SKILLS</Text>
                    <Box
                      as="textarea"
                      value={form.requirements}
                      onChange={setE("requirements")}
                      placeholder="List required experience, languages, frameworks, or certifications..."
                      rows={3}
                      style={{
                        background: "var(--color-glass)",
                        color: "white",
                        borderRadius: "lg",
                        border: "1px solid var(--color-card-border)",
                        fontSize: "14px",
                        padding: "12px 16px",
                        width: "100%",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </Box>

                  {/* Active Status Select */}
                  {job && (
                    <Box>
                      <Text {...labelStyle}>STATUS</Text>
                      <SelectField
                        value={form.is_active ? "true" : "false"}
                        onChange={(val) => set("is_active")(val === "true")}
                        options={[
                          { value: "true", label: "Active (Visible)" },
                          { value: "false", label: "Inactive (Hidden)" },
                        ]}
                        placeholder="Select status..."
                      />
                    </Box>
                  )}
                </VStack>
              </Box>

              {/* ─── Footer ─── */}
              <Flex
                px={8}
                py={5}
                borderTop="1px solid var(--color-card-border)"
                justify="space-between"
                align="center"
                style={{ background: "var(--color-glass)" }}
              >
                <Text color="var(--color-card-border)" fontSize="xs" fontWeight="medium">
                  Provide descriptive information to attract candidates
                </Text>
                <HStack gap={3}>
                  <Button
                    variant="ghost"
                    color="var(--color-text-muted)"
                    fontWeight="black"
                    fontSize="xs"
                    letterSpacing="widest"
                    h="10"
                    px={5}
                    borderRadius="lg"
                    _hover={{ color: "white", bg: "var(--color-card-border)" }}
                    onClick={onClose}
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
                    loadingText="SAVING..."
                    onClick={handleSave}
                    disabled={!form.title.trim()}
                    style={{
                      background: "linear-gradient(135deg, var(--color-accent) 0%, rgba(139,92,246,0.8) 100%)",
                      boxShadow: "0 4px 20px rgba(205,36,38,0.35)",
                    }}
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 25px rgba(205,36,38,0.5)",
                    }}
                    transition="all 0.2s"
                  >
                    <Save size={13} style={{ marginRight: "6px" }} />
                    {job ? "UPDATE JOB" : "POST JOB"}
                  </Button>
                </HStack>
              </Flex>
            </MotionBox>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog>
  );
};

export default JobOpeningModal;
