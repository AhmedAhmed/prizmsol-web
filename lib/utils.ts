import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateId } from "ai";
import { genSaltSync, hashSync } from "bcrypt-ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export const displayTodaysDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // get time string
    const min = date.getMinutes();
    const hour = date.getHours();
    const time = `${hour}:${min.toString().padStart(2, "0")}`;

    return `${day}/${month}/${year} ${time}`;
};

export const getValidSubdomain = (host: string) => {
    let subdomain = null;
    if (!host && typeof window !== "undefined") {
        // On client side, get the host from window
        host = window.location.host;
    }
    if (host && host.includes(".")) {
        const candidate = host.split(".")[0];
        if (candidate && !candidate.includes("localhost")) {
            // Valid candidate
            subdomain = candidate;
        }
    }
    return subdomain;
};

export const checkLogin = (user: any): boolean => {
    return !!user;
}

export function pathToNestedObject(path: string, value = {}) {
    const parts = path.split('/');
    return parts.reduceRight((acc, part, index) => {
        const isFile = index === parts.length - 1;
        return isFile
            ? { [part]: acc }
            : { [part]: { directory: acc } };
    }, value);
}

export function deepMerge(target: any, source: any) {
    for (const key in source) {
        if (
            source[key] &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key])
        ) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

export function generateHashedPassword(password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}

export function generateDummyPassword() {
  const password = generateId();
  const hashedPassword = generateHashedPassword(password);

  return hashedPassword;
}