const welcomeHtml = `
  <div class="chat-msg chat-msg--ai fade-in">
    <div class="chat-icon"><span class="icon">AI</span></div>
    <div class="chat-bubble-ai">
      <p class="chat-line">Chào mừng quý khách, tôi là <strong>Roomie AI</strong>! 👋</p>
      <p class="chat-line">Tôi ở đây để giúp bạn chọn phòng chuẩn xác nhất dựa trên ngôn ngữ giao tiếp hằng ngày. Bạn hãy mô tả mong muốn tìm phòng lý tưởng của mình nhé.</p>
      <p class="chat-hint">Ví dụ bạn có thể nhắn:</p>
      <div class="chat-example">
        "Tôi là sinh viên cần tìm phòng trọ dưới 3.5 triệu ở Bình Thạnh, có gác lửng ban công rộng rãi"
      </div>
    </div>
  </div>
`;

document.addEventListener("DOMContentLoaded", () => {
  setupChatHandlers();
});

function setupChatHandlers() {
  const form = document.getElementById("chat-input-form");
  const textarea = document.getElementById("chat-textarea-input");
  const clearBtn = document.getElementById("btn-clear-chat");
  const chipsGroup = document.getElementById("chat-suggestion-chips");
  const mStream = document.getElementById("chat-messages-container");

  if (!form || !textarea) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitUserMessage();
  });

  if (clearBtn && mStream) {
    clearBtn.addEventListener("click", () => {
      mStream.innerHTML = welcomeHtml;
      showToast("Đã xóa trắng lịch sử cuộc hội thoại!", "success");
    });
  }

  if (chipsGroup) {
    chipsGroup.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      textarea.value = btn.getAttribute("data-prompt");
      submitUserMessage();
    });
  }

  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitUserMessage();
    }
  });
}

function submitUserMessage() {
  const textarea = document.getElementById("chat-textarea-input");
  const mStream = document.getElementById("chat-messages-container");
  if (!textarea || !mStream) return;

  const query = textarea.value.trim();
  if (!query) return;

  appendChatBubble(mStream, "user", query);

  textarea.value = "";
  textarea.style.height = "auto";

  const typingBubble = appendTypingIndicator(mStream);
  mStream.scrollTop = mStream.scrollHeight;

  setTimeout(() => {
    typingBubble.remove();
    resolveAIParsing(mStream, query);
    mStream.scrollTop = mStream.scrollHeight;
  }, 1300);
}


function appendChatBubble(container, role, text) {
  const bubble = document.createElement("div");
  const isAI = role === "ai";
  
  bubble.className = `chat-msg ${isAI ? 'chat-msg--ai' : 'chat-msg--user'} fade-in`;
  if (!isAI) bubble.style.flexDirection = "row-reverse"; // Đẩy tin nhắn user sang bên phải

  bubble.innerHTML = `
    <div class="${isAI ? 'chat-icon' : 'owner-avatar'}" style="${!isAI ? 'width:2rem; height:2rem; font-size:10px;' : ''}">
      <span class="icon">${isAI ? 'AI' : 'KH'}</span>
    </div>
    <div class="${isAI ? 'chat-bubble-ai' : 'chat-bubble-user'}">
      <p class="chat-line ${!isAI ? 'whitespace-pre-wrap' : ''}">${isAI ? text : escapeHTML(text)}</p>
    </div>
  `;
  container.appendChild(bubble);
}


function appendTypingIndicator(container) {
  const indicator = document.createElement("div");
  indicator.className = "chat-msg chat-msg--ai fade-in";
  indicator.innerHTML = `
    <div class="chat-icon"><span class="icon">AI</span></div>
    <div class="chat-bubble-ai" style="display:flex; gap:6px; align-items:center;">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  container.appendChild(indicator);
  return indicator;
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}


function renderRoomCardTemplate(r) {
  return `
    <div class="glass-panel" style="display:flex; gap:1rem; padding:0.75rem; border-radius:0.75rem; margin-top:0.5rem;">
      <div style="position:relative; width:110px; height:80px; flex-shrink:0; overflow:hidden; border-radius:0.5rem;">
        <img src="${r.image}" alt="${r.title}" style="width:100%; height:100%; object-fit:cover;">
        <div class="room-card-price" style="font-size:11px; padding:2px 6px; bottom:4px; left:4px;">
          ${(r.price / 1000000).toFixed(1)}Tr
        </div>
      </div>
      <div style="display:flex; flex-direction:column; justify-content:space-between; flex-grow:1; min-width:0;">
        <div>
          <h4 class="room-card-title" style="font-size:13px; height:auto; margin-bottom:4px; -webkit-line-clamp:1;">
            <a href="room-detail.html?id=${r.id}">${r.title}</a>
          </h4>
          <p style="font-size:11px; color:#94a3b8; display:flex; align-items:center; gap:4px; margin-bottom:2px;">
            📍 <span class="truncate">${r.district}, ${r.ward}</span>
          </p>
          <p style="font-size:11px; color:#64748b;">DT: ${r.area}m² | Loại: ${r.type}</p>
        </div>
        <div style="text-align:right;">
          <a href="room-detail.html?id=${r.id}" style="font-size:11px; color:#38bdf8; font-weight:bold;">Xem chi tiết &rarr;</a>
        </div>
      </div>
    </div>
  `;
}

function resolveAIParsing(container, query) {
  const normalized = query.toLowerCase();
  let maxPrice = Infinity;
  let detectedDistrict = null;
  let detectedType = null;
  const detectedUtilities = [];
  let isStudent = false;

  const priceRegexes = [
    /dưới\s*([\d.,]+)\s*(triệu|tr)/i,
    /tối\s*đa\s*([\d.,]+)\s*(triệu|tr)/i,
    /tầm\s*([\d.,]+)\s*(triệu|tr)/i,
    /khoảng\s*([\d.,]+)\s*(triệu|tr)/i,
    /<\s*([\d.,]+)\s*(triệu|tr)/i,
    /([\d.,]+)\s*(triệu|tr)\s*đổ\s*xuống/i
  ];

  for (const regex of priceRegexes) {
    const match = normalized.match(regex);
    if (match) {
      maxPrice = parseFloat(match[1].replace(",", ".")) * 1000000;
      break;
    }
  }

  if (maxPrice === Infinity) {
    const backupMatch = normalized.match(/([\d.,]+)\s*(tr|triệu)/i);
    if (backupMatch) maxPrice = parseFloat(backupMatch[1].replace(",", ".")) * 1000000;
  }

  const districts = ["Bình Thạnh", "Thủ Đức", "Quận 1", "Gò Vấp", "Quận 7"];
  for (const d of districts) {
    if (normalized.includes(d.toLowerCase())) { detectedDistrict = d; break; }
  }

  const typesMap = {
    "phòng trọ": "Phòng trọ", "nhà trọ": "Phòng trọ", "studio": "Studio",
    "căn hộ mini": "Căn hộ mini", "chung cư mini": "Căn hộ mini", "duplex": "Duplex",
    "gác lửng đúc": "Duplex", "ở ghép": "Ở ghép", "tìm bạn ở ghép": "Ở ghép"
  };
  for (const [key, val] of Object.entries(typesMap)) {
    if (normalized.includes(key)) { detectedType = val; break; }
  }

  const utilsKeywords = {
    "máy lạnh": "Máy lạnh", "điều hoà": "Máy lạnh", "wc riêng": "WC riêng", "khép kín": "WC riêng",
    "toilet riêng": "WC riêng", "nhà vệ sinh riêng": "WC riêng", "kệ bếp": "Kệ bếp", "bếp riêng": "Kệ bếp",
    " nấu ăn": "Kệ bếp", "ban công": "Ban công", "gác lửng": "Gác lửng", "có gác": "Gác lửng",
    "thang máy": "Thang máy", "bảo vệ": "Bảo vệ", "an ninh": "Bảo vệ", "tự do": "Giờ giấc tự do",
    "giờ tự do": "Giờ giấc tự do", "không chung chủ": "Không chung chủ", "máy giặt": "Máy giặt"
  };
  for (const [key, value] of Object.entries(utilsKeywords)) {
    if (normalized.includes(key) && !detectedUtilities.includes(value)) detectedUtilities.push(value);
  }

  if (/[sinh viên|học sinh|iuh|hutech|ftu|tôn đức thắng]/i.test(normalized)) isStudent = true;

  const postedRooms = JSON.parse(localStorage.getItem("roomie_user_posted_rooms") || "[]");
  let matchedRooms = [...postedRooms, ...roomsData];

  if (detectedDistrict) matchedRooms = matchedRooms.filter(r => r.district === detectedDistrict);
  if (maxPrice !== Infinity) matchedRooms = matchedRooms.filter(r => r.price <= maxPrice + 100000);
  if (detectedType) matchedRooms = matchedRooms.filter(r => r.type === detectedType);
  if (detectedUtilities.length > 0) matchedRooms = matchedRooms.filter(r => detectedUtilities.every(u => r.utilities.includes(u)));
  if (isStudent) matchedRooms = matchedRooms.filter(r => r.suitableFor.includes("Sinh viên"));


  let replyText = "";

  if (matchedRooms.length > 0) {
    let summary = `Roomie AI đã lọc tìm thấy <strong>${matchedRooms.length} phòng trọ</strong> phù hợp nhu cầu:`;
    if (detectedDistrict) summary += ` tại quận ${detectedDistrict}`;
    if (maxPrice !== Infinity) summary += ` giá dưới ${(maxPrice).toLocaleString('vi-VN')}đ`;

    replyText = `
      <p class="chat-line">✦ ${summary}</p>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin: 0.5rem 0;">
        ${matchedRooms.slice(0, 3).map(r => renderRoomCardTemplate(r)).join('')}
      </div>
      <p class="chat-hint" style="font-size:11px; font-style:italic;">*Mẹo: Click vào tiêu đề phòng để mở trang chi tiết và đặt phòng nhanh.</p>
    `;
  } else {
    const fallbacks = [...postedRooms, ...roomsData].slice(0, 2);
    replyText = `
      <p class="chat-line" style="color:var(--color-rose);">⚠ Roomie AI chưa tìm thấy phòng khớp 100% tiêu chí của bạn.</p>
      <p class="chat-line" style="font-size:12px; color:#94a3b8;">Bạn thử nâng tầm giá lên một chút hoặc giảm bớt yêu cầu tiện nghi xem sao nhé.</p>
      <div class="divider-line" style="margin: 0.5rem 0;"></div>
      <p class="chat-hint">✦ Gợi ý 2 căn phòng nổi bật tốt nhất hôm nay:</p>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
        ${fallbacks.map(r => renderRoomCardTemplate(r)).join('')}
      </div>
    `;
  }

  appendChatBubble(container, "ai", replyText);
}