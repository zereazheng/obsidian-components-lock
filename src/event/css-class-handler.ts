import { ItemView, WorkspaceLeaf } from "obsidian";

import EventHandler from "@/type/event-handler";
import LeafContext from "@/type/leaf-context";

const BODY_CLASS = "components-lock--is-locked";

const CONTAINER_CLASS = "components-lock--hide-default";

export default class CssClassHandler extends EventHandler {

    private activeLeafContext: LeafContext | null = null;

    private contentElMap = new Map<LeafContext, HTMLElement>;

    load(): void { }

    unload(): void {
        // 清除 body 残留 css class
        this.activeLeafContext = null;
        this.upsertBodyCssClass();

        // 清除容器残留 css class
        this.contentElMap.forEach(contentEl => {
            contentEl.removeClass(CONTAINER_CLASS);
        })
        this.contentElMap.clear();
    }

    afterRegister(activeContext: LeafContext | null, contexts: LeafContext[]): void {
        this.activeLeafContext = activeContext;
        this.upsertBodyCssClass();
        contexts.forEach(context => {
            this.upsertContainerCssClass(context);
        });
    }

    onActiveLockableLeafChange(context: LeafContext): void {
        this.activeLeafContext = context;
        this.upsertBodyCssClass();
        this.upsertContainerCssClass(context);
    }

    onActiveNonLockableLeafChange(leaf: WorkspaceLeaf): void {
        this.activeLeafContext = null;
        this.upsertBodyCssClass();
    }

    onActiveLockableLeafClosed(context: LeafContext): void {
        if (this.contentElMap.has(context)) {
            this.contentElMap.delete(context);
        }
    }

    onLockStatusChange(context: LeafContext): void {
        this.upsertBodyCssClass();
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

    private upsertBodyCssClass(): void {
        if (this.activeLeafContext !== null && this.activeLeafContext.isLocked) {
            document.body.addClass(BODY_CLASS);
        } else {
            document.body.removeClass(BODY_CLASS);
        }
    }
}