import React, { createContext, useContext, useState, useMemo } from 'react';
import { NavTab, ServerSubTab, LicenseTier } from '../types';
import { INITIAL_DEFAULT_LICENSE } from '../data/EnterpriseSubscriptionTiers';

interface SystemContextType {
  isSystemOnline: boolean;
  setIsSystemOnline: (online: boolean) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  serverSubTab: ServerSubTab;
  setServerSubTab: (sub: ServerSubTab) => void;
  bootingSystem: null | 'kex' | 'aether' | 'mining' | 'kexlinux';
  setBootingSystem: (sys: null | 'kex' | 'aether' | 'mining' | 'kexlinux') => void;
  currentLicense: LicenseTier;
  setCurrentLicense: (license: LicenseTier) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [isSystemOnline, setIsSystemOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [serverSubTab, setServerSubTab] = useState<ServerSubTab>('mining');
  const [bootingSystem, setBootingSystem] = useState<null | 'kex' | 'aether' | 'mining' | 'kexlinux'>(null);
  const [currentLicense, setCurrentLicense] = useState(INITIAL_DEFAULT_LICENSE);

  const value = useMemo(() => ({
    isSystemOnline,
    setIsSystemOnline,
    activeTab,
    setActiveTab,
    serverSubTab,
    setServerSubTab,
    bootingSystem,
    setBootingSystem,
    currentLicense,
    setCurrentLicense
  }), [isSystemOnline, activeTab, serverSubTab, bootingSystem, currentLicense]);

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
