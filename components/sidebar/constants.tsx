import {
    BarChart3Icon,
    CreditCardIcon,
    FolderIcon,
    HistoryIcon,
    KeyRoundIcon,
    LayersIcon,
    PenLineIcon,
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
        name: "History",
        icon: HistoryIcon,
        href: "/recents",
    },
    {
        name: "Collections",
        icon: FolderIcon,
        href: "/collections"
    },
    {
        name: "Usage",
        icon: BarChart3Icon,
        href: "/usage",
    },
    {
        name: "Portfolio",
        icon: PenLineIcon,
        href: "/portfolio",
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
