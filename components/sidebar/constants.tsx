import {
    CreditCardIcon,
    FolderIcon,
    HistoryIcon,
    KeyRoundIcon,
    LayersIcon,
    PlusIcon,
    BarChart3Icon,
    BlocksIcon,
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
        name: "Integrations",
        icon: BlocksIcon,
        href: "/integrations"
    },
    {
        name: "Usage",
        icon: BarChart3Icon,
        href: "/usage",
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
