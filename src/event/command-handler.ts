import { WorkspaceLeaf } from "obsidian";

import { t } from "@/i18n";
import EventHandler from "@/type/event-handler";
import LeafContext from "@/type/leaf-context";

const COMMAND_ID = "toggle-lock-status";

export default class CommandHandler extends EventHandler {

    private isRegistered: boolean = false;

    private activeLeafContext: LeafContext | null = null;

    load(): void { }

    unload(): void {
        this.activeLeafContext = null;
        this.unregisterCommands();
    }

    afterRegister(activeContext: LeafContext | null, contexts: LeafContext[]): void {
        this.activeLeafContext = activeContext;
        if (activeContext) {
            this.registerCommands();
        }
    }

    onActiveLockableLeafChange(context: LeafContext): void {
        this.activeLeafContext = context;
        this.registerCommands();
    }

    onActiveNonLockableLeafChange(leaf: WorkspaceLeaf): void {
        this.activeLeafContext = null;
        this.unregisterCommands();
    }

    onActiveLockableLeafClosed(context: LeafContext): void {
        this.activeLeafContext = null;
        this.unregisterCommands();
    }

    /**
     * 注册命令
     */
    private registerCommands(): void {
        if (this.isRegistered) return;

        this.plugin.addCommand({
            id: COMMAND_ID,
            name: t("command.toggle-lock-status"),
            callback: () => {
                this.activeLeafContext?.toggle();
            }
        });

        this.isRegistered = true;
    }

    /**
     * 注销命令
     */
    private unregisterCommands(): void {
        if (!this.isRegistered) return;
        this.plugin.removeCommand(COMMAND_ID);
        this.isRegistered = false;
    }
}