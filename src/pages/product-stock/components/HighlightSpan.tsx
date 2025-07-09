import React from "react";

/**
 * Simple highlight component for search terms
 */
const HighlightSpan: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span
    style={{
      backgroundColor: "#ffeb3b",
      color: "#000",
      fontWeight: 500,
      padding: "0 2px",
      borderRadius: "2px",
    }}
  >
    {children}
  </span>
);

export default HighlightSpan;
