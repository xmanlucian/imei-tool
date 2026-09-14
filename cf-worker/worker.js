// Cloudflare Worker - IMEI Generator & Validator

const BrandTACs = {
  apple: [
    "35304610", // iPhone 11
    "35674311", // iPhone 12
    "35212562", // iPhone 13 Pro
    "35054365", // iPhone 14 Pro
    "35414849", // iPhone 15 Pro
    "35920668", // iPhone 16 Pro
  ],
  samsung: [
    "35824005", // Galaxy S9
    "35492410", // Galaxy S20
    "35084221", // Galaxy S21
    "35174780", // Galaxy S22 Ultra
    "35287661", // Galaxy S23
    "35123488", // Galaxy S24
  ],
  huawei: [
    "86734503", // Mate 20
    "86265004", // P30 Pro
    "86641204", // Mate 30 Pro
    "86175905", // P40 Pro
    "86498106", // Mate 60 Pro
  ],
  xiaomi: [
    "86820403", // Mi 9
    "86423404", // Mi 10
    "86361205", // Mi 11
    "86548106", // Xiaomi 13
    "86912307", // Xiaomi 14
  ],
  google: [
    "35824209", // Pixel 4
    "35275311", // Pixel 5
    "35472851", // Pixel 6
    "35091763", // Pixel 7 Pro
    "35811774", // Pixel 8 Pro
  ],
};

function calculateLuhnCheckDigit(imei14) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(imei14[i], 10);
    if (i % 2 === 1) {
      let doubled = digit * 2;
      sum += doubled >= 10 ? doubled - 9 : doubled;
    } else {
      sum += digit;
    }
  }
  return (10 - (sum % 10)) % 10;
}

function getRandomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function getRandomDigits(len) {
  let res = "";
  for (let i = 0; i < len; i++) {
    res += getRandomInt(10).toString();
  }
  return res;
}

function generateIMEI(brand, customTAC) {
  let tac = "";
  if (customTAC) {
    if (!/^\d{8}$/.test(customTAC)) {
      throw new Error("自定义 TAC 必须是 8 位数字");
    }
    tac = customTAC;
  } else if (brand && BrandTACs[brand.toLowerCase()]) {
    const list = BrandTACs[brand.toLowerCase()];
    tac = list[getRandomInt(list.length)];
  } else {
    const prefixes = ["35", "86", "01", "49", "50", "52"];
    tac = prefixes[getRandomInt(prefixes.length)] + getRandomDigits(6);
  }

  const snr = getRandomDigits(6);
  const imei14 = tac + snr;
  const cd = calculateLuhnCheckDigit(imei14);
  return imei14 + cd.toString();
}

function validateIMEI(imei) {
  const clean = imei.replace(/[\s-]/g, "");
  if (!/^\d{15}$/.test(clean)) return false;
  return parseInt(clean[14], 10) === calculateLuhnCheckDigit(clean.slice(0, 14));
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>随机 IMEI 在线生成与校验器</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📱</text></svg>">
<style>
  :root {
    --bg-gradient: linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%);
    --card-bg: rgba(23, 32, 51, 0.75);
    --primary: #38bdf8;
    --primary-hover: #0ea5e9;
    --accent: #818cf8;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --border: rgba(255, 255, 255, 0.08);
    --input-bg: rgba(15, 23, 42, 0.7);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  body {
    background: var(--bg-gradient);
    color: var(--text);
    min-height: 100vh;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
  }
  .container {
    width: 100%;
    max-width: 820px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .card {
    background: var(--card-bg);
    backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 8px;
    background: linear-gradient(90deg, #38bdf8, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p.desc {
    color: var(--text-muted);
    font-size: 0.95rem;
    margin-bottom: 24px;
    line-height: 1.5;
  }
  .tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 12px;
  }
  .tab-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .tab-btn.active {
    background: rgba(56, 189, 248, 0.15);
    color: var(--primary);
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
    margin-bottom: 20px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  label {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 500;
  }
  input, select {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    padding: 12px 14px;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s;
  }
  input:focus, select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
  }
  .btn-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 10px;
  }
  .btn {
    background: linear-gradient(90deg, #38bdf8, #0ea5e9);
    color: #041226;
    border: none;
    border-radius: 10px;
    padding: 12px 26px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
  .btn-secondary {
    background: rgba(255,255,255,0.06);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-secondary:hover {
    background: rgba(255,255,255,0.12);
  }
  .results-box {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .result-textarea {
    width: 100%;
    height: 240px;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: #38bdf8;
    padding: 16px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 1rem;
    line-height: 1.6;
    resize: vertical;
    outline: none;
  }
  .status-badge {
    padding: 14px 18px;
    border-radius: 10px;
    font-size: 0.95rem;
    margin-top: 16px;
    display: none;
    line-height: 1.5;
  }
  .status-badge.success {
    display: block;
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.25);
  }
  .status-badge.error {
    display: block;
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }
  .footer {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-top: 10px;
  }
  .footer a {
    color: var(--primary);
    text-decoration: none;
  }
</style>
</head>
<body>

<div class="container">
  <div class="card">
    <h1>📱 随机 IMEI 生成器 & 校验器</h1>
    <p class="desc">基于 Cloudflare Workers 边缘计算运行。完全符合 GSMA 标准（8位 TAC + 6位流水号 + 模10 Luhn 校验位），支持主流品牌、自定义 TAC 与批量生成。</p>

    <div class="tabs">
      <button class="tab-btn active" id="tab-gen-btn" onclick="switchTab('gen')">🎲 随机生成</button>
      <button class="tab-btn" id="tab-val-btn" onclick="switchTab('val')">🔍 校验 IMEI</button>
    </div>

    <!-- 生成面板 -->
    <div id="panel-gen">
      <div class="form-grid">
        <div class="form-group">
          <label>设备品牌 (真实 TAC)</label>
          <select id="brand-select">
            <option value="">随机任意品牌</option>
            <option value="apple">Apple (苹果)</option>
            <option value="samsung">Samsung (三星)</option>
            <option value="huawei">Huawei (华为)</option>
            <option value="xiaomi">Xiaomi (小米)</option>
            <option value="google">Google (谷歌)</option>
          </select>
        </div>
        <div class="form-group">
          <label>自定义 TAC (8位，留空按品牌)</label>
          <input type="text" id="custom-tac" placeholder="例如: 35414849" maxlength="8">
        </div>
        <div class="form-group">
          <label>生成数量 (1 ~ 500)</label>
          <input type="number" id="count-input" value="10" min="1" max="500">
        </div>
        <div class="form-group" style="justify-content: flex-end;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; height:46px;">
            <input type="checkbox" id="format-check" style="width:18px; height:18px; cursor:pointer;">
            格式化输出 (带横线)
          </label>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn" onclick="generateIMEIs()">⚡ 开始生成</button>
        <button class="btn btn-secondary" onclick="copyResults()">📋 复制全部</button>
        <button class="btn btn-secondary" onclick="clearResults()">🧹 清空</button>
      </div>

      <div class="results-box">
        <label>生成结果列表</label>
        <textarea id="results-area" class="result-textarea" readonly placeholder="点击上方【开始生成】查看结果..."></textarea>
      </div>
    </div>

    <!-- 校验面板 -->
    <div id="panel-val" style="display:none;">
      <div class="form-group" style="margin-bottom: 16px;">
        <label>输入 15 位 IMEI 码</label>
        <input type="text" id="validate-input" placeholder="例如: 354148491014741" maxlength="18">
      </div>
      <div class="btn-row">
        <button class="btn" onclick="checkIMEI()">🔍 立即校验</button>
      </div>
      <div id="validate-badge" class="status-badge"></div>
    </div>
  </div>

  <div class="footer">
    由 Cloudflare Workers 边缘网络强力驱动 · <a href="https://github.com/xmanlucian/imei-tool" target="_blank">GitHub 开源</a>
  </div>
</div>

<script>
function switchTab(t) {
  if (t === 'gen') {
    document.getElementById('panel-gen').style.display = 'block';
    document.getElementById('panel-val').style.display = 'none';
    document.getElementById('tab-gen-btn').classList.add('active');
    document.getElementById('tab-val-btn').classList.remove('active');
  } else {
    document.getElementById('panel-gen').style.display = 'none';
    document.getElementById('panel-val').style.display = 'block';
    document.getElementById('tab-gen-btn').classList.remove('active');
    document.getElementById('tab-val-btn').classList.add('active');
  }
}

async function generateIMEIs() {
  const brand = document.getElementById('brand-select').value;
  const tac = document.getElementById('custom-tac').value.trim();
  const count = document.getElementById('count-input').value;
  const formatted = document.getElementById('format-check').checked;

  const params = new URLSearchParams({
    brand: brand,
    tac: tac,
    n: count,
    f: formatted ? '1' : '0'
  });

  try {
    const res = await fetch('/api/generate?' + params.toString());
    const data = await res.json();
    if (data.error) {
      alert('错误: ' + data.error);
      return;
    }
    document.getElementById('results-area').value = data.imeis.join('\n');
  } catch (err) {
    alert('请求失败: ' + err.message);
  }
}

async function checkIMEI() {
  const imei = document.getElementById('validate-input').value.trim();
  if (!imei) return;

  const res = await fetch('/api/validate?imei=' + encodeURIComponent(imei));
  const data = await res.json();
  const badge = document.getElementById('validate-badge');
  if (data.valid) {
    badge.className = 'status-badge success';
    badge.textContent = '✓ 校验通过！该 IMEI 结构合法且符合标准 Luhn（模 10）校验算法。';
  } else {
    badge.className = 'status-badge error';
    badge.textContent = '✗ 校验失败！该 IMEI 长度不是 15 位纯数字，或 Luhn 校验位计算不匹配。';
  }
}

function copyResults() {
  const area = document.getElementById('results-area');
  if (!area.value) return;
  navigator.clipboard.writeText(area.value);
  alert('已成功复制 ' + area.value.split('\n').filter(Boolean).length + ' 个 IMEI 到剪贴板！');
}

function clearResults() {
  document.getElementById('results-area').value = '';
}
</script>

</body>
</html>
`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // API: 生成
    if (url.pathname === "/api/generate") {
      const brand = url.searchParams.get("brand") || "";
      const tac = url.searchParams.get("tac") || "";
      const formatted = url.searchParams.get("f") === "1";
      let count = parseInt(url.searchParams.get("n") || "1", 10);
      if (isNaN(count) || count <= 0) count = 1;
      if (count > 500) count = 500;

      const imeis = [];
      for (let i = 0; i < count; i++) {
        try {
          const val = generateIMEI(brand, tac);
          if (formatted) {
            imeis.push(`${val.slice(0, 2)}-${val.slice(2, 8)}-${val.slice(8, 14)}-${val.slice(14)}`);
          } else {
            imeis.push(val);
          }
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), {
            headers: { "Content-Type": "application/json; charset=utf-8" },
            status: 400,
          });
        }
      }

      return new Response(JSON.stringify({ imeis }), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // API: 校验
    if (url.pathname === "/api/validate") {
      const imei = url.searchParams.get("imei") || "";
      const valid = validateIMEI(imei);
      return new Response(JSON.stringify({ valid }), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 默认返回 HTML 页面
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
};
