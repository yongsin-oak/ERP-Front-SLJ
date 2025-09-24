import { useState, useEffect } from "react";
import { Button } from "antd";
import { VerticalAlignTopOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";

const ToTopButtonContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  transition: all 0.3s ease;

  &.hidden {
    opacity: 0;
    transform: translateY(10px);
    pointer-events: none;
  }

  &.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }
`;

const StyledButton = styled(Button)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .anticon {
    font-size: 20px;
  }
`;

const ToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <ToTopButtonContainer className={isVisible ? "visible" : "hidden"}>
      <StyledButton
        type="primary"
        icon={<VerticalAlignTopOutlined />}
        onClick={scrollToTop}
        title="กลับไปด้านบน"
      />
    </ToTopButtonContainer>
  );
};

export default ToTopButton;
