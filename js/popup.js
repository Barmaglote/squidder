function App() {
  this.totalContainer = document.getElementById("totalCounterContainer");
  this.replacementText = document.getElementById("replacementText");
  this.newBlockType = document.getElementById("newBlockType");
  this.saveBtn = document.getElementById("saveBtn");
  this.closeBtn = document.getElementById("closeBtn");
  
  this.AddEventListeners();
}

App.prototype.Init = function () {
  const self = this;
  chrome.storage.local.get("squidder", function (result) {
    self.squidderStorage = result?.squidder;
    const total = self.squidderStorage?.total || 0;
    self.totalContainer.innerHTML = total;

    const replacementText = self.squidderStorage?.replacementText || "Иноагенты - наши друзья";
    self.replacementText.value = replacementText;

    const newBlockType = self.squidderStorage?.newBlockType || "part";
    self.newBlockType.checked = (newBlockType == "part");
    self.replacementText.disabled = !self.newBlockType.checked;
  });
};

App.prototype.AddEventListeners = function () {
  let obj = this;
  this.closeBtn.addEventListener("click", () => {
    self.close();
  });

  this.saveBtn.addEventListener("click", () => {
    chrome.storage.local.get("squidder", function (result) {
      obj.squidderStorage = result?.squidder;
      obj.squidderStorage.replacementText = obj.replacementText.value;
      obj.squidderStorage.newBlockType = obj.newBlockType.checked ? "part" : "full";
      obj.UpdateStorage({ squidder: obj.squidderStorage });
      self.close();
    });
  });

  this.newBlockType.addEventListener("click", (checker) => {    
    obj.replacementText.disabled = !checker.target.checked;
  });
};

App.prototype.UpdateStorage = function (newSquidder) {
  chrome.storage.local.set(newSquidder, function () {});
};

document.addEventListener("DOMContentLoaded", function () {
  const app = new App();
  app.Init();
});
