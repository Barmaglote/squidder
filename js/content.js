function App() {
  this.body = $("body");
  this.newMsg = "Иноагенты - наши друзья";
  this.cutContainer = ".please-delete-this-banner";
  this.customClass = "rkn-please-delete";
  this.originBlockType = "full"; // full | part
  this.newBlockType = "part"; // full | part
  this.inoagents = this.GetAgents();
  this.templates = ["АННОЕ", "анное", "агента", "АГЕНТ", "ИНОСТРАН", "иностран"];
  this.filters = [
    /(данное[\s\S]*?юридическим[\s\S]*?иностранного[\s\S]*?агента[\.]?)/iu,
    /(данное.*иностранного.*агента[\.]?)/isu,
    /(НКО.*иностранного.*агента[\.]?)/isu,
    /(СМИ.*иностранного.*агента[\.]?)/isu,
    /(незарегистрированно.*объединение.*признанное.*иноагентом[\.]?)/isu,
    /(СМИ.*признанное.*иностранным[\s]?агентом[\.]?)/isu,
    /(физлицо.*признанное.*иностранным[\s]?агентом[\.]?)/isu,
    /(ДАННОЕ.*ИНОСТРАННОГО.*АГЕНТА[\.]?)/is,
    /(Данное[\s\S]*?иностранного[\s\S]*?агента[\s\S]*?иностранного[\s\S]*?агента[\.]?)/giu,
    /(незарегистрированное[\s\S]*?общественное[\s\S]*?объединение,[\s\S]*?признанное[\s\S]*?иноагентом)/giu,
  ];

  this.freedomMsg =
    '<div class="squidder-btn-group" role="group" aria-label="Basic example">\
      <button type="button" class="squidder-btn squidder-btn-primary">\
        ' +
    this.newMsg +
    '</button>\
      <button type="button" class="squidder-btn squidder-btn-primary squidder-close">\
        <span aria-hidden="true">&times;</span>\
      </button>\
    </div>';
}

App.prototype.CutContainer = function () {
  var self = this;
  $(this.cutContainer).each(function () {
    var obj = $(this);
    obj.html(self.newBlockType == "full" ? "" : self.freedomMsg);
  });
};

App.prototype.ClearByList = function () {
  var self = this;

  var isApplied = false;

  // Custom approach
  if (this.inoagents != null) {
    return false;
  }

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

  return isApplied;
};

App.prototype.ClearByKeyword = function (keyword) {
  var self = this;
  let suspicious = getSuspects(initialSuspects(keyword), this.filters);

  if (suspicious == null || suspicious.length == 0) {
    return;
  }

  updateSuspects(getNewMsg(this.newBlockType, this.freedomMsg), this.filters.slice())(suspicious);
};

App.prototype.GetAgents = function () {
  var agents = [
    {
      urls: ["republic.ru"],
      selectorsFull: [".ino_agent"],
      selectorsPartial: [".ino_agent"],
    },
    {
      urls: ["tvrain.ru"],
      selectorsFull: [".menu3__foreign-agent-text", ".menu2__foreign-agent-text"],
      selectorsPartial: [".menu3__foreign-agent-text", ".menu2__foreign-agent-text"],
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
    .on("click", () => {
      $(this).parent(".squidder-btn-group").remove();
    });
};

$(document).ready(function () {
  var app = app || new App();

  app.CutContainer();
  app.ClearByList();
  app.templates.forEach((item) => {
    app.ClearByKeyword(item);
  });
  app.SetHandlers();
});

const matchToPattern = (text) => (item) => item.test(text);
const presentsInTemplates = (text) => (item) => item.test(text);
const filter = (checker) => (list) => list.filter(checker);
const filterByPattern = (input, text) => filter(matchToPattern(text))(input);
const initialSuspects = (keyword) => $("body :contains(" + keyword + "):last");
const isSuspect = (filters, text) => filterByPattern(filters, text).length > 0;

const getSuspects = (list, filters) =>
  list.each((item) => {
    let text = $(item).text();
    return isSuspect(filters, text);
  });

const updateSuspects = (msg, filters) => (list) =>
  list.each(function () {
    var obj = $(this);
    let text = obj.text();
    filters.forEach((item) => {
      if (!matchToPattern(text)(item)) {
        return;
      }

      try {
        obj.html(text.replace(item, msg));
      } catch (e) {}
    });
  });

const getNewMsg = (newBlockType, freedomMsg) => (newBlockType == "full" ? "" : freedomMsg);
