# Merqury for Vela
一个为Xiaomi Vela设备打造的IM客户端.

<a href="https://astrobox.online/open?source=res&res=MerquryIM Dev&provider=official" target="_blank" rel="noopener noreferrer">
  <img src="https://astrobox.online/goab/en/white.svg">
</a>

Works with [NapCatQQ](https://napneko.github.io/)

交流: [QQ群](https://qm.qq.com/q/tpOnEHXyRa)

[TG频道](https://t.me/merquryim)

设计稿: [前往MasterGO](https://mastergo.com/goto/NsMqNrKF?page_id=M&file=173877994617234)

<a href="https://www.bandbbs.cn/threads/22389/" target="_blank" rel="noopener noreferrer">
  <img src="badge.png">
</a>

## Features

 - 私聊/群聊文字消息收发
 - 表端服务器配置修改
 - 图片消息收发(支持无图模式, 默认外显文字提升聊天时滑动流畅度与运行压力)

## TODO

 - 图片管理(下载/图库)
 - 个人主页
 - 群聊/私聊(好友)设置
 - 消息列表自动刷新
 - 会话内容自动刷新

## 性能要求

*仅供参考

### 最低配置

REDMI Watch 6

### 推荐配置

Xiaomi Watch S4/eSIM/15th(最佳)
REDMI Watch 5 eSIM(最佳)

当前最佳配置为搭载XRING T1处理器的设备, 但在这些设备上仍会有在使用过程中重启的情况, 请悉知. 

## 快速上手

### 1. 开发

```
npm install
npm run start
```

### 2. 构建

```
npm run build
npm run release
```

### 3. 调试

```
npm run watch
```

### 4. 代码规范化配置

代码规范化可以帮助开发者在git commit前进行代码校验、格式化、commit信息校验

使用前提：必须先关联git

macOS or Linux

```
sh husky.sh
```

windows

```
./husky.sh
```

## 了解更多

你可以通过我们的[官方文档](https://iot.mi.com/vela/quickapp)熟悉和了解快应用。

## config配置(已弃用)

### napcat_httpserver_url

napcat http服务器地址, 字符串

### napcat_httpserver_token

napcat http服务器token, 字符串

### noimgMode

是否启用无图模式, 布尔值

开启后图片默认只显示蓝色的[查看图片]标识, 点击标识可打开图片查看器查看图片, 减少浏览消息时的性能开销
