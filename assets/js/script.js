(function ($) {
  "use strict";

  // Add year selector
  $(document).ready(function () {
    $("#past-events").change(function () {
      var year = $(this).val();
      if (year === "main") {
        window.location.href = `/`;
      } else {
        window.location.href = `/${year}`;
      }
    });
  });

  function handlePreloader() {
    // Check for the old preloader (preloader)
    if ($(".preloader").length) {
      // Show the old preloader (fade-in)
      $(".preloader").fadeIn(200);

      // Hide the old preloader after a delay and fade it out
      setTimeout(function () {
        $(".preloader").fadeOut(200); // Fade out the old preloader
      }, 2000); // Adjust delay (e.g., 2 seconds)
    }
    // Check for the new preloader (preloader-new)
    else if ($(".preloader-new").length) {
      // Show the new preloader (fade-in)
      $(".preloader-new").fadeIn(200);

      // Hide the new preloader after the page has fully loaded
      $(window).on("load", function () {
        $(".preloader-new").fadeOut(200); // Fade out the new preloader
      });
    }
  }

  // Run the handlePreloader function when the page is ready
  $(document).ready(function () {
    handlePreloader();
  });

  //Update Header Style and Scroll to Top
  function headerStyle() {
    if ($(".main-header").length) {
      var windowpos = $(window).scrollTop();
      var siteHeader = $(".main-header");
      var scrollLink = $(".scroll-to-top");
      if (windowpos >= 1) {
        siteHeader.addClass("fixed-header");
        scrollLink.fadeIn(300);
      } else {
        siteHeader.removeClass("fixed-header");
        scrollLink.fadeOut(300);
      }
    }
  }

  headerStyle();

  //Submenu Dropdown Toggle
  if ($(".main-header li.dropdown ul").length) {
    $(".main-header .navigation li.dropdown").append(
      '<div class="dropdown-btn"><span class="fa fa-angle-down"></span></div>',
    );
  }

  //Mobile Nav Hide Show
  if ($(".mobile-menu").length) {
    var mobileMenuContent = $(
      ".main-header .nav-outer .main-menu .navigation",
    ).html();
    $(".mobile-menu").append(
      '<div class="close-btn"><span class="icon flaticon-cancel-music"></span></div>',
    );
    $(".mobile-menu .navigation").append(mobileMenuContent);
    $(".sticky-header .navigation").append(mobileMenuContent);
    $(".mobile-menu .close-btn").on("click", function () {
      $("body").removeClass("mobile-menu-visible");
    });
    //Dropdown Button
    $(".mobile-menu li.dropdown .dropdown-btn").on("click", function () {
      $(this).prev("ul").slideToggle(500);
    });
    //Menu Toggle Btn
    $(".mobile-nav-toggler").on("click", function () {
      $("body").addClass("mobile-menu-visible");
    });

    //Menu Toggle Btn
    $(".mobile-menu .menu-backdrop,.mobile-menu .close-btn").on(
      "click",
      function () {
        $("body").removeClass("mobile-menu-visible");
      },
    );
  }

  //Shedule Block
  if ($(".schedule-block").length) {
    $(".schedule-block.active").find(".lower-content").slideDown();

    $(".schedule-block .toggle-btn").on("click", function () {
      $(this).parents(".schedule-block").toggleClass("active");
      $(this)
        .parents(".schedule-block")
        .find(".lower-content")
        .slideToggle(400);
      $(this)
        .parents(".schedule-block")
        .siblings()
        .find(".lower-content")
        .slideUp(400);
      $(this).parents(".schedule-block").siblings().removeClass("active");
    });
  }

  //Last Date
  if ($(".date-btn").length) {
    var last_date = $(".date-btn").attr("data-last-date");
    $(".date-btn").on("click", function () {
      $(this).html(last_date);
    });
  }

  // Banner Carousel / Owl Carousel
  if ($(".banner-carousel").length) {
    $(".banner-carousel").owlCarousel({
      animateOut: "fadeOut",
      animateIn: "fadeIn",
      loop: true,
      margin: 0,
      nav: true,
      smartSpeed: 500,
      autoHeight: true,
      autoplay: true,
      autoplayTimeout: 5000,
      navText: [
        '<span class="fa fa-angle-left">',
        '<span class="fa fa-angle-right">',
      ],
      responsive: {
        0: {
          items: 1,
        },
        600: {
          items: 1,
        },
        1024: {
          items: 1,
        },
      },
    });
  }

  // Single Item Carousel
  if ($(".single-item-carousel").length) {
    $(".single-item-carousel").owlCarousel({
      loop: true,
      margin: 0,
      nav: true,
      smartSpeed: 500,
      autoplay: true,
      navText: [
        '<span class="arrow_carrot-left"></span>',
        '<span class="arrow_carrot-right"></span>',
      ],
      responsive: {
        0: {
          items: 1,
        },
        600: {
          items: 1,
        },
        1024: {
          items: 1,
        },
      },
    });
  }

  //Parallax Scene for Icons
  if ($(".parallax-scene-1").length) {
    var scene = $(".parallax-scene-1").get(0);
    var parallaxInstance = new Parallax(scene);
  }
  if ($(".parallax-scene-2").length) {
    var scene = $(".parallax-scene-2").get(0);
    var parallaxInstance = new Parallax(scene);
  }
  if ($(".parallax-scene-3").length) {
    var scene = $(".parallax-scene-3").get(0);
    var parallaxInstance = new Parallax(scene);
  }
  if ($(".parallax-scene-4").length) {
    var scene = $(".parallax-scene-4").get(0);
    var parallaxInstance = new Parallax(scene);
  }
  if ($(".parallax-scene-5").length) {
    var scene = $(".parallax-scene-5").get(0);
    var parallaxInstance = new Parallax(scene);
  }

  //Masonary
  function enableMasonry() {
    if ($(".masonry-items-container").length) {
      var winDow = $(window);
      // Needed variables
      var $container = $(".masonry-items-container");

      $container.isotope({
        itemSelector: ".masonry-item",
        masonry: {
          columnWidth: 1,
        },
        animationOptions: {
          duration: 500,
          easing: "linear",
        },
      });

      winDow.on("resize", function () {
        $container.isotope({
          itemSelector: ".masonry-item",
          animationOptions: {
            duration: 500,
            easing: "linear",
            queue: false,
          },
        });
      });
    }
  }

  enableMasonry();

  // Tabs Box with Persistence
  if ($(".tabs-box").length) {
    // On page load, set the active tab from localStorage
    const savedTab = localStorage.getItem("activeTab");

    if (savedTab && $(savedTab).length) {
      const target = $(savedTab);

      // Reset all tab buttons and content
      $(".tabs-box .tab-buttons .tab-btn").removeClass("active-btn");
      $(".tabs-box .tabs-content .tab")
        .hide()
        .removeClass("active-tab animated fadeIn");

      // Activate the saved tab and corresponding button
      target
        .parents(".tabs-box")
        .find(`.tab-buttons [data-tab="${savedTab}"]`)
        .addClass("active-btn");
      target.show().addClass("active-tab animated fadeIn");
    } else {
      // Default to the first tab if no saved tab exists
      $(".tabs-box .tab-buttons .tab-btn").removeClass("active-btn");
      $(".tabs-box .tabs-content .tab")
        .hide()
        .removeClass("active-tab animated fadeIn");

      $(".tabs-box .tab-buttons .tab-btn:first").addClass("active-btn");
      $(".tabs-box .tabs-content .tab:first")
        .show()
        .addClass("active-tab animated fadeIn");
    }

    // Handle tab button clicks
    $(".tabs-box .tab-buttons .tab-btn").on("click", function (e) {
      e.preventDefault();
      const target = $($(this).attr("data-tab"));

      if ($(target).is(":visible")) {
        return false;
      } else {
        // Remove active classes from all buttons and tabs
        $(".tabs-box .tab-buttons .tab-btn").removeClass("active-btn");
        $(".tabs-box .tabs-content .tab")
          .fadeOut(0)
          .removeClass("active-tab animated fadeIn");

        // Show the clicked tab and add active class
        $(this).addClass("active-btn");
        $(target).fadeIn(300).addClass("active-tab animated fadeIn");

        // Save the active tab to localStorage
        localStorage.setItem("activeTab", `#${target.attr("id")}`);
      }
    });
  }

  //LightBox / Fancybox
  if ($(".lightbox-image").length) {
    $(".lightbox-image").fancybox({
      openEffect: "fade",
      closeEffect: "fade",
      helpers: {
        media: {},
      },
    });
  }

  // Scroll to a Specific Div
  if ($(".scroll-to-target").length) {
    $(".scroll-to-target").on("click", function () {
      var target = $(this).attr("data-target");
      // animate
      $("html, body").animate(
        {
          scrollTop: $(target).offset().top,
        },
        1500,
      );
    });
  }

  // Elements Animation
  if ($(".wow").length) {
    var wow = new WOW({
      boxClass: "wow", // animated element css class (default is wow)
      animateClass: "animated", // animation css class (default is animated)
      offset: 0, // distance to the element when triggering the animation (default is 0)
      mobile: true, // trigger animations on mobile devices (default is true)
      live: true, // act on asynchronously loaded content (default is true)
    });
    wow.init();
  }

  /* ==========================================================================
   When document is Scrollig, do
   ========================================================================== */

  $(window).on("scroll", function () {
    headerStyle();
  });

  /* ==========================================================================
   When document is loading, do
   ========================================================================== */

  $(window).on("load", function () {
    handlePreloader();
    enableMasonry();
  });
})(window.jQuery);
