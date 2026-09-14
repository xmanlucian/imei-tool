# IMEI Tool (随机 IMEI 生成与校验工具)

基于 Go 语言编写的轻量级、跨平台随机 IMEI 生成及校验工具，无需任何外部运行库依赖。**支持图形界面 (GUI) 和命令行 (CLI) 双模式**！

## 功能特性

- **双模支持 (GUI & CLI)**：
  - **图形界面 (GUI)**：双击程序或带 `-gui` 启动，自动唤起现代化精美本地控制台页面，包含一键生成、品牌选择、自定义 TAC、批量复制、IMEI 实时合法性校验等功能。
  - **命令行 (CLI)**：支持所有参数管道调用，方便脚本集成与自动化测试。
- **结构完整合规**：生成的 15 位 IMEI 严格遵循 `8位 TAC` + `6位 SNR` + `1位校验码` 规则。
- **严格 Luhn 算法校验**：生成的所有 IMEI 均通过标准的模 10（Luhn）算法校验。
- **预设主流品牌 TAC**：内置 Apple、Samsung、Huawei、Xiaomi、Google 等主流厂商设备分配码。
- **自定义 TAC 支持**：支持指定任意 8 位 TAC 批量生成。
- **全平台自动化编译**：借助 GitHub Actions，自动构建 Windows (`amd64`/`arm64`)、macOS (`Apple Silicon M系列`/`Intel x86`) 和 Linux 可执行文件。

---

## 运行方式

### 1. 图形界面 (GUI) 模式

- **Windows 用户**：直接双击 `imei-tool-windows-amd64.exe` 即可自动在本地浏览器中弹出图形操作窗口。
- **macOS / Linux 用户**：终端执行 `./imei-tool` 或 `./imei-tool -gui` 即可启动。

### 2. 命令行 (CLI) 模式

```bash
# 1. 快速随机生成 1 个 IMEI
./imei-tool -n 1

# 2. 批量随机生成 10 个 IMEI
./imei-tool -n 10

# 3. 格式化输出 (带连字符: AA-BBBBBB-CCCCCC-D)
./imei-tool -n 5 -f

# 4. 指定品牌生成 (可选: apple, samsung, huawei, xiaomi, google)
./imei-tool -brand apple -n 3
./imei-tool -brand xiaomi -n 5

# 5. 指定自定义 8 位 TAC
./imei-tool -tac 35414849 -n 3

# 6. 校验指定 15 位 IMEI 合法性
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

---

## GitHub Actions 自动构建与发布

本项目已配置完整的 GitHub Actions 工作流：
1. 每次推送到 `main` 分支均会自动执行编译测试，并在 Actions Artifacts 中生成全平台可执行程序。
2. 每次发布 Git Tag（例如 `v1.0.0`），GitHub Actions 会自动打包并在 Releases 页面发布各平台的二进制文件：
   - Windows 64位 (`imei-tool-windows-amd64.exe`)
   - Windows ARM64 (`imei-tool-windows-arm64.exe`)
   - macOS Apple Silicon M系列 (`imei-tool-darwin-arm64`)
   - macOS Intel x86 (`imei-tool-darwin-amd64`)
   - Linux 64位 / ARM64
