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

const html = "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>随机 IMEI 在线生成器 & 校验器</title>\n<link rel=\"icon\" href=\"data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📱</text></svg>\">\n<style>\n  :root {\n    --bg-gradient: linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%);\n    --card-bg: rgba(23, 32, 51, 0.75);\n    --primary: #38bdf8;\n    --primary-hover: #0ea5e9;\n    --accent: #818cf8;\n    --text: #f8fafc;\n    --text-muted: #94a3b8;\n    --border: rgba(255, 255, 255, 0.08);\n    --input-bg: rgba(15, 23, 42, 0.7);\n  }\n  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; }\n  body {\n    background: var(--bg-gradient);\n    color: var(--text);\n    min-height: 100vh;\n    padding: 40px 20px;\n    display: flex;\n    justify-content: center;\n  }\n  .container {\n    width: 100%;\n    max-width: 820px;\n    display: flex;\n    flex-direction: column;\n    gap: 20px;\n  }\n  .card {\n    background: var(--card-bg);\n    backdrop-filter: blur(16px);\n    border: 1px solid var(--border);\n    border-radius: 20px;\n    padding: 30px;\n    box-shadow: 0 20px 40px rgba(0,0,0,0.4);\n  }\n  h1 {\n    font-size: 1.75rem;\n    font-weight: 700;\n    margin-bottom: 8px;\n    background: linear-gradient(90deg, #38bdf8, #818cf8);\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n  }\n  p.desc {\n    color: var(--text-muted);\n    font-size: 0.95rem;\n    margin-bottom: 24px;\n    line-height: 1.5;\n  }\n  .tabs {\n    display: flex;\n    gap: 12px;\n    margin-bottom: 24px;\n    border-bottom: 1px solid var(--border);\n    padding-bottom: 12px;\n  }\n  .tab-btn {\n    background: none;\n    border: none;\n    color: var(--text-muted);\n    font-size: 1rem;\n    font-weight: 600;\n    padding: 8px 18px;\n    border-radius: 10px;\n    cursor: pointer;\n    transition: all 0.2s ease;\n  }\n  .tab-btn.active {\n    background: rgba(56, 189, 248, 0.15);\n    color: var(--primary);\n  }\n  .form-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n    gap: 18px;\n    margin-bottom: 20px;\n  }\n  .form-group {\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n  }\n  label {\n    font-size: 0.85rem;\n    color: var(--text-muted);\n    font-weight: 500;\n  }\n  input, select {\n    background: var(--input-bg);\n    border: 1px solid var(--border);\n    border-radius: 10px;\n    color: var(--text);\n    padding: 12px 14px;\n    font-size: 0.95rem;\n    outline: none;\n    transition: all 0.2s;\n  }\n  input:focus, select:focus {\n    border-color: var(--primary);\n    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);\n  }\n  .btn-row {\n    display: flex;\n    gap: 12px;\n    flex-wrap: wrap;\n    margin-top: 10px;\n  }\n  .btn {\n    background: linear-gradient(90deg, #38bdf8, #0ea5e9);\n    color: #041226;\n    border: none;\n    border-radius: 10px;\n    padding: 12px 26px;\n    font-size: 0.95rem;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all 0.2s;\n    display: inline-flex;\n    align-items: center;\n    gap: 8px;\n  }\n  .btn:hover {\n    opacity: 0.92;\n    transform: translateY(-1px);\n  }\n  .btn-secondary {\n    background: rgba(255,255,255,0.06);\n    color: var(--text);\n    border: 1px solid var(--border);\n  }\n  .btn-secondary:hover {\n    background: rgba(255,255,255,0.12);\n  }\n  .results-box {\n    margin-top: 24px;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n  }\n  .result-textarea {\n    width: 100%;\n    height: 240px;\n    background: var(--input-bg);\n    border: 1px solid var(--border);\n    border-radius: 12px;\n    color: #38bdf8;\n    padding: 16px;\n    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;\n    font-size: 1rem;\n    line-height: 1.6;\n    resize: vertical;\n    outline: none;\n  }\n  .status-badge {\n    padding: 14px 18px;\n    border-radius: 10px;\n    font-size: 0.95rem;\n    margin-top: 16px;\n    display: none;\n    line-height: 1.5;\n  }\n  .status-badge.success {\n    display: block;\n    background: rgba(34, 197, 94, 0.12);\n    color: #4ade80;\n    border: 1px solid rgba(34, 197, 94, 0.25);\n  }\n  .status-badge.error {\n    display: block;\n    background: rgba(239, 68, 68, 0.12);\n    color: #f87171;\n    border: 1px solid rgba(239, 68, 68, 0.25);\n  }\n  .footer {\n    text-align: center;\n    color: var(--text-muted);\n    font-size: 0.85rem;\n    margin-top: 10px;\n  }\n  .footer a {\n    color: var(--primary);\n    text-decoration: none;\n  }\n</style>\n</head>\n<body>\n\n<div class=\"container\">\n  <div class=\"card\">\n    <h1>📱 随机 IMEI 生成器 & 校验器</h1>\n    <p class=\"desc\">基于 Cloudflare Workers 边缘计算运行。完全符合 GSMA 标准（8位 TAC + 6位流水号 + 模10 Luhn 校验位），支持主流品牌、自定义 TAC 与批量生成。</p>\n\n    <div class=\"tabs\">\n      <button class=\"tab-btn active\" id=\"tab-gen-btn\">🎲 随机生成</button>\n      <button class=\"tab-btn\" id=\"tab-val-btn\">🔍 校验 IMEI</button>\n    </div>\n\n    <!-- 生成面板 -->\n    <div id=\"panel-gen\">\n      <div class=\"form-grid\">\n        <div class=\"form-group\">\n          <label>设备品牌 (真实 TAC)</label>\n          <select id=\"brand-select\">\n            <option value=\"\">随机任意品牌</option>\n            <option value=\"apple\">Apple (苹果)</option>\n            <option value=\"samsung\">Samsung (三星)</option>\n            <option value=\"huawei\">Huawei (华为)</option>\n            <option value=\"xiaomi\">Xiaomi (小米)</option>\n            <option value=\"google\">Google (谷歌)</option>\n          </select>\n        </div>\n        <div class=\"form-group\">\n          <label>自定义 TAC (8位，留空按品牌)</label>\n          <input type=\"text\" id=\"custom-tac\" placeholder=\"例如: 35414849\" maxlength=\"8\">\n        </div>\n        <div class=\"form-group\">\n          <label>生成数量 (1 ~ 500)</label>\n          <input type=\"number\" id=\"count-input\" value=\"10\" min=\"1\" max=\"500\">\n        </div>\n        <div class=\"form-group\" style=\"justify-content: flex-end;\">\n          <label style=\"display:flex; align-items:center; gap:8px; cursor:pointer; height:46px;\">\n            <input type=\"checkbox\" id=\"format-check\" style=\"width:18px; height:18px; cursor:pointer;\">\n            格式化输出 (带横线)\n          </label>\n        </div>\n      </div>\n\n      <div class=\"btn-row\">\n        <button class=\"btn\" id=\"btn-generate\">⚡ 开始生成</button>\n        <button class=\"btn btn-secondary\" id=\"btn-copy\">📋 复制全部</button>\n        <button class=\"btn btn-secondary\" id=\"btn-clear\">🧹 清空</button>\n      </div>\n\n      <div class=\"results-box\">\n        <label>生成结果列表</label>\n        <textarea id=\"results-area\" class=\"result-textarea\" readonly placeholder=\"点击上方【开始生成】查看结果...\"></textarea>\n      </div>\n    </div>\n\n    <!-- 校验面板 -->\n    <div id=\"panel-val\" style=\"display:none;\">\n      <div class=\"form-group\" style=\"margin-bottom: 16px;\">\n        <label>输入 15 位 IMEI 码</label>\n        <input type=\"text\" id=\"validate-input\" placeholder=\"例如: 354148491014741\" maxlength=\"18\">\n      </div>\n      <div class=\"btn-row\">\n        <button class=\"btn\" id=\"btn-validate\">🔍 立即校验</button>\n      </div>\n      <div id=\"validate-badge\" class=\"status-badge\"></div>\n    </div>\n  </div>\n\n</div>\n\n<script>\ndocument.addEventListener('DOMContentLoaded', function() {\n  const tabGenBtn = document.getElementById('tab-gen-btn');\n  const tabValBtn = document.getElementById('tab-val-btn');\n  const panelGen = document.getElementById('panel-gen');\n  const panelVal = document.getElementById('panel-val');\n\n  tabGenBtn.addEventListener('click', function() {\n    panelGen.style.display = 'block';\n    panelVal.style.display = 'none';\n    tabGenBtn.classList.add('active');\n    tabValBtn.classList.remove('active');\n  });\n\n  tabValBtn.addEventListener('click', function() {\n    panelGen.style.display = 'none';\n    panelVal.style.display = 'block';\n    tabGenBtn.classList.remove('active');\n    tabValBtn.classList.add('active');\n  });\n\n  const btnGen = document.getElementById('btn-generate');\n  const btnCopy = document.getElementById('btn-copy');\n  const btnClear = document.getElementById('btn-clear');\n  const btnVal = document.getElementById('btn-validate');\n  const resultsArea = document.getElementById('results-area');\n\n  btnGen.addEventListener('click', async function() {\n    const brand = document.getElementById('brand-select').value;\n    const tac = document.getElementById('custom-tac').value.trim();\n    const count = document.getElementById('count-input').value;\n    const formatted = document.getElementById('format-check').checked;\n\n    btnGen.disabled = true;\n    btnGen.textContent = '⏳ 生成中...';\n\n    const params = new URLSearchParams({\n      brand: brand,\n      tac: tac,\n      n: count,\n      f: formatted ? '1' : '0'\n    });\n\n    try {\n      const res = await fetch('/api/generate?' + params.toString());\n      const data = await res.json();\n      if (data.error) {\n        alert('错误: ' + data.error);\n        return;\n      }\n      resultsArea.value = data.imeis.join(String.fromCharCode(10));\n    } catch (err) {\n      alert('请求失败: ' + err.message);\n    } finally {\n      btnGen.disabled = false;\n      btnGen.textContent = '⚡ 开始生成';\n    }\n  });\n\n  btnVal.addEventListener('click', async function() {\n    const imei = document.getElementById('validate-input').value.trim();\n    if (!imei) return;\n\n    btnVal.disabled = true;\n    btnVal.textContent = '⏳ 校验中...';\n\n    try {\n      const res = await fetch('/api/validate?imei=' + encodeURIComponent(imei));\n      const data = await res.json();\n      const badge = document.getElementById('validate-badge');\n      if (data.valid) {\n        badge.className = 'status-badge success';\n        badge.textContent = '✓ 校验通过！该 IMEI 结构合法且符合标准 Luhn（模 10）校验算法。';\n      } else {\n        badge.className = 'status-badge error';\n        badge.textContent = '✗ 校验失败！该 IMEI 长度不是 15 位纯数字，或 Luhn 校验位计算不匹配。';\n      }\n    } catch (err) {\n      alert('校验出错: ' + err.message);\n    } finally {\n      btnVal.disabled = false;\n      btnVal.textContent = '🔍 立即校验';\n    }\n  });\n\n  btnCopy.addEventListener('click', function() {\n    if (!resultsArea.value) {\n      alert('暂无内容可复制');\n      return;\n    }\n    navigator.clipboard.writeText(resultsArea.value).then(function() {\n      alert('已复制到剪贴板！');\n    }).catch(function() {\n      resultsArea.select();\n      document.execCommand('copy');\n      alert('已复制到剪贴板！');\n    });\n  });\n\n  btnClear.addEventListener('click', function() {\n    resultsArea.value = '';\n  });\n});\n</script>\n\n</body>\n</html>\n";

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
