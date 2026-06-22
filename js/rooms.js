var tuKhoaTimKiem = "";
var quanDuocChon = "Tất cả";
var giaDuocChon = "Tất cả";
var loaiPhongDuocChon = "Tất cả";
var danhSachTienIchDuocChon = [];

window.onload = function () {
  khoiTaoSuKien();
  locVaHienThiDanhSachPhong();
};

function khoiTaoSuKien() {
  var oTimKiem = document.getElementById("search-input");
  var oSapXep = document.getElementById("sort-select");

  if (oTimKiem != null) {
    oTimKiem.oninput = function () {
      tuKhoaTimKiem = oTimKiem.value.trim();
      locVaHienThiDanhSachPhong();
    };
  }

  if (oSapXep != null) {
    oSapXep.onchange = function () {
      locVaHienThiDanhSachPhong();
    };
  }

  ganSuKienChoNhomNutDon("district-filter-group", "district");
  ganSuKienChoNhomNutDon("price-filter-group", "price");
  ganSuKienChoNhomNutDon("type-filter-group", "type");
  ganSuKienChoNhomTienIch();
}

function ganSuKienChoNhomNutDon(idNhom, loaiLoc) {
  var nhomNut = document.getElementById(idNhom);

  if (nhomNut == null) {
    return;
  }

  var danhSachNut = nhomNut.getElementsByTagName("button");

  for (var i = 0; i < danhSachNut.length; i++) {
    danhSachNut[i].onclick = function () {
      var giaTri = this.getAttribute("data-value");

      if (loaiLoc == "district") {
        quanDuocChon = giaTri;
      }

      if (loaiLoc == "price") {
        giaDuocChon = giaTri;
      }

      if (loaiLoc == "type") {
        loaiPhongDuocChon = giaTri;
      }

      doiTrangThaiNutDon(nhomNut, this);
      locVaHienThiDanhSachPhong();
    };
  }
}

function ganSuKienChoNhomTienIch() {
  var nhomTienIch = document.getElementById("utilities-filter-group");

  if (nhomTienIch == null) {
    return;
  }

  var danhSachNut = nhomTienIch.getElementsByTagName("button");

  for (var i = 0; i < danhSachNut.length; i++) {
    danhSachNut[i].onclick = function () {
      var tenTienIch = this.getAttribute("data-value");
      var viTri = danhSachTienIchDuocChon.indexOf(tenTienIch);

      if (viTri == -1) {
        danhSachTienIchDuocChon.push(tenTienIch);
        this.className = "filter-chip filter-chip-active";
      } else {
        danhSachTienIchDuocChon.splice(viTri, 1);
        this.className = "filter-chip filter-chip-inactive";
      }

      locVaHienThiDanhSachPhong();
    };
  }
}

function doiTrangThaiNutDon(nhomNut, nutDuocBam) {
  var danhSachNut = nhomNut.getElementsByTagName("button");

  for (var i = 0; i < danhSachNut.length; i++) {
    danhSachNut[i].className = "filter-chip filter-chip-inactive";
  }

  nutDuocBam.className = "filter-chip filter-chip-active";
}

function locVaHienThiDanhSachPhong() {
  var vungHienThi = document.getElementById("rooms-list-container");

  if (vungHienThi == null) {
    return;
  }

  var ketQua = [];

  for (var i = 0; i < roomsData.length; i++) {
    var phong = roomsData[i];
    var hopLe = true;

    /* Lọc theo quận */
    if (quanDuocChon != "Tất cả") {
      if (phong.district != quanDuocChon) {
        hopLe = false;
      }
    }

    /* Lọc theo loại phòng */
    if (loaiPhongDuocChon != "Tất cả") {
      if (phong.type != loaiPhongDuocChon) {
        hopLe = false;
      }
    }

    /* Lọc theo giá */
    if (giaDuocChon != "Tất cả") {
      if (giaDuocChon == "duoi-2") {
        if (phong.price >= 2000000) {
          hopLe = false;
        }
      }

      if (giaDuocChon == "2-3.5") {
        if (phong.price < 2000000 || phong.price > 3500000) {
          hopLe = false;
        }
      }

      if (giaDuocChon == "3.5-5") {
        if (phong.price < 3500000 || phong.price > 5000000) {
          hopLe = false;
        }
      }

      if (giaDuocChon == "tren-5") {
        if (phong.price <= 5000000) {
          hopLe = false;
        }
      }
    }

    /* Lọc theo từ khóa */
    if (tuKhoaTimKiem != "") {
      var tuKhoa = tuKhoaTimKiem.toLowerCase();
      var tieuDe = phong.title.toLowerCase();
      var diaChi = phong.address.toLowerCase();

      if (tieuDe.indexOf(tuKhoa) == -1 && diaChi.indexOf(tuKhoa) == -1) {
        hopLe = false;
      }
    }

    /* Lọc theo tiện ích */
    if (danhSachTienIchDuocChon.length > 0) {
      for (var j = 0; j < danhSachTienIchDuocChon.length; j++) {
        var tienIchCanTim = danhSachTienIchDuocChon[j];

        if (phong.utilities.indexOf(tienIchCanTim) == -1) {
          hopLe = false;
          break;
        }
      }
    }

    if (hopLe == true) {
      ketQua.push(phong);
    }
  }

  sapXepDanhSachPhong(ketQua);
  hienThiSoLuongPhong(ketQua.length);
  inDanhSachPhongRaManHinh(ketQua);
}

function sapXepDanhSachPhong(danhSachPhong) {
  var oSapXep = document.getElementById("sort-select");
  var kieuSapXep = "default";

  if (oSapXep != null) {
    kieuSapXep = oSapXep.value;
  }

  if (kieuSapXep == "price-asc") {
    danhSachPhong.sort(function (a, b) {
      return a.price - b.price;
    });
  }

  if (kieuSapXep == "price-desc") {
    danhSachPhong.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  if (kieuSapXep == "area-desc") {
    danhSachPhong.sort(function (a, b) {
      return b.area - a.area;
    });
  }
}

function hienThiSoLuongPhong(soLuong) {
  var oDemSoLuong = document.getElementById("total-rooms-count");

  if (oDemSoLuong != null) {
    oDemSoLuong.innerHTML = soLuong;
  }
}

function inDanhSachPhongRaManHinh(danhSachPhong) {
  var vungHienThi = document.getElementById("rooms-list-container");

  if (vungHienThi == null) {
    return;
  }

  var chuoiHTML = "";

  if (danhSachPhong.length == 0) {
    chuoiHTML =
      '<div class="glass-panel text-center text-muted" style="grid-column: 1/-1; padding: 48px;">' +
        "Hệ thống không tìm thấy kết quả phòng trọ phù hợp với tiêu chí của bạn." +
      "</div>";

    vungHienThi.innerHTML = chuoiHTML;
    return;
  }

  for (var i = 0; i < danhSachPhong.length; i++) {
    var phong = danhSachPhong[i];
    var giaPhong = dinhDangTien(phong.price);
    var htmlTienIch = taoHtmlTienIch(phong.utilities);

    chuoiHTML +=
      '<div class="room-card">' +

        '<div class="room-image-area">' +
          '<img src="' + phong.image + '" alt="' + phong.title + '">' +
          '<span class="price-badge">' + giaPhong + '</span>' +
        '</div>' +

        '<div class="room-info-area">' +

          '<div>' +
            '<div class="room-meta-top">' +
              '<span class="room-code">Mã: ' + phong.code + '</span>' +
              '<span class="room-area">' + phong.area + ' m²</span>' +
            '</div>' +

            '<h3 class="room-title">' + phong.title + '</h3>' +

            '<div class="room-address">📍 ' + phong.address + '</div>' +

            '<div class="room-utilities-tags">' +
              htmlTienIch +
            '</div>' +
          '</div>' +

          '<div class="room-card-footer">' +
            '<span class="room-owner">👤 ' + phong.ownerName + '</span>' +
            '<a href="room-detail.html?id=' + phong.id + '" class="btn-detail">Xem Chi Tiết</a>' +
          '</div>' +

        '</div>' +

      '</div>';
  }

  vungHienThi.innerHTML = chuoiHTML;
}

function taoHtmlTienIch(danhSachTienIch) {
  var chuoiHTML = "";

  for (var i = 0; i < danhSachTienIch.length; i++) {
    chuoiHTML += '<span class="util-tag">' + danhSachTienIch[i] + '</span>';
  }

  return chuoiHTML;
}

function dinhDangTien(soTien) {
  var chuoiTien = soTien.toLocaleString("vi-VN");
  return chuoiTien + " đ/tháng";
}