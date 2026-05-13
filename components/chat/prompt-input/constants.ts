import { BriefcaseIcon, ChartAreaIcon, GlobeIcon, StoreIcon } from "lucide-react";

export const pills = [{
    name: "Social Media",
    prompt: "Create a social media agent that can help me grow my brand and increase sales",
    Icon: GlobeIcon
}, {
    name: "Sales",
    prompt: "Create a sales agent that can help me close deals and increase sales",
    Icon: StoreIcon
}, {
    name: "Marketing",
    prompt: "Create a marketing agent that can help me promote my business and increase sales",
    Icon: ChartAreaIcon
}, {
    name: "Employment",
    prompt: "Create an agent that can help me find a job and increase my employment rate",
    Icon: BriefcaseIcon
}];

type AIModels = {
    name: string,
    displayName: string,
    plan: number
}

export const aiModels: Array<AIModels> = [{
    name: "gpt-4.1-mini",
    displayName: "GPT-4.1 mini",
    plan: 0,
}, {
    name: "gpt-4.1-nano",
    displayName: "GPT-4.1 nano",
    plan: 0,
}, {
    name: "gpt-4o-mini",
    displayName: "GPT-4o mini",
    plan: 0,
}, {
    name: "gpt-4o",
    displayName: "GPT-4o",
    plan: 1,
}, {
    name: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    plan: 0
}, {
    name: "gemini-2.0-pro-exp-02-05",
    displayName: "Gemini 2.0 Pro",
    plan: 1
}];