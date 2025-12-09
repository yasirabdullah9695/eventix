import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Map a logical page name to a router path used in the app.
 * If `name` already looks like a path (starts with `/`), return it unchanged.
 */
export function createPageUrl(name) {
  if (!name) return "/";
  if (typeof name !== "string") return "/";
  if (name.startsWith("/")) return name;

  const map = {
    Home: "/",
    Voting: "/voting",
    Events: "/events",
    EventCalendar: "/event-calendar",
    EventCalender: "/event-calendar",
    Leaderboard: "/leaderboard",
    VotingResults: "/voting-results",
    Gallery: "/gallery",
    Notifications: "/notifications",
    Profile: "/profile",
    ProfileSetup: "/profile-setup",
    AdminGuide: "/admin-guide",
    AdminDashboard: "/admin",
  };

  return map[name] || "/";
}
