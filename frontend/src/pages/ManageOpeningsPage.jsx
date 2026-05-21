import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid,
} from "@chakra-ui/react";
import {
  ArrowLeft, Plus, Edit2, Trash2, Briefcase, MapPin, DollarSign,
  Building2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import JobOpeningModal from "../components/company/JobOpeningModal";
import api from "../api";

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const JOB_TYPE_LABELS = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

const ManageOpeningsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const accentColor = "#CD2426";

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
      const [cRes, uRes, jRes] = await Promise.all([
        api.get(`companies/${id}/`),
        api.get("me/"),
        api.get(`jobs/?company_id=${id}`),
      ]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
      setJobs(jRes.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const handleAddJob = () => { setSelectedJob(null); setIsJobModalOpen(true); };
  const handleEditJob = (job) => { setSelectedJob(job); setIsJobModalOpen(true); };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Delete this job opening?")) return;
    try {
      await api.delete(`jobs/${jobId}/`);
      showSuccess("Job opening deleted.");
      fetchData();
    } catch (err) {
      showError("Failed to delete job opening.");
    }
  };

  const handleToggleActive = async (job) => {
    try {
      await api.patch(`jobs/${job.id}/`, { is_active: !job.is_active });
      showSuccess(`Job marked as ${!job.is_active ? "active" : "inactive"}.`);
      fetchData();
    } catch (err) {
      showError("Failed to update job status.");
    }
  };

  if (loading) return (
    <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
      <VStack gap={4}>
        <Spinner size="xl" thickness="4px" color="var(--color-accent)" />
        <Text color="rgba(255,255,255,0.5)" fontSize="xs" fontWeight="black" letterSpacing="widest">LOADING...</Text>
      </VStack>
    </Flex>
  );

  if (!company) return (
    <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
      <Text color="white">Company not found.</Text>
    </Flex>
  );

  const isOwner = currentUser && company.creator === currentUser.id;
  const currentUserMemberInfo = company?.members_details?.find(m => m.id === currentUser?.id);
  const isAdmin = currentUserMemberInfo?.access_role === "admin";
  const hasAccess = isOwner || isAdmin;

  const activeJobs = jobs.filter(j => j.is_active);
  const inactiveJobs = jobs.filter(j => !j.is_active);

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="hidden" pb="100px">
      {/* Background glows */}
      <Box position="absolute" top="-20%" left="-10%" w="60%" h="60%"
        style={{ background: `${accentColor}12`, filter: "blur(150px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />
      <Box position="absolute" bottom="-10%" right="-5%" w="40%" h="40%"
        style={{ background: "rgba(139,92,246,0.07)", filter: "blur(120px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        {/* Toast notifications */}
        <Box position="fixed" top="90px" left="50%" transform="translateX(-50%)" zIndex={100} w="full" maxW="500px" px={4}>
          <AnimatePresence>
            {errorMsg && (
              <MotionFlex initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                bg="rgba(239,68,68,0.92)" backdropFilter="blur(10px)" color="white"
                p={4} borderRadius="xl" mb={3} align="center" gap={3} boxShadow="2xl">
                <AlertCircle size={20} />
                <Text fontSize="sm" fontWeight="bold">{errorMsg}</Text>
              </MotionFlex>
            )}
            {successMsg && (
              <MotionFlex initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                bg="rgba(34,197,94,0.92)" backdropFilter="blur(10px)" color="white"
                p={4} borderRadius="xl" mb={3} align="center" gap={3} boxShadow="2xl">
                <CheckCircle size={20} />
                <Text fontSize="sm" fontWeight="bold">{successMsg}</Text>
              </MotionFlex>
            )}
          </AnimatePresence>
        </Box>

        <Container maxW="900px" px={{ base: 5, md: 8 }} pt={10}>

          {/* ── Header ── */}
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "end" }} mb={10} gap={6}>
            <Box>
              <Button variant="ghost" color="rgba(255,255,255,0.5)" fontWeight="bold" fontSize="xs"
                letterSpacing="widest" px={0} mb={5} _hover={{ color: "white", transform: "translateX(-4px)" }}
                transition="all 0.3s" onClick={() => navigate(`/company/${id}`)}>
                <ArrowLeft size={14} style={{ marginRight: "8px" }} />
                BACK TO DASHBOARD
              </Button>
              <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="white" letterSpacing="tight" lineHeight="1.1" mb={2}>
                Job Openings
              </Text>
              <HStack gap={2} color="rgba(255,255,255,0.5)">
                <Building2 size={15} />
                <Text fontSize="sm">{company.name}</Text>
              </HStack>
            </Box>

            {/* Stats + Add button */}
            <HStack gap={4} flexShrink={0}>
              <Flex align="center" gap={4} p={4} borderRadius="2xl" border="1px solid rgba(255,255,255,0.06)"
                style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)" }}>
                <VStack align="end" gap={0}>
                  <Text color="rgba(255,255,255,0.4)" fontSize="xs" fontWeight="black" letterSpacing="wider">TOTAL</Text>
                  <Text color="white" fontSize="2xl" fontWeight="black" lineHeight="1">{jobs.length}</Text>
                </VStack>
                <Box w="44px" h="44px" borderRadius="xl" display="flex" alignItems="center" justifyContent="center"
                  style={{ background: `linear-gradient(135deg, ${accentColor}40, rgba(15,23,42,0.8))`, border: `1px solid ${accentColor}30` }}>
                  <Briefcase size={19} color={accentColor} />
                </Box>
              </Flex>

              {hasAccess && (
                <Button
                  px={6}
                  h="52px"
                  borderRadius="2xl"
                  fontWeight="black"
                  fontSize="xs"
                  letterSpacing="widest"
                  color="white"
                  onClick={handleAddJob}
                  style={{
                    background: `linear-gradient(135deg, ${accentColor} 0%, #E53E3E 100%)`,
                    boxShadow: `0 8px 24px rgba(205, 36, 38, 0.3)`,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: `0 12px 32px rgba(205, 36, 38, 0.5)`,
                    filter: "brightness(1.1)",
                  }}
                >
                  <Plus size={16} style={{ marginRight: "8px" }} />
                  ADD OPENING
                </Button>
              )}
            </HStack>
          </Flex>

          {/* ── Empty state ── */}
          {jobs.length === 0 && (
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              p={16} borderRadius="2xl" border="1px dashed rgba(255,255,255,0.08)"
              style={{ background: "rgba(255,255,255,0.02)" }} textAlign="center">
              <Box w="80px" h="80px" borderRadius="2xl" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={5}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Briefcase size={32} color="rgba(255,255,255,0.12)" />
              </Box>
              <Text color="rgba(255,255,255,0.3)" fontSize="lg" fontWeight="bold" mb={2}>No job openings yet</Text>
              <Text color="rgba(255,255,255,0.2)" fontSize="sm" mb={6}>Post your first opening to attract talent.</Text>
              {hasAccess && (
                <Button
                  onClick={handleAddJob}
                  px={6}
                  h="48px"
                  borderRadius="xl"
                  fontWeight="black"
                  fontSize="xs"
                  letterSpacing="widest"
                  color="white"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor} 0%, #E53E3E 100%)`,
                    boxShadow: `0 6px 20px rgba(205, 36, 38, 0.25)`,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: `0 10px 24px rgba(205, 36, 38, 0.4)`,
                    filter: "brightness(1.1)",
                  }}
                >
                  <Plus size={14} style={{ marginRight: "7px" }} />
                  POST FIRST OPENING
                </Button>
              )}
            </MotionBox>
          )}

          {/* ── Active openings ── */}
          {activeJobs.length > 0 && (
            <Box mb={8}>
              <HStack gap={2} mb={4}>
                <Box w="8px" h="8px" borderRadius="full" bg="rgba(72,199,116,0.9)"
                  style={{ boxShadow: "0 0 8px rgba(72,199,116,0.6)" }} />
                <Text color="rgba(255,255,255,0.35)" fontSize="10px" fontWeight="black" letterSpacing="widest">
                  ACTIVE — {activeJobs.length}
                </Text>
              </HStack>
              <VStack gap={4} align="stretch">
                <AnimatePresence>
                  {activeJobs.map((job, i) => (
                    <JobCard key={job.id} job={job} index={i} hasAccess={hasAccess}
                      accentColor={accentColor} onEdit={handleEditJob}
                      onDelete={handleDeleteJob} onToggle={handleToggleActive} />
                  ))}
                </AnimatePresence>
              </VStack>
            </Box>
          )}

          {/* ── Inactive openings ── */}
          {inactiveJobs.length > 0 && (
            <Box>
              <HStack gap={2} mb={4}>
                <Box w="8px" h="8px" borderRadius="full" bg="rgba(255,255,255,0.2)" />
                <Text color="rgba(255,255,255,0.25)" fontSize="10px" fontWeight="black" letterSpacing="widest">
                  INACTIVE — {inactiveJobs.length}
                </Text>
              </HStack>
              <VStack gap={4} align="stretch">
                <AnimatePresence>
                  {inactiveJobs.map((job, i) => (
                    <JobCard key={job.id} job={job} index={i} hasAccess={hasAccess}
                      accentColor={accentColor} onEdit={handleEditJob}
                      onDelete={handleDeleteJob} onToggle={handleToggleActive} />
                  ))}
                </AnimatePresence>
              </VStack>
            </Box>
          )}
        </Container>
      </Box>

      <JobOpeningModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        companyId={company.id}
        job={selectedJob}
        onSaved={() => { fetchData(); showSuccess("Job opening saved."); }}
      />
    </Box>
  );
};

// ── Individual Job Card ──────────────────────────────────────────────────────
const JobCard = ({ job, index, hasAccess, accentColor, onEdit, onDelete, onToggle }) => (
  <MotionBox
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={{ duration: 0.25, delay: index * 0.04 }}
    p={5} borderRadius="xl"
    border={`1px solid ${job.is_active ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)"}`}
    style={{
      background: job.is_active
        ? "rgba(255,255,255,0.03)"
        : "rgba(255,255,255,0.015)",
      backdropFilter: "blur(10px)",
      opacity: job.is_active ? 1 : 0.6,
      transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
    }}
    _hover={{ borderColor: `${accentColor}35`, background: `${accentColor}07`, transform: "translateY(-2px)" }}
  >
    <Flex align="start" justify="space-between" gap={4} wrap="wrap">
      {/* Left: job info */}
      <VStack align="start" gap={2} flex={1} minW={0}>
        <HStack gap={2} flexWrap="wrap">
          <Text color="white" fontSize="md" fontWeight="bold" letterSpacing="tight" noOfLines={1}>
            {job.title}
          </Text>
          {!job.is_active && (
            <Badge fontSize="2xs" px={2} py={0.5} borderRadius="full"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
              INACTIVE
            </Badge>
          )}
        </HStack>

        {/* Chips */}
        <HStack gap={3} flexWrap="wrap">
          <Badge px={2} py={0.5} fontSize="2xs" fontWeight="bold" borderRadius="md"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)" }}>
            {JOB_TYPE_LABELS[job.job_type] || job.job_type}
          </Badge>
          {job.location && (
            <HStack gap={1} fontSize="xs" color="rgba(255,255,255,0.4)">
              <MapPin size={11} />
              <Text>{job.location}</Text>
            </HStack>
          )}
          {job.salary_range && (
            <HStack gap={1} fontSize="xs" color="rgba(255,255,255,0.4)">
              <DollarSign size={11} />
              <Text>{job.salary_range}</Text>
            </HStack>
          )}
        </HStack>

        {job.description && (
          <Text color="rgba(255,255,255,0.5)" fontSize="xs" lineHeight="1.7" noOfLines={2}>
            {job.description}
          </Text>
        )}
        {job.requirements && (
          <Text color="rgba(255,255,255,0.3)" fontSize="2xs" noOfLines={1} fontStyle="italic">
            Requirements: {job.requirements}
          </Text>
        )}
      </VStack>

      {/* Right: actions */}
      {hasAccess && (
        <VStack gap={2} flexShrink={0} align="end">
          {/* Toggle active */}
          <Button size="xs" h="7" px={3} borderRadius="full" fontWeight="bold" fontSize="2xs" letterSpacing="wider"
            color={job.is_active ? "rgba(72,199,116,0.9)" : "rgba(255,255,255,0.35)"}
            border="1px solid"
            borderColor={job.is_active ? "rgba(72,199,116,0.3)" : "rgba(255,255,255,0.1)"}
            bg={job.is_active ? "rgba(72,199,116,0.1)" : "rgba(255,255,255,0.03)"}
            _hover={{ bg: job.is_active ? "rgba(72,199,116,0.2)" : "rgba(255,255,255,0.07)" }}
            onClick={() => onToggle(job)}
            gap={1}
          >
            {job.is_active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
            {job.is_active ? "ACTIVE" : "INACTIVE"}
          </Button>

          <HStack gap={1}>
            <Button size="xs" variant="ghost" color="rgba(255,255,255,0.45)"
              _hover={{ bg: "rgba(255,255,255,0.08)", color: "white" }}
              onClick={() => onEdit(job)} title="Edit">
              <Edit2 size={13} />
            </Button>
            <Button size="xs" variant="ghost" color="rgba(239,68,68,0.6)"
              _hover={{ bg: "rgba(239,68,68,0.12)", color: "rgba(239,68,68,0.9)" }}
              onClick={() => onDelete(job.id)} title="Delete">
              <Trash2 size={13} />
            </Button>
          </HStack>
        </VStack>
      )}
    </Flex>
  </MotionBox>
);

export default ManageOpeningsPage;
