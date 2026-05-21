import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, Heading
} from "@chakra-ui/react";
import {
  ArrowLeft, FileText, Calendar, Clock, AlertCircle, Building2,
  ChevronRight, Sparkles, CheckCircle2, Search, Link2, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";

const MotionBox = motion.create(Box);

const STATUS_LABELS = {
  applied: "Applied",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  accepted: "Accepted / Hired",
  rejected: "Rejected",
};

const STATUS_COLORS = {
  applied: { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
  reviewed: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
  shortlisted: { bg: "rgba(139, 92, 246, 0.15)", text: "#8b5cf6", border: "rgba(139, 92, 246, 0.3)" },
  accepted: { bg: "rgba(72, 199, 116, 0.15)", text: "#48C774", border: "rgba(72, 199, 116, 0.4)" },
  rejected: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
};

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const accentColor = "#3b82f6"; // Sleek blue accent color

  const fetchApplications = async () => {
    try {
      const res = await api.get("applications/");
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color="var(--color-accent)" />
          <Text color="rgba(255,255,255,0.5)" fontSize="xs" fontWeight="black" letterSpacing="widest">
            LOADING YOUR APPLICATIONS...
          </Text>
        </VStack>
      </Flex>
    );
  }

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box position="relative" zIndex={1} h="100vh" display="flex" flexDirection="column" overflow="hidden" bg="var(--color-primary)">
      {/* Sleek aesthetic background glows */}
      <Box position="absolute" top="-10%" left="-5%" w="45%" h="45%"
        style={{ background: "rgba(59,130,246,0.08)", filter: "blur(140px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />
      <Box position="absolute" bottom="-5%" right="-10%" w="40%" h="40%"
        style={{ background: "rgba(139,92,246,0.06)", filter: "blur(120px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1} h="100vh" display="flex" flexDirection="column" overflow="hidden">
        <Navbar />

        <Container maxW="1200px" px={{ base: 5, md: 8 }} pt="80px" pb={6} flex="1" display="flex" flexDirection="column" overflow="hidden">
          
          {/* Back button and spacing at the top */}
          <Box flexShrink={0} py={4} mb={2}>
            <Button
              variant="ghost"
              color="rgba(255,255,255,0.5)"
              fontWeight="bold"
              fontSize="2xs"
              letterSpacing="widest"
              px={0}
              _hover={{ color: "white", transform: "translateX(-4px)", background: "transparent" }}
              transition="all 0.3s"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={13} style={{ marginRight: "6px" }} />
              BACK TO DASHBOARD
            </Button>
          </Box>

          {/* Grid Layout containing Graph Column (Left) and scrollable filter/list (Right) */}
          {applications.length === 0 ? (
            /* Fallback empty view when no applications at all */
            <Flex direction="column" align="center" justify="center" py="80px" px={6} borderRadius="3xl"
              border="1px dashed rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.01)" textAlign="center" mb={12}>
              <FileText size={48} color="rgba(255,255,255,0.15)" style={{ marginBottom: "16px" }} />
              <Text color="white" fontWeight="black" fontSize="lg" mb={1}>No Applications Found</Text>
              <Text color="rgba(255,255,255,0.4)" fontSize="xs" maxW="360px">
                You haven't submitted any job applications yet. Go search and apply to openings!
              </Text>
              <Button size="sm" colorScheme="blue" mt={5} onClick={() => navigate("/dashboard")} borderRadius="xl" fontWeight="black" fontSize="xs">
                Browse Job Openings
              </Button>
            </Flex>
          ) : (
            <Grid templateColumns={{ base: "1fr", lg: "380px 1fr" }} gap={8} alignItems="stretch" flex="1" overflow="hidden" pb={4}>
              
              {/* Left Column: Fixed Graph Card with Y-scroll enabled in case viewport is tiny */}
              <Box zIndex={2} h="100%" overflowY="auto" pr={1} style={{ scrollbarWidth: "none" }}>
                <VStack align="stretch" gap={5} pb={4}>
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
                          
                          {(() => {
                            let accumulatedPercent = 0;
                            const totalApps = applications.length;
                            
                            const appliedVal = applications.filter(a => a.status === 'applied').length;
                            const reviewedVal = applications.filter(a => a.status === 'reviewed').length;
                            const shortlistedVal = applications.filter(a => a.status === 'shortlisted').length;
                            const hiredVal = applications.filter(a => a.status === 'accepted').length;
                            const rejectedVal = applications.filter(a => a.status === 'rejected').length;

                            if (totalApps === 0) {
                              return (
                                <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                              );
                            }
                            
                            const list = [
                              { count: appliedVal, color: "#3b82f6" },
                              { count: reviewedVal, color: "#f59e0b" },
                              { count: shortlistedVal, color: "#8b5cf6" },
                              { count: hiredVal, color: "#48C774" },
                              { count: rejectedVal, color: "#ef4444" },
                            ];
                            
                            return list.map((item, idx) => {
                              if (item.count === 0) return null;
                              const pct = (item.count / totalApps) * 100;
                              const strokeDash = (pct / 100) * 314.16;
                              const strokeOffset = 314.16 - (accumulatedPercent / 100) * 314.16;
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
                                  strokeDasharray={`${strokeDash} 314.16`}
                                  strokeDashoffset={strokeOffset}
                                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                                />
                              );
                            });
                          })()}
                        </svg>
                        
                        {/* Centered overall count */}
                        <VStack position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" align="center" justify="center" gap={0}>
                          <Text color="white" fontWeight="black" fontSize="2xl" lineHeight="1">{applications.length}</Text>
                          <Text color="rgba(255,255,255,0.4)" fontSize="9px" fontWeight="black" letterSpacing="wider">SUBMITTED</Text>
                        </VStack>
                      </Box>
                      
                      {/* Legend Grid */}
                      <Grid templateColumns="repeat(3, 1fr)" gap={3} w="100%" mt={6}>
                        {(() => {
                          const appliedVal = applications.filter(a => a.status === 'applied').length;
                          const reviewedVal = applications.filter(a => a.status === 'reviewed').length;
                          const shortlistedVal = applications.filter(a => a.status === 'shortlisted').length;
                          const hiredVal = applications.filter(a => a.status === 'accepted').length;
                          const rejectedVal = applications.filter(a => a.status === 'rejected').length;

                          return [
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
                          ));
                        })()}
                      </Grid>
                    </Flex>
                    
                    {/* Pipeline funnel success tracking */}
                    <VStack align="stretch" gap={4} pt={6}>
                      <Text color="rgba(255,255,255,0.4)" fontSize="2xs" fontWeight="black" letterSpacing="widest">
                        RECRUITMENT FUNNEL
                      </Text>
                      
                      {(() => {
                        const total = applications.length;
                        const appliedVal = applications.filter(a => a.status === 'applied').length;
                        const reviewedVal = applications.filter(a => a.status === 'reviewed').length;
                        const shortlistedVal = applications.filter(a => ['shortlisted', 'accepted'].includes(a.status)).length;
                        const hiredVal = applications.filter(a => a.status === 'accepted').length;
                        
                        const stages = [
                          { label: "Applications", count: total, percent: 100, color: "#3b82f6" },
                          { label: "Under Review", count: reviewedVal + shortlistedVal + hiredVal, percent: total > 0 ? Math.round(((reviewedVal + shortlistedVal + hiredVal) / total) * 100) : 0, color: "#f59e0b" },
                          { label: "Shortlisted", count: shortlistedVal + hiredVal, percent: total > 0 ? Math.round(((shortlistedVal + hiredVal) / total) * 100) : 0, color: "#8b5cf6" },
                          { label: "Hired Offer", count: hiredVal, percent: total > 0 ? Math.round((hiredVal / total) * 100) : 0, color: "#48C774" },
                        ];
                        
                        return stages.map((stage, sIdx) => (
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
                        ));
                      })()}
                    </VStack>
                  </Box>
                </VStack>
              </Box>

              {/* Right Column: Filters and Scrollable Application List */}
              <VStack align="stretch" gap={5} h="100%" overflow="hidden">
                
                {/* Search & Status Filters */}
                <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4} p={5} borderRadius="2xl"
                  border="1px solid rgba(255,255,255,0.07)" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }} flexShrink={0}>
                  
                  {/* Search Input */}
                  <Box position="relative">
                    <Box as="input"
                      type="text"
                      placeholder="Search by job title or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        height: "40px",
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "13px",
                        padding: "0 16px 0 40px",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    <Box position="absolute" left="3.5" top="50%" transform="translateY(-50%)" pointerEvents="none" color="rgba(255,255,255,0.35)">
                      <Search size={14} />
                    </Box>
                  </Box>

                  {/* Status Dropdown */}
                  <Box
                    as="select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      width: "100%",
                      height: "40px",
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "12px",
                      padding: "0 12px",
                      outline: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="all" style={{ background: "#0f172a", color: "white" }}>All Statuses ({applications.length})</option>
                    <option value="applied" style={{ background: "#0f172a", color: "white" }}>Applied</option>
                    <option value="reviewed" style={{ background: "#0f172a", color: "white" }}>Reviewed</option>
                    <option value="shortlisted" style={{ background: "#0f172a", color: "white" }}>Shortlisted</option>
                    <option value="accepted" style={{ background: "#0f172a", color: "white" }}>Accepted / Hired</option>
                    <option value="rejected" style={{ background: "#0f172a", color: "white" }}>Rejected</option>
                  </Box>
                </Grid>

                {/* Scrollable Submissions List Wrapper */}
                <Box flex="1" overflowY="auto" pr={2} style={{ scrollbarWidth: "thin" }}>
                  <VStack gap={5} align="stretch" pb={4}>
                    {filteredApps.length === 0 ? (
                      <Flex direction="column" align="center" justify="center" py="80px" px={6} borderRadius="3xl"
                        border="1px dashed rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.01)" textAlign="center">
                        <FileText size={48} color="rgba(255,255,255,0.15)" style={{ marginBottom: "16px" }} />
                        <Text color="white" fontWeight="black" fontSize="lg" mb={1}>No Applications Found</Text>
                        <Text color="rgba(255,255,255,0.4)" fontSize="xs" maxW="360px">
                          No applications match your current search queries or filters.
                        </Text>
                      </Flex>
                    ) : (
                      <AnimatePresence>
                        {filteredApps.map((app, idx) => {
                          const statusColor = STATUS_COLORS[app.status] || STATUS_COLORS.applied;
                          const stages = ["applied", "reviewed", "shortlisted", "accepted"];
                          const currentStageIdx = app.status === "rejected" ? -1 : stages.indexOf(app.status);

                          return (
                            <MotionBox
                              key={app.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              p={{ base: 5, md: 6 }}
                              borderRadius="2xl"
                              border="1px solid rgba(255,255,255,0.06)"
                              style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}
                              _hover={{ borderColor: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.03)" }}
                            >
                              <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={4} mb={4}>
                                <HStack gap={3.5} align="center">
                                  <Box w="10" h="10" borderRadius="xl" bg="rgba(59,130,246,0.1)" display="flex" alignItems="center" justify="center"
                                    border="1px solid rgba(59,130,246,0.25)">
                                    <Building2 size={18} color={accentColor} />
                                  </Box>
                                  <VStack align="start" gap={0.5}>
                                    <HStack gap={2.5}>
                                      <Text color="white" fontWeight="black" fontSize="md" letterSpacing="tight">{app.job_title}</Text>
                                      <Badge px={2.5} py={0.5} borderRadius="full" fontSize="3xs" fontWeight="black"
                                        style={{ background: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.border}` }}>
                                        {STATUS_LABELS[app.status].toUpperCase()}
                                      </Badge>
                                    </HStack>
                                    <Text color="rgba(255,255,255,0.4)" fontSize="xs" fontWeight="medium">{app.company_name}</Text>
                                  </VStack>
                                </HStack>

                                <VStack align={{ base: "start", sm: "end" }} gap={1}>
                                  <HStack gap={1.5} fontSize="3xs" color="rgba(255,255,255,0.3)" fontWeight="bold" letterSpacing="wider">
                                    <Calendar size={10} />
                                    <Text>APPLIED {new Date(app.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }).toUpperCase()}</Text>
                                  </HStack>
                                </VStack>
                              </Flex>

                              {/* Pipeline Stage Tracker */}
                              {app.status === "rejected" ? (
                                <Flex align="center" gap={3} p={4} borderRadius="xl" bg="rgba(239,68,68,0.05)" border="1px solid rgba(239,68,68,0.15)">
                                  <AlertCircle size={15} color="#ef4444" />
                                  <Text fontSize="xs" color="#ef4444" fontWeight="semibold">
                                    Thank you for your interest! The hiring team has reviewed your application and decided not to move forward at this time.
                                  </Text>
                                </Flex>
                              ) : (
                                <VStack align="stretch" gap={3} p={4} borderRadius="xl" bg="rgba(0,0,0,0.15)" border="1px solid rgba(255,255,255,0.04)">
                                  <Text color="rgba(255,255,255,0.3)" fontSize="2xs" fontWeight="black" letterSpacing="wider">
                                    APPLICATION PIPELINE STATUS
                                  </Text>

                                  {/* Tracker Line */}
                                  <Box position="relative" py={2} px={2}>
                                    {/* Track bar backgrounds */}
                                    <Box position="absolute" top="50%" left={2} right={2} h="3px" bg="rgba(255,255,255,0.06)" transform="translateY(-50%)" zIndex={1} borderRadius="full" />
                                    {currentStageIdx > 0 && (
                                      <Box
                                        position="absolute"
                                        top="50%"
                                        left={2}
                                        w={`${(currentStageIdx / 3) * 100}%`}
                                        h="3px"
                                        style={{ background: `linear-gradient(90deg, ${accentColor}, #8b5cf6)` }}
                                        transform="translateY(-50%)"
                                        zIndex={2}
                                        borderRadius="full"
                                        transition="width 0.4s ease"
                                      />
                                    )}

                                    {/* Track nodes */}
                                    <Flex justify="space-between" position="relative" zIndex={3}>
                                      {stages.map((stage, sIdx) => {
                                        const isActive = sIdx <= currentStageIdx;
                                        const isCurrent = sIdx === currentStageIdx;

                                        return (
                                          <Box
                                            key={stage}
                                            w="14px"
                                            h="14px"
                                            borderRadius="full"
                                            style={{
                                              background: isActive 
                                                ? `linear-gradient(135deg, ${accentColor}, #8b5cf6)` 
                                                : "#1e293b",
                                              border: isCurrent 
                                                ? "3px solid white" 
                                                : "3px solid transparent",
                                              boxShadow: isActive ? "0 0 12px rgba(59,130,246,0.6)" : "none",
                                            }}
                                            transition="all 0.3s"
                                          />
                                        );
                                      })}
                                    </Flex>
                                  </Box>

                                  {/* Labels grid */}
                                  <Grid templateColumns="repeat(4, 1fr)" textAlign="center" pt={1}>
                                    {stages.map((stage, sIdx) => {
                                      const isActive = sIdx <= currentStageIdx;
                                      const labels = ["Applied", "Reviewed", "Shortlisted", "Accepted / Hired"];
                                      
                                      return (
                                        <Text
                                          key={stage}
                                          fontSize="9px"
                                          fontWeight="black"
                                          letterSpacing="wider"
                                          textTransform="uppercase"
                                          textAlign={sIdx === 0 ? "left" : sIdx === 3 ? "right" : "center"}
                                          color={isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)"}
                                        >
                                          {labels[sIdx]}
                                        </Text>
                                      );
                                    })}
                                  </Grid>
                                </VStack>
                              )}
                            </MotionBox>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default MyApplicationsPage;
