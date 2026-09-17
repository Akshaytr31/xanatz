import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  SimpleGrid,
  HStack,
  VStack,
  Badge,
  Portal,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  Film,
  Plus,
  X,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion.create(Box);

const CompanyMediaSection = ({ mediaItems = [], canEdit = false, onNavigateToManage, onOpenUploadModal, accentColor = "#34d399" }) => {
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "image" | "video"
  const [selectedMedia, setSelectedMedia] = useState(null);

  const filteredItems = mediaItems.filter((item) => {
    if (activeFilter === "image") return item.media_type === "image";
    if (activeFilter === "video") return item.media_type === "video";
    return true;
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

  return (
    <Box
      p={{ base: 6, md: 8 }}
      borderRadius="24px"
      position="relative"
      overflow="hidden"
      style={{
        background: "rgba(13, 19, 34, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 50px -15px rgba(0,0,0,0.5)",
      }}
    >
      {/* Background Decorative Accent */}
      <Box
        position="absolute"
        top="-40%"
        right="-10%"
        w="350px"
        h="350px"
        borderRadius="full"
        style={{
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Header Row */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap={4}
        mb={6}
        position="relative"
        zIndex={2}
      >
        <VStack align="flex-start" gap={1}>
          <HStack gap={2.5}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="12px"
              align="center"
              justify="center"
              style={{
                background: `${accentColor}18`,
                border: `1px solid ${accentColor}35`,
              }}
            >
              <Film size={19} color={accentColor} />
            </Flex>
            <Heading size="md" fontWeight="900" color="white" letterSpacing="tight">
              Company Showcase & Media
            </Heading>
          </HStack>
          <Text fontSize="xs" color="gray.400">
            Photos, workplace culture, product launches, and video presentations
          </Text>
        </VStack>

        <HStack gap={3} wrap="wrap">
          {/* Filter Pills */}
          {mediaItems.length > 0 && (
            <Flex gap={1.5} p={1} borderRadius="12px" style={{ background: "rgba(0,0,0,0.3)" }}>
              {["all", "image", "video"].map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <Box
                    key={filter}
                    as="button"
                    onClick={() => setActiveFilter(filter)}
                    px={3}
                    py={1}
                    borderRadius="8px"
                    fontSize="11px"
                    fontWeight="700"
                    cursor="pointer"
                    textTransform="capitalize"
                    style={{
                      background: isActive ? accentColor : "transparent",
                      color: isActive ? "#022c22" : "gray",
                    }}
                    transition="all 0.2s"
                  >
                    {filter === "all" ? `All (${mediaItems.length})` : filter === "image" ? "Photos" : "Videos"}
                  </Box>
                );
              })}
            </Flex>
          )}

          {/* Action Buttons */}
          {canEdit && (
            <HStack gap={2}>
              {onOpenUploadModal && (
                <Box
                  as="button"
                  onClick={onOpenUploadModal}
                  px={3.5}
                  py={2}
                  borderRadius="12px"
                  fontSize="12px"
                  fontWeight="700"
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                  style={{
                    background: accentColor,
                    color: "#022c22",
                  }}
                  _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                >
                  <Plus size={14} /> Upload Media
                </Box>
              )}

              {onNavigateToManage && (
                <Box
                  as="button"
                  onClick={onNavigateToManage}
                  px={3.5}
                  py={2}
                  borderRadius="12px"
                  fontSize="12px"
                  fontWeight="700"
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                  style={{
                    background: `${accentColor}20`,
                    color: accentColor,
                    border: `1px solid ${accentColor}40`,
                  }}
                  _hover={{ background: `${accentColor}35`, transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                >
                  Manage Media Page
                </Box>
              )}
            </HStack>
          )}
        </HStack>
      </Flex>

      {/* Media Items Grid */}
      {filteredItems.length === 0 ? (
        <Box
          py={10}
          px={6}
          borderRadius="18px"
          textAlign="center"
          style={{ background: "rgba(0,0,0,0.25)", border: "1px dashed rgba(255,255,255,0.08)" }}
        >
          <Film size={32} color="gray" style={{ margin: "0 auto 10px", opacity: 0.4 }} />
          <Text fontSize="sm" fontWeight="bold" color="white">
            {mediaItems.length === 0 ? "No media uploaded yet" : "No media found in this filter"}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            {canEdit
              ? "Click 'Add / Manage Media' to upload photos or feature video URLs on your company landing page."
              : "This company hasn't posted any media showcase photos or videos yet."}
          </Text>
          {canEdit && mediaItems.length === 0 && (
            <Box
              as="button"
              onClick={onOpenUploadModal || onNavigateToManage}
              mt={4}
              px={4}
              py={2}
              borderRadius="10px"
              fontSize="12px"
              fontWeight="700"
              cursor="pointer"
              style={{ background: accentColor, color: "#022c22" }}
            >
              + Upload Media Now
            </Box>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
          <AnimatePresence>
            {filteredItems.map((item) => (
              <MotionBox
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                borderRadius="16px"
                overflow="hidden"
                position="relative"
                cursor="pointer"
                onClick={() => setSelectedMedia(item)}
                style={{
                  background: "rgba(17, 24, 39, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  aspectRatio: "16 / 10",
                }}
                _hover={{
                  borderColor: `${accentColor}60`,
                  boxShadow: `0 10px 30px ${accentColor}20`,
                }}
                role="group"
              >
                {/* Media Image / Video Thumbnail */}
                {item.media_type === "image" ? (
                  <img
                    src={item.file_url || item.file || item.media_url}
                    alt={item.title || "Company Media"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                  />
                ) : (
                  <Box position="relative" w="100%" h="100%">
                    <img
                      src={
                        item.media_url?.includes("youtube")
                          ? `https://img.youtube.com/vi/${item.media_url.split("v=")[1]?.split("&")[0]}/hqdefault.jpg`
                          : "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60"
                      }
                      alt={item.title || "Video Showcase"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "brightness(0.7)",
                      }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60";
                      }}
                    />
                    {/* Play Overlay */}
                    <Flex
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      w="52px"
                      h="52px"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      style={{
                        background: "rgba(16, 185, 129, 0.85)",
                        boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <Play size={22} color="#022c22" style={{ marginLeft: "3px" }} />
                    </Flex>
                  </Box>
                )}

                {/* Hover Gradient Overlay */}
                <Box
                  position="absolute"
                  inset={0}
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                    opacity: 0.9,
                  }}
                  transition="opacity 0.2s"
                />

                {/* Badge Tag */}
                <Badge
                  position="absolute"
                  top={3}
                  left={3}
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  fontSize="10px"
                  fontWeight="800"
                  textTransform="uppercase"
                  style={{
                    background: item.media_type === "video" ? "rgba(59, 130, 246, 0.3)" : "rgba(16, 185, 129, 0.3)",
                    color: item.media_type === "video" ? "#60a5fa" : "#34d399",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {item.media_type === "video" ? "Video Showcase" : "Photo"}
                </Badge>

                {/* Title & Caption Info at bottom */}
                <Box position="absolute" bottom={3} left={3} right={3} zIndex={2}>
                  <Text fontSize="13px" fontWeight="800" color="white" lineClamp={1}>
                    {item.title || (item.media_type === "video" ? "Video Presentation" : "Photo Showcase")}
                  </Text>
                  {item.caption && (
                    <Text fontSize="11px" color="gray.300" lineClamp={1} mt={0.5}>
                      {item.caption}
                    </Text>
                  )}
                </Box>
              </MotionBox>
            ))}
          </AnimatePresence>
        </SimpleGrid>
      )}

      {/* Lightbox / Video Viewer Modal */}
      {selectedMedia && (
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <Portal>
            <DialogBackdrop style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)" }} />
            <DialogPositioner display="flex" align="center" justify="center" p={4}>
              <DialogContent
                style={{
                  background: "var(--color-surface, #0d1322)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "24px",
                  maxWidth: "850px",
                  width: "100%",
                  overflow: "hidden",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.9)",
                }}
              >
                <Flex align="center" justify="space-between" p={4} px={6} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      {selectedMedia.title || (selectedMedia.media_type === "video" ? "Video Showcase" : "Company Photo")}
                    </Text>
                    {selectedMedia.caption && (
                      <Text fontSize="xs" color="gray.400">
                        {selectedMedia.caption}
                      </Text>
                    )}
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
                      style={{
                        maxHeight: "75vh",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "12px",
                      }}
                    />
                  ) : (
                    <Box w="100%" position="relative" style={{ aspectRatio: "16 / 9" }}>
                      {selectedMedia.media_url ? (
                        <iframe
                          src={getEmbedVideoUrl(selectedMedia.media_url)}
                          title={selectedMedia.title || "Video Showcase"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: "12px",
                          }}
                        />
                      ) : selectedMedia.file_url || selectedMedia.file ? (
                        <video
                          src={selectedMedia.file_url || selectedMedia.file}
                          controls
                          autoPlay
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "12px",
                          }}
                        />
                      ) : (
                        <Text color="gray.400" fontSize="sm">
                          Video playback unavailable.
                        </Text>
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

export default CompanyMediaSection;
