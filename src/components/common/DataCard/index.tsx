import React from "react";
import { useTheme, Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { BORDER_RADIUS, SPACING } from "../../../theme/constants";

const StyledDataCard = styled.div<{ theme: Theme }>`
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  border: 1px solid ${(props) => props.theme.splitLine_};
  background: ${(props) => props.theme.backgroundElevated_};
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }
  }
`;

const DataCardHeader = styled.div<{ theme: Theme }>`
  padding: ${SPACING.lg} ${SPACING.lg} ${SPACING.md} ${SPACING.lg};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid ${(props) => props.theme.splitLine_};

  .product-title {
    flex: 1;
    margin-right: ${SPACING.md};

    h6 {
      margin: 0;
      line-height: 1.3;
      color: ${(props) => props.theme.textPrimary_};
    }

    .barcode {
      margin-top: ${SPACING.xs};
      font-family: "Courier New", monospace;
      background: ${(props) => props.theme.backgroundSecondary_};
      padding: ${SPACING.xs} ${SPACING.sm};
      border-radius: ${BORDER_RADIUS.sm};
      font-size: 11px;
      color: ${(props) => props.theme.textSecondary_};
      display: inline-block;
    }
  }

  .stock-info {
    text-align: right;
    white-space: nowrap;
  }
`;

const DataCardBody = styled.div<{ theme: Theme }>`
  padding: ${SPACING.lg};
`;

interface DataCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface DataCardHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

interface DataCardBodyProps {
  children?: React.ReactNode;
  className?: string;
}

const DataCard: React.FC<DataCardProps> & {
  Header: React.FC<DataCardHeaderProps>;
  Body: React.FC<DataCardBodyProps>;
} = ({ children, className, onClick }) => {
  const theme = useTheme();

  return (
    <StyledDataCard
      theme={theme}
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {children}
    </StyledDataCard>
  );
};

const Header: React.FC<DataCardHeaderProps> = ({ children, className }) => {
  const theme = useTheme();
  return (
    <DataCardHeader theme={theme} className={className}>
      {children}
    </DataCardHeader>
  );
};

const Body: React.FC<DataCardBodyProps> = ({ children, className }) => {
  const theme = useTheme();
  return (
    <DataCardBody theme={theme} className={className}>
      {children}
    </DataCardBody>
  );
};

DataCard.Header = Header;
DataCard.Body = Body;

export default DataCard;
