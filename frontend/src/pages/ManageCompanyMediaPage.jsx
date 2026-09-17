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
  Badge,
  SimpleGrid,
  Heading,
  Input,
  Portal,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  Film,
  Building2,
  X,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UploadCompanyMediaModal from "../components/company/UploadCompanyMediaModal";
import api from "../api";
import { getMemberPermissions } from "../utils/companyPermissions";

const MotionBox = motion.create(Box);

const ManageCompanyMediaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState("all"); // "all" | "image" | "video"
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const accentColor = "#34d399";

  const fetchData = async () => {
    try {
      const [cRes, uRes, mRes] = await Promise.all([
        api.get(`companies/${id}/`),
        api.get("me/"),
        api.get(`company-media/?company_id=${id}`),
      ]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
      setMediaItems(mRes.data || []);
    } catch (err) {
      console.error("Error loading company media page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async (mediaId) => {
    if (!window.confirm("Are you sure you want to delete this media item?")) return;
    try {
      await api.delete(`company-media/${mediaId}/`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete media item:", err);
      alert("Failed to delete media item.");
    }
  };

  const filteredMedia = mediaItems.filter((item) => {
    const matchesType =
      filterType === "all" ||
      (filterType === "image" && item.media_type === "image") ||
      (filterType === "video" && item.media_type === "video");

    const matchesSearch =
      !searchQuery ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const getEmbedVideoUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="var(--color-bg, #0b0f19)">
        <Navbar />
        <Flex justify="center" align="center" minH="70vh">
          <Spinner color={accentColor} size="xl" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" style={{ background: "var(--color-bg, #0b0f19)" }}>
      <Navbar />

      <Box maxW="1280px" mx="auto" px={{ base: 4, md: 8 }} pt="95px" pb={16}>
        {/* Top Navigation & Back Button */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box
            as="button"
            onClick={() => navigate(`/company/${id}/dashboard`)}
            display="flex"
            alignItems="center"
            gap={2}
            px={3.5}
            py={2}
            borderRadius="12px"
            fontSize="13px"
            fontWeight="700"
            color="gray.300"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            _hover={{ background: "rgba(255,255,255,0.12)", color: "white" }}
          >
            <ArrowLeft size={16} /> Back to Company Dashboard
          </Box>

          <Button
            onClick={() => setIsUploadModalOpen(true)}
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              fontWeight: "bold",
              borderRadius: "12px",
              padding: "0 20px",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
            }}
            _hover={{ background: "#34d399", transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            <Plus size={16} style={{ marginRight: "6px" }} /> Upload New Media
          </Button>
        </Flex>

        {/* Page Header Banner */}
        <Box
          mb={8}
          p={{ base: 6, md: 8 }}
          borderRadius="24px"
          position="relative"
          overflow="hidden"
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.25) 50%, rgba(17, 24, 39, 0.85) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 50px -15px rgba(16, 185, 129, 0.15)",
          }}
        >
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
            <VStack align="flex-start" gap={2}>
              <HStack gap={2}>
                <Badge px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="800" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
                  <Flex align="center" gap={1.5}>
                    <Film size={13} /> COMPANY MEDIA MANAGEMENT
                  </Flex>
                </Badge>
              </HStack>
              <Heading size={{ base: "xl", md: "2xl" }} fontWeight="900" color="white" letterSpacing="tight">
                Showcase & Media Gallery: {company?.name}
              </Heading>
              <Text fontSize="sm" color="gray.300">
                Manage uploaded photos, company office culture, and featured video showcases for your public landing page.
              </Text>
            </VStack>

            {/* Metrics pills */}
            <HStack gap={3} flexShrink={0}>
              <Box p={3} borderRadius="16px" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", minW: "100px", textAlign: "center" }}>
                <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Total Items</Text>
                <Text fontSize="20px" fontWeight="900" color="white">{mediaItems.length}</Text>
              </Box>
              <Box p={3} borderRadius="16px" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", minW: "100px", textAlign: "center" }}>
                <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Photos</Text>
                <Text fontSize="20px" fontWeight="900" color="#34d399">{mediaItems.filter(m => m.media_type === "image").length}</Text>
              </Box>
              <Box p={3} borderRadius="16px" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", minW: "100px", textAlign: "center" }}>
                <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Videos</Text>
                <Text fontSize="20px" fontWeight="900" color="#60a5fa">{mediaItems.filter(m => m.media_type === "video").length}</Text>
              </Box>
            </HStack>
          </Flex>
        </Box>

        {/* Filter & Search Toolbar */}
        <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} gap={4} mb={8}>
          {/* Filter Pills */}
          <Flex gap={2}>
            {[
              { id: "all", label: `All (${mediaItems.length})` },
              { id: "image", label: `Photos (${mediaItems.filter(m => m.media_type === "image").length})` },
              { id: "video", label: `Videos (${mediaItems.filter(m => m.media_type === "video").length})` },
            ].map((f) => {
              const active = filterType === f.id;
              return (
                <Box
                  key={f.id}
                  as="button"
                  onClick={() => setFilterType(f.id)}
                  px={4}
                  py={2}
                  borderRadius="12px"
                  fontSize="12px"
                  fontWeight="700"
                  cursor="pointer"
                  style={{
                    background: active ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.04)",
                    color: active ? "#34d399" : "gray",
                    border: active ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                  transition="all 0.2s"
                >
                  {f.label}
                </Box>
              );
            })}
          </Flex>

          {/* Search Box */}
          <Box position="relative" w={{ base: "100%", sm: "260px" }}>
            <Box position="absolute" left="12px" top="50%" style={{ transform: "translateY(-50%)" }}>
              <Search size={15} color="gray" />
            </Box>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or caption..."
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                background: "rgba(17, 24, 39, 0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                outline: "none",
                color: "white",
                fontSize: "12px",
              }}
            />
          </Box>
        </Flex>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <Box
            p={12}
            borderRadius="24px"
            textAlign="center"
            style={{ background: "rgba(17, 24, 39, 0.5)", border: "1px dashed rgba(255,255,255,0.1)" }}
          >
            <Film size={40} color="gray" style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <Text fontSize="md" fontWeight="bold" color="white">
              No media items found
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>
              {mediaItems.length === 0
                ? "Start building your company landing showcase by uploading photos or video presentations."
                : "No media items matched your current filter or search criteria."}
            </Text>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              mt={5}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
              }}
            >
              + Upload Media Now
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5}>
            {filteredMedia.map((item) => (
              <MotionBox
                key={item.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                p={4}
                borderRadius="20px"
                style={{
                  background: "rgba(17, 24, 39, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box position="relative" borderRadius="14px" overflow="hidden" mb={3} style={{ aspectRatio: "16 / 10" }}>
                  {item.media_type === "image" ? (
                    <img
                      src={item.file_url || item.file || item.media_url}
                      alt={item.title || "Media Photo"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Box w="100%" h="100%" position="relative">
                      <img
                        src={
                          item.media_url?.includes("youtube")
                            ? `https://img.youtube.com/vi/${item.media_url.split("v=")[1]?.split("&")[0]}/hqdefault.jpg`
                            : "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60"
                        }
                        alt="Video Thumbnail"
                        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }}
                      />
                      <Flex
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        w="46px"
                        h="46px"
                        borderRadius="full"
                        align="center"
                        justify="center"
                        cursor="pointer"
                        onClick={() => setSelectedMedia(item)}
                        style={{
                          background: "rgba(16, 185, 129, 0.85)",
                          boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
                          transition: "transform 0.18s, background 0.18s",
                        }}
                        _hover={{ background: "rgba(52, 211, 153, 1)", transform: "translate(-50%, -50%) scale(1.12)" }}
                      >
                        <Play size={20} color="#022c22" style={{ marginLeft: "2px" }} />
                      </Flex>
                    </Box>
                  )}

                  <Badge
                    position="absolute"
                    top={3}
                    left={3}
                    px={2.5}
                    py={0.5}
                    borderRadius="full"
                    fontSize="10px"
                    fontWeight="800"
                    style={{
                      background: item.media_type === "video" ? "rgba(59, 130, 246, 0.3)" : "rgba(16, 185, 129, 0.3)",
                      color: item.media_type === "video" ? "#60a5fa" : "#34d399",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    {item.media_type === "video" ? "Video Showcase" : "Photo"}
                  </Badge>
                </Box>

                <VStack align="flex-start" gap={1} mb={4} flex={1}>
                  <Text fontSize="14px" fontWeight="800" color="white" lineClamp={1}>
                    {item.title || (item.media_type === "video" ? "Untitled Video" : "Untitled Photo")}
                  </Text>
                  {item.caption && (
                    <Text fontSize="12px" color="gray.400" lineClamp={2} lineHeight="1.5">
                      {item.caption}
                    </Text>
                  )}
                </VStack>

                {/* Footer Controls */}
                <Flex justify="space-between" align="center" pt={3} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <Box
                    as="button"
                    onClick={() => setSelectedMedia(item)}
                    px={3}
                    py={1.5}
                    borderRadius="8px"
                    fontSize="11px"
                    fontWeight="700"
                    cursor="pointer"
                    style={{ background: "rgba(255,255,255,0.08)", color: "white" }}
                    _hover={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    Preview Media
                  </Box>

                  <Box
                    as="button"
                    onClick={() => handleDelete(item.id)}
                    p={2}
                    borderRadius="8px"
                    cursor="pointer"
                    style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
                    _hover={{ background: "rgba(239, 68, 68, 0.3)" }}
                  >
                    <Trash2 size={15} />
                  </Box>
                </Flex>
              </MotionBox>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Upload Media Modal */}
      <UploadCompanyMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        companyId={id}
        onSaved={fetchData}
      />

      {/* Lightbox Preview Modal */}
      {selectedMedia && (
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <Portal>
            <DialogBackdrop style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(16px)" }} />
            <DialogPositioner display="flex" align="center" justify="center" p={4}>
              <DialogContent
                style={{
                  background: "var(--color-surface, #0d1322)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "24px",
                  maxWidth: "850px",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <Flex align="center" justify="space-between" p={4} px={6} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      {selectedMedia.title || "Media Preview"}
                    </Text>
                    {selectedMedia.caption && <Text fontSize="xs" color="gray.400">{selectedMedia.caption}</Text>}
                  </VStack>

                  <DialogCloseTrigger asChild>
                    <Box
                      as="button"
                      onClick={() => setSelectedMedia(null)}
                      w="36px"
                      h="36px"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      cursor="pointer"
                      style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
                    >
                      <X size={18} />
                    </Box>
                  </DialogCloseTrigger>
                </Flex>

                <Box p={4} display="flex" justifyContent="center" alignItems="center" bg="black" minH="300px">
                  {selectedMedia.media_type === "image" ? (
                    <img
                      src={selectedMedia.file_url || selectedMedia.file || selectedMedia.media_url}
                      alt={selectedMedia.title || "Full Preview"}
                      style={{ maxHeight: "75vh", maxWidth: "100%", objectFit: "contain", borderRadius: "12px" }}
                    />
                  ) : (
                    <Box w="100%" position="relative" style={{ aspectRatio: "16 / 9" }}>
                      {selectedMedia.media_url ? (
                        <iframe
                          src={getEmbedVideoUrl(selectedMedia.media_url)}
                          title={selectedMedia.title || "Video Showcase"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ width: "100%", height: "100%", border: "none", borderRadius: "12px" }}
                        />
                      ) : selectedMedia.file_url || selectedMedia.file ? (
                        <video src={selectedMedia.file_url || selectedMedia.file} controls autoPlay style={{ width: "100%", height: "100%", borderRadius: "12px" }} />
                      ) : (
                        <Text color="gray.400" fontSize="sm">Video playback unavailable.</Text>
                      )}
                    </Box>
                  )}
                </Box>
              </DialogContent>
            </DialogPositioner>
          </Portal>
        </Dialog>
      )}
    </Box>
  );
};

export default ManageCompanyMediaPage;
