import React, { ReactNode } from "react";
export const ScrollArea = ({ children, ...p }: { children: ReactNode }) => <div style={{ overflowY: "auto" }} {...p}>{children}</div>;
