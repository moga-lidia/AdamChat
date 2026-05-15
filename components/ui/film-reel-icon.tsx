import Svg, { Circle, Polygon } from "react-native-svg";

interface FilmReelIconProps {
  size?: number;
  color?: string;
}

export function FilmReelIcon({
  size = 22,
  color = "#FFFFFF",
}: FilmReelIconProps) {
  const bg = "rgba(20,20,20,0.92)";
  const cx = 20;
  const cy = 24;
  const orbitR = 12;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Main reel circle - filled */}
      <Circle cx={cx} cy={cy} r="20" fill={color} />

      {/* 5 inner circles on orbit */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        return (
          <Circle
            key={i}
            cx={cx + orbitR * Math.cos(angle)}
            cy={cy + orbitR * Math.sin(angle)}
            r="5.5"
            fill={bg}
          />
        );
      })}

      {/* Play triangle in center */}
      <Polygon points="16,19.5 16,28.5 26,24" fill={bg} />
    </Svg>
  );
}
