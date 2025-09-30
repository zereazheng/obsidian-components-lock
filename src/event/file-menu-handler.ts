import { EventRef, WorkspaceLeaf } from "obsidian";

import { t } from "@/i18n";
import EventHandler from "@/type/event-handler";
import LeafContext from "@/type/leaf-context";
import { getLucideIconName } from "@/util";

export default class FileMenuHandler extends EventHandler {

    private activeLeafContext: LeafContext | null = null;

    load(): void {
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("file-menu", (menu) => {
                if (this.activeLeafContext === null) return;
                const isLocked = this.activeLeafContext.isLocked
                menu.addItem((item) => {
                    item
                        .setTitle(t("file-menu.option-lock"))
                        .setIcon(getLucideIconName(isLocked))
                        .setChecked(isLocked)
                        .onClick(() => {
                            this.activeLeafContext?.toggle();
                        });
                });
            })
        );
    }

    unload(): void {
        this.activeLeafContext = null;
    }

    afterRegister(activeContext: LeafContext | null, contexts: LeafContext[]): void {
        this.activeLeafContext = activeContext;
    }

    onActiveLockableLeafChange(context: LeafContext): void {
        this.activeLeafContext = context;
    }

    onActiveNonLockableLeafChange(leaf: WorkspaceLeaf): void {
        this.activeLeafContext = null;
    }
}