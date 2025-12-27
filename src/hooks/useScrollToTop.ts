import React from "react";

export default function useScrollToTop() {
  React.useLayoutEffect(() => {
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
}
