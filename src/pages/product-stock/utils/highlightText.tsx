import React from "react";
import HighlightSpan from "../components/HighlightSpan";

/**
 * Highlights search terms in text
 * @param text - The text to highlight
 * @param searchTerm - The search term to highlight
 * @returns JSX element with highlighted text
 */
export const highlightText = (
  text: string,
  searchTerm: string
): React.ReactNode => {
  if (!searchTerm || !text) {
    return text;
  }

  // Escape special regex characters in search term
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create regex with case insensitive flag
  const regex = new RegExp(`(${escapedSearchTerm})`, "gi");

  // Split text by search term while keeping the delimiter
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Check if this part matches the search term (case insensitive)
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return <HighlightSpan key={index}>{part}</HighlightSpan>;
    }
    return part;
  });
};

/**
 * Utility to highlight multiple fields in a product
 */
export const highlightProductFields = (
  product: Record<string, unknown>,
  searchTerm: string,
  fields: string[]
) => {
  if (!searchTerm) return product;

  const highlighted = { ...product };

  fields.forEach((field) => {
    const value = product[field];
    if (value && typeof value === "string") {
      highlighted[`${field}_highlighted`] = highlightText(value, searchTerm);
    }
  });

  return highlighted;
};
