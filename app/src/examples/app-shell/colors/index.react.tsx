import * as ak from "@ariakit/react";
import {
  Button,
  ButtonGroup,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { HeadingLevel } from "@ariakit/ui/components/heading.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Progress } from "@ariakit/ui/components/progress.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellHeaderCenter,
  ShellFooter,
  ShellFooterStart,
  ShellFooterCenter,
  ShellSidebar,
  ShellSidebarHeader,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellMain,
  ShellMainIntro,
  ShellMainBody,
  ShellMainContent,
  ShellMainFull,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  CircleUser,
  Compass,
  Home,
  Music,
  Pause,
  PanelLeft,
  Play,
  Plus,
  Radio,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
} from "lucide-react";
import { useId, useState } from "react";

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const sidebarId = useId();
  const track = tracks[currentIndex];

  return (
    <Shell>
      <ShellSidebar
        id={sidebarId}
        open={sidebarOpen}
        $show={true}
        $layer
        $hue="magenta"
        $chroma="muted"
        $darken={1}
        aria-label="Library"
        render={<nav />}
      >
        <ShellSidebarHeader className="gap-2 px-4 text-lg font-semibold">
          <Music className="size-5" /> Wavelength
        </ShellSidebarHeader>
        <ShellSidebarBody>
          <Nav
            render={<div />}
            list={false}
            glider={[{ $kind: "flat" }, { $kind: "bar", $barOffset: "center" }]}
          >
            <NavGroup>
              <NavGroupLabel>Library</NavGroupLabel>
              <NavList>
                <NavLink href="#home" aria-current="page">
                  <NavSlot>
                    <Home />
                  </NavSlot>
                  <NavLinkLabel>Home</NavLinkLabel>
                </NavLink>
                <NavLink href="#browse">
                  <NavSlot>
                    <Compass />
                  </NavSlot>
                  <NavLinkLabel>Browse</NavLinkLabel>
                </NavLink>
                <NavLink href="#radio">
                  <NavSlot>
                    <Radio />
                  </NavSlot>
                  <NavLinkLabel>Radio</NavLinkLabel>
                </NavLink>
              </NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>Playlists</NavGroupLabel>
              <NavList>
                {playlists.map((playlist) => (
                  <NavLink key={playlist.name} href="#playlists">
                    <NavLinkLabel>{playlist.name}</NavLinkLabel>
                    <NavSlot $kind="badge">{playlist.count}</NavSlot>
                  </NavLink>
                ))}
              </NavList>
            </NavGroup>
          </Nav>
        </ShellSidebarBody>
        <ShellSidebarFooter>
          <Button className="w-full">
            <ButtonSlot>
              <Plus />
            </ButtonSlot>
            <ButtonLabel>New playlist</ButtonLabel>
          </Button>
        </ShellSidebarFooter>
      </ShellSidebar>

      <Shell>
        <ShellHeader
          $layer="brand"
          $hue="magenta"
          $chroma="vivid"
          $contrast
          start={
            <Button
              aria-label="Toggle library"
              aria-expanded={sidebarOpen}
              aria-controls={sidebarId}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ButtonSlot>
                <PanelLeft />
              </ButtonSlot>
            </Button>
          }
          center={
            <ShellHeaderCenter
              $grow
              className="hidden @[40rem]/shell-header:flex"
            >
              <Input
                aria-label="Search music"
                placeholder="Search songs, artists, albums"
                className="w-full min-w-0"
              />
            </ShellHeaderCenter>
          }
          end={
            <Button aria-label="Account">
              <ButtonSlot>
                <CircleUser />
              </ButtonSlot>
            </Button>
          }
        />

        <ShellMain>
          <ShellMainIntro>
            <ShellMainFull $layer $hue="cyan" $chroma="vivid" $contrast $p={8}>
              <ShellMainContent>
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
                  <Frame
                    $layer="secondary"
                    $hue="magenta"
                    $chroma="vivid"
                    $rounded="xl"
                    className="grid aspect-square w-40 shrink-0 place-items-center shadow-lg"
                  >
                    <Music className="size-16" strokeWidth={1.25} />
                  </Frame>
                  <div className="flex min-w-0 flex-col gap-3">
                    <p className="text-sm font-medium tracking-wider uppercase">
                      Album
                    </p>
                    <HeadingLevel>
                      <ak.Heading className="text-4xl leading-tight font-bold">
                        Night Signals
                      </ak.Heading>
                    </HeadingLevel>
                    <p className="text-lg font-medium">Halo Parade</p>
                    <p className="text-sm opacity-80">
                      2026 · 14 songs · 55 min
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button onClick={() => setIsPlaying(true)}>
                        <ButtonSlot>
                          <Play />
                        </ButtonSlot>
                        <ButtonLabel>Play album</ButtonLabel>
                      </Button>
                      <Button aria-label="Shuffle album">
                        <ButtonSlot>
                          <Shuffle />
                        </ButtonSlot>
                      </Button>
                      <Button aria-label="Save album">
                        <ButtonSlot>
                          <Heart />
                        </ButtonSlot>
                      </Button>
                    </div>
                  </div>
                </div>
              </ShellMainContent>
            </ShellMainFull>
          </ShellMainIntro>

          <ShellMainBody>
            <Frame $layer $rounded="xl" $p={2} $border>
              <ol>
                {tracks.map((item, index) => (
                  <li key={item.title}>
                    <Button
                      $layer={index === currentIndex ? true : "transparent"}
                      aria-current={index === currentIndex ? "true" : undefined}
                      data-current={index === currentIndex ? "" : undefined}
                      onClick={() => {
                        setCurrentIndex(index);
                        setIsPlaying(true);
                      }}
                      className="grid w-full grid-cols-[2rem_1fr_auto] items-center gap-x-3 rounded-lg px-3 py-2.5 text-left data-[current]:font-semibold @xl/shell-main-body:grid-cols-[2rem_1fr_1fr_auto]"
                    >
                      <span className="ak-ink-70 tabular-nums">
                        {index + 1}
                      </span>
                      <span className="min-w-0 truncate">{item.title}</span>
                      <span className="ak-ink-70 hidden truncate @xl/shell-main-body:block">
                        {item.artist}
                      </span>
                      <span className="ak-ink-70 tabular-nums">
                        {item.duration}
                      </span>
                    </Button>
                  </li>
                ))}
              </ol>
            </Frame>

            <Frame
              $layer
              $rounded="xl"
              $p={5}
              $border
              className="flex flex-col gap-2"
            >
              <h2 className="text-lg font-semibold">About this album</h2>
              <p className="ak-ink-70">
                Night Signals was recorded over one winter in a rented harbor
                studio. The band kept most first takes and added the synths
                last.
              </p>
            </Frame>
          </ShellMainBody>
        </ShellMain>

        <ShellFooter
          $sticky
          $layer="secondary"
          $blur
          start={
            <ShellFooterStart $shrink className="min-w-0">
              <div className="flex min-w-0 items-center gap-3">
                <Frame
                  $layer
                  $hue="magenta"
                  $rounded="md"
                  className="grid size-10 shrink-0 place-items-center"
                >
                  <Music className="size-5" />
                </Frame>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{track?.title}</p>
                  <p className="ak-ink-70 truncate text-xs">{track?.artist}</p>
                </div>
              </div>
            </ShellFooterStart>
          }
          center={
            <ShellFooterCenter $grow>
              <div className="flex w-full max-w-md flex-col items-center gap-1.5">
                <ButtonGroup aria-label="Playback">
                  <Button
                    aria-label="Previous track"
                    onClick={() =>
                      setCurrentIndex(Math.max(0, currentIndex - 1))
                    }
                  >
                    <ButtonSlot>
                      <SkipBack />
                    </ButtonSlot>
                  </Button>
                  <Button
                    aria-label={isPlaying ? "Pause" : "Play"}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    <ButtonSlot>{isPlaying ? <Pause /> : <Play />}</ButtonSlot>
                  </Button>
                  <Button
                    aria-label="Next track"
                    onClick={() =>
                      setCurrentIndex(
                        Math.min(tracks.length - 1, currentIndex + 1),
                      )
                    }
                  >
                    <ButtonSlot>
                      <SkipForward />
                    </ButtonSlot>
                  </Button>
                </ButtonGroup>
                <Progress value={0.4} aria-label="Playback position" />
              </div>
            </ShellFooterCenter>
          }
          end={
            <Button aria-label="Volume">
              <ButtonSlot>
                <Volume2 />
              </ButtonSlot>
            </Button>
          }
        />
      </Shell>
    </Shell>
  );
}

const tracks = [
  { title: "Static Bloom", artist: "Halo Parade", duration: "3:42" },
  { title: "Porch Light", artist: "Halo Parade", duration: "4:05" },
  { title: "Glass Harbor", artist: "Halo Parade", duration: "3:18" },
  { title: "Night Signals", artist: "Halo Parade", duration: "4:51" },
  { title: "Parallel Lanes", artist: "Halo Parade", duration: "3:33" },
  { title: "Kite Season", artist: "Halo Parade, Mira Vale", duration: "4:12" },
  { title: "Low Tide Radio", artist: "Halo Parade", duration: "2:58" },
  { title: "Velvet Static", artist: "Halo Parade", duration: "3:47" },
  { title: "Open Window", artist: "Halo Parade", duration: "4:26" },
  { title: "Hour of Lights", artist: "Halo Parade", duration: "3:29" },
  { title: "Paper Moons", artist: "Halo Parade, Mira Vale", duration: "3:56" },
  { title: "Drift Dial", artist: "Halo Parade", duration: "4:38" },
  { title: "Quiet Engine", artist: "Halo Parade", duration: "3:14" },
  { title: "Last Train Home", artist: "Halo Parade", duration: "5:02" },
];

const playlists = [
  { name: "Late Night Drive", count: 38 },
  { name: "Focus Flow", count: 24 },
  { name: "Sunday Brunch", count: 17 },
  { name: "Road Trip Mix", count: 61 },
];
