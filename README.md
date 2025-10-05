# NapCat-QQ
一个为Xiaomi Vela设备打造的OICQ客户端.

Works with [NapCat](https://napneko.github.io/)

交流: [QQ群](https://qm.qq.com/q/tpOnEHXyRa)

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

## config配置

### napcat_httpserver_url

napcat http服务器地址, 字符串

### napcat_httpserver_token

napcat http服务器token, 字符串

### noimgMode

是否启用无图模式, 布尔值

开启后图片默认只显示蓝色的[查看图片]标识, 点击标识可打开图片查看器查看图片, 减少浏览消息时的性能开销
