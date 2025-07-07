import React, { ReactNode } from "react";
export const Label = ({ children, ...p }: { children: ReactNode }) => <label {...p}>{children}</label>;
