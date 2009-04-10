var gdocsbar = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("gdocsbar-strings");
    document.getElementById("contentAreaContextMenu")
            .addEventListener("popupshowing", function(e) { this.showContextMenu(e); }, false);
  },

  showContextMenu: function(event) {
    // show or hide the menuitem based on what the context menu is on
    // see http://kb.mozillazine.org/Adding_items_to_menus
    document.getElementById("context-gdocsbar").hidden = gContextMenu.onImage;
  },
  onMenuItemCommand: function(e) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
                                this.strings.getString("helloMessage"));
  },
  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    gdocsbar.onMenuItemCommand(e);
  }

};
window.addEventListener("load", function(e) { gdocsbar.onLoad(e); }, false);
