interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}
const DeliveryIcon = ({
  width = 16,
  height = 16,
  color = "currentColor",
}: IconProps) => (
  <span className="ant-menu-item-icon">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={width}
      height={height}
      fill={color}
    >
      <title />
      <path d="M410.02 262.406h-2.57l-25.568-95.43h17.665a7.998 7.998 0 0 0 8-8V108.82a7.998 7.998 0 0 0-8-8h-64.211a33.057 33.057 0 0 0-31.988 25.078H269.68a8 8 0 1 0 0 16h33.668a33.047 33.047 0 0 0 23.988 23.987v182.506h-73.899v-86.274a42.906 42.906 0 0 0-42.859-42.851h-43.277V98.289a7.998 7.998 0 0 0-8-8H16a7.998 7.998 0 0 0-8 8v128.977a7.998 7.998 0 0 0 8 8h79.186a137.207 137.207 0 0 0-73.01 121.125 7.998 7.998 0 0 0 8 8h42.85a65.264 65.264 0 0 0 129.557 0h142.662a65.264 65.264 0 0 0 129.558-.007l21.197-.001a7.998 7.998 0 0 0 8-8 94.084 94.084 0 0 0-93.98-93.977Zm-16.434 10.07a60.32 60.32 0 0 1-50.25 75.39v-180.89h21.98Zm-75.328-138.578a17.099 17.099 0 0 1 17.078-17.078h56.21v34.156h-56.21a17.099 17.099 0 0 1-17.078-17.078ZM151.3 106.29v19.828H24V106.29ZM24 142.117h127.3v77.149H24Zm135.3 93.149h51.278a26.888 26.888 0 0 1 26.86 26.851v86.274H38.58c4.15-63.057 56.63-113.125 120.72-113.125ZM137.806 405.71a49.357 49.357 0 0 1-48.612-41.32h97.223a49.357 49.357 0 0 1-48.611 41.32Zm272.218 0a49.357 49.357 0 0 1-48.611-41.322l97.224-.004a49.356 49.356 0 0 1-48.613 41.326Zm-28.008-57.322a76.853 76.853 0 0 0 13.856-13.85 75.624 75.624 0 0 0 15.106-56.088 78.073 78.073 0 0 1 76.617 69.931Z" />
    </svg>
  </span>
);
export default DeliveryIcon;
