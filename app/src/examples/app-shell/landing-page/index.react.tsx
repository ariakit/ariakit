import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import {
  Shell,
  ShellFooter,
  ShellHeader,
  ShellHeaderCenter,
  ShellMain,
  ShellMainBody,
  ShellMainContent,
  ShellMainFeature,
  ShellMainFull,
  ShellMainIntro,
  ShellMainPopout,
} from "@ariakit/ui/components/shell.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { ChartBar, Hexagon, Sparkles, Users } from "lucide-react";

const navigationLinks = [
  { label: "Features", href: "#features" },
  { label: "Testimonial", href: "#testimonial" },
  { label: "Pricing", href: "#pricing" },
];

const metrics = [
  { label: "Published pages", value: "1,284", change: "+18% this month" },
  { label: "Time to publish", value: "14 min", change: "-32% this month" },
  { label: "Page views", value: "96.4k", change: "+7% this week" },
];

const weeklyActivity = [
  { day: "Mon", height: 42 },
  { day: "Tue", height: 65 },
  { day: "Wed", height: 52 },
  { day: "Thu", height: 80 },
  { day: "Fri", height: 71 },
  { day: "Sat", height: 36 },
  { day: "Sun", height: 90 },
];

const features = [
  {
    icon: Sparkles,
    title: "Drafts from your notes",
    description:
      "Paste a roadmap or changelog and get a structured page in seconds.",
  },
  {
    icon: ChartBar,
    title: "Live page analytics",
    description:
      "See which sections readers scroll to and which claims they question.",
  },
  {
    icon: Users,
    title: "Review together",
    description:
      "Leave comments on any block and resolve them before you publish.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "For side projects and early drafts.",
    features: ["3 published pages", "Community templates", "Custom domain"],
    highlighted: false,
  },
  {
    name: "Team",
    price: "$24",
    period: "/seat/month",
    description: "For product teams that ship every week.",
    features: [
      "Unlimited pages",
      "Shared review comments",
      "Analytics on every page",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with security requirements.",
    features: ["SSO and audit logs", "Dedicated support", "Custom data region"],
    highlighted: false,
  },
];

const footerColumns = [
  { title: "Product", links: ["Features", "Pricing", "Changelog"] },
  { title: "Company", links: ["About", "Careers", "Contact"] },
  { title: "Resources", links: ["Docs", "Guides", "Status"] },
];

export default function Example() {
  return (
    <Shell>
      <ShellHeader
        $layer="brand"
        $border={false}
        $sticky={false}
        start={
          <a href="#" className="flex items-center gap-2 font-semibold">
            <Hexagon strokeWidth={1.5} className="size-5" /> Lumen
          </a>
        }
        center={
          <ShellHeaderCenter
            render={<nav aria-label="Site" />}
            className="hidden gap-6 text-sm @[40rem]/shell-header:flex"
          >
            {navigationLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:underline">
                {link.label}
              </a>
            ))}
          </ShellHeaderCenter>
        }
        end={
          <div className="flex items-center gap-2">
            <Button>Sign in</Button>
            <Button $kind="bevel" $layer="brand">
              Get started
            </Button>
          </div>
        }
      />
      <ShellMain $maxWidth="64rem">
        <ShellMainIntro>
          <div className="flex flex-col items-center gap-6 py-20 text-center">
            <Badge>
              <BadgeLabel>Now in beta</BadgeLabel>
            </Badge>
            <HeadingLevel>
              <Heading className="max-w-3xl text-5xl font-bold tracking-tight text-balance">
                Ship your product story in an afternoon
              </Heading>
            </HeadingLevel>
            <p className="ak-ink-70 max-w-xl text-lg text-balance">
              Lumen turns your roadmap, metrics, and customer notes into pages
              your team can publish without a designer.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button $kind="bevel" $layer="brand">
                Get started
              </Button>
              <Button>Watch the demo</Button>
            </div>
          </div>
        </ShellMainIntro>
        <ShellMainBody>
          <ShellMainFeature className="py-8">
            <Frame $layer $rounded="xl" $border $p={4} className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5" aria-hidden>
                  <Layer $layer $darken={2} className="size-2.5 rounded-full" />
                  <Layer $layer $darken={2} className="size-2.5 rounded-full" />
                  <Layer $layer $darken={2} className="size-2.5 rounded-full" />
                </div>
                <span className="ak-ink-70 text-sm">Q3 overview</span>
              </div>
              <div className="grid gap-3 @2xl/shell-main-body:grid-cols-3">
                {metrics.map((metric) => (
                  <Frame
                    key={metric.label}
                    $layer
                    $rounded="lg"
                    $border
                    $p={4}
                    className="grid gap-1"
                  >
                    <span className="ak-ink-70 text-sm">{metric.label}</span>
                    <span className="text-2xl font-semibold">
                      {metric.value}
                    </span>
                    <Text $text="success" className="text-xs">
                      {metric.change}
                    </Text>
                  </Frame>
                ))}
              </div>
              <Frame $layer $rounded="lg" $border $p={4}>
                <div className="flex h-40 items-end gap-3">
                  {weeklyActivity.map((bar) => (
                    <Layer
                      key={bar.day}
                      $layer="brand"
                      title={`${bar.day}: ${bar.height}`}
                      style={{ height: `${bar.height}%` }}
                      className="flex-1 rounded-t"
                    />
                  ))}
                </div>
              </Frame>
            </Frame>
          </ShellMainFeature>

          <ShellMainFull $layer $p={12} id="features">
            <ShellMainContent>
              <div className="grid gap-8">
                <HeadingLevel>
                  <Heading className="text-center text-3xl font-semibold">
                    Everything in one place
                  </Heading>
                </HeadingLevel>
                <div className="grid gap-6 @2xl/shell-main-body:grid-cols-3">
                  {features.map((feature) => (
                    <Frame
                      key={feature.title}
                      $layer
                      $rounded="xl"
                      $border
                      $p={6}
                      className="grid content-start gap-3"
                    >
                      <feature.icon className="size-5" aria-hidden />
                      <p className="font-semibold">{feature.title}</p>
                      <p className="ak-ink-70 text-sm">{feature.description}</p>
                    </Frame>
                  ))}
                </div>
              </div>
            </ShellMainContent>
          </ShellMainFull>

          <ShellMainPopout id="testimonial" className="py-16">
            <ShellMainContent className="text-center">
              <blockquote className="text-2xl font-medium text-balance">
                "Our launch page went live the same week the feature shipped.
                Nobody had to wait on design."
              </blockquote>
              <p className="ak-ink-70 mt-4 text-sm">
                Maya Chen, Head of Product at Orbit Health
              </p>
            </ShellMainContent>
          </ShellMainPopout>

          <section id="pricing" className="grid gap-8 pt-8 pb-16">
            <HeadingLevel>
              <Heading className="text-center text-3xl font-semibold">
                Simple pricing
              </Heading>
            </HeadingLevel>
            <div className="grid gap-6 @2xl/shell-main-body:grid-cols-3">
              {plans.map((plan) => (
                <Frame
                  key={plan.name}
                  $layer={plan.highlighted ? "brand" : true}
                  $rounded="xl"
                  $border
                  $p={6}
                  className="grid content-start gap-4"
                >
                  <p className="font-semibold">{plan.name}</p>
                  <p>
                    <span className="text-4xl font-bold">{plan.price}</span>{" "}
                    <span className="ak-ink-70 text-sm">{plan.period}</span>
                  </p>
                  <p className="ak-ink-70 text-sm">{plan.description}</p>
                  <List className="text-sm">
                    {plan.features.map((feature) => (
                      <ListItem key={feature} checked>
                        {feature}
                      </ListItem>
                    ))}
                  </List>
                  <Button className="w-full">Choose {plan.name}</Button>
                </Frame>
              ))}
            </div>
          </section>
          <ShellMainFull $layer="brand" $p={12}>
            <ShellMainContent>
              <div className="grid justify-items-center gap-4 text-center">
                <HeadingLevel>
                  <Heading className="text-3xl font-semibold">
                    Start your first page today
                  </Heading>
                </HeadingLevel>
                <p className="ak-ink-70">
                  No credit card needed. Import your existing docs in one step.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button $kind="bevel" $layer="brand">
                    Get started
                  </Button>
                  <Button>Talk to sales</Button>
                </div>
              </div>
            </ShellMainContent>
          </ShellMainFull>
        </ShellMainBody>
      </ShellMain>
      <ShellFooter
        $darken
        start={
          <div className="grid gap-8 py-6 @[40rem]/shell-footer:grid-cols-3">
            {footerColumns.map((column) => (
              <div
                key={column.title}
                className="grid content-start gap-3 text-sm"
              >
                <p className="font-semibold">{column.title}</p>
                {column.links.map((link) => (
                  <a key={link} href="#" className="ak-ink-70 hover:underline">
                    {link}
                  </a>
                ))}
              </div>
            ))}
            <p className="ak-ink-70 col-span-full text-sm">
              Copyright 2026 Lumen Inc.
            </p>
          </div>
        }
        end={
          <div className="ak-ink-70 flex gap-4 text-sm">
            <a href="#" className="hover:underline">
              X
            </a>
            <a href="#" className="hover:underline">
              GitHub
            </a>
            <a href="#" className="hover:underline">
              YouTube
            </a>
          </div>
        }
      />
    </Shell>
  );
}
