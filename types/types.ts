import { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export interface userProfile {
  id: string;
  email: string;
  password: string;
}