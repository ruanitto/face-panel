"use strict";

/**
 * facebook_panel namespace.
 */
if ("undefined" == typeof(facebook_panel)) {
  var facebook_panel = {};
};

facebook_panel.sibPref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

facebook_panel.BrowserOverlay = {

  resizePanel: function(){ //resize the panel with the preference %.
    var panelWidth = facebook_panel.sibPref.getIntPref("extensions.facebook_panel.panelWidth")/100;
    var panelHeight = facebook_panel.sibPref.getIntPref("extensions.facebook_panel.panelHeight")/100;
    var panel = document.getElementById("facebook_panel-panel");
    panel.sizeTo(window.screen.availWidth*panelWidth,window.screen.availHeight*panelHeight);
  },

  setFavicon: function (){ //This function set the button's image with the favicon of facebook Web (change with unread messages).
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

    var facebookButton = mainWindow.document.getElementById("facebook_panel-toolbar-button");
    var facebookIFrame = mainWindow.document.getElementById("facebook_panel-iframe").contentDocument;

    try{
      var faviconUrl = facebookIFrame.getElementById("favicon").href;
      facebookButton.setAttribute("image",faviconUrl);
    }catch(e){
      //do nothing.
    };
  },

  setfacebookIframe: function(){ //set the iframe src.
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

    var facebookIframe = mainWindow.document.getElementById("facebook_panel-iframe");
    facebookIframe.webNavigation.loadURI('https://touch.facebook.com/',Components.interfaces.nsIWebNavigation,null,null,null);

  },

  pinfacebookPanel: function (){
    var panel = document.getElementById("facebook_panel-panel");
    var noautohide = facebook_panel.sibPref.getBoolPref("extensions.facebook_panel.noautohide");
    panel.setAttribute("noautohide", noautohide);
    var pinButton = document.getElementById("facebook_panel-toolbarButton_pin");
    pinButton.checked = noautohide;
  },

  changePinMode: function (){
    var pinMode = document.getElementById("facebook_panel-toolbarButton_pin").checked;
    facebook_panel.sibPref.setBoolPref("extensions.facebook_panel.noautohide", pinMode);
    facebook_panel.BrowserOverlay.pinfacebookPanel();
    //Need to close and reopen the panel to make the change take effect.
    var panel = document.getElementById("facebook_panel-panel");
    panel.hidePopup();
    var button = document.getElementById("facebook_panel-toolbar-button");
    panel.openPopup(button, "", 0, 0, false, false);
  },

  autoHideToolbar: function (){
    var panelToolbar = document.getElementById("facebook_panel-panel-toolbar");
    var toolbarAutoHide = facebook_panel.sibPref.getBoolPref("extensions.facebook_panel.toolbarAutoHide");
    if(toolbarAutoHide){
      panelToolbar.classList.add("facebook_panel-toolbar-class-hide");
      panelToolbar.classList.remove("facebook_panel-toolbar-class-show");
    }else{
      panelToolbar.classList.add("facebook_panel-toolbar-class-show");
      panelToolbar.classList.remove("facebook_panel-toolbar-class-hide");
    };
    var autoHideButton = document.getElementById("facebook_panel-toolbarButton_autoHide");
    autoHideButton.checked = toolbarAutoHide;
  },

  changeAutoHideMode: function (){
    var pinMode = document.getElementById("facebook_panel-toolbarButton_autoHide").checked;
    facebook_panel.sibPref.setBoolPref("extensions.facebook_panel.toolbarAutoHide", pinMode);
    facebook_panel.BrowserOverlay.autoHideToolbar();
    //Need to close and reopen the panel to make the change take effect.
    var panel = document.getElementById("facebook_panel-panel");
    panel.hidePopup();
    var button = document.getElementById("facebook_panel-toolbar-button");
    panel.openPopup(button, "", 0, 0, false, false);
  },

  openfacebookPanel: function (){
    window.clearTimeout(facebook_panel.delayFirstRunTimeOut);
    window.clearTimeout(facebook_panel.refreshTime);

    facebook_panel.BrowserOverlay.resizePanel();
    facebook_panel.BrowserOverlay.setFavicon();
    facebook_panel.BrowserOverlay.pinfacebookPanel();
    facebook_panel.BrowserOverlay.autoHideToolbar();

    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

    var facebookIframe = mainWindow.document.getElementById("facebook_panel-iframe");
    if(facebookIframe.src == "chrome://facebook_panel/content/fb-loading.xul"){
      //if the user opens the panel before it is loaded for the first time, I load it.
      //if it's loaded, I do nothing, because it's pretty annoying loading every time you open the panel because the load has a little delay. Also, you might lose information.
      facebook_panel.BrowserOverlay.setfacebookIframe();
    };

  },

  closefacebookPanel: function (){
    facebook_panel.BrowserOverlay.setFavicon();
    facebook_panel.refreshTime = setInterval(function() { facebook_panel.BrowserOverlay.setFavicon(); },
            facebook_panel.sibPref.getIntPref("extensions.facebook_panel.faviconRefreshTime")*
            30*
            1000); //Refresh the button's image with de facebook Web's favicon every 30 seconds.
  },

  installButton: function(toolbarId, id){
    if (!document.getElementById(id)){
        var toolbar = document.getElementById(toolbarId);
        var before = null;
        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");
    };
  },

  facebook_panelShortcut_cmd: function(){ //opens the panel with the shortcut.
    var panel = document.getElementById("facebook_panel-panel");
    var button = document.getElementById("facebook_panel-toolbar-button");
    if(panel.state == "closed"){
      panel.openPopup(button, "", 0, 0, false, false);
    }else{
      panel.hidePopup();
    };
  },

  initKeyset: function(){ //On Firefox loads sets the shortcut keys.
    var modifiers = facebook_panel.sibPref.getCharPref("extensions.facebook_panel.modfiers");
    var key = facebook_panel.sibPref.getCharPref("extensions.facebook_panel.key");
    var keyset = document.getElementById("facebook_panel-shortcut_cmd");
    keyset.setAttribute("modifiers",modifiers);
    keyset.setAttribute("key",key);
  },

  onFirefoxLoad: function(event){
    var isFirstRunPref = facebook_panel.sibPref.getBoolPref("extensions.facebook_panel.isFirstRun");
    if (isFirstRunPref){
      facebook_panel.BrowserOverlay.installButton("nav-bar", "facebook_panel-toolbar-button");
      facebook_panel.sibPref.setBoolPref("extensions.facebook_panel.isFirstRun", false);
    };
    facebook_panel.BrowserOverlay.initKeyset(); //initiate the button's keyboard shortcut.
  },

};

window.addEventListener("load", function onFirefoxLoadEvent() {
  window.removeEventListener("load", onFirefoxLoadEvent, false); // remove listener, no longer needed
  facebook_panel.BrowserOverlay.onFirefoxLoad();
  }, false);

facebook_panel.delayFirstRunTimeOut = setTimeout(function() {facebook_panel.BrowserOverlay.setfacebookIframe(); },
           facebook_panel.sibPref.getIntPref("extensions.facebook_panel.delayFirstRun")*
           1000); //Delay the first panel load.

facebook_panel.refreshTime = setInterval(function() { facebook_panel.BrowserOverlay.setFavicon(); },
            facebook_panel.sibPref.getIntPref("extensions.facebook_panel.faviconRefreshTime")*
            30*
            1000); //Refresh the button's image with de facebook Web's favicon every 30 seconds.
