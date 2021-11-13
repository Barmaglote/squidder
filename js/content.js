function App(parameters) {
  this.body = $("body");
  let self = this;
  this.newMsg = parameters?.squidder?.replacementText || "Иноагенты - наши друзья";

  self.freedomMsg = '<div class="squidder-btn-group" role="group" aria-label="Basic example">\
        <button type="button" class="squidder-btn squidder-btn-primary">\
          ' +
    self.newMsg +
    '</button>\
        <button type="button" class="squidder-btn squidder-btn-primary squidder-close">\
          <span aria-hidden="true">&times;</span>\
        </button>\
      </div>';
      
  this.customClass = ".please-delete-this-banner";
  this.originBlockType = "full"; // full | part
  this.newBlockType = parameters?.squidder?.newBlockType || "part";
  this.inoagents = this.GetAgents();
  this.templates = ["агент", "АГЕНТ", "анное", "АННОЕ"];
  this.filters = [
    /(НКО[\s\S]*?иностранного[\s\S]*?агента[\.]?)/isu,
    /(СМИ[\s\S]*?иностранного[\s\S]*?агента[\.]?)/isu,
    /(СМИ.*признанное[\s\S]*?иностранным[\s\S]*?агентом[\.]?)/isu,
    /([Ф|ф]излицо[\s\S]*?признанное[\s\S]*?иностранным[\s\S]*?агентом[\.]?)/isu,
    /(ДАННОЕ[\s\S]*?ИНОСТРАННОГО[\s\S]*?ИНОСТРАННОГО[\s\S]*?АГЕНТА[\.]?)/is,
    /([Д|д]анное[\s\S]*?иностранного[\s\S]*?агента[\s\S]*?иностранного[\s\S]*?агента[\.]?)/giu,
    /([H|н]езарегистрированное[\s\S]*?объединение,[\s\S]*?признанное[\s\S]*?иноагентом)/giu,
  ];
}

App.prototype.CutContainer = function () {
  var self = this;
  var cutted = 0;

  $(this.customClass).each(function () {
    var obj = $(this);

    obj.html(getNewMsg(self.newBlockType, self.freedomMsg));
    cutted++;
  });

  return cutted;
};

App.prototype.ClearByList = function () {
  var self = this;

  // Custom approach
  if (this.inoagents != null) {
    return false;
  }

  let cleared = 0;

  this.inoagents
    .filter(function (item) {
      return item.urls?.indexOf(location.hostname) > -1;
    })
    .forEach(function (item) {
      if (self.originBlockType == "full") {
        item.selectorsFull.forEach((elem) => {
          self.body.find(elem).remove();
          cleared++;
        });
      } else {
        item.selectorsPartial.forEach((elem) => {
          self.HideRKNBar(self.body.find(elem));
          cleared++;
        });
      }
    });

  return cleared;
};

App.prototype.ClearByKeyword = function (keyword) {
  let suspicious = getSuspects(initialSuspects(keyword), this.filters);

  if (suspicious == null || suspicious.length == 0) {
    return;
  }

  let founded = updateSuspects(getNewMsg(this.newBlockType, this.freedomMsg), this.filters.slice())(suspicious);
  return founded;
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
  $(".squidder-close")
    .off("click")
    .on("click", (item) => {
      $(item.currentTarget).parents(".squidder-btn-group").remove();
    });
};

App.prototype.IncrementCounter = function (founded) {
  let self = this;
  chrome.storage.local.get("squidder", async function (result) {
    let newSquidder = result.squidder;
    let current = result.squidder?.total || 0;

    newSquidder.total = (current + founded);
    self.UpdateStorage({squidder : newSquidder});
  });
};

App.prototype.UpdateStorage = function (newSquidder) {
  chrome.storage.local.set(newSquidder, function () {});
};

$(document).ready(function () {

  chrome.storage.local.get("squidder", function (result) {
    var app = app || new App(result);

    processPage(app);

    document.body.onload = function () {
      processPage(app);
    };
  });
});

const processPage = (app) => {
  let founded = 0;
  founded += app.CutContainer();
  founded += app.ClearByList();
  app.templates.forEach((item) => {
    founded += app.ClearByKeyword(item) || 0;
  });
  app.SetHandlers();

  app.IncrementCounter(founded);
};

const matchToPattern = (text) => (item) => item.test(text);
const filter = (checker) => (list) => list.filter(checker);
const filterByPattern = (input, text) => filter(matchToPattern(text))(input);
const initialSuspects = (keyword) => $("body :contains(" + keyword + "):last");
const isSuspect = (filters, text) => filterByPattern(filters, text).length > 0;

const getSuspects = (list, filters) =>
  list.each((item) => {
    let text = $(item).text();
    return isSuspect(filters, text);
  });

const updateSuspects = (msg, filters) => (list) => {
  let founded = 0;

  list.each(function () {
    var obj = $(this);
    let text = obj.text();
    filters.forEach(async (item) => {
      if (!matchToPattern(text)(item)) {
        return;
      }

      try {
        obj.html(text.replace(item, msg));
        founded++;
      } catch (e) {}
    });
  });

  return founded;
};

const getNewMsg = (newBlockType, freedomMsg) => (newBlockType == "full" ? "" : freedomMsg);
