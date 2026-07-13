import React, { useState } from "react";
import { Box, Flex, Text, VStack, HStack, Grid, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

const ApplicationAnalytics = ({ applications = [] }) => {
  const [timeFilter, setTimeFilter] = useState("all");

  const filteredApplications = applications.filter((app) => {
    if (timeFilter === "all") return true;
    if (!app.created_at) return false;
    const appDate = new Date(app.created_at);
    const cutoff = new Date();

    if (timeFilter === "1m") {
      cutoff.setMonth(cutoff.getMonth() - 1);
    } else if (timeFilter === "6m") {
      cutoff.setMonth(cutoff.getMonth() - 6);
    } else if (timeFilter === "1y") {
      cutoff.setFullYear(cutoff.getFullYear() - 1);
    }

    return appDate >= cutoff;
  });

  const totalApps = filteredApplications.length;

  const appliedVal = filteredApplications.filter(a => a.status === 'applied').length;
  const reviewedVal = filteredApplications.filter(a => a.status === 'reviewed').length;
  const shortlistedVal = filteredApplications.filter(a => a.status === 'shortlisted').length;
  const hiredVal = filteredApplications.filter(a => a.status === 'accepted').length;
  const rejectedVal = filteredApplications.filter(a => a.status === 'rejected').length;

  // For Pipeline funnel
  const funnelShortlisted = filteredApplications.filter(a => ['shortlisted', 'accepted'].includes(a.status)).length;

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
    <Box py={4} px={5} borderRadius="3xl" border="1px solid var(--color-card-border)" 
      style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}>

      {/* Time Range Filter Bar */}
      <Flex gap={1} mb={4} justify="center" p={1} borderRadius="xl" bg="var(--color-input-bg)" border="1px solid var(--color-card-border)">
        {[
          { label: "1 Month", value: "1m" },
          { label: "6 Months", value: "6m" },
          { label: "1 Year", value: "1y" },
          { label: "All Time", value: "all" },
        ].map((btn) => {
          const isActive = timeFilter === btn.value;
          return (
            <Button
              key={btn.value}
              size="xs"
              variant="ghost"
              onClick={() => setTimeFilter(btn.value)}
              style={{
                flex: 1,
                fontSize: "10px",
                fontWeight: "black",
                letterSpacing: "0.05em",
                borderRadius: "lg",
                height: "26px",
                background: isActive ? "var(--color-surface)" : "transparent",
                color: isActive ? "white" : "var(--color-text-muted)",
                border: isActive ? "1px solid var(--color-card-border)" : "1px solid transparent",
              }}
              _hover={{
                background: isActive ? "var(--color-surface)" : "var(--color-card-hover-bg)",
                color: "white",
              }}
              transition="all 0.2s"
            >
              {btn.label.toUpperCase()}
            </Button>
          );
        })}
      </Flex>
      
      {/* Donut Chart Visualization */}
      <Flex direction="column" align="center" justify="center" p={1} borderBottom="1px solid var(--color-card-border)" pb={4}>
        <Text color="var(--color-text-muted)" fontSize="2xs" fontWeight="black" letterSpacing="widest" mb={3}>
          STATUS DISTRIBUTION
        </Text>
        
        <Box position="relative" w="140px" h="140px" display="flex" alignItems="center" justify="center">
          <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
            {/* Background trace circle */}
            <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--color-glass)" strokeWidth="12" />
            
            {totalApps === 0 ? (
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--color-card-border)" strokeWidth="12" />
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
            <Text color="var(--color-text-primary)" fontWeight="black" fontSize="2xl" lineHeight="1">{totalApps}</Text>
            <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="wider">SUBMITTED</Text>
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
                <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black">{item.label}</Text>
              </HStack>
              <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="black" pl={4}>{item.count}</Text>
            </VStack>
          ))}
        </Grid> */}
      </Flex>
      
      {/* Pipeline funnel success tracking */}
      <VStack align="stretch" gap={3} pt={4}>
        <Text color="var(--color-text-muted)" fontSize="2xs" fontWeight="black" letterSpacing="widest">
          RECRUITMENT FUNNEL
        </Text>
        
        {stages.map((stage, sIdx) => (
          <VStack key={stage.label} align="stretch" gap={1}>
            <Flex justify="space-between" align="center">
              <HStack gap={2}>
                <Box px={1.5} py={0.5} borderRadius="md" bg="var(--color-glass)" border="1px solid var(--color-card-border)">
                  <Text fontSize="8px" fontWeight="black" color="var(--color-text-muted)">0{sIdx + 1}</Text>
                </Box>
                <Text fontSize="11px" fontWeight="black" color="var(--color-text-secondary)">{stage.label}</Text>
              </HStack>
              <HStack gap={2}>
                <Text fontSize="10px" fontWeight="black" color="var(--color-text-muted)">{stage.count} {stage.count === 1 ? 'Job' : 'Jobs'}</Text>
                <Text fontSize="11px" fontWeight="black" color={stage.color}>{stage.percent}%</Text>
              </HStack>
            </Flex>
            
            {/* Progress Bar Container */}
            <Box w="100%" h="2" bg="var(--color-glass)" borderRadius="full" overflow="hidden" position="relative" border="1px solid var(--color-glass)">
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
