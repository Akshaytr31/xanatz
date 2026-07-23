import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Container,
  Spinner,
  Input,
  Textarea,
  Badge,
  Icon,
  Link,
  Heading,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  DollarSign,
  Send,
  CheckCircle,
  FileText,
  Link2,
  AlertCircle,
  Building2,
  User,
  Mail,
  Sparkles,
  UploadCloud,
  Trash2,
  Flag,
} from "lucide-react";
import FlagConfirmationModal from "../components/FlagConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import { INDUSTRY_LABELS } from "../components/company/JobOpeningModal";

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const JOB_TYPE_LABELS = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

const ApplyJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [keySkills, setKeySkills] = useState("");

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [visibleSimilarCount, setVisibleSimilarCount] = useState(3);

  // Drag and Drop Resume Uploader States
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [flagModal, setFlagModal] = useState({
    isOpen: false,
    status: 'confirm',
    loading: false
  });

  const handleOpenFlagModal = () => {
    setFlagModal({
      isOpen: true,
      status: 'confirm',
      loading: false
    });
  };

  const handleCloseFlagModal = () => {
    const wasSuccess = flagModal.status === 'success';
    setFlagModal({
      isOpen: false,
      status: 'confirm',
      loading: false
    });
    if (wasSuccess) {
      navigate("/dashboard");
    }
  };

  const handleConfirmFlag = async (reason) => {
    setFlagModal(prev => ({ ...prev, loading: true }));
    try {
      await api.post(`jobs/${id}/flag/`, { reason });
      setFlagModal(prev => ({ ...prev, loading: false, status: 'success' }));
    } catch (err) {
      console.error("Error flagging job:", err);
      setFlagModal(prev => ({ ...prev, loading: false, status: 'error' }));
    }
  };

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    const isAllowedType = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ].includes(file.type) || file.name.endsWith(".pdf") || file.name.endsWith(".doc") || file.name.endsWith(".docx");

    if (!isAllowedType) {
      setErrorMsg("Only PDF, DOC, or DOCX files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be less than 5MB.");
      return;
    }

    setErrorMsg("");
    setResumeFile(file);
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return next;
      });
    }, 80);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    setUploadProgress(0);
    setUploading(false);
  };

  const accentColor = "#3b82f6";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    setVisibleSimilarCount(3);
    const fetchData = async () => {
      try {
        const [jobRes, jobsRes] = await Promise.all([
          api.get(`jobs/${id}/`),
          api.get("jobs/"),
        ]);
        console.log("jobRes", jobRes.data);
        console.log("jobsRes", jobsRes.data);
        setJob(jobRes.data);

        // Compute similar jobs by industry — across ALL companies
        if (jobsRes.data && jobRes.data) {
          const currentJob = jobRes.data;
          const matches = jobsRes.data.filter(
            (j) =>
              j.id !== currentJob.id &&
              j.industry &&
              j.industry === currentJob.industry,
          );
          setSimilarJobs(matches);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch user separately so it doesn't block job loading
    const fetchUser = async () => {
      const token = localStorage.getItem("access");
      if (!token) return; // not logged in — skip the call entirely
      try {
        const userRes = await api.get("me/");
        setCurrentUser(userRes.data);
        if (userRes.data) {
          const name =
            `${userRes.data.first_name || ""} ${userRes.data.last_name || ""}`.trim();
          setFullName(name || userRes.data.email.split("@")[0]);
          setEmail(userRes.data.email);
          if (userRes.data.profile && userRes.data.profile.skills) {
            setKeySkills(userRes.data.profile.skills.join(", "));
          }
        }
      } catch {
        // Token expired or invalid — form will be empty
      }
    };

    fetchData();
    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email) {
      setErrorMsg("Full name and email are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      // Use FormData to support file upload
      const formData = new FormData();
      formData.append("job_opening", id);
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("cover_letter", coverLetter);
      if (portfolioUrl) formData.append("portfolio_url", portfolioUrl);
      if (resumeFile) formData.append("resume", resumeFile);
      if (keySkills) formData.append("key_skills", keySkills);

      await api.post("applications/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 3500);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail ||
          "Failed to submit application. Please check fields.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" color="var(--color-accent)" />
          <Text
            color="var(--color-text-muted)"
            fontSize="xs"
            fontWeight="black"
            letterSpacing="widest"
          >
            LOADING DETAILS...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (!job) {
    return (
      <Flex
        h="100vh"
        align="center"
        justify="center"
        bg="var(--color-primary)"
        direction="column"
        gap={4}
      >
        <AlertCircle size={48} color="#ef4444" />
        <Text color="var(--color-text-primary)" fontSize="lg" fontWeight="bold">
          Job opening not found.
        </Text>
        <Button
          onClick={() => navigate("/dashboard")}
          h="44px"
          px={6}
          borderRadius="xl"
          fontWeight="black"
          fontSize="xs"
          letterSpacing="widest"
          color="white"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, #8b5cf6 100%)`,
            boxShadow: `0 8px 20px rgba(59, 130, 246, 0.25)`,
            border: "1px solid var(--color-card-border)",
            transition: "all 0.3s ease",
          }}
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: `0 12px 28px rgba(59, 130, 246, 0.45)`,
            filter: "brightness(1.1)",
          }}
        >
          BACK TO DASHBOARD
        </Button>
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="var(--color-primary)"
      position="relative"
      overflow="clip"
      pb="100px"
    >
      {/* Decorative ambient glows */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="60%"
        h="60%"
        style={{ background: `${accentColor}12`, filter: "blur(150px)" }}
        borderRadius="full"
        zIndex={0}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        w="40%"
        h="40%"
        style={{ background: "rgba(139,92,246,0.06)", filter: "blur(120px)" }}
        borderRadius="full"
        zIndex={0}
        pointerEvents="none"
      />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        <Container maxW="1350px" px={{ base: 5, md: 8 }} pt="80px">
          {/* Back button */}
          <Button
            variant="unstyled"
            display="inline-flex"
            alignItems="center"
            h="36px"
            px={4}
            borderRadius="xl"
            border="1px solid var(--color-card-border)"
            style={{
              background: "var(--color-glass)",
              backdropFilter: "blur(10px)",
              color: "var(--color-text-secondary)",
              transition: "all 0.3s ease",
            }}
            _hover={{
              background: "var(--color-card-border)",
              borderColor: "rgba(255,255,255,0.18)",
              color: "white",
              boxShadow: "0 4px 15px var(--color-input-bg)",
            }}
            fontWeight="black"
            fontSize="2xs"
            letterSpacing="widest"
            mb={6}
            onClick={() =>
              showForm ? setShowForm(false) : navigate("/dashboard")
            }
          >
            <ArrowLeft size={12} style={{ marginRight: "6px" }} />
            {showForm ? "BACK TO DESCRIPTION" : "BACK TO OPENINGS"}
          </Button>

          <AnimatePresence mode="wait">
            {success ? (
              <MotionBox
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                p={{ base: 8, md: 12 }}
                borderRadius="xl"
                border="1px solid rgba(72, 199, 116, 0.2)"
                bg="rgba(72, 199, 116, 0.03)"
                backdropFilter="blur(20px)"
                textAlign="center"
                mt={6}
              >
                <Flex direction="column" align="center" gap={6}>
                  <Box
                    w="80px"
                    h="80px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justify="center"
                    style={{
                      background: "rgba(72, 199, 116, 0.1)",
                      border: "2px solid rgba(72, 199, 116, 0.4)",
                      boxShadow: "0 0 20px rgba(72, 199, 116, 0.2)",
                    }}
                  >
                    <CheckCircle size={40} color="#48C774" />
                  </Box>

                  <VStack gap={2}>
                    <Text
                      fontSize="2xl"
                      fontWeight="black"
                      color="var(--color-text-primary)"
                      letterSpacing="tight"
                    >
                      Application Submitted!
                    </Text>
                    <Text
                      color="var(--color-text-muted)"
                      fontSize="sm"
                      maxW="450px"
                      mx="auto"
                    >
                      Your application for <strong>{job.title}</strong> at{" "}
                      <strong>{job.company_name}</strong> was submitted
                      successfully.
                    </Text>
                  </VStack>

                  <Text color="var(--color-text-muted)" fontSize="xs" mt={4}>
                    Redirecting you back to exploration page...
                  </Text>
                </Flex>
              </MotionBox>
            ) : !showForm ? (
              <MotionBox
                key="description"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                w="full"
              >
                <Flex
                  direction={{ base: "column", lg: "row" }}
                  gap={8}
                  align="start"
                  w="full"
                >
                  {/* Left Column: Job Details */}
                  <Box flex={{ base: "none", lg: "2.8" }} w="full">
                    {/* Job Details Card */}
                    <Box
                      p={{ base: 6, md: 8 }}
                      borderRadius="xl"
                      border="1px solid var(--color-card-border)"
                      style={{
                        background: "var(--color-glass)",
                        backdropFilter: "blur(20px)",
                      }}
                      mb={8}
                    >
                      <Flex
                        justify="space-between"
                        align="start"
                        wrap="wrap"
                        mb={6}
                        gap={4}
                      >
                        <HStack gap={5} align="start" flex={1}>
                          <Box
                            w="72px"
                            h="72px"
                            borderRadius="2xl"
                            overflow="hidden"
                            flexShrink={0}
                            border="1px solid var(--color-card-border)"
                            style={{ background: "var(--color-glass)" }}
                          >
                            {job.company_logo_url ? (
                              <Box
                                as="img"
                                src={job.company_logo_url}
                                alt={job.company_name}
                                w="full"
                                h="full"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <Flex
                                w="full"
                                h="full"
                                align="center"
                                justify="center"
                              >
                                <Building2 size={32} color={accentColor} />
                              </Flex>
                            )}
                          </Box>

                          <VStack align="start" gap={2} flex={1}>
                            <HStack gap={2.5} align="center" wrap="wrap">
                              {job.job_id && (
                                <Badge variant="outline" colorScheme="gray" fontSize="xs" px={2} py={0.5} borderRadius="md" color="var(--color-text-secondary)">
                                  {job.job_id}
                                </Badge>
                              )}
                              <Heading
                                size="lg"
                                color="var(--color-text-primary)"
                                fontWeight="black"
                                letterSpacing="tight"
                              >
                                {job.title}
                              </Heading>
                            </HStack>
                            <HStack gap={3} flexWrap="wrap">
                              <Text
                                color="var(--color-secondary)"
                                fontSize="sm"
                                fontWeight="bold"
                              >
                                {job.company_name}
                              </Text>
                              <Box
                                w="1px"
                                h="14px"
                                bg="var(--color-card-border)"
                              />
                              <Badge
                                px={2.5}
                                py={0.5}
                                fontSize="xs"
                                fontWeight="bold"
                                borderRadius="md"
                                style={{
                                  background: "var(--color-card-border)",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                              </Badge>
                              {job.industry && (
                                <Badge
                                  px={2.5}
                                  py={0.5}
                                  fontSize="xs"
                                  fontWeight="bold"
                                  borderRadius="md"
                                  style={{
                                    background: "rgba(205, 36, 38, 0.12)",
                                    color: "rgba(255, 130, 130, 0.9)",
                                    border: "1px solid rgba(205, 36, 38, 0.25)",
                                  }}
                                >
                                  {INDUSTRY_LABELS[job.industry] ||
                                    job.industry}
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>

                        <HStack gap={3}>
                          <Button
                            disabled={job.is_expired}
                            onClick={() => !job.is_expired && setShowForm(true)}
                            px={6}
                            h="40px"
                            borderRadius="xl"
                            fontWeight="black"
                            fontSize="xs"
                            letterSpacing="widest"
                            color={job.is_expired ? "var(--color-text-muted)" : "white"}
                            style={{
                              background: job.is_expired
                                ? "var(--color-card-border)"
                                : `linear-gradient(135deg, ${accentColor} 0%, #8b5cf6 100%)`,
                              boxShadow: job.is_expired
                                ? "none"
                                : `0 8px 20px rgba(59, 130, 246, 0.2)`,
                              border: "1px solid var(--color-card-border)",
                              transition: "all 0.3s ease",
                              cursor: job.is_expired ? "not-allowed" : "pointer"
                            }}
                            _hover={
                              !job.is_expired
                                ? {
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 12px 28px rgba(59, 130, 246, 0.35)`,
                                    filter: "brightness(1.1)",
                                  }
                                : {}
                            }
                          >
                            {job.is_expired ? "EXPIRED" : "APPLY NOW"}
                          </Button>
                          <Button
                            onClick={handleOpenFlagModal}
                            px={4}
                            h="40px"
                            borderRadius="xl"
                            fontWeight="black"
                            fontSize="xs"
                            letterSpacing="widest"
                            variant="outline"
                            color="var(--color-text-secondary)"
                            borderColor="var(--color-card-border)"
                            _hover={{
                              bg: "rgba(239, 68, 68, 0.1)",
                              borderColor: "#EF4444",
                              color: "#EF4444"
                            }}
                          >
                            <Flag size={14} style={{ marginRight: "6px" }} />
                            FLAG JOB
                          </Button>
                        </HStack>
                      </Flex>

                      <HStack
                        gap={6}
                        wrap="wrap"
                        py={4}
                        borderTop="1px solid var(--color-card-border)"
                        borderBottom="1px solid var(--color-card-border)"
                      >
                        {job.location && (
                          <HStack
                            gap={2}
                            fontSize="sm"
                            color="var(--color-text-secondary)"
                          >
                            <MapPin size={16} color={accentColor} />
                            <Text>{job.location}</Text>
                          </HStack>
                        )}
                        {job.salary_range && (
                          <HStack
                            gap={2}
                            fontSize="sm"
                            color="var(--color-text-secondary)"
                          >
                            <DollarSign size={16} color={accentColor} />
                            <Text>{job.salary_range}</Text>
                          </HStack>
                        )}
                      </HStack>

                      {/* About the Job section */}
                      <VStack align="stretch" gap={6} mt={6}>
                        <Box>
                          <Heading
                            size="xs"
                            color="var(--color-text-muted)"
                            fontWeight="black"
                            letterSpacing="wider"
                            mb={3}
                            textTransform="uppercase"
                          >
                            Job Description
                          </Heading>
                          <Text
                            color="var(--color-text-primary)"
                            fontSize="sm"
                            lineHeight="tall"
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {job.description}
                          </Text>
                        </Box>

                        {job.requirements && (
                          <Box>
                            <Heading
                              size="xs"
                              color="var(--color-text-muted)"
                              fontWeight="black"
                              letterSpacing="wider"
                              mb={3}
                              textTransform="uppercase"
                            >
                              Requirements & Qualifications
                            </Heading>
                            <Text
                              color="var(--color-text-primary)"
                              fontSize="sm"
                              lineHeight="tall"
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              {job.requirements}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  </Box>

                  {/* Right Column: Similar Openings */}
                  <Box
                    flex={{ base: "none", lg: "1.2" }}
                    w="full"
                    position={{ lg: "sticky" }}
                    top="90px"
                    alignSelf="start"
                  >
                    <Box
                      p={6}
                      borderRadius="xl"
                      border="1px solid var(--color-card-border)"
                      style={{
                        background: "var(--color-glass)",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      <Heading
                        size="xs"
                        color="var(--color-text-muted)"
                        fontWeight="black"
                        letterSpacing="wider"
                        mb={5}
                        textTransform="uppercase"
                      >
                        SIMILAR OPENINGS
                      </Heading>

                      {similarJobs.length === 0 ? (
                        <VStack
                          py={6}
                          px={4}
                          border="1px dashed var(--color-card-border)"
                          borderRadius="2xl"
                          bg="var(--color-input-bg)"
                        >
                          <Briefcase
                            size={24}
                            color="var(--color-card-border)"
                          />
                          <Text
                            color="var(--color-text-muted)"
                            fontSize="xs"
                            fontWeight="bold"
                            textAlign="center"
                          >
                            No similar openings found
                          </Text>
                        </VStack>
                      ) : (
                        <VStack
                          gap={4}
                          align="stretch"
                          maxH="420px"
                          overflowY="auto"
                          pr={1}
                          css={{
                            "&::-webkit-scrollbar": { width: "4px" },
                            "&::-webkit-scrollbar-track": {
                              background: "transparent",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "var(--color-card-border)",
                              borderRadius: "4px",
                            },
                          }}
                        >
                          <AnimatePresence mode="popLayout">
                            {similarJobs
                              .slice(0, visibleSimilarCount)
                              .map((simJob) => (
                                <MotionBox
                                  layout
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.25 }}
                                  key={simJob.id}
                                  onClick={() =>
                                    navigate(`/jobs/${simJob.id}/apply`)
                                  }
                                  cursor="pointer"
                                  p={4.5}
                                  borderRadius="xl"
                                  border="1px solid var(--color-card-border)"
                                  bg="var(--color-input-bg)"
                                  style={{ transition: "all 0.3s" }}
                                  _hover={{
                                    bg: "var(--color-glass)",
                                    borderColor: accentColor,
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 4px 20px rgba(59, 130, 246, 0.1)`,
                                  }}
                                >
                                  <VStack align="stretch" gap={2}>
                                    <Text
                                      color="var(--color-text-primary)"
                                      fontSize="xs"
                                      fontWeight="black"
                                      noOfLines={1}
                                      letterSpacing="tight"
                                    >
                                      {simJob.title}
                                    </Text>
                                    <Text
                                      color="var(--color-secondary)"
                                      fontSize="2xs"
                                      fontWeight="bold"
                                    >
                                      {simJob.company_name}
                                    </Text>
                                    <HStack
                                      justify="space-between"
                                      flexWrap="wrap"
                                      gap={2}
                                      mt={1}
                                    >
                                      <Badge
                                        px={2}
                                        py={0.5}
                                        fontSize="3xs"
                                        fontWeight="bold"
                                        borderRadius="md"
                                        style={{
                                          background: "var(--color-glass)",
                                          color: "var(--color-text-secondary)",
                                        }}
                                      >
                                        {JOB_TYPE_LABELS[simJob.job_type] ||
                                          simJob.job_type}
                                      </Badge>
                                      {simJob.location && (
                                        <HStack
                                          gap={1}
                                          fontSize="3xs"
                                          color="var(--color-text-muted)"
                                        >
                                          <MapPin
                                            size={10}
                                            color={accentColor}
                                          />
                                          <Text noOfLines={1}>
                                            {simJob.location}
                                          </Text>
                                        </HStack>
                                      )}
                                    </HStack>
                                  </VStack>
                                </MotionBox>
                              ))}
                          </AnimatePresence>

                          {(similarJobs.length > visibleSimilarCount ||
                            visibleSimilarCount > 3) && (
                            <Flex justify="center" gap={3} mt={2}>
                              {similarJobs.length > visibleSimilarCount && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() =>
                                    setVisibleSimilarCount((prev) => prev + 3)
                                  }
                                  color="var(--color-text-secondary)"
                                  fontWeight="black"
                                  fontSize="2xs"
                                  letterSpacing="wider"
                                  gap={1.5}
                                  py={4.5}
                                  px={4}
                                  borderRadius="lg"
                                  border="1px solid var(--color-card-border)"
                                  style={{ background: "var(--color-glass)" }}
                                  _hover={{
                                    color: "white",
                                    borderColor: accentColor,
                                    bg: "rgba(59, 130, 246, 0.05)",
                                  }}
                                  transition="all 0.2s"
                                >
                                  VIEW MORE
                                  <ArrowRight
                                    size={12}
                                    style={{ transition: "transform 0.2s" }}
                                    className="view-more-arrow"
                                  />
                                </Button>
                              )}

                              {visibleSimilarCount > 3 && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => setVisibleSimilarCount(3)}
                                  color="var(--color-text-secondary)"
                                  fontWeight="black"
                                  fontSize="2xs"
                                  letterSpacing="wider"
                                  py={4.5}
                                  px={4}
                                  borderRadius="lg"
                                  border="1px solid var(--color-card-border)"
                                  style={{ background: "var(--color-glass)" }}
                                  _hover={{
                                    color: "white",
                                    borderColor: accentColor,
                                    bg: "rgba(59, 130, 246, 0.05)",
                                  }}
                                  transition="all 0.2s"
                                >
                                  SHOW LESS
                                </Button>
                              )}
                            </Flex>
                          )}
                        </VStack>
                      )}
                    </Box>
                  </Box>
                </Flex>
              </MotionBox>
            ) : (
              <MotionBox
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Job Info Banner */}
                <Box
                  p={6}
                  borderRadius="xl"
                  border="1px solid var(--color-card-border)"
                  style={{
                    background: "var(--color-glass)",
                    backdropFilter: "blur(20px)",
                  }}
                  mb={8}
                >
                  <Flex gap={4} align="start" wrap="wrap">
                    <Box
                      w="56px"
                      h="56px"
                      borderRadius="xl"
                      overflow="hidden"
                      flexShrink={0}
                      border="1px solid var(--color-card-border)"
                      style={{ background: "var(--color-glass)" }}
                    >
                      {job.company_logo_url ? (
                        <Box
                          as="img"
                          src={job.company_logo_url}
                          alt={job.company_name}
                          w="full"
                          h="full"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <Flex w="full" h="full" align="center" justify="center">
                          <Building2 size={24} color={accentColor} />
                        </Flex>
                      )}
                    </Box>

                    <VStack align="start" gap={1} flex={1}>
                      <HStack gap={2.5} align="center" wrap="wrap">
                        {job.job_id && (
                          <Badge variant="outline" colorScheme="gray" fontSize="xs" px={2} py={0.5} borderRadius="md" color="var(--color-text-secondary)">
                            {job.job_id}
                          </Badge>
                        )}
                        <Heading
                          size="md"
                          color="var(--color-text-primary)"
                          fontWeight="black"
                          letterSpacing="tight"
                        >
                          {job.title}
                        </Heading>
                      </HStack>
                      <HStack gap={2} flexWrap="wrap">
                        <Text
                          color="var(--color-secondary)"
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {job.company_name}
                        </Text>
                        <Box w="1px" h="12px" bg="var(--color-card-border)" />
                        <Badge
                          px={2}
                          py={0.5}
                          fontSize="2xs"
                          fontWeight="bold"
                          borderRadius="md"
                          style={{
                            background: "var(--color-card-border)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                        </Badge>
                        {job.industry && (
                          <Badge
                            px={2}
                            py={0.5}
                            fontSize="2xs"
                            fontWeight="bold"
                            borderRadius="md"
                            style={{
                              background: "rgba(205, 36, 38, 0.12)",
                              color: "rgba(255, 130, 130, 0.9)",
                              border: "1px solid rgba(205, 36, 38, 0.25)",
                            }}
                          >
                            {INDUSTRY_LABELS[job.industry] || job.industry}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Flex>

                  <HStack
                    gap={5}
                    wrap="wrap"
                    mt={5}
                    pt={4}
                    borderTop="1px solid var(--color-card-border)"
                  >
                    {job.location && (
                      <HStack
                        gap={1.5}
                        fontSize="xs"
                        color="var(--color-text-muted)"
                      >
                        <MapPin size={13} color={accentColor} />
                        <Text>{job.location}</Text>
                      </HStack>
                    )}
                    {job.salary_range && (
                      <HStack
                        gap={1.5}
                        fontSize="xs"
                        color="var(--color-text-muted)"
                      >
                        <DollarSign size={13} color={accentColor} />
                        <Text>{job.salary_range}</Text>
                      </HStack>
                    )}
                  </HStack>
                </Box>

                {/* Application Form */}
                <Box
                  p={{ base: 6, md: 8 }}
                  borderRadius="xl"
                  border="1px solid var(--color-card-border)"
                  style={{
                    background: "var(--color-glass)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <Text
                    fontSize="lg"
                    fontWeight="black"
                    color="var(--color-text-primary)"
                    mb={6}
                    letterSpacing="tight"
                  >
                    Submit your application
                  </Text>

                  {errorMsg && (
                    <Flex
                      bg="rgba(239, 68, 68, 0.1)"
                      border="1px solid rgba(239, 68, 68, 0.2)"
                      p={4}
                      borderRadius="xl"
                      mb={6}
                      align="center"
                      gap={3}
                    >
                      <AlertCircle size={18} color="#ef4444" />
                      <Text color="#f87171" fontSize="xs" fontWeight="bold">
                        {errorMsg}
                      </Text>
                    </Flex>
                  )}

                  <form onSubmit={handleSubmit}>
                    <VStack gap={6} align="stretch">
                      
                      {/* Section 1: Contact Information */}
                      <VStack align="stretch" gap={4}>
                        <HStack gap={2} mb={1}>
                          <User size={16} color={accentColor} />
                          <Text fontSize="xs" fontWeight="black" color="var(--color-text-primary)" letterSpacing="wider" textTransform="uppercase">
                            Contact Information
                          </Text>
                        </HStack>
                        <Flex direction={{ base: "column", md: "row" }} gap={5}>
                          {/* Name */}
                          <Box flex={1}>
                            <Text
                              fontSize="2xs"
                              fontWeight="black"
                              color="var(--color-text-muted)"
                              letterSpacing="wider"
                              mb={2}
                            >
                              FULL NAME <span style={{ color: accentColor }}>*</span>
                            </Text>
                            <HStack
                              bg="var(--color-input-bg)"
                              border="1px solid var(--color-card-border)"
                              px={3.5}
                              borderRadius="xl"
                              _focusWithin={{
                                borderColor: accentColor,
                                boxShadow: `0 0 0 1px ${accentColor}`,
                              }}
                              transition="all 0.2s"
                            >
                              <User size={14} color="var(--color-text-muted)" />
                              <Input
                                placeholder="Enter your full name"
                                variant="unstyled"
                                color="var(--color-text-primary)"
                                fontSize="xs"
                                py={3}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                              />
                              {fullName.trim().length > 1 && (
                                <CheckCircle size={14} color="#48C774" />
                              )}
                            </HStack>
                          </Box>

                          {/* Email */}
                          <Box flex={1}>
                            <Text
                              fontSize="2xs"
                              fontWeight="black"
                              color="var(--color-text-muted)"
                              letterSpacing="wider"
                              mb={2}
                            >
                              EMAIL ADDRESS <span style={{ color: accentColor }}>*</span>
                            </Text>
                            <HStack
                              bg="var(--color-input-bg)"
                              border="1px solid var(--color-card-border)"
                              px={3.5}
                              borderRadius="xl"
                              _focusWithin={{
                                borderColor: accentColor,
                                boxShadow: `0 0 0 1px ${accentColor}`,
                              }}
                              transition="all 0.2s"
                            >
                              <Mail size={14} color="var(--color-text-muted)" />
                              <Input
                                type="email"
                                placeholder="Enter your email address"
                                variant="unstyled"
                                color="var(--color-text-primary)"
                                fontSize="xs"
                                py={3}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                              {validateEmail(email) && (
                                <CheckCircle size={14} color="#48C774" />
                              )}
                            </HStack>
                          </Box>
                        </Flex>
                      </VStack>

                      {/* Section 2: Professional Profile */}
                      <VStack align="stretch" gap={4} pt={4} borderTop="1px solid var(--color-card-border)">
                        <HStack gap={2} mb={1}>
                          <Sparkles size={16} color={accentColor} />
                          <Text fontSize="xs" fontWeight="black" color="var(--color-text-primary)" letterSpacing="wider" textTransform="uppercase">
                            Professional Profile
                          </Text>
                        </HStack>
                        <Flex direction={{ base: "column", md: "row" }} gap={5}>
                          {/* Portfolio URL */}
                          <Box flex={1}>
                            <Text
                              fontSize="2xs"
                              fontWeight="black"
                              color="var(--color-text-muted)"
                              letterSpacing="wider"
                              mb={2}
                            >
                              PORTFOLIO / LINKEDIN URL
                            </Text>
                            <HStack
                              bg="var(--color-input-bg)"
                              border="1px solid var(--color-card-border)"
                              px={3.5}
                              borderRadius="xl"
                              _focusWithin={{
                                borderColor: accentColor,
                                boxShadow: `0 0 0 1px ${accentColor}`,
                              }}
                              transition="all 0.2s"
                            >
                              <Link2 size={14} color="var(--color-text-muted)" />
                              <Input
                                placeholder="https://yourportfolio.com or LinkedIn profile"
                                variant="unstyled"
                                color="var(--color-text-primary)"
                                fontSize="xs"
                                py={3}
                                value={portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
                              />
                              {portfolioUrl.trim().startsWith("http") && (
                                <CheckCircle size={14} color="#48C774" />
                              )}
                            </HStack>
                          </Box>

                          {/* Key Skills */}
                          <Box flex={1}>
                            <Text
                              fontSize="2xs"
                              fontWeight="black"
                              color="var(--color-text-muted)"
                              letterSpacing="wider"
                              mb={2}
                            >
                              KEY SKILLS
                            </Text>
                            <HStack
                              bg="var(--color-input-bg)"
                              border="1px solid var(--color-card-border)"
                              px={3.5}
                              borderRadius="xl"
                              _focusWithin={{
                                borderColor: accentColor,
                                boxShadow: `0 0 0 1px ${accentColor}`,
                              }}
                              transition="all 0.2s"
                            >
                              <Sparkles size={14} color="var(--color-text-muted)" />
                              <Input
                                placeholder="e.g. React, Python, Django, SQL (comma separated)"
                                variant="unstyled"
                                color="var(--color-text-primary)"
                                fontSize="xs"
                                py={3}
                                value={keySkills}
                                onChange={(e) => setKeySkills(e.target.value)}
                              />
                              {keySkills.trim().length > 2 && (
                                <CheckCircle size={14} color="#48C774" />
                              )}
                            </HStack>
                          </Box>
                        </Flex>
                      </VStack>

                      {/* Section 3: Documents & Statement */}
                      <VStack align="stretch" gap={4} pt={4} borderTop="1px solid var(--color-card-border)">
                        <HStack gap={2} mb={1}>
                          <FileText size={16} color={accentColor} />
                          <Text fontSize="xs" fontWeight="black" color="var(--color-text-primary)" letterSpacing="wider" textTransform="uppercase">
                            Documents & Statement
                          </Text>
                        </HStack>

                        {/* Resume File Upload */}
                        <Box>
                          <Text
                            fontSize="2xs"
                            fontWeight="black"
                            color="var(--color-text-muted)"
                            letterSpacing="wider"
                            mb={2.5}
                          >
                            UPLOAD RESUME (PDF/DOCX)
                          </Text>
                          <Box
                            position="relative"
                            border="2px dashed"
                            borderColor={dragActive ? accentColor : "var(--color-card-border)"}
                            borderRadius="xl"
                            p={6}
                            bg={dragActive ? "rgba(59, 130, 246, 0.03)" : "var(--color-input-bg)"}
                            textAlign="center"
                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            style={{
                              boxShadow: dragActive ? `0 0 20px rgba(59, 130, 246, 0.15)` : "none",
                              transform: dragActive ? "scale(1.01)" : "scale(1)",
                            }}
                          >
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                opacity: 0,
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onChange={handleFileChange}
                            />

                            {uploading ? (
                              <VStack gap={3} py={4}>
                                <Box className="animate-bounce">
                                  <UploadCloud size={32} color={accentColor} />
                                </Box>
                                <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold">
                                  Uploading resume... {uploadProgress}%
                                </Text>
                                <Box w="60%" h="4px" bg="var(--color-card-border)" borderRadius="full" overflow="hidden">
                                  <Box h="full" w={`${uploadProgress}%`} bg={accentColor} transition="width 0.1s" />
                                </Box>
                              </VStack>
                            ) : resumeFile ? (
                              <Flex align="center" justify="space-between" bg="var(--color-glass)" border="1px solid var(--color-card-border)" p={4} borderRadius="xl" position="relative" zIndex={20}>
                                <HStack gap={3.5} align="center">
                                  <Box
                                    w="44px"
                                    h="44px"
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justify="center"
                                    style={{
                                      background: "rgba(72, 199, 116, 0.1)",
                                      border: "1px solid rgba(72, 199, 116, 0.25)",
                                    }}
                                  >
                                    <FileText size={22} color="#48C774" />
                                  </Box>
                                  <VStack align="start" gap={0.5}>
                                    <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="black" noOfLines={1} maxW="220px">
                                      {resumeFile.name}
                                    </Text>
                                    <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold">
                                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Uploaded
                                    </Text>
                                  </VStack>
                                </HStack>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile();
                                  }}
                                  color="red.400"
                                  borderRadius="lg"
                                  p={2}
                                  style={{ minWidth: "auto", height: "auto" }}
                                  _hover={{ bg: "rgba(239, 68, 68, 0.08)" }}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </Flex>
                            ) : (
                              <Flex direction="column" align="center" gap={3} py={4}>
                                <Box style={{ color: "var(--color-text-muted)" }} transition="transform 0.3s" className="hover-icon">
                                  <UploadCloud size={36} color="var(--color-text-muted)" />
                                </Box>
                                <VStack gap={1}>
                                  <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="bold">
                                    Drag & drop your resume here, or <span style={{ color: accentColor, textDecoration: "underline" }}>browse</span>
                                  </Text>
                                  <Text color="var(--color-text-muted)" fontSize="3xs" fontWeight="bold">
                                    Supports PDF, DOC, DOCX up to 5MB
                                  </Text>
                                </VStack>
                              </Flex>
                            )}
                          </Box>
                        </Box>

                        {/* Cover Letter */}
                        <Box>
                          <Text
                            fontSize="2xs"
                            fontWeight="black"
                            color="var(--color-text-muted)"
                            letterSpacing="wider"
                            mb={2}
                          >
                            COVER LETTER / STATEMENT
                          </Text>
                          <Textarea
                            placeholder="Write why you are the perfect fit for this job..."
                            bg="var(--color-input-bg)"
                            border="1px solid var(--color-card-border)"
                            color="var(--color-text-primary)"
                            fontSize="xs"
                            rows={6}
                            borderRadius="xl"
                            _hover={{ borderColor: "var(--color-card-border)" }}
                            _focus={{
                              borderColor: accentColor,
                              boxShadow: `0 0 0 1px ${accentColor}`,
                            }}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                          />
                        </Box>
                      </VStack>

                      {/* Submit */}
                      <Button
                        type="submit"
                        isLoading={submitting}
                        loadingText="SUBMITTING..."
                        h="44px"
                        px={8}
                        alignSelf="center"
                        mt={4}
                        borderRadius="xl"
                        fontWeight="black"
                        fontSize="xs"
                        letterSpacing="widest"
                        color="white"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor} 0%, #8b5cf6 100%)`,
                          boxShadow: `0 4px 12px rgba(59, 130, 246, 0.2)`,
                          border: "1px solid var(--color-card-border)",
                          transition: "all 0.3s ease",
                        }}
                        _hover={{
                          transform: "translateY(-1.5px)",
                          boxShadow: `0 6px 18px rgba(59, 130, 246, 0.35)`,
                          filter: "brightness(1.1)",
                        }}
                      >
                        <Send size={14} style={{ marginRight: "8px" }} />
                        SUBMIT APPLICATION
                      </Button>
                    </VStack>
                  </form>
                </Box>
              </MotionBox>
            )}
          </AnimatePresence>
        </Container>
      </Box>

      {/* Flag Confirmation Modal */}
      <FlagConfirmationModal
        isOpen={flagModal.isOpen}
        onClose={handleCloseFlagModal}
        onConfirm={handleConfirmFlag}
        loading={flagModal.loading}
        status={flagModal.status}
        title="Flag this job opening?"
        description="Are you sure you want to flag this job opening as inappropriate? It will be removed from your view and sent to the administrator for moderation."
      />
    </Box>
  );
};

export default ApplyJobPage;
