import { Platform, Plugin } from "obsidian";

import CommandHandler from "@/event/command-handler";
import CssClassHandler from "@/event/css-class-handler";
import EventDispatcher from "@/event/event-dispatcher";
import FileMenuHandler from "@/event/file-menu-handler";
import StatusBarHandler from "@/event/status-bar-handler";
import TitleBarHandler from "@/event/title-bar-handler";
import ComponentsLockSettingTab from "@/setting/setting-tab";
import { LockStatus, ShowPlatform } from "@/type/enums";
import EventHandler from "@/type/event-handler";

export const PLUGIN_NAME = "Components Lock";

const LOCAL_STORAGE_KEY = "components-lock-settings";

export default class ComponentsLockPlugin extends Plugin {

    settings: ComponentsLockPluginSettings;

    private dispatcher: EventDispatcher;

    private eventHandlers = new Set<EventHandler>;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new ComponentsLockSettingTab(this.app, this));

        this.app.workspace.onLayoutReady(() => {
            this.initEventDispatcherAndHandler();
        });
    }

    onunload() {
        this.eventHandlers.forEach(handler => {
            this.dispatcher.unregister(handler);
            handler.unload();
        });
        this.eventHandlers.clear();
        this.dispatcher.unload();
    }

    async loadSettings() {
        const settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        if (settings.saveFollowDevice) {
            let independentSettings;
            try {
                independentSettings = JSON.parse(this.app.loadLocalStorage(LOCAL_STORAGE_KEY));
            } catch (e) { }
            if (independentSettings) {
                Object.assign(settings, independentSettings)
            }
        }
        this.settings = settings;
    }

    async saveSettings() {
        if (this.settings.saveFollowDevice) {
            const { defaultLockStatus, ...normalSettings } = this.settings;
            const independentSettings = { defaultLockStatus };
            await this.saveData(normalSettings);
            this.app.saveLocalStorage(LOCAL_STORAGE_KEY, JSON.stringify(independentSettings));
        } else {
            await this.saveData(this.settings);
            this.app.saveLocalStorage(LOCAL_STORAGE_KEY, null);
        }
    }

    /**
     * 初始化事件分发器和事件处理器。
     */
    private initEventDispatcherAndHandler(): void {
        // 事件分发器
        this.dispatcher = new EventDispatcher(this);

        // CSS 处理器
        this.eventHandlers.add(new CssClassHandler(this));

        // 命令处理器
        this.eventHandlers.add(new CommandHandler(this));

        // 标题栏处理器
        if (this.showTitleBarButton) {
            this.eventHandlers.add(new TitleBarHandler(this));
        }

        // 状态栏处理器
        if (Platform.isDesktop && this.showStatusBarButton) {
            this.eventHandlers.add(new StatusBarHandler(this));
        }

        // 编辑菜单处理器
        if (this.showFileMenuOption) {
            this.eventHandlers.add(new FileMenuHandler(this));
        }

        // 统一注册
        this.eventHandlers.forEach(handler => {
            this.dispatcher.register(handler);
        });
    }

    // 默认是否锁定
    get lockDefault(): boolean {
        return this.settings.defaultLockStatus === LockStatus.LOCK;
    }

    // 是否显示标题栏按钮
    get showTitleBarButton(): boolean {
        return this.showInCurrentPlatform(this.settings.showTitleBarButton);
    }

    // 是否显示状态栏按钮
    get showStatusBarButton(): boolean {
        return this.settings.showStatusBarButton;
    }

    // 是否显示文件菜单控制选项
    get showFileMenuOption(): boolean {
        return this.showInCurrentPlatform(this.settings.showFileMenuOption);
    }

    /**
     * 启动或关闭指定类型的事件处理器
     */
    toggleEventHandler<T extends EventHandler>(type: new (...args: any[]) => T, enabled: boolean): void {
        if (enabled && this.getHandlerByType(type) === null) {
            const handler = new type(this);
            this.eventHandlers.add(handler);
            this.dispatcher.register(handler);
        } else if (!enabled) {
            const handler = this.getHandlerByType(type);
            if (handler) {
                this.dispatcher.unregister(handler);
                this.eventHandlers.delete(handler);
                handler.unload();
            }
        }
    }

    private getHandlerByType<T extends EventHandler>(type: new (...args: any[]) => T): T | null {
        for (const handler of this.eventHandlers) {
            if (handler instanceof type) {
                return handler;
            }
        }
        return null;
    }

    private showInCurrentPlatform(platform: ShowPlatform): boolean {
        if (platform === ShowPlatform.ALL) {
            return true;
        } else if (platform === ShowPlatform.DESKTOP && Platform.isDesktop) {
            return true;
        } else if (platform === ShowPlatform.MOBILE && Platform.isMobile) {
            return true;
        }
        return false;
    }
}

interface ComponentsLockPluginSettings extends NormalSettings, IndependentSettings { }

/**
 * 常规设置，保存到 data.json 中
 */
interface NormalSettings {
    saveFollowDevice: boolean;
    showTitleBarButton: ShowPlatform;
    showStatusBarButton: boolean;
    showFileMenuOption: ShowPlatform;
}

/**
 * 独立设置，跟随设备保存
 */
interface IndependentSettings {
    defaultLockStatus: LockStatus;
}

const DEFAULT_SETTINGS: ComponentsLockPluginSettings = {
    defaultLockStatus: LockStatus.LOCK,
    saveFollowDevice: false,
    showTitleBarButton: ShowPlatform.ALL,
    showStatusBarButton: true,
    showFileMenuOption: ShowPlatform.NONE
}