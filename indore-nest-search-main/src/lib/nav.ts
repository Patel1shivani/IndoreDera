import { GoHome, GoInfo, GoMail, GoSearch } from "react-icons/go";
import type { IconType } from "react-icons";

export type NavItem = {
  to: string;
  label: string;
  /** react-icons/go (GitHub Octicons) ka component. */
  icon: IconType;
};

/* Site ka main menu — header, mobile drawer aur footer teeno yahin se aate hain,
   isliye ek jagah badlo to sab jagah badal jata hai. */
export const mainNav: readonly NavItem[] = [
  { to: "/", label: "Home", icon: GoHome },
  { to: "/properties", label: "Sab dekho", icon: GoSearch },
  { to: "/about", label: "About", icon: GoInfo },
  { to: "/contact", label: "Contact", icon: GoMail },
] as const;
