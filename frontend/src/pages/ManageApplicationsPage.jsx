import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, Textarea, Heading
} from "@chakra-ui/react";
import {
  ArrowLeft, FileText, Link2, AlertCircle, Building2, CheckCircle,
  Briefcase, Mail, User, Clock, ChevronDown, ChevronUp, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api, { backendUrl } from "../api";

const MotionBox = motion.create(Box);

const STATUS_LABELS = {
  applied: "New / Applied",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_COLORS = {
  applied: { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
  reviewed: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
  shortlisted: { bg: "rgba(139, 92, 246, 0.15)", text: "#8b5cf6", border: "rgba(139, 92, 246, 0.3)" },
  accepted: { bg: "rgba(72, 199, 116, 0.15)", text: "#48C774", border: "rgba(72, 199, 116, 0.4)" },
  rejected: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
};

const ManageApplicationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Expanded cover letters tracking
  const [expandedApps, setExpandedApps] = useState({});

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const accentColor = "#3b82f6"; // Blue brand color

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg("");
    setTimeout(() => setErrorMsg(""), 3000);
  };

  const fetchData = async () => {
    try {
      const [cRes, uRes, jRes, aRes] = await Promise.all([
        api.get(`companies/${id}/`),
        api.get("me/"),
        api.get(`jobs/?company_id=${id}`),
        api.get(`applications/?company_id=${id}`),
      ]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
      setJobs(jRes.data);
      setApplications(aRes.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.patch(`applications/${appId}/`, { status: newStatus });
      showSuccess(`Status successfully updated to ${STATUS_LABELS[newStatus]}.`);
      // Update local state smoothly
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error(err);
      showError("Failed to update status.");
    }
  };

  const toggleExpandCoverLetter = (appId) => {
    setExpandedApps((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const isOwner = currentUser && company && company.creator === currentUser.id;
  const currentUserMemberInfo = company?.members_details?.find((m) => m.id === currentUser?.id);
  const isAdmin = currentUserMemberInfo?.access_role === "admin";
  const hasAccess = isOwner || isAdmin;

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color="var(--color-accent)" />
          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="black" letterSpacing="widest">
            LOADING CANDIDATES...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (!company || !hasAccess) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)" direction="column" gap={4}>
        <AlertCircle size={48} color="#ef4444" />
        <Text color="var(--color-text-primary)" fontSize="lg" fontWeight="bold">Access Denied.</Text>
        <Button onClick={() => navigate("/dashboard")} colorScheme="blue">Back to Dashboard</Button>
      </Flex>
    );
  }

  // Apply filters
  const filteredApps = applications.filter((app) => {
    const matchesJob = selectedJobId === "all" || String(app.job_opening) === selectedJobId;
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    return matchesJob && matchesStatus;
  });

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="hidden" pb="100px">
      {/* Decorative glows */}
      <Box position="absolute" top="-20%" left="-10%" w="50%" h="50%"
        style={{ background: `${accentColor}12`, filter: "blur(150px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />
      <Box position="absolute" bottom="-10%" right="-5%" w="40%" h="40%"
        style={{ background: "rgba(139,92,246,0.06)", filter: "blur(120px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        <Container maxW="1000px" px={{ base: 5, md: 8 }} pt={10}>
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={8}>
            <VStack align="start" gap={1}>
              <Button variant="ghost" color="var(--color-text-muted)" fontWeight="bold" fontSize="2xs"
                letterSpacing="widest" px={0} mb={2} _hover={{ color: "white", transform: "translateX(-4px)" }}
                transition="all 0.3s" onClick={() => navigate(`/company/${id}`)}>
                <ArrowLeft size={13} style={{ marginRight: "6px" }} />
                BACK TO DASHBOARD
              </Button>
              <Heading size="xl" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                Candidate Applications
              </Heading>
              <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="medium">
                Review and manage applicants for <strong>{company.name}</strong>
              </Text>
            </VStack>
          </Flex>

          {/* Toast Messages */}
          <AnimatePresence>
            {successMsg && (
              <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                bg="rgba(72,199,116,0.1)" border="1px solid rgba(72,199,116,0.3)" p={3.5} borderRadius="xl" mb={6}>
                <HStack gap={3}>
                  <CheckCircle size={16} color="#48C774" />
                  <Text color="#48C774" fontSize="xs" fontWeight="bold">{successMsg}</Text>
                </HStack>
              </MotionBox>
            )}
            {errorMsg && (
              <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.3)" p={3.5} borderRadius="xl" mb={6}>
                <HStack gap={3}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text color="#ef4444" fontSize="xs" fontWeight="bold">{errorMsg}</Text>
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Filters Bar */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} p={5} borderRadius="2xl"
            border="1px solid var(--color-card-border)" style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }} mb={8}>
            <VStack align="stretch" gap={1}>
              <Text color="var(--color-text-muted)" fontSize="2xs" fontWeight="black" letterSpacing="wider">FILTER BY JOB OPENING</Text>
              <Box
                as="select"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{
                  background: "var(--color-card-hover-bg)",
                  color: "white",
                  height: "40px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-card-border)",
                  fontSize: "12px",
                  padding: "0 12px",
                  outline: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <option value="all" style={{ background: "#0f172a", color: "white" }}>All Job Openings ({jobs.length})</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id} style={{ background: "#0f172a", color: "white" }}>
                    {job.title} ({job.is_active ? "Active" : "Inactive"})
                  </option>
                ))}
              </Box>
            </VStack>

            <VStack align="stretch" gap={1}>
              <Text color="var(--color-text-muted)" fontSize="2xs" fontWeight="black" letterSpacing="wider">FILTER BY STATUS</Text>
              <Box
                as="select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  background: "var(--color-card-hover-bg)",
                  color: "white",
                  height: "40px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-card-border)",
                  fontSize: "12px",
                  padding: "0 12px",
                  outline: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <option value="all" style={{ background: "#0f172a", color: "white" }}>All Applications ({applications.length})</option>
                <option value="applied" style={{ background: "#0f172a", color: "white" }}>New / Applied</option>
                <option value="reviewed" style={{ background: "#0f172a", color: "white" }}>Reviewed</option>
                <option value="shortlisted" style={{ background: "#0f172a", color: "white" }}>Shortlisted</option>
                <option value="accepted" style={{ background: "#0f172a", color: "white" }}>Accepted</option>
                <option value="rejected" style={{ background: "#0f172a", color: "white" }}>Rejected</option>
              </Box>
            </VStack>
          </Grid>

          {/* Applications list */}
          <VStack gap={5} align="stretch">
            {filteredApps.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py="80px" px={6} borderRadius="3xl"
                border="1px dashed var(--color-card-border)" bg="var(--color-glass)" textAlign="center">
                <FileText size={48} color="var(--color-card-border)" style={{ marginBottom: "16px" }} />
                <Text color="var(--color-text-primary)" fontWeight="black" fontSize="lg" mb={1}>No Applications Found</Text>
                <Text color="var(--color-text-muted)" fontSize="xs" maxW="320px">
                  There are no candidates matching your current filter selections.
                </Text>
              </Flex>
            ) : (
              <AnimatePresence>
                {filteredApps.map((app, idx) => {
                  const jobName = jobs.find((j) => j.id === app.job_opening)?.title || "Unknown Job";
                  const isExpanded = !!expandedApps[app.id];
                  const statusInfo = STATUS_COLORS[app.status] || STATUS_COLORS.applied;

                  return (
                    <MotionBox
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      p={{ base: 5, md: 6 }}
                      borderRadius="2xl"
                      border="1px solid var(--color-card-border)"
                      style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                      _hover={{ borderColor: "var(--color-card-border)", bg: "var(--color-glass)" }}
                    >
                      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4} mb={4}>
                        {/* Candidate Identity */}
                        <HStack gap={4} align="center">
                          <Box w="10" h="10" borderRadius="xl" bg="rgba(59,130,246,0.1)" display="flex" alignItems="center" justify="center"
                            border="1px solid rgba(59,130,246,0.25)">
                            <User size={18} color={accentColor} />
                          </Box>
                          <VStack align="start" gap={0.5}>
                            <HStack gap={2}>
                              <Text color="var(--color-text-primary)" fontWeight="black" fontSize="sm" letterSpacing="tight">{app.full_name}</Text>
                              <Badge px={2.5} py={0.5} borderRadius="full" fontSize="3xs" fontWeight="black"
                                style={{ background: statusInfo.bg, color: statusInfo.text, border: `1px solid ${statusInfo.border}` }}>
                                {STATUS_LABELS[app.status].toUpperCase()}
                              </Badge>
                            </HStack>
                            <HStack gap={1.5} fontSize="xs" color="var(--color-text-muted)">
                              <Mail size={12} />
                              <Text>{app.email}</Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        {/* Job & Time info */}
                        <VStack align={{ base: "start", md: "end" }} gap={1}>
                          <HStack gap={1.5}>
                            <Briefcase size={12} color="var(--color-text-muted)" />
                            <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="black">{jobName}</Text>
                          </HStack>
                          <HStack gap={1.5} fontSize="3xs" color="var(--color-text-muted)" fontWeight="bold" letterSpacing="wider">
                            <Clock size={10} />
                            <Text>{new Date(app.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }).toUpperCase()}</Text>
                          </HStack>
                        </VStack>
                      </Flex>

                      {/* Cover letter & attachments */}
                      <VStack align="stretch" gap={3.5} p={4} borderRadius="xl" bg="var(--color-input-bg)" border="1px solid var(--color-glass)" mb={4}>
                        {app.cover_letter ? (
                          <Box>
                            <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="wider" mb={1.5}>
                              COVER LETTER STATEMENT
                            </Text>
                            <Text color="var(--color-text-secondary)" fontSize="xs" lineHeight="1.6" noOfLines={isExpanded ? undefined : 3}>
                              {app.cover_letter}
                            </Text>
                            {app.cover_letter.split("\n").length > 3 || app.cover_letter.length > 250 ? (
                              <Button variant="link" size="xs" color={accentColor} mt={1} fontWeight="bold"
                                onClick={() => toggleExpandCoverLetter(app.id)}
                                rightIcon={isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}>
                                {isExpanded ? "Show Less" : "Read Full Cover Letter"}
                              </Button>
                            ) : null}
                          </Box>
                        ) : (
                          <Text color="var(--color-card-border)" fontSize="xs" fontStyle="italic">No cover letter submitted.</Text>
                        )}

                        {/* Attachments */}
                        <HStack gap={3} pt={2} borderTop="1px solid var(--color-card-border)" flexWrap="wrap">
                          {app.resume ? (
                            <Button
                              as="a"
                              href={`${backendUrl}${app.resume}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              h="7"
                              px={3}
                              borderRadius="md"
                              fontSize="2xs"
                              fontWeight="bold"
                              style={{ background: "rgba(72, 199, 116, 0.1)", border: "1px solid rgba(72, 199, 116, 0.3)", color: "#48C774" }}
                              _hover={{ background: "rgba(72, 199, 116, 0.2)" }}
                              leftIcon={<Download size={11} />}
                            >
                              Download Resume
                            </Button>
                          ) : (
                            <Badge px={2} py={1} borderRadius="md" variant="subtle" fontSize="3xs" style={{ background: "var(--color-glass)", color: "var(--color-text-muted)" }}>
                              No Resume Attached
                            </Badge>
                          )}

                          {app.portfolio_url && (
                            <Button
                              as="a"
                              href={app.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              h="7"
                              px={3}
                              borderRadius="md"
                              fontSize="2xs"
                              fontWeight="bold"
                              style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3b82f6" }}
                              _hover={{ background: "rgba(59, 130, 246, 0.2)" }}
                              leftIcon={<Link2 size={11} />}
                            >
                              Portfolio / Profile
                            </Button>
                          )}
                        </HStack>
                      </VStack>

                      {/* Status Action Buttons */}
                      <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} gap={3}>
                        <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="black" letterSpacing="wider">
                          UPDATE APPLICATION STATUS:
                        </Text>
                        <HStack gap={2} overflowX="auto" pb={{ base: 1, sm: 0 }}>
                          {[
                            { status: "applied", label: "New" },
                            { status: "reviewed", label: "Review" },
                            { status: "shortlisted", label: "Shortlist" },
                            { status: "accepted", label: "Accept" },
                            { status: "rejected", label: "Reject" },
                          ].map((option) => {
                            const isCurrent = app.status === option.status;
                            const optionColor = STATUS_COLORS[option.status].text;

                            return (
                              <Button
                                key={option.status}
                                size="xs"
                                h="7"
                                px={3.5}
                                borderRadius="full"
                                fontWeight="black"
                                fontSize="3xs"
                                letterSpacing="wider"
                                onClick={() => handleStatusChange(app.id, option.status)}
                                style={
                                  isCurrent
                                    ? {
                                        background: STATUS_COLORS[option.status].bg,
                                        border: `1px solid ${STATUS_COLORS[option.status].text}`,
                                        color: optionColor,
                                      }
                                    : {
                                        background: "var(--color-glass)",
                                        border: "1px solid var(--color-card-border)",
                                        color: "var(--color-text-muted)",
                                      }
                                }
                                _hover={{
                                  background: isCurrent ? STATUS_COLORS[option.status].bg : "var(--color-card-border)",
                                  color: isCurrent ? optionColor : "white",
                                }}
                                transition="all 0.2s"
                              >
                                {option.label.toUpperCase()}
                              </Button>
                            );
                          })}
                        </HStack>
                      </Flex>
                    </MotionBox>
                  );
                })}
              </AnimatePresence>
            )}
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default ManageApplicationsPage;
