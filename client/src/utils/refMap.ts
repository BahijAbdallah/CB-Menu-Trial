import React from "react";

export function useRefMap<T extends HTMLElement = HTMLElement>() {
  const map = React.useRef(new Map<string, React.RefObject<T>>());
  const get = (id: string) => {
    if (!map.current.has(id)) map.current.set(id, React.createRef<T>());
    return map.current.get(id)!;
  };
  return { get, map: map.current };
}