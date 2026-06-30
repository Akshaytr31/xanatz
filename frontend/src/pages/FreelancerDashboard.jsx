import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  Flex,
  Text,
  Spinner,
  Button,
  HStack,
  Badge,
  Heading,
  Input,
  Textarea,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import api, { backendUrl } from "../api";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Briefcase,
  DollarSign,
  ArrowLeft,
  Image,
} from "lucide-react";

const MotionBox = motion.create(Box);
const MotionVStack = motion.create(VStack);

const FreelancerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    hourly_rate: "",
    freelancer_currency: "USD",
    freelancer_availability: "available",
    headline: "",
    about: "",
    skillsString: "",
  });

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    id: null,
    title: "",
    description: "",
    project_url: "",
    technologies: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [savingProject, setSavingProject] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const response = await api.get("me/");
      setUser(response.data);
      const profile = response.data.profile || {};
      setSettingsForm({
        hourly_rate: profile.hourly_rate || "",
        freelancer_currency: profile.freelancer_currency || "USD",
        freelancer_availability: profile.freelancer_availability || "available",
        headline: profile.headline || "",
        about: profile.about || "",
        skillsString: (profile.skills || []).join(", "),
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleCopyLink = () => {
    if (!user?.profile?.public_id) return;
    const publicLink = `${window.location.origin}/p/${user.profile.public_id}`;
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      const updatedStatus = !user.profile.is_freelancer;
      const response = await api.patch("me/", { is_freelancer: updatedStatus });
      setUser(response.data);
    } catch (err) {
      console.error("Failed to toggle freelancer status", err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const skillsArray = settingsForm.skillsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        hourly_rate: settingsForm.hourly_rate || null,
        freelancer_currency: settingsForm.freelancer_currency,
        freelancer_availability: settingsForm.freelancer_availability,
        headline: settingsForm.headline,
        about: settingsForm.about,
        skills: skillsArray,
      };

      const response = await api.patch("me/", payload);
      setUser(response.data);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenProjectModal = (project = null) => {
    if (project) {
      setProjectForm({
        id: project.id,
        title: project.title,
        description: project.description || "",
        project_url: project.project_url || "",
        technologies: (project.technologies || []).join(", "),
      });
    } else {
      setProjectForm({
        id: null,
        title: "",
        description: "",
        project_url: "",
        technologies: "",
      });
    }
    setSelectedFile(null);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title.trim()) return;
    setSavingProject(true);
    try {
      const techArray = projectForm.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const formData = new FormData();
      formData.append("title", projectForm.title);
      formData.append("description", projectForm.description);
      formData.append("project_url", projectForm.project_url);
      formData.append("technologies", JSON.stringify(techArray));
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (projectForm.id) {
        await api.patch(`portfolio-projects/${projectForm.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("portfolio-projects/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsProjectModalOpen(false);
      fetchProfile();
    } catch (err) {
      console.error("Failed to save project", err);
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setDeletingProjectId(projectId);
    try {
      await api.delete(`portfolio-projects/${projectId}/`);
      fetchProfile();
    } catch (err) {
      console.error("Failed to delete project", err);
    } finally {
      setDeletingProjectId(null);
    }
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <VStack gap={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="var(--color-accent-purple)" />
          <Text color="whiteAlpha.700" fontWeight="medium" letterSpacing="wide">
            LOADING FREELANCER DASHBOARD...
          </Text>
        </VStack>
      </Flex>
    );
  }

  const publicLink = user?.profile?.public_id
    ? `${window.location.origin}/p/${user.profile.public_id}`
    : "";

  return (
    <Box minH="100vh" bg="var(--color-primary)" overflow="hidden" pb="50px">
      <Box className="bg-mesh">
        <Box
          className="bg-blob"
          top="-10%"
          left="-10%"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
          }}
        />
        <Box
          className="bg-blob"
          bottom="-10%"
          right="-10%"
          style={{
            animationDelay: "-5s",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
          }}
        />
      </Box>

      <Navbar handleLogout={handleLogout} />

      <Container maxW="1200px" mt="100px" px={4}>
        <HStack mb={6} justify="space-between">
          <Button
            size="sm"
            variant="ghost"
            color="var(--color-text-secondary)"
            onClick={() => navigate("/profile")}
            leftIcon={<ArrowLeft size={16} />}
            _hover={{ color: "white", bg: "whiteAlpha.100" }}
          >
            Back to Profile
          </Button>
          <Badge
            variant="solid"
            fontSize="10px"
            fontWeight="black"
            letterSpacing="widest"
            px={3}
            py={1}
            borderRadius="full"
            bg="linear-gradient(135deg, var(--color-accent-purple) 0%, #3b82f6 100%)"
            color="white"
            boxShadow="0 4px 15px rgba(139,92,246,0.3)"
          >
            FREELANCER ZONE
          </Badge>
        </HStack>

        <Flex gap={6} direction={{ base: "column", lg: "row" }}>
          {/* LEFT SIDEBAR */}
          <VStack w={{ base: "full", lg: "400px" }} gap={6} align="stretch">
            <MotionBox
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card"
              p={6}
              border="1px solid"
              borderColor="rgba(139, 92, 246, 0.2)"
            >
              <Heading size="xs" color="var(--color-text-primary)" fontWeight="black" letterSpacing="wider" mb={4}>
                FREELANCER PROFILE STATUS
              </Heading>

              <Flex justify="space-between" align="center" mb={6}>
                <VStack align="start" gap={0}>
                  <Text color="var(--color-text-primary)" fontWeight="bold" fontSize="sm">
                    {user?.profile?.is_freelancer ? "Active & Discoverable" : "Inactive / Hidden"}
                  </Text>
                  <Text color="var(--color-text-muted)" fontSize="xs">
                    Show your landing page to clients
                  </Text>
                </VStack>

                <Button
                  onClick={handleToggleStatus}
                  bg={user?.profile?.is_freelancer ? "rgba(34, 197, 94, 0.12)" : "rgba(255, 255, 255, 0.05)"}
                  border="1px solid"
                  borderColor={user?.profile?.is_freelancer ? "rgba(34, 197, 94, 0.3)" : "rgba(255, 255, 255, 0.1)"}
                  color={user?.profile?.is_freelancer ? "#4ade80" : "var(--color-text-muted)"}
                  size="sm"
                  borderRadius="full"
                  fontWeight="black"
                  fontSize="10px"
                  px={4}
                  _hover={{
                    bg: user?.profile?.is_freelancer ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.1)"
                  }}
                  transition="all 0.2s"
                >
                  {user?.profile?.is_freelancer ? "● ACTIVE" : "○ INACTIVE"}
                </Button>
              </Flex>

              {user?.profile?.is_freelancer && (
                <VStack align="stretch" gap={3} pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
                  <Text color="var(--color-text-secondary)" fontWeight="bold" fontSize="xs" letterSpacing="wide">
                    SHAREABLE PORTFOLIO LINK
                  </Text>
                  <HStack
                    bg="rgba(0,0,0,0.2)"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    p={2}
                    justify="space-between"
                  >
                    <Text color="rgba(255,255,255,0.7)" fontSize="xs" isTruncated maxW="240px" pl={2}>
                      {publicLink}
                    </Text>
                    <Button
                      size="xs"
                      onClick={handleCopyLink}
                      bg="rgba(139, 92, 246, 0.15)"
                      color="var(--color-accent-purple)"
                      border="1px solid"
                      borderColor="rgba(139, 92, 246, 0.25)"
                      _hover={{ bg: "rgba(139, 92, 246, 0.25)" }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                    </Button>
                  </HStack>
                  <Button
                    w="full"
                    h="9"
                    borderRadius="lg"
                    fontSize="xs"
                    fontWeight="bold"
                    variant="outline"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _hover={{ bg: "whiteAlpha.100" }}
                    onClick={() => window.open(`/p/${user?.profile?.public_id}`, "_blank")}
                  >
                    View Landing Page <ExternalLink size={12} style={{ marginLeft: "6px" }} />
                  </Button>
                </VStack>
              )}
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="glass-card"
              p={6}
            >
              <Heading size="xs" color="var(--color-text-primary)" fontWeight="black" letterSpacing="wider" mb={5}>
                FREELANCER DETAILS
              </Heading>

              <form onSubmit={handleSaveSettings}>
                <VStack gap={4} align="stretch">
                  <Flex gap={3}>
                    <Box flex={1}>
                      <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                        HOURLY RATE
                      </Text>
                      <Input
                        type="number"
                        placeholder="e.g. 45"
                        value={settingsForm.hourly_rate}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hourly_rate: e.target.value })}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                        color="white"
                        _focus={{ borderColor: "var(--color-accent-purple)", boxShadow: "0 0 0 1px var(--color-accent-purple)" }}
                      />
                    </Box>
                    <Box w="110px">
                      <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                        CURRENCY
                      </Text>
                      <Box
                        as="select"
                        value={settingsForm.freelancer_currency}
                        onChange={(e) => setSettingsForm({ ...settingsForm, freelancer_currency: e.target.value })}
                        bg="rgba(0, 0, 0, 0.2)"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                        color="white"
                        h="10"
                        px="3"
                        borderRadius="md"
                        w="100%"
                        outline="none"
                        cursor="pointer"
                        _focus={{ borderColor: "var(--color-accent-purple)", boxShadow: "0 0 0 1px var(--color-accent-purple)" }}
                        style={{ background: "var(--color-surface)" }}
                      >
                        <option value="USD" style={{ background: "var(--color-surface)", color: "white" }}>USD ($)</option>
                        <option value="INR" style={{ background: "var(--color-surface)", color: "white" }}>INR (₹)</option>
                        <option value="EUR" style={{ background: "var(--color-surface)", color: "white" }}>EUR (€)</option>
                        <option value="GBP" style={{ background: "var(--color-surface)", color: "white" }}>GBP (£)</option>
                        <option value="CAD" style={{ background: "var(--color-surface)", color: "white" }}>CAD ($)</option>
                        <option value="AUD" style={{ background: "var(--color-surface)", color: "white" }}>AUD ($)</option>
                      </Box>
                    </Box>
                  </Flex>

                  <Box>
                    <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                      AVAILABILITY STATUS
                    </Text>
                    <Box
                      as="select"
                      value={settingsForm.freelancer_availability}
                      onChange={(e) => setSettingsForm({ ...settingsForm, freelancer_availability: e.target.value })}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      color="white"
                      h="10"
                      px="3"
                      borderRadius="md"
                      w="100%"
                      outline="none"
                      cursor="pointer"
                      _focus={{ borderColor: "var(--color-accent-purple)", boxShadow: "0 0 0 1px var(--color-accent-purple)" }}
                      style={{ background: "var(--color-surface)" }}
                    >
                      <option value="available" style={{ background: "var(--color-surface)", color: "white" }}>Available for Hire (Green)</option>
                      <option value="busy" style={{ background: "var(--color-surface)", color: "white" }}>Busy / Fully Booked (Orange)</option>
                      <option value="unavailable" style={{ background: "var(--color-surface)", color: "white" }}>Not Available (Red)</option>
                    </Box>
                  </Box>

                  <Box>
                    <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                      FREELANCER TITLE
                    </Text>
                    <Input
                      placeholder="Ex: Senior Full Stack Developer & UI Designer"
                      value={settingsForm.headline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, headline: e.target.value })}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      color="white"
                      _focus={{ borderColor: "var(--color-accent-purple)" }}
                    />
                  </Box>

                  <Box>
                    <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                      SERVICES & SKILLS (COMMA SEPARATED)
                    </Text>
                    <Input
                      placeholder="React, Node.js, UI/UX, GraphQL"
                      value={settingsForm.skillsString}
                      onChange={(e) => setSettingsForm({ ...settingsForm, skillsString: e.target.value })}
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      color="white"
                      _focus={{ borderColor: "var(--color-accent-purple)" }}
                    />
                  </Box>

                  <Box>
                    <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                      FREELANCER BIO / SUMMARY
                    </Text>
                    <Textarea
                      placeholder="Describe your freelance services, background, and what you bring to clients..."
                      value={settingsForm.about}
                      onChange={(e) => setSettingsForm({ ...settingsForm, about: e.target.value })}
                      minH="120px"
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      color="white"
                      _focus={{ borderColor: "var(--color-accent-purple)" }}
                    />
                  </Box>

                  <Button
                    type="submit"
                    w="full"
                    h="10"
                    borderRadius="lg"
                    fontWeight="black"
                    fontSize="xs"
                    letterSpacing="widest"
                    color="white"
                    isLoading={savingSettings}
                    style={{
                      background: "linear-gradient(135deg, var(--color-accent-purple) 0%, #3b82f6 100%)",
                      boxShadow: "0 4px 15px rgba(139,92,246,0.25)",
                    }}
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 20px rgba(139,92,246,0.35)",
                    }}
                  >
                    SAVE CHANGES
                  </Button>
                </VStack>
              </form>
            </MotionBox>
          </VStack>

          {/* RIGHT MAIN PANEL */}
          <VStack flex={1} gap={6} align="stretch">
            <MotionBox
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="glass-card"
              p={6}
              h="full"
            >
              <Flex justify="space-between" align="center" mb={6}>
                <VStack align="start" gap={0}>
                  <Heading size="md" color="var(--color-text-primary)" fontWeight="black" letterSpacing="tight">
                    Portfolio Projects
                  </Heading>
                  <Text color="var(--color-text-muted)" fontSize="xs">
                    Showcase your best work on your public landing page
                  </Text>
                </VStack>

                <Button
                  size="sm"
                  onClick={() => handleOpenProjectModal(null)}
                  bg="rgba(139, 92, 246, 0.15)"
                  color="var(--color-accent-purple)"
                  border="1px solid"
                  borderColor="rgba(139, 92, 246, 0.25)"
                  _hover={{ bg: "rgba(139, 92, 246, 0.25)", transform: "scale(1.02)" }}
                  transition="all 0.2s"
                >
                  <Plus size={15} style={{ marginRight: "6px" }} /> Add Project
                </Button>
              </Flex>

              {(!user?.profile?.projects || user.profile.projects.length === 0) ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={16}
                  border="1px dashed"
                  borderColor="whiteAlpha.200"
                  borderRadius="2xl"
                  bg="whiteAlpha.50"
                >
                  <Briefcase size={36} color="var(--color-text-muted)" style={{ marginBottom: "12px" }} />
                  <Text color="var(--color-text-secondary)" fontWeight="bold" fontSize="sm" mb={1}>
                    No projects added yet
                  </Text>
                  <Text color="var(--color-text-muted)" fontSize="xs">
                    Add projects to show off your capability to potential clients.
                  </Text>
                </Flex>
              ) : (
                <Box
                  display="grid"
                  gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                  gap={5}
                >
                  {user.profile.projects.map((project) => (
                    <MotionBox
                      key={project.id}
                      className="glass-card"
                      p={4}
                      style={{ background: "rgba(255, 255, 255, 0.01)" }}
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      _hover={{ borderColor: "rgba(139,92,246,0.3)", bg: "rgba(255,255,255,0.03)" }}
                      layout
                    >
                      {project.image && (
                        <Box h="150px" borderRadius="lg" overflow="hidden" mb={3} border="1px solid" borderColor="whiteAlpha.100">
                          <img
                            src={`${backendUrl}${project.image}`}
                            alt={project.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </Box>
                      )}

                      <HStack justify="space-between" align="start" mb={2}>
                        <Heading size="xs" color="var(--color-text-primary)" fontWeight="bold" isTruncated>
                          {project.title}
                        </Heading>
                        <HStack gap={1}>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="var(--color-text-muted)"
                            _hover={{ color: "var(--color-accent-purple)", bg: "whiteAlpha.100" }}
                            onClick={() => handleOpenProjectModal(project)}
                          >
                            <Edit size={12} />
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="var(--color-text-muted)"
                            _hover={{ color: "red.400", bg: "whiteAlpha.100" }}
                            isLoading={deletingProjectId === project.id}
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </HStack>
                      </HStack>

                      <Text color="var(--color-text-secondary)" fontSize="xs" lineClamp={3} mb={3} minH="45px">
                        {project.description}
                      </Text>

                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            color: "var(--color-accent-purple)",
                            fontWeight: "bold",
                            marginBottom: "10px",
                          }}
                        >
                          Visit Project <ExternalLink size={10} />
                        </a>
                      )}

                      {project.technologies && project.technologies.length > 0 && (
                        <Flex wrap="wrap" gap={1.5} pt={2} borderTop="1px solid" borderColor="whiteAlpha.50">
                          {project.technologies.map((tech, i) => (
                            <Badge
                              key={i}
                              fontSize="9px"
                              fontWeight="bold"
                              px={1.5}
                              py={0.2}
                              borderRadius="md"
                              bg="whiteAlpha.100"
                              color="whiteAlpha.700"
                              border="1px solid"
                              borderColor="whiteAlpha.100"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </Flex>
                      )}
                    </MotionBox>
                  ))}
                </Box>
              )}
            </MotionBox>
          </VStack>
        </Flex>
      </Container>

      <Dialog open={isProjectModalOpen} onOpenChange={(e) => setIsProjectModalOpen(e.open)} size="md">
        <DialogBackdrop bg="blackAlpha.900" backdropFilter="blur(10px)" zIndex={99999} />
        <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={100000}>
          <DialogContent
            bg="var(--color-surface)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            maxW="550px"
            m="auto"
            overflow="hidden"
            style={{ backdropFilter: "blur(20px)" }}
          >
            <DialogHeader color="white" py={6} px={8} borderBottom="1px solid" borderColor="whiteAlpha.100">
              <Heading size="sm" fontWeight="black" color="var(--color-text-primary)">
                {projectForm.id ? "Edit Portfolio Project" : "Add Portfolio Project"}
              </Heading>
            </DialogHeader>
            <DialogCloseTrigger color="whiteAlpha.600" top={6} right={6} />
            
            <DialogBody p={8}>
              <VStack gap={5} align="stretch">
                <Box>
                  <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                    PROJECT TITLE <span style={{ color: "#ef4444" }}>*</span>
                  </Text>
                  <Input
                    placeholder="Ex: E-commerce Checkout Redesign"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    bg="rgba(0,0,0,0.2)"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    color="white"
                    _focus={{ borderColor: "var(--color-accent-purple)" }}
                  />
                </Box>

                <Box>
                  <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                    DESCRIPTION
                  </Text>
                  <Textarea
                    placeholder="Describe the project, your contribution, problems solved, and results achieved..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    minH="100px"
                    bg="rgba(0,0,0,0.2)"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    color="white"
                    _focus={{ borderColor: "var(--color-accent-purple)" }}
                  />
                </Box>

                <Box>
                  <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                    PROJECT URL (OPTIONAL)
                  </Text>
                  <Input
                    placeholder="Ex: https://myproject.com or https://github.com/..."
                    value={projectForm.project_url}
                    onChange={(e) => setProjectForm({ ...projectForm, project_url: e.target.value })}
                    bg="rgba(0,0,0,0.2)"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    color="white"
                    _focus={{ borderColor: "var(--color-accent-purple)" }}
                  />
                </Box>

                <Box>
                  <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                    TECHNOLOGIES USED (COMMA SEPARATED)
                  </Text>
                  <Input
                    placeholder="React, Tailwind CSS, PostgreSQL"
                    value={projectForm.technologies}
                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                    bg="rgba(0,0,0,0.2)"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    color="white"
                    _focus={{ borderColor: "var(--color-accent-purple)" }}
                  />
                </Box>

                <Box>
                  <Text color="var(--color-text-secondary)" fontSize="xs" fontWeight="bold" mb={2}>
                    PROJECT PREVIEW IMAGE
                  </Text>
                  <HStack gap={4}>
                    <Button
                      as="label"
                      htmlFor="project-image-upload"
                      size="sm"
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                      cursor="pointer"
                      _hover={{ bg: "whiteAlpha.200" }}
                    >
                      <Image size={15} style={{ marginRight: "6px" }} /> Choose Image
                      <input
                        id="project-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ display: "none" }}
                      />
                    </Button>
                    <Text fontSize="xs" color="var(--color-text-muted)" isTruncated maxW="300px">
                      {selectedFile ? selectedFile.name : "No file selected"}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </DialogBody>

            <DialogFooter p={8} bg="rgba(255, 255, 255, 0.02)" borderTop="1px solid" borderColor="whiteAlpha.100">
              <Button
                variant="ghost"
                color="var(--color-text-secondary)"
                onClick={() => setIsProjectModalOpen(false)}
                _hover={{ bg: "whiteAlpha.100" }}
                mr={3}
              >
                Cancel
              </Button>
              <Button
                bg="linear-gradient(135deg, var(--color-accent-purple) 0%, #3b82f6 100%)"
                color="white"
                isLoading={savingProject}
                onClick={handleSaveProject}
                fontWeight="bold"
                px={6}
                _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 15px rgba(139,92,246,0.3)" }}
              >
                {projectForm.id ? "Update Project" : "Add Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </Dialog>
    </Box>
  );
};

export default FreelancerDashboard;
