import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, GridItem } from "@chakra-ui/react";
import { Building2, ArrowLeft, Globe, MapPin, Users, Calendar, Link2, AtSign, Settings2, Briefcase, TrendingUp, Award, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CompanyProfileModal from "../components/company/CompanyProfileModal";
import api from "../api";

const MotionBox = motion.create(Box);

const INDUSTRY_LABELS = {
  technology: "Technology", finance: "Finance", healthcare: "Healthcare",
  education: "Education", retail: "Retail & E-commerce", manufacturing: "Manufacturing",
  media: "Media & Entertainment", real_estate: "Real Estate", consulting: "Consulting",
  logistics: "Logistics", hospitality: "Hospitality", energy: "Energy", other: "Other",
};
const SIZE_LABELS = {
  "1-10": "1–10", "11-50": "11–50", "51-200": "51–200",
  "201-500": "201–500", "501-1000": "501–1000", "1001+": "1001+",
};

const INDUSTRY_COLORS = {
  technology: "#3b82f6", finance: "#10b981", healthcare: "#ef4444",
  education: "#f59e0b", retail: "#8b5cf6", manufacturing: "#6b7280",
  media: "#ec4899", real_estate: "#f97316", consulting: "#06b6d4",
  logistics: "#84cc16", hospitality: "#a78bfa", energy: "#fbbf24", other: "#9ca3af",
};

const StatCard = ({ icon: Icon, label, value, color = "rgba(66,153,225,0.8)", delay = 0 }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    flex={1}
    p={5}
    borderRadius="2xl"
    border="1px solid rgba(255,255,255,0.07)"
    style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)" }}
    _hover={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" }}
    transition="all 0.2s"
    textAlign="center"
  >
    <Flex
      w="40px" h="40px" borderRadius="xl" align="center" justify="center"
      mx="auto" mb={3}
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <Icon size={18} color={color} />
    </Flex>
    <Text color="white" fontWeight="black" fontSize="xl" lineHeight="1">{value || "—"}</Text>
    <Text color="rgba(255,255,255,0.35)" fontSize="9px" fontWeight="black" letterSpacing="widest" mt={1}>{label}</Text>
  </MotionBox>
);

const CompanyDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCompany = async () => {
    try {
      const [cRes, uRes] = await Promise.all([api.get(`companies/${id}/`), api.get("me/")]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCompany(); }, [id]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const isOwner = currentUser && company && company.creator === currentUser.id;
  const accentColor = INDUSTRY_COLORS[company?.industry] || "#3b82f6";

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

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="hidden" pb="60px">
      {/* Animated background */}
      <Box position="fixed" inset={0} zIndex={0} pointerEvents="none">
        <Box position="absolute" top="-20%" left="-10%" w="600px" h="600px" borderRadius="full"
          style={{ background: `radial-gradient(circle, ${accentColor}18 0%, transparent 65%)`, filter: "blur(60px)" }}
        />
        <Box position="absolute" bottom="-20%" right="-10%" w="500px" h="500px" borderRadius="full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)", filter: "blur(60px)" }}
        />
      </Box>

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        {/* ── HERO BANNER ── */}
        <Box position="relative" h="280px" overflow="hidden">
          {/* Banner bg */}
          <Box position="absolute" inset={0}
            style={{
              background: `linear-gradient(135deg, ${accentColor}40 0%, rgba(139,92,246,0.25) 50%, rgba(15,23,42,0.95) 100%)`,
            }}
          />
          {/* Grid pattern overlay */}
          <Box position="absolute" inset={0} opacity={0.07}
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Glow orb */}
          <Box position="absolute" top="-60px" left="50%" transform="translateX(-50%)" w="400px" h="400px" borderRadius="full"
            style={{ background: `radial-gradient(circle, ${accentColor}25 0%, transparent 65%)`, filter: "blur(40px)" }}
          />

          {/* Back button */}
          <Box position="absolute" top="90px" left={0} right={0}>
            <Container maxW="1000px" px={6}>
              <MotionBox initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <Button variant="ghost" color="rgba(255,255,255,0.5)" fontWeight="bold" fontSize="xs"
                  letterSpacing="widest" px={0} _hover={{ color: "white" }} onClick={() => navigate("/profile")}>
                  <ArrowLeft size={13} style={{ marginRight: "7px" }} />
                  PERSONAL PROFILE
                </Button>
              </MotionBox>
            </Container>
          </Box>
        </Box>

        <Container maxW="1000px" px={6} mt="-90px" position="relative" zIndex={2}>
          {/* ── PROFILE ROW ── */}
          <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Flex align="flex-end" justify="space-between" mb={6} gap={4} flexWrap="wrap">
              {/* Logo + identity */}
              <HStack align="flex-end" gap={5}>
                {/* Logo */}
                <Box position="relative">
                  <Box w="100px" h="100px" borderRadius="2xl" overflow="hidden" flexShrink={0}
                    border="3px solid rgba(255,255,255,0.15)"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}20, rgba(15,23,42,0.95))`,
                      boxShadow: `0 20px 60px ${accentColor}40, 0 0 0 1px rgba(255,255,255,0.08)`,
                    }}
                  >
                    {company.logo_url ? (
                      <Box as="img" src={company.logo_url} alt={company.name} w="full" h="full" style={{ objectFit: "cover" }} />
                    ) : (
                      <Flex w="full" h="full" align="center" justify="center">
                        <Text fontWeight="black" fontSize="3xl" letterSpacing="tight" style={{ color: accentColor }}>
                          {company.name.charAt(0).toUpperCase()}
                        </Text>
                      </Flex>
                    )}
                  </Box>
                  {/* Active dot */}
                  {company.is_active && (
                    <Box position="absolute" bottom="4px" right="4px" w="14px" h="14px" borderRadius="full" bg="green.400"
                      border="2px solid rgba(15,23,42,0.9)"
                      style={{ boxShadow: "0 0 10px rgba(72,199,116,0.8)" }}
                    />
                  )}
                </Box>

                <VStack align="start" gap={1} pb={1}>
                  <HStack gap={2} flexWrap="wrap">
                    {isOwner && (
                      <Badge px={2} py={0.5} fontSize="2xs" fontWeight="black" borderRadius="full"
                        style={{ background: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}40` }}>
                        OWNER
                      </Badge>
                    )}
                    {company.industry && (
                      <Badge px={2} py={0.5} fontSize="2xs" fontWeight="black" borderRadius="full"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
                        {INDUSTRY_LABELS[company.industry] || company.industry}
                      </Badge>
                    )}
                  </HStack>
                  <Text color="white" fontWeight="black" fontSize="2xl" letterSpacing="tight" lineHeight="1">
                    {company.name}
                  </Text>
                  {company.tagline && (
                    <Text color="rgba(255,255,255,0.45)" fontSize="sm" fontStyle="italic">
                      "{company.tagline}"
                    </Text>
                  )}
                </VStack>
              </HStack>

              {/* Actions */}
              <HStack gap={3} pb={2}>
                {company.website && (
                  <Box as="a" href={company.website} target="_blank" rel="noopener noreferrer"
                    px={4} py={2} borderRadius="xl" border="1px solid rgba(255,255,255,0.12)"
                    style={{ background: "rgba(255,255,255,0.06)", cursor: "pointer" }}
                    _hover={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)" }}
                    transition="all 0.2s"
                  >
                    <HStack gap={2}>
                      <ExternalLink size={13} color="rgba(255,255,255,0.6)" />
                      <Text fontSize="10px" fontWeight="black" letterSpacing="widest" color="rgba(255,255,255,0.6)">WEBSITE</Text>
                    </HStack>
                  </Box>
                )}
                {isOwner && (
                  <Button h="9" px={5} borderRadius="xl" fontWeight="black" fontSize="xs" letterSpacing="widest" color="white"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, rgba(139,92,246,0.9))`,
                      boxShadow: `0 4px 20px ${accentColor}40`,
                    }}
                    _hover={{ transform: "translateY(-2px)", boxShadow: `0 8px 30px ${accentColor}60` }}
                    transition="all 0.2s"
                  >
                    <Settings2 size={13} style={{ marginRight: "6px" }} />
                    EDIT PROFILE
                  </Button>
                )}
              </HStack>
            </Flex>
          </MotionBox>

          {/* ── STATS ROW ── */}
          <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} mb={6}>
            <Flex gap={4} flexWrap="wrap">
              <StatCard icon={Users} label="MEMBERS" value={company.members.length} color={accentColor} delay={0.1} />
              {company.founded_year && (
                <StatCard icon={Calendar} label="FOUNDED" value={company.founded_year} color="rgba(139,92,246,0.9)" delay={0.15} />
              )}
              {company.company_size && (
                <StatCard icon={TrendingUp} label="TEAM SIZE" value={SIZE_LABELS[company.company_size]} color="rgba(16,185,129,0.9)" delay={0.2} />
              )}
              {company.location && (
                <StatCard icon={MapPin} label="LOCATION" value={company.location} color="rgba(245,158,11,0.9)" delay={0.25} />
              )}
            </Flex>
          </MotionBox>

          {/* ── MAIN CONTENT GRID ── */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={6}>
            {/* Left column */}
            <VStack gap={5} align="stretch">
              {/* About */}
              {company.description && (
                <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                  p={7} borderRadius="2xl" border="1px solid rgba(255,255,255,0.07)"
                  style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)" }}
                >
                  <HStack gap={3} mb={5}>
                    <Box w="3px" h="20px" borderRadius="full" style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }} />
                    <Text color="rgba(255,255,255,0.4)" fontSize="10px" fontWeight="black" letterSpacing="widest">ABOUT</Text>
                  </HStack>
                  <Text color="rgba(255,255,255,0.75)" fontSize="sm" lineHeight="1.9" fontWeight="normal">
                    {company.description}
                  </Text>
                </MotionBox>
              )}

              {/* Members */}
              <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
                p={7} borderRadius="2xl" border="1px solid rgba(255,255,255,0.07)"
                style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)" }}
              >
                <HStack gap={3} mb={5} justify="space-between">
                  <HStack gap={3}>
                    <Box w="3px" h="20px" borderRadius="full" style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }} />
                    <Text color="rgba(255,255,255,0.4)" fontSize="10px" fontWeight="black" letterSpacing="widest">MEMBERS</Text>
                  </HStack>
                  <Box px={2} py={0.5} borderRadius="full" style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}>
                    <Text fontSize="10px" fontWeight="black" style={{ color: accentColor }}>{company.members.length}</Text>
                  </Box>
                </HStack>

                {company.members.length === 0 ? (
                  <Flex direction="column" align="center" py={8} gap={3}>
                    <Box w="60px" h="60px" borderRadius="2xl" display="flex" alignItems="center" justifyContent="center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <Users size={24} color="rgba(255,255,255,0.1)" />
                    </Box>
                    <Text color="rgba(255,255,255,0.25)" fontSize="sm">No members yet</Text>
                  </Flex>
                ) : (
                  <Flex gap={3} flexWrap="wrap">
                    {company.members.map((memberId, i) => (
                      <Box key={memberId} px={4} py={2} borderRadius="xl"
                        border="1px solid rgba(255,255,255,0.08)"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                        _hover={{ borderColor: `${accentColor}40`, background: `${accentColor}0a` }}
                        transition="all 0.2s"
                      >
                        <HStack gap={2}>
                          <Box w="22px" h="22px" borderRadius="full" display="flex" alignItems="center" justifyContent="center"
                            style={{ background: `${accentColor}20` }}>
                            <Text fontSize="9px" fontWeight="black" style={{ color: accentColor }}>{String(memberId).slice(-2)}</Text>
                          </Box>
                          <Text color="rgba(255,255,255,0.55)" fontSize="xs" fontWeight="bold">Member</Text>
                        </HStack>
                      </Box>
                    ))}
                  </Flex>
                )}
              </MotionBox>
            </VStack>

            {/* Right sidebar */}
            <VStack gap={5} align="stretch">
              {/* Quick info card */}
              <MotionBox initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                p={6} borderRadius="2xl" border="1px solid rgba(255,255,255,0.07)"
                style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)" }}
              >
                <Text color="rgba(255,255,255,0.3)" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={5}>COMPANY INFO</Text>
                <VStack align="stretch" gap={4}>
                  {[
                    { icon: Briefcase, label: "Industry", value: INDUSTRY_LABELS[company.industry] },
                    { icon: MapPin, label: "Location", value: company.location },
                    { icon: TrendingUp, label: "Size", value: SIZE_LABELS[company.company_size] },
                    { icon: Calendar, label: "Founded", value: company.founded_year },
                  ].filter(i => i.value).map(({ icon: Icon, label, value }) => (
                    <Flex key={label} align="center" gap={3}>
                      <Box w="32px" h="32px" borderRadius="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0}
                        style={{ background: "rgba(255,255,255,0.05)" }}>
                        <Icon size={14} color="rgba(255,255,255,0.4)" />
                      </Box>
                      <VStack align="start" gap={0}>
                        <Text color="rgba(255,255,255,0.3)" fontSize="9px" fontWeight="black" letterSpacing="widest">{label.toUpperCase()}</Text>
                        <Text color="rgba(255,255,255,0.75)" fontSize="xs" fontWeight="bold">{value}</Text>
                      </VStack>
                    </Flex>
                  ))}
                </VStack>
              </MotionBox>

              {/* Social links */}
              {(company.linkedin_url || company.twitter_url || company.website) && (
                <MotionBox initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
                  p={6} borderRadius="2xl" border="1px solid rgba(255,255,255,0.07)"
                  style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)" }}
                >
                  <Text color="rgba(255,255,255,0.3)" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={4}>CONNECT</Text>
                  <VStack align="stretch" gap={3}>
                    {company.website && (
                      <Box as="a" href={company.website} target="_blank" rel="noopener noreferrer"
                        px={4} py={3} borderRadius="xl" border="1px solid rgba(255,255,255,0.08)"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                        _hover={{ borderColor: `${accentColor}50`, background: `${accentColor}0d` }}
                        transition="all 0.2s"
                      >
                        <HStack gap={3}>
                          <Globe size={15} color={accentColor} />
                          <Text fontSize="xs" fontWeight="bold" color="rgba(255,255,255,0.7)">
                            {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </Text>
                          <ExternalLink size={11} color="rgba(255,255,255,0.25)" style={{ marginLeft: "auto" }} />
                        </HStack>
                      </Box>
                    )}
                    {company.linkedin_url && (
                      <Box as="a" href={company.linkedin_url} target="_blank" rel="noopener noreferrer"
                        px={4} py={3} borderRadius="xl" border="1px solid rgba(66,153,225,0.15)"
                        style={{ background: "rgba(66,153,225,0.05)" }}
                        _hover={{ borderColor: "rgba(66,153,225,0.4)", background: "rgba(66,153,225,0.1)" }}
                        transition="all 0.2s"
                      >
                        <HStack gap={3}>
                          <Link2 size={15} color="rgba(66,153,225,0.8)" />
                          <Text fontSize="xs" fontWeight="bold" color="rgba(66,153,225,0.8)">LinkedIn</Text>
                          <ExternalLink size={11} color="rgba(66,153,225,0.3)" style={{ marginLeft: "auto" }} />
                        </HStack>
                      </Box>
                    )}
                    {company.twitter_url && (
                      <Box as="a" href={company.twitter_url} target="_blank" rel="noopener noreferrer"
                        px={4} py={3} borderRadius="xl" border="1px solid rgba(100,200,255,0.15)"
                        style={{ background: "rgba(100,200,255,0.04)" }}
                        _hover={{ borderColor: "rgba(100,200,255,0.4)", background: "rgba(100,200,255,0.09)" }}
                        transition="all 0.2s"
                      >
                        <HStack gap={3}>
                          <AtSign size={15} color="rgba(100,200,255,0.8)" />
                          <Text fontSize="xs" fontWeight="bold" color="rgba(100,200,255,0.8)">Twitter / X</Text>
                          <ExternalLink size={11} color="rgba(100,200,255,0.3)" style={{ marginLeft: "auto" }} />
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </MotionBox>
              )}

              {/* Owner badge card */}
              {isOwner && (
                <MotionBox initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
                  p={6} borderRadius="2xl"
                  border="1px solid"
                  borderColor={`${accentColor}30`}
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}0f 0%, rgba(15,23,42,0.5) 100%)`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <HStack gap={3} mb={3}>
                    <Box w="36px" h="36px" borderRadius="xl" display="flex" alignItems="center" justifyContent="center"
                      style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}>
                      <Award size={16} color={accentColor} />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text color="rgba(255,255,255,0.4)" fontSize="9px" fontWeight="black" letterSpacing="widest">ACCOUNT TYPE</Text>
                      <Text color="white" fontSize="sm" fontWeight="black">Company Owner</Text>
                    </VStack>
                  </HStack>
                  <Button w="full" h="9" borderRadius="xl" fontWeight="black" fontSize="xs" letterSpacing="widest" color="white"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, rgba(139,92,246,0.8))`,
                      boxShadow: `0 4px 15px ${accentColor}35`,
                    }}
                    _hover={{ transform: "translateY(-1px)", boxShadow: `0 8px 25px ${accentColor}50` }}
                    transition="all 0.2s"
                  >
                    <Settings2 size={12} style={{ marginRight: "6px" }} />
                    MANAGE PROFILE
                  </Button>
                </MotionBox>
              )}
            </VStack>
          </Grid>
        </Container>
      </Box>

      <CompanyProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={company}
        onSaved={fetchCompany}
      />
    </Box>
  );
};

export default CompanyDashboard;
