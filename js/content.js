function App() {
  this.body = $("body");
  this.customClass = "rkn-please-delete";
  this.originBlockType = "full"; // full | part
  this.newBlockType = "part"; // full | part
  this.inoagents = this.GetAgents();
  this.startingTemplates = ["АННОЕ", "анное"];
  this.rknMsg =
    /.*Данноесообщениематериалсозданоиилираспространеноиностраннымсредствоммассовойинформациивыполняющимфункциииностранногоагентаиилироссийскимюридическимлицомвыполняющимфункциииностранногоагента.*/;
  //"Данное сообщение (материал) создано и (или) распространено иностранным средством массовой информации, выполняющим функции иностранного агента, и (или) российским юридическим лицом, выполняющим функции иностранного агента";
  this.freedomMsg = '<span class="squidder-substituter">Иностранные агенты - это наши друзья</span>';
}

App.prototype.CleanFromRKNText = function () {
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

  if (isApplied) return;

  // Basic approach
  this.startingTemplates.forEach(function (template) {
    self.body.find(":сontains(" + template + "):last").each(function () {
      var obj = $(this);
      var text = $(this).text();
      var text = text.replace(/[^а-яА-Яё]/g, "");
      console.log(text);
      if (self.rknMsg.test(text)) {
        self.HideRKNBar(obj);
      }
    });
  });
};

App.prototype.HideRKNBar = function (item) {
  if (item == null) {
    return;
  }

  try {
    item.html(this.newBlockType == "full" ? "" : this.freedomMsg);
  } catch (e) {
    console.log(e);
  }
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

window.onload = function () {
  var app = app || new App();
  app.CleanFromRKNText();
};
