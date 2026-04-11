import {
    CreditCardIcon,
    FilesIcon,
    FolderIcon,
    HistoryIcon,
    KeyRoundIcon,
    LayersIcon,
    PlusIcon,
    BarChart3Icon,
    UsersIcon,
    ZapIcon
} from "lucide-react";

export const appMenuItems = [
    {
        name: "New Task",
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
