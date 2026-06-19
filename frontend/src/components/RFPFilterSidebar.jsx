import React, { useState, useEffect, useRef } from "react";
import { Flex, Box, Text, Button, VStack, HStack, Input } from "@chakra-ui/react";
import { SlidersHorizontal, ChevronRight, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_OPTIONS } from "./company/JobOpeningModal";

const FilterSelect = ({ label, value, onChange, options, placeholder }) => (
  <VStack align="stretch" gap={1.5} w="full">
    <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
      {label.toUpperCase()}
    </Text>
    <Box position="relative">
      <Box
        as="select"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        w="full"
        h="9"
        px={3}
        bg="var(--color-input-bg)"
        color="white"
        borderRadius="lg"
        border="1px solid var(--color-card-border)"
        fontSize="xs"
        cursor="pointer"
        outline="none"
        style={{
          appearance: "none",
          WebkitAppearance: "none",
        }}
        _focus={{ borderColor: "#8b5cf6" }}
      >
        <option value="" style={{ background: "#0f172a", color: "var(--color-text-muted)" }}>
          {placeholder || "All"}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "#0f172a", color: "white" }}>
            {opt.label}
          </option>
        ))}
      </Box>
      <Box
        position="absolute"
        right="3"
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        color="var(--color-text-secondary)"
      >
        <ChevronRight size={12} style={{ transform: "rotate(90deg)" }} />
      </Box>
    </Box>
  </VStack>
);

const SearchableFilterSelect = ({ label, value, onChange, options, placeholder }) => {
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
    <VStack align="stretch" gap={1.5} w="full" ref={containerRef} position="relative">
      <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
        {label.toUpperCase()}
      </Text>
      
      <Box
        as="button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        w="full"
        h="9"
        px={3}
        bg="var(--color-input-bg)"
        color={selectedOption ? "white" : "var(--color-text-muted)"}
        borderRadius="lg"
        border="1px solid var(--color-card-border)"
        fontSize="xs"
        cursor="pointer"
        outline="none"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        _focus={{ borderColor: "#8b5cf6" }}
        transition="all 0.2s"
      >
        <Text noOfLines={1} fontSize="xs">
          {selectedOption ? selectedOption.label : placeholder || "All"}
        </Text>
        <ChevronDown size={12} style={{ opacity: 0.5, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
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
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)"
            }}
          >
            {/* Search Input */}
            <Box mb={2} position="relative" display="flex" alignItems="center" px={1} pt={1}>
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
                bg="rgba(255,255,255,0.05)"
                color="white"
                borderColor="var(--color-card-border)"
                _hover={{ borderColor: "var(--color-card-border)" }}
                _focus={{ borderColor: "#8b5cf6", boxShadow: "0 0 0 1px #8b5cf6" }}
                borderRadius="md"
                autoFocus
                height="28px"
                fontSize="xs"
                pl="8"
              />
              <Box position="absolute" left="3.5" pointerEvents="none" color="var(--color-text-muted)">
                <Search size={12} />
              </Box>
            </Box>

            {/* Options List */}
            <Box maxH="160px" overflowY="auto">
              {/* Option "All" */}
              <Box
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                py={1.5}
                px={2.5}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: "rgba(139,92,246,0.15)", color: "white" }}
                bg={!value ? "rgba(139,92,246,0.1)" : "transparent"}
                color={!value ? "#8b5cf6" : "var(--color-text-muted)"}
                transition="all 0.15s"
                mb={0.5}
              >
                <Text fontSize="xs" fontWeight={!value ? "bold" : "normal"}>
                  {placeholder || "All"}
                </Text>
              </Box>

              {filteredOptions.length === 0 ? (
                <Box py={2} px={3}>
                  <Text color="var(--color-text-muted)" fontSize="xs" textAlign="center">
                    No results found
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
                    py={1.5}
                    px={2.5}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "rgba(139,92,246,0.15)", color: "white" }}
                    bg={opt.value === value ? "rgba(139,92,246,0.1)" : "transparent"}
                    color={opt.value === value ? "#8b5cf6" : "var(--color-text-primary)"}
                    transition="all 0.15s"
                    mb={0.5}
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
    </VStack>
  );
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "budget-high", label: "Budget: High to Low" },
  { value: "budget-low", label: "Budget: Low to High" },
  { value: "deadline-soon", label: "Deadline: Soonest" },
];

const budgetOptions = [
  { value: "under-10k", label: "Under $10,000" },
  { value: "10k-50k", label: "$10,000 - $50,000" },
  { value: "50k-100k", label: "$50,000 - $100,000" },
  { value: "over-100k", label: "Over $100,000" },
];

const dateOptions = [
  { value: "past-24h", label: "Past 24 Hours" },
  { value: "past-week", label: "Past Week" },
  { value: "past-month", label: "Past Month" },
];

const RFPFilterSidebar = ({
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
}) => {
  const isAnyFilterActive =
    selectedCategory ||
    selectedBudget ||
    selectedOwner ||
    selectedDatePosted ||
    searchQuery;

  return (
    <Box
      display={{ base: "none", lg: "block" }}
      position="sticky"
      top="88px"
      alignSelf="start"
      w="280px"
      zIndex={10}
    >
      <VStack align="stretch" gap={5}>
        <Box
          borderRadius="2xl"
          border="1px solid var(--color-card-border)"
          p={5}
          style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <HStack gap={2}>
              <SlidersHorizontal size={15} color={accentColor} />
              <Text color="var(--color-text-primary)" fontWeight="black" fontSize="sm" letterSpacing="tight">
                Filters
              </Text>
            </HStack>
            {isAnyFilterActive && (
              <Button
                variant="link"
                size="xs"
                color={accentColor}
                fontWeight="black"
                fontSize="3xs"
                letterSpacing="wider"
                onClick={onResetFilters}
              >
                RESET ALL
              </Button>
            )}
          </Flex>

          <VStack align="stretch" gap={4}>
            {/* Sort By */}
            <FilterSelect
              label="Sort By"
              value={selectedSort}
              onChange={setSelectedSort}
              options={sortOptions}
              placeholder="Default"
            />

            {/* Category */}
            <FilterSelect
              label="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={CATEGORY_OPTIONS}
              placeholder="All Categories"
            />

            {/* Budget Range */}
            <FilterSelect
              label="Budget Range"
              value={selectedBudget}
              onChange={setSelectedBudget}
              options={budgetOptions}
              placeholder="All Budgets"
            />

            {/* Published By */}
            <SearchableFilterSelect
              label="Published By"
              value={selectedOwner}
              onChange={setSelectedOwner}
              options={companyOptions}
              placeholder="Anyone"
            />

            {/* Date Posted */}
            <FilterSelect
              label="Date Posted"
              value={selectedDatePosted}
              onChange={setSelectedDatePosted}
              options={dateOptions}
              placeholder="Anytime"
            />
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default RFPFilterSidebar;
