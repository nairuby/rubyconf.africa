(function ($) {
  "use strict";

  // Cache frequently used selectors
  const $body = $("body");
  const $wrapper = $(".page-wrapper");
  const $colorPalate = $(".color-palate");

  // Toggle visibility of the color palate
  $(".color-trigger").on("click", function () {
    $(this).parent().toggleClass("visible-palate");
  });

  // Handle layout changer (box layout)
  $colorPalate.on("click", ".box-version li", function () {
    const isBoxLayout = $(this).hasClass("box");
    $body.toggleClass("box-layout", isBoxLayout);
  });

  // Handle direction changer (RTL)
  $colorPalate.on("click", ".rtl-version li", function () {
    const isRTL = $(this).hasClass("rtl");
    $wrapper.toggleClass("rtl", isRTL);
  });
})(jQuery);
