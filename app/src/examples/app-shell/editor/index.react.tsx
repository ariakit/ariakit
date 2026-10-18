import * as ak from "@ariakit/react";
import {
  Badge,
  BadgeLabel,
  BadgeSlot,
} from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonGlider,
  ButtonGroup,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Nav,
  NavLink,
  NavLinkLabel,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  Shell,
  ShellFooter,
  ShellFooterCenter,
  ShellFooterEnd,
  ShellFooterStart,
  ShellHeader,
  ShellHeaderCenter,
  ShellHeaderEnd,
  ShellHeaderStart,
  ShellMain,
  ShellMainBody,
  ShellMainContent,
  ShellMainFull,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarHeader,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  Check,
  Frame as FrameIcon,
  Hand,
  Image as ImageIcon,
  MousePointer2,
  PanelLeft,
  PanelRight,
  Pen,
  Play,
  Share2,
  Square,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useId, useState } from "react";

type Mode = "design" | "prototype" | "inspect";
type ToolId = "move" | "frame" | "rectangle" | "text" | "pen" | "hand";

interface Layer {
  id: string;
  name: string;
  icon: LucideIcon;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

interface Tool {
  id: ToolId;
  label: string;
  icon: LucideIcon;
}

const selectedClass =
  "outline outline-2 outline-offset-4 ak-outline ak-outline-brand";

export default function Example() {
  const [layersOpen, setLayersOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [mode, setMode] = useState<Mode>("design");
  const [tool, setTool] = useState<ToolId>("move");
  const [selectedLayerId, setSelectedLayerId] = useState("headline");
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const layersId = useId();
  const propertiesId = useId();
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  const outlineClass = (layerId: string) =>
    selectedLayerId === layerId ? selectedClass : "";

  return (
    <Shell>
      <ShellHeader $height="sm" $stackCenter>
        <ShellHeaderStart $shrink>
          <div className="flex min-w-0 items-center gap-2">
            <Button
              aria-label="Toggle layers"
              aria-expanded={layersOpen}
              aria-controls={layersId}
              className="@max-3xl/shell:hidden"
              onClick={() => setLayersOpen(!layersOpen)}
            >
              <ButtonSlot>
                <PanelLeft />
              </ButtonSlot>
            </Button>
            <span className="truncate font-medium">
              Spring Sale Landing Page
            </span>
          </div>
        </ShellHeaderStart>
        <ShellHeaderCenter>
          <ak.RadioProvider
            value={mode}
            setValue={(value) => {
              const match = modes.find((item) => item.id === value);
              if (match) {
                setMode(match.id);
              }
            }}
          >
            <ak.RadioGroup aria-label="Mode" render={<ButtonGroup />}>
              {modes.map((item) => (
                <ak.Radio key={item.id} value={item.id} render={<Button />}>
                  <ButtonLabel>{item.label}</ButtonLabel>
                </ak.Radio>
              ))}
              <ButtonGlider />
            </ak.RadioGroup>
          </ak.RadioProvider>
        </ShellHeaderCenter>
        <ShellHeaderEnd>
          <Button>
            <ButtonSlot>
              <Share2 />
            </ButtonSlot>
            <ButtonLabel>Share</ButtonLabel>
          </Button>
          <Button aria-label="Play prototype">
            <ButtonSlot>
              <Play />
            </ButtonSlot>
          </Button>
          <Button
            aria-label="Toggle properties"
            aria-expanded={propertiesOpen}
            aria-controls={propertiesId}
            className="@max-3xl/shell:hidden"
            onClick={() => setPropertiesOpen(!propertiesOpen)}
          >
            <ButtonSlot>
              <PanelRight />
            </ButtonSlot>
          </Button>
        </ShellHeaderEnd>
      </ShellHeader>

      <ShellSidebar
        id={layersId}
        open={layersOpen}
        $width="sm"
        aria-label="Layers"
        render={<nav />}
      >
        <ShellSidebarHeader>
          <span className="font-medium">Layers</span>
        </ShellSidebarHeader>
        <ShellSidebarBody>
          <Nav render={<div />} glider={[{ $kind: "flat" }, { $kind: "bar" }]}>
            {layers.map((layer) => (
              <NavLink
                key={layer.id}
                href={`#${layer.id}`}
                aria-current={layer.id === selectedLayerId ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setSelectedLayerId(layer.id);
                }}
              >
                <NavSlot aria-hidden>
                  <layer.icon />
                </NavSlot>
                <NavLinkLabel>{layer.name}</NavLinkLabel>
              </NavLink>
            ))}
          </Nav>
        </ShellSidebarBody>
      </ShellSidebar>

      <ShellMain $p={6} $maxWidth="56rem">
        <ShellMainBody>
          <ShellMainFull
            $layer="canvas"
            className="min-h-[60rem] bg-[radial-gradient(rgb(0_0_0/0.14)_1px,transparent_1px)] bg-[size:1.25rem_1.25rem] dark:bg-[radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)]"
            onPointerMove={(event) => {
              // Cursor position relative to the canvas.
              const bounds = event.currentTarget.getBoundingClientRect();
              setCursor({
                x: Math.round(event.clientX - bounds.left),
                y: Math.round(event.clientY - bounds.top),
              });
            }}
          >
            <ShellMainContent className="py-12">
              <Frame
                $layer
                $rounded="xl"
                $border
                $p={6}
                className="grid grid-cols-[minmax(0,1fr)] gap-10 shadow-sm"
              >
                <div
                  className={`flex items-center justify-between rounded-md ${outlineClass("navbar")}`}
                >
                  <span className="font-semibold">Lumen</span>
                  <div className="flex gap-5 text-sm ak-ink-70">
                    <span>Shop</span>
                    <span>Journal</span>
                    <span>About</span>
                  </div>
                </div>
                <div className="grid gap-4">
                  <h2
                    className={`rounded text-4xl leading-tight font-semibold tracking-tight ${outlineClass("headline")}`}
                  >
                    Spring sale: up to 40% off
                  </h2>
                  <p
                    className={`max-w-md text-lg ak-ink-70 ${outlineClass("subcopy")}`}
                  >
                    Lamps, rugs, and planters picked for rooms that get the
                    morning light. Ends Sunday.
                  </p>
                  <div>
                    <Button
                      $layer="brand"
                      $kind="bevel"
                      className={outlineClass("button")}
                    >
                      Shop the sale
                    </Button>
                  </div>
                </div>
                <div
                  className={`aspect-[16/7] rounded-lg bg-[linear-gradient(135deg,#fde68a,#fb923c)] ${outlineClass("image")}`}
                />
                <div
                  className={`grid gap-4 rounded-lg @2xl/shell-main-body:grid-cols-3 ${outlineClass("features")}`}
                >
                  {featureCards.map((card) => (
                    <Frame
                      key={card.title}
                      $layer="canvas"
                      $rounded="lg"
                      $border
                      $p={4}
                      className="grid gap-1"
                    >
                      <span className="font-medium">{card.title}</span>
                      <span className="text-sm ak-ink-70">{card.text}</span>
                    </Frame>
                  ))}
                </div>
              </Frame>
            </ShellMainContent>
          </ShellMainFull>
        </ShellMainBody>
      </ShellMain>

      <ShellSidebar
        id={propertiesId}
        open={propertiesOpen}
        $side="end"
        $width="md"
        aria-label="Properties"
        render={<aside />}
      >
        <ShellSidebarHeader>
          <span className="font-medium">Properties</span>
        </ShellSidebarHeader>
        <ShellSidebarBody>
          {selectedLayer ? (
            <div key={selectedLayer.id} className="grid grid-cols-1 gap-4">
              <label className="grid grid-cols-1 gap-1.5 text-sm">
                <span className="ak-ink-70">Name</span>
                <Input defaultValue={selectedLayer.name} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "X", value: selectedLayer.x },
                  { label: "Y", value: selectedLayer.y },
                  { label: "W", value: selectedLayer.width },
                  { label: "H", value: selectedLayer.height },
                ].map((field) => (
                  <label
                    key={field.label}
                    className="grid grid-cols-1 gap-1.5 text-sm"
                  >
                    <span className="ak-ink-70">{field.label}</span>
                    <Input type="number" defaultValue={field.value} />
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-sm">
                <span className="ak-ink-70">Fill</span>
                <div className="flex items-center gap-2">
                  <Frame
                    aria-hidden
                    $rounded="md"
                    $border
                    $p="none"
                    className="size-7 shrink-0"
                    style={{ backgroundColor: selectedLayer.fill }}
                  />
                  <Input
                    defaultValue={selectedLayer.fill}
                    className="min-w-0 flex-1"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </ShellSidebarBody>
      </ShellSidebar>

      <ShellSidebar
        $side="end"
        $width="3xs"
        aria-label="Tools"
        render={<aside />}
      >
        <ShellSidebarBody>
          <ak.RadioProvider
            value={tool}
            setValue={(value) => {
              const match = tools.find((item) => item.id === value);
              if (match) {
                setTool(match.id);
              }
            }}
          >
            <ak.RadioGroup
              aria-label="Tools"
              render={<ButtonGroup $layout="vertical" $gap="md" />}
            >
              {tools.map((item) => (
                <ak.Radio
                  key={item.id}
                  value={item.id}
                  aria-label={item.label}
                  render={<Button />}
                >
                  <ButtonSlot>
                    <item.icon />
                  </ButtonSlot>
                </ak.Radio>
              ))}
              <ButtonGlider />
            </ak.RadioGroup>
          </ak.RadioProvider>
        </ShellSidebarBody>
      </ShellSidebar>

      <ShellFooter $height="sm">
        <ShellFooterStart>
          <span className="tabular-nums ak-ink-70">Zoom 100%</span>
        </ShellFooterStart>
        <ShellFooterCenter>
          <span className="tabular-nums ak-ink-70">
            X {cursor.x}, Y {cursor.y}
          </span>
        </ShellFooterCenter>
        <ShellFooterEnd>
          <Badge $layer="success">
            <BadgeSlot aria-hidden>
              <Check />
            </BadgeSlot>
            <BadgeLabel>Saved</BadgeLabel>
          </Badge>
        </ShellFooterEnd>
      </ShellFooter>
    </Shell>
  );
}

const modes: { id: Mode; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "prototype", label: "Prototype" },
  { id: "inspect", label: "Inspect" },
];

const tools: Tool[] = [
  { id: "move", label: "Move", icon: MousePointer2 },
  { id: "frame", label: "Frame", icon: FrameIcon },
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "text", label: "Text", icon: Type },
  { id: "pen", label: "Pen", icon: Pen },
  { id: "hand", label: "Hand", icon: Hand },
];

const layers: Layer[] = [
  {
    id: "navbar",
    name: "Navbar",
    icon: FrameIcon,
    x: 0,
    y: 0,
    width: 1440,
    height: 72,
    fill: "#ffffff",
  },
  {
    id: "headline",
    name: "Headline",
    icon: Type,
    x: 96,
    y: 168,
    width: 640,
    height: 120,
    fill: "#111827",
  },
  {
    id: "subcopy",
    name: "Subcopy",
    icon: Type,
    x: 96,
    y: 312,
    width: 480,
    height: 56,
    fill: "#6b7280",
  },
  {
    id: "button",
    name: "Shop button",
    icon: Square,
    x: 96,
    y: 400,
    width: 168,
    height: 48,
    fill: "#f97316",
  },
  {
    id: "image",
    name: "Hero image",
    icon: ImageIcon,
    x: 720,
    y: 120,
    width: 624,
    height: 420,
    fill: "#fdba74",
  },
  {
    id: "features",
    name: "Feature cards",
    icon: FrameIcon,
    x: 96,
    y: 520,
    width: 1248,
    height: 160,
    fill: "#f5f5f4",
  },
];

const featureCards = [
  { title: "Free delivery", text: "On orders over $60" },
  { title: "30-day returns", text: "No questions asked" },
  { title: "Pick up today", text: "Ready in two hours" },
];
