import React, { ReactNode } from "react";

// A super-lightweight Tabs implementation for build-time only
export const Tabs = ({ children, ...props }: { children: ReactNode }) => (
  <div {...props}>{children}</div>
);

export const TabsList = ({ children, ...props }: { children: ReactNode }) => (
  <div role="tablist" {...props}>{children}</div>
);

/**
 * TabsTrigger roughly corresponds to a <Tab> button.
 * We carry the `value` prop in data-value so your CSS/logic can pick it up.
 */
export const TabsTrigger = ({
  children,
  value,
  ...props
}: { children: ReactNode; value: string }) => (
  <button role="tab" data-value={value} {...props}>
    {children}
  </button>
);

/**
 * TabsContent roughly corresponds to a <TabPanel>.
 * Again, we keep the `value` so your runtime logic or CSS can toggle visibility.
 */
export const TabsContent = ({
  children,
  value,
  ...props
}: { children: ReactNode; value: string }) => (
  <div role="tabpanel" data-value={value} {...props}>
    {children}
  </div>
);
