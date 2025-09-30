import { ItemView, WorkspaceLeaf } from "obsidian";

import ComponentsLockPlugin from "@/main";
import { t } from "@/i18n";
import EventHandler from "@/type/event-handler";
import { Loadable } from "@/type/interfaces";
import LeafContext from "@/type/leaf-context";
import { isLockableWorkspaceLeaf } from "@/util";
import { warn } from "@/util/logger";

/**
 * 事件分发器，用于向 {@link EventHandler} 分发事件通知，以统一
 * 处理 UI 更新、点击响应等操作。
 */
export default class EventDispatcher implements Loadable {

    private readonly plugin: ComponentsLockPlugin;

    private readonly handlers = new Set<EventHandler>;

    private readonly leafContextMap = new Map<WorkspaceLeaf, LeafContext>;

    constructor(plugin: ComponentsLockPlugin) {
        this.plugin = plugin;
        this.load();
    }

    load(): void {
        this.initLeafContextMap();

        // 监听 WorkspaceLeaf 变更事件，主要用于通知 EventHandler 进行 UI 更新
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("active-leaf-change", (leaf: WorkspaceLeaf) => {
                let context = this.leafContextMap.get(leaf);
                if (isLockableWorkspaceLeaf(leaf)) {
                    if (!context) {
                        context = this.defaultLeafContext(leaf);
                    }
                    this.leafContextMap.set(leaf, context);
                    this.triggerActiveLockableLeafChange(context);
                } else {
                    if (context) {
                        this.leafContextMap.delete(leaf);
                    }
                    this.triggerActiveNonLockableLeafChange(leaf);
                }
            })
        );

        // 清除已关闭 WorkspaceLeaf 的上下文缓存，Obsidian 似乎没有提供
        // 直接的 WorkspaceLeaf 关闭事件监听器，只能采用这种迂回的手段
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("layout-change", () => {
                const leafContextToDelete: LeafContext[] = [];
                this.leafContextMap.forEach((context) => {
                    const id = (context.leaf as any).id as string | undefined;
                    if (!id) {
                        warn(t("log.workspace-leaf-id-cannot-access"));
                        return;
                    }
                    if (!this.plugin.app.workspace.getLeafById(id)) {
                        leafContextToDelete.push(context);
                    }
                });
                leafContextToDelete.forEach((context) => {
                    this.triggerActiveLockableLeafClosed(context);
                    this.leafContextMap.delete(context.leaf);
                });
            })
        );
    }

    unload(): void {
        this.handlers.clear();
        this.leafContextMap.clear();
    }

    /** 注册事件处理器，触发特定事件时会调用处理器相应的回调方法 */
    register(handler: EventHandler): void {
        this.handlers.add(handler);
        handler.afterRegister(this.getActiveLeafContext(), Array.from(this.leafContextMap.values()));
    }

    /** 注销事件处理器 */
    unregister(handler: EventHandler): boolean {
        return this.handlers.delete(handler);
    }

    /** 创建一个默认的 {@link LeafContext} 对象。 */
    private defaultLeafContext(leaf: WorkspaceLeaf): LeafContext {
        return new LeafContext(leaf, this.plugin.lockDefault, (context) => {
            this.triggerLockStatusChange(context);
        });
    }

    private triggerLockStatusChange(context: LeafContext): void {
        this.handlers.forEach(handler => handler.onLockStatusChange(context));
    }

    private triggerActiveLockableLeafChange(context: LeafContext): void {
        this.handlers.forEach(handler => handler.onActiveLockableLeafChange(context));
    }

    private triggerActiveNonLockableLeafChange(leaf: WorkspaceLeaf): void {
        this.handlers.forEach(handler => handler.onActiveNonLockableLeafChange(leaf));
    }

    private triggerActiveLockableLeafClosed(context: LeafContext): void {
        this.handlers.forEach(handler => handler.onActiveLockableLeafClosed(context));
    }

    private initLeafContextMap(): void {
        this.plugin.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
            if (isLockableWorkspaceLeaf(leaf)) {
                this.leafContextMap.set(leaf, this.defaultLeafContext(leaf));
            }
        });
    }

    private getActiveLeafContext(): LeafContext | null {
        const activeView = this.plugin.app.workspace.getActiveViewOfType(ItemView);
        if (activeView === null) {
            return null;
        }
        return this.leafContextMap.get(activeView.leaf) || null;
    }
}