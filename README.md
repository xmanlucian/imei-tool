# IMEI Tool (随机 IMEI 生成与校验工具)

基于 Go 语言编写的轻量级、跨平台随机 IMEI 生成及校验命令行工具，无需任何外部依赖。

灵感与规则参考自 miniwebtool 的随机 IMEI 生成器。

## 功能特性

- **结构完整合规**：生成的 15 位 IMEI 严格遵循 8位 TAC + 6位 SNR + 1位校验码 规则。
- **Luhn 算法计算校验码**：生成的每一枚 IMEI 均符合模 10（Luhn）算法校验。
- **品牌 TAC 模拟**：内置苹果 (Apple)、三星 (Samsung)、华为 (Huawei)、小米 (Xiaomi)、谷歌 (Google) 等主流厂商真实 TAC 前缀。
- **自定义 TAC 支持**：支持传入指定的 8 位 TAC 批量生成。
- **批量生成**：支持指定生成数量。
- **校验模式**：支持校验任意 15 位 IMEI 的合法性。
- **跨平台编译**：通过 GitHub Actions 自动编译生成 Windows (amd64/arm64)、macOS (Intel/Apple Silicon) 以及 Linux 可执行文件。

## 使用方法

### 1. 随机生成 IMEI
```bash
# 随机生成 1 个
./imei-tool

# 批量生成 10 个
./imei-tool -n 10

# 格式化输出 (AA-BBBBBB-CCCCCC-D)
./imei-tool -n 5 -f
```

### 2. 指定品牌生成
```bash
# 生成苹果设备 IMEI
./imei-tool -brand apple -n 3

# 可选品牌: apple, samsung, huawei, xiaomi, google
./imei-tool -brand xiaomi -n 5
```

### 3. 指定自定义 8 位 TAC 码
```bash
./imei-tool -tac 35414849 -n 3
```

### 4. 校验 IMEI 是否有效
```bash
./imei-tool -check 354148491014741
```

## 参数说明

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `-n` | int | 1 | 生成数量 |
| `-brand` | string | "" | 品牌筛选 (`apple`, `samsung`, `huawei`, `xiaomi`, `google`) |
| `-tac` | string | "" | 自定义 8 位 TAC |
| `-f` | bool | false | 格式化显示 (例如: `35-414849-101474-1`) |
| `-check`| string | "" | 校验 15 位 IMEI 合法性 |
