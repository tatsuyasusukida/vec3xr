import { useMemo } from "react";
import { LineSegment, type LineSegmentProps } from "./LineSegment";

const gridRadius = 0.01;
const gridColor: [number, number, number] = [0.5, 0.5, 0.5];

export function GridLines({ axis }: { axis: "x" | "y" | "z" }) {
  const gridLines = useMemo(() => {
    const lines: (LineSegmentProps & { name: string })[] = [];

    for (let i = 0; i <= 10; i += 1)
      for (let j = 0; j <= 10; j += 1) {
        lines.push({
          radius: gridRadius,
          start:
            axis === "x" ? [0, i, j] : axis === "y" ? [i, 0, j] : [i, j, 0],
          end:
            axis === "x" ? [10, i, j] : axis === "y" ? [i, 10, j] : [i, j, 10],
          color: gridColor,
          name: `${i}-${j}`,
        });
      }
    return lines;
  }, [axis]);

  return gridLines.map((line) => (
    <LineSegment
      key={line.name}
      radius={line.radius}
      start={line.start}
      end={line.end}
      color={line.color}
    />
  ));
}
