import { WorkspaceLeaf } from "obsidian";

import EventDispatcher from "@/event/event-dispatcher"
import { isLockableWorkspaceLeaf } from "@/util";

/** 
 * 可锁定的 {@link WorkspaceLeaf} 上下文对象，用于记录该 Leaf 的组件锁定状态，以及控制锁定
 * 状态切换，支持锁定状态变更时触发回调函数，目前用来配合 {@link EventDispatcher} 实现锁定
 * 状态变更时的全局事件通知。
 * @see {@link isLockableWorkspaceLeaf}
 */
export default class LeafContext {

    /** 当前上下文对象绑定的 WorkspaceLeaf */
    readonly leaf: WorkspaceLeaf;

    /** 锁定状态 */
    #isLocked: boolean;

    /** 锁定状态变更回调 */
    readonly toggleCallback: (context: LeafContext) => void;

    constructor(leaf: WorkspaceLeaf, isLock: boolean, toggleCallback: (context: LeafContext) => void) {
        this.leaf = leaf;
        this.#isLocked = isLock;
        this.toggleCallback = toggleCallback;
    }

    /** 锁定状态 */
    get isLocked(): boolean {
        return this.#isLocked;
    }

    /**
     * 切换锁定状态。
     */
    toggle(): void {
        this.#isLocked = !this.#isLocked;
        this.toggleCallback(this);
    }

    /**
     * 锁定，仅在解锁状态时生效。
     */
    lock() {
        if (!this.#isLocked) {
            this.toggle();
        }
    }

    /**
     * 解锁，仅在锁定状态时生效。
     */
    unlock() {
        if (this.#isLocked) {
            this.toggle();
        }
    }
}