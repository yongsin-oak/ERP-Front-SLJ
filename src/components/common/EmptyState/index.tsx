import React from "react";
import { useTheme, Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { Empty, Typography } from "antd";
import { BORDER_RADIUS, SPACING } from "../../../theme/constants";

const StyledEmptyState = styled.div<{ theme: Theme }>`
  text-align: center;
  padding: 40px 20px;
  color: ${(props) => props.theme.textSecondary_};
  background: ${(props) => props.theme.backgroundSecondary_};
  border-radius: ${BORDER_RADIUS.lg};
  border: 2px dashed ${(props) => props.theme.splitLine_};

  .ant-empty {
    margin: 0;

    .ant-empty-image {
      height: 60px;
      margin-bottom: ${SPACING.md};
    }

    .ant-empty-description {
      color: ${(props) => props.theme.textSecondary_};
      font-size: 14px;
    }
  }

  @media (max-width: 768px) {
    padding: 24px 16px;

    .ant-empty-image {
      height: 48px !important;
    }
  }
`;

interface EmptyStateProps {
  title?: string;
  description?: string;
  image?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description = "ไม่พบข้อมูล",
  image,
  children,
  className,
}) => {
  const theme = useTheme();

  return (
    <StyledEmptyState theme={theme} className={className}>
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            {title && (
              <Typography.Title
                level={5}
                type="secondary"
                style={{ margin: 0, marginBottom: 4 }}
              >
                {title}
              </Typography.Title>
            )}
            <Typography.Text type="secondary">{description}</Typography.Text>
          </div>
        }
      >
        {children}
      </Empty>
    </StyledEmptyState>
  );
};

export default EmptyState;
