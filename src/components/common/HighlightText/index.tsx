import React from "react";
import Text from "../Text";

/**
 * Simple highlight component for search terms
 */
const HighlightText: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Text
    style={{
      backgroundColor: "#ffeb3b",
      color: "#000",
      fontWeight: 500,
      padding: "0 2px",
      borderRadius: "2px",
    }}
  >
    {children}
  </Text>
);

export default HighlightText;
