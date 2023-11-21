import "./style.css";
import { useState } from "react";
import { items } from "./items.js";
import {
  Menubar,
  MenubarItem,
  MenubarMenu,
  MenubarMenuGroup,
  MenubarMenuItem,
} from "./menubar.jsx";

export default function Example() {
  const [currentLabel, setCurrentLabel] = useState("");
  const currentItem = items.find((item) => item.label === currentLabel);
  return (
    <nav aria-label="Example">
      <Menubar onOpen={setCurrentLabel} placement={currentItem?.placement}>
        {items.map((item) => (
          <MenubarItem
            key={item.label}
            label={item.label}
            href={item.href}
            hasPopup={!!item.items}
          />
        ))}
        <MenubarMenu shift={currentItem?.shift}>
          {currentItem?.items?.map((item) => {
            if (item.items) {
              return (
                <MenubarMenuGroup key={item.label} label={item.label}>
                  {item.items.map((item) => (
                    <MenubarMenuItem
                      key={item.label}
                      label={item.label}
                      href={item.href}
                      description={item.description}
                    />
                  ))}
                </MenubarMenuGroup>
              );
            }
            return (
              <MenubarMenuItem
                key={item.label}
                label={item.label}
                href={item.href}
                description={item.description}
              />
            );
          })}
        </MenubarMenu>
      </Menubar>
    </nav>
  );
}
