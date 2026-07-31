import type { IconType } from "react-icons";
import {
  GoCheck,
  GoClock,
  GoCommentDiscussion,
  GoCreditCard,
  GoDeviceMobile,
  GoGlobe,
  GoHomeFill,
  GoInfo,
  GoLocation,
  GoMail,
  GoPeople,
  GoPersonAdd,
  GoRocket,
  GoSearch,
  GoShieldCheck,
  GoStarFill,
  GoTag,
  GoVerified,
  GoZap,
} from "react-icons/go";

/*
 * Admin se aane wale icon naam → asli component.
 *
 * Database me icon sirf ek string hai (jaise "tag"), kyunki React component
 * ko JSON me nahi bheja ja sakta. Ye vocabulary backend ke CONTENT_ICONS aur
 * admin ke dropdown se match karti hai — teeno jagah ek hi list.
 */
const map: Record<string, IconType> = {
  tag: GoTag,
  globe: GoGlobe,
  location: GoLocation,
  shield: GoShieldCheck,
  verified: GoVerified,
  zap: GoZap,
  comment: GoCommentDiscussion,
  search: GoSearch,
  personAdd: GoPersonAdd,
  home: GoHomeFill,
  rocket: GoRocket,
  clock: GoClock,
  mail: GoMail,
  phone: GoDeviceMobile,
  star: GoStarFill,
  check: GoCheck,
  creditCard: GoCreditCard,
  people: GoPeople,
  info: GoInfo,
};

/**
 * Anjaan ya khaali naam par bhi kuch na kuch milta hai — admin ne icon na
 * chuna ho to layout me khaali gap nahi dikhna chahiye.
 */
export function contentIcon(name: string | undefined): IconType {
  return (name && map[name]) || GoCheck;
}
