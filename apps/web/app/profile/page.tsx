import { redirect } from "next/navigation";

/**
 * Disabled existing profile page.
 * All traffic is forwarded to the integrated Hishab Nikash /account module.
 */
export default function ProfilePage() {
  redirect("/account");
}
