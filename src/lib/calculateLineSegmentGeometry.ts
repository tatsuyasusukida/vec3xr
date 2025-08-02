import { Quaternion, Vector3 } from "three";

export type LineSegmentGeometry = {
  position: Vector3;
  quaternion: Quaternion;
  length: number;
};

export function calculateLineSegmentGeometry(
  start: number[],
  end: number[],
): LineSegmentGeometry {
  const startVector = new Vector3(...start);
  const endVector = new Vector3(...end);
  const direction = new Vector3().subVectors(endVector, startVector);
  const length = direction.length();
  const position = new Vector3()
    .addVectors(startVector, endVector)
    .multiplyScalar(0.5);
  const yAxis = new Vector3(0, 1, 0);
  direction.normalize();
  const quaternion = new Quaternion().setFromUnitVectors(yAxis, direction);

  return {
    position,
    quaternion,
    length,
  };
}
