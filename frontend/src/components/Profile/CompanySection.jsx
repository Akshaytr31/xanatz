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
} from "@chakra-ui/react";
import { Plus, Trash2, UserPlus, UserMinus } from "lucide-react";
import api from "../../api";

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

  return (
    <Box bg="whiteAlpha.100" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.200">
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="xl" fontWeight="bold" color="white">
          Companies
        </Text>
      </Flex>

      <Box mb={6}>
        <Input
          placeholder="Search for a company by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg="whiteAlpha.50"
          color="white"
          borderColor="whiteAlpha.200"
          _placeholder={{ color: "whiteAlpha.500" }}
        />
      </Box>

      <VStack align="stretch" spacing={4}>
        {companies
          .filter((company) => {
            const isMember = company.members.includes(user.id);
            const isCreator = company.creator === user.id;
            
            if (searchQuery.trim() === "") {
              return isMember || isCreator;
            } else {
              return company.name.toLowerCase().includes(searchQuery.toLowerCase());
            }
          })
          .map((company) => {
          const isMember = company.members.includes(user.id);
          const isCreator = company.creator === user.id;

          return (
            <Box key={company.id} p={4} bg="whiteAlpha.50" borderRadius="md">
              <Flex justify="space-between" align="center">
                <Box>
                  <Text color="white" fontWeight="bold" fontSize="lg">
                    {company.name} {isCreator && <Badge colorScheme="green">Creator</Badge>}
                  </Text>
                </Box>
                <HStack>
                  {!isMember ? (
                    <Button size="sm" colorScheme="blue" onClick={() => handleAttachUser(company.id, user.id)}>
                      Join
                    </Button>
                  ) : (
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDetachUser(company.id, user.id)}>
                      Leave
                    </Button>
                  )}
                </HStack>
              </Flex>
              <Text mt={2} color="whiteAlpha.500" fontSize="xs">
                Members count: {company.members.length}
              </Text>
            </Box>
          );
        })}
        {companies.filter((company) => {
            const isMember = company.members.includes(user.id);
            const isCreator = company.creator === user.id;
            if (searchQuery.trim() === "") return isMember || isCreator;
            return company.name.toLowerCase().includes(searchQuery.toLowerCase());
          }).length === 0 && (
          <Text color="whiteAlpha.500" fontSize="sm">
            {searchQuery.trim() === "" ? "You are not a member of any companies." : "No companies found matching your search."}
          </Text>
        )}
      </VStack>


    </Box>
  );
};

export default CompanySection;
