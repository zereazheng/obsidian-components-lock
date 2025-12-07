import { App, PluginSettingTab, Setting } from "obsidian";

import ComponentsLockPlugin from "@/main";
import FileMenuHandler from "@/event/file-menu-handler";
import StatusBarHandler from "@/event/status-bar-handler";
import TitleBarHandler from "@/event/title-bar-handler";
import { t } from "@/i18n";
import { LockStatus, ShowPlatform } from "@/type/enums";

export default class ComponentsLockSettingTab extends PluginSettingTab {

    plugin: ComponentsLockPlugin;

    constructor(app: App, plugin: ComponentsLockPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        const settings = this.plugin.settings;

        containerEl.empty();

        new Setting(containerEl)
            .setName(t("setting.default-lock-status.name"))
            .setDesc(t("setting.default-lock-status.desc"))
            .addDropdown(dropdown => {
                dropdown.addOption(LockStatus.LOCK, t("setting.default-lock-status.option.lock"));
                dropdown.addOption(LockStatus.UNLOCK, t("setting.default-lock-status.option.unlock"));
                dropdown.setValue(settings.defaultLockStatus);
                dropdown.onChange(async (value) => {
                    settings.defaultLockStatus = value as LockStatus;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName(t("setting.save-follow-device.name"))
            .setDesc(t("setting.save-follow-device.desc"))
            .addToggle(toggle => {
                toggle.setValue(settings.saveFollowDevice);
                toggle.onChange(async (value) => {
                    settings.saveFollowDevice = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName(t("setting.show-title-bar-button.name"))
            .addDropdown(dropdown => {
                dropdown.addOption(ShowPlatform.ALL, t("enum.show-platform.all"));
                dropdown.addOption(ShowPlatform.DESKTOP, t("enum.show-platform.desktop"));
                dropdown.addOption(ShowPlatform.MOBILE, t("enum.show-platform.mobile"));
                dropdown.addOption(ShowPlatform.NONE, t("enum.show-platform.none"));
                dropdown.setValue(settings.showTitleBarButton);
                dropdown.onChange(async (value) => {
                    settings.showTitleBarButton = value as ShowPlatform;
                    await this.plugin.saveSettings();
                    this.plugin.toggleEventHandler(TitleBarHandler, this.plugin.showTitleBarButton);
                });
            });

        new Setting(containerEl)
            .setName(t("setting.show-status-bar-button.name"))
            .setDesc(t("setting.show-status-bar-button.desc"))
            .addToggle(toggle => {
                toggle.setValue(settings.showStatusBarButton);
                toggle.onChange(async (value) => {
                    settings.showStatusBarButton = value;
                    await this.plugin.saveSettings();
                    this.plugin.toggleEventHandler(StatusBarHandler, this.plugin.showStatusBarButton);
                });
            });

        new Setting(containerEl)
            .setName(t("setting.register-in-more-options.name"))
            .setDesc(t("setting.register-in-more-options.desc"))
            .addDropdown(dropdown => {
                dropdown.addOption(ShowPlatform.ALL, t("enum.show-platform.all"));
                dropdown.addOption(ShowPlatform.DESKTOP, t("enum.show-platform.desktop"));
                dropdown.addOption(ShowPlatform.MOBILE, t("enum.show-platform.mobile"));
                dropdown.addOption(ShowPlatform.NONE, t("enum.show-platform.none"));
                dropdown.setValue(settings.showFileMenuOption);
                dropdown.onChange(async (value) => {
                    settings.showFileMenuOption = value as ShowPlatform;
                    await this.plugin.saveSettings();
                    this.plugin.toggleEventHandler(FileMenuHandler, this.plugin.showFileMenuOption);
                });
            });

        new Setting(containerEl)
            .setName(t("setting.hide-official-lock-button.name"))
            .setDesc(t("setting.hide-official-lock-button.desc"))
            .addToggle(toggle => {
                toggle.setValue(settings.hideOfficialLockButton);
                toggle.onChange(async (value) => {
                    settings.hideOfficialLockButton = value;
                    await this.plugin.saveSettings();
                    this.plugin.hideOrShowOfficialLockButton();
                });
            });
    }
}