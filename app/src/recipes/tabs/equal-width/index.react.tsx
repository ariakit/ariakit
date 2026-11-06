import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Input,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import {
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { useId } from "react";
import type { FormEvent } from "react";

function handleSubmit(event: FormEvent) {
  event.preventDefault();
}

export default function Example() {
  const id = useId();
  return (
    <Tabs
      defaultSelectedId="access-sign-in"
      $rounded="2xl"
      className="w-[22rem] max-w-full"
    >
      <TabList
        aria-label="Account access"
        $layout="stretch"
        tabs={{
          "access-sign-in": "Sign in",
          "access-sign-up": "Sign up",
        }}
      />
      <TabPanels $p={4}>
        {/* Hidden panels stay mounted, so each form keeps what the person
            typed when they switch tabs. */}
        <TabPanel tabId="access-sign-in">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <InputField>
              <InputLabel htmlFor={`${id}-email`}>Email</InputLabel>
              <Input
                id={`${id}-email`}
                type="email"
                name="email"
                autoComplete="email"
              />
            </InputField>
            <InputField>
              <InputLabel htmlFor={`${id}-password`}>Password</InputLabel>
              <Input
                id={`${id}-password`}
                type="password"
                name="password"
                autoComplete="current-password"
              />
            </InputField>
            <Button type="submit" $layer="brand">
              Sign in
            </Button>
          </form>
        </TabPanel>
        <TabPanel tabId="access-sign-up">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <InputField>
              <InputLabel htmlFor={`${id}-name`}>Name</InputLabel>
              <Input id={`${id}-name`} name="name" autoComplete="name" />
            </InputField>
            <InputField>
              <InputLabel htmlFor={`${id}-new-email`}>Email</InputLabel>
              <Input
                id={`${id}-new-email`}
                type="email"
                name="email"
                autoComplete="email"
              />
            </InputField>
            <Button type="submit" $layer="brand">
              Create account
            </Button>
          </form>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
