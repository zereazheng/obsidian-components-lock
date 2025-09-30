import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";

import { t } from "@/i18n"
import EventHandler from "@/type/event-handler";
import LeafContext from "@/type/leaf-context";
import { getLucideIconName } from "@/util";

export default class TitleBarHandler extends EventHandler {

    private buttonMap = new Map<WorkspaceLeaf, HTMLElement>;

    load(): void { }

    unload(): void {
        // 移除所有按钮
        this.buttonMap.forEach((buttonEl) => {
            buttonEl.detach();
        });
        // 清空缓存
        this.buttonMap.clear();
    }

    afterRegister(activeContext: LeafContext | null, contexts: LeafContext[]): void {
        // 为所有可锁定的 WorkspaceLeaf 添加按钮
        contexts.forEach(context => {
            this.addActionButton(context);
        });
    }

    onLockStatusChange(context: LeafContext): void {
        this.updateActionButton(context);
    }

    onActiveLockableLeafChange(context: LeafContext): void {
        this.addActionButton(context);
    }

    onActiveNonLockableLeafChange(leaf: WorkspaceLeaf): void {
        // 清理无效缓存
        if (this.buttonMap.has(leaf)) {
            this.buttonMap.get(leaf)?.detach();
            this.buttonMap.delete(leaf);
        }
    }

    onActiveLockableLeafClosed(context: LeafContext): void {
        // 清理无效缓存
        if (this.buttonMap.has(context.leaf)) {
            this.buttonMap.get(context.leaf)?.detach();
            this.buttonMap.delete(context.leaf);
        }
    }

    /**
     * 为标题栏添加按钮。
     */
    private addActionButton(context: LeafContext): void {
        // WorkspaceLeaf 切换文件的时候，非 MD 文件按钮会被移除，因此需要判断
        // 缓存按钮是否存在，当时使用的方案是 isShown()，或许存在更好的方法？
        if (this.buttonMap.has(context.leaf) && this.buttonMap.get(context.leaf)?.isShown()) return;

        const view = context.leaf.view;
        if (!(view instanceof ItemView)) return;

        const tip = context.isLocked ? t("title-bar.lock-icon.tip") : t("title-bar.unlock-icon.tip");
        const buttonEl = (view as ItemView).addAction(getLucideIconName(context.isLocked), tip, () => {
            context.toggle();
        });
        this.buttonMap.set(context.leaf, buttonEl);
    }

    /**
     * 更新标题栏按钮，主要是替换图标和文字提示。
     */
    private updateActionButton(context: LeafContext): void {
        const buttonEl = this.buttonMap.get(context.leaf);
        if (!buttonEl) return;

        buttonEl.empty();
        const tip = context.isLocked ? t("title-bar.lock-icon.tip") : t("title-bar.unlock-icon.tip");
        buttonEl.setAttr("aria-label", tip);
        setIcon(buttonEl, getLucideIconName(context.isLocked));
    }
}