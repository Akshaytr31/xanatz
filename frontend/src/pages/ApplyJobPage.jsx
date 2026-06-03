import React, { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Input, Textarea,
  Badge, Icon, Link, Heading,
} from "@chakra-ui/react";
import {
  ArrowLeft, Briefcase, MapPin, DollarSign, Send, CheckCircle,
  FileText, Link2, AlertCircle, Building2, User, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import { ALL_CATEGORY_LABELS, ALL_SUBCATEGORY_LABELS } from "../components/company/JobOpeningModal";

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

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  const accentColor = "#3b82f6";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, userRes, jobsRes] = await Promise.all([
          api.get(`jobs/${id}/`),
          api.get("me/"),
          api.get("jobs/")
        ]);
        setJob(jobRes.data);
        setCurrentUser(userRes.data);

        // Pre-fill fields from user profile
        if (userRes.data) {
          const name = `${userRes.data.first_name || ""} ${userRes.data.last_name || ""}`.trim();
          setFullName(name || userRes.data.email.split("@")[0]);
          setEmail(userRes.data.email);
        }

        // Compute similar jobs
        if (jobsRes.data && jobRes.data) {
          const currentJob = jobRes.data;
          const matches = jobsRes.data.filter(j => 
            j.id !== currentJob.id && 
            j.category === currentJob.category
          );
          // Sort matching sub_category first
          matches.sort((a, b) => {
            const aSub = a.sub_category === currentJob.sub_category ? 1 : 0;
            const bSub = b.sub_category === currentJob.sub_category ? 1 : 0;
            return bSub - aSub;
          });
          setSimilarJobs(matches.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        err.response?.data?.detail || "Failed to submit application. Please check fields."
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
          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="black" letterSpacing="widest">
            LOADING DETAILS...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (!job) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)" direction="column" gap={4}>
        <AlertCircle size={48} color="#ef4444" />
        <Text color="var(--color-text-primary)" fontSize="lg" fontWeight="bold">Job opening not found.</Text>
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
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="hidden" pb="100px">
      {/* Decorative ambient glows */}
      <Box position="absolute" top="-20%" left="-10%" w="60%" h="60%"
        style={{ background: `${accentColor}12`, filter: "blur(150px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />
      <Box position="absolute" bottom="-10%" right="-5%" w="40%" h="40%"
        style={{ background: "rgba(139,92,246,0.06)", filter: "blur(120px)" }}
        borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        <Container maxW="1350px" px={{ base: 5, md: 8 }} pt="120px">
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
            onClick={() => showForm ? setShowForm(false) : navigate("/dashboard")}
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
                    <Text fontSize="2xl" fontWeight="black" color="var(--color-text-primary)" letterSpacing="tight">
                      Application Submitted!
                    </Text>
                    <Text color="var(--color-text-muted)" fontSize="sm" maxW="450px" mx="auto">
                      Your application for <strong>{job.title}</strong> at <strong>{job.company_name}</strong> was submitted successfully.
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
                <Flex direction={{ base: "column", lg: "row" }} gap={8} align="start" w="full">
                  {/* Left Column: Job Details */}
                  <Box flex={{ base: "none", lg: "2.8" }} w="full">
                    {/* Job Details Card */}
                    <Box
                      p={{ base: 6, md: 8 }}
                      borderRadius="xl"
                      border="1px solid var(--color-card-border)"
                      style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                      mb={8}
                    >
                      <Flex justify="space-between" align="start" wrap="wrap" mb={6} gap={4}>
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
                              <Box as="img" src={job.company_logo_url} alt={job.company_name} w="full" h="full" style={{ objectFit: "cover" }} />
                            ) : (
                              <Flex w="full" h="full" align="center" justify="center">
                                <Building2 size={32} color={accentColor} />
                              </Flex>
                            )}
                          </Box>

                          <VStack align="start" gap={2} flex={1}>
                            <Heading size="lg" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                              {job.title}
                            </Heading>
                            <HStack gap={3} flexWrap="wrap">
                              <Text color="var(--color-secondary)" fontSize="sm" fontWeight="bold">
                                {job.company_name}
                              </Text>
                              <Box w="1px" h="14px" bg="var(--color-card-border)" />
                              <Badge px={2.5} py={0.5} fontSize="xs" fontWeight="bold" borderRadius="md" style={{ background: "var(--color-card-border)", color: "var(--color-text-secondary)" }}>
                                {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                              </Badge>
                              {job.category && (
                                <Badge px={2.5} py={0.5} fontSize="xs" fontWeight="bold" borderRadius="md" style={{ background: "rgba(59, 130, 246, 0.15)", color: "rgba(147, 197, 253, 0.9)", border: "1px solid rgba(59, 130, 246, 0.25)" }}>
                                  {ALL_CATEGORY_LABELS[job.category] || job.category}
                                </Badge>
                              )}
                              {job.sub_category && (
                                <Badge px={2.5} py={0.5} fontSize="xs" fontWeight="bold" borderRadius="md" style={{ background: "rgba(139, 92, 246, 0.15)", color: "rgba(196, 181, 253, 0.9)", border: "1px solid rgba(139, 92, 246, 0.25)" }}>
                                  {ALL_SUBCATEGORY_LABELS[job.sub_category] || job.sub_category}
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>

                        <Button
                          onClick={() => setShowForm(true)}
                          px={6}
                          h="40px"
                          borderRadius="xl"
                          fontWeight="black"
                          fontSize="xs"
                          letterSpacing="widest"
                          color="white"
                          style={{
                            background: `linear-gradient(135deg, ${accentColor} 0%, #8b5cf6 100%)`,
                            boxShadow: `0 8px 20px rgba(59, 130, 246, 0.2)`,
                            border: "1px solid var(--color-card-border)",
                            transition: "all 0.3s ease",
                          }}
                          _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: `0 12px 28px rgba(59, 130, 246, 0.35)`,
                            filter: "brightness(1.1)",
                          }}
                        >
                          APPLY NOW
                        </Button>
                      </Flex>

                      <HStack gap={6} wrap="wrap" py={4} borderTop="1px solid var(--color-card-border)" borderBottom="1px solid var(--color-card-border)">
                        {job.location && (
                          <HStack gap={2} fontSize="sm" color="var(--color-text-secondary)">
                            <MapPin size={16} color={accentColor} />
                            <Text>{job.location}</Text>
                          </HStack>
                        )}
                        {job.salary_range && (
                          <HStack gap={2} fontSize="sm" color="var(--color-text-secondary)">
                            <DollarSign size={16} color={accentColor} />
                            <Text>{job.salary_range}</Text>
                          </HStack>
                        )}
                      </HStack>

                      {/* About the Job section */}
                      <VStack align="stretch" gap={6} mt={6}>
                        <Box>
                          <Heading size="xs" color="var(--color-text-muted)" fontWeight="black" letterSpacing="wider" mb={3} textTransform="uppercase">
                            Job Description
                          </Heading>
                          <Text color="var(--color-text-primary)" fontSize="sm" lineHeight="tall" style={{ whiteSpace: "pre-wrap" }}>
                            {job.description}
                          </Text>
                        </Box>

                        {job.requirements && (
                          <Box>
                            <Heading size="xs" color="var(--color-text-muted)" fontWeight="black" letterSpacing="wider" mb={3} textTransform="uppercase">
                              Requirements & Qualifications
                            </Heading>
                            <Text color="var(--color-text-primary)" fontSize="sm" lineHeight="tall" style={{ whiteSpace: "pre-wrap" }}>
                              {job.requirements}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  </Box>

                  {/* Right Column: Similar Openings */}
                  <Box flex={{ base: "none", lg: "1.2" }} w="full" position={{ lg: "sticky" }} top="90px">
                    <Box
                      p={6}
                      borderRadius="xl"
                      border="1px solid var(--color-card-border)"
                      style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                    >
                      <Heading size="xs" color="var(--color-text-muted)" fontWeight="black" letterSpacing="wider" mb={5} textTransform="uppercase">
                        SIMILAR OPENINGS
                      </Heading>

                      {similarJobs.length === 0 ? (
                        <VStack py={6} px={4} border="1px dashed var(--color-card-border)" borderRadius="2xl" bg="var(--color-input-bg)">
                          <Briefcase size={24} color="var(--color-card-border)" />
                          <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="bold" textAlign="center">
                            No similar openings found
                          </Text>
                        </VStack>
                      ) : (
                        <VStack gap={4} align="stretch">
                          {similarJobs.map((simJob) => (
                            <Box
                              key={simJob.id}
                              onClick={() => navigate(`/jobs/${simJob.id}/apply`)}
                              cursor="pointer"
                              p={4.5}
                              borderRadius="xl"
                              border="1px solid var(--color-card-border)"
                              bg="var(--color-input-bg)"
                              transition="all 0.3s"
                              _hover={{
                                bg: "var(--color-glass)",
                                borderColor: accentColor,
                                transform: "translateY(-2px)",
                                boxShadow: `0 4px 20px rgba(59, 130, 246, 0.1)`,
                              }}
                            >
                              <VStack align="stretch" gap={2}>
                                <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="black" noOfLines={1} letterSpacing="tight">
                                  {simJob.title}
                                </Text>
                                <Text color="var(--color-secondary)" fontSize="2xs" fontWeight="bold">
                                  {simJob.company_name}
                                </Text>
                                <HStack justify="space-between" flexWrap="wrap" gap={2} mt={1}>
                                  <Badge px={2} py={0.5} fontSize="3xs" fontWeight="bold" borderRadius="md" style={{ background: "var(--color-glass)", color: "var(--color-text-secondary)" }}>
                                    {JOB_TYPE_LABELS[simJob.job_type] || simJob.job_type}
                                  </Badge>
                                  {simJob.location && (
                                    <HStack gap={1} fontSize="3xs" color="var(--color-text-muted)">
                                      <MapPin size={10} color={accentColor} />
                                      <Text noOfLines={1}>{simJob.location}</Text>
                                    </HStack>
                                  )}
                                </HStack>
                              </VStack>
                            </Box>
                          ))}
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
                  style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
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
                        <Box as="img" src={job.company_logo_url} alt={job.company_name} w="full" h="full" style={{ objectFit: "cover" }} />
                      ) : (
                        <Flex w="full" h="full" align="center" justify="center">
                          <Building2 size={24} color={accentColor} />
                        </Flex>
                      )}
                    </Box>

                    <VStack align="start" gap={1} flex={1}>
                      <Heading size="md" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                        {job.title}
                      </Heading>
                      <HStack gap={2} flexWrap="wrap">
                        <Text color="var(--color-secondary)" fontSize="xs" fontWeight="bold">
                          {job.company_name}
                        </Text>
                        <Box w="1px" h="12px" bg="var(--color-card-border)" />
                        <Badge px={2} py={0.5} fontSize="2xs" fontWeight="bold" borderRadius="md" style={{ background: "var(--color-card-border)", color: "var(--color-text-secondary)" }}>
                          {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                        </Badge>
                        {job.category && (
                          <Badge px={2} py={0.5} fontSize="2xs" fontWeight="bold" borderRadius="md" style={{ background: "rgba(59, 130, 246, 0.15)", color: "rgba(147, 197, 253, 0.9)", border: "1px solid rgba(59, 130, 246, 0.25)" }}>
                            {ALL_CATEGORY_LABELS[job.category] || job.category}
                          </Badge>
                        )}
                        {job.sub_category && (
                          <Badge px={2} py={0.5} fontSize="2xs" fontWeight="bold" borderRadius="md" style={{ background: "rgba(139, 92, 246, 0.15)", color: "rgba(196, 181, 253, 0.9)", border: "1px solid rgba(139, 92, 246, 0.25)" }}>
                            {ALL_SUBCATEGORY_LABELS[job.sub_category] || job.sub_category}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Flex>

                  <HStack gap={5} wrap="wrap" mt={5} pt={4} borderTop="1px solid var(--color-card-border)">
                    {job.location && (
                      <HStack gap={1.5} fontSize="xs" color="var(--color-text-muted)">
                        <MapPin size={13} color={accentColor} />
                        <Text>{job.location}</Text>
                      </HStack>
                    )}
                    {job.salary_range && (
                      <HStack gap={1.5} fontSize="xs" color="var(--color-text-muted)">
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
                  style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}
                >
                  <Text fontSize="lg" fontWeight="black" color="var(--color-text-primary)" mb={6} letterSpacing="tight">
                    Submit your application
                  </Text>

                  {errorMsg && (
                    <Flex bg="rgba(239, 68, 68, 0.1)" border="1px solid rgba(239, 68, 68, 0.2)" p={4} borderRadius="xl" mb={6} align="center" gap={3}>
                      <AlertCircle size={18} color="#ef4444" />
                      <Text color="#f87171" fontSize="xs" fontWeight="bold">{errorMsg}</Text>
                    </Flex>
                  )}

                  <form onSubmit={handleSubmit}>
                    <VStack gap={5} align="stretch">
                      {/* Name */}
                      <Box>
                        <Text fontSize="2xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider" mb={2}>
                          FULL NAME <span style={{ color: accentColor }}>*</span>
                        </Text>
                        <HStack bg="var(--color-input-bg)" border="1px solid var(--color-card-border)" px={3.5} borderRadius="xl"
                          _focusWithin={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }} transition="all 0.2s">
                          <User size={14} color="var(--color-text-muted)" />
                          <Input
                            placeholder="Enter your full name"
                            variant="unstyled"
                            color="white"
                            fontSize="xs"
                            py={3}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </HStack>
                      </Box>

                      {/* Email */}
                      <Box>
                        <Text fontSize="2xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider" mb={2}>
                          EMAIL ADDRESS <span style={{ color: accentColor }}>*</span>
                        </Text>
                        <HStack bg="var(--color-input-bg)" border="1px solid var(--color-card-border)" px={3.5} borderRadius="xl"
                          _focusWithin={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }} transition="all 0.2s">
                          <Mail size={14} color="var(--color-text-muted)" />
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            variant="unstyled"
                            color="white"
                            fontSize="xs"
                            py={3}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </HStack>
                      </Box>

                      {/* Portfolio URL */}
                      <Box>
                        <Text fontSize="2xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider" mb={2}>
                          PORTFOLIO / LINKEDIN URL
                        </Text>
                        <HStack bg="var(--color-input-bg)" border="1px solid var(--color-card-border)" px={3.5} borderRadius="xl"
                          _focusWithin={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }} transition="all 0.2s">
                          <Link2 size={14} color="var(--color-text-muted)" />
                          <Input
                            placeholder="https://yourportfolio.com or LinkedIn profile"
                            variant="unstyled"
                            color="white"
                            fontSize="xs"
                            py={3}
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                          />
                        </HStack>
                      </Box>

                      {/* Resume File Upload */}
                      <Box>
                        <Text fontSize="2xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider" mb={2}>
                          UPLOAD RESUME (PDF/DOCX)
                        </Text>
                        <Box
                          border="1px dashed var(--color-card-border)"
                          borderRadius="xl"
                          p={4}
                          bg="var(--color-input-bg)"
                          textAlign="center"
                          position="relative"
                          _hover={{ borderColor: "var(--color-card-border)" }}
                          transition="all 0.2s"
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
                            }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setResumeFile(e.target.files[0]);
                              }
                            }}
                          />
                          <Flex direction="column" align="center" gap={2}>
                            <FileText size={20} color={resumeFile ? "#48C774" : "var(--color-text-muted)"} />
                            {resumeFile ? (
                              <Text color="#48C774" fontSize="xs" fontWeight="bold">
                                Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                              </Text>
                            ) : (
                              <Text color="var(--color-text-muted)" fontSize="xs">
                                Click or drag files to upload resume (max 5MB)
                              </Text>
                            )}
                          </Flex>
                        </Box>
                      </Box>

                      {/* Cover Letter */}
                      <Box>
                        <Text fontSize="2xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider" mb={2}>
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
                          _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                        />
                      </Box>

                      {/* Submit */}
                      <Button
                        type="submit"
                        isLoading={submitting}
                        loadingText="SUBMITTING..."
                        h="52px"
                        mt={4}
                        borderRadius="2xl"
                        fontWeight="black"
                        fontSize="xs"
                        letterSpacing="widest"
                        color="white"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor} 0%, #8b5cf6 100%)`,
                          boxShadow: `0 8px 24px rgba(59, 130, 246, 0.25)`,
                          border: "1px solid var(--color-card-border)",
                          transition: "all 0.3s ease",
                        }}
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: `0 12px 32px rgba(59, 130, 246, 0.45)`,
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
    </Box>
  );
};

export default ApplyJobPage;
