function App(){
    this.totalContainer = document.getElementById("totalCounterContainer");
    this.AddEventListeners();
}

App.prototype.Init = function() {
    const self = this;
    chrome.storage.local.get('squidder', function(result){
        const total = result?.squidder?.total || 0;
        self.totalContainer.innerHTML = total;
    });

    /*
    const totalCount = localStorage.getItem('squidder.total');
    this.totalContainer.innerHTML = totalCount || "0";
    */
}

App.prototype.AddEventListeners = function(){
    document.getElementById("closeBtn").addEventListener("click", () => {
        self.close();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const app = new App();
    app.Init();
});
