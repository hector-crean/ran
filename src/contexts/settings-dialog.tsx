"use client";

import { createContext, useContext, useState } from "react";

interface SettingsContextType {
  isDialogOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  settings: Record<string, { enabled: boolean; href: string }>;
  toggleSetting: (settingName: string) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  isDialogOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  settings: {},
  toggleSetting: () => {},
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [settings, setSettings] = useState({
    igANMod: {
      enabled: false,
      href: "/igan-introduction",
    },
    aprilRole: {
      enabled: false,
      href: "/introduction-to-april-taci-bcma-09",
    },
    zigakibartMOA: {
      enabled: false,
      href: "/introduction-to-zigakibart",
    },
  });

  const toggleSetting = (settingName: string) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: {
        enabled: !prev[settingName as keyof typeof prev].enabled,
        href: prev[settingName as keyof typeof prev].href,
      },
    }));
  };

  const openSettings = () => setIsDialogOpen(true);
  const closeSettings = () => setIsDialogOpen(false);

  const value = {
    isDialogOpen,
    openSettings,
    closeSettings,
    settings,
    toggleSetting,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
