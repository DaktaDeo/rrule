// Generated by CoffeeScript 1.11.1
(function() {
  var getFormValues, getOptionsCode, makeRows;

  getFormValues = function($form) {
    var paramObj;
    paramObj = {};
    $.each($form.serializeArray(), function(_, kv) {
      if (paramObj.hasOwnProperty(kv.name)) {
        paramObj[kv.name] = $.makeArray(paramObj[kv.name]);
        return paramObj[kv.name].push(kv.value);
      } else {
        return paramObj[kv.name] = kv.value;
      }
    });
    return paramObj;
  };

  getOptionsCode = function(options) {
    var days, items, k, v;
    days = ["RRule.MO", "RRule.TU", "RRule.WE", "RRule.TH", "RRule.FR", "RRule.SA", "RRule.SU"];
    items = (function() {
      var results;
      results = [];
      for (k in options) {
        v = options[k];
        if (v === null) {
          v = 'null';
        } else if (k === 'freq') {
          v = 'RRule.' + RRule.FREQUENCIES[v];
        } else if (k === "dtstart" || k === "until") {
          v = "new Date(" + [v.getFullYear(), v.getMonth(), v.getDate(), v.getHours(), v.getMinutes(), v.getSeconds()].join(', ') + ")";
        } else if (k === "byweekday") {
          if (v instanceof Array) {
            v = v.map(function(wday) {
              var s;
              console.log('wday', wday);
              s = days[wday.weekday];
              if (wday.n) {
                s += '.nth(' + wday.n + ')';
              }
              return s;
            });
          } else {
            v = days[v.weekday];
          }
        } else if (k === "wkst") {
          if (v === RRule.MO) {
            continue;
          }
          v = days[v.weekday];
        }
        if (v instanceof Array) {
          v = '[' + v.join(', ') + ']';
        }
        console.log(k, ' =', v);
        results.push(k + ": " + v);
      }
      return results;
    })();
    return "{\n  " + (items.join(',\n  ')) + "\n}";
  };

  makeRows = function(dates) {
    var cells, cls, date, i, index, part, parts, prevParts, prevStates, rows, states;
    prevParts = [];
    prevStates = [];
    index = 1;
    rows = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = dates.length; j < len; j++) {
        date = dates[j];
        states = [];
        parts = date.toString().split(' ');
        cells = (function() {
          var l, len1, results1;
          results1 = [];
          for (i = l = 0, len1 = parts.length; l < len1; i = ++l) {
            part = parts[i];
            if (part !== prevParts[i]) {
              states[i] = !prevStates[i];
            } else {
              states[i] = prevStates[i];
            }
            cls = states[i] ? 'a' : 'b';
            results1.push("<td class='" + cls + "'>" + part + "</td>");
          }
          return results1;
        })();
        prevParts = parts;
        prevStates = states;
        results.push("<tr><td>" + (index++) + "</td>" + (cells.join('\n')) + "</tr>");
      }
      return results;
    })();
    return rows.join('\n\n');
  };

  $(function() {
    var $tabs, activateTab, processHash;
    $tabs = $("#tabs");
    activateTab = function($a) {
      var id;
      id = $a.attr("href").split("#")[1];
      $tabs.find("a").removeClass("active");
      $a.addClass("active");
      $("#input-types section").hide();
      return $("#input-types #" + id).show().find("input:first").focus().change();
    };
    $("#input-types section").hide().each(function() {
      return $("<a />", {
        href: "#" + $(this).attr("id")
      }).text($(this).find("h3").hide().text()).appendTo($tabs).on("click", function() {
        activateTab($(this));
        return false;
      });
    });
    $(".examples code").on("click", function() {
      var $code;
      $code = $(this);
      return $code.parents("section:first").find("input").val($code.text()).change();
    });
    $("input, select").on('keyup change', function() {
      var $in, $section, date, dates, days, e, getDay, html, init, inputMethod, key, makeRule, max, options, rfc, rule, text, v, value, values;
      $in = $(this);
      $section = $in.parents("section:first");
      inputMethod = $section.attr("id").split("-")[0];
      switch (inputMethod) {
        case "text":
          makeRule = function() {
            return RRule.fromText($in.val());
          };
          init = "RRule.fromText(\"" + this.value + "\")";
          break;
        case "rfc":
          makeRule = (function(_this) {
            return function() {
              return RRule.fromString(_this.value);
            };
          })(this);
          init = "RRule.fromString(\"" + this.value + "\")";
          break;
        case 'options':
          values = getFormValues($in.parents("form"));
          options = {};
          days = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
          getDay = function(i) {
            return days[i];
          };
          for (key in values) {
            value = values[key];
            if (!value) {
              continue;
            } else if (key === 'dtstart' || key === 'until') {
              date = new Date(Date.parse(value));
              value = new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000));
            } else if (key === 'byweekday') {
              if (value instanceof Array) {
                value = value.map(getDay);
              } else {
                value = getDay(value);
              }
            } else if (/^by/.test(key)) {
              if (!(value instanceof Array)) {
                value = value.split(/[,\s]+/);
              }
              value = (function() {
                var j, len, results;
                results = [];
                for (j = 0, len = value.length; j < len; j++) {
                  v = value[j];
                  if (v) {
                    results.push(v);
                  }
                }
                return results;
              })();
              value = value.map(function(n) {
                return parseInt(n, 10);
              });
            } else {
              value = parseInt(value, 10);
            }
            if (key === 'wkst') {
              value = getDay(value);
            }
            if (key === 'interval' && (value === 1 || !value)) {
              continue;
            }
            options[key] = value;
          }
          makeRule = function() {
            return new RRule(options);
          };
          init = "new RRule(" + getOptionsCode(options) + ")";
          console.log(options);
      }
      $("#init").html(init);
      $("#rfc-output a").html("");
      $("#text-output a").html("");
      $("#options-output").html("");
      $("#dates").html("");
      try {
        rule = makeRule();
      } catch (error) {
        e = error;
        $("#init").append($('<pre class="error"/>').text('=> ' + String(e || null)));
        return;
      }
      rfc = rule.toString();
      text = rule.toText();
      $("#rfc-output a").text(rfc).attr('href', "#/rfc/" + rfc);
      $("#text-output a").text(text).attr('href', "#/text/" + text);
      $("#options-output").text(getOptionsCode(rule.origOptions));
      if (inputMethod === 'options') {
        $("#options-output").parents('tr').hide();
      } else {
        $("#options-output").parents('tr').show();
      }
      max = 500;
      dates = rule.all(function(date, i) {
        if (!rule.options.count && i === max) {
          return false;
        }
        return true;
      });
      html = makeRows(dates);
      if (!rule.options.count) {
        html += "<tr><td colspan='7'><em>Showing first " + max + " dates, set\n<code>count</code> to see more.</em></td></tr>";
      }
      return $("#dates").html(html);
    });
    activateTab($tabs.find("a:first"));
    processHash = function() {
      var arg, hash, match, method;
      hash = location.hash.substring(1);
      if (hash) {
        match = /^\/(rfc|text)\/(.+)$/.exec(hash);
        if (match) {
          method = match[1];
          arg = match[2];
          activateTab($("a[href='#" + method + "-input']"));
          return $("#" + method + "-input input:first").val(arg).change();
        }
      }
    };
    processHash();
    return $(window).on('hashchange', processHash);
  });

}).call(this);

//# sourceMappingURL=demo.js.map
