import React, { useState, useEffect } from "react";
import { 
  Box, Flex, Text, Input, Button, VStack, HStack, Spinner 
} from "@chakra-ui/react";
import { Search, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);

const CompanyMemberSearch = ({ company, openAddModal, accentColor }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`users/search/?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Filter out users from search results who are already members
  const memberIds = new Set((company.members_details || []).map(m => m.id));
  const filteredSearchResults = searchResults.filter(user => !memberIds.has(user.id));

  return (
    <VStack align="stretch" gap={6} position="sticky" top="100px">
      <MotionBox initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        p={7} borderRadius="lg" border="1px solid rgba(255,255,255,0.08)"
        style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      >
        <VStack align="start" gap={1} mb={6}>
          <Text color="white" fontSize="lg" fontWeight="bold">Invite New Member</Text>
          <Text color="rgba(255,255,255,0.5)" fontSize="xs">Search by name or email address</Text>
        </VStack>

        <Flex 
          mb={searchQuery.trim().length > 0 ? 5 : 0} 
          align="center" 
          bg="rgba(0,0,0,0.2)" 
          border="1px solid rgba(255,255,255,0.1)" 
          borderRadius="lg" 
          px={4} py={1}
          _focusWithin={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}`, bg: "rgba(0,0,0,0.4)" }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <Search size={18} color={isSearching ? accentColor : "rgba(255,255,255,0.4)"} />
          <Input 
            placeholder="E.g. jane@example.com" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            border="none"
            color="white"
            bg="transparent"
            _hover={{ border: "none" }}
            _focus={{ border: "none", boxShadow: "none", outline: "none" }}
            px={3}
            py={3}
            w="full"
            fontSize="sm"
          />
          {isSearching && <Spinner size="sm" color={accentColor} />}
        </Flex>

        <AnimatePresence>
          {searchQuery.trim().length === 0 && (
            <MotionBox initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} overflow="hidden">
              <Flex direction="column" align="center" py={8} opacity={0.6}>
                <Users size={32} strokeWidth={1} style={{ marginBottom: '12px' }} color="rgba(255,255,255,0.4)" />
                <Text color="white" fontSize="sm" fontWeight="bold" mb={1}>Find your teammates</Text>
                <Text color="rgba(255,255,255,0.5)" fontSize="xs" textAlign="center" maxW="200px">
                  Type a name or email in the search box above to add them to your company.
                </Text>
              </Flex>
            </MotionBox>
          )}

          {searchQuery.trim().length > 0 && filteredSearchResults.length > 0 && (
            <MotionBox initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              overflow="hidden">
              <VStack align="stretch" gap={3} mt={5} maxH="400px" overflowY="auto"
                css={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '4px' } }}>
                {filteredSearchResults.map(user => (
                  <Flex key={user.id} p={3} borderRadius="lg" border="1px solid rgba(255,255,255,0.03)"
                    bg="rgba(255,255,255,0.02)" align="center" justify="space-between"
                    _hover={{ bg: "rgba(255,255,255,0.05)", transform: "translateY(-2px)", borderColor: "rgba(255,255,255,0.1)" }}
                    transition="all 0.2s"
                  >
                    <HStack gap={3}>
                      <Box w="40px" h="40px" borderRadius="full" overflow="hidden" bg="rgba(255,255,255,0.1)" border={`1px solid ${accentColor}40`}>
                        {user.profile_picture ? (
                          <img src={user.profile_picture} alt={user.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Flex w="full" h="full" align="center" justify="center">
                            <Text fontWeight="bold" fontSize="sm" color="white">
                              {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </Text>
                          </Flex>
                        )}
                      </Box>
                      <VStack align="start" gap={0} maxW="140px">
                        <Text color="white" fontSize="sm" fontWeight="bold" noOfLines={1}>
                          {user.first_name ? `${user.first_name} ${user.last_name}`.trim() : user.email.split('@')[0]}
                        </Text>
                        <Text color="rgba(255,255,255,0.4)" fontSize="2xs" noOfLines={1}>{user.email}</Text>
                      </VStack>
                    </HStack>
                    <Button size="sm" h="8" borderRadius="full" bg={`${accentColor}20`} color={accentColor} 
                      _hover={{ bg: accentColor, color: "white" }} onClick={() => openAddModal(user)}>
                      Add
                    </Button>
                  </Flex>
                ))}
              </VStack>
            </MotionBox>
          )}

          {searchQuery.trim().length >= 2 && !isSearching && filteredSearchResults.length === 0 && (
            <MotionBox initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} overflow="hidden">
              <Flex direction="column" align="center" py={8} opacity={0.5}>
                <Search size={32} strokeWidth={1} style={{ marginBottom: '12px' }} />
                <Text color="white" fontSize="sm">No users found.</Text>
              </Flex>
            </MotionBox>
          )}
        </AnimatePresence>
        
      </MotionBox>
    </VStack>
  );
};

export default CompanyMemberSearch;
