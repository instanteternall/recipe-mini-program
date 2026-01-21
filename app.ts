// app.ts (如果使用TypeScript)
export interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    systemInfo?: WechatMiniprogram.SystemInfo,
    currentMenu?: any,
    searchHistory?: string[],
    favorites?: any[],
  }
  getUserInfo(): Promise<WechatMiniprogram.UserInfo>,
}