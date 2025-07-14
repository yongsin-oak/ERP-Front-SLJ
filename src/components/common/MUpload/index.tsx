import { Upload, UploadProps } from "antd";
import { useTheme, Theme } from "@emotion/react";
import styled from "@emotion/styled";

const StyledUpload = styled(Upload)<{ theme: Theme }>`
  .ant-upload {
    border: 2px dashed ${({ theme }) => theme.splitLine_};
    border-radius: 8px;
    background: ${({ theme }) => theme.backgroundElevated_};
    transition: all 0.3s ease;

    &:hover {
      border-color: #1890ff;
      background: ${({ theme }) => theme.hoverBackground_};
    }
  }

  .ant-upload-btn {
    padding: 24px;
    color: ${({ theme }) => theme.textSecondary_};
  }

  .ant-upload-drag {
    border: 2px dashed ${({ theme }) => theme.splitLine_};
    border-radius: 12px;
    background: ${({ theme }) => theme.backgroundElevated_};
    transition: all 0.3s ease;
    padding: 32px 24px;

    &:hover {
      border-color: #1890ff;
      background: ${({ theme }) => theme.hoverBackground_};
    }

    .ant-upload-drag-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .ant-upload-text {
      color: ${({ theme }) => theme.textPrimary_};
      font-size: 16px;
      font-weight: 500;
      margin: 0;
    }

    .ant-upload-hint {
      color: ${({ theme }) => theme.textSecondary_};
      font-size: 14px;
      margin: 0;
    }

    .anticon {
      font-size: 48px;
      color: ${({ theme }) => theme.textSecondary_};
    }
  }

  .ant-upload-list {
    margin-top: 16px;

    .ant-upload-list-item {
      border: 1px solid ${({ theme }) => theme.splitLine_};
      border-radius: 8px;
      background: ${({ theme }) => theme.backgroundElevated_};
      padding: 8px 12px;
      margin-bottom: 8px;

      &:hover {
        background: ${({ theme }) => theme.hoverBackground_};
      }

      .ant-upload-list-item-name {
        color: ${({ theme }) => theme.textPrimary_};
      }

      .ant-upload-list-item-actions {
        .anticon {
          color: ${({ theme }) => theme.textSecondary_};
          transition: color 0.2s ease;

          &:hover {
            color: ${({ theme }) => theme.textPrimary_};
          }
        }
      }
    }

    .ant-upload-list-item-error {
      border-color: ${({ theme }) => theme.red100_};
      background: ${({ theme }) => theme.red100_}08;
    }

    .ant-upload-list-item-done {
      border-color: ${({ theme }) => theme.green100_};
    }
  }

  @media (max-width: 768px) {
    .ant-upload-drag {
      padding: 24px 16px;
    }

    .ant-upload-drag .anticon {
      font-size: 36px;
    }

    .ant-upload-text {
      font-size: 14px !important;
    }

    .ant-upload-hint {
      font-size: 12px !important;
    }
  }
`;

export interface MUploadProps extends UploadProps {
  children?: React.ReactNode;
  compact?: boolean;
}

const MUpload = ({
  children,
  compact = false,
  className = "",
  ...props
}: MUploadProps) => {
  const theme = useTheme();

  return (
    <StyledUpload
      theme={theme}
      className={`${compact ? "compact" : ""} ${className}`}
      {...props}
    >
      {children}
    </StyledUpload>
  );
};

export default MUpload;
