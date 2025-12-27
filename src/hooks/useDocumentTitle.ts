import React from "react";

export function useDocumentTitle(title: string, condition: boolean) {
  React.useEffect(() => {
    if (condition) {
      document.title = title;
    }
  }, [title, condition]);
}

export default useDocumentTitle;
