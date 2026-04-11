import { BookIcon, BriefcaseIcon, CodeIcon, PencilIcon } from "lucide-react";

export const pills = [{
    name: "Get Started",
    prompt: "Update my resume to include my latest achievements and skills.",
    Icon: BriefcaseIcon
}, {
    name: "Teacher",
    prompt: "Create a lesson plan for a 10 week course on Python programming. Include exercises, quizzes, and assignments.",
    Icon: BookIcon
}, {
    name: "Code",
    prompt: "Help me figure out how to write a function that takes a list of numbers and returns the sum of all the even numbers.",
    Icon: CodeIcon
}, {
    name: "Find work",
    prompt: "Help me find work in my field of interest.",
    Icon: BookIcon
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