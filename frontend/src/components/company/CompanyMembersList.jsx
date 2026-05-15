import React, { useState } from "react";
import { Box, Flex, Text, VStack, HStack, Grid, Button } from "@chakra-ui/react";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MotionBox = motion.create(Box);

const CompanyMembersList = ({ members, accentColor, companyId, isOwner }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const displayCount = 4;

  const safeMembers = members || [];
  const visibleMembers = isExpanded ? safeMembers : safeMembers.slice(0, displayCount);
  const hasMore = safeMembers.length > displayCount;

  return (
    <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
      p={7} borderRadius="2xl" border="1px solid rgba(255,255,255,0.07)"
      style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)" }}
    >
      <HStack gap={3} mb={5} justify="space-between">
        <HStack gap={3}>
          <Box w="3px" h="20px" borderRadius="full" style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }} />
          <Text color="rgba(255,255,255,0.4)" fontSize="10px" fontWeight="black" letterSpacing="widest">MEMBERS</Text>
          <Box px={2} py={0.5} borderRadius="full" style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}>
            <Text fontSize="10px" fontWeight="black" style={{ color: accentColor }}>{safeMembers.length}</Text>
          </Box>
        </HStack>
        
        {isOwner && (
          <Button h="7" px={3} borderRadius="full" fontWeight="bold" fontSize="2xs" letterSpacing="widest" color="white"
            onClick={() => navigate(`/company/${companyId}/members`)}
            style={{
              background: `linear-gradient(135deg, ${accentColor}80, rgba(15,23,42,0.5))`,
              border: `1px solid ${accentColor}40`
            }}
            _hover={{ transform: "translateY(-1px)", background: `${accentColor}90` }}
            transition="all 0.2s"
          >
            MANAGE MEMBERS
          </Button>
        )}
      </HStack>

      {safeMembers.length === 0 ? (
        <Flex direction="column" align="center" py={8} gap={3}>
          <Box w="60px" h="60px" borderRadius="2xl" display="flex" alignItems="center" justifyContent="center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Users size={24} color="rgba(255,255,255,0.1)" />
          </Box>
          <Text color="rgba(255,255,255,0.25)" fontSize="sm">No members yet</Text>
        </Flex>
      ) : (
        <Box>
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
            <AnimatePresence>
              {visibleMembers.map((member) => (
                <MotionBox
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Flex p={4} borderRadius="xl"
                    border="1px solid rgba(255,255,255,0.08)"
                    style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)" }}
                    _hover={{ borderColor: `${accentColor}40`, background: `${accentColor}0f`, transform: "translateY(-2px)" }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    align="center" gap={3}
                    cursor={member.public_id ? "pointer" : "default"}
                    onClick={() => member.public_id && navigate(`/p/${member.public_id}`)}
                  >
                    <Box w="40px" h="40px" borderRadius="full" overflow="hidden" flexShrink={0}
                      border="2px solid rgba(255,255,255,0.1)"
                      style={{ background: `linear-gradient(135deg, ${accentColor}20, rgba(15,23,42,0.8))` }}
                    >
                      {member.profile_picture ? (
                        <Box as="img" src={member.profile_picture} alt={member.first_name} w="full" h="full" style={{ objectFit: "cover" }} />
                      ) : (
                        <Flex w="full" h="full" align="center" justify="center">
                          <Text fontWeight="black" fontSize="sm" style={{ color: accentColor }}>
                            {member.first_name ? member.first_name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                          </Text>
                        </Flex>
                      )}
                    </Box>
                    <VStack align="start" gap={0} flex={1} overflow="hidden">
                      <Text color="white" fontSize="sm" fontWeight="bold" noOfLines={1} letterSpacing="tight">
                        {member.first_name ? `${member.first_name} ${member.last_name}`.trim() : member.email.split('@')[0]}
                      </Text>
                      <Text color="rgba(255,255,255,0.5)" fontSize="10px" fontWeight="bold" noOfLines={1}>
                        {member.headline || "Member"}
                      </Text>
                    </VStack>
                  </Flex>
                </MotionBox>
              ))}
            </AnimatePresence>
          </Grid>
          
          {hasMore && (
            <Button
              w="full"
              mt={5}
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              color="rgba(255,255,255,0.6)"
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="widest"
              _hover={{ color: "white", bg: "rgba(255,255,255,0.05)" }}
              borderRadius="xl"
              h="40px"
              rightIcon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            >
              {isExpanded ? "SHOW LESS" : `SHOW ALL ${safeMembers.length} MEMBERS`}
            </Button>
          )}
        </Box>
      )}
    </MotionBox>
  );
};

export default CompanyMembersList;
