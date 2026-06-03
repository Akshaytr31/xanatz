import React, { useState, useEffect } from "react";
import { Shield, Briefcase, MapPin, DollarSign, Search, Building2, ExternalLink, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Input,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import JobOpeningCard from "../components/JobOpeningCard";
import api from "../api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [titleSearch, setTitleSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await api.get("jobs/");
        setJobs(response.data);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredJobs = jobs.filter(job => {
    const matchesTitle = job.title.toLowerCase().includes(titleSearch.toLowerCase());
    const matchesCompany = job.company_name.toLowerCase().includes(companySearch.toLowerCase());
    const matchesLocation = !locationSearch || (job.location && job.location.toLowerCase().includes(locationSearch.toLowerCase()));
    const matchesType = jobTypeFilter === "all" || job.job_type === jobTypeFilter;
    
    return matchesTitle && matchesCompany && matchesLocation && matchesType;
  });

  return (
    <Box
      minH="100vh"
      bg="var(--color-primary)"
      position="relative"
      overflow="hidden"
      marginTop={'50px'}
    >
      <Navbar handleLogout={handleLogout} />

      <Box p={{ base: 6, md: 10 }} position="relative">
        {/* Explore Job Openings Section */}
        <Box mt={1} position="relative" zIndex={10}>

          {/* Filters Panel */} 
          <Box p={5} borderRadius="2xl" border="1px solid var(--color-card-border)" mb={8}
            style={{ background: "var(--color-glass)", backdropFilter: "blur(20px)" }}>
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
              {/* Title Filter */}
              <VStack align="start" gap={1.5}>
                <Text fontSize="xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider">JOB TITLE</Text>
                <HStack
                  bg="var(--color-input-bg)"
                  borderRadius="xl"
                  px={3.5}
                  border="1px solid var(--color-card-border)"
                  w="full"
                  _hover={{ borderColor: "var(--color-card-border)", bg: "var(--color-card-hover-bg)" }}
                  _focusWithin={{ borderColor: "var(--color-accent)", boxShadow: "0 0 10px rgba(59, 130, 246, 0.2)", bg: "var(--color-card-hover-bg)" }}
                  transition="all 0.3s"
                >
                  <Search size={14} color="#3b82f6" />
                  <Input
                    placeholder="e.g. Software Engineer"
                    variant="unstyled"
                    color="var(--color-text-primary)"
                    fontSize="xs"
                    value={titleSearch}
                    onChange={(e) => setTitleSearch(e.target.value)}
                    py={3}
                    _placeholder={{ color: "var(--color-text-muted)" }}
                  />
                </HStack>
              </VStack>

              {/* Company Filter */}
              <VStack align="start" gap={1.5}>
                <Text fontSize="xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider">COMPANY</Text>
                <HStack
                  bg="var(--color-input-bg)"
                  borderRadius="xl"
                  px={3.5}
                  border="1px solid var(--color-card-border)"
                  w="full"
                  _hover={{ borderColor: "var(--color-card-border)", bg: "var(--color-card-hover-bg)" }}
                  _focusWithin={{ borderColor: "var(--color-accent)", boxShadow: "0 0 10px rgba(59, 130, 246, 0.2)", bg: "var(--color-card-hover-bg)" }}
                  transition="all 0.3s"
                >
                  <Building2 size={14} color="#3b82f6" />
                  <Input
                    placeholder="e.g. Appzia"
                    variant="unstyled"
                    color="var(--color-text-primary)"
                    fontSize="xs"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    py={3}
                    _placeholder={{ color: "var(--color-text-muted)" }}
                  />
                </HStack>
              </VStack>

              {/* Location Filter */}
              <VStack align="start" gap={1.5}>
                <Text fontSize="xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider">LOCATION</Text>
                <HStack
                  bg="var(--color-input-bg)"
                  borderRadius="xl"
                  px={3.5}
                  border="1px solid var(--color-card-border)"
                  w="full"
                  _hover={{ borderColor: "var(--color-card-border)", bg: "var(--color-card-hover-bg)" }}
                  _focusWithin={{ borderColor: "var(--color-accent)", boxShadow: "0 0 10px rgba(59, 130, 246, 0.2)", bg: "var(--color-card-hover-bg)" }}
                  transition="all 0.3s"
                >
                  <MapPin size={14} color="#3b82f6" />
                  <Input
                    placeholder="e.g. Remote / Austin"
                    variant="unstyled"
                    color="var(--color-text-primary)"
                    fontSize="xs"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    py={3}
                    _placeholder={{ color: "var(--color-text-muted)" }}
                  />
                </HStack>
              </VStack>

              {/* Job Type Filter */}
              <VStack align="start" gap={1.5}>
                <Text fontSize="xs" fontWeight="black" color="var(--color-text-muted)" letterSpacing="wider">JOB TYPE</Text>
                <Box position="relative" w="full" transition="all 0.3s">
                  <Box
                    as="select"
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      background: "var(--color-input-bg)",
                      border: "1px solid var(--color-card-border)",
                      borderRadius: "12px",
                      color: "var(--color-text-primary)",
                      fontSize: "12px",
                      padding: "0 36px 0 14px",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      WebkitAppearance: "none",
                      transition: "all 0.3s",
                      fontFamily: "inherit",
                    }}
                    _hover={{ borderColor: "var(--color-card-border)", bg: "var(--color-card-hover-bg)" }}
                    _focus={{ borderColor: "var(--color-accent)", boxShadow: "0 0 10px rgba(59, 130, 246, 0.2)", bg: "var(--color-card-hover-bg)" }}
                  >
                    <option value="all" style={{ background: "var(--color-dropdown-bg)", color: "var(--color-text-primary)" }}>All Job Types</option>
                    <option value="full_time" style={{ background: "var(--color-dropdown-bg)", color: "var(--color-text-primary)" }}>Full-time</option>
                    <option value="part_time" style={{ background: "var(--color-dropdown-bg)", color: "var(--color-text-primary)" }}>Part-time</option>
                    <option value="contract" style={{ background: "var(--color-dropdown-bg)", color: "var(--color-text-primary)" }}>Contract</option>
                    <option value="internship" style={{ background: "var(--color-dropdown-bg)", color: "var(--color-text-primary)" }}>Internship</option>
                    <option value="remote" style={{ background: "var(--color-dropdown-bg)", color: "var(--color-text-primary)" }}>Remote</option>
                  </Box>
                  <Box position="absolute" right="3.5" top="50%" transform="translateY(-50%)" pointerEvents="none" color="var(--color-text-muted)">
                    <ChevronDown size={14} />
                  </Box>
                </Box>
              </VStack>
            </Grid>
          </Box>

          {loading ? (
            <Flex justify="center" align="center" py={12}>
              <Spinner size="lg" color="var(--color-accent)" />
            </Flex>
          ) : filteredJobs.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={12}
              borderRadius="lg"
              border="1px dashed var(--color-card-border)"
              bg="var(--color-glass)"
            >
              <Briefcase size={36} color="var(--color-card-border)" style={{ marginBottom: "12px" }} />
              <Text color="var(--color-text-muted)" fontSize="sm" fontWeight="bold">
                No job openings found
              </Text>
            </Flex>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
              {filteredJobs.map((job) => (
                <JobOpeningCard
                  key={job.id}
                  job={job}
                  onClick={() => navigate(`/jobs/${job.id}/apply`)}
                />
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
