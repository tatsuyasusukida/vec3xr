import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR, XROrigin } from "@react-three/xr";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { Arrow, type ArrowProps } from "./components/Arrow";
import { GridLines } from "./components/GridLines";
import { Button } from "./components/ui/button";
import { Form, FormControl, FormField, FormItem } from "./components/ui/form";
import { Input } from "./components/ui/input";
import { Slider } from "./components/ui/slider";
import { Switch } from "./components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

const numberSchema = z.string().refine(
  (val) => {
    if (val === "") return false;
    const parsed = parseFloat(val);
    return !Number.isNaN(parsed) && Number.isFinite(parsed);
  },
  {
    message: "有効な数値を入力してください（指数表示可）",
  },
);

const formSchema = z.object({
  x1: numberSchema,
  y1: numberSchema,
  z1: numberSchema,
  x2: numberSchema,
  y2: numberSchema,
  z2: numberSchema,
});

type FormValues = z.infer<typeof formSchema>;

const transformedFormSchema = formSchema.transform((data) => ({
  ...data,
  x1: parseFloat(data.x1),
  y1: parseFloat(data.y1),
  z1: parseFloat(data.z1),
  x2: parseFloat(data.x2),
  y2: parseFloat(data.y2),
  z2: parseFloat(data.z2),
}));

type TransformedFormValues = z.infer<typeof transformedFormSchema>;

const xrStore = createXRStore();

function App() {
  const defaultValues: FormValues = {
    x1: "1",
    y1: "2",
    z1: "3",
    x2: "3",
    y2: "2",
    z2: "1",
  };

  const [form, setForm] = useState(transformedFormSchema.parse(defaultValues));
  const [grid, setGrid] = useState({ x: true, y: true, z: true });
  const [offset, setOffset] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState(0.1);

  return (
    <div className="w-[100vw] h-[100vh] relative">
      <h1 className="sr-only">3次元ベクトル学習用XRコンテンツ</h1>
      <Canvas>
        <XR store={xrStore}>
          <XROrigin position={[0, 0, 3]} />
          <PerspectiveCamera position={[0, 1.5, 3]} makeDefault />
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <directionalLight position={[100, 100, 100]} />
          <group scale={scale} position={[offset.x, offset.y, offset.z]}>
            {grid.x && <GridLines axis="x" />}
            {grid.y && <GridLines axis="y" />}
            {grid.z && <GridLines axis="z" />}
            <Vectors form={form} />
          </group>
        </XR>
      </Canvas>
      <ControlPanel>
        <VectorForm setForm={setForm} defaultValues={defaultValues} />
        <GridSwitches grid={grid} setGrid={setGrid} />
        <div className="flex flex-col gap-2">
          <OffsetSliders offset={offset} setOffset={setOffset} />
          <ScaleSlider scale={scale} setScale={setScale} />
        </div>
        <XRButtons />
      </ControlPanel>
    </div>
  );
}

function ControlPanel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute top-4 left-4 bg-gray-400 opacity-80 rounded-sm p-4 flex flex-col gap-4">
      {children}
    </div>
  );
}

function VectorForm({
  setForm,
  defaultValues,
}: {
  setForm: (form: TransformedFormValues) => void;
  defaultValues: FormValues;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = useCallback<SubmitHandler<FormValues>>(
    (data) => {
      const transformedData = transformedFormSchema.parse(data);
      setForm(transformedData);
    },
    [setForm],
  );

  const rows = [
    { label: "A", names: ["x1", "y1", "z1"] as const },
    { label: "B", names: ["x2", "y2", "z2"] as const },
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ベクトル</TableHead>
              <TableHead>X</TableHead>
              <TableHead>Y</TableHead>
              <TableHead>Z</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="w-[100px]">{row.label}</TableCell>
                {row.names.map((name) => (
                  <TableCell key={name}>
                    <FormField
                      control={form.control}
                      name={name}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              className="w-[100px]"
                              type="text"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    ></FormField>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="default" type="submit">
          Apply
        </Button>
      </form>
    </Form>
  );
}

function GridSwitches({
  grid,
  setGrid,
}: {
  grid: { x: boolean; y: boolean; z: boolean };
  setGrid: (grid: { x: boolean; y: boolean; z: boolean }) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {(["x", "y", "z"] as const).map((axis) => (
        <div className="flex items-center space-x-2" key={axis}>
          <Switch
            id={`grid-${axis}`}
            checked={grid[axis]}
            onCheckedChange={(checked) => setGrid({ ...grid, [axis]: checked })}
          />
          <Label
            htmlFor={`grid-${axis}`}
          >{`${axis.toUpperCase()}軸グリッド`}</Label>
        </div>
      ))}
    </div>
  );
}

function OffsetSliders({
  offset,
  setOffset,
}: {
  offset: { x: number; y: number; z: number };
  setOffset: (offset: { x: number; y: number; z: number }) => void;
}) {
  const xyz = ["x", "y", "z"] as const;
  const diffs = [-1, -0.1, 0.1, 1];

  return (
    <div className="flex items-center gap-4">
      <Table>
        <TableHeader className="sr-only">
          <TableRow>
            <TableHead>軸</TableHead>
            <TableHead>ボタン</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {xyz.map((axis) => (
            <TableRow key={axis}>
              <TableCell className="w-[150px]">
                {axis.toUpperCase()}軸オフセット
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {diffs.map((diff) => (
                    <Button
                      className="flex-1"
                      key={diff}
                      onClick={() => {
                        setOffset({
                          ...offset,
                          [axis]: offset[axis] + diff,
                        });
                      }}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </Button>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ScaleSlider({
  scale,
  setScale,
}: {
  scale: number;
  setScale: (scale: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <Slider
        id="scale"
        className="w-[200px]"
        value={[scale]}
        onValueChange={(value) => setScale(value[0])}
        min={0.01}
        max={0.1}
        step={0.005}
      />
      <Label htmlFor="scale">スケール</Label>
    </div>
  );
}

function XRButtons() {
  const [isSupported, setIsSupported] = useState({
    vr: false,
    ar: false,
  });

  useEffect(() => {
    if (!navigator.xr) {
      return;
    }

    Promise.all([
      navigator.xr.isSessionSupported("immersive-vr"),
      navigator.xr.isSessionSupported("immersive-ar"),
    ])
      .then(([vr, ar]) => {
        setIsSupported({ vr, ar });
      })
      .catch((err) => console.error(err));
  }, []);

  const onClickVR = () => {
    xrStore.enterVR();
  };

  const onClickAR = () => {
    xrStore.enterAR();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        className="flex-1"
        onClick={onClickVR}
        disabled={!isSupported.vr}
      >
        VRで見る
      </Button>
      <Button
        variant="secondary"
        className="flex-1"
        onClick={onClickAR}
        disabled={!isSupported.ar}
      >
        ARで見る
      </Button>
    </div>
  );
}

function Vectors({ form }: { form: TransformedFormValues }) {
  const vectors: (ArrowProps & { name: string })[] = [
    {
      start: [0, 0, 0],
      end: [form.x1, form.y1, form.z1],
      color: [1, 0.2, 0.2],
      name: "vector-1",
    },
    {
      start: [form.x1, form.y1, form.z1],
      end: [form.x1 + form.x2, form.y1 + form.y2, form.z1 + form.z2],
      color: [0.2, 1, 0.2],
      name: "vector-2",
    },
    {
      start: [0, 0, 0],
      end: [form.x1 + form.x2, form.y1 + form.y2, form.z1 + form.z2],
      color: [0.2, 0.2, 1],
      name: "vector-3",
    },
  ];

  return vectors.map((vec) => (
    <Arrow key={vec.name} start={vec.start} end={vec.end} color={vec.color} />
  ));
}

export default App;
