import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  IconButton,
  Badge,
  Circle,
} from "@chakra-ui/react";
import { Plus, Trash2, UserPlus, UserMinus, Building2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const MotionBox = motion(Box);

const CompanySection = ({ user, refreshTrigger, onCompanyChange }) => {
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCompanies = companies.filter((company) => {
    const isMember = company.members.includes(user.id);
    const isCreator = company.creator === user.id;
    
    if (searchQuery.trim() === "") {
      return isMember || isCreator;
    } else {
      return company.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  return (
    <Box className="glass-card" p={{ base: 5, md: 6 }}>
      <Flex justify="space-between" align="center" mb={6} direction={{ base: "column", sm: "row" }} gap={4}>
        <HStack gap={3}>
          <Circle size="32px" bg="green.500/10" color="green.400">
            <Building2 size={16} />
          </Circle>
          <Text fontSize="md" fontWeight="black" color="white" letterSpacing="tight" fontFamily="var(--font-heading)">
            ORGANIZATIONS
          </Text>
        </HStack>
        
        <HStack bg="whiteAlpha.50" px={3} py={1.5} borderRadius="full" border="1px solid" borderColor="whiteAlpha.200" w={{ base: "full", sm: "220px" }}>
          <Search size={14} className="text-white/40" />
          <Input 
            placeholder="Search..." 
            variant="unstyled" 
            fontSize="xs" 
            color="white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            _placeholder={{ color: "whiteAlpha.300" }}
          />
        </HStack>
      </Flex>

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
                bg="whiteAlpha.50" 
                borderRadius="2xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
                _hover={{ borderColor: "whiteAlpha.300", bg: "whiteAlpha.100" }}
              >
                <Flex justify="space-between" align="center">
                  <VStack align="start" gap={1}>
                    <HStack>
                      <Text color="white" fontWeight="black" fontSize="lg" letterSpacing="tight">
                        {company.name.toUpperCase()}
                      </Text>
                      {isCreator && (
                        <Badge variant="subtle" colorPalette="green" borderRadius="full" px={3} py={0.5} fontSize="2xs" fontWeight="black">
                          OWNER
                        </Badge>
                      )}
                    </HStack>
                    <Text color="whiteAlpha.500" fontSize="xs" fontWeight="bold" letterSpacing="widest">
                      {company.members.length} ACTIVE MEMBERS
                    </Text>
                  </VStack>
                  <HStack>
                    {!isMember ? (
                      <Button 
                        size="sm" 
                        bg="blue.500" 
                        color="white"
                        px={6}
                        borderRadius="md"
                        fontWeight="black"
                        fontSize="xs"
                        _hover={{ bg: "blue.400", transform: "translateY(-2px)" }}
                        onClick={() => handleAttachUser(company.id, user.id)}
                      >
                        JOIN
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        color="red.400"
                        px={6}
                        borderRadius="md"
                        fontWeight="black"
                        fontSize="xs"
                        _hover={{ bg: "red.400/10" }}
                        onClick={() => handleDetachUser(company.id, user.id)}
                      >
                        LEAVE
                      </Button>
                    )}
                  </HStack>
                </Flex>
              </MotionBox>
            );
          })}
        </AnimatePresence>

        {filteredCompanies.length === 0 && (
          <Flex direction="column" align="center" py={12} gap={4}>
            <Building2 size={48} className="text-white/5" />
            <Text color="whiteAlpha.400" fontSize="sm" fontWeight="medium" textAlign="center">
              {searchQuery.trim() === "" ? "You haven't joined any organizations yet." : "No organizations match your inquiry."}
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default CompanySection;
