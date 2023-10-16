"use client";
import { UserProfile } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { AuthEnabled } from "components/auth.jsx";
import { useDarkTheme } from "components/header-theme-switch.jsx";
import { twJoin } from "tailwind-merge";

export default function Page() {
  const isDark = useDarkTheme();
  return (
    <AuthEnabled>
      <UserProfile
        key={isDark ? "dark" : "light"}
        appearance={{
          baseTheme: isDark ? dark : undefined,
          variables: {
            colorPrimary: isDark ? "hsl(204 100% 58%)" : "hsl(204 100% 35%)",
            colorDanger: isDark ? "hsl(357 56% 72%)" : "hsl(357 56% 50%)",
            colorTextOnPrimaryBackground: isDark ? "black" : "white",
            colorBackground: isDark ? "hsl(204 3% 16%)" : "white",
          },
          elements: {
            card: twJoin(
              "rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-250 dark:border-gray-600 shadow-lg dark:shadow-lg-dark",
            ),
          },
        }}
      />
    </AuthEnabled>
  );
}
