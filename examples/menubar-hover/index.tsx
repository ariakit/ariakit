import "./style.css";
import { useState } from "react";
import {
  HoverMenubar,
  HoverMenubarItem,
  HoverMenubarMenu,
  HoverMenubarMenuGroup,
  HoverMenubarMenuItem,
} from "./hover-menubar.jsx";
import { items } from "./items.js";

export default function Example() {
  const [currentLabel, setCurrentLabel] = useState("");
  const currentItem = items.find((item) => item.label === currentLabel);
  return (
    <div>
      <HoverMenubar onOpen={setCurrentLabel} placement={currentItem?.placement}>
        {items.map((item) => (
          <HoverMenubarItem
            key={item.label}
            label={item.label}
            href={item.href}
            hasPopup={!!item.items}
          />
        ))}
        <HoverMenubarMenu shift={currentItem?.shift}>
          {currentItem?.items?.map((item) => {
            if (item.items) {
              return (
                <HoverMenubarMenuGroup key={item.label} label={item.label}>
                  {item.items.map((item) => (
                    <HoverMenubarMenuItem
                      key={item.label}
                      label={item.label}
                      href={item.href}
                      description={item.description}
                    />
                  ))}
                </HoverMenubarMenuGroup>
              );
            }
            return (
              <HoverMenubarMenuItem
                key={item.label}
                label={item.label}
                href={item.href}
                description={item.description}
              />
            );
          })}
        </HoverMenubarMenu>
      </HoverMenubar>
    </div>
  );
}
