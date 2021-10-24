function App() {
  this.body = $("body");
  this.customClass = "rkn-please-delete";
  this.originBlockType = "full"; // full | part
  this.newBlockType = "part"; // full | part
  this.inoagents = this.GetAgents();
  this.templates = ["АННОЕ", "анное", "агента", "АГЕНТ", "ИНОСТРАН", "иностран"];
  this.filters = [
    /(данное.*иностранного.*агента[\.]?)/isu,
    /(НКО.*иностранного.*агента)/isu,
    /(СМИ.*иностранного.*агента)/isu,
    /(незарегистрированно.*объединение.*признанное.*иноагентом)/isu,
    /(СМИ.*признанное.*иностранным[\s]?агентом)/isu,
    /(физлицо.*признанное.*иностранным[\s]?агентом)/isu,
  ];

  this.freedomMsg =
    '<div class="squidder-btn-group" role="group" aria-label="Basic example">\
      <button type="button" class="squidder-btn squidder-btn-primary">\
        Наш друг\
      </button>\
      <button type="button" class="squidder-btn squidder-btn-primary squidder-close">\
        <span aria-hidden="true">&times;</span>\
      </button>\
    </div>';
}

App.prototype.ClearByList = function () {
  var self = this;

  var isApplied = false;

  // Custom approach
  if (this.inoagents != null) {
    this.inoagents
      .filter(function (item) {
        return item.urls?.indexOf(location.hostname) > -1;
      })
      .forEach(function (item) {
        if (self.originBlockType == "full") {
          item.selectorsFull.forEach((elem) => {
            self.body.find(elem).remove();
          });
        } else {
          item.selectorsPartial.forEach((elem) => {
            self.HideRKNBar(self.body.find(elem));
          });
        }
        isApplied = true;
      });
  }

  return isApplied;
};

App.prototype.ClearByKeyword = function (keyword) {
  var self = this;

  suspicious = $("body :contains(" + keyword + "):last").each(function () {
    var obj = $(this);
    var text = obj.text();
    var result = false;
    self.filters.forEach(function (item) {
      if (item.test(text)) {
        result = true;
      }
    });
  });

  suspicious.each(function () {
    var obj = $(this);
    var text = obj.text();
    self.filters.forEach(function (item) {
      if (item.test(text)) {
        try {
          obj.html(text.replace(item, self.newBlockType == "full" ? "" : self.freedomMsg));
        } catch (e) {}
      }
    });
  });
};

App.prototype.GetAgents = function () {
  var agents = [
    {
      urls: ["republic.ru"],
      selectorsFull: [".ino_agent"],
      selectorsPartial: [".ino_agent"],
    },
    {
      urls: ["zona.media"],
      selectorsFull: [".mz-agent-banner"],
      selectorsPartial: [".mz-agent-banner__text"],
    },
  ];
  return agents;
};

App.prototype.SetHandlers = function () {
  $("body .squidder-close")
    .off("click")
    .on("click", function () {
      $(this).parent(".squidder-btn-group").remove();
    });
};

$(function () {
  var app = app || new App();

  app.ClearByList();
  app.templates.forEach((item) => {
    app.ClearByKeyword(item);
  });
  app.SetHandlers();
});
