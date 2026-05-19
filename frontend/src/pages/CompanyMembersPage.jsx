import React, { useState, useEffect } from "react";
import { 
  Input, IconButton, Grid, Box, Flex, Text, Button, VStack, HStack, Container, Spinner 
} from "@chakra-ui/react";
import { ArrowLeft, Search, UserPlus, UserMinus, ShieldAlert, CheckCircle, AlertCircle, Building2, Mail, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CompanyMemberSearch from "../components/company/CompanyMemberSearch";
import api from "../api";

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const CompanyMembersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("user");
  const [position, setPosition] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const fetchCompanyAndUser = async () => {
    try {
      const [cRes, uRes] = await Promise.all([
        api.get(`companies/${id}/`),
        api.get("me/")
      ]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyAndUser();
  }, [id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const openAddModal = (user) => {
    setSelectedUser(user);
    setRole("user");
    setPosition("");
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setSelectedUser(member);
    setRole(member.access_role || "user");
    setPosition(member.position || "");
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSaveMember = async () => {
    if (!selectedUser) return;
    try {
      if (isEditing) {
        await api.patch(`companies/${id}/update_member/`, { user_id: selectedUser.id, access_role: role, position });
        showSuccess("Member updated successfully");
      } else {
        await api.post(`companies/${id}/attach_user/`, { user_id: selectedUser.id, access_role: role, position });
        showSuccess("Member added successfully");
      }
      fetchCompanyAndUser();
      setModalOpen(false);
    } catch (err) {
      showError(`Failed to ${isEditing ? 'update' : 'add'} member`);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.post(`companies/${id}/detach_user/`, { user_id: userId });
      showSuccess("Member removed successfully");
      fetchCompanyAndUser();
    } catch (err) {
      showError("Failed to remove member");
    }
  };

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <Spinner size="xl" thickness="4px" color="var(--color-accent)" />
      </Flex>
    );
  }

  if (!company) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <Text color="white">Company not found.</Text>
      </Flex>
    );
  }

  const isOwner = currentUser && company.creator === currentUser.id;
  const currentUserMemberInfo = company?.members_details?.find(m => m.id === currentUser?.id);
  const isAdmin = currentUserMemberInfo?.access_role === 'admin';
  const hasAccess = isOwner || isAdmin;
  const accentColor = "#CD2426"; // Red accent from index.css

  if (!hasAccess) {
    return (
      <Flex h="100vh" direction="column" align="center" justify="center" bg="var(--color-primary)" gap={4}>
        <ShieldAlert size={48} color="#ef4444" />
        <Text color="white" fontSize="xl" fontWeight="bold">Access Denied</Text>
        <Text color="rgba(255,255,255,0.6)">Only company admins can manage members.</Text>
        <Button mt={4} onClick={() => navigate(`/company/${id}`)} colorScheme="blue">
          Back to Dashboard
        </Button>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" pb="100px" overflow="hidden">
      {/* Decorative Background Elements */}
      <Box position="absolute" top="-20%" left="-10%" w="60%" h="60%" bg={`${accentColor}15`} filter="blur(150px)" borderRadius="full" zIndex={0} pointerEvents="none" />
      <Box position="absolute" bottom="-10%" right="-5%" w="40%" h="40%" bg="purple.500" opacity="0.05" filter="blur(120px)" borderRadius="full" zIndex={0} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        <Container maxW="1200px" px={{ base: 6, md: 10 }} pt={10}>
          
          {/* Notifications */}
          <Box position="fixed" top="90px" left="50%" transform="translateX(-50%)" zIndex={100} w="full" maxW="500px" px={4}>
            <AnimatePresence>
              {errorMsg && (
                <MotionFlex initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  bg="rgba(239, 68, 68, 0.9)" backdropFilter="blur(10px)" color="white" p={4} borderRadius="xl" mb={3} align="center" gap={3} boxShadow="2xl">
                  <AlertCircle size={20} />
                  <Text fontSize="sm" fontWeight="bold">{errorMsg}</Text>
                </MotionFlex>
              )}
              {successMsg && (
                <MotionFlex initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  bg="rgba(34, 197, 94, 0.9)" backdropFilter="blur(10px)" color="white" p={4} borderRadius="xl" mb={3} align="center" gap={3} boxShadow="2xl">
                  <CheckCircle size={20} />
                  <Text fontSize="sm" fontWeight="bold">{successMsg}</Text>
                </MotionFlex>
              )}
            </AnimatePresence>
          </Box>

          {/* Header Section */}
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "end" }} mb={12} gap={6}>
            <Box>
              <Button variant="ghost" color="rgba(255,255,255,0.5)" fontWeight="bold" fontSize="xs"
                letterSpacing="widest" px={0} mb={6} _hover={{ color: "white", transform: "translateX(-4px)" }} transition="all 0.3s"
                onClick={() => navigate(`/company/${id}`)}>
                <ArrowLeft size={14} style={{ marginRight: "8px" }} />
                BACK TO DASHBOARD
              </Button>
              <Text fontSize="4xl" fontWeight="black" color="white" letterSpacing="tight" lineHeight="1.1" mb={2}>
                Team Management
              </Text>
              <HStack gap={2} color="rgba(255,255,255,0.6)">
                <Building2 size={16} />
                <Text fontSize="md">{company.name}</Text>
              </HStack>
            </Box>
            
            <Flex align="center" gap={4} p={4} borderRadius="2xl" border="1px solid rgba(255,255,255,0.05)"
              bg="rgba(255,255,255,0.02)" backdropFilter="blur(10px)">
              <VStack align="end" gap={0}>
                <Text color="rgba(255,255,255,0.5)" fontSize="xs" fontWeight="bold" letterSpacing="wider">TOTAL MEMBERS</Text>
                <Text color="white" fontSize="2xl" fontWeight="black">{company.members_details?.length || 0}</Text>
              </VStack>
              <Box w="48px" h="48px" borderRadius="xl" display="flex" alignItems="center" justifyContent="center"
                style={{ background: `linear-gradient(135deg, ${accentColor}40, rgba(15,23,42,0.8))` }}
                border={`1px solid ${accentColor}30`}>
                <UserPlus size={20} color={accentColor} />
              </Box>
            </Flex>
          </Flex>

          <Grid templateColumns={{ base: "1fr", lg: "380px 1fr" }} gap={8} alignItems="start">
            
            {/* Left Column: Search & Add */}
            <CompanyMemberSearch 
              company={company} 
              openAddModal={openAddModal} 
              accentColor={accentColor} 
            />

            {/* Right Column: Current Members */}
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={5}>
                {(company.members_details || []).map((member, i) => (
                  <MotionBox key={member.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                    <Flex direction="row" p={5} borderRadius="3xl" border="1px solid rgba(255,255,255,0.06)"
                      style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}
                      _hover={{ borderColor: "rgba(255,255,255,0.15)", bg: "rgba(255,255,255,0.04)", transform: "translateY(-4px)", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)" }}
                      transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" position="relative" group
                      align="center" justify="space-between" minH="120px" gap={4}
                      cursor={member.public_id ? "pointer" : "default"}
                      onClick={() => member.public_id && navigate(`/p/${member.public_id}`)}
                    >
                      {/* Top Role Tag */}
                      {member.id === company.creator ? (
                        <Box
                          position="absolute" top="-1px" left="50%" transform="translateX(-50%)"
                          px={3} py={0.5} borderRadius="0 0 10px 10px"
                          bg={`linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`}
                          boxShadow={`0 4px 15px ${accentColor}60`}
                          zIndex={2}
                        >
                          <Text fontSize="9px" fontWeight="black" color="white" letterSpacing="widest">OWNER</Text>
                        </Box>
                      ) : member.access_role === 'admin' ? (
                        <Box
                          position="absolute" top="1px" right="1px" transform="translateX(-50%)"
                          px={3} py={0.5} borderRadius="0 0 10px 10px"
                          bg="linear-gradient(135deg, #ef4444, #dc2626)"
                          boxShadow="0 4px 15px rgba(239,68,68,0.5)"
                          zIndex={2}
                        >
                          <Text fontSize="9px" fontWeight="black" color="white" letterSpacing="widest">ADMIN</Text>
                        </Box>
                      ) : null}

                      <Flex align="center" gap={4} flex={1} overflow="hidden">
                        <Box w="60px" h="60px" borderRadius="full" overflow="hidden" border={`2px solid rgba(255,255,255,0.1)`}
                          p={0.5} bg="rgba(0,0,0,0.2)" flexShrink={0}
                        >
                          <Box w="full" h="full" borderRadius="full" overflow="hidden" bg="rgba(255,255,255,0.1)">
                            {member.profile_picture ? (
                              <img src={member.profile_picture} alt={member.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Flex w="full" h="full" align="center" justify="center" bg={`linear-gradient(135deg, ${accentColor}40, transparent)`}>
                                <Text fontWeight="black" fontSize="xl" color="white">
                                  {member.first_name ? member.first_name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                                </Text>
                              </Flex>
                            )}
                          </Box>
                        </Box>

                        <VStack gap={0.5} align="start" overflow="hidden">
                          <Text color="white" fontSize="md" fontWeight="bold" letterSpacing="tight" noOfLines={1}>
                            {member.first_name ? `${member.first_name} ${member.last_name}`.trim() : member.email.split('@')[0]}
                          </Text>
                          <Text color="rgba(255,255,255,0.5)" fontSize="xs" fontWeight="medium" noOfLines={1} mb={1}>
                            {member.position || member.headline || "Team Member"}
                          </Text>
                          <HStack bg="rgba(0,0,0,0.3)" px={2.5} py={1} borderRadius="full" border="1px solid rgba(255,255,255,0.05)">
                            <Mail size={10} color="rgba(255,255,255,0.4)" />
                            <Text color="rgba(255,255,255,0.6)" fontSize="2xs" isTruncated maxW="150px">{member.email}</Text>
                          </HStack>
                        </VStack>
                      </Flex>

                      {/* Actions */}
                      {member.id !== company.creator && hasAccess && (
                        <Flex opacity={0.3} _hover={{ opacity: 1 }} transition="all 0.2s" gap={1}>
                          <IconButton aria-label="Edit member" size="sm" borderRadius="full"
                            bg="rgba(255,255,255,0.1)" color="white" _hover={{ bg: "rgba(255,255,255,0.2)" }} 
                            onClick={(e) => { e.stopPropagation(); openEditModal(member); }}>
                            <Settings2 size={14} />
                          </IconButton>
                          <IconButton aria-label="Remove member" size="sm" borderRadius="full"
                            bg="#ef4444" color="white" _hover={{ bg: "#dc2626" }} 
                            onClick={(e) => { e.stopPropagation(); handleRemoveMember(member.id); }}>
                            <UserMinus size={14} />
                          </IconButton>
                        </Flex>
                      )}
                    </Flex>
                  </MotionBox>
                ))}
              </Grid>
            </MotionBox>
          </Grid>

        </Container>
      </Box>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {modalOpen && (
          <Box position="fixed" inset={0} zIndex={100} display="flex" alignItems="center" justifyContent="center">
            {/* Backdrop */}
            <MotionBox position="absolute" inset={0} bg="rgba(0,0,0,0.6)" backdropFilter="blur(10px)"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} />
            
            {/* Modal Content */}
            <MotionBox position="relative" w="full" maxW="400px" bg="rgba(15,23,42,0.9)" border="1px solid rgba(255,255,255,0.1)"
              borderRadius="2xl" p={6} boxShadow="0 25px 50px -12px rgba(0,0,0,0.5)"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              
              <Text fontSize="xl" fontWeight="black" color="white" mb={4}>
                {isEditing ? "Edit Member" : "Add Member"}
              </Text>

              <VStack gap={4} align="stretch">
                {/* User Preview */}
                {selectedUser && (
                  <HStack gap={3} p={3} borderRadius="xl" bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.05)">
                    <Box w="40px" h="40px" borderRadius="full" overflow="hidden" bg="rgba(255,255,255,0.1)">
                      {selectedUser.profile_picture ? (
                        <img src={selectedUser.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Flex w="full" h="full" align="center" justify="center">
                          <Text fontWeight="black" color="white">{selectedUser.first_name ? selectedUser.first_name.charAt(0).toUpperCase() : selectedUser.email.charAt(0).toUpperCase()}</Text>
                        </Flex>
                      )}
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text color="white" fontSize="sm" fontWeight="bold">{selectedUser.first_name ? `${selectedUser.first_name} ${selectedUser.last_name}` : selectedUser.email.split('@')[0]}</Text>
                      <Text color="rgba(255,255,255,0.5)" fontSize="xs">{selectedUser.email}</Text>
                    </VStack>
                  </HStack>
                )}

                {/* Role Selection */}
                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2} letterSpacing="widest">ACCESS ROLE</Text>
                  <Flex gap={2}>
                    <Button flex={1} 
                      bg={role === "user" ? accentColor : "transparent"} 
                      color={role === "user" ? "white" : "rgba(255,255,255,0.5)"}
                      border="1px solid" borderColor={role === "user" ? accentColor : "rgba(255,255,255,0.2)"}
                      _hover={{ filter: role === "user" ? "brightness(1.1)" : "none", bg: role !== "user" ? "rgba(255,255,255,0.05)" : accentColor }}
                      onClick={() => setRole("user")}>
                      User
                    </Button>
                    <Button flex={1} 
                      bg={role === "admin" ? "#ef4444" : "transparent"} 
                      color={role === "admin" ? "white" : "rgba(255,255,255,0.5)"}
                      border="1px solid" borderColor={role === "admin" ? "#ef4444" : "rgba(255,255,255,0.2)"}
                      _hover={{ bg: role === "admin" ? "#dc2626" : "rgba(255,255,255,0.05)" }}
                      onClick={() => setRole("admin")}>
                      Admin
                    </Button>
                  </Flex>
                </Box>

                {/* Position Input */}
                <Box>
                  <Text color="rgba(255,255,255,0.6)" fontSize="xs" fontWeight="bold" mb={2} letterSpacing="widest">JOB POSITION</Text>
                  <Input 
                    value={position} onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                    bg="rgba(0,0,0,0.2)" border="1px solid rgba(255,255,255,0.1)" color="white"
                    _hover={{ borderColor: "rgba(255,255,255,0.2)" }} _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                  />
                </Box>
              </VStack>

              <HStack mt={6} justify="flex-end" gap={3}>
                <Button variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button colorScheme="blue" bg={accentColor} _hover={{ filter: "brightness(1.1)" }} onClick={handleSaveMember}>
                  {isEditing ? "Save Changes" : "Add Member"}
                </Button>
              </HStack>
            </MotionBox>
          </Box>
        )}
      </AnimatePresence>

    </Box>
  );
};

export default CompanyMembersPage;
