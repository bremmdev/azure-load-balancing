import React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  as?: "button";
} & React.ComponentProps<"button">;

type AnchorProps = {
  as?: "a";
} & React.ComponentProps<"a">;

type Props = ButtonProps | AnchorProps;

export default function Button(props: Props) {
  const { as: Component = "button", children, className, ...rest } = props;

  const classes = cn(
    "text-white flex justify-center gap-2 items-center bg-primary-teal px-4 py-2 w-fit rounded-md font-medium uppercase hover:bg-opacity-90 mx-auto",
    className
  );

  if (Component === "a") {
    return (
      <a {...(rest as React.ComponentProps<"a">)} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button {...(rest as React.ComponentProps<"button">)} className={classes}>
      {children}
    </button>
  );
}
