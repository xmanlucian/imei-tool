# IMEI Tool (随机 IMEI 生成与校验工具)

基于 Go 语言编写的轻量级、跨平台随机 IMEI 生成及校验工具，无需任何外部运行库依赖。**支持图形界面 (GUI) 和命令行 (CLI) 双模式**！

## 功能特性

- **双模支持 (GUI & CLI)**：
  - **图形界面 (GUI)**：双击程序自动唤起现代化精美本地控制台页面，包含一键生成、品牌选择、自定义 TAC、批量复制、IMEI 实时合法性校验等功能。
  - **命令行 (CLI)**：支持所有参数管道调用，方便脚本集成与自动化测试。
- **结构完整合规**：生成的 15 位 IMEI 严格遵循 `8位 TAC` + `6位 SNR` + `1位校验码` 规则。
- **严格 Luhn 算法校验**：生成的所有 IMEI 均通过标准的模 10（Luhn）算法校验。
- **预设主流品牌 TAC**：内置 Apple、Samsung、Huawei、Xiaomi、Google 等主流厂商设备分配码。
- **自定义 TAC 支持**：支持指定任意 8 位 TAC 批量生成。
- **全平台支持与打包**：
  - **Windows**：完美适配 `cmd.exe /c start` 默认浏览器调用，双击 `.exe` 直接弹出操作界面。
  - **macOS**：提供专用的原生 `.app` 应用程序包和 `双击打开.command` 启动脚本，解决双击当成文本文件打开的问题。

---

## 下载与运行

前往 [Releases 页面](https://github.com/xmanlucian/imei-tool/releases) 下载对应系统的压缩包或二进制：

### 1. Windows 用户
- 下载 `imei-tool-windows-amd64.exe`。
- **运行 GUI**：直接双击 `.exe`，系统会自动打开默认浏览器进入操作界面。
- **运行 CLI**：在终端/PowerShell 中输入 `.\imei-tool-windows-amd64.exe -n 10`。

### 2. macOS 用户
- 下载 `imei-tool-darwin-arm64-app.zip` (M系列芯片) 或 `imei-tool-darwin-amd64-app.zip` (Intel芯片)。
- 解压后包含：
  - `IMEI-Tool.app`：苹果原生应用程序，双击直接运行。
  - `双击打开-IMEI-Tool.command`：免终端一键双击脚本。
- **首次运行提示未签名**：
  - 在 `IMEI-Tool.app` 上**右键 -> 打开**，并在弹出的安全提示中点击“**打开**”即可；
  - 或者在终端运行：`xattr -cr /path/to/IMEI-Tool.app`

---

## CLI 命令使用示例

```bash
# 1. 打开图形界面 (GUI)
./imei-tool

# 2. 批量随机生成 10 个 IMEI
./imei-tool -n 10

# 3. 指定品牌生成并格式化显示 (AA-BBBBBB-CCCCCC-D)
./imei-tool -brand apple -n 3 -f

# 4. 指定自定义 8 位 TAC 批量生成
./imei-tool -tac 35414849 -n 5

# 5. 校验任意 15 位 IMEI 是否合法
./imei-tool -check 354148491014741
```

---

## CLI 参数列表

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `-gui` | bool | false | 强制启动图形化 Webview 界面 (未传任何参数时默认进入 GUI) |
| `-n` | int | 1 | 生成 IMEI 数量 |
| `-brand` | string | "" | 品牌筛选 (`apple`, `samsung`, `huawei`, `xiaomi`, `google`) |
| `-tac` | string | "" | 自定义 8 位 TAC 码 |
| `-f` | bool | false | 格式化显示 (如: `35-414849-101474-1`) |
| `-check`| string | "" | 校验 15 位 IMEI 合法性 |
