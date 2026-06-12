import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Badge,
  Circle,
} from "@chakra-ui/react";
import {
  Building2,
  Search,
  Settings2,
  UserMinus,
  UserPlus,
  ChevronRight,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";
import CompanyProfileModal from "./CompanyProfileModal";

const MotionBox = motion.create(Box);

const CompanySection = ({ user, refreshTrigger, onCompanyChange }) => {
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("companies/");
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [refreshTrigger]);

  const handleAttachUser = async (companyId, userId) => {
    try {
      await api.post(`companies/${companyId}/attach_user/`, { user_id: userId });
      fetchCompanies();
      if (onCompanyChange) onCompanyChange();
    } catch (err) {
      console.error("Error attaching user.", err);
    }
  };

  const handleDetachUser = async (companyId, userId) => {
    try {
      await api.post(`companies/${companyId}/detach_user/`, { user_id: userId });
      fetchCompanies();
      if (onCompanyChange) onCompanyChange();
    } catch (err) {
      console.error("Error detaching user.", err);
    }
  };

  const handleManageCompany = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleModalSaved = () => {
    fetchCompanies();
    if (onCompanyChange) onCompanyChange();
  };

  const filteredCompanies = companies.filter((company) => {
    const isMember = company.members.includes(user.id);
    const isCreator = company.creator === user.id;

    if (searchQuery.trim() === "") {
      return isMember || isCreator;
    } else {
      return company.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const INDUSTRY_LABELS = {
    technology: "Technology",
    finance: "Finance",
    healthcare: "Healthcare",
    education: "Education",
    retail: "Retail",
    manufacturing: "Manufacturing",
    media: "Media",
    real_estate: "Real Estate",
    consulting: "Consulting",
    logistics: "Logistics",
    hospitality: "Hospitality",
    energy: "Energy",
    other: "Other",
  };

  return (
    <>
      <Box className="glass-card" p={{ base: 5, md: 6 }}>
        {/* ─── Header ─── */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          direction={{ base: "column", sm: "row" }}
          gap={4}
        >
          <HStack gap={3}>
            <Circle size="32px" bg="green.500/10" color="green.400">
              <Building2 size={16} />
            </Circle>
            <Text
              fontSize="md"
              fontWeight="black"
              color="var(--color-text-primary)"
              letterSpacing="tight"
              fontFamily="var(--font-heading)"
            >
              ORGANIZATIONS
            </Text>
          </HStack>

          <HStack
            bg="var(--color-input-bg)"
            px={3}
            py={1.5}
            borderRadius="full"
            border="1px solid"
            borderColor="var(--color-input-border)"
            w={{ base: "full", sm: "220px" }}
          >
            <Search size={14} color="var(--color-text-muted)" />
            <Input
              placeholder="Search..."
              variant="unstyled"
              fontSize="xs"
              color="var(--color-text-primary)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              _placeholder={{ color: "var(--color-text-muted)" }}
            />
          </HStack>
        </Flex>

        {/* ─── Company Cards ─── */}
        <VStack align="stretch" gap={4}>
          <AnimatePresence mode="popLayout">
            {filteredCompanies.map((company, index) => {
              const isMember = company.members.includes(user.id);
              const isCreator = company.creator === user.id;

              return (
                <MotionBox
                  key={company.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  p={5}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={isCreator ? "rgba(66,153,225,0.2)" : "whiteAlpha.100"}
                  style={{
                    background: isCreator
                      ? "linear-gradient(135deg, rgba(66,153,225,0.06) 0%, var(--color-glass) 100%)"
                      : "var(--color-glass)",
                    transition: "all 0.2s",
                  }}
                  _hover={{ borderColor: isCreator ? "rgba(59,130,246,0.4)" : "var(--color-card-hover-border)" }}
                >
                  <Flex justify="space-between" align="start" gap={3}>
                    {/* Left: Logo + Info */}
                    <HStack align="start" gap={4} flex={1} minW={0}>
                      {/* Logo or Initials */}
                      <Box
                        w="48px"
                        h="48px"
                        flexShrink={0}
                        borderRadius="lg"
                        overflow="hidden"
                        border="1px solid var(--color-card-border)"
                        style={{ background: "var(--color-glass)" }}
                      >
                        {company.logo_url ? (
                          <Box
                            as="img"
                            src={company.logo_url}
                            alt={company.name}
                            w="full"
                            h="full"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <Flex w="full" h="full" align="center" justify="center">
                            <Text
                              color="var(--color-text-muted)"
                              fontWeight="black"
                              fontSize="lg"
                              letterSpacing="tight"
                            >
                              {company.name.charAt(0).toUpperCase()}
                            </Text>
                          </Flex>
                        )}
                      </Box>

                      <VStack align="start" gap={1} flex={1} minW={0}>
                        <HStack gap={2} flexWrap="wrap">
                          <Text
                            color="var(--color-text-primary)"
                            fontWeight="black"
                            fontSize="sm"
                            letterSpacing="tight"
                            noOfLines={1}
                          >
                            {company.name.toUpperCase()}
                          </Text>
                          {isCreator && (
                            <Badge
                              variant="subtle"
                              colorPalette="blue"
                              borderRadius="full"
                              px={2}
                              py={0.5}
                              fontSize="2xs"
                              fontWeight="black"
                            >
                              OWNER
                            </Badge>
                          )}
                        </HStack>

                        {/* Tagline */}
                        {company.tagline && (
                          <Text
                            color="var(--color-text-muted)"
                            fontSize="xs"
                            fontStyle="italic"
                            noOfLines={1}
                          >
                            "{company.tagline}"
                          </Text>
                        )}

                        {/* Meta chips */}
                        <HStack gap={3} flexWrap="wrap" mt={1}>
                          <HStack gap={1}>
                            <Users size={10} color="var(--color-text-muted)" />
                            <Text
                              color="var(--color-text-muted)"
                              fontSize="10px"
                              fontWeight="bold"
                              letterSpacing="widest"
                            >
                              {company.members.length} MEMBERS
                            </Text>
                          </HStack>
                          {company.industry && (
                            <HStack gap={1}>
                              <Box
                                w="3px"
                                h="3px"
                                borderRadius="full"
                                bg="var(--color-card-border)"
                              />
                              <Text
                                color="var(--color-text-muted)"
                                fontSize="10px"
                                fontWeight="bold"
                                letterSpacing="widest"
                              >
                                {(INDUSTRY_LABELS[company.industry] || company.industry).toUpperCase()}
                              </Text>
                            </HStack>
                          )}
                          {company.location && (
                            <HStack gap={1}>
                              <MapPin size={10} color="var(--color-text-muted)" />
                              <Text
                                color="var(--color-text-muted)"
                                fontSize="10px"
                                fontWeight="bold"
                                letterSpacing="widest"
                                noOfLines={1}
                              >
                                {company.location.toUpperCase()}
                              </Text>
                            </HStack>
                          )}
                          {company.website && (
                            <HStack gap={1}>
                              <Globe size={10} color="rgba(66,153,225,0.6)" />
                              <Text
                                as="a"
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="rgba(66,153,225,0.7)"
                                fontSize="10px"
                                fontWeight="bold"
                                letterSpacing="widest"
                                _hover={{ color: "var(--color-accent)" }}
                              >
                                WEBSITE
                              </Text>
                            </HStack>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>

                    {/* Right: Action Buttons */}
                    <VStack gap={2} flexShrink={0}>
                      {isCreator && (
                        <Button
                          size="sm"
                          h="8"
                          px={4}
                          borderRadius="lg"
                          fontWeight="black"
                          fontSize="10px"
                          letterSpacing="widest"
                          color="white"
                          onClick={() => handleManageCompany(company)}
                          style={{
                            background:
                              "linear-gradient(135deg, var(--color-accent) 0%, rgba(100,150,255,0.9) 100%)",
                            boxShadow: "0 2px 12px rgba(66,153,225,0.3)",
                          }}
                          _hover={{
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 20px rgba(66,153,225,0.5)",
                          }}
                          transition="all 0.2s"
                        >
                          <Settings2 size={11} style={{ marginRight: "5px" }} />
                          MANAGE
                        </Button>
                      )}

                      {!isMember ? (
                        <Button
                          size="sm"
                          h="8"
                          px={4}
                          bg="var(--color-bg-subtle)"
                          color="var(--color-text-primary)"
                          borderRadius="lg"
                          fontWeight="black"
                          fontSize="10px"
                          letterSpacing="widest"
                          border="1px solid var(--color-card-border)"
                          _hover={{ bg: "var(--color-card-border)" }}
                          onClick={() => handleAttachUser(company.id, user.id)}
                        >
                          <UserPlus size={11} style={{ marginRight: "5px" }} />
                          JOIN
                        </Button>
                      ) : !isCreator ? (
                        <Button
                          size="sm"
                          h="8"
                          px={4}
                          variant="ghost"
                          color="rgba(255,100,100,0.7)"
                          borderRadius="lg"
                          fontWeight="black"
                          fontSize="10px"
                          letterSpacing="widest"
                          _hover={{ bg: "rgba(255,100,100,0.1)", color: "rgba(255,100,100,1)" }}
                          onClick={() => handleDetachUser(company.id, user.id)}
                        >
                          <UserMinus size={11} style={{ marginRight: "5px" }} />
                          LEAVE
                        </Button>
                      ) : null}
                    </VStack>
                  </Flex>
                </MotionBox>
              );
            })}
          </AnimatePresence>

          {filteredCompanies.length === 0 && (
            <Flex direction="column" align="center" py={12} gap={4}>
              <Building2 size={48} color="var(--color-text-muted)" style={{ opacity: 0.2 }} />
              <Text
                color="var(--color-text-muted)"
                fontSize="sm"
                fontWeight="medium"
                textAlign="center"
              >
                {searchQuery.trim() === ""
                  ? "You haven't joined any organizations yet."
                  : "No organizations match your inquiry."}
              </Text>
            </Flex>
          )}
        </VStack>
      </Box>

      {/* Company Profile Modal */}
      <CompanyProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={selectedCompany}
        onSaved={handleModalSaved}
      />
    </>
  );
};

export default CompanySection;
