import {ReactNode} from "react";
import {useCan} from "../hooks/useCan";

interface CanProps {
  children: ReactNode,
  permissions?: string[],
  roles?: string[]
}

export function Can ({children, roles, permissions}: CanProps) {
  const userCanSeeComponent = useCan({roles, permissions});
  if (!userCanSeeComponent) {
    return null;
  }
  return (
    <>
      {children}
    </>
  )
}