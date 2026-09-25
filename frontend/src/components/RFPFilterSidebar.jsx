import React, { useState, useEffect, useRef } from "react";
import { Flex, Box, Text, Button, VStack, HStack, Input, Badge } from "@chakra-ui/react";
import {
  SlidersHorizontal, ChevronDown, Search, X, RotateCcw, Check,
  TrendingUp, Layers, DollarSign, Building2, Calendar, Clock, Filter, ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_OPTIONS } from "./company/JobOpeningModal";

/* ─── Premium Animated Custom Dropdown Component ─────────────────────────── */
const CustomDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  icon: Icon = Filter,
  searchable = false,
  accentColor = "#8b5cf6"
}) => {
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
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <VStack align="stretch" gap={1.5} w="full" ref={containerRef} position="relative">
      {label && (
        <HStack gap={1.5}>
          {Icon && <Icon size={12} color={accentColor} />}
          <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest">
            {label.toUpperCase()}
          </Text>
        </HStack>
      )}

      {/* Button Trigger */}
      <Box
        as="button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        w="full"
        h="42px"
        px={3.5}
        borderRadius="xl"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        outline="none"
        cursor="pointer"
        style={{
          background: selectedOption
            ? "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(30,41,59,0.8) 100%)"
            : "var(--color-glass)",
          border: selectedOption
            ? `1px solid ${accentColor}66`
            : "1px solid var(--color-card-border)",
          boxShadow: isOpen ? `0 0 16px ${accentColor}33` : "none",
        }}
        _hover={{
          borderColor: accentColor,
          background: selectedOption
            ? "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(30,41,59,0.9) 100%)"
            : "var(--color-card-hover-bg)",
        }}
        transition="all 0.2s cubic-bezier(0.4,0,0.2,1)"
      >
        <HStack gap={2.5} flex={1} overflow="hidden">
          <Text
            fontSize="xs"
            fontWeight={selectedOption ? "bold" : "medium"}
            color={selectedOption ? "white" : "var(--color-text-muted)"}
            noOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </HStack>

        <ChevronDown
          size={14}
          color={selectedOption ? accentColor : "var(--color-text-secondary)"}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            flexShrink: 0,
            marginLeft: "8px",
          }}
        />
      </Box>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "108%",
              left: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            <Box
              borderRadius="xl"
              border={`1px solid ${accentColor}44`}
              p={2}
              style={{
                background: "linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(20,30,55,0.98) 100%)",
                boxShadow: "0 20px 45px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
                backdropFilter: "blur(24px)",
              }}
            >
              {/* Optional Search Input */}
              {searchable && (
                <Box mb={2} position="relative" display="flex" alignItems="center">
                  <Input
                    placeholder="Search options..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="sm"
                    bg="rgba(255,255,255,0.06)"
                    color="white"
                    borderColor="var(--color-card-border)"
                    _hover={{ borderColor: accentColor }}
                    _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                    borderRadius="lg"
                    autoFocus
                    height="32px"
                    fontSize="xs"
                    pl="8"
                  />
                  <Box position="absolute" left="2.5" pointerEvents="none" color="var(--color-text-muted)">
                    <Search size={13} />
                  </Box>
                </Box>
              )}

              {/* Options Scroll Container */}
              <Box
                maxH="200px"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": { width: "4px" },
                  "&::-webkit-scrollbar-thumb": { background: `${accentColor}44`, borderRadius: "4px" },
                }}
              >
                {/* Default "All" option if placeholder exists */}
                <Box
                  onClick={() => {
                    onChange("");
                    setIsOpen(false);
                  }}
                  py={2}
                  px={3}
                  borderRadius="lg"
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  bg={!value ? `${accentColor}22` : "transparent"}
                  color={!value ? accentColor : "var(--color-text-muted)"}
                  _hover={{ bg: `${accentColor}18`, color: "white" }}
                  transition="all 0.15s"
                  mb={1}
                >
                  <Text fontSize="xs" fontWeight={!value ? "bold" : "normal"}>
                    {placeholder}
                  </Text>
                  {!value && <Check size={14} color={accentColor} />}
                </Box>

                {filteredOptions.length === 0 ? (
                  <Box py={3} px={3}>
                    <Text color="var(--color-text-muted)" fontSize="xs" textAlign="center">
                      No matching options
                    </Text>
                  </Box>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <Box
                        key={opt.value}
                        onClick={() => {
                          onChange(opt.value);
                          setIsOpen(false);
                        }}
                        py={2}
                        px={3}
                        borderRadius="lg"
                        cursor="pointer"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        bg={isSelected ? `${accentColor}25` : "transparent"}
                        color={isSelected ? "white" : "var(--color-text-primary)"}
                        _hover={{ bg: `${accentColor}18`, color: "white" }}
                        transition="all 0.15s"
                        mb={1}
                      >
                        <Text fontSize="xs" fontWeight={isSelected ? "bold" : "normal"} noOfLines={1}>
                          {opt.label}
                        </Text>
                        {isSelected && <Check size={14} color={accentColor} />}
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </VStack>
  );
};

/* ─── Options Constants ─────────────────────────────────────────────────── */
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "budget-high", label: "Budget: High to Low" },
  { value: "budget-low", label: "Budget: Low to High" },
  { value: "deadline-soon", label: "Deadline: Soonest" },
];

const budgetOptions = [
  { value: "under-10k", label: "Under AED 10,000" },
  { value: "10k-50k", label: "AED 10,000 - 50,000" },
  { value: "50k-100k", label: "AED 50,000 - 100,000" },
  { value: "over-100k", label: "Over AED 100,000" },
];

const dateOptions = [
  { value: "past-24h", label: "Past 24 Hours" },
  { value: "past-week", label: "Past Week" },
  { value: "past-month", label: "Past Month" },
];

/* ─── Sidebar Content Component ─────────────────────────────────────────── */
const RFPFilterSidebarContent = ({
  selectedSort,
  setSelectedSort,
  selectedCategory,
  setSelectedCategory,
  selectedBudget,
  setSelectedBudget,
  selectedOwner,
  setSelectedOwner,
  selectedDatePosted,
  setSelectedDatePosted,
  searchQuery,
  onResetFilters,
  companyOptions = [],
  accentColor = "#8b5cf6",
  activeCount = 0,
  onCloseMobile,
}) => {
  const isAnyFilterActive =
    selectedCategory ||
    selectedBudget ||
    selectedOwner ||
    selectedDatePosted ||
    searchQuery ||
    (selectedSort && selectedSort !== "newest");

  return (
    <Box
      borderRadius="2xl"
      border={`1px solid ${accentColor}33`}
      p={5}
      style={{
        background: "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(20,30,55,0.95) 100%)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Sidebar Header */}
      <Flex justify="space-between" align="center" mb={5}>
        <HStack gap={2.5}>
          <Box
            w="34px"
            h="34px"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
              background: `${accentColor}20`,
              border: `1px solid ${accentColor}44`,
            }}
          >
            <SlidersHorizontal size={16} color={accentColor} />
          </Box>
          <VStack align="start" gap={0}>
            <HStack gap={1.5}>
              <Text color="white" fontWeight="black" fontSize="sm" letterSpacing="tight">
                Filter Tenders
              </Text>
              {activeCount > 0 && (
                <Badge
                  px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="black"
                  bg={accentColor} color="white"
                >
                  {activeCount}
                </Badge>
              )}
            </HStack>
          </VStack>
        </HStack>

        <HStack gap={2}>
          {isAnyFilterActive && (
            <Button
              variant="ghost"
              size="xs"
              color="var(--color-text-muted)"
              fontWeight="bold"
              fontSize="11px"
              h="7"
              px={2.5}
              borderRadius="lg"
              _hover={{ color: accentColor, bg: `${accentColor}18` }}
              onClick={onResetFilters}
              display="flex"
              alignItems="center"
              gap={1}
            >
              <RotateCcw size={12} />
              Reset
            </Button>
          )}

          {onCloseMobile && (
            <Box
              as="button"
              onClick={onCloseMobile}
              w="7"
              h="7"
              borderRadius="lg"
              display={{ base: "flex", lg: "none" }}
              alignItems="center"
              justifyContent="center"
              bg="var(--color-card-border)"
              color="white"
            >
              <X size={14} />
            </Box>
          )}
        </HStack>
      </Flex>

      {/* Filter Dropdowns List */}
      <VStack align="stretch" gap={4.5}>
        {/* Sort By */}
        <CustomDropdown
          label="Sort By"
          value={selectedSort}
          onChange={setSelectedSort}
          options={sortOptions}
          placeholder="Newest First"
          icon={ArrowUpDown}
          accentColor={accentColor}
        />

        {/* Category */}
        <CustomDropdown
          label="Category"
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={CATEGORY_OPTIONS}
          placeholder="All Categories"
          icon={Layers}
          searchable={true}
          accentColor={accentColor}
        />

        {/* Budget Range */}
        <CustomDropdown
          label="Budget Range"
          value={selectedBudget}
          onChange={setSelectedBudget}
          options={budgetOptions}
          placeholder="All Budgets"
          icon={DollarSign}
          accentColor={accentColor}
        />

        {/* Published By Company */}
        <CustomDropdown
          label="Published By"
          value={selectedOwner}
          onChange={setSelectedOwner}
          options={companyOptions}
          placeholder="All Companies"
          icon={Building2}
          searchable={true}
          accentColor={accentColor}
        />

        {/* Date Posted */}
        <CustomDropdown
          label="Date Posted"
          value={selectedDatePosted}
          onChange={setSelectedDatePosted}
          options={dateOptions}
          placeholder="Anytime"
          icon={Calendar}
          accentColor={accentColor}
        />
      </VStack>
    </Box>
  );
};

/* ─── Main RFPFilterSidebar Export Component ──────────────────────────────── */
const RFPFilterSidebar = (props) => {
  const { mobileOpen, onMobileClose } = props;

  const activeCount = [
    props.selectedCategory,
    props.selectedBudget,
    props.selectedOwner,
    props.selectedDatePosted,
    props.searchQuery,
    props.selectedSort && props.selectedSort !== "newest" ? props.selectedSort : "",
  ].filter(Boolean).length;

  return (
    <>
      {/* Mobile Drawer Backdrop & Modal */}
      {mobileOpen && (
        <Box
          display={{ base: "block", lg: "none" }}
          position="fixed"
          inset={0}
          bg="rgba(0,0,0,0.8)"
          backdropFilter="blur(10px)"
          zIndex={99990}
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Slide-out sidebar container */}
      <Box
        display={{ base: "block", lg: "none" }}
        position="fixed"
        top="0"
        bottom="0"
        left={mobileOpen ? "0" : "-320px"}
        w="300px"
        zIndex={99995}
        transition="left 0.3s ease"
        p={4}
        pt={6}
        overflowY="auto"
        bg="#0f172a"
      >
        <RFPFilterSidebarContent {...props} activeCount={activeCount} onCloseMobile={onMobileClose} />
      </Box>

      {/* Desktop Sticky Sidebar */}
      <Box
        display={{ base: "none", lg: "block" }}
        position="sticky"
        top="88px"
        alignSelf="start"
        w="280px"
        zIndex={10}
      >
        <RFPFilterSidebarContent {...props} activeCount={activeCount} />
      </Box>
    </>
  );
};

export default RFPFilterSidebar;
