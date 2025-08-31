export const isLaptopL = (width?: number | null) => width && width >= 1440;
export const isLaptop = (width?: number | null) => width && width >= 1024;
export const isTablet = (width?: number | null) => width && width >= 768;
export const isMobile = (width?: number | null) => width && width < 768;
