import { Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { SPACING, BORDER_RADIUS } from "../theme/constants";

interface HeadSiderProps {
  justifyContent?: string;
}

export const HeadSider = styled.div<HeadSiderProps>`
  width: calc(100% - 8px);
  height: 48px;
  margin-block: 4px;
  margin-inline: 4px;
  display: flex;
  padding: 8px;
  padding-inline: 24px;
  justify-content: ${(props) => props.justifyContent};
`;

export const StickyButton = styled.div<{ theme: Theme }>`
  position: sticky;
  width: 100%;
  top: 0;
  z-index: 1000;
  background-color: ${(props) => props.theme.background_};
  padding: 8px 16px;
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.splitLine_};
`;

export const SidebarHeader = styled.div<{ theme: Theme }>`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${SPACING.lg};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.backgroundElevated_} 0%,
    ${(props) => props.theme.backgroundSecondary_} 100%
  );
  border-bottom: 1px solid ${(props) => props.theme.splitLine_};
  margin-bottom: ${SPACING.sm};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* ป้องกัน content ล้นระหว่าง animation */
  position: relative;
  flex-shrink: 0; /* ป้องกันการ shrink */

  /* Add subtle animation */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const BrandContainer = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* เปลี่ยนเป็น easing ที่นุ่มนวลกว่า */
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  justify-content: center;

  .brand-text {
    opacity: ${(props) => (props.collapsed ? 0 : 1)};
    transform: translateX(${(props) => (props.collapsed ? -20 : 0)}px);
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)
        ${(props) => (props.collapsed ? "0s" : "0.15s")},
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    ${(props) =>
      props.collapsed &&
      `
      pointer-events: none;
      position: absolute;
      visibility: hidden;
      width: 0;
    `}
  }

  .brand-icon {
    font-size: ${(props) => (props.collapsed ? "24px" : "20px")};
    transition: font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0; /* ป้องกัน icon shrink */
  }
`;

export const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 60px); // ลบ header และ logout button
  overflow: hidden; /* ซ่อน overflow หลัก */
  position: relative; /* เพิ่ม position relative เพื่อ control z-index */
`;

export const MenuWrapper = styled.div`
  flex: 1;
  padding: ${SPACING.sm} 0;
  overflow-y: auto; /* เพิ่ม scroll ที่นี่แทน */
  overflow-x: hidden; /* ป้องกัน horizontal scroll */

  /* Custom scrollbar - ใช้งานได้เฉพาะใน WebKit browsers */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

  .ant-menu {
    border-inline-end: none !important;
    padding: 0 ${SPACING.sm};
    background: transparent !important;
    /* ป้องกัน overflow ระหว่าง transition */
    min-height: 100%;
  }

  .ant-menu-item {
    margin: 4px 0;
    border-radius: ${BORDER_RADIUS.sm} !important;
    height: 44px;
    line-height: 44px;
    display: flex !important;
    align-items: center !important;
    transition: all 0.2s ease !important;
    overflow: hidden; /* ป้องกัน text overflow */

    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }

    &.ant-menu-item-selected {
      background-color: rgba(255, 255, 255, 0.15) !important;
    }
  }

  .ant-menu-submenu {
    margin: 4px 0;

    .ant-menu-submenu-title {
      height: 44px;
      line-height: 44px;
      border-radius: ${BORDER_RADIUS.sm} !important;
      display: flex !important;
      align-items: center !important;
      transition: all 0.2s ease !important;
      overflow: hidden;
    }
  }

  .ant-menu-item-icon {
    font-size: 18px;
    min-width: 18px; /* ป้องกัน icon shrink */
  }
`;

export const LogoutWrapper = styled.div`
  padding: ${SPACING.md} ${SPACING.lg};
  margin-top: auto;
  flex-shrink: 0; /* ป้องกันการ shrink */
  overflow: hidden; /* ป้องกัน content overflow */

  button {
    width: 100%;
    border-radius: ${BORDER_RADIUS.sm} !important;
    height: 44px;
    transition: all 0.2s ease;
  }
`;
