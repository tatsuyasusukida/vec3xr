import { Cone, Cylinder } from "@react-three/drei";
import { useMemo } from "react";
import { Vector3 } from "three";
import { calculateLineSegmentGeometry } from "@/lib/calculateLineSegmentGeometry";

export type ArrowProps = {
  cylinderRadius?: number;
  coneRadius?: number;
  coneLength?: number;
  start: [x: number, y: number, z: number];
  end: [x: number, y: number, z: number];
  color: [r: number, g: number, b: number];
};

export function Arrow({
  cylinderRadius = 0.05,
  coneRadius = 0.1,
  coneLength = 0.3,
  start,
  end,
  color,
}: ArrowProps) {
  const { cylinderGeometry, coneGeometry } = useMemo(() => {
    const startVector = new Vector3(...start);
    const endVector = new Vector3(...end);
    const direction = new Vector3().subVectors(endVector, startVector);
    const cylinderLength = direction.length() - coneLength;

    const cylinderStart = startVector;
    const cylinderEnd = new Vector3().addVectors(
      startVector,
      direction.clone().setLength(cylinderLength),
    );

    const coneStart = cylinderEnd;
    const coneEnd = endVector;

    const cylinderGeometry = calculateLineSegmentGeometry(
      cylinderStart.toArray(),
      cylinderEnd.toArray(),
    );

    const coneGeometry = calculateLineSegmentGeometry(
      coneStart.toArray(),
      coneEnd.toArray(),
    );

    return {
      cylinderGeometry,
      coneGeometry,
    };
  }, [coneLength, start, end]);

  return (
    <>
      <Cylinder
        args={[cylinderRadius, cylinderRadius, cylinderGeometry.length]}
        position={cylinderGeometry.position}
        quaternion={cylinderGeometry.quaternion}
      >
        <meshStandardMaterial color={color} />
      </Cylinder>
      <Cone
        args={[coneRadius, coneLength]}
        position={coneGeometry.position}
        quaternion={coneGeometry.quaternion}
      >
        <meshStandardMaterial color={color} />
      </Cone>
    </>
  );
}
