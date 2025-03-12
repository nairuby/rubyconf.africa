(function ($) {
  $.fn.appear = function (fn, options) {
    const settings = $.extend(
      {
        data: undefined, // Arbitrary data to pass to fn
        one: true, // Call fn only on the first appear
        accX: 0, // X-axis accuracy offset
        accY: 0, // Y-axis accuracy offset
      },
      options,
    );

    const $window = $(window);
    const checks = [];

    // Throttled checkAll function
    const checkAll = () => {
      checks.forEach((check) => check());
    };

    // Throttle the checkAll function to improve performance
    const throttledCheckAll = throttle(checkAll, 100);

    // Override jQuery methods to trigger checks on DOM changes
    [
      "append",
      "prepend",
      "after",
      "before",
      "attr",
      "removeAttr",
      "addClass",
      "removeClass",
      "toggleClass",
      "remove",
      "css",
      "show",
      "hide",
    ].forEach((method) => {
      const oldMethod = $.fn[method];
      if (oldMethod) {
        $.fn[method] = function () {
          const result = oldMethod.apply(this, arguments);
          throttledCheckAll();
          return result;
        };
      }
    });

    // Initialize the plugin for each element
    return this.each(function () {
      const $element = $(this);
      $element.appeared = false;

      const check = () => {
        if (!$element.is(":visible")) {
          $element.appeared = false;
          return;
        }

        const scrollLeft = $window.scrollLeft();
        const scrollTop = $window.scrollTop();
        const offset = $element.offset();
        const elementTop = offset.top;
        const elementLeft = offset.left;
        const elementHeight = $element.outerHeight();
        const elementWidth = $element.outerWidth();
        const windowHeight = $window.height();
        const windowWidth = $window.width();

        if (
          elementTop + elementHeight + settings.accY >= scrollTop &&
          elementTop <= scrollTop + windowHeight + settings.accY &&
          elementLeft + elementWidth + settings.accX >= scrollLeft &&
          elementLeft <= scrollLeft + windowWidth + settings.accX
        ) {
          if (!$element.appeared) {
            $element.trigger("appear", settings.data);
          }
        } else {
          $element.appeared = false;
        }
      };

      const modifiedFn = () => {
        $element.appeared = true;
        if (settings.one) {
          $window.off("scroll", check);
          const index = checks.indexOf(check);
          if (index !== -1) checks.splice(index, 1);
        }
        fn.apply(this, arguments);
      };

      if (settings.one) {
        $element.one("appear", settings.data, modifiedFn);
      } else {
        $element.on("appear", settings.data, modifiedFn);
      }

      $window.on("scroll", throttledCheckAll);
      checks.push(check);
      check();
    });
  };

  // Throttle function to limit the rate of execution
  function throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
})(jQuery);
