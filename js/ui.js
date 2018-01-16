var keyCodes = [
  { code: "37", value: "left" },
  { code: "38", value: "up" },
  { code: "39", value: "right" },
  { code: "40", value: "down" },
  { code: "32", value: "select" },
  { code: "27", value: "back" },
  { code: "461", value: "back" },
  { code: "415", value: "play" },
  { code: "19", value: "pause" }
];

var currentUILevel = 0;
var cursorVisible = false;

function setKeyHandler() {
  document.body.onkeydown = function (e) {
    for (var i = 0; i < keyCodes.length; i++) {
      if (e.keyCode == keyCodes[i].code) {
        // console.log(keyCodes[i].value);
        switch (keyCodes[i].value) {
          case "up":
            up();
            break;

          case "down":
            down();
            break;

          case "left":
            left();
            break;

          case "right":
            right();
            break;

          case "select":
            select();
            break;

          case "back":
            if ($("#search-form").is(":visible")) {
              $("#search-input").val("");
              $("#search-form").hide();
            }
            else if ($("#video-container").is(":visible")) {
              closeVideo();
            } else if ($("#audio-container").is(":visible")) {
              stopPodcast();
            } else {
              webOS.platformBack();
            }
            break;

          case "play":
            playPause();
            break;

          case "pause":
            playPause();
            break;
        }
      }
    }
  };
  document.addEventListener("cursorStateChange", function (event) {
    cursorVisible = event.detail.visibility;
    
    if ($("#video-container").is(":visible")) {
      if (cursorVisible) {
        $("#video-container .mejs__controls").stop();
        $("#video-container .mejs__controls").removeClass("mejs__offscreen").css("opacity",1);
      } else {
        showControls();
      }
    } else {
      if (cursorVisible) {
        $(".active").removeClass("active");
      } else {
        changeUILevel();
      }
    }
  }, false);
  document.addEventListener("mousemove", function (event) {
    cursorVisible = event.detail.visibility;
    
    if (cursorVisible && $("#video-container").is(":visible")) {
      if (cursorVisible) {
        $("#video-container .mejs__controls").stop();
        $("#video-container .mejs__controls").removeClass("mejs__offscreen").css("opacity",1);
      }
    }
  }, false);

  if (!cursorVisible) {
    $("#top-menu .selected").addClass("active");
  }
}

function playPause() {
  if ($("#video-container").is(":visible")) {
    jsVideo.paused ? jsVideo.play() : jsVideo.pause();
  }
  if ($("#audio-container").is(":visible")) {
    jsAudio.paused ? jsAudio.play() : jsAudio.pause();
  }
  showControls();
}

function videoSkip(seconds) {
  // jsVideo.ready(function () {
  //   jsVideo.currentTime(jsVideo.currentTime() + 10);
  //   jsVideo.userActive(true);
  // });
  jsVideo.currentTime += seconds;
  $(".mejs__currenttime").text(toHHMMSS(jsVideo.currentTime));
  showControls();
}

function showControls() {
  $("#video-container .mejs__controls").stop();
  $("#video-container .mejs__controls").removeClass("mejs__offscreen").css("opacity",1).animate({opacity:0}, 5000, function(){
    $("#video-container .mejs__controls").addClass("mejs__offscreen");
  });
  // $(".mejs__controls").removeClass("mejs__offscreen");
  // $(".mejs__controls").addClass("mejs__offscreen");
}

function changeUILevel() {
  if ($("#enter-code").is(":visible") || $("#search-form").is(":visible"))
    return;
  $(".active").removeClass("active");
  switch (currentUILevel) {
    case 0:
      $("#top-menu .selected").addClass("active");
      break;

    case 1:
      $("#shows .selected").addClass("active");
      break;

    case 2:
      if (currentMenuOption == "search" && ! currentSearch) {
        currentUILevel = 1;
        $("#shows .selected").addClass("active");
      } else
        $("#videos .selected").addClass("active");
      break;

    case 3:
      if (currentMenuOption == "search" && ! currentSearch) {
        currentUILevel = 1;
        $("#shows .selected").addClass("active");
      } else {
        if ($(".btn.play").length > 2) {
          $($(".btn.play").get(1)).addClass("active");
        } else {
          $(".btn.play").first().addClass("active");
        }
      }
      break;
  }
}

function up() {
  if ($("#search-form").is(":visible"))
    return;
  if ($("#video-container").is(":visible")) {
    videoSkip(60);
  } else {
    if (currentUILevel > 0)
      currentUILevel--;

    changeUILevel();
  }

}

function down() {
  if ($("#search-form").is(":visible"))
    return;
  if ($("#video-container").is(":visible")) {
    videoSkip(-60);
  } else {
    if (currentUILevel < 3)
      currentUILevel++;

    changeUILevel();
  }

}

function left() {
  if ($("#enter-code").is(":visible")) {
    $("#enter-code input").focus();
    return;
  }
  if ($("#search-form").is(":visible"))
    return;
  if ($("#video-container").is(":visible")) {
    videoSkip(-10);
  } else {
    switch (currentUILevel) {
      case 0:
        var prev = $("#top-menu .active").prev();
        if (prev.length > 0 && $(prev).is(":visible") && !requestInProgress) {
          $("#top-menu .active").removeClass("active");
          prev.addClass("active");
          prev.click();
        }
        break;

      case 1:
        if (readyToSelectAShow && !requestInProgress) {
          var prev = $("#shows .active").prev();
          if (prev.length == 0) {
            prev = $("#shows > div").last();
          }
          $("#shows .active").removeClass("active");
          prev.addClass("active");
          if (prev.data("show-id") == newSearchOption.id) {
            selectNewSearchOption();
          } else
            prev.click();
        }
        break;

      case 2:
        previousVideo();
        break;

      case 3:
        var prev = $(".play-buttons a.active").prev();
        if (prev.length > 0) {
          $(".play-buttons a.active").removeClass("active");
          prev.addClass("active");
        }
        break;
    }
  }
}

function right() {
  if ($("#enter-code").is(":visible")) {
    $("#enter-code .btn").focus().addClass("active");
    return;
  }
  if ($("#search-form").is(":visible"))
    return;
  if ($("#video-container").is(":visible")) {
    videoSkip(10);
  } else {
    switch (currentUILevel) {
      case 0:
        var next = $("#top-menu .active").next();
        if (next.length > 0 && !requestInProgress) {
          $("#top-menu .active").removeClass("active");
          next.addClass("active");
          next.click();
        }
        break;

      case 1:
        if (readyToSelectAShow && !requestInProgress) {
          var next = $("#shows .active").next();
          if (next.length == 0) {
            next = $("#shows > div").first();
          }
          $("#shows .active").removeClass("active");
          next.addClass("active");
          if (next.data("show-id") == newSearchOption.id) {
            selectNewSearchOption();
          }
          else
            next.click();
        }
        break;

      case 2:
        nextVideo();
        break;

      case 3:
        var next = $(".play-buttons a.active").next();
        if (next.length > 0) {
          $(".play-buttons a.active").removeClass("active");
          next.addClass("active");
        }
        break;
    }
  }

}



function select() {
  if (!cursorVisible && !$("#search-form").is(":visible"))
    if ($("#video-container").is(":visible")) {

    } else {
      $(".active").click();
    }
}

function carouseliseElements(selector, padding, dontLoop) {

  var centerIndex = 0;
  for (var i = 0; i < $(selector).length; i++) {
    if ($($(selector)[i]).hasClass("selected")) {
      centerIndex = i;
      break;
    }
  }
  $(selector).css("left", "0");
  var leftPos = (window.innerWidth / 2) - $(selector)[centerIndex].getBoundingClientRect().width / 2;
  $($(selector)[centerIndex]).css("left", leftPos + "px");

  leftPos += $(selector)[centerIndex].getBoundingClientRect().width + padding;

  for (var i = centerIndex + 1; i < $(selector).length; i++) {
    if (leftPos <= window.innerWidth || dontLoop) {
      $($(selector)[i]).css("left", Math.round(leftPos) + "px");
      leftPos += $(selector)[i].getBoundingClientRect().width + padding;
    }
  }

  if (!dontLoop) {
    for (var i = 0; i < centerIndex; i++) {
      if (leftPos <= window.innerWidth) {
        $($(selector)[i]).css("left", Math.round(leftPos) + "px");
        leftPos += $(selector)[i].getBoundingClientRect().width + padding;
      }
    }
  }


  leftPos = (window.innerWidth / 2) - $(selector)[centerIndex].getBoundingClientRect().width / 2;

  for (var i = centerIndex - 1; i >= 0; i--) {
    if ($(selector)[i].getBoundingClientRect().left == 0) {
      leftPos -= ($(selector)[i].getBoundingClientRect().width + padding);
      $($(selector)[i]).css("left", Math.round(leftPos) + "px");
    }
  }
  if (!dontLoop) {
    for (var i = $(selector).length - 1; i > centerIndex; i--) {
      if ($(selector)[i].getBoundingClientRect().left == 0) {
        leftPos -= ($(selector)[i].getBoundingClientRect().width + padding);
        $($(selector)[i]).css("left", Math.round(leftPos) + "px");
      }
    }
  }

}
function dummyVideo() {
  return "<div class='video disabled'></div>"
}

function carouseliseShows() {
  // console.log("carouseliseShows");
  carouseliseElements("#shows > div", 0);
}

var readyToSelectAShow = true;

function carouselAnimate() {
  readyToSelectAShow = false;

  var centerOffset = 0;
  for (var i = 0; i < $("#shows > div").length; i++) {
    if ($($("#shows > div")[i]).hasClass("selected")) {
      centerOffset = (window.innerWidth / 2) - $("#shows > div")[i].getBoundingClientRect().left - $("#shows > div")[i].getBoundingClientRect().width / 2;
      break;
    }
  }
  var promise;

  for (var i = 0; i < $("#shows > div").length; i++) {
    promise = $($("#shows > div")[i]).stop(true, true).animate({ left: "+=" + Math.round(centerOffset) }, 200).promise();
  }

  promise.done(function () {
    carouseliseShows();
    readyToSelectAShow = true;
  });
}

function setTopMenuClicks() {
  $("#top-menu .menu-option").click(function () {
    if (!requestInProgress) {
      var clicked = $(this).data("menu-option");
      
      if (clicked == currentMenuOption)
        return;

      currentMenuOption = clicked;
      resetVideoCarousel();
      hideMediaView();

      if (videoInformationTimeout)
        clearTimeout(videoInformationTimeout);

      if (clicked == "podcasts")
        renderPodcasts();
      else if (clicked == "search")
        renderSearchHistory();
      else {
        currentlyPlayingVideo = undefined;
        renderShows(getVideos);
      }

      $("#top-menu .menu-option").removeClass("selected");
      $("#top-menu .menu-option[data-menu-option='" + clicked + "']").addClass("selected");

    }
  });
}

function setTopMenuMouseOverActions() {
  $("#top-menu .menu-option").off("mouseenter mouseleave").hover(function () {
    $(".active").removeClass("active");
    $(this).addClass("active");
    currentUILevel = 0;
  }, function () {
    $(".active").removeClass("active");
  });
}

function setNavBarMouseOverActions() {
  $("#shows > div").off("mouseenter mouseleave").hover(function () {
    $(".active").removeClass("active");
    $(this).addClass("active");
    currentUILevel = 1;
  }, function () {
    $(".active").removeClass("active");
  });
}

function setVideoMouseOverActions() {
  $("#videos .podcast, #videos .video").off("mouseenter mouseleave").hover(function () {
    $(".active").removeClass("active");
    $(this).addClass("active");
    currentUILevel = 2;
  }, function () {
    $(".active").removeClass("active");
  });
}

function setButtonsMouseOverActions() {
  $(".play-buttons .btn").off("mouseenter mouseleave").hover(function () {
    $(".active").removeClass("active");
    $(this).addClass("active");
    currentUILevel = 3;
  }, function () {
    $(".active").removeClass("active");
  });
}


function setVideoClicks() {
  $("#videos .video:not(.disabled").off("click").on("click", function () {
    // console.log("video clicked");
    var id = $(this).data("video-id");
    selectVideo(id, $(this).parent().data("owl-index"));
  });
  setVideoMouseOverActions();
}

function hideMediaView() {
  $("#no-results").hide();
  $(".play-buttons").html("");
  $("#media-view").html("");
  $(".media-error").text("");
  fadeoutBackgroundImage();
}

function fadeoutBackgroundImage() {
  imageReadyToSwap = false;
  $(".bg-image").removeClass("fadein")
  $(".bg-image").addClass("fadeout");
}

function changeBackgroundImage(src) {
  var tmpImg = new Image();
  tmpImg.src = src;
  tmpImg.onload = function () {
    $(".bg-image").removeClass("fadeout");
    $(".bg-image").attr("src", src);
    $(".bg-image").show();
    void $(".bg-image")[0].offsetWidth;
    $(".bg-image").addClass("fadein");
  }
}

function resetVideoCarousel() {
  $("#videos").hide();
  owlResetPositions();
}