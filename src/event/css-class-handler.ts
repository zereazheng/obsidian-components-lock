import { ItemView, WorkspaceLeaf } from "obsidian";

import EventHandler from "@/type/event-handler";
import LeafContext from "@/type/leaf-context";

const CONTAINER_CLASS = "components-lock--hide-default";

export default class CssClassHandler extends EventHandler {

    private contentElMap = new Map<LeafContext, HTMLElement>;

    load(): void { }

    unload(): void {
        // 清除容器残留 css class
        this.contentElMap.forEach(contentEl => {
            contentEl.removeClass(CONTAINER_CLASS);
        })
        this.contentElMap.clear();
    }

    afterRegister(activeContext: LeafContext | null, contexts: LeafContext[]): void {
        contexts.forEach(context => {
            this.upsertContainerCssClass(context);
        });
    }

    onActiveLockableLeafChange(context: LeafContext): void {
        this.upsertContainerCssClass(context);
    }

    onActiveLockableLeafClosed(context: LeafContext): void {
        if (this.contentElMap.has(context)) {
            this.contentElMap.delete(context);
        }
    }

    onLockStatusChange(context: LeafContext): void {
        this.upsertContainerCssClass(context);
    }

    private upsertContainerCssClass(context: LeafContext): void {
        const view = context.leaf.view;
        if (!(view instanceof ItemView)) return;

        const contentEl = (view as ItemView).contentEl;
        if (context.isLocked) {
            contentEl.addClass(CONTAINER_CLASS);
        } else {
            contentEl.removeClass(CONTAINER_CLASS);
        }

        if (!this.contentElMap.has(context)) {
            this.contentElMap.set(context, contentEl);
        }
    }
}