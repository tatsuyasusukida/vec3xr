import { Cylinder } from "@react-three/drei";
import { useMemo } from "react";
import { calculateLineSegmentGeometry } from "@/lib/calculateLineSegmentGeometry";

export type LineSegmentProps = {
  radius: number;
  start: [x: number, y: number, z: number];
  end: [x: number, y: number, z: number];
  color: [r: number, g: number, b: number];
};

export function LineSegment({ radius, start, end, color }: LineSegmentProps) {
  const { position, quaternion, length } = useMemo(
    () => calculateLineSegmentGeometry(start, end),
    [start, end],
  );

  return (
    <Cylinder
      args={[radius, radius, length]}
      position={position}
      quaternion={quaternion}
    >
      <meshStandardMaterial color={color} />
    </Cylinder>
  );
}
