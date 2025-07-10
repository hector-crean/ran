"use client";

import SettingsDialog from "@/components/ui/settings-dialog";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SettingsDialog />
      {children}
    </>
  );
};

export default Layout;
