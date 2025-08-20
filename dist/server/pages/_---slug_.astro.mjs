import { c as createComponent, a as createAstro, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DE_7F_eO.mjs';
import { $ as $$Layout8Bit, V as VersionFooter } from '../chunks/VersionFooter_6LW8x2WP.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useRef } from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Slot } from '@radix-ui/react-slot';
/* empty css                                  */
import * as LabelPrimitive from '@radix-ui/react-label';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon, ChevronDownIcon, CheckIcon, ChevronUpIcon, History, ChevronDown, ChevronRight, GitBranch, Clock, User, Package, FileText, FileEdit, Plus, X, GitCommit, Save, AlertTriangle, Edit3, EyeOff, Eye, Trash2, Download, Upload, FileDown, Check, Copy, Info, FileUp, AlertCircle, Unlock, FolderOpen, Database, Key, Sparkles, Shield, Terminal, FileInput, FileOutput, FileCode, RefreshCw, Lock } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';
/* empty css                                  */
import fs from 'fs';
import path from 'path';
import os from 'os';
export { renderers } from '../renderers.mjs';

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

function Dialog$1({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Root, { "data-slot": "dialog", ...props });
}
function DialogTrigger$1({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Trigger, { "data-slot": "dialog-trigger", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function DialogContent$1({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      DialogPrimitive.Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxs(
            DialogPrimitive.Close,
            {
              "data-slot": "dialog-close",
              className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              children: [
                /* @__PURE__ */ jsx(XIcon, {}),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function DialogHeader$1({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogTitle$1({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function DialogDescription$1({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Description,
    {
      "data-slot": "dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}

const Dialog = Dialog$1;
const DialogTrigger = DialogTrigger$1;
const DialogHeader = DialogHeader$1;
const DialogDescription = DialogDescription$1;
function DialogTitle({ ...props }) {
  const { className, font } = props;
  return /* @__PURE__ */ jsx(
    DialogTitle$1,
    {
      className: cn(font !== "normal" && "retro", className),
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
function DialogContent({
  className,
  children,
  font,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    DialogContent$1,
    {
      className: cn(
        "bg-card rounded-none border-none",
        font !== "normal" && "retro",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none",
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 border-y-6 -my-1.5 border-foreground dark:border-ring pointer-events-none",
            "aria-hidden": "true"
          }
        )
      ]
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

function MissingVariableItem({
  variable,
  groupKey,
  currentProject,
  selectedBranch,
  onSuccess,
  playSound
}) {
  const [tempValue, setTempValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const isSensitive = variable.sensitive ?? true;
  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const res = await fetch(`/api/variables?projectPath=${encodeURIComponent(currentProject?.path || "")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: variable.name,
          value: tempValue,
          description: variable.description || "",
          sensitive: isSensitive,
          category: groupKey,
          branch: selectedBranch
        })
      });
      if (res.ok) {
        onSuccess();
        setTempValue("");
        playSound("powerup");
      } else {
        playSound("error");
      }
    } catch (err) {
      console.error("Failed to add variable:", err);
      playSound("error");
    }
    setIsAdding(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-3 bg-red-900/20 border border-red-500/50 rounded", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("p", { className: "font-mono text-sm text-red-400", children: variable.name }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
        variable.type && /* @__PURE__ */ jsx("span", { className: "px-1 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded", children: variable.type.toUpperCase() }),
        variable.sensitive && /* @__PURE__ */ jsx("span", { className: "px-1 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded", children: "SENSITIVE" })
      ] })
    ] }) }),
    variable.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mb-2", children: variable.description }),
    /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      handleAdd();
    }, className: "space-y-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "username",
          value: variable.name,
          autoComplete: "username",
          style: { display: "none" },
          readOnly: true,
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            type: isSensitive ? "password" : "text",
            value: tempValue,
            onChange: (e) => setTempValue(e.target.value),
            placeholder: "Enter value...",
            className: "flex-1 text-sm",
            disabled: isAdding,
            autoComplete: isSensitive ? "new-password" : "off"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            size: "sm",
            variant: "default",
            disabled: !tempValue || isAdding,
            children: isAdding ? "ADDING..." : "ADD"
          }
        )
      ] }),
      isSensitive && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 text-xs text-yellow-400", children: /* @__PURE__ */ jsx("span", { children: "⚠️ This value will be encrypted" }) })
    ] })
  ] });
}

function VersionHistory({ projectPath, onRestoreVersion, playSound }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState(/* @__PURE__ */ new Set());
  useEffect(() => {
    loadVersionHistory();
  }, [projectPath]);
  const loadVersionHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/versions${projectPath ? `?projectPath=${encodeURIComponent(projectPath)}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch (error) {
      console.error("Failed to load version history:", error);
      playSound?.("error");
    }
    setIsLoading(false);
  };
  const handleRestoreVersion = async (versionId) => {
    if (!confirm("Are you sure you want to restore this version? This will create a new draft with the restored state.")) {
      return;
    }
    try {
      const res = await fetch("/api/versions/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId,
          projectPath
        })
      });
      if (res.ok) {
        onRestoreVersion?.(versionId);
        playSound?.("powerup");
      } else {
        playSound?.("error");
      }
    } catch (error) {
      console.error("Failed to restore version:", error);
      playSound?.("error");
    }
  };
  const toggleVersionExpanded = (versionId) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };
  const formatChangeType = (type) => {
    switch (type) {
      case "create":
        return { text: "ADDED", color: "text-green-400" };
      case "update":
        return { text: "MODIFIED", color: "text-yellow-400" };
      case "delete":
        return { text: "DELETED", color: "text-red-400" };
      case "none":
      default:
        return { text: "UNCHANGED", color: "text-gray-400" };
    }
  };
  const getTimeDifference = (timestamp) => {
    const now = /* @__PURE__ */ new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMinutes = Math.floor(diffMs / (1e3 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  return /* @__PURE__ */ jsxs(Card, { className: "h-full", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(History, { className: "h-5 w-5" }),
        "VERSION HISTORY"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Track and manage environment variable changes over time" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: "Loading version history..." }) }) : versions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-gray-400", children: [
      /* @__PURE__ */ jsx(History, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
      /* @__PURE__ */ jsx("p", { children: "No version history available" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Publish some changes to start tracking versions" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: versions.map((version) => {
      const isExpanded = expandedVersions.has(version.id);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => toggleVersionExpanded(version.id),
                    className: "p-1 h-6 w-6",
                    children: isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(GitBranch, { className: "h-4 w-4 text-blue-400" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold text-blue-400", children: version.version }),
                    version.published && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded", children: "PUBLISHED" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300 mt-1", children: version.description })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right text-sm text-gray-400", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                  getTimeDifference(version.timestamp)
                ] }),
                version.author && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
                  version.author
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Package, { className: "h-3 w-3" }),
                  version.variableCount,
                  " variables"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3" }),
                  version.changes.length,
                  " changes"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxs(Dialog, { children: [
                  /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedVersion(version), children: "VIEW DETAILS" }) }),
                  /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
                    /* @__PURE__ */ jsxs(DialogHeader, { children: [
                      /* @__PURE__ */ jsxs(DialogTitle, { children: [
                        "Version ",
                        selectedVersion?.version,
                        " Details"
                      ] }),
                      /* @__PURE__ */ jsx(DialogDescription, { children: selectedVersion?.description })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("strong", { children: "Published:" }),
                          " ",
                          new Date(selectedVersion?.timestamp || "").toLocaleString()
                        ] }),
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("strong", { children: "Author:" }),
                          " ",
                          selectedVersion?.author || "Unknown"
                        ] }),
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("strong", { children: "Variables:" }),
                          " ",
                          selectedVersion?.variableCount
                        ] }),
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("strong", { children: "Changes:" }),
                          " ",
                          selectedVersion?.changes.length
                        ] })
                      ] }),
                      selectedVersion && selectedVersion.changes.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("h4", { className: "font-semibold mb-2", children: "Changes:" }),
                        /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: selectedVersion.changes.map((change, idx) => {
                          const { text, color } = formatChangeType(change.type);
                          return /* @__PURE__ */ jsxs("div", { className: "border border-gray-600 rounded p-3", children: [
                            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                              /* @__PURE__ */ jsx("span", { className: "font-mono text-sm", children: change.name }),
                              /* @__PURE__ */ jsx("span", { className: `text-xs font-bold ${color}`, children: text })
                            ] }),
                            change.type !== "create" && change.oldValue && /* @__PURE__ */ jsxs("div", { className: "text-xs text-red-400", children: [
                              /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Old:" }),
                              " ",
                              change.sensitive ? "••••••••" : change.oldValue
                            ] }),
                            change.type !== "delete" && change.newValue && /* @__PURE__ */ jsxs("div", { className: "text-xs text-green-400", children: [
                              /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "New:" }),
                              " ",
                              change.sensitive ? "••••••••" : change.newValue
                            ] })
                          ] }, idx);
                        }) })
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "secondary",
                    size: "sm",
                    onClick: () => handleRestoreVersion(version.id),
                    children: "RESTORE"
                  }
                )
              ] })
            ] }),
            isExpanded && /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-gray-600", children: [
              /* @__PURE__ */ jsx("h5", { className: "text-xs font-semibold text-gray-400 mb-2", children: "CHANGES IN THIS VERSION:" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-1", children: version.changes.map((change, idx) => {
                const { text, color } = formatChangeType(change.type);
                return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-mono", children: change.name }),
                  /* @__PURE__ */ jsx("span", { className: `font-bold ${color}`, children: text })
                ] }, idx);
              }) })
            ] })
          ]
        },
        version.id
      );
    }) }) })
  ] });
}

function DraftMode({ projectPath, onPublish, onDiscard, playSound }) {
  const [draft, setDraft] = useState(null);
  const [draftVariables, setDraftVariables] = useState([]);
  const [changes, setChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [publishDescription, setPublishDescription] = useState("");
  const [showSensitive, setShowSensitive] = useState(/* @__PURE__ */ new Set());
  const [editingVariable, setEditingVariable] = useState(null);
  useEffect(() => {
    loadDraftState();
  }, [projectPath]);
  const loadDraftState = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/draft${projectPath ? `?projectPath=${encodeURIComponent(projectPath)}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setDraft(data.draft);
        setDraftVariables(data.variables || []);
        setChanges(data.changes || []);
        setPublishDescription(data.draft?.description || "");
      }
    } catch (error) {
      console.error("Failed to load draft state:", error);
      playSound?.("error");
    }
    setIsLoading(false);
  };
  const createDraft = async () => {
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          projectPath,
          description: publishDescription
        })
      });
      if (res.ok) {
        await loadDraftState();
        playSound?.("powerup");
      }
    } catch (error) {
      console.error("Failed to create draft:", error);
      playSound?.("error");
    }
  };
  const updateDraftVariable = async (name, updates) => {
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_variable",
          projectPath,
          name,
          updates
        })
      });
      if (res.ok) {
        await loadDraftState();
        setEditingVariable(null);
        playSound?.("hit");
      }
    } catch (error) {
      console.error("Failed to update draft variable:", error);
      playSound?.("error");
    }
  };
  const removeFromDraft = async (name) => {
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_variable",
          projectPath,
          name
        })
      });
      if (res.ok) {
        await loadDraftState();
        playSound?.("hit");
      }
    } catch (error) {
      console.error("Failed to remove variable from draft:", error);
      playSound?.("error");
    }
  };
  const publishDraft = async () => {
    if (!draft || changes.length === 0) return;
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          projectPath,
          description: publishDescription
        })
      });
      if (res.ok) {
        const data = await res.json();
        await loadDraftState();
        onPublish?.();
        playSound?.("success");
        setPublishDescription("");
      }
    } catch (error) {
      console.error("Failed to publish draft:", error);
      playSound?.("error");
    }
  };
  const discardDraft = async () => {
    if (!confirm("Are you sure you want to discard all draft changes? This cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "discard",
          projectPath
        })
      });
      if (res.ok) {
        await loadDraftState();
        onDiscard?.();
        playSound?.("hit");
        setPublishDescription("");
      }
    } catch (error) {
      console.error("Failed to discard draft:", error);
      playSound?.("error");
    }
  };
  const toggleSensitiveVisibility = (name) => {
    const newSet = new Set(showSensitive);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setShowSensitive(newSet);
  };
  const getChangeTypeDisplay = (type) => {
    switch (type) {
      case "create":
        return { text: "NEW", color: "bg-green-500/20 text-green-400", icon: Plus };
      case "update":
        return { text: "MODIFIED", color: "bg-yellow-500/20 text-yellow-400", icon: Edit3 };
      case "delete":
        return { text: "DELETE", color: "bg-red-500/20 text-red-400", icon: Trash2 };
      case "none":
      default:
        return { text: "UNCHANGED", color: "bg-gray-500/20 text-gray-400", icon: Edit3 };
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-8 text-center", children: /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: "Loading draft state..." }) }) });
  }
  if (!draft) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(FileEdit, { className: "h-5 w-5" }),
          "DRAFT MODE"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Start drafting changes to edit multiple variables before publishing" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsx(FileEdit, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4", children: "No active draft session" }),
        /* @__PURE__ */ jsxs(Button, { onClick: createDraft, children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "START DRAFT"
        ] })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(FileEdit, { className: "h-5 w-5" }),
          "DRAFT MODE",
          /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded", children: "ACTIVE" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: discardDraft, children: [
            /* @__PURE__ */ jsx(X, { className: "mr-2 h-4 w-4" }),
            "DISCARD"
          ] }),
          /* @__PURE__ */ jsxs(Dialog, { children: [
            /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { disabled: changes.length === 0, children: [
              /* @__PURE__ */ jsx(GitCommit, { className: "mr-2 h-4 w-4" }),
              "PUBLISH (",
              changes.length,
              ")"
            ] }) }),
            /* @__PURE__ */ jsxs(DialogContent, { children: [
              /* @__PURE__ */ jsxs(DialogHeader, { children: [
                /* @__PURE__ */ jsx(DialogTitle, { children: "Publish Draft Changes" }),
                /* @__PURE__ */ jsxs(DialogDescription, { children: [
                  "You're about to publish ",
                  changes.length,
                  " change(s). This will apply all modifications to your environment variables."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "publish-description", children: "Description (optional)" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "publish-description",
                      value: publishDescription,
                      onChange: (e) => setPublishDescription(e.target.value),
                      placeholder: "Describe what you changed..."
                    }
                  )
                ] }),
                changes.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-semibold mb-2", children: "Changes to be published:" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: changes.map((change, idx) => {
                    const { text, color, icon: Icon } = getChangeTypeDisplay(change.type);
                    return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 border border-gray-600 rounded", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-mono text-sm", children: change.name }),
                      /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1 px-2 py-1 rounded text-xs ${color}`, children: [
                        /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
                        text
                      ] })
                    ] }, idx);
                  }) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex gap-2 pt-4", children: /* @__PURE__ */ jsxs(Button, { onClick: publishDraft, className: "flex-1", children: [
                  /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
                  "PUBLISH CHANGES"
                ] }) })
              ] })
            ] })
          ] })
        ] })
      ] }),
      changes.length > 0 && /* @__PURE__ */ jsxs(CardDescription, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-400" }),
        changes.length,
        " pending change(s) ready to publish"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Draft Variables" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Variables that are currently being modified in this draft" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: draftVariables.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-gray-400", children: [
        /* @__PURE__ */ jsx(Edit3, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
        /* @__PURE__ */ jsx("p", { children: "No variables in draft" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Add or modify variables to start drafting changes" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: draftVariables.map((variable) => {
        const { text, color, icon: Icon } = getChangeTypeDisplay(variable.changeType);
        const isEditing = editingVariable === variable.name;
        const isVisible = showSensitive.has(variable.name);
        return /* @__PURE__ */ jsxs("div", { className: "border border-gray-600 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1 px-2 py-1 rounded text-xs ${color}`, children: [
                /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
                text
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: variable.name }),
              variable.sensitive && /* @__PURE__ */ jsx("span", { className: "px-1 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded", children: "SENSITIVE" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              variable.sensitive && /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => toggleSensitiveVisibility(variable.name),
                  children: isVisible ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => setEditingVariable(isEditing ? null : variable.name),
                  children: isEditing ? /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "destructive",
                  size: "sm",
                  onClick: () => removeFromDraft(variable.name),
                  children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }),
          isEditing ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Value" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: variable.sensitive && !isVisible ? "password" : "text",
                  value: variable.value,
                  onChange: (e) => updateDraftVariable(variable.name, { value: e.target.value }),
                  placeholder: "Enter value..."
                }
              )
            ] }),
            variable.description && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Description" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: variable.description,
                  onChange: (e) => updateDraftVariable(variable.name, { description: e.target.value }),
                  placeholder: "Variable description..."
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Current Value:" }),
              /* @__PURE__ */ jsx("div", { className: "font-mono text-sm mt-1", children: variable.sensitive && !isVisible ? "••••••••••••••••" : variable.value || /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Not set" }) })
            ] }),
            variable.originalValue && variable.originalValue !== variable.value && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Original Value:" }),
              /* @__PURE__ */ jsx("div", { className: "font-mono text-sm mt-1 text-gray-500", children: variable.sensitive && !isVisible ? "••••••••••••••••" : variable.originalValue })
            ] }),
            variable.description && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Description:" }),
              /* @__PURE__ */ jsx("div", { className: "text-sm mt-1", children: variable.description })
            ] })
          ] })
        ] }, variable.name);
      }) }) })
    ] })
  ] });
}

function ImportExportDialog({
  isOpen,
  onClose,
  projectPath,
  branch = "main",
  onImport,
  requiredVariables = [],
  existingVariables = [],
  projectConfig
}) {
  const [activeTab, setActiveTab] = useState("export");
  const [exportFormat, setExportFormat] = useState(".env");
  const [customExtension, setCustomExtension] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [parsedVariables, setParsedVariables] = useState([]);
  const [parseError, setParseError] = useState("");
  const fileInputRef = useRef(null);
  const exportFormats = [
    { value: ".env", label: ".env" },
    { value: ".env.local", label: ".env.local" },
    { value: ".env.development", label: ".env.development" },
    { value: ".env.production", label: ".env.production" },
    { value: ".env.staging", label: ".env.staging" },
    { value: "custom", label: "Custom..." }
  ];
  const handleExport = async (toClipboard = false) => {
    setExportLoading(true);
    try {
      const url = `/api/export?${new URLSearchParams({
        ...projectPath && { projectPath },
        branch,
        format: "env"
      })}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to export");
      const data = await response.json();
      const content = data.content || "";
      if (toClipboard) {
        await navigator.clipboard.writeText(content);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2e3);
      } else {
        const blob = new Blob([content], { type: "text/plain" });
        const url2 = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url2;
        a.download = exportFormat === "custom" ? `.env.${customExtension}` : exportFormat;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url2);
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
    }
  };
  const parseEnvContent = (content) => {
    const lines = content.split("\n");
    const variables = [];
    let currentCategory = "general";
    let lastDescription = "";
    const existingNames = new Set(existingVariables.map((v) => v.name));
    const configMap = /* @__PURE__ */ new Map();
    if (projectConfig?.requirements) {
      for (const [groupName, group] of Object.entries(projectConfig.requirements)) {
        for (const varConfig of group.variables || []) {
          configMap.set(varConfig.name, {
            ...varConfig,
            category: groupName
          });
        }
      }
    }
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        lastDescription = "";
        continue;
      }
      if (trimmed.startsWith("#")) {
        const comment = trimmed.substring(1).trim();
        if (comment.match(/^(===|---|\[).*?(===|---|\])/)) {
          currentCategory = comment.replace(/[=\-\[\]]/g, "").trim().toLowerCase();
        } else {
          lastDescription = comment;
        }
        continue;
      }
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
      if (match) {
        const [, name, value] = match;
        let cleanValue = value;
        if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
          cleanValue = value.slice(1, -1);
        }
        const configData = configMap.get(name);
        if (configData) {
          if (!cleanValue && (configData.default || configData.example)) {
            cleanValue = configData.default || configData.example || "";
          }
          variables.push({
            name,
            value: cleanValue,
            description: configData.description || lastDescription || void 0,
            category: configData.category || currentCategory,
            isRequired: configData.required || false,
            isSensitive: configData.sensitive || false,
            isNew: !existingNames.has(name),
            isDuplicate: existingNames.has(name)
          });
        } else {
          const isSensitive = name.includes("SECRET") || name.includes("KEY") || name.includes("PASSWORD") || name.includes("TOKEN") || name.includes("PRIVATE");
          variables.push({
            name,
            value: cleanValue,
            description: lastDescription || void 0,
            category: currentCategory,
            isRequired: requiredVariables.includes(name),
            isSensitive,
            isNew: !existingNames.has(name),
            isDuplicate: existingNames.has(name)
          });
        }
        lastDescription = "";
      }
    }
    if (projectConfig?.requirements) {
      for (const [groupName, group] of Object.entries(projectConfig.requirements)) {
        for (const varConfig of group.variables || []) {
          const imported = variables.find((v) => v.name === varConfig.name);
          if (varConfig.required && !imported) {
            variables.push({
              name: varConfig.name,
              value: varConfig.default || varConfig.example || "",
              description: varConfig.description,
              category: groupName,
              isRequired: true,
              isSensitive: varConfig.sensitive || false,
              isNew: !existingNames.has(varConfig.name),
              isDuplicate: false
            });
          }
        }
      }
    }
    return variables;
  };
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e2) => {
      const content = e2.target?.result;
      setImportContent(content);
      handleParseContent(content);
    };
    reader.readAsText(file);
  };
  const handleParseContent = (content) => {
    try {
      setParseError("");
      const parsed = parseEnvContent(content);
      setParsedVariables(parsed);
    } catch (error) {
      setParseError("Failed to parse .env file");
      setParsedVariables([]);
    }
  };
  const handleImportVariables = async () => {
    if (!onImport || parsedVariables.length === 0) return;
    setImportLoading(true);
    try {
      await onImport(parsedVariables);
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      setParseError("Failed to import variables");
    } finally {
      setImportLoading(false);
    }
  };
  const getVariableIcon = (variable) => {
    if (variable.isRequired) return "⚠️";
    if (variable.isDuplicate) return "🔄";
    if (variable.isNew) return "✨";
    return "📝";
  };
  const getVariableColor = (variable) => {
    if (variable.isRequired) return "text-yellow-400";
    if (variable.isDuplicate) return "text-blue-400";
    if (variable.isNew) return "text-green-400";
    return "text-gray-400";
  };
  return /* @__PURE__ */ jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-3xl max-h-[80vh] overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl font-bold", children: "IMPORT/EXPORT ENVIRONMENT VARIABLES" }),
      /* @__PURE__ */ jsx(DialogDescription, { children: "Export your variables to a file or clipboard, or import from an existing .env file" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: activeTab === "export" ? "default" : "outline",
          onClick: () => setActiveTab("export"),
          className: "flex-1",
          children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
            "EXPORT"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: activeTab === "import" ? "default" : "outline",
          onClick: () => setActiveTab("import"),
          className: "flex-1",
          children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2" }),
            "IMPORT"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto", children: [
      activeTab === "export" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "EXPORT FORMAT" }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "format", children: "Select format" }),
              /* @__PURE__ */ jsxs(Select, { value: exportFormat, onValueChange: setExportFormat, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsx(SelectContent, { children: exportFormats.map((format) => /* @__PURE__ */ jsx(SelectItem, { value: format.value, children: format.label }, format.value)) })
              ] })
            ] }),
            exportFormat === "custom" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "custom-ext", children: "Custom extension" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: ".env." }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "custom-ext",
                    value: customExtension,
                    onChange: (e) => setCustomExtension(e.target.value),
                    placeholder: "custom",
                    className: "flex-1"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: () => handleExport(false),
                  disabled: exportLoading || exportFormat === "custom" && !customExtension,
                  className: "flex-1",
                  children: [
                    /* @__PURE__ */ jsx(FileDown, { className: "h-4 w-4 mr-2" }),
                    "DOWNLOAD FILE"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: () => handleExport(true),
                  disabled: exportLoading,
                  variant: "outline",
                  className: "flex-1",
                  children: copySuccess ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 mr-2" }),
                    "COPIED!"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
                    "COPY TO CLIPBOARD"
                  ] })
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "EXPORT INFO" }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(Info, { className: "h-3 w-3 mt-0.5 text-blue-400" }),
              /* @__PURE__ */ jsx("span", { children: "Sensitive values will be decrypted during export" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(Info, { className: "h-3 w-3 mt-0.5 text-blue-400" }),
              /* @__PURE__ */ jsx("span", { children: "Comments with descriptions will be included" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(Info, { className: "h-3 w-3 mt-0.5 text-blue-400" }),
              /* @__PURE__ */ jsx("span", { children: "Variables are grouped by category" })
            ] })
          ] }) })
        ] })
      ] }),
      activeTab === "import" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "IMPORT SOURCE" }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  accept: ".env,.env.*,text/plain",
                  onChange: handleFileSelect,
                  className: "hidden"
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: () => fileInputRef.current?.click(),
                  variant: "outline",
                  className: "w-full",
                  children: [
                    /* @__PURE__ */ jsx(FileUp, { className: "h-4 w-4 mr-2" }),
                    "SELECT .ENV FILE"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "w-full border-t" }) }),
              /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsx("span", { className: "bg-gray-900 px-2 text-gray-400", children: "OR PASTE CONTENT" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "import-content", children: "Paste .env content" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "import-content",
                  value: importContent,
                  onChange: (e) => {
                    setImportContent(e.target.value);
                    handleParseContent(e.target.value);
                  },
                  placeholder: "# Database\nDATABASE_URL=postgresql://...",
                  className: "w-full h-32 px-3 py-2 text-sm bg-black border border-gray-600 rounded font-mono resize-none focus:outline-none focus:border-cyan-400"
                }
              )
            ] })
          ] })
        ] }),
        parseError && /* @__PURE__ */ jsx(Card, { className: "border-red-500", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-red-400", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: parseError })
        ] }) }) }),
        parsedVariables.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm", children: [
              "PARSED VARIABLES (",
              parsedVariables.length,
              ")"
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Review the variables that will be imported" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: parsedVariables.map((variable, idx) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center justify-between p-2 border border-gray-600 rounded text-xs",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { children: getVariableIcon(variable) }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "font-mono font-bold", children: variable.name }),
                      variable.description && /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-xs", children: variable.description }),
                      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1", children: [
                        variable.category && /* @__PURE__ */ jsx("span", { className: "px-1 py-0.5 bg-gray-800 rounded text-xs", children: variable.category }),
                        variable.isSensitive && /* @__PURE__ */ jsx("span", { className: "px-1 py-0.5 bg-red-900 rounded text-xs", children: "sensitive" })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: `text-xs ${getVariableColor(variable)}`, children: [
                    variable.isRequired && "REQUIRED",
                    variable.isDuplicate && "UPDATE",
                    variable.isNew && "NEW"
                  ] })
                ]
              },
              idx
            )) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-gray-700", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs mb-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx("span", { children: "✨" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "New: ",
                    parsedVariables.filter((v) => v.isNew).length
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx("span", { children: "🔄" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Update: ",
                    parsedVariables.filter((v) => v.isDuplicate).length
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx("span", { children: "⚠️" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Required: ",
                    parsedVariables.filter((v) => v.isRequired).length
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: handleImportVariables,
                  disabled: importLoading || parsedVariables.length === 0,
                  className: "w-full",
                  children: [
                    /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
                    "IMPORT ",
                    parsedVariables.length,
                    " VARIABLES"
                  ]
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}

function EnvManager8Bit({ project, onBack, skipAuth = false, onBranchChange, initialBranch }) {
  const [isAuthenticated, setIsAuthenticated] = useState(skipAuth);
  const [activeTab, setActiveTab] = useState("variables");
  const [password, setPassword] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch || "main");
  const [variables, setVariables] = useState([]);
  const [newVar, setNewVar] = useState({ name: "", value: "", type: "server", description: "", sensitive: false });
  const [isLoading, setIsLoading] = useState(false);
  const [deletingVariable, setDeletingVariable] = useState(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [currentProject, setCurrentProject] = useState(project || null);
  const [projectStatus, setProjectStatus] = useState(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportTypes, setShowExportTypes] = useState(false);
  const [typeExportContent, setTypeExportContent] = useState("");
  useEffect(() => {
    if (!skipAuth) {
      checkAuthStatus();
    } else if (project) {
      loadBranches();
      loadProjectStatus();
    }
  }, []);
  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        loadBranches();
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };
  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword("");
        loadBranches();
        playSound("success");
      } else {
        setError("Invalid password");
        playSound("error");
      }
    } catch (err) {
      setError("Login failed");
    }
    setIsLoading(false);
  };
  const loadBranches = async () => {
    try {
      const url = currentProject?.path ? `/api/branches?projectPath=${encodeURIComponent(currentProject.path)}` : "/api/branches";
      const res = await fetch(url);
      if (!res.ok) {
        console.error("Failed to load branches:", res.status);
        return;
      }
      const data = await res.json();
      let branchList = [];
      if (data.gitInfo?.isGitRepo && data.gitBranches?.length > 0) {
        branchList = data.gitBranches;
      } else {
        branchList = ["development", "staging", "production"];
      }
      setBranches(branchList);
      const defaultBranch = data.current || branchList[0] || "development";
      setSelectedBranch(defaultBranch);
      loadVariables(defaultBranch);
    } catch (err) {
      console.error("Failed to load branches:", err);
      const defaultBranches = ["development", "staging", "production"];
      setBranches(defaultBranches);
      setSelectedBranch(defaultBranches[0]);
      loadVariables(defaultBranches[0]);
    }
  };
  const loadProjectStatus = async () => {
    if (!currentProject?.path) return;
    try {
      const url = `/api/project/status?projectPath=${encodeURIComponent(currentProject.path)}`;
      const res = await fetch(url);
      if (res.ok) {
        const status = await res.json();
        setProjectStatus(status);
      }
    } catch (err) {
      console.error("Failed to load project status:", err);
    }
  };
  const loadVariables = async (branch) => {
    try {
      let url = `/api/variables?branch=${branch}`;
      if (currentProject?.path) {
        url += `&projectPath=${encodeURIComponent(currentProject.path)}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        console.error("Failed to load variables:", res.status);
        setVariables([]);
        return;
      }
      const data = await res.json();
      setVariables(data.variables || []);
    } catch (err) {
      console.error("Failed to load variables:", err);
      setVariables([]);
    }
  };
  const refreshVariables = () => {
    loadVariables(selectedBranch);
  };
  const handleGenerateSecret = async () => {
    if (!newVar.name) {
      setNotification({ type: "error", message: "Please enter a variable name first" });
      setTimeout(() => setNotification(null), 3e3);
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variableName: newVar.name,
          projectPath: currentProject?.path
        })
      });
      if (res.ok) {
        const data = await res.json();
        setNewVar({ ...newVar, value: data.value });
        playSound("powerup");
        setNotification({ type: "success", message: `Generated ${data.type} secret for ${newVar.name}` });
        setTimeout(() => setNotification(null), 3e3);
      } else {
        const error2 = await res.json();
        setNotification({ type: "error", message: error2.error || "Failed to generate secret" });
        setTimeout(() => setNotification(null), 5e3);
        playSound("error");
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to generate secret" });
      setTimeout(() => setNotification(null), 5e3);
    }
    setIsGenerating(false);
  };
  const handleAddVariable = async () => {
    if (!newVar.name || !newVar.value) return;
    setIsLoading(true);
    try {
      let url = "/api/variables";
      if (currentProject?.path) {
        url += `?projectPath=${encodeURIComponent(currentProject.path)}`;
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newVar.name,
          value: newVar.value,
          description: newVar.description,
          sensitive: newVar.sensitive,
          category: selectedBranch,
          branch: selectedBranch
        })
      });
      if (res.ok) {
        await loadVariables(selectedBranch);
        loadProjectStatus();
        setNewVar({ name: "", value: "", type: "server", description: "", sensitive: false });
        playSound("powerup");
        setNotification({ type: "success", message: `Variable "${newVar.name}" added successfully!` });
        setTimeout(() => setNotification(null), 3e3);
        setError("");
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error || "Failed to add variable";
        setNotification({ type: "error", message: errorMsg });
        setTimeout(() => setNotification(null), 5e3);
        playSound("error");
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to add variable" });
      setTimeout(() => setNotification(null), 5e3);
    }
    setIsLoading(false);
  };
  const handleDeleteVariable = async (name) => {
    if (!confirm(`Delete variable ${name}?`)) return;
    setDeletingVariable(name);
    try {
      let url = "/api/variables";
      if (currentProject?.path) {
        url += `?projectPath=${encodeURIComponent(currentProject.path)}`;
      }
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        await loadVariables(selectedBranch);
        loadProjectStatus();
        playSound("hit");
        setNotification({ type: "success", message: `Variable "${name}" deleted successfully!` });
        setTimeout(() => setNotification(null), 3e3);
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error || "Failed to delete variable";
        setNotification({ type: "error", message: errorMsg });
        setTimeout(() => setNotification(null), 5e3);
        playSound("error");
      }
    } catch (err) {
      console.error("Failed to delete variable:", err);
      setNotification({ type: "error", message: "Failed to delete variable" });
      setTimeout(() => setNotification(null), 5e3);
    }
    setDeletingVariable(null);
  };
  const handleExportTypes = async () => {
    setIsLoading(true);
    try {
      const url = `/api/export-types?${currentProject?.path ? `projectPath=${encodeURIComponent(currentProject.path)}&` : ""}format=both`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTypeExportContent(data.content);
        setShowExportTypes(true);
        playSound("powerup");
      } else {
        const error2 = await res.json();
        setNotification({ type: "error", message: error2.error || "Failed to export types" });
        setTimeout(() => setNotification(null), 5e3);
        playSound("error");
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to export types" });
      setTimeout(() => setNotification(null), 5e3);
    }
    setIsLoading(false);
  };
  const handleSaveTypes = async (location) => {
    if (location === "copy") {
      try {
        await navigator.clipboard.writeText(typeExportContent);
        setNotification({ type: "success", message: "Types copied to clipboard!" });
        setTimeout(() => setNotification(null), 3e3);
        playSound("success");
      } catch (err) {
        setNotification({ type: "error", message: "Failed to copy to clipboard" });
        setTimeout(() => setNotification(null), 3e3);
      }
    } else {
      setIsLoading(true);
      try {
        const res = await fetch("/api/export-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectPath: currentProject?.path,
            outputDir: currentProject?.path || "."
          })
        });
        if (res.ok) {
          const data = await res.json();
          setNotification({ type: "success", message: `Types saved to ${data.files.join(", ")}` });
          setTimeout(() => setNotification(null), 5e3);
          playSound("powerup");
          setShowExportTypes(false);
        } else {
          const error2 = await res.json();
          setNotification({ type: "error", message: error2.error || "Failed to save types" });
          setTimeout(() => setNotification(null), 5e3);
          playSound("error");
        }
      } catch (err) {
        setNotification({ type: "error", message: "Failed to save types" });
        setTimeout(() => setNotification(null), 5e3);
      }
      setIsLoading(false);
    }
  };
  const handleImportVariables = async (parsedVariables) => {
    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;
    try {
      for (const variable of parsedVariables) {
        try {
          let url = "/api/variables";
          if (currentProject?.path) {
            url += `?projectPath=${encodeURIComponent(currentProject.path)}`;
          }
          const method = variable.isDuplicate ? "PUT" : "POST";
          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: variable.name,
              value: variable.value,
              description: variable.description || "",
              sensitive: variable.isSensitive || false,
              category: variable.category || selectedBranch,
              branch: selectedBranch
            })
          });
          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }
      await loadVariables(selectedBranch);
      loadProjectStatus();
      if (errorCount === 0) {
        setNotification({
          type: "success",
          message: `Successfully imported ${successCount} variable${successCount !== 1 ? "s" : ""}!`
        });
        playSound("powerup");
      } else {
        setNotification({
          type: "error",
          message: `Imported ${successCount} variable${successCount !== 1 ? "s" : ""}, ${errorCount} failed`
        });
        playSound("error");
      }
      setTimeout(() => setNotification(null), 5e3);
    } catch (err) {
      setNotification({ type: "error", message: "Import failed" });
      setTimeout(() => setNotification(null), 5e3);
    } finally {
      setIsLoading(false);
    }
  };
  const playSound = (type) => {
  };
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4 text-6xl animate-bounce", children: "🔐" }),
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl mb-2", children: "ENV MANAGER" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "ENTER PASSWORD TO CONTINUE" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        handleLogin();
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "username",
            autoComplete: "username",
            value: "admin",
            style: { display: "none" },
            readOnly: true,
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", className: "text-xs", children: "PASSWORD" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "••••••••",
              className: "font-mono",
              autoComplete: "current-password"
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
            type: "submit",
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
        "PROJECT: ",
        currentProject?.packageInfo?.name || currentProject?.name || "Unknown",
        "| BRANCH: ",
        selectedBranch,
        "| VARIABLES: ",
        variables.length
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => window.location.href = "/",
          className: "mt-4",
          variant: "outline",
          children: [
            /* @__PURE__ */ jsx(FolderOpen, { className: "mr-2 h-4 w-4" }),
            "BACK TO PROJECTS"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Database, { className: "h-5 w-5" }),
        "SELECT BRANCH"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Select, { value: selectedBranch, onValueChange: (val) => {
        if (currentProject) {
          const projectName = currentProject.packageInfo?.name || currentProject.name || "project";
          const cleanProjectName = projectName.replace(/^@[^/]+\//, "").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
          window.location.href = `/${cleanProjectName}/${val}`;
        }
      }, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsx(SelectContent, { children: branches.map((branch) => /* @__PURE__ */ jsx(SelectItem, { value: branch, children: branch.toUpperCase() }, branch)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }),
        "ADD NEW VARIABLE"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: !currentProject ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-yellow-400", children: [
        /* @__PURE__ */ jsx(FolderOpen, { className: "mx-auto h-12 w-12 mb-4 opacity-50" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm mb-2", children: "NO PROJECT SELECTED" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => window.location.href = "/",
            variant: "outline",
            size: "sm",
            children: "SELECT PROJECT"
          }
        )
      ] }) : /* @__PURE__ */ jsx("form", { id: "add-variable-form", onSubmit: (e) => {
        e.preventDefault();
        handleAddVariable();
      }, children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "var-name", className: "text-xs", children: "NAME" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "var-name",
              value: newVar.name,
              onChange: (e) => setNewVar({ ...newVar, name: e.target.value }),
              placeholder: "VARIABLE_NAME",
              className: "font-mono",
              autoComplete: "off"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "var-value", className: "text-xs", children: "VALUE" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "var-value",
                type: newVar.sensitive ? "password" : "text",
                value: newVar.value,
                onChange: (e) => setNewVar({ ...newVar, value: e.target.value }),
                placeholder: "value",
                className: "font-mono flex-1",
                autoComplete: newVar.sensitive ? "new-password" : "off"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                onClick: handleGenerateSecret,
                disabled: isGenerating || !newVar.name,
                variant: "outline",
                size: "sm",
                title: "Generate secret value",
                children: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" })
              }
            )
          ] })
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
              className: "font-mono",
              autoComplete: "off"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1 cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    name: "var-type",
                    value: "server",
                    checked: newVar.type === "server",
                    onChange: (e) => setNewVar({ ...newVar, type: e.target.value }),
                    className: "w-4 h-4"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-xs", children: "SERVER" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1 cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "radio",
                    name: "var-type",
                    value: "client",
                    checked: newVar.type === "client",
                    onChange: (e) => setNewVar({ ...newVar, type: e.target.value }),
                    className: "w-4 h-4"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-xs", children: "CLIENT" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1 cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: newVar.sensitive,
                  onChange: (e) => setNewVar({ ...newVar, sensitive: e.target.checked }),
                  className: "w-4 h-4"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-xs", children: "SENSITIVE" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "submit",
              disabled: isLoading || !newVar.name || !newVar.value || !currentProject,
              children: [
                /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
                "ADD"
              ]
            }
          )
        ] })
      ] }) }) })
    ] }),
    projectStatus && projectStatus.groups && Object.keys(projectStatus.groups).length > 0 && /* @__PURE__ */ jsxs(Card, { className: "mb-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" }),
          "REQUIRED VARIABLES"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: projectStatus.missing.length > 0 ? `Missing ${projectStatus.missing.length} required variable(s)` : "All required variables configured" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: Object.entries(projectStatus.groups).map(([groupKey, group]) => {
        const typedGroup = group;
        if (typedGroup.missing.length === 0) return null;
        return /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-yellow-400 mb-3", children: [
            typedGroup.name.toUpperCase(),
            " (",
            typedGroup.missing.length,
            " missing)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: typedGroup.variables.filter((v) => !v.configured).map((variable) => /* @__PURE__ */ jsx(
            MissingVariableItem,
            {
              variable,
              groupKey,
              currentProject,
              selectedBranch,
              onSuccess: () => {
                loadVariables(selectedBranch);
                loadProjectStatus();
              },
              playSound
            },
            variable.name
          )) })
        ] }, groupKey);
      }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: activeTab === "variables" ? "default" : "outline",
                onClick: () => setActiveTab("variables"),
                size: "sm",
                children: [
                  /* @__PURE__ */ jsx(Terminal, { className: "mr-2 h-4 w-4" }),
                  "VARIABLES"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: activeTab === "draft" ? "default" : "outline",
                onClick: () => setActiveTab("draft"),
                size: "sm",
                children: [
                  /* @__PURE__ */ jsx(FileEdit, { className: "mr-2 h-4 w-4" }),
                  "DRAFT MODE"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: activeTab === "history" ? "default" : "outline",
                onClick: () => setActiveTab("history"),
                size: "sm",
                children: [
                  /* @__PURE__ */ jsx(History, { className: "mr-2 h-4 w-4" }),
                  "HISTORY"
                ]
              }
            )
          ] }),
          activeTab === "variables" && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setShowImportExport(true),
                title: "Import/Export Variables",
                children: [
                  /* @__PURE__ */ jsx(FileInput, { className: "h-4 w-4 mr-1" }),
                  /* @__PURE__ */ jsx(FileOutput, { className: "h-4 w-4" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: handleExportTypes,
                title: "Export TypeScript Types",
                children: /* @__PURE__ */ jsx(FileCode, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: refreshVariables, children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }) })
          ] })
        ] }),
        activeTab === "variables" && /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Terminal, { className: "h-5 w-5" }),
          "VARIABLES (",
          variables.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        notification && /* @__PURE__ */ jsxs("div", { className: `mb-4 p-3 rounded border animate-pulse ${notification.type === "success" ? "bg-green-900/50 border-green-500 text-green-200" : "bg-red-900/50 border-red-500 text-red-200"}`, children: [
          notification.type === "success" ? "✅" : "⚠️",
          " ",
          notification.message
        ] }),
        activeTab === "variables" && /* @__PURE__ */ jsx("div", { children: !currentProject ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-gray-500", children: [
          /* @__PURE__ */ jsx(Database, { className: "mx-auto h-12 w-12 mb-4 opacity-50" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: "NO PROJECT SELECTED" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: () => window.location.href = "/",
              variant: "outline",
              size: "sm",
              className: "mt-4",
              children: "SELECT PROJECT"
            }
          )
        ] }) : variables.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-gray-500", children: [
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
                    disabled: deletingVariable === variable.name || isLoading,
                    children: deletingVariable === variable.name ? "⏳" : "X"
                  }
                )
              ] })
            ]
          },
          variable.name
        )) }) }),
        activeTab === "draft" && /* @__PURE__ */ jsx(
          DraftMode,
          {
            projectPath: currentProject?.path,
            onPublish: () => {
              loadVariables(selectedBranch);
            },
            onDiscard: () => {
            },
            playSound
          }
        ),
        activeTab === "history" && /* @__PURE__ */ jsx(
          VersionHistory,
          {
            projectPath: currentProject?.path,
            onRestoreVersion: () => {
              setActiveTab("draft");
            },
            playSound
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ImportExportDialog,
      {
        isOpen: showImportExport,
        onClose: () => setShowImportExport(false),
        projectPath: currentProject?.path,
        branch: selectedBranch,
        onImport: handleImportVariables,
        requiredVariables: projectStatus?.missing || [],
        existingVariables: variables
      }
    ),
    /* @__PURE__ */ jsx(Dialog, { open: showExportTypes, onOpenChange: setShowExportTypes, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Export TypeScript Types" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Generated TypeScript types for your environment variables" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "border-4 border-black bg-gray-50 p-4 rounded-none", children: /* @__PURE__ */ jsx("pre", { className: "text-xs font-mono overflow-x-auto whitespace-pre", children: typeExportContent }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              onClick: () => handleSaveTypes("copy"),
              disabled: isLoading,
              children: [
                /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
                "Copy to Clipboard"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: () => handleSaveTypes("root"),
              disabled: isLoading || !currentProject,
              children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
                "Save to Project Root"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-600 border-t pt-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold mb-1", children: "Generated files:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              "• ",
              /* @__PURE__ */ jsx("code", { children: "env.types.ts" }),
              " - TypeScript interfaces and runtime objects"
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "• ",
              /* @__PURE__ */ jsx("code", { children: "env.d.ts" }),
              " - Global type declarations for process.env"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Files will be saved to your project root directory." })
        ] })
      ] })
    ] }) })
  ] });
}

const $$Astro = createAstro();
const $$ = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { slug } = Astro2.params;
  const parts = slug ? slug.split("/") : [];
  const projectId = parts[0] || null;
  const branch = parts[1] || "main";
  if (!projectId) {
    return Astro2.redirect("/");
  }
  const registryPath = path.join(os.homedir(), ".env-manager", "projects.json");
  let project = null;
  try {
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      for (const [projectPath, projectData] of Object.entries(registry.projects)) {
        const name = projectData.packageInfo?.name || projectData.name || path.basename(projectPath);
        const cleanName = name.replace(/^@[^/]+\//, "").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
        if (cleanName === projectId) {
          project = {
            ...projectData,
            id: projectPath,
            path: projectPath,
            gitBranch: branch
          };
          break;
        }
      }
    }
  } catch (error) {
    console.error("Failed to load project registry:", error);
  }
  if (!project) {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "Layout8Bit", $$Layout8Bit, { "projectName": project.name, "gitBranch": branch }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gray-900 pb-16"> ${renderComponent($$result2, "EnvManager8Bit", EnvManager8Bit, { "client:load": true, "project": project, "initialBranch": branch, "skipAuth": true, "client:component-hydration": "load", "client:component-path": "/home/cory-ubuntu/coding/projects/env-manager/src/components/EnvManager8Bit", "client:component-export": "default" })} ${renderComponent($$result2, "VersionFooter", VersionFooter, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/cory-ubuntu/coding/projects/env-manager/src/components/VersionFooter", "client:component-export": "default" })} </div> ` })}`;
}, "/home/cory-ubuntu/coding/projects/env-manager/src/pages/[...slug].astro", void 0);

const $$file = "/home/cory-ubuntu/coding/projects/env-manager/src/pages/[...slug].astro";
const $$url = "/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
