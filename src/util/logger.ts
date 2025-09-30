import { PLUGIN_NAME } from "@/main";

export function debug(...args: any[]) {
    console.debug(`[${PLUGIN_NAME}]`, ...args);
}

export function log(...args: any[]) {
    console.log(`[${PLUGIN_NAME}]`, ...args);
}

export function warn(...args: any[]) {
    console.warn(`[${PLUGIN_NAME}]`, ...args);
}

export function error(...args: any[]) {
    console.error(`[${PLUGIN_NAME}]`, ...args);
}