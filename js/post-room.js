var danhSachAnhDaChon = [];

document.addEventListener("DOMContentLoaded", function () {
  prefillOwnerSessionData();
  setupDropZoneListeners();
  setupFormPostSubmission();
});

function prefillOwnerSessionData() {
  var userRaw = localStorage.getItem("roomie_user");
  if (userRaw !== null) {
    var user = JSON.parse(userRaw);
    var nameInput = document.getElementById("post-owner-name");
    var phoneInput = document.getElementById("post-owner-phone");
    
    if (nameInput !== null) {
      nameInput.value = user.name;
    }
    if (phoneInput !== null) {
      phoneInput.value = user.phone;
    }
  }
}

function setupDropZoneListeners() {
  var zone = document.getElementById("file-drop-zone");
  var fileInput = document.getElementById("post-file-input");
  var previewContainer = document.getElementById("file-previews-container");

  if (zone === null || fileInput === null) {
    return;
  }

  zone.addEventListener("click", function () {
    fileInput.click();
  });

  zone.addEventListener("dragover", function (e) {
    e.preventDefault();
    zone.style.borderColor = "#007bff";
    zone.style.backgroundColor = "rgba(0, 123, 255, 0.05)";
  });

  zone.addEventListener("dragleave", function (e) {
    e.preventDefault();
    zone.style.borderColor = "#cccccc";
    zone.style.backgroundColor = "transparent";
  });

  zone.addEventListener("drop", function (e) {
    e.preventDefault();
    zone.style.borderColor = "#cccccc";
    zone.style.backgroundColor = "transparent";
    
    var files = e.dataTransfer.files;
    xuLyFileAnh(files, previewContainer);
  });

  fileInput.addEventListener("change", function (e) {
    var files = e.target.files;
    xuLyFileAnh(files, previewContainer);
  });
}

function xuLyFileAnh(files, previewContainer) {
  if (files.length === 0) return;
  
  if (previewContainer !== null) {
    previewContainer.classList.remove("hidden");
  }

  var soLuongAnh = Math.min(files.length, 5);
  for (var i = 0; i < soLuongAnh; i++) {
    var file = files[i];
    
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
      var img = new Image();
      img.src = event.target.result;
      img.onload = function () {
        var canvas = document.createElement("canvas");
        var MAX_WIDTH = 640;
        var MAX_HEIGHT = 480;
        var width = img.width;
        var height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = width * (MAX_HEIGHT / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        var compressedUrl = canvas.toDataURL("image/jpeg", 0.7);
        
        danhSachAnhDaChon.push(compressedUrl);
        
        var col = document.createElement("div");
        col.style.width = "80px";
        col.style.height = "60px";
        col.style.border = "1px solid #cccccc";
        col.style.position = "relative";
        col.style.display = "inline-block";
        col.style.marginRight = "10px";
        col.style.cursor = "pointer";
        
        col.innerHTML = `
          <img src="${compressedUrl}" style="width:100%; height:100%; object-fit:cover;">
          <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(255,0,0,0.7); color:white; text-align:center; font-size:10px; font-weight:bold;">XÓA</div>
        `;
        
        col.addEventListener("click", function (ev) {
          ev.stopPropagation();
          
          var index = danhSachAnhDaChon.indexOf(compressedUrl);
          if (index !== -1) {
            danhSachAnhDaChon.splice(index, 1);
          }
          
          col.remove();
          
          if (danhSachAnhDaChon.length === 0 && previewContainer !== null) {
            previewContainer.classList.add("hidden");
          }
        });

        if (previewContainer !== null) {
          previewContainer.appendChild(col);
        }
      };
    };
  }
}

function setupFormPostSubmission() {
  var postForm = document.getElementById("post-room-form");
  if (postForm === null) return;

  postForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var postTitle = document.getElementById("post-title");
    var postType = document.getElementById("post-type");
    var postPrice = document.getElementById("post-price");
    var postArea = document.getElementById("post-area");
    var postDistrict = document.getElementById("post-district");
    var postWard = document.getElementById("post-ward");
    var postAddress = document.getElementById("post-address-detail");
    var postName = document.getElementById("post-owner-name");
    var postPhone = document.getElementById("post-owner-phone");
    var postDesc = document.getElementById("post-description");

    var titleError = document.getElementById("title-error");
    var typeError = document.getElementById("type-error");
    var priceError = document.getElementById("price-error");
    var areaError = document.getElementById("area-error");
    var districtError = document.getElementById("district-error");
    var wardError = document.getElementById("ward-error");
    var addressError = document.getElementById("address-error");
    var nameError = document.getElementById("name-error");
    var phoneError = document.getElementById("phone-error");
    var descError = document.getElementById("description-error");

    if (titleError) titleError.innerText = "";
    if (typeError) typeError.innerText = "";
    if (priceError) priceError.innerText = "";
    if (areaError) areaError.innerText = "";
    if (districtError) districtError.innerText = "";
    if (wardError) wardError.innerText = "";
    if (addressError) addressError.innerText = "";
    if (nameError) nameError.innerText = "";
    if (phoneError) phoneError.innerText = "";
    if (descError) descError.innerText = "";

    var laHopLe = true;

    if (postTitle.value.trim() === "") {
      if (titleError) titleError.innerText = "Vui lòng nhập tiêu đề tin đăng!";
      laHopLe = false;
    }
    
    if (postType.value === "") {
      if (typeError) typeError.innerText = "Vui lòng chọn loại hình phòng trọ!";
      laHopLe = false;
    }
    
    if (postPrice.value.trim() === "") {
      if (priceError) priceError.innerText = "Vui lòng nhập giá thuê căn hộ!";
      laHopLe = false;
    } else if (isNaN(postPrice.value) || Number(postPrice.value) < 500000) {
      if (priceError) priceError.innerText = "Giá thuê phòng trọ phải là số và tối thiểu từ 500,000 VND!";
      laHopLe = false;
    }
    
    if (postArea.value.trim() === "") {
      if (areaError) areaError.innerText = "Vui lòng nhập diện tích phòng!";
      laHopLe = false;
    } else if (isNaN(postArea.value) || Number(postArea.value) <= 0) {
      if (areaError) areaError.innerText = "Diện tích phải là một chữ số lớn hơn 0!";
      laHopLe = false;
    }
    
    if (postDistrict.value === "") {
      if (districtError) districtError.innerText = "Vui lòng chọn quận/huyện tương ứng!";
      laHopLe = false;
    }
    
    if (postWard.value.trim() === "") {
      if (wardError) wardError.innerText = "Vui lòng nhập thông tin phường/xã!";
      laHopLe = false;
    }
    
    if (postAddress.value.trim() === "") {
      if (addressError) addressError.innerText = "Vui lòng cung cấp địa chỉ số nhà và tên đường chi tiết!";
      laHopLe = false;
    }
    
    if (postName.value.trim() === "") {
      if (nameError) nameError.innerText = "Vui lòng cung cấp họ tên người liên hệ!";
      laHopLe = false;
    }
    
    if (postPhone.value.trim() === "") {
      if (phoneError) phoneError.innerText = "Vui lòng điền số điện thoại liên hệ!";
      laHopLe = false;
    }
    
    if (postDesc.value.trim() === "") {
      if (descError) descError.innerText = "Vui lòng viết đoạn mô tả thông tin giới thiệu căn phòng!";
      laHopLe = false;
    }

    if (laHopLe) {
      var priceValue = parseInt(postPrice.value);
      var areaValue = parseInt(postArea.value);

      var utilities = [];
      var utilCheckboxes = document.querySelectorAll(".post-util-checkbox:checked");
      for (var k = 0; k < utilCheckboxes.length; k++) {
        utilities.push(utilCheckboxes[k].value);
      }

      var suitableFor = [];
      var suitableCheckboxes = document.querySelectorAll(".post-suitable-checkbox:checked");
      for (var m = 0; m < suitableCheckboxes.length; m++) {
        suitableFor.push(suitableCheckboxes[m].value);
      }

      var mainImg = "https://placehold.co/800x600?text=Roomie+Image";
      var sideImgs = [];

      if (danhSachAnhDaChon.length > 0) {
        mainImg = danhSachAnhDaChon[0];
        sideImgs = danhSachAnhDaChon;
      } else {
        sideImgs.push(mainImg);
      }

      var fullAddressString = postAddress.value.trim() + ", " + postWard.value.trim() + ", " + postDistrict.value;

      var createdRoom = {
        id: 2000 + Date.now() % 10000,
        code: "RM" + Math.floor(1005 + Math.random() * 9000),
        title: postTitle.value.trim(),
        price: priceValue,
        area: areaValue,
        type: postType.value,
        district: postDistrict.value,
        ward: postWard.value.trim(),
        address: fullAddressString,
        image: mainImg,
        images: sideImgs,
        utilities: utilities,
        suitableFor: suitableFor,
        ownerName: postName.value.trim(),
        ownerPhone: postPhone.value.trim(),
        description: postDesc.value.trim(),
        status: "Còn phòng",
        createdAt: new Date().toISOString()
      };

      var currentPostedRaw = localStorage.getItem("roomie_user_posted_rooms");
      var currentPosted = [];
      if (currentPostedRaw !== null) {
        currentPosted = JSON.parse(currentPostedRaw);
      }
      
      currentPosted.unshift(createdRoom);
      localStorage.setItem("roomie_user_posted_rooms", JSON.stringify(currentPosted));

      alert("Chúc mừng! Tin đăng của bạn đã được duyệt thành công trên hệ thống.");

      postForm.reset();

      setTimeout(function () {
        window.location.href = "rooms.html";
      }, 500);
    }
  });
}