import { Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { SPACING } from "@theme/constants";

export const ViewControls = styled.div<{ theme: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.md};

  .left-controls {
    display: flex;
    align-items: center;
    gap: ${SPACING.sm};
  }

  .right-controls {
    display: flex;
    align-items: center;
    gap: ${SPACING.xs};
  }

  @media (max-width: 768px) {
    .right-controls {
      display: none;
    }
  }
`;
