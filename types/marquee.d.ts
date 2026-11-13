import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      marquee: DetailedHTMLProps<HTMLAttributes<HTMLMarqueeElement>, HTMLMarqueeElement> & {
        behavior?: "scroll" | "slide" | "alternate";
        direction?: "left" | "right" | "up" | "down";
        scrollamount?: number;
      };
    }
  }
}
