document.addEventListener("DOMContentLoaded", function () {
  renderFavoritesList();
});

function renderFavoritesList() {
  var container = document.getElementById("favorites-list-container");

  if (container == null) {
    return;
  }

  var favorites = getArrayFromLocalStorage("roomie_favorites");
  var postedRooms = getArrayFromLocalStorage("roomie_user_posted_rooms");

  var allRooms = [];
  var likedRooms = [];
  var i;

  for (i = 0; i < postedRooms.length; i++) {
    allRooms.push(postedRooms[i]);
  }

  if (typeof roomsData != "undefined") {
    for (i = 0; i < roomsData.length; i++) {
      allRooms.push(roomsData[i]);
    }
  }

  for (i = 0; i < allRooms.length; i++) {
    if (isFavoriteRoom(favorites, allRooms[i].id) == true) {
      likedRooms.push(allRooms[i]);
    }
  }

  if (likedRooms.length == 0) {
    container.innerHTML =
      '<div class="col-span-full glass-panel rounded-3xl p-16 text-center border-slate-850">' +
        '<div class="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-500/10 flex items-center justify-center text-rose-450 mx-auto mb-5 animate-pulse">' +
          '<span class="icon w-7 h-7">♡</span>' +
        '</div>' +

        '<h3 class="text-xl font-bold text-white mb-2">Chưa lưu phòng trọ yêu thích nào</h3>' +

        '<p class="text-sm text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">' +
          'Khi tìm trọ có căn phòng nào ưng ý, quý khách hãy nhấn nút trái tim để lưu lại xem nhanh ở đây nhé!' +
        '</p>' +

        '<a href="rooms.html" class="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-550 text-white font-bold rounded-xl text-xs transition-transform active:scale-95 inline-block cursor-pointer">' +
          'Quay lại Danh sách phòng' +
        '</a>' +
      '</div>';

    if (typeof updateFavoritesBadge == "function") {
      updateFavoritesBadge();
    }

    return;
  }

  var html = "";

  for (i = 0; i < likedRooms.length; i++) {
    html += createFavoriteCardHTML(likedRooms[i]);
  }

  container.innerHTML = html;

  addDeleteFavoriteEvents();

  if (typeof updateFavoritesBadge == "function") {
    updateFavoritesBadge();
  }
}

function createFavoriteCardHTML(room) {
  var price = room.price.toLocaleString("vi-VN") + "đ/tháng";

  var html =
    '<div id="fav-card-item-' + room.id + '" class="glass-panel rounded-2xl overflow-hidden border border-slate-850 hover:border-sky-500/20 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 flex flex-col justify-between h-full fade-in">' +

      '<div>' +

        '<div class="relative h-44 bg-slate-900 overflow-hidden">' +
          '<img src="' + room.image + '" alt="' + room.title + '" class="w-full h-full object-cover">' +

          '<div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>' +

          '<span class="absolute bottom-3 left-3 bg-slate-950/95 text-sky-400 font-extrabold text-sm px-2.5 py-0.5 rounded border border-slate-800">' +
            price +
          '</span>' +

          '<span class="absolute top-3 left-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">' +
            '<span class="icon w-3.5 h-3.5">✓</span> Xác thực' +
          '</span>' +

          '<button ' +
            'type="button" ' +
            'data-id="' + room.id + '" ' +
            'class="btn-delete-fav absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 border border-slate-800 hover:border-rose-500 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer" ' +
            'title="Xóa khỏi yêu thích">' +
            '<span class="icon w-4 h-4">♡</span>' +
          '</button>' +
        '</div>' +

        '<div class="p-5">' +

          '<div class="flex items-center justify-between text-slate-450 text-[10px] uppercase font-mono font-bold mb-2">' +
            '<span>Mã: ' + room.code + '</span>' +
            '<span class="bg-slate-900 text-sky-400 px-1.5 py-0.5 rounded">' + room.type + '</span>' +
          '</div>' +

          '<h3 class="text-base font-extrabold text-slate-200 line-clamp-2 h-12 leading-snug mb-3">' +
            '<a href="room-detail.html?id=' + room.id + '" class="hover:text-sky-450 transition-colors">' +
              room.title +
            '</a>' +
          '</h3>' +

          '<div class="flex items-start gap-1.5 text-xs text-slate-400">' +
            '<span class="icon w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5">📍</span>' +
            '<span>' + room.district + ', ' + room.ward + '</span>' +
          '</div>' +

        '</div>' +

      '</div>' +

      '<div class="p-5 pt-0 border-t border-slate-900/60 mt-4 flex gap-2.5">' +

        '<a href="room-detail.html?id=' + room.id + '" class="flex-1 text-center py-2.5 border border-slate-800 hover:border-sky-500/30 text-slate-300 hover:text-sky-400 font-bold rounded-xl text-xs transition-colors">' +
          'Xem chi tiết' +
        '</a>' +

        '<a href="booking.html?id=' + room.id + '" class="flex-1 text-center py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow shadow-sky-500/10 active:scale-95">' +
          'Đặt lịch ngay' +
        '</a>' +

      '</div>' +

    '</div>';

  return html;
}

function addDeleteFavoriteEvents() {
  var buttons = document.getElementsByClassName("btn-delete-fav");

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function () {
      var roomId = parseInt(this.getAttribute("data-id"));

      removeFavoriteRoom(roomId);

      if (typeof showToast == "function") {
        showToast("Đã xóa căn phòng khỏi danh sách yêu thích!", "warn");
      }

      renderFavoritesList();
    };
  }
}

function removeFavoriteRoom(roomId) {
  var favorites = getArrayFromLocalStorage("roomie_favorites");
  var newFavorites = [];

  for (var i = 0; i < favorites.length; i++) {
    if (parseInt(favorites[i]) != parseInt(roomId)) {
      newFavorites.push(favorites[i]);
    }
  }

  localStorage.setItem("roomie_favorites", JSON.stringify(newFavorites));
}

function isFavoriteRoom(favorites, roomId) {
  for (var i = 0; i < favorites.length; i++) {
    if (parseInt(favorites[i]) == parseInt(roomId)) {
      return true;
    }
  }

  return false;
}

function getArrayFromLocalStorage(keyName) {
  var data = localStorage.getItem(keyName);

  if (data == null || data == "") {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}