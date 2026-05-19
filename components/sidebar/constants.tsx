import {
    BarChart3Icon,
    ClockIcon,
    CreditCardIcon,
    DatabaseIcon,
    KeyRoundIcon,
    LayersIcon,
    PlusIcon,
    SettingsIcon,
} from "lucide-react";

export const appMenuItems = [
    {
        name: "Assistant",
        icon: PlusIcon,
        href: "/",
        newChat: true,
    },
    {
        name: "Sources",
        icon: DatabaseIcon,
        href: "/sources",
    },
    {
        name: "History",
        icon: ClockIcon,
        href: "/recents",
    },
    {
        name: "Usage",
        icon: BarChart3Icon,
        href: "/usage",
    },
    {
        name: "Settings",
        icon: SettingsIcon,
        href: "/settings",
    }
]

export const loggedOutMenuItems = [
    {
        name: "New Chat",
        icon: PlusIcon,
        href: "/",
        variant: "outline",
        newChat: true,
    },
    {
        name: "Home",
        icon: LayersIcon,
        href: "/",
    },
    {
        name: "Pricing",
        icon: CreditCardIcon,
        href: "/pricing",
    },
    {
        name: "Login",
        icon: KeyRoundIcon,
        href: "/login",
    }
]
