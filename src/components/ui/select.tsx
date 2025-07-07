import React, { ReactNode } from "react";
export const Select = ({ children, ...p }: { children: ReactNode }) => <select {...p}>{children}</select>;
export const SelectTrigger = ({ children, ...p }: { children: ReactNode }) => <select {...p}>{children}</select>;
export const SelectContent = ({ children, ...p }: { children: ReactNode }) => <div {...p}>{children}</div>;
export const SelectItem = ({ children, ...p }: { children: ReactNode }) => <option {...p}>{children}</option>;
export const SelectValue = ({ children, ...p }: { children: ReactNode }) => <span {...p}>{children}</span>;
