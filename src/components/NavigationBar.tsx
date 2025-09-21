import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

export default function NavigationBar() {
  return (
    <div className="flex flex-row gap-4 px-12 py-6 items-center">
      <a className="text-3xl font-bold italic text-white mr-12" href="/">Frame One</a>
      <a className="text-xl text-white bg-slate-900 rounded-lg py-4 px-8 font-semibold" href="/chat">Chat</a>
      <a className="text-xl text-white bg-slate-900 rounded-lg py-4 px-8 font-semibold" href="/feed">Scroll</a>
      <a className="text-xl text-white bg-slate-900 rounded-lg py-4 px-8 font-semibold" href="/search">Search</a>
    </div>
  );
}
