import React, { useState } from "react";
import { Flex, Box, Text, Input, HStack, Button } from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [inputValue, setInputValue] = useState("");

  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, safePage - delta);
      i <= Math.min(totalPages - 1, safePage + delta);
      i++
    ) {
      range.push(i);
    }
    const pages = [1];
    if (range[0] > 2) pages.push("...");
    pages.push(...range);
    if (range[range.length - 1] < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const submitGoToPage = () => {
    const pageNum = parseInt(inputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setInputValue("");
    }
  };

  const handleGoToPage = (e) => {
    if (e.key === "Enter") {
      submitGoToPage();
    }
  };

  return (
    <Flex align="center" justify="center" gap={4} mt={10} mb={4} wrap="wrap">
      {/* Page Buttons Group */}
      <Flex align="center" gap={1}>
        {/* First Page */}
        <Box
          as="button"
          onClick={() => onPageChange(1)}
          disabled={safePage === 1}
          p={2}
          borderRadius="lg"
          color={
            safePage === 1
              ? "var(--color-text-muted)"
              : "var(--color-text-secondary)"
          }
          opacity={safePage === 1 ? 0.35 : 1}
          cursor={safePage === 1 ? "not-allowed" : "pointer"}
          _hover={{
            bg: safePage === 1 ? "transparent" : "var(--color-card-hover-bg)",
          }}
          transition="all 0.2s"
          display="flex"
          alignItems="center"
        >
          <ChevronsLeft size={15} />
        </Box>

        {/* Prev Page */}
        <Box
          as="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          p={2}
          borderRadius="lg"
          color={
            safePage === 1
              ? "var(--color-text-muted)"
              : "var(--color-text-secondary)"
          }
          opacity={safePage === 1 ? 0.35 : 1}
          cursor={safePage === 1 ? "not-allowed" : "pointer"}
          _hover={{
            bg: safePage === 1 ? "transparent" : "var(--color-card-hover-bg)",
          }}
          transition="all 0.2s"
          display="flex"
          alignItems="center"
        >
          <ChevronLeft size={15} />
        </Box>

        {/* Page Numbers */}
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <Text
              key={`ellipsis-${idx}`}
              fontSize="xs"
              color="var(--color-text-muted)"
              px={2}
            >
              …
            </Text>
          ) : (
            <Box
              key={page}
              as="button"
              onClick={() => onPageChange(page)}
              minW="32px"
              h="32px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="lg"
              fontSize="xs"
              fontWeight={safePage === page ? "black" : "medium"}
              color={
                safePage === page ? "white" : "var(--color-text-secondary)"
              }
              style={{
                background:
                  safePage === page ? "var(--color-accent)" : "transparent",
                border:
                  safePage === page
                    ? "1px solid var(--color-accent)"
                    : "1px solid transparent",
                boxShadow:
                  safePage === page ? "0 0 12px rgba(59,130,246,0.35)" : "none",
              }}
              _hover={{
                bg:
                  safePage === page
                    ? "var(--color-accent)"
                    : "var(--color-card-hover-bg)",
                borderColor: "var(--color-accent)",
              }}
              transition="all 0.2s"
              cursor="pointer"
            >
              {page}
            </Box>
          ),
        )}

        {/* Next Page */}
        <Box
          as="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          p={2}
          borderRadius="lg"
          color={
            safePage === totalPages
              ? "var(--color-text-muted)"
              : "var(--color-text-secondary)"
          }
          opacity={safePage === totalPages ? 0.35 : 1}
          cursor={safePage === totalPages ? "not-allowed" : "pointer"}
          _hover={{
            bg:
              safePage === totalPages
                ? "transparent"
                : "var(--color-card-hover-bg)",
          }}
          transition="all 0.2s"
          display="flex"
          alignItems="center"
        >
          <ChevronRight size={15} />
        </Box>

        {/* Last Page */}
        <Box
          as="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safePage === totalPages}
          p={2}
          borderRadius="lg"
          color={
            safePage === totalPages
              ? "var(--color-text-muted)"
              : "var(--color-text-secondary)"
          }
          opacity={safePage === totalPages ? 0.35 : 1}
          cursor={safePage === totalPages ? "not-allowed" : "pointer"}
          _hover={{
            bg:
              safePage === totalPages
                ? "transparent"
                : "var(--color-card-hover-bg)",
          }}
          transition="all 0.2s"
          display="flex"
          alignItems="center"
        >
          <ChevronsRight size={15} />
        </Box>
      </Flex>

      {/* Page Search Input */}
      <HStack gap={2}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleGoToPage}
          placeholder={`1-${totalPages}`}
          w="60px"
          h="32px"
          fontSize="xs"
          textAlign="center"
          borderRadius="lg"
          border="1px solid var(--color-card-border)"
          bg="var(--color-input-bg)"
          color="white"
          _focus={{
            borderColor: "var(--color-accent)",
            boxShadow: "0 0 0 1px var(--color-accent)",
          }}
        />
        <Button
          variant="ghost"
          size="xs"
          h="32px"
          fontSize="xs"
          fontWeight="medium"
          color="var(--color-text-secondary)"
          onClick={submitGoToPage}
          _hover={{
            bg: "var(--color-card-hover-bg)",
            color: "white",
          }}
        >
          Go to page
        </Button>
      </HStack>
    </Flex>
  );
};

export default Pagination;
