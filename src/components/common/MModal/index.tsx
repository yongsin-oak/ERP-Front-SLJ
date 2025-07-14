import { Modal, ModalProps } from "antd";
import { useTheme, Theme } from "@emotion/react";
import styled from "@emotion/styled";

const StyledModal = styled(Modal)<{ theme: Theme }>`
  .ant-modal-content {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid ${({ theme }) => theme.splitLine_};
    background: ${({ theme }) => theme.backgroundElevated_};
  }

  .ant-modal-header {
    border-bottom: 1px solid ${({ theme }) => theme.splitLine_};
    padding: 20px 24px 16px 24px;
    background: ${({ theme }) => theme.backgroundElevated_};
    border-radius: 12px 12px 0 0;
  }

  .ant-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.textPrimary_};
  }

  .ant-modal-body {
    padding: 24px;
    background: ${({ theme }) => theme.backgroundElevated_};
  }

  .ant-modal-footer {
    border-top: 1px solid ${({ theme }) => theme.splitLine_};
    padding: 16px 24px;
    background: ${({ theme }) => theme.backgroundElevated_};
    border-radius: 0 0 12px 12px;
  }

  .ant-modal-close {
    color: ${({ theme }) => theme.textSecondary_};
    transition: color 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.textPrimary_};
    }
  }

  @media (max-width: 768px) {
    .ant-modal {
      margin: 16px;
      max-width: calc(100vw - 32px);
    }

    .ant-modal-content {
      border-radius: 8px;
    }

    .ant-modal-header {
      padding: 16px 20px 12px 20px;
    }

    .ant-modal-body {
      padding: 20px;
    }

    .ant-modal-footer {
      padding: 12px 20px;
    }
  }
`;

export interface MModalProps extends ModalProps {
  children?: React.ReactNode;
  responsive?: boolean;
}

const MModal = ({
  children,
  responsive = true,
  width = 800,
  centered = true,
  ...props
}: MModalProps) => {
  const theme = useTheme();

  const modalWidth = responsive && window.innerWidth <= 768 ? "100%" : width;

  return (
    <StyledModal
      theme={theme}
      width={modalWidth}
      centered={centered}
      {...props}
    >
      {children}
    </StyledModal>
  );
};

export default MModal;
