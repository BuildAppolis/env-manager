import { c as createComponent, a as createAstro, d as renderHead, e as renderSlot, r as renderTemplate, f as renderComponent } from '../chunks/astro/server_ecHyZ_sh.mjs';
import { clsx } from 'clsx';
/* empty css                                 */
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Slot } from '@radix-ui/react-slot';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDownIcon, CheckIcon, ChevronUpIcon, Unlock, Database, Key, Save, Terminal, Download, Upload, RefreshCw, Lock } from 'lucide-react';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Layout8Bit = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout8Bit;
  const { projectName } = Astro2.props;
  const title = projectName ? `${projectName} | Env Manager | BuildAppolis` : "Env Manager | BuildAppolis";
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="Env Manager - 8-bit themed environment management"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900"> <div class="relative min-h-screen"> <!-- Animated retro grid background --> <div class="fixed inset-0 overflow-hidden pointer-events-none"> <div class="absolute inset-0 bg-[linear-gradient(transparent_63%,rgba(255,0,255,0.1)_64%,rgba(255,0,255,0.1)_65%,transparent_66%),linear-gradient(90deg,transparent_63%,rgba(0,255,255,0.1)_64%,rgba(0,255,255,0.1)_65%,transparent_66%)] bg-[length:50px_50px] animate-pulse"></div> </div> <!-- Main content --> <div class="relative z-10"> ${renderSlot($$result, $$slots["default"])} </div> </div> </body></html>`;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/layouts/Layout8Bit.astro", void 0);

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button$1({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}

cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro"
    },
    variant: {
      default: "bg-foreground",
      destructive: "bg-foreground",
      outline: "bg-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
function Button({ children, asChild, ...props }) {
  const { variant, size, className, font } = props;
  return /* @__PURE__ */ jsx(
    Button$1,
    {
      ...props,
      className: cn(
        "rounded-none active:translate-y-1 transition-transform relative inline-flex items-center justify-center gap-1.5",
        font !== "normal" && "retro",
        className
      ),
      size,
      variant,
      asChild,
      children: asChild ? /* @__PURE__ */ jsxs("span", { className: "relative inline-flex items-center justify-center gap-1.5", children: [
        children,
        variant !== "ghost" && variant !== "link" && size !== "icon" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "absolute -top-1.5 w-1/2 left-1.5 h-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -top-1.5 w-1/2 right-1.5 h-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1.5 w-1/2 left-1.5 h-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1.5 w-1/2 right-1.5 h-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 size-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 size-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 size-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 size-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 -left-1.5 h-2/3 w-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 -right-1.5 h-2/3 w-1.5 bg-foreground dark:bg-ring" }),
          variant !== "outline" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-1.5 bg-foreground/20" }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 left-0 w-3 h-1.5 bg-foreground/20" }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-full h-1.5 bg-foreground/20" }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-1.5 right-0 w-3 h-1.5 bg-foreground/20" })
          ] })
        ] }),
        size === "icon" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-[5px] md:h-1.5 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 w-full h-[5px] md:h-1.5 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1 -left-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 -left-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1 -right-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 -right-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        children,
        variant !== "ghost" && variant !== "link" && size !== "icon" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "absolute -top-1.5 w-1/2 left-1.5 h-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -top-1.5 w-1/2 right-1.5 h-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1.5 w-1/2 left-1.5 h-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1.5 w-1/2 right-1.5 h-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 size-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 size-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 size-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 size-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 -left-1.5 h-2/3 w-1.5 bg-foreground dark:bg-ring" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 -right-1.5 h-2/3 w-1.5 bg-foreground dark:bg-ring" }),
          variant !== "outline" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-1.5 bg-foreground/20" }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 left-0 w-3 h-1.5 bg-foreground/20" }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-full h-1.5 bg-foreground/20" }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-1.5 right-0 w-3 h-1.5 bg-foreground/20" })
          ] })
        ] }),
        size === "icon" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-[5px] md:h-1.5 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 w-full h-[5px] md:h-1.5 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1 -left-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 -left-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1 -right-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 -right-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" })
        ] })
      ] })
    }
  );
}

function Card$1({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader$1({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      ),
      ...props
    }
  );
}
function CardTitle$1({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("leading-none font-semibold", className),
      ...props
    }
  );
}
function CardDescription$1({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function CardContent$1({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}

cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro"
    }
  },
  defaultVariants: {
    font: "retro"
  }
});
function Card({ ...props }) {
  const { className, font } = props;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "relative border-y-6 border-foreground dark:border-ring !p-0",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          Card$1,
          {
            ...props,
            className: cn(
              "rounded-none border-0 !w-full",
              font !== "normal" && "retro",
              className
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none",
            "aria-hidden": "true"
          }
        )
      ]
    }
  );
}
function CardHeader({ ...props }) {
  const { className, font } = props;
  return /* @__PURE__ */ jsx(
    CardHeader$1,
    {
      className: cn(font !== "normal" && "retro", className),
      ...props
    }
  );
}
function CardTitle({ ...props }) {
  const { className, font } = props;
  return /* @__PURE__ */ jsx(
    CardTitle$1,
    {
      className: cn(font !== "normal" && "retro", className),
      ...props
    }
  );
}
function CardDescription({ ...props }) {
  const { className, font } = props;
  return /* @__PURE__ */ jsx(
    CardDescription$1,
    {
      className: cn(font !== "normal" && "retro", className),
      ...props
    }
  );
}
function CardContent({ ...props }) {
  const { className, font } = props;
  return /* @__PURE__ */ jsx(
    CardContent$1,
    {
      className: cn(font !== "normal" && "retro", className),
      ...props
    }
  );
}

function Input$1({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}

cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro"
    }
  },
  defaultVariants: {
    font: "retro"
  }
});
function Input({ ...props }) {
  const { className, font } = props;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "relative border-y-6 border-foreground dark:border-ring !p-0 flex items-center",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          Input$1,
          {
            ...props,
            className: cn(
              "rounded-none ring-0 !w-full",
              font !== "normal" && "retro",
              className
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none",
            "aria-hidden": "true"
          }
        )
      ]
    }
  );
}

function Label$1({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}

cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro"
    }
  },
  defaultVariants: {
    font: "retro"
  }
});
function Label({ className, font, ...props }) {
  return /* @__PURE__ */ jsx(
    Label$1,
    {
      className: cn(className, font !== "normal" && "retro"),
      ...props
    }
  );
}

function Select$1({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Root, { "data-slot": "select", ...props });
}
function SelectValue$1({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger$1({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function SelectContent$1({
  className,
  children,
  position = "popper",
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    SelectPrimitive.Content,
    {
      "data-slot": "select-content",
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(
          SelectPrimitive.Viewport,
          {
            className: cn(
              "p-1",
              position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectItem$1({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-4" }) }) }),
        /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
      ]
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronUpIcon, { className: "size-4" })
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4" })
    }
  );
}

cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro"
    }
  },
  defaultVariants: {
    font: "retro"
  }
});
function Select({ ...props }) {
  return /* @__PURE__ */ jsx(Select$1, { ...props });
}
function SelectValue({ ...props }) {
  const { font } = props;
  return /* @__PURE__ */ jsx(
    SelectValue$1,
    {
      className: cn(font !== "normal" && "retro"),
      ...props
    }
  );
}
function SelectTrigger({ children, ...props }) {
  const { className, font } = props;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "relative border-y-6 border-foreground dark:border-ring",
        className,
        font !== "normal" && "retro"
      ),
      children: [
        /* @__PURE__ */ jsx(
          SelectTrigger$1,
          {
            ...props,
            className: cn("rounded-none ring-0 w-full border-0", className),
            children
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none",
            "aria-hidden": "true"
          }
        )
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  ...props
}) {
  const { font } = props;
  return /* @__PURE__ */ jsx(
    SelectContent$1,
    {
      className: cn(
        font !== "normal" && "retro",
        className,
        "relative rounded-none border-4 border-foreground dark:border-ring -ml-1 mt-1"
      ),
      ...props,
      children
    }
  );
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectItem$1,
    {
      className: cn(
        className,
        "rounded-none border-y-3 border-dashed border-ring/0 hover:border-foreground dark:hover:border-ring"
      ),
      ...props,
      children
    }
  );
}

function EnvManager8Bit() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [environments, setEnvironments] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState("development");
  const [variables, setVariables] = useState([]);
  const [newVar, setNewVar] = useState({ name: "", value: "", encrypted: false, description: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    checkAuthStatus();
  }, []);
  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        loadEnvironments();
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };
  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword("");
        loadEnvironments();
        playSound("success");
      } else {
        setError("Invalid password");
        playSound("error");
      }
    } catch (err) {
      setError("Login failed");
      playSound();
    }
    setIsLoading(false);
  };
  const loadEnvironments = async () => {
    try {
      const res = await fetch("/api/environments");
      const data = await res.json();
      setEnvironments(data.environments || []);
      if (data.environments?.length > 0) {
        loadVariables(selectedEnv);
      }
    } catch (err) {
      console.error("Failed to load environments:", err);
    }
  };
  const loadVariables = async (env) => {
    try {
      const res = await fetch(`/api/variables?environment=${env}`);
      const data = await res.json();
      setVariables(data.variables || []);
    } catch (err) {
      console.error("Failed to load variables:", err);
    }
  };
  const handleAddVariable = async () => {
    if (!newVar.name || !newVar.value) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/variables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment: selectedEnv,
          ...newVar
        })
      });
      if (res.ok) {
        loadVariables(selectedEnv);
        setNewVar({ name: "", value: "", encrypted: false, description: "" });
        playSound("powerup");
      }
    } catch (err) {
      setError("Failed to add variable");
      playSound();
    }
    setIsLoading(false);
  };
  const handleDeleteVariable = async (name) => {
    if (!confirm(`Delete variable ${name}?`)) return;
    try {
      const res = await fetch(`/api/variables?environment=${selectedEnv}&name=${name}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadVariables(selectedEnv);
        playSound("hit");
      }
    } catch (err) {
      console.error("Failed to delete variable:", err);
      playSound();
    }
  };
  const playSound = (type) => {
    new Audio();
  };
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4 text-6xl animate-bounce", children: "🔐" }),
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl mb-2", children: "ENV MANAGER" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "ENTER PASSWORD TO CONTINUE" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", className: "text-xs", children: "PASSWORD" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              onKeyPress: (e) => e.key === "Enter" && handleLogin(),
              placeholder: "••••••••",
              className: "font-mono"
            }
          )
        ] }),
        error && /* @__PURE__ */ jsxs("div", { className: "text-red-500 text-xs animate-pulse", children: [
          "⚠️ ",
          error
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleLogin,
            disabled: isLoading || !password,
            className: "w-full",
            variant: "default",
            children: isLoading ? /* @__PURE__ */ jsx("span", { className: "animate-pulse", children: "LOADING..." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Unlock, { className: "mr-2 h-4 w-4" }),
              "LOGIN"
            ] })
          }
        )
      ] }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto p-4 max-w-6xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl mb-2 text-white animate-pulse", children: "ENV MANAGER" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-cyan-300", children: [
        "LEVEL: ",
        selectedEnv.toUpperCase(),
        " | VARIABLES: ",
        variables.length
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Database, { className: "h-5 w-5" }),
        "SELECT ENVIRONMENT"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Select, { value: selectedEnv, onValueChange: (val) => {
        setSelectedEnv(val);
        loadVariables(val);
        playSound();
      }, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "development", children: "DEVELOPMENT" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "staging", children: "STAGING" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "production", children: "PRODUCTION" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }),
        "ADD NEW VARIABLE"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "var-name", className: "text-xs", children: "NAME" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "var-name",
              value: newVar.name,
              onChange: (e) => setNewVar({ ...newVar, name: e.target.value }),
              placeholder: "VARIABLE_NAME",
              className: "font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "var-value", className: "text-xs", children: "VALUE" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "var-value",
              type: newVar.encrypted ? "password" : "text",
              value: newVar.value,
              onChange: (e) => setNewVar({ ...newVar, value: e.target.value }),
              placeholder: "value",
              className: "font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "var-desc", className: "text-xs", children: "DESCRIPTION" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "var-desc",
              value: newVar.description,
              onChange: (e) => setNewVar({ ...newVar, description: e.target.value }),
              placeholder: "Optional description",
              className: "font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: newVar.encrypted,
                onChange: (e) => setNewVar({ ...newVar, encrypted: e.target.checked }),
                className: "w-4 h-4"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xs", children: "ENCRYPT" })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleAddVariable,
              disabled: isLoading || !newVar.name || !newVar.value,
              children: [
                /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
                "ADD"
              ]
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Terminal, { className: "h-5 w-5" }),
          "VARIABLES"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => loadVariables(selectedEnv), children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: variables.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-gray-500", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs", children: "NO VARIABLES FOUND" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs mt-2", children: "ADD YOUR FIRST VARIABLE ABOVE" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: variables.map((variable) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-2 border-black",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold", children: variable.name }),
                variable.encrypted && /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3 text-yellow-500" })
              ] }),
              variable.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-1", children: variable.description })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("code", { className: "text-xs bg-black text-green-400 px-2 py-1 max-w-[200px] truncate", children: variable.encrypted ? "••••••••" : variable.value }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "destructive",
                  onClick: () => handleDeleteVariable(variable.name),
                  children: "X"
                }
              )
            ] })
          ]
        },
        variable.name
      )) }) })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const projectName = null;
  return renderTemplate`${renderComponent($$result, "Layout8Bit", $$Layout8Bit, { "projectName": projectName }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "EnvManager8Bit", EnvManager8Bit, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/cory-ubuntu/coding/projects/env-manager/src/components/EnvManager8Bit", "client:component-export": "default" })} ` })}`;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/pages/index.astro", void 0);

const $$file = "/home/cory-ubuntu/coding/projects/env-manager/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
