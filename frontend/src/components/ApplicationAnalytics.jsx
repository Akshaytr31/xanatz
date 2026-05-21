import React from "react";
import { Box, Flex, Text, VStack, HStack, Grid } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

const ApplicationAnalytics = ({ applications = [] }) => {
  const totalApps = applications.length;

  const appliedVal = applications.filter(a => a.status === 'applied').length;
  const reviewedVal = applications.filter(a => a.status === 'reviewed').length;
  const shortlistedVal = applications.filter(a => a.status === 'shortlisted').length;
  const hiredVal = applications.filter(a => a.status === 'accepted').length;
  const rejectedVal = applications.filter(a => a.status === 'rejected').length;

  // For Pipeline funnel
  const funnelShortlisted = applications.filter(a => ['shortlisted', 'accepted'].includes(a.status)).length;

  const list = [
    { count: appliedVal, color: "#3b82f6" },
    { count: reviewedVal, color: "#f59e0b" },
    { count: shortlistedVal, color: "#8b5cf6" },
    { count: hiredVal, color: "#48C774" },
    { count: rejectedVal, color: "#ef4444" },
  ];

  let accumulatedPercent = 0;

  const stages = [
    { label: "Applications", count: totalApps, percent: 100, color: "#3b82f6" },
    { label: "Under Review", count: reviewedVal + funnelShortlisted + hiredVal, percent: totalApps > 0 ? Math.round(((reviewedVal + funnelShortlisted + hiredVal) / totalApps) * 100) : 0, color: "#f59e0b" },
    { label: "Shortlisted", count: funnelShortlisted + hiredVal, percent: totalApps > 0 ? Math.round(((funnelShortlisted + hiredVal) / totalApps) * 100) : 0, color: "#8b5cf6" },
    { label: "Hired Offer", count: hiredVal, percent: totalApps > 0 ? Math.round((hiredVal / totalApps) * 100) : 0, color: "#48C774" },
  ];

  return (
    <Box p={6} borderRadius="3xl" border="1px solid rgba(255,255,255,0.06)" 
      style={{ background: "rgba(255,255,255,0.01)", backdropFilter: "blur(20px)" }}>
      
      {/* Donut Chart Visualization */}
      <Flex direction="column" align="center" justify="center" p={2} borderBottom="1px solid rgba(255,255,255,0.08)" pb={6}>
        <Text color="rgba(255,255,255,0.4)" fontSize="2xs" fontWeight="black" letterSpacing="widest" mb={4}>
          STATUS DISTRIBUTION
        </Text>
        
        <Box position="relative" w="160px" h="160px" display="flex" alignItems="center" justify="center">
          <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
            {/* Background trace circle */}
            <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
            
            {totalApps === 0 ? (
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            ) : (
              list.map((item, idx) => {
                if (item.count === 0) return null;
                const pct = (item.count / totalApps) * 100;
                const strokeDash = (pct / 100) * 314.16;
                const strokeOffset = -(accumulatedPercent / 100) * 314.16;
                accumulatedPercent += pct;
                
                return (
                  <circle
                    key={idx}
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="12"
                    strokeDasharray={`${strokeDash}, 314.16`}
                    strokeDashoffset={strokeOffset}
                  />
                );
              })
            )}
          </svg>
          
          {/* Centered overall count */}
          <VStack position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" align="center" justify="center" gap={0}>
            <Text color="white" fontWeight="black" fontSize="2xl" lineHeight="1">{totalApps}</Text>
            <Text color="rgba(255,255,255,0.4)" fontSize="9px" fontWeight="black" letterSpacing="wider">SUBMITTED</Text>
          </VStack>
        </Box>
        
        {/* Legend Grid */}
        {/* <Grid templateColumns="repeat(3, 1fr)" gap={3} w="100%" mt={6}>
          {[
            { label: "Applied", count: appliedVal, color: "#3b82f6" },
            { label: "Reviewed", count: reviewedVal, color: "#f59e0b" },
            { label: "Shortlist", count: shortlistedVal, color: "#8b5cf6" },
            { label: "Hired Offer", count: hiredVal, color: "#48C774" },
            { label: "Rejected", count: rejectedVal, color: "#ef4444" },
          ].map(item => (
            <VStack key={item.label} align="start" gap={0.5}>
              <HStack gap={1.5}>
                <Box w="2.5" h="2.5" borderRadius="full" bg={item.color} />
                <Text color="rgba(255,255,255,0.5)" fontSize="9px" fontWeight="black">{item.label}</Text>
              </HStack>
              <Text color="white" fontSize="xs" fontWeight="black" pl={4}>{item.count}</Text>
            </VStack>
          ))}
        </Grid> */}
      </Flex>
      
      {/* Pipeline funnel success tracking */}
      <VStack align="stretch" gap={4} pt={6}>
        <Text color="rgba(255,255,255,0.4)" fontSize="2xs" fontWeight="black" letterSpacing="widest">
          RECRUITMENT FUNNEL
        </Text>
        
        {stages.map((stage, sIdx) => (
          <VStack key={stage.label} align="stretch" gap={1.5}>
            <Flex justify="space-between" align="center">
              <HStack gap={2}>
                <Box px={1.5} py={0.5} borderRadius="md" bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.08)">
                  <Text fontSize="8px" fontWeight="black" color="rgba(255,255,255,0.4)">0{sIdx + 1}</Text>
                </Box>
                <Text fontSize="11px" fontWeight="black" color="rgba(255,255,255,0.7)">{stage.label}</Text>
              </HStack>
              <HStack gap={2}>
                <Text fontSize="10px" fontWeight="black" color="rgba(255,255,255,0.4)">{stage.count} {stage.count === 1 ? 'Job' : 'Jobs'}</Text>
                <Text fontSize="11px" fontWeight="black" color={stage.color}>{stage.percent}%</Text>
              </HStack>
            </Flex>
            
            {/* Progress Bar Container */}
            <Box w="100%" h="2" bg="rgba(255,255,255,0.03)" borderRadius="full" overflow="hidden" position="relative" border="1px solid rgba(255,255,255,0.04)">
              <MotionBox
                initial={{ width: 0 }}
                animate={{ width: `${stage.percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: sIdx * 0.1 }}
                h="100%"
                style={{
                  background: `linear-gradient(90deg, ${stage.color}80, ${stage.color})`,
                  boxShadow: `0 0 8px ${stage.color}40`
                }}
                borderRadius="full"
              />
            </Box>
          </VStack>
        ))}
      </VStack>
    </Box>
  );
};

export default ApplicationAnalytics;
