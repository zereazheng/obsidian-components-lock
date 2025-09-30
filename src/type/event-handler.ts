import { WorkspaceLeaf } from "obsidian"

import ComponentsLockPlugin from "@/main";
import { Loadable } from "@/type/interfaces"
import LeafContext from "@/type/leaf-context";

export default abstract class EventHandler implements Loadable {

    protected readonly plugin: ComponentsLockPlugin;

    constructor(plugin: ComponentsLockPlugin) {
        this.plugin = plugin;
        this.load();
    }

    abstract load(): void;

    abstract unload(): void;

    /**
     * 事件注册完成回调，用于处理一些初始化工作。
     * @param activeContext 当前活跃的 {@link LeafContext}，如果没有（已激活的 WorkspaceLeaf 不可锁定）则为 null。
     * @param contexts 所有有效 {@link LeafContext}。
     */
    abstract afterRegister(activeContext: LeafContext | null, contexts: LeafContext[]): void;

    /**
     * 处理锁定状态变更事件。
     */
    onLockStatusChange(context: LeafContext): void { }

    /**
     * 处理可锁定的 {@link WorkspaceLeaf} 变更事件。
     */
    onActiveLockableLeafChange(context: LeafContext): void { }

    /**
     * 处理不可锁定的 {@link WorkspaceLeaf} 变更事件。
     */
    onActiveNonLockableLeafChange(leaf: WorkspaceLeaf): void { }

    /**
     * 处理可锁定的 {@link WorkspaceLeaf} 关闭后的事件。
     */
    onActiveLockableLeafClosed(context: LeafContext): void { }
}