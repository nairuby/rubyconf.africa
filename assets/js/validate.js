/*! jQuery Validation Plugin - v1.11.0 - 2/4/2013
 * https://github.com/jzaefferer/jquery-validation
 * Copyright (c) 2013 JÃ¶rn Zaefferer; Licensed MIT */
((function (e) {
  (e.extend(e.fn, {
    validate: function (t) {
      if (!this.length) {
        t &&
          t.debug &&
          window.console &&
          console.warn("Nothing selected, can't validate, returning nothing.");
        return;
      }
      var n = e.data(this[0], "validator");
      return n
        ? n
        : (this.attr("novalidate", "novalidate"),
          (n = new e.validator(t, this[0])),
          e.data(this[0], "validator", n),
          n.settings.onsubmit &&
            (this.validateDelegate(":submit", "click", function (t) {
              (n.settings.submitHandler && (n.submitButton = t.target),
                e(t.target).hasClass("cancel") && (n.cancelSubmit = !0));
            }),
            this.submit(function (t) {
              function r() {
                var r;
                return n.settings.submitHandler
                  ? (n.submitButton &&
                      (r = e("<input type='hidden'/>")
                        .attr("name", n.submitButton.name)
                        .val(n.submitButton.value)
                        .appendTo(n.currentForm)),
                    n.settings.submitHandler.call(n, n.currentForm, t),
                    n.submitButton && r.remove(),
                    !1)
                  : !0;
              }
              return (
                n.settings.debug && t.preventDefault(),
                n.cancelSubmit
                  ? ((n.cancelSubmit = !1), r())
                  : n.form()
                    ? n.pendingRequest
                      ? ((n.formSubmitted = !0), !1)
                      : r()
                    : (n.focusInvalid(), !1)
              );
            })),
          n);
    },
    valid: function () {
      if (e(this[0]).is("form")) return this.validate().form();
      var t = !0,
        n = e(this[0].form).validate();
      return (
        this.each(function () {
          t &= n.element(this);
        }),
        t
      );
    },
    removeAttrs: function (t) {
      var n = {},
        r = this;
      return (
        e.each(t.split(/\s/), function (e, t) {
          ((n[t] = r.attr(t)), r.removeAttr(t));
        }),
        n
      );
    },
    rules: function (t, n) {
      var r = this[0];
      if (t) {
        var i = e.data(r.form, "validator").settings,
          s = i.rules,
          o = e.validator.staticRules(r);
        switch (t) {
          case "add":
            (e.extend(o, e.validator.normalizeRule(n)),
              (s[r.name] = o),
              n.messages &&
                (i.messages[r.name] = e.extend(
                  i.messages[r.name],
                  n.messages,
                )));
            break;
          case "remove":
            if (!n) return (delete s[r.name], o);
            var u = {};
            return (
              e.each(n.split(/\s/), function (e, t) {
                ((u[t] = o[t]), delete o[t]);
              }),
              u
            );
        }
      }
      var a = e.validator.normalizeRules(
        e.extend(
          {},
          e.validator.classRules(r),
          e.validator.attributeRules(r),
          e.validator.dataRules(r),
          e.validator.staticRules(r),
        ),
        r,
      );
      if (a.required) {
        var f = a.required;
        (delete a.required, (a = e.extend({ required: f }, a)));
      }
      return a;
    },
  }),
    e.extend(e.expr[":"], {
      blank: function (t) {
        return !e.trim("" + t.value);
      },
      filled: function (t) {
        return !!e.trim("" + t.value);
      },
      unchecked: function (e) {
        return !e.checked;
      },
    }),
    (e.validator = function (t, n) {
      ((this.settings = e.extend(!0, {}, e.validator.defaults, t)),
        (this.currentForm = n),
        this.init());
    }),
    (e.validator.format = function (t, n) {
      return arguments.length === 1
        ? function () {
            var n = e.makeArray(arguments);
            return (n.unshift(t), e.validator.format.apply(this, n));
          }
        : (arguments.length > 2 &&
            n.constructor !== Array &&
            (n = e.makeArray(arguments).slice(1)),
          n.constructor !== Array && (n = [n]),
          e.each(n, function (e, n) {
            t = t.replace(new RegExp("\\{" + e + "\\}", "g"), function () {
              return n;
            });
          }),
          t);
    }),
    e.extend(e.validator, {
      defaults: {
        messages: {},
        groups: {},
        rules: {},
        errorClass: "error",
        validClass: "valid",
        errorElement: "label",
        focusInvalid: !0,
        errorContainer: e([]),
        errorLabelContainer: e([]),
        onsubmit: !0,
        ignore: ":hidden",
        ignoreTitle: !1,
        onfocusin: function (e, t) {
          ((this.lastActive = e),
            this.settings.focusCleanup &&
              !this.blockFocusCleanup &&
              (this.settings.unhighlight &&
                this.settings.unhighlight.call(
                  this,
                  e,
                  this.settings.errorClass,
                  this.settings.validClass,
                ),
              this.addWrapper(this.errorsFor(e)).hide()));
        },
        onfocusout: function (e, t) {
          !this.checkable(e) &&
            (e.name in this.submitted || !this.optional(e)) &&
            this.element(e);
        },
        onkeyup: function (e, t) {
          if (t.which === 9 && this.elementValue(e) === "") return;
          (e.name in this.submitted || e === this.lastElement) &&
            this.element(e);
        },
        onclick: function (e, t) {
          e.name in this.submitted
            ? this.element(e)
            : e.parentNode.name in this.submitted && this.element(e.parentNode);
        },
        highlight: function (t, n, r) {
          t.type === "radio"
            ? this.findByName(t.name).addClass(n).removeClass(r)
            : e(t).addClass(n).removeClass(r);
        },
        unhighlight: function (t, n, r) {
          t.type === "radio"
            ? this.findByName(t.name).removeClass(n).addClass(r)
            : e(t).removeClass(n).addClass(r);
        },
      },
      setDefaults: function (t) {
        e.extend(e.validator.defaults, t);
      },
      messages: {
        required: "This field is required.",
        remote: "Please fix this field.",
        email: "Please enter a valid email address.",
        url: "Please enter a valid URL.",
        date: "Please enter a valid date.",
        dateISO: "Please enter a valid date (ISO).",
        number: "Please enter a valid number.",
        digits: "Please enter only digits.",
        creditcard: "Please enter a valid credit card number.",
        equalTo: "Please enter the same value again.",
        maxlength: e.validator.format(
          "Please enter no more than {0} characters.",
        ),
        minlength: e.validator.format("Please enter at least {0} characters."),
        rangelength: e.validator.format(
          "Please enter a value between {0} and {1} characters long.",
        ),
        range: e.validator.format("Please enter a value between {0} and {1}."),
        max: e.validator.format(
          "Please enter a value less than or equal to {0}.",
        ),
        min: e.validator.format(
          "Please enter a value greater than or equal to {0}.",
        ),
      },
      autoCreateRanges: !1,
      prototype: {
        init: function () {
          function r(t) {
            var n = e.data(this[0].form, "validator"),
              r = "on" + t.type.replace(/^validate/, "");
            n.settings[r] && n.settings[r].call(n, this[0], t);
          }
          ((this.labelContainer = e(this.settings.errorLabelContainer)),
            (this.errorContext =
              (this.labelContainer.length && this.labelContainer) ||
              e(this.currentForm)),
            (this.containers = e(this.settings.errorContainer).add(
              this.settings.errorLabelContainer,
            )),
            (this.submitted = {}),
            (this.valueCache = {}),
            (this.pendingRequest = 0),
            (this.pending = {}),
            (this.invalid = {}),
            this.reset());
          var t = (this.groups = {});
          e.each(this.settings.groups, function (n, r) {
            (typeof r == "string" && (r = r.split(/\s/)),
              e.each(r, function (e, r) {
                t[r] = n;
              }));
          });
          var n = this.settings.rules;
          (e.each(n, function (t, r) {
            n[t] = e.validator.normalizeRule(r);
          }),
            e(this.currentForm)
              .validateDelegate(
                ":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'] ,[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'] ",
                "focusin focusout keyup",
                r,
              )
              .validateDelegate(
                "[type='radio'], [type='checkbox'], select, option",
                "click",
                r,
              ),
            this.settings.invalidHandler &&
              e(this.currentForm).bind(
                "invalid-form.validate",
                this.settings.invalidHandler,
              ));
        },
        form: function () {
          return (
            this.checkForm(),
            e.extend(this.submitted, this.errorMap),
            (this.invalid = e.extend({}, this.errorMap)),
            this.valid() ||
              e(this.currentForm).triggerHandler("invalid-form", [this]),
            this.showErrors(),
            this.valid()
          );
        },
        checkForm: function () {
          this.prepareForm();
          for (
            var e = 0, t = (this.currentElements = this.elements());
            t[e];
            e++
          )
            this.check(t[e]);
          return this.valid();
        },
        element: function (t) {
          ((t = this.validationTargetFor(this.clean(t))),
            (this.lastElement = t),
            this.prepareElement(t),
            (this.currentElements = e(t)));
          var n = this.check(t) !== !1;
          return (
            n ? delete this.invalid[t.name] : (this.invalid[t.name] = !0),
            this.numberOfInvalids() ||
              (this.toHide = this.toHide.add(this.containers)),
            this.showErrors(),
            n
          );
        },
        showErrors: function (t) {
          if (t) {
            (e.extend(this.errorMap, t), (this.errorList = []));
            for (var n in t)
              this.errorList.push({
                message: t[n],
                element: this.findByName(n)[0],
              });
            this.successList = e.grep(this.successList, function (e) {
              return !(e.name in t);
            });
          }
          this.settings.showErrors
            ? this.settings.showErrors.call(this, this.errorMap, this.errorList)
            : this.defaultShowErrors();
        },
        resetForm: function () {
          (e.fn.resetForm && e(this.currentForm).resetForm(),
            (this.submitted = {}),
            (this.lastElement = null),
            this.prepareForm(),
            this.hideErrors(),
            this.elements()
              .removeClass(this.settings.errorClass)
              .removeData("previousValue"));
        },
        numberOfInvalids: function () {
          return this.objectLength(this.invalid);
        },
        objectLength: function (e) {
          var t = 0;
          for (var n in e) t++;
          return t;
        },
        hideErrors: function () {
          this.addWrapper(this.toHide).hide();
        },
        valid: function () {
          return this.size() === 0;
        },
        size: function () {
          return this.errorList.length;
        },
        focusInvalid: function () {
          if (this.settings.focusInvalid)
            try {
              e(
                this.findLastActive() ||
                  (this.errorList.length && this.errorList[0].element) ||
                  [],
              )
                .filter(":visible")
                .focus()
                .trigger("focusin");
            } catch (t) {}
        },
        findLastActive: function () {
          var t = this.lastActive;
          return (
            t &&
            e.grep(this.errorList, function (e) {
              return e.element.name === t.name;
            }).length === 1 &&
            t
          );
        },
        elements: function () {
          var t = this,
            n = {};
          return e(this.currentForm)
            .find("input, select, textarea")
            .not(":submit, :reset, :image, [disabled]")
            .not(this.settings.ignore)
            .filter(function () {
              return (
                !this.name &&
                  t.settings.debug &&
                  window.console &&
                  console.error("%o has no name assigned", this),
                this.name in n || !t.objectLength(e(this).rules())
                  ? !1
                  : ((n[this.name] = !0), !0)
              );
            });
        },
        clean: function (t) {
          return e(t)[0];
        },
        errors: function () {
          var t = this.settings.errorClass.replace(" ", ".");
          return e(this.settings.errorElement + "." + t, this.errorContext);
        },
        reset: function () {
          ((this.successList = []),
            (this.errorList = []),
            (this.errorMap = {}),
            (this.toShow = e([])),
            (this.toHide = e([])),
            (this.currentElements = e([])));
        },
        prepareForm: function () {
          (this.reset(), (this.toHide = this.errors().add(this.containers)));
        },
        prepareElement: function (e) {
          (this.reset(), (this.toHide = this.errorsFor(e)));
        },
        elementValue: function (t) {
          var n = e(t).attr("type"),
            r = e(t).val();
          return n === "radio" || n === "checkbox"
            ? e("input[name='" + e(t).attr("name") + "']:checked").val()
            : typeof r == "string"
              ? r.replace(/\r/g, "")
              : r;
        },
        check: function (t) {
          t = this.validationTargetFor(this.clean(t));
          var n = e(t).rules(),
            r = !1,
            i = this.elementValue(t),
            s;
          for (var o in n) {
            var u = { method: o, parameters: n[o] };
            try {
              s = e.validator.methods[o].call(this, i, t, u.parameters);
              if (s === "dependency-mismatch") {
                r = !0;
                continue;
              }
              r = !1;
              if (s === "pending") {
                this.toHide = this.toHide.not(this.errorsFor(t));
                return;
              }
              if (!s) return (this.formatAndAdd(t, u), !1);
            } catch (a) {
              throw (
                this.settings.debug &&
                  window.console &&
                  console.log(
                    "Exception occured when checking element " +
                      t.id +
                      ", check the '" +
                      u.method +
                      "' method.",
                    a,
                  ),
                a
              );
            }
          }
          if (r) return;
          return (this.objectLength(n) && this.successList.push(t), !0);
        },
        customDataMessage: function (t, n) {
          return (
            e(t).data("msg-" + n.toLowerCase()) ||
            (t.attributes && e(t).attr("data-msg-" + n.toLowerCase()))
          );
        },
        customMessage: function (e, t) {
          var n = this.settings.messages[e];
          return n && (n.constructor === String ? n : n[t]);
        },
        findDefined: function () {
          for (var e = 0; e < arguments.length; e++)
            if (arguments[e] !== undefined) return arguments[e];
          return undefined;
        },
        defaultMessage: function (t, n) {
          return this.findDefined(
            this.customMessage(t.name, n),
            this.customDataMessage(t, n),
            (!this.settings.ignoreTitle && t.title) || undefined,
            e.validator.messages[n],
            "<strong>Warning: No message defined for " + t.name + "</strong>",
          );
        },
        formatAndAdd: function (t, n) {
          var r = this.defaultMessage(t, n.method),
            i = /\$?\{(\d+)\}/g;
          (typeof r == "function"
            ? (r = r.call(this, n.parameters, t))
            : i.test(r) &&
              (r = e.validator.format(r.replace(i, "{$1}"), n.parameters)),
            this.errorList.push({ message: r, element: t }),
            (this.errorMap[t.name] = r),
            (this.submitted[t.name] = r));
        },
        addWrapper: function (e) {
          return (
            this.settings.wrapper &&
              (e = e.add(e.parent(this.settings.wrapper))),
            e
          );
        },
        defaultShowErrors: function () {
          var e, t;
          for (e = 0; this.errorList[e]; e++) {
            var n = this.errorList[e];
            (this.settings.highlight &&
              this.settings.highlight.call(
                this,
                n.element,
                this.settings.errorClass,
                this.settings.validClass,
              ),
              this.showLabel(n.element, n.message));
          }
          this.errorList.length &&
            (this.toShow = this.toShow.add(this.containers));
          if (this.settings.success)
            for (e = 0; this.successList[e]; e++)
              this.showLabel(this.successList[e]);
          if (this.settings.unhighlight)
            for (e = 0, t = this.validElements(); t[e]; e++)
              this.settings.unhighlight.call(
                this,
                t[e],
                this.settings.errorClass,
                this.settings.validClass,
              );
          ((this.toHide = this.toHide.not(this.toShow)),
            this.hideErrors(),
            this.addWrapper(this.toShow).show());
        },
        validElements: function () {
          return this.currentElements.not(this.invalidElements());
        },
        invalidElements: function () {
          return e(this.errorList).map(function () {
            return this.element;
          });
        },
        showLabel: function (t, n) {
          var r = this.errorsFor(t);
          (r.length
            ? (r
                .removeClass(this.settings.validClass)
                .addClass(this.settings.errorClass),
              r.html(n))
            : ((r = e("<" + this.settings.errorElement + ">")
                .attr("for", this.idOrName(t))
                .addClass(this.settings.errorClass)
                .html(n || "")),
              this.settings.wrapper &&
                (r = r
                  .hide()
                  .show()
                  .wrap("<" + this.settings.wrapper + "/>")
                  .parent()),
              this.labelContainer.append(r).length ||
                (this.settings.errorPlacement
                  ? this.settings.errorPlacement(r, e(t))
                  : r.insertAfter(t))),
            !n &&
              this.settings.success &&
              (r.text(""),
              typeof this.settings.success == "string"
                ? r.addClass(this.settings.success)
                : this.settings.success(r, t)),
            (this.toShow = this.toShow.add(r)));
        },
        errorsFor: function (t) {
          var n = this.idOrName(t);
          return this.errors().filter(function () {
            return e(this).attr("for") === n;
          });
        },
        idOrName: function (e) {
          return (
            this.groups[e.name] || (this.checkable(e) ? e.name : e.id || e.name)
          );
        },
        validationTargetFor: function (e) {
          return (
            this.checkable(e) &&
              (e = this.findByName(e.name).not(this.settings.ignore)[0]),
            e
          );
        },
        checkable: function (e) {
          return /radio|checkbox/i.test(e.type);
        },
        findByName: function (t) {
          return e(this.currentForm).find("[name='" + t + "']");
        },
        getLength: function (t, n) {
          switch (n.nodeName.toLowerCase()) {
            case "select":
              return e("option:selected", n).length;
            case "input":
              if (this.checkable(n))
                return this.findByName(n.name).filter(":checked").length;
          }
          return t.length;
        },
        depend: function (e, t) {
          return this.dependTypes[typeof e]
            ? this.dependTypes[typeof e](e, t)
            : !0;
        },
        dependTypes: {
          boolean: function (e, t) {
            return e;
          },
          string: function (t, n) {
            return !!e(t, n.form).length;
          },
          function: function (e, t) {
            return e(t);
          },
        },
        optional: function (t) {
          var n = this.elementValue(t);
          return (
            !e.validator.methods.required.call(this, n, t) &&
            "dependency-mismatch"
          );
        },
        startRequest: function (e) {
          this.pending[e.name] ||
            (this.pendingRequest++, (this.pending[e.name] = !0));
        },
        stopRequest: function (t, n) {
          (this.pendingRequest--,
            this.pendingRequest < 0 && (this.pendingRequest = 0),
            delete this.pending[t.name],
            n && this.pendingRequest === 0 && this.formSubmitted && this.form()
              ? (e(this.currentForm).submit(), (this.formSubmitted = !1))
              : !n &&
                this.pendingRequest === 0 &&
                this.formSubmitted &&
                (e(this.currentForm).triggerHandler("invalid-form", [this]),
                (this.formSubmitted = !1)));
        },
        previousValue: function (t) {
          return (
            e.data(t, "previousValue") ||
            e.data(t, "previousValue", {
              old: null,
              valid: !0,
              message: this.defaultMessage(t, "remote"),
            })
          );
        },
      },
      classRuleSettings: {
        required: { required: !0 },
        email: { email: !0 },
        url: { url: !0 },
        date: { date: !0 },
        dateISO: { dateISO: !0 },
        number: { number: !0 },
        digits: { digits: !0 },
        creditcard: { creditcard: !0 },
      },
      addClassRules: function (t, n) {
        t.constructor === String
          ? (this.classRuleSettings[t] = n)
          : e.extend(this.classRuleSettings, t);
      },
      classRules: function (t) {
        var n = {},
          r = e(t).attr("class");
        return (
          r &&
            e.each(r.split(" "), function () {
              this in e.validator.classRuleSettings &&
                e.extend(n, e.validator.classRuleSettings[this]);
            }),
          n
        );
      },
      attributeRules: function (t) {
        var n = {},
          r = e(t);
        for (var i in e.validator.methods) {
          var s;
          (i === "required"
            ? ((s = r.get(0).getAttribute(i)), s === "" && (s = !0), (s = !!s))
            : (s = r.attr(i)),
            s ? (n[i] = s) : r[0].getAttribute("type") === i && (n[i] = !0));
        }
        return (
          n.maxlength &&
            /-1|2147483647|524288/.test(n.maxlength) &&
            delete n.maxlength,
          n
        );
      },
      dataRules: function (t) {
        var n,
          r,
          i = {},
          s = e(t);
        for (n in e.validator.methods)
          ((r = s.data("rule-" + n.toLowerCase())),
            r !== undefined && (i[n] = r));
        return i;
      },
      staticRules: function (t) {
        var n = {},
          r = e.data(t.form, "validator");
        return (
          r.settings.rules &&
            (n = e.validator.normalizeRule(r.settings.rules[t.name]) || {}),
          n
        );
      },
      normalizeRules: function (t, n) {
        return (
          e.each(t, function (r, i) {
            if (i === !1) {
              delete t[r];
              return;
            }
            if (i.param || i.depends) {
              var s = !0;
              switch (typeof i.depends) {
                case "string":
                  s = !!e(i.depends, n.form).length;
                  break;
                case "function":
                  s = i.depends.call(n, n);
              }
              s ? (t[r] = i.param !== undefined ? i.param : !0) : delete t[r];
            }
          }),
          e.each(t, function (r, i) {
            t[r] = e.isFunction(i) ? i(n) : i;
          }),
          e.each(["minlength", "maxlength"], function () {
            t[this] && (t[this] = Number(t[this]));
          }),
          e.each(["rangelength"], function () {
            var n;
            t[this] &&
              (e.isArray(t[this])
                ? (t[this] = [Number(t[this][0]), Number(t[this][1])])
                : typeof t[this] == "string" &&
                  ((n = t[this].split(/[\s,]+/)),
                  (t[this] = [Number(n[0]), Number(n[1])])));
          }),
          e.validator.autoCreateRanges &&
            (t.min &&
              t.max &&
              ((t.range = [t.min, t.max]), delete t.min, delete t.max),
            t.minlength &&
              t.maxlength &&
              ((t.rangelength = [t.minlength, t.maxlength]),
              delete t.minlength,
              delete t.maxlength)),
          t
        );
      },
      normalizeRule: function (t) {
        if (typeof t == "string") {
          var n = {};
          (e.each(t.split(/\s/), function () {
            n[this] = !0;
          }),
            (t = n));
        }
        return t;
      },
      addMethod: function (t, n, r) {
        ((e.validator.methods[t] = n),
          (e.validator.messages[t] =
            r !== undefined ? r : e.validator.messages[t]),
          n.length < 3 &&
            e.validator.addClassRules(t, e.validator.normalizeRule(t)));
      },
      methods: {
        required: function (t, n, r) {
          if (!this.depend(r, n)) return "dependency-mismatch";
          if (n.nodeName.toLowerCase() === "select") {
            var i = e(n).val();
            return i && i.length > 0;
          }
          return this.checkable(n)
            ? this.getLength(t, n) > 0
            : e.trim(t).length > 0;
        },
        remote: function (t, n, r) {
          if (this.optional(n)) return "dependency-mismatch";
          var i = this.previousValue(n);
          (this.settings.messages[n.name] ||
            (this.settings.messages[n.name] = {}),
            (i.originalMessage = this.settings.messages[n.name].remote),
            (this.settings.messages[n.name].remote = i.message),
            (r = (typeof r == "string" && { url: r }) || r));
          if (i.old === t) return i.valid;
          i.old = t;
          var s = this;
          this.startRequest(n);
          var o = {};
          return (
            (o[n.name] = t),
            e.ajax(
              e.extend(
                !0,
                {
                  url: r,
                  mode: "abort",
                  port: "validate" + n.name,
                  dataType: "json",
                  data: o,
                  success: function (r) {
                    s.settings.messages[n.name].remote = i.originalMessage;
                    var o = r === !0 || r === "true";
                    if (o) {
                      var u = s.formSubmitted;
                      (s.prepareElement(n),
                        (s.formSubmitted = u),
                        s.successList.push(n),
                        delete s.invalid[n.name],
                        s.showErrors());
                    } else {
                      var a = {},
                        f = r || s.defaultMessage(n, "remote");
                      ((a[n.name] = i.message = e.isFunction(f) ? f(t) : f),
                        (s.invalid[n.name] = !0),
                        s.showErrors(a));
                    }
                    ((i.valid = o), s.stopRequest(n, o));
                  },
                },
                r,
              ),
            ),
            "pending"
          );
        },
        minlength: function (t, n, r) {
          var i = e.isArray(t) ? t.length : this.getLength(e.trim(t), n);
          return this.optional(n) || i >= r;
        },
        maxlength: function (t, n, r) {
          var i = e.isArray(t) ? t.length : this.getLength(e.trim(t), n);
          return this.optional(n) || i <= r;
        },
        rangelength: function (t, n, r) {
          var i = e.isArray(t) ? t.length : this.getLength(e.trim(t), n);
          return this.optional(n) || (i >= r[0] && i <= r[1]);
        },
        min: function (e, t, n) {
          return this.optional(t) || e >= n;
        },
        max: function (e, t, n) {
          return this.optional(t) || e <= n;
        },
        range: function (e, t, n) {
          return this.optional(t) || (e >= n[0] && e <= n[1]);
        },
        email: function (e, t) {
          return (
            this.optional(t) ||
            /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(
              e,
            )
          );
        },
        url: function (e, t) {
          return (
            this.optional(t) ||
            /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(
              e,
            )
          );
        },
        date: function (e, t) {
          return (
            this.optional(t) || !/Invalid|NaN/.test(new Date(e).toString())
          );
        },
        dateISO: function (e, t) {
          return (
            this.optional(t) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(e)
          );
        },
        number: function (e, t) {
          return (
            this.optional(t) ||
            /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(e)
          );
        },
        digits: function (e, t) {
          return this.optional(t) || /^\d+$/.test(e);
        },
        creditcard: function (e, t) {
          if (this.optional(t)) return "dependency-mismatch";
          if (/[^0-9 \-]+/.test(e)) return !1;
          var n = 0,
            r = 0,
            i = !1;
          e = e.replace(/\D/g, "");
          for (var s = e.length - 1; s >= 0; s--) {
            var o = e.charAt(s);
            ((r = parseInt(o, 10)),
              i && (r *= 2) > 9 && (r -= 9),
              (n += r),
              (i = !i));
          }
          return n % 10 === 0;
        },
        equalTo: function (t, n, r) {
          var i = e(r);
          return (
            this.settings.onfocusout &&
              i
                .unbind(".validate-equalTo")
                .bind("blur.validate-equalTo", function () {
                  e(n).valid();
                }),
            t === i.val()
          );
        },
      },
    }),
    (e.format = e.validator.format));
})(jQuery),
  (function (e) {
    var t = {};
    if (e.ajaxPrefilter)
      e.ajaxPrefilter(function (e, n, r) {
        var i = e.port;
        e.mode === "abort" && (t[i] && t[i].abort(), (t[i] = r));
      });
    else {
      var n = e.ajax;
      e.ajax = function (r) {
        var i = ("mode" in r ? r : e.ajaxSettings).mode,
          s = ("port" in r ? r : e.ajaxSettings).port;
        return i === "abort"
          ? (t[s] && t[s].abort(), (t[s] = n.apply(this, arguments)))
          : n.apply(this, arguments);
      };
    }
  })(jQuery),
  (function (e) {
    e.extend(e.fn, {
      validateDelegate: function (t, n, r) {
        return this.bind(n, function (n) {
          var i = e(n.target);
          if (i.is(t)) return r.apply(i, arguments);
        });
      },
    });
  })(jQuery));
