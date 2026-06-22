window.onload = function () {
  khoiTaoTrangChiTiet();
};

function khoiTaoTrangChiTiet() {
  var roomId = layIdPhongTuUrl();
  var allRooms = layTatCaPhong();
  var room = timPhongTheoId(allRooms, roomId);

  if (room == null) {
    hienThiLoiKhongTimThayPhong();
    return;
  }

  hienThiChiTietPhong(room);
  hienThiPhongTuongTu(room, allRooms);
  ganSuKienChoCacNut(room);
}

function layIdPhongTuUrl() {
  var chuoiUrl = window.location.search;

  if (chuoiUrl.length > 0) {
    chuoiUrl = chuoiUrl.substring(1);
  }

  var mangThamSo = chuoiUrl.split("&");

  for (var i = 0; i < mangThamSo.length; i++) {
    var capGiaTri = mangThamSo[i].split("=");

    if (capGiaTri[0] == "id") {
      return parseInt(capGiaTri[1]);
    }
  }

  return 0;
}

function layTatCaPhong() {
  var postedRooms = layMangTuLocalStorage("roomie_user_posted_rooms");
  var allRooms = [];
  var i;

  for (i = 0; i < postedRooms.length; i++) {
    allRooms.push(postedRooms[i]);
  }

  if (typeof roomsData != "undefined") {
    for (i = 0; i < roomsData.length; i++) {
      allRooms.push(roomsData[i]);
    }
  }

  return allRooms;
}

function timPhongTheoId(danhSachPhong, idCanTim) {
  for (var i = 0; i < danhSachPhong.length; i++) {
    if (parseInt(danhSachPhong[i].id) == parseInt(idCanTim)) {
      return danhSachPhong[i];
    }
  }

  return null;
}

function layMangTuLocalStorage(tenKey) {
  var duLieu = localStorage.getItem(tenKey);

  if (duLieu == null || duLieu == "") {
    return [];
  }

  try {
    return JSON.parse(duLieu);
  } catch (e) {
    return [];
  }
}

function hienThiLoiKhongTimThayPhong() {
  var loader = document.getElementById("detail-loader");
  var container = document.getElementById("detail-content-area");

  if (container) {
    container.className = "detail-layout hidden";
  }

  if (loader) {
    loader.innerHTML =
      '<div class="glass-panel detail-panel">' +
        '<h3>Phòng trọ không tồn tại</h3>' +
        '<p>Mã số phòng trọ truyền vào không hợp lệ hoặc đã bị gỡ khỏi hệ thống.</p>' +
        '<a href="rooms.html" class="back-link">Quay lại trang danh sách</a>' +
      '</div>';
  }
}

function hienThiChiTietPhong(room) {
  var loader = document.getElementById("detail-loader");
  var container = document.getElementById("detail-content-area");

  if (loader) {
    loader.className = "detail-loader hidden";
  }

  if (container) {
    container.className = "detail-layout";
  }

  ganText("detail-title", room.title);
  ganText("detail-type", room.type);
  ganText("detail-area", room.area + " m²");
  ganText("detail-code", room.code);
  ganText("detail-address", room.address);
  ganText("detail-description", room.description);
  ganText("detail-status", room.status);
  ganText("detail-owner-name", room.ownerName);
  ganText("detail-owner-phone", room.ownerPhone);

  var giaPhong = document.getElementById("detail-price");

  if (giaPhong) {
    giaPhong.innerHTML = dinhDangTien(room.price);
  }

  var avatar = document.getElementById("detail-owner-avatar");

  if (avatar) {
    avatar.innerHTML = layChuAvatar(room.ownerName);
  }

  capNhatTrangThaiPhong(room.status);
  hienThiGallery(room);
  hienThiTienIch(room);
  hienThiDoiTuongPhuHop(room);
}

function ganText(id, noiDung) {
  var element = document.getElementById(id);

  if (element) {
    element.innerHTML = noiDung;
  }
}

function layChuAvatar(ten) {
  if (!ten) {
    return "AD";
  }

  var mangTu = ten.split(" ");
  var chu = "";

  if (mangTu.length > 0) {
    chu += mangTu[0].charAt(0).toUpperCase();
  }

  if (mangTu.length > 1) {
    chu += mangTu[1].charAt(0).toUpperCase();
  }

  return chu;
}

function capNhatTrangThaiPhong(status) {
  var statusEl = document.getElementById("detail-status");

  if (statusEl == null) {
    return;
  }

  if (status == "Còn phòng") {
    statusEl.className = "status-badge status-available";
  } else {
    statusEl.className = "status-badge status-unavailable";
  }
}

function hienThiGallery(room) {
  var mainPreview = document.getElementById("main-preview-img");
  var thumbnailsWrapper = document.getElementById("thumbnails-wrapper");

  var gallery = [];

  if (room.images && room.images.length > 0) {
    gallery = room.images;
  } else {
    gallery.push(room.image);
  }

  if (mainPreview) {
    mainPreview.src = gallery[0];
    mainPreview.alt = room.title;
  }

  if (thumbnailsWrapper == null) {
    return;
  }

  var chuoiHTML = "";

  for (var i = 0; i < gallery.length; i++) {
    var classActive = "";

    if (i == 0) {
      classActive = " active detail-thumbnail-active";
    }

    chuoiHTML +=
      '<button type="button" class="detail-thumbnail' + classActive + '" data-img="' + gallery[i] + '">' +
        '<img src="' + gallery[i] + '" alt="Hình phòng ' + (i + 1) + '">' +
      '</button>';
  }

  thumbnailsWrapper.innerHTML = chuoiHTML;

  var danhSachNut = thumbnailsWrapper.getElementsByTagName("button");

  for (var j = 0; j < danhSachNut.length; j++) {
    danhSachNut[j].onclick = function () {
      for (var k = 0; k < danhSachNut.length; k++) {
        danhSachNut[k].className = "detail-thumbnail";
      }

      this.className = "detail-thumbnail active detail-thumbnail-active";

      if (mainPreview) {
        mainPreview.src = this.getAttribute("data-img");
      }
    };
  }
}

function hienThiTienIch(room) {
  var utilitiesGrid = document.getElementById("detail-utilities-grid");

  if (utilitiesGrid == null) {
    return;
  }

  var iconMap = {
    "Máy lạnh": "❄",
    "WC riêng": "✓",
    "Kệ bếp": "🍴",
    "Ban công": "☀",
    "Gác lửng": "▤",
    "Thang máy": "↕",
    "Bảo vệ": "✓",
    "Giờ giấc tự do": "🕒",
    "Không chung chủ": "⊘",
    "Máy giặt": "▣",
    "Chỗ để xe": "🅿"
  };

  var chuoiHTML = "";
  var danhSachTienIch = room.utilities || [];

  for (var i = 0; i < danhSachTienIch.length; i++) {
    var tenTienIch = danhSachTienIch[i];
    var icon = iconMap[tenTienIch] || "✓";

    chuoiHTML +=
      '<div class="utility-card">' +
        '<span class="icon">' + icon + '</span>' +
        '<span>' + tenTienIch + '</span>' +
      '</div>';
  }

  utilitiesGrid.innerHTML = chuoiHTML;
}

function hienThiDoiTuongPhuHop(room) {
  var suitableGroup = document.getElementById("detail-suitable-group");

  if (suitableGroup == null) {
    return;
  }

  var danhSach = room.suitableFor || [];
  var chuoiHTML = "";

  for (var i = 0; i < danhSach.length; i++) {
    chuoiHTML += '<span class="pill-item">' + danhSach[i] + '</span>';
  }

  suitableGroup.innerHTML = chuoiHTML;
}

function ganSuKienChoCacNut(room) {
  var bookBtn = document.getElementById("btn-nav-booking");

  if (bookBtn) {
    bookBtn.onclick = function () {
      window.location.href = "booking.html?id=" + room.id;
    };
  }

  var favBtn = document.getElementById("btn-toggle-favorite");

  if (favBtn) {
    capNhatNutYeuThich(room, favBtn);

    favBtn.onclick = function () {
      doiTrangThaiYeuThich(room);
      capNhatNutYeuThich(room, favBtn);

      if (typeof updateFavoritesBadge == "function") {
        updateFavoritesBadge();
      }
    };
  }
}

function doiTrangThaiYeuThich(room) {
  var favorites = layMangTuLocalStorage("roomie_favorites");
  var viTri = timViTriIdTrongMang(favorites, room.id);

  if (viTri != -1) {
    favorites.splice(viTri, 1);
    localStorage.setItem("roomie_favorites", JSON.stringify(favorites));

    if (typeof showToast == "function") {
      showToast("Đã xóa khỏi danh sách yêu thích", "warn");
    }
  } else {
    favorites.push(room.id);
    localStorage.setItem("roomie_favorites", JSON.stringify(favorites));

    if (typeof showToast == "function") {
      showToast("Đã lưu phòng vào danh sách yêu thích!", "success");
    }
  }
}

function timViTriIdTrongMang(mang, idCanTim) {
  for (var i = 0; i < mang.length; i++) {
    if (parseInt(mang[i]) == parseInt(idCanTim)) {
      return i;
    }
  }

  return -1;
}


function capNhatNutYeuThich(room, favBtn) {
  var favorites = layMangTuLocalStorage("roomie_favorites");
  var daYeuThich = timViTriIdTrongMang(favorites, room.id) != -1;

  var spans = favBtn.getElementsByTagName("span");
  var icon = spans[0];
  var textSpan = spans[1];

  if (daYeuThich == true) {
    if (icon) {
      icon.innerHTML = "♥";
    }

    if (textSpan) {
      textSpan.innerHTML = "Bỏ thích phòng này";
    }

    favBtn.className = "btn-secondary-action btn-favorite active";
  } else {
    if (icon) {
      icon.innerHTML = "♡";
    }

    if (textSpan) {
      textSpan.innerHTML = "Lưu phòng yêu thích";
    }

    favBtn.className = "btn-secondary-action btn-favorite";
  }
}

function hienThiPhongTuongTu(room, allRooms) {
  var container = document.getElementById("similar-rooms-row");

  if (container == null) {
    return;
  }

  var similar = [];

  for (var i = 0; i < allRooms.length; i++) {
    var item = allRooms[i];

    if (parseInt(item.id) != parseInt(room.id)) {
      if (item.district == room.district || item.type == room.type) {
        similar.push(item);
      }
    }

    if (similar.length == 3) {
      break;
    }
  }

  if (similar.length == 0) {
    container.innerHTML =
      '<div class="empty-message">' +
        'Không tìm thấy sản phẩm đề xuất nào khác xung quanh khu vực này.' +
      '</div>';

    return;
  }

  var chuoiHTML = "";

  for (var j = 0; j < similar.length; j++) {
    chuoiHTML += taoHtmlPhongTuongTu(similar[j]);
  }

  container.innerHTML = chuoiHTML;
}

function taoHtmlPhongTuongTu(item) {
  var giaPhong = dinhDangTien(item.price) + "/tháng";

  var chuoiHTML =
    '<div class="similar-card">' +

      '<div class="similar-card-img">' +
        '<img src="' + item.image + '" alt="' + item.title + '">' +
        '<span class="similar-price">' + giaPhong + '</span>' +
        '<span class="similar-type">' + item.type + '</span>' +
      '</div>' +

      '<div class="similar-card-content">' +
        '<h4>' +
          '<a href="room-detail.html?id=' + item.id + '">' + item.title + '</a>' +
        '</h4>' +

        '<p class="similar-address">📍 ' + item.district + ', ' + item.ward + '</p>' +

        '<div class="similar-actions">' +
          '<a href="room-detail.html?id=' + item.id + '" class="btn-detail">Chi tiết</a>' +
          '<a href="booking.html?id=' + item.id + '" class="btn-booking">Đặt lịch</a>' +
        '</div>' +
      '</div>' +

    '</div>';

  return chuoiHTML;
}

function dinhDangTien(soTien) {
  return soTien.toLocaleString("vi-VN") + "đ";
}