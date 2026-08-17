import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Textarea,
  Heading,
  Badge,
  IconButton,
  Image,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Portal,
} from "@chakra-ui/react";
import {
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Camera,
  Briefcase,
  DollarSign,
  MapPin,
  Plus,
  X,
  Edit2,
  GraduationCap,
  FolderGit2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api, { backendUrl } from "../../api";

export const getProfileCompletionDetails = (user) => {
  if (!user) return { items: [], completedCount: 0, pct: 0 };

  const p = user.profile || {};
  const experiences = p.experiences || [];
  const education = p.educations || p.education || [];
  const projects = p.projects || [];
  const skills = p.skills || [];
  const hasPic = Boolean(p.profile_picture);

  const items = [
    {
      key: "profile_picture",
      label: "Upload Profile Photo",
      title: "Profile Photo",
      desc: "Upload a clean headshot photo for your profile.",
      done: hasPic,
      currentValue: hasPic ? "Photo Uploaded" : "No photo uploaded",
    },
    {
      key: "headline",
      label: "Add headline/title",
      title: "Professional Headline",
      desc: "Your primary professional title or domain specialization.",
      done: Boolean(p.headline && p.headline.trim().length > 3),
      currentValue: p.headline || "Not specified",
    },
    {
      key: "hourly_rate",
      label: "Set hourly rate",
      title: "Hourly Rate (AED)",
      desc: "Set your preferred hourly rate for project proposals.",
      done: Boolean(p.hourly_rate),
      currentValue: p.hourly_rate ? `${p.hourly_rate} AED / hr` : "Not set",
    },
    {
      key: "about",
      label: "Write bio / summary",
      title: "Bio / Summary",
      desc: "A brief summary of your expertise, background, and services.",
      done: Boolean(p.about && p.about.trim().length >= 15),
      currentValue: p.about || "No bio added yet",
    },
    {
      key: "skills",
      label: "Add 3+ skills",
      title: "Skills (3+ Required)",
      desc: "Core technical, creative, and domain competencies.",
      done: skills.length >= 3,
      currentValue: skills.length > 0 ? skills.join(", ") : "No skills added",
    },
    {
      key: "location",
      label: "Add location",
      title: "Location",
      desc: "Your current city and country.",
      done: Boolean(p.location && p.location.trim().length > 2),
      currentValue: p.location || "Location not set",
    },
    {
      key: "experiences",
      label: "Add work experience",
      title: "Work Experience",
      desc: "Your professional employment and consulting history.",
      done: experiences.length > 0,
      currentValue: experiences.length > 0 ? `${experiences.length} positions added` : "No experience listed",
    },
    {
      key: "education",
      label: "Add education details",
      title: "Education Details",
      desc: "Degrees, certifications, and academic background.",
      done: education.length > 0,
      currentValue: education.length > 0 ? `${education.length} education records` : "No education listed",
    },
    {
      key: "projects",
      label: "Add 1+ portfolio project",
      title: "Portfolio Projects",
      desc: "Showcase your top projects to prospective clients.",
      done: projects.length > 0,
      currentValue: projects.length > 0 ? `${projects.length} portfolio items` : "No projects added",
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const pct = Math.round((completedCount / items.length) * 100);

  return { items, completedCount, pct };
};

const CompleteProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const [activeStepKey, setActiveStepKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form states for profile fields
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Form states for new experience / education / project inline creation
  const [expForm, setExpForm] = useState({ company: "", title: "", start_date: "", end_date: "", current: false, description: "" });
  const [eduForm, setEduForm] = useState({ school: "", degree: "", field_of_study: "", start_date: "", end_date: "", description: "" });
  const [projForm, setProjForm] = useState({ title: "", description: "", project_url: "", technologies: "" });

  useEffect(() => {
    if (user) {
      setHeadline(user.profile?.headline || "");
      setAbout(user.profile?.about || "");
      setHourlyRate(user.profile?.hourly_rate || "");
      setLocationStr(user.profile?.location || "");
      setSkillsList(user.profile?.skills || []);
    }
  }, [user]);

  if (!user) return null;

  const experiences = user.profile?.experiences || [];
  const education = user.profile?.educations || user.profile?.education || [];
  const projects = user.profile?.projects || [];
  const profilePicPath = user.profile?.profile_picture;
  const hasPic = Boolean(profilePicPath);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${backendUrl}${path}`;
  };

  const { items: completionItems, completedCount, pct: completionPct } = getProfileCompletionDetails(user);
  const pendingItems = completionItems.filter((i) => !i.done);

  // Single field save
  const handleSaveField = async (key) => {
    setLoading(true);
    setSuccessMsg("");

    try {
      if (key === "profile_picture" && selectedFile) {
        const formData = new FormData();
        formData.append("profile_picture", selectedFile);
        await api.patch("me/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (key === "headline") {
        await api.patch("me/", { headline: headline.trim() });
      } else if (key === "about") {
        await api.patch("me/", { about: about.trim() });
      } else if (key === "hourly_rate") {
        await api.patch("me/", { hourly_rate: parseFloat(hourlyRate) || 0 });
      } else if (key === "location") {
        await api.patch("me/", { location: locationStr.trim() });
      } else if (key === "skills") {
        await api.patch("me/", { skills: skillsList });
      } else if (key === "experiences") {
        const payload = {
          company: expForm.company || "Company",
          title: expForm.title || "Position",
          start_date: expForm.start_date || "2020-01-01",
          end_date: expForm.current ? null : (expForm.end_date || null),
          current: expForm.current || false,
          description: expForm.description || "",
        };
        await api.post("experience/", payload);
        setExpForm({ company: "", title: "", start_date: "", end_date: "", current: false, description: "" });
      } else if (key === "education") {
        const payload = {
          school: eduForm.school || eduForm.institution || "School / University",
          degree: eduForm.degree || "",
          field_of_study: eduForm.field_of_study || "",
          start_date: eduForm.start_date || "2020-01-01",
          end_date: eduForm.end_date || null,
          description: eduForm.description || "",
        };
        await api.post("education/", payload);
        setEduForm({ school: "", degree: "", field_of_study: "", start_date: "", end_date: "", description: "" });
      } else if (key === "projects") {
        await api.post("portfolio-projects/", projForm);
        setProjForm({ title: "", description: "", project_url: "", technologies: "" });
      }

      setSuccessMsg(`Successfully updated ${key.replace("_", " ")}!`);
      setActiveStepKey(null);
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      console.error("Failed to update profile field", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      setSkillsList([...skillsList, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <Portal>
        <DialogBackdrop bg="blackAlpha.800" backdropFilter="blur(16px)" zIndex={99990} />
        <DialogPositioner display="flex" alignItems="center" justifyContent="center" zIndex={99995}>
          <DialogContent
            bg="var(--color-surface, #0a0f1e)"
            border="1px solid var(--color-card-border, rgba(255,255,255,0.15))"
            borderRadius="2xl"
            maxW="720px"
            w="full"
            maxH="90vh"
            display="flex"
            flexDirection="column"
            m="auto"
            overflow="hidden"
            style={{ backdropFilter: "blur(24px)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
          >
            {/* Modal Header */}
            <DialogHeader
              py={6}
              px={8}
              borderBottom="1px solid var(--color-card-border, rgba(255,255,255,0.1))"
              bg="rgba(124, 58, 237, 0.05)"
            >
              <Flex justify="space-between" align="center" w="full" pr={8}>
                <HStack gap={3}>
                  <Box p={2.5} borderRadius="xl" bg="rgba(124, 58, 237, 0.15)" border="1px solid rgba(124, 58, 237, 0.3)">
                    <UserCheck size={20} color="#a78bfa" />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Heading size="xs" color="white" fontWeight="900" letterSpacing="wide">
                      PROFILE SETUP & MANAGEMENT ({completionPct}%)
                    </Heading>
                    <Text color="var(--color-text-muted, rgba(255,255,255,0.5))" fontSize="xs">
                      {pendingItems.length === 0
                        ? "🎉 Profile is 100% complete! Review or update any details below."
                        : `${pendingItems.length} pending ${pendingItems.length === 1 ? "item" : "items"} remaining to reach 100%.`}
                    </Text>
                  </VStack>
                </HStack>

                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={completionPct >= 80 ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"}
                  color={completionPct >= 80 ? "#34d399" : "#fbbf24"}
                  border={completionPct >= 80 ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(245,158,11,0.3)"}
                  fontWeight="bold"
                  fontSize="xs"
                >
                  {completedCount}/{completionItems.length} Done
                </Badge>
              </Flex>
            </DialogHeader>

            <DialogCloseTrigger color="whiteAlpha.600" top={6} right={6} />

            <DialogBody p={8} flex={1} overflowY="auto">
              <VStack gap={6} align="stretch">
                {/* Progress Bar */}
                <Box>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="xs" fontWeight="bold" color="var(--color-text-secondary, rgba(255,255,255,0.7))">
                      OVERALL STRENGTH
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color="#c4b5fd">
                      {completionPct}%
                    </Text>
                  </Flex>
                  <Box w="full" h="8px" borderRadius="full" bg="rgba(255,255,255,0.08)" overflow="hidden">
                    <Box
                      h="100%"
                      w={`${completionPct}%`}
                      bg="linear-gradient(90deg, #7c3aed, #3b82f6, #10b981)"
                      transition="width 0.4s ease"
                    />
                  </Box>
                </Box>

                {successMsg && (
                  <Box p={3} borderRadius="xl" bg="rgba(16,185,129,0.15)" border="1px solid rgba(16,185,129,0.3)">
                    <Text fontSize="xs" color="#34d399" fontWeight="bold" textAlign="center">
                      {successMsg}
                    </Text>
                  </Box>
                )}

                {/* Profile Items Checklist */}
                <VStack align="stretch" gap={3}>
                  <Text fontSize="xs" fontWeight="800" color="#a78bfa" letterSpacing="widest">
                    ALL PROFILE SECTIONS
                  </Text>

                  {completionItems.map((item) => {
                    const isExpanded = activeStepKey === item.key;
                    return (
                      <Box
                        key={item.key}
                        p={4}
                        borderRadius="xl"
                        border={item.done ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.3)"}
                        bg={item.done ? "rgba(16, 185, 129, 0.03)" : "rgba(245, 158, 11, 0.04)"}
                        transition="all 0.2s"
                      >
                        <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                          <HStack gap={3} align="flex-start">
                            <Box mt={0.5}>
                              {item.done ? (
                                <CheckCircle2 size={18} color="#34d399" />
                              ) : (
                                <AlertCircle size={18} color="#f59e0b" />
                              )}
                            </Box>

                            <VStack align="start" gap={1}>
                              <HStack gap={2}>
                                <Text color="white" fontSize="xs" fontWeight="bold">
                                  {item.title}
                                </Text>
                                <Badge
                                  px={2}
                                  py={0.5}
                                  fontSize="9px"
                                  borderRadius="md"
                                  bg={item.done ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"}
                                  color={item.done ? "#34d399" : "#fbbf24"}
                                  fontWeight="bold"
                                >
                                  {item.done ? "COMPLETED" : "PENDING"}
                                </Badge>
                              </HStack>

                              {/* Show current value */}
                              <Text color={item.done ? "#c4b5fd" : "rgba(255,255,255,0.5)"} fontSize="11px" fontWeight={item.done ? "600" : "400"}>
                                {item.currentValue}
                              </Text>

                              {/* Additional detailed list for experience / education / projects if completed */}
                              {item.done && item.key === "experiences" && experiences.length > 0 && (
                                <VStack align="start" gap={1} mt={1}>
                                  {experiences.map((exp, expIdx) => (
                                    <Text key={expIdx} fontSize="11px" color="rgba(255,255,255,0.7)">
                                      • <strong style={{ color: "#fff" }}>{exp.title}</strong> at {exp.company}
                                    </Text>
                                  ))}
                                </VStack>
                              )}

                              {item.done && item.key === "education" && education.length > 0 && (
                                <VStack align="start" gap={1} mt={1}>
                                  {education.map((edu, eduIdx) => (
                                    <Text key={eduIdx} fontSize="11px" color="rgba(255,255,255,0.7)">
                                      • <strong style={{ color: "#fff" }}>{edu.degree}</strong> ({edu.institution})
                                    </Text>
                                  ))}
                                </VStack>
                              )}

                              {item.done && item.key === "projects" && projects.length > 0 && (
                                <VStack align="start" gap={1} mt={1}>
                                  {projects.map((proj, projIdx) => (
                                    <Text key={projIdx} fontSize="11px" color="rgba(255,255,255,0.7)">
                                      • <strong style={{ color: "#fff" }}>{proj.title}</strong> {proj.technologies ? `(${proj.technologies})` : ""}
                                    </Text>
                                  ))}
                                </VStack>
                              )}
                            </VStack>
                          </HStack>

                          <Button
                            size="xs"
                            bg={item.done ? "rgba(255,255,255,0.06)" : "rgba(245, 158, 11, 0.15)"}
                            color={item.done ? "whiteAlpha.800" : "#fbbf24"}
                            border={item.done ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(245, 158, 11, 0.3)"}
                            _hover={{ bg: item.done ? "rgba(255,255,255,0.12)" : "rgba(245, 158, 11, 0.25)" }}
                            fontWeight="bold"
                            onClick={() => setActiveStepKey(isExpanded ? null : item.key)}
                          >
                            {isExpanded ? "Close" : item.done ? "Edit / Update" : "Complete Now"}
                          </Button>
                        </Flex>

                        {/* Inline Form */}
                        {isExpanded && (
                          <Box mt={4} pt={4} borderTop="1px solid rgba(255,255,255,0.08)">
                            {item.key === "headline" && (
                              <VStack align="stretch" gap={3}>
                                <Input
                                  placeholder="Ex: Senior Full-Stack Developer | React & Django Specialist"
                                  value={headline}
                                  onChange={(e) => setHeadline(e.target.value)}
                                  size="sm"
                                  bg="rgba(0,0,0,0.3)"
                                  borderColor="rgba(255,255,255,0.15)"
                                  color="white"
                                />
                                <Button
                                  size="xs"
                                  bg="var(--color-accent, #7c3aed)"
                                  color="white"
                                  isLoading={loading}
                                  onClick={() => handleSaveField("headline")}
                                  alignSelf="flex-end"
                                >
                                  Save Headline
                                </Button>
                              </VStack>
                            )}

                            {item.key === "about" && (
                              <VStack align="stretch" gap={3}>
                                <Textarea
                                  placeholder="Write a concise overview of your skills, background, and services offered..."
                                  value={about}
                                  onChange={(e) => setAbout(e.target.value)}
                                  size="sm"
                                  minH="90px"
                                  bg="rgba(0,0,0,0.3)"
                                  borderColor="rgba(255,255,255,0.15)"
                                  color="white"
                                />
                                <Button
                                  size="xs"
                                  bg="var(--color-accent, #7c3aed)"
                                  color="white"
                                  isLoading={loading}
                                  onClick={() => handleSaveField("about")}
                                  alignSelf="flex-end"
                                >
                                  Save Bio
                                </Button>
                              </VStack>
                            )}

                            {item.key === "hourly_rate" && (
                              <VStack align="stretch" gap={3}>
                                <HStack>
                                  <Badge colorScheme="purple" p={2} borderRadius="md">AED</Badge>
                                  <Input
                                    type="number"
                                    placeholder="Ex: 75"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(e.target.value)}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    borderColor="rgba(255,255,255,0.15)"
                                    color="white"
                                  />
                                  <Text fontSize="xs" color="rgba(255,255,255,0.5)">/ hr</Text>
                                </HStack>
                                <Button
                                  size="xs"
                                  bg="var(--color-accent, #7c3aed)"
                                  color="white"
                                  isLoading={loading}
                                  onClick={() => handleSaveField("hourly_rate")}
                                  alignSelf="flex-end"
                                >
                                  Save Hourly Rate
                                </Button>
                              </VStack>
                            )}

                            {item.key === "location" && (
                              <VStack align="stretch" gap={3}>
                                <Input
                                  placeholder="Ex: Dubai, United Arab Emirates"
                                  value={locationStr}
                                  onChange={(e) => setLocationStr(e.target.value)}
                                  size="sm"
                                  bg="rgba(0,0,0,0.3)"
                                  borderColor="rgba(255,255,255,0.15)"
                                  color="white"
                                />
                                <Button
                                  size="xs"
                                  bg="var(--color-accent, #7c3aed)"
                                  color="white"
                                  isLoading={loading}
                                  onClick={() => handleSaveField("location")}
                                  alignSelf="flex-end"
                                >
                                  Save Location
                                </Button>
                              </VStack>
                            )}

                            {item.key === "skills" && (
                              <VStack align="stretch" gap={3}>
                                <HStack gap={2}>
                                  <Input
                                    placeholder="Type skill (e.g. React, Python, UI/UX)..."
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    borderColor="rgba(255,255,255,0.15)"
                                    color="white"
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                                  />
                                  <Button size="xs" onClick={handleAddSkill} bg="whiteAlpha.200" color="white">
                                    Add
                                  </Button>
                                </HStack>

                                <Flex gap={1.5} flexWrap="wrap">
                                  {skillsList.map((skill, sIdx) => (
                                    <Badge key={sIdx} bg="rgba(124, 58, 237, 0.25)" color="#c4b5fd" borderRadius="md" px={2} py={1} fontSize="11px">
                                      {skill}
                                      <X size={10} style={{ marginLeft: 4, cursor: "pointer", display: "inline" }} onClick={() => handleRemoveSkill(skill)} />
                                    </Badge>
                                  ))}
                                </Flex>

                                <Button
                                  size="xs"
                                  bg="var(--color-accent, #7c3aed)"
                                  color="white"
                                  isLoading={loading}
                                  onClick={() => handleSaveField("skills")}
                                  alignSelf="flex-end"
                                >
                                  Save Skills
                                </Button>
                              </VStack>
                            )}

                            {item.key === "profile_picture" && (
                              <VStack align="stretch" gap={3}>
                                {hasPic && (
                                  <HStack gap={3}>
                                    <Image src={getImageUrl(profilePicPath)} w="50px" h="50px" borderRadius="full" objectFit="cover" border="1px solid rgba(255,255,255,0.2)" />
                                    <Text fontSize="xs" color="rgba(255,255,255,0.7)">Current profile photo</Text>
                                  </HStack>
                                )}
                                <Input
                                  type="file"
                                  accept="image/*"
                                  size="sm"
                                  onChange={(e) => setSelectedFile(e.target.files[0])}
                                  color="white"
                                />
                                <Button
                                  size="xs"
                                  bg="var(--color-accent, #7c3aed)"
                                  color="white"
                                  isLoading={loading}
                                  onClick={() => handleSaveField("profile_picture")}
                                  alignSelf="flex-end"
                                >
                                  Upload Photo
                                </Button>
                              </VStack>
                            )}

                            {item.key === "experiences" && (
                              <VStack align="stretch" gap={3}>
                                <HStack gap={2}>
                                  <Input
                                    placeholder="Company (e.g. Acme Corp)"
                                    value={expForm.company}
                                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    color="white"
                                  />
                                  <Input
                                    placeholder="Title (e.g. Senior Engineer)"
                                    value={expForm.title}
                                    onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    color="white"
                                  />
                                </HStack>
                                <HStack gap={2}>
                                  <Input
                                    type="date"
                                    placeholder="Start Date"
                                    value={expForm.start_date}
                                    onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    color="white"
                                  />
                                  <Input
                                    type="date"
                                    placeholder="End Date"
                                    value={expForm.end_date}
                                    onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    color="white"
                                    disabled={expForm.current}
                                  />
                                </HStack>
                                <Textarea
                                  placeholder="Key accomplishments and responsibilities..."
                                  value={expForm.description}
                                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                                  size="sm"
                                  bg="rgba(0,0,0,0.3)"
                                  color="white"
                                />
                                <Button
                                  size="xs"
                                  bg="var(--color-accent, #7c3aed)"
                                  color="white"
                                  isLoading={loading}
                                  onClick={() => handleSaveField("experiences")}
                                  alignSelf="flex-end"
                                >
                                  Add Experience
                                </Button>
                              </VStack>
                            )}

                            {item.key === "education" && (
                              <VStack align="stretch" gap={3}>
                                <HStack gap={2}>
                                  <Input
                                    placeholder="School / Institution (e.g. Stanford University)"
                                    value={eduForm.school}
                                    onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    color="white"
                                  />
                                  <Input
                                    placeholder="Degree (e.g. Bachelor of Science)"
                                    value={eduForm.degree}
                                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    color="white"
                                  />
                                </HStack>
                                <Input
                                  placeholder="Field of Study (e.g. Computer Science)"
                                  value={eduForm.field_of_study}
                                  onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })}
                                  size="sm"
                                  bg="rgba(0,0,0,0.3)"
                                  color="white"
                                />
                                <HStack gap={2}>
                                  <VStack align="start" flex={1} gap={0}>
                                    <Text fontSize="10px" color="rgba(255,255,255,0.4)">Start Date</Text>
                                    <Input
                                      type="date"
                                      value={eduForm.start_date}
                                      onChange={(e) => setEduForm({ ...eduForm, start_date: e.target.value })}
                                      size="sm"
                                      bg="rgba(0,0,0,0.3)"
                                      color="white"
                                    />
                                  </VStack>
                                  <VStack align="start" flex={1} gap={0}>
                                    <Text fontSize="10px" color="rgba(255,255,255,0.4)">End Date (Optional)</Text>
                                    <Input
                                      type="date"
                                      value={eduForm.end_date}
                                      onChange={(e) => setEduForm({ ...eduForm, end_date: e.target.value })}
                                      size="sm"
                                      bg="rgba(0,0,0,0.3)"
                                      color="white"
                                    />
                                  </VStack>
                                </HStack>
                                <Button
                                  size="xs"
                                  bg="var(--color-accent, #7c3aed)"
                                  color="white"
                                  isLoading={loading}
                                  onClick={() => handleSaveField("education")}
                                  alignSelf="flex-end"
                                >
                                  Add Education
                                </Button>
                              </VStack>
                            )}

                            {item.key === "projects" && (
                              <VStack align="stretch" gap={3}>
                                <Input
                                  placeholder="Project Title (e.g. E-Commerce Platform)"
                                  value={projForm.title}
                                  onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                                  size="sm"
                                  bg="rgba(0,0,0,0.3)"
                                  color="white"
                                />
                                <Textarea
                                  placeholder="Project description and impact..."
                                  value={projForm.description}
                                  onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                                  size="sm"
                                  bg="rgba(0,0,0,0.3)"
                                  color="white"
                                />
                                <HStack gap={2}>
                                  <Input
                                    placeholder="Technologies (e.g. React, Django, PostgreSQL)"
                                    value={projForm.technologies}
                                    onChange={(e) => setProjForm({ ...projForm, technologies: e.target.value })}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    color="white"
                                  />
                                  <Input
                                    placeholder="Project URL (e.g. https://...)"
                                    value={projForm.project_url}
                                    onChange={(e) => setProjForm({ ...projForm, project_url: e.target.value })}
                                    size="sm"
                                    bg="rgba(0,0,0,0.3)"
                                    color="white"
                                  />
                                </HStack>
                                <Button
                                  size="xs"
                                  bg="var(--color-accent, #7c3aed)"
                                  color="white"
                                  isLoading={loading}
                                  onClick={() => handleSaveField("projects")}
                                  alignSelf="flex-end"
                                >
                                  Add Project
                                </Button>
                              </VStack>
                            )}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              </VStack>
            </DialogBody>

            <DialogFooter p={6} bg="rgba(0,0,0,0.2)" borderTop="1px solid rgba(255,255,255,0.08)">
              <Button size="sm" variant="ghost" color="whiteAlpha.700" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog>
  );
};

export default CompleteProfileModal;
