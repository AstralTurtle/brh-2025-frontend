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
    <div>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/about" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>About Me</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/narrative" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Personal Narrative</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/memory" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Memory as a Point of Departure
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/letter" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Letter to a Young...</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/response" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Clarifying a Response</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/synthesis" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Exploring New Perspectives Through Synthesis
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
