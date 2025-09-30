import { TFile, WorkspaceLeaf } from "obsidian";

import { LockStatus } from "@/type/enums";

export function isLockableWorkspaceLeaf(leaf: WorkspaceLeaf): boolean {
    const file = (leaf.view as any)?.file as TFile;
    if (!file) return false;
    if (file.extension === "components") return true;
    if (file.extension === "md") {
        const fileCache = leaf.view.app.metadataCache.getFileCache(file);
        if (fileCache && fileCache.embeds) {
            for (const embed of fileCache.embeds) {
                if (embed.link.endsWith(".components")) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function getLucideIconName(status: LockStatus | boolean): string {
    return status === LockStatus.LOCK || status === true ? "lock" : "lock-open";
}