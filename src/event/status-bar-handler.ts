import { WorkspaceLeaf, Menu, MenuItem, setIcon } from "obsidian";

import { t } from "@/i18n";
import EventHandler from "@/type/event-handler"
import LeafContext from "@/type/leaf-context";
import { getLucideIconName } from "@/util"

export default class StatusBarHandler extends EventHandler {

    private activeLeafContext: LeafContext | null = null;

    private buttonEl: HTMLElement | null = null;

    load(): void { }

    unload(): void {
        this.activeLeafContext = null;
        this.removeButton();
    }

    afterRegister(activeContext: LeafContext | null, contexts: LeafContext[]): void {
        this.activeLeafContext = activeContext;
        if (activeContext !== null && this.buttonEl === null) {
            this.upsertButton(activeContext);
        }
    }

    onLockStatusChange(context: LeafContext): void {
        this.upsertButton(context);
    }

    onActiveLockableLeafChange(context: LeafContext): void {
        this.activeLeafContext = context;
        this.upsertButton(context);
    }

    onActiveNonLockableLeafChange(leaf: WorkspaceLeaf): void {
        this.activeLeafContext = null;
        this.removeButton();
    }

    private upsertButton(context: LeafContext): void {
        let buttonEl = this.buttonEl;
        if (buttonEl === null) {
            buttonEl = this.buttonEl = this.plugin.addStatusBarItem();
            buttonEl.addClass("mod-clickable");
            buttonEl.setAttr("data-tooltip-position", "top");
            buttonEl.onClickEvent((event: MouseEvent) => {
                this.showMenu(event);
            });
        }

        buttonEl.setAttr("aria-label", context.isLocked ? t("status-bar.lock-icon.tip") : t("status-bar.unlock-icon.tip"));
        buttonEl.empty();
        const iconEl = document.createElement("span");
        iconEl.addClass("status-bar-item-icon");
        setIcon(iconEl, getLucideIconName(context.isLocked));
        buttonEl.appendChild(iconEl);
    }

    private removeButton(): void {
        const buttonEl = this.buttonEl;
        if (buttonEl === null) return;
        buttonEl.detach();
        this.buttonEl = null;
    }

    private showMenu(event: MouseEvent): void {
        const menu = new Menu();

        menu.addItem((item: MenuItem) => {
            item.setTitle(t("status-bar.menu-item.lock"));
            item.setIcon(getLucideIconName(true));
            const isChecked = this.activeLeafContext?.isLocked === true;
            item.setChecked(isChecked);
            if (!isChecked) {
                item.onClick(() => {
                    this.activeLeafContext?.toggle();
                });
            }
        });

        menu.addItem((item: MenuItem) => {
            item.setTitle(t("status-bar.menu-item.unlock"));
            item.setIcon(getLucideIconName(false));
            const isChecked = this.activeLeafContext?.isLocked === false;
            item.setChecked(isChecked);
            if (!isChecked) {
                item.onClick(() => {
                    this.activeLeafContext?.toggle();
                });
            }
        });
        menu.showAtMouseEvent(event);
    }
}