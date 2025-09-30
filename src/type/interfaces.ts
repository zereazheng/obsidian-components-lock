export interface Loadable {

    /** 加载时调用，处理初始化工作 */
    load(): void;

    /** 卸载时调用，处理资源清除工作 */
    unload(): void;
}