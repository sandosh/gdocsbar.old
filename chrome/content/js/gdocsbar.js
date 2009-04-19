/*
Copyright (c) 2007, Sandosh Vasudevan. All rights reserved. 
http://www.sandosh.com/
Code licensed under the CC License:
http://creativecommons.org/licenses/by-nc-sa/3.0/us/
version: 0.5
*/

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");

/*function gdocsbar() {
    this.construct()
}*/
var gdocsbar = {
    _defaultSearchTxt: "type to filter...",
    _defaultFolderTxt: "Items not in folders",
    _feedObj: null,
    _xml2jsonXSL: null,
    _AUTH: null,
    _DBFile: "g3.sqlite",
    _selectedTab: null,
    _jstpl: null,
    _jstpl2: null,
	_jstpl5: null,
	_jstpl6:null,
	_jstpl7:null,
	_jstpl8:null,
    _sortOrder: "updated",
    _sortUpDownOrder: "DESC",
    _starred: false,
    _feed_id: 0,
    _search_id: 0,
    _uploadQ: [],
    _uploadProgress: false,
    _uploadConnection: null,
    _currentUploadFile: null,
    _uploadHistory: [],
    _thisUploadErrorCount: 0,
    _UploadSuccessCount: 0,
    _searchConnection: null,
	_feedConnection:null,
    _session: null,
    _sessiontimer: null,
    _folders: [],
    _selectedFolder: null,
    _useremail: null,
	_userTemplatesDir: "usertemplates/",
	_smartfolderbeingeditted:null,
  _gBrowser:null,
  _mainWindow:null,
	
	version: "0.5.7",
	
	//Construct of gdocsbar object
    construct: function() {
		
		//Instantiate custom gdocsbarsession componenent 
		this._session = Components.classes["@sandosh/gdocsbarsession;1"].getService().wrappedJSObject;
		this._session.setFree();
        //Load various templates using jsTemplateBuilder ( Template for search results, upload progress, upload completed, folders list)
        this._jstpl = new jsTemplateBuilder();
        this._jstpl.loadTemplate("templates/list.tpl");
        this._jstpl2 = new jsTemplateBuilder();
        this._jstpl2.loadTemplate("templates/list2.tpl");
        this._jstpl3 = new jsTemplateBuilder();
        this._jstpl3.loadTemplate("templates/list3.tpl");
        this._jstpl4 = new jsTemplateBuilder();
        this._jstpl4.loadTemplate("templates/list4.tpl");
    },
    //Object Initialization
	init: function() {
		this._session = Components.classes["@sandosh/gdocsbarsession;1"].getService().wrappedJSObject;
		this._session.setFree();
        //Load various templates using jsTemplateBuilder ( Template for search results, upload progress, upload completed, folders list)
        this._jstpl = new jsTemplateBuilder();
        this._jstpl.loadTemplate("templates/list.tpl");
        this._jstpl2 = new jsTemplateBuilder();
        this._jstpl2.loadTemplate("templates/list2.tpl");
        this._jstpl3 = new jsTemplateBuilder();
        this._jstpl3.loadTemplate("templates/list3.tpl");
        this._jstpl4 = new jsTemplateBuilder();
        this._jstpl4.loadTemplate("templates/list4.tpl");
		this._jstpl5 = new jsTemplateBuilder();
        this._jstpl5.loadTemplate("templates/smartfolderedit.tpl");
        
        this._mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
        this._gBrowser = this._mainWindow.getBrowser();
        //set default text in filter field
        document.getElementById("searchInput").setAttribute("value", this._defaultSearchTxt);
       	//get saved username, password and set
 		a = this.getPassword("chrome://gdocsbar/content/gdocsbar.xul", null);
        if (a) {
            document.getElementById("username").setAttribute("value", a.u);
            document.getElementById("password").setAttribute("value", a.p)
        }
        //this._session.setBusy();
		//check for existing session. if true, create document results and show main page. if false, initialize db tables
        sessionObj = this._session.getSession();
        if (sessionObj.session) {
            this._AUTH = sessionObj.auth;
            document.getElementById("_loading_2").style.display = "none";
            this.createDocs();
            document.getElementById("_user_email").value = sessionObj.username;
            document.getElementById("searchPage").collapsed = false; //collapsesandosh
            document.getElementById("loginPage").collapsed = true;
			
			var aDir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		  	if (!aDir) return false;
			var dir = this._session.getLocationFile();
			//aFile.initWithPath(thefile);
			aDir.initWithPath(dir.path+'/content/usertemplates');
			aDir.append(sessionObj.username);
			//alert('hi');
			try{
			if( !aDir.exists() || !aDir.isDirectory() ) {   // if it doesn't exist, create
			   aDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
			}
			}
			catch(e){
				alert(e);}
			this.addTemplatesMenu();
			
			
			
        } else {
            this.createTables()
        }
 		this._sessiontimer = setInterval(this.checkSession, 1000);
		var gdocsBarButton = this.getParentDocument().getElementById("gdocsbar-button");
		if (gdocsBarButton) { 
			gdocsBarButton.setAttribute('showing', 'true');
		}
		
		//this.checkBuild();
		
    },
    openSelectTab: function(url,useCurrentTab) {
      if(useCurrentTab) {
        this._gBrowser.loadURI(url)
      } else {
        this._gBrowser.selectedTab = this._gBrowser.addTab(url);
      }
    },

	checkBuild: function(){
		console.log("checking build...");
		this._uploadQ.push({"file": fileObj, "_type": "file", "name": "File1"});
		this._uploadQ.push({"file": fileObj, "_type": "file", "name": "File2"});
    	this._jstpl2.assign("list", this._uploadQ);
    	this._jstpl2.build("list2.tpl", "QTab", false);
	},
	backPage: function(){
		document.getElementById("searchPage").collapsed = false; 
		document.getElementById("morepage").collapsed = true; 
        document.getElementById('searchPage').setAttribute('force','true');
	},
	getParentDocument: function () {
		return window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
			.rootTreeItem
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow).document;
	},

	myinit:function(){
		if(gdocsbar.getPreference('firstrun') || gdocsbar.getPreference('autoopen'))
		{
			gdocsbar.setSidebarWidth(200);
	
			gdocsbar.showSidebar();
			var sidebar = document.getElementById("sidebar-box");
			sidebar.setAttribute("sidebarcommand","");
			setTimeout(function() { gdocsbar.showSidebar(); }, 1000);
			gdocsbar.addToolbarButton();
		}
		else{
			var gdocsBarButton = gdocsbar.getParentDocument().getElementById("gdocsbar-button");
			if (gdocsBarButton) { 

				gdocsBarButton.setAttribute('showing', 'false');
			 }
		}
		
		var gdocs = Components.classes['@mozilla.org/preferences-service;1']
		.getService(Components.interfaces.nsIPrefService)
		.getBranch('extensions.gdocsbar.');
		
		if(gdocs.getCharPref('version') != gdocsbar.version)
		{
			try{
				setTimeout(function() {
					/*var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
					var recentWindow = wm.getMostRecentWindow("navigator:browser");
					recentWindow.delayedOpenTab('http://gdocsbar.com/blog/2008/03/12/gdocsbar-056-update/', null, null, null, null);*/
					gdocsbar.openAndReuseOneTabPerURL('http://www.gdocsbar.com/download.html');
				}, 1000);
				gdocs.setCharPref('version',gdocsbar.version);
			}
			catch(e){
				console.error(e);
			}
			
		}	
		gdocs.setBoolPref('firstrun',false);
		
	},
	openAndReuseOneTabPerURL: function(url) {
	  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	                     .getService(Components.interfaces.nsIWindowMediator);
	  var browserEnumerator = wm.getEnumerator("navigator:browser");
	
	var newURL = 'http://gdocsbar.com/blog/2008/07/10/gdocsbar-now-compatible-with-ff3/'
	  // Check each browser instance for our URL
	  var found = false;
	  while (!found && browserEnumerator.hasMoreElements()) {
	    var browserInstance = browserEnumerator.getNext().getBrowser();

	    // Check each tab of this browser instance
	    var numTabs = browserInstance.tabContainer.childNodes.length;
	    for(var index=0; index<numTabs; index++) {
	      var currentBrowser = browserInstance.getBrowserAtIndex(index);
	      if (url == currentBrowser.currentURI.spec) {
			currentBrowser.loadURI(newURL);
	        // The URL is already opened. Select this tab.
	        browserInstance.selectedTab = browserInstance.tabContainer.childNodes[index];

	        // Focus *this* browser
	        browserInstance.focus();
	        found = true;
	        break;
	      }
	    }
	  }

	  // Our URL isn't open. Open it now.
	  if (!found) {
	    	var recentWindow = wm.getMostRecentWindow("navigator:browser");
			if (recentWindow) {
				// Use an existing browser window or a blank one if the top is blank
				if (recentWindow.content.document.location.href == "about:blank") {
					recentWindow.getBrowser().loadURI(newURL);
				} else {
					recentWindow.openUILinkIn(newURL, "tab");
				}
			} else {
				// No browser windows are open, so open a new one.
				window.open(newURL);
			}
	  }
	},
	firstRun: function(){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator("navigator:browser");
		
		var url = "http://www.gdocsbar.com/download.html"
		var found = false;
		
		var changesURL = "http://gdocsbar.com/blog/2008/03/12/gdocsbar-056-update/";
		var changesBrowserInstance = null;
		var changesBrowserTabIndex = 0;
		
		while(!found && browserEnumerator.hasMoreElements()){
			var browserInstance = browserEnumerator.getNext().getBrowser();
			var numTabs = browserInstance.tabContainer.childNodes.length;
			for (var index=0; index<numTabs; index++) {
				var currentBrowser = browserInstance.getBrowserAtIndex(index);
				var browserURL = currentBrowser.currentURI.spec
				dump(url+","+browserURL)
				if (url == browserURL) {
					dump('hi')
					// The URL is already opened. Select this tab.
					browserInstance.selectedTab = browserInstance.tabContainer.childNodes[index];
					//browserInstance.loadURI(changesURL);
					// Focus *this* browser
					browserInstance.focus();
					found = true;
					break;
				} 
			}
		}
		
		if (!found) {
			
	
				var recentWindow = wm.getMostRecentWindow("navigator:browser");
				if (recentWindow) {
					// Use an existing browser window or a blank one if the top is blank
					if (recentWindow.content.document.location.href == "about:blank") {
						recentWindow.getBrowser().loadURI(changesURL);
					} else {
						recentWindow.openUILinkIn(changesURL, "tab");
					}
				} else {
					// No browser windows are open, so open a new one.
					window.open(changesURL);
				}
			}
		
	},
	showSidebar: function(){
		this.toggleSidebar(true);
	},
	toggleSidebar: function(forceOpen){
		var toggleSidebar = window.toggleSidebar || window.parent.toggleSidebar;
		toggleSidebar('viewGdocsbar', forceOpen);
	},
	onSidebarUnload: function(){
			var gdocsBarButton = gdocsbar.getParentDocument().getElementById("gdocsbar-button");
			if (gdocsBarButton) { 

				gdocsBarButton.setAttribute('showing', 'false');
				return; }
	},
	addToolbarButton: function() {
		
		var gdocsBarButton = document.getElementById("gdocsbar-button");
		if (gdocsBarButton) { 
			
			gdocsBarButton.setAttribute('showing', 'true');
			return; }
		
		//dump("creating button");
		var navBar = document.getElementById("nav-bar");
		var currentSet = navBar.getAttribute("currentset");
		if (!currentSet) {
			currentSet = navBar.getAttribute("defaultset");
			if (!currentSet) { return; }
		}

		var items = currentSet.split(",");
		var urlBarIndex = items.length;
		for (var i = 0; i < items.length; i++) {
			if (items[i] == "gdocsbar-button") { return; }//found the button
			if (items[i] == "urlbar-container") { urlBarIndex = i; }
		}
		items.splice(urlBarIndex, 0 ,"gdocsbar-button");
		navBar.setAttribute("currentset", items.join(","));
		document.persist("nav-bar", "currentset");
		var navToolbox = document.getElementById("navigator-toolbox")
		var toolboxPalette = navToolbox.palette;
		for (var i = 0; i < toolboxPalette.childNodes.length; i++) {
			if (toolboxPalette.childNodes[i].id != "gdocsbar-button") { continue; }
			// make a deep copy of the  button
			var buttonCopy = toolboxPalette.childNodes[i].cloneNode(true);
			buttonCopy.setAttribute('showing', 'true');
			
			// get the urlbar and insert it before there
			var urlBarElem = document.getElementById("urlbar-container");
			if (urlBarElem) { navBar.insertBefore(buttonCopy, urlBarElem); }
			else { navBar.appendChild(buttonCopy); }
			break;
		}
	},
	
	handleStatusIconClick: function(event) {
		//only show on left/main mouse click
		if(event.button == 0) {
			this.showSidebar();
		}
		return true;
	},
	
	// Function to periodically check for valid session accross multiple windows. uses custom session component
    checkSession: function() {
        sessionObj = gdocsbarObj._session.getSession();
		//console.error("sessin checking->"+sessionObj.session+","+gdocsbarObj._session._busy);
		if(gdocsbarObj._session._busy == true){
			return false;
		}
		if(YAHOO.util.Connect.isCallInProgress(this._feedConnection))
			return false;
        if (sessionObj.session) {
            if (document.getElementById("searchPage").collapsed && document.getElementById("searchPage").getAttribute('force')=='true') {
                document.getElementById("searchPage").collapsed = false; //collapsesandosh
                document.getElementById("loginPage").collapsed = true;
                gdocsbarObj.createDocs()
            }
			
			
			
        } else {
            if (!document.getElementById("searchPage").collapsed) {
                gdocsbarObj.setErrorText("You have signed out.")
            }
            document.getElementById("searchPage").collapsed = true;
            document.getElementById("loginPage").collapsed = false
        }
    },
	// Function to set error_txt on login page
    setErrorText: function(txt) {
        dnode = document.getElementById("error_txt");
        while (dnode.childNodes.length > 0) {
            dnode.removeChild(dnode.childNodes[0])
        }
        tnode = document.createTextNode(txt);
        document.getElementById("error_txt").appendChild(tnode);
        dnode.style.display = ""
    },
	//Event handler for ajax requests for loading gif animation
    startLoad: function(args) {
        document.getElementById("_loading_1").style.display = "inline";
        document.getElementById("_loading_2").style.display = ""
    },
	//Event handler for ajax requests for loading gif animation
    completeLoad: function() {
        //console.log("completed!");
        document.getElementById("_loading_1").style.display = "none";
        document.getElementById("_loading_2").style.display = "none"
    },
	//Function to handle various sort options 
    callsortList: function(a) {
        if (a.className == "label") {
            return
        }
        allLabels = a.parentNode.childNodes;
		//change style of selected sortorder
        for (i = 0; i < allLabels.length; i++) {
            if (allLabels[i].className != "label") {
                if (allLabels[i].id == a.id) {
                    allLabels[i].className = "on"
                } else {
                    allLabels[i].className = "off"
                }
            }
        }
        switch (a.value) {
        case "date":
            this._sortOrder = "updated";
            break;
        case "title":
            this._sortOrder = "title";
            break;
        case "author":
            this._sortOrder = "author_name";
            break
        }
        this.createDocs()
    },
	//Function to handle ASC/DESC sort order
    callsortOrderList: function(a) {
        if (a.className == "label") {
            return
        }
        allLabels = a.parentNode.childNodes;
        for (i = 0; i < allLabels.length; i++) {
            if (allLabels[i].className != "label") {
                if (allLabels[i].id == a.id) {
                    allLabels[i].className = "on"
                } else {
                    allLabels[i].className = "off"
                }
            }
        }
        switch (a.id) {
        case "_asc":
            this._sortUpDownOrder = "ASC";
            break;
        case "_desc":
            this._sortUpDownOrder = "DESC";
            break
        }
        this.createDocs()
    },
	//Function to handle various document type select events
    callMenuItem: function(a) {
        allLabels = a.parentNode.childNodes;
        for (i = 0; i < allLabels.length; i++) {
            if (allLabels[i].id == a.id) {
                allLabels[i].className = "selected"
            } else {
                allLabels[i].className = "notSelected"
            }
        }
        switch (a.id) {
        case "_a":
            this._selectedTab = null;
            break;
        case "_d":
        case "_pdf":
            this._selectedTab = "document";
            break;
        case "_p":
            this._selectedTab = "presentation";
            break;
        case "_s":
            this._selectedTab = "spreadsheet";
            break
        }
        this.filterDocs(false)
    },
	callMoreMenuItem: function(a){
		
		allLabels = a.parentNode.childNodes;
        for (i = 0; i < allLabels.length; i++) {
            if (allLabels[i].id == a.id) {
                allLabels[i].className = "selected"
            } else {
                allLabels[i].className = "notSelected"
            }
        }

		switch (a.id) {
			case "o_t":
			document.getElementById('actions_s').style.display = 'none';
			document.getElementById('actions_t').style.display = '';
			this.createTemplateList();
			break;
			
			case "o_s":
			document.getElementById('actions_t').style.display = 'none';
			document.getElementById('actions_s').style.display = '';
			this.createSmartFolderList();
			break;
			
			case "o_o":
			document.getElementById('actions_t').style.display = 'none';
			document.getElementById('actions_s').style.display = 'none';
			break;
		}
	},
	//Function to handle upload tab selects
    callUploadMenuItem: function(a) {
        allLabels = a.parentNode.childNodes;
        for (i = 0; i < allLabels.length; i++) {
            if (allLabels[i].id == a.id) {
                allLabels[i].className = "selected"
            } else {
                allLabels[i].className = "notSelected"
            }
        }
        switch (a.id) {
        case "_uploadNow":
            document.getElementById("QTab").style.display = "none";
            document.getElementById("uploadTab").style.display = "";
            document.getElementById("finishedTab").style.display = "none";
            break;
        case "_uploadQ":
            document.getElementById("QTab").style.display = "";
            document.getElementById("uploadTab").style.display = "none";
            document.getElementById("finishedTab").style.display = "none";
            break;
        case "_uploadDone":
            document.getElementById("QTab").style.display = "none";
            document.getElementById("uploadTab").style.display = "none";
            document.getElementById("finishedTab").style.display = "";
            break
        }
        Behaviour.apply()
    },
	//Function to toggle betweek filter and content search
    toggleSearch: function(a) {
        switch (a.id) {
        case "_filter":
            document.getElementById("_content").className = "off";
            document.getElementById("contentSearchBox").style.display = "none";
            document.getElementById("searchBox").style.display = "";
            break;
        case "_content":
            document.getElementById("_filter").className = "off";
            document.getElementById("searchBox").style.display = "none";
            document.getElementById("contentSearchBox").style.display = "";
            break
        }
        a.className = "on"
    },
	//Function to focus search field
    focusSearchField: function(field) {
        if (field.value == this._defaultSearchTxt) {
            //console.log(field.value);
            field.value = null
        }
        //console.log("new value : " + field.value);
        field.style.color = "#000000"
    },
	//Function to blur search field
    blurSearchField: function(field) {
        if (field.value == "") {
            field.value = this._defaultSearchTxt;
            field.style.color = "#cccccc"
        }
    },
    toggleSearchCancel: function(field) {
        if (field.value != "") {
            document.getElementById("searchLabelEnd").className = "close"
        } else {
            document.getElementById("searchLabelEnd").className = ""
        }
    },
	//Function to clear search field
    clearSearchfield: function() {
        if (document.getElementById("searchInput").value != this._defaultSearchTxt) {
            document.getElementById("searchInput").value = ""
        }
        this.toggleSearchCancel(document.getElementById("searchInput"));
        document.getElementById("searchInput").focus();
        gdocsbarObj.createDocs(null)
    },
	//Function to perform content search
    searchDocs: function() {
        //Clear existing files
		this._jstpl.assign("results", []);
        this._jstpl.build("list.tpl", "searchResultsBox", true);
        document.getElementById("sInfoTxt").value = "Searching...";
        document.getElementById("refresh_txt").value = "";
		document.getElementById("clear_txt").value = "";
        
		//Add custom headers (reqd. for google authorization)
		YAHOO.util.Connect.resetDefaultHeaders();
        YAHOO.util.Connect.initHeader("Authorization", "GoogleLogin auth=" + this._AUTH);
        YAHOO.util.Connect.initHeader("Cookie", "", false);
        //Cancel any exisiting calls if any
		if (YAHOO.util.Connect.isCallInProgress(this._searchConnection)) {
            YAHOO.util.Connect.abort(this._searchConnection)
        }
		//Start Ajax request for content search
        this._searchConnection = YAHOO.util.Connect.asyncRequest("GET", "http://docs.google.com/feeds/documents/private/full?q=" + document.getElementById("cSearchInput").value, {
            success: this.saveSearchtoDB, //function to call on success
            failure: this.searchFail, //function to call on failure
            customevents: {
                onStart: this.startLoad,
                onComplete: this.completeLoad
            },
            scope: this
        })
    },
	//Function to handle AJAX search success
    saveSearchtoDB: function(o) {
		//convert the resulting XML into native js object
        var xotree = new XML.ObjTree();
        a = xotree.parseDOM(o.responseXML.childNodes[0]);
        //convert date format to readable format
		var date = new Date();
        date.setISO8601(a.feed.updated);
		
		//Save search results data
        var myInsertQuery = "INSERT INTO search(totalresults, updated, query) VALUES(" + a.feed["openSearch:totalResults"] + ', DATETIME("' + date.getSQLString() + '"), "' + this.sanitize(document.getElementById("cSearchInput").value) + '");';
        $sqlite.cmd(this._DBFile, myInsertQuery);
        var selectQuery = "select id, DATETIME(updated) as updated , query from search order by id DESC LIMIT 1;";
        var myArray1 = $sqlite.select(this._DBFile, selectQuery);
		
		//Insert search results into db
        if (typeof a.feed.entry == "object" && !a.feed.entry.length) {
			//If the result contains just one item
            entry = a.feed.entry;
            myInsertQuery = "INSERT INTO search_results (search_id, key) VALUES (" + myArray1[0]["id"] + ",'" + entry.id.substr(entry.id.indexOf("%3A") + 3) + "');";
            $sqlite.cmd(this._DBFile, myInsertQuery)
        } else {
			//If the result contains just multiple items
            if (typeof a.feed.entry == "object" && a.feed.entry.length > 0) {
                for (var k = 0; k < a.feed.entry.length; k++) {
                    entry = a.feed.entry[k];
                    myInsertQuery = "INSERT INTO search_results (search_id, key) VALUES (" + myArray1[0]["id"] + ",'" + entry.id.substr(entry.id.indexOf("%3A") + 3) + "');";
                    $sqlite.cmd(this._DBFile, myInsertQuery)
                }
            }
        }
		//set current search id
        this._search_id = myArray1[0]["id"];
        //create file items to display
		this.createDocs()
    },
	//function to handle failed search ajax calls
    searchFail: function(o) {
        document.getElementById("sInfoTxt").value = "Error, try again.";
    },
	setSidebarWidth: function(newWidth) {
		var sidebarElem = document.getElementById('sidebar-box');
		if(sidebarElem) {
			sidebarElem.setAttribute('width', newWidth);
		}
	},
	//function to get document list feed from google
    getFeed: function() {
        //Reset current documents, results, tables etc.
		this._session.setBusy();
		this.clearSearchfield();
        if (this._search_id != 0) {
            this._search_id = 0;
            this.createDocs(null);
            return
        }
        this._jstpl.assign("results", []);
        this._jstpl.build("list.tpl", "searchResultsBox", true);
        document.getElementById("sInfoTxt").value = "Loading...";
        document.getElementById("refresh_txt").value = "";
        
		var flushTableQuery = "DELETE FROM feeds;";
        $sqlite.cmd(this._DBFile, flushTableQuery);
        var flushTableQuery = " DELETE from gdocs;";
        $sqlite.cmd(this._DBFile, flushTableQuery);
        $sqlite.cmd(this._DBFile, "DELETE from folders;");

        YAHOO.util.Connect.resetDefaultHeaders();
        YAHOO.util.Connect.initHeader("Authorization", "GoogleLogin auth=" + this._AUTH);
        YAHOO.util.Connect.initHeader("Cookie", "", false);
        this._feedConnection = YAHOO.util.Connect.asyncRequest("GET", "http://docs.google.com/feeds/documents/private/full", {
            success: this.savetoDB,
            failure: this.getFeedFail,
            customevents: {
                onStart: this.startLoad,
                onComplete: this.completeLoad
            },
            scope: this
        })
    },
    getFeedFail: function(o) {
        //console.error(o)
		document.getElementById("sInfoTxt").value = "Request Failed.";
		document.getElementById("refresh_txt").value = "Try Again.";
		console.error(o.responseText);
		this._session.setFree();
    },
    savetoDB: function(o) {
		sessionObj = this._session.getSession();
		console.error(o.responseText);
        document.getElementById("searchPage").style.display = "";
        var xotree = new XML.ObjTree();
        a = xotree.parseDOM(o.responseXML.childNodes[0]);
        var date = new Date();
        date.setISO8601(a.feed.updated);
        var myInsertQuery = "INSERT INTO feeds(totalresults, updated) VALUES(" + a.feed["openSearch:totalResults"] + ', DATETIME("' + date.getSQLString() + '"));';
        $sqlite.cmd(this._DBFile, myInsertQuery);
        var selectQuery = "select id, DATETIME(updated) as updated , totalresults from feeds order by id DESC LIMIT 1;";
        var myArray1 = $sqlite.select(this._DBFile, selectQuery);
		console.log('Number of documents:'+a.feed.entry.length);
        this._feed_id = myArray1[0]["id"];
        if (a.feed["entry"]) {
            if (typeof a.feed.entry == "object" && !a.feed.entry.length) {
                entry = a.feed.entry;
                date.setISO8601(entry.updated);
                var folder = [];
                if (entry.category.length > 1) {
                    for (var i = 0; i < entry.category.length; i++) {
                        if (entry.category[i]["-scheme"] == "http://schemas.google.com/g/2005/labels" && entry.category[i]["-label"] == "starred") {
                            starred = "TRUE"
                        } else {
                            if (entry.category[i]["-scheme"] == "http://schemas.google.com/g/2005#kind") {
                                cat = entry.category[i]["-label"];
                                starred = "FALSE"
                            } else {
                                if (entry.category[i]["-scheme"] == "http://schemas.google.com/docs/2007/folders/" + sessionObj.username) {
                                    folder.push(entry.category[i]["-label"])
                                }
                            }
                        }
                    }
					
                    this.addFolders(folder, entry.id.substr(entry.id.indexOf("%3A") + 3))
                } else {
                    cat = entry.category["-label"];
                    starred = "FALSE"
                }
                myInsertQuery = "INSERT INTO gdocs (feed_id, title,starred, key, updated, category, link1, link2, link3, author_name, author_email) VALUES (" + myArray1[0]["id"] + ",'" + this.sanitize(entry.title["#text"]) + "', '" + starred + "' , '" + entry.id.substr(entry.id.indexOf("%3A") + 3) + "', DATETIME('" + date.getSQLString() + "'), '" + this.sanitize(cat) + "', '" + entry.content["-src"] + "', '" + entry.id + "', '" + entry.link[0]["-href"] + "', '" + this.sanitize(entry.author.name) + "', '" + entry.author.email + "');";
                $sqlite.cmd(this._DBFile, myInsertQuery)
            } else {
                for (var k = 0; k < a.feed.entry.length; k++) {
                    entry = a.feed.entry[k];
                    date.setISO8601(entry.updated);
                    folder = [];
                    try {
                        if (entry.category.length > 1) {
                            for (var i = 0; i < entry.category.length; i++) {
                                if (entry.category[i]["-scheme"] == "http://schemas.google.com/g/2005/labels" && entry.category[i]["-label"] == "starred") {
                                    starred = "TRUE"
                                } else {
                                    if (entry.category[i]["-scheme"] == "http://schemas.google.com/g/2005#kind") {
                                        cat = entry.category[i]["-label"];
                                        starred = "FALSE"
                                    } else {
                                        if (entry.category[i]["-scheme"] == "http://schemas.google.com/docs/2007/folders/" + sessionObj.username) {
											folder.push(entry.category[i]["-label"])
                                        }
                                    }
                                }
                            }
                            this.addFolders(folder, entry.id.substr(entry.id.indexOf("%3A") + 3))
                        } else {
                            cat = entry.category["-label"];
                            starred = "FALSE"
                        }
                    } catch(e) {
                        //console.error(e)
                    }
                    
                        myInsertQuery = "INSERT INTO gdocs (feed_id, title,starred, key, updated, category, link1, link2, link3, author_name, author_email) VALUES (" + myArray1[0]["id"] + ",'" + this.sanitize(entry.title["#text"]) + "', '" + starred + "' , '" + entry.id.substr(entry.id.indexOf("%3A") + 3) + "', DATETIME('" + date.getSQLString() + "'), '" + this.sanitize(cat) + "', '" + entry.content["-src"] + "', '" + entry.id + "', '" + entry.link[0]["-href"] + "', '" + this.sanitize(entry.author.name) + "', '" + entry.author.email + "');"
                    
					//console.error(myInsertQuery);
                    try {
						$sqlite.cmd(this._DBFile, myInsertQuery);
					} catch(e) {
						this._session.setFree();
					}
                }
            }
        }
        this.createDocs();
        
       this._session.setFree();
    },
	sanitize: function(txt){
		return txt.replace(/\'/g,"\'\'");
	},
    addFolders: function(folders, key) {
        if (folders.length > 0) {
            for (var i = 0; i < folders.length; i++) {
                try {
                    $sqlite.cmd(this._DBFile, "INSERT INTO folders (key, folder) VALUES ('" + key + "', '" + this.sanitize(folders[i]) + "');")
                } catch(e) {
                    //console.error(e)
                }
            }
        }
    },
    addFoldersMenu: function() {
        var items_not_in_folders = $sqlite.select(this._DBFile, "select COUNT(gdocs.key) as total from gdocs LEFT JOIN folders on gdocs.key=folders.key where folders.key is NULL");
        var folders = $sqlite.select(this._DBFile, "select folder, COUNT(folder) as total from folders group by folder");
        var total = $sqlite.select(this._DBFile, "select COUNT(key) as total from gdocs");
		sessionObj = this._session.getSession();
		var smartFolders = $sqlite.select(this._DBFile, "select * from smartfolders where email='"+sessionObj.username+"' order by fname");
        //console.log("--->" + total[0]["total"]);
        //console.log(items_not_in_folders.length);
        this._jstpl4.assign("total", total[0]["total"]);
        this._jstpl4.assign("list", folders);
        this._jstpl4.assign("not_in_folders", items_not_in_folders[0]["total"]);
		this._jstpl4.assign("smartfolders", smartFolders);
        this._jstpl4.build("list4.tpl", "folders_menupop", true)
    },
	addTemplatesMenu: function(){
		//alert('hi');
		if(this._jstpl8 == null){
			this._jstpl8 = new jsTemplateBuilder();
	        this._jstpl8.loadTemplate("templates/templatelistmenu.tpl");
		}
		this._jstpl8.assign('list', this.getTemplateFileList());
		this._jstpl8.build('templatelistmenu.tpl','templates_menupop',true);
		
		
	},
    createTables: function() {
        var myCreateDBQuery = "CREATE TABLE IF NOT EXISTS feeds (id INTEGER PRIMARY KEY AUTOINCREMENT, updated DATE, totalresults INTEGER);";
        $sqlite.cmd(this._DBFile, myCreateDBQuery);
        //console.info("create 1");
        var myCreateDBQuery2 = "CREATE TABLE IF NOT EXISTS search (id INTEGER PRIMARY KEY AUTOINCREMENT, updated DATE, totalresults INTEGER, query varchar(100));";
        $sqlite.cmd(this._DBFile, myCreateDBQuery2);
        //console.info("create 2");
        var myCreateDBQuery3 = "CREATE TABLE IF NOT EXISTS search_results (id INTEGER PRIMARY KEY AUTOINCREMENT, search_id INTEGER, key varchar(100));";
        $sqlite.cmd(this._DBFile, myCreateDBQuery3);
        //console.info("create 3");
        //$sqlite.cmd(this._DBFile, "DROP table gdocs");
        var myCreateDBQuery2 = "CREATE TABLE IF NOT EXISTS gdocs (id INTEGER PRIMARY KEY AUTOINCREMENT,feed_id INTEGER,  title varchar(100),starred BOOLEAN, key varchar(100), updated DATE, category varchar(100), folder varchar(100), link1 TEXT, link2 TEXT, link3 TEXT, author_name varchar(100), author_email varchar(100));";
        $sqlite.cmd(this._DBFile, myCreateDBQuery2);
        //console.info("create 4");
        var flushTableQuery = "DELETE FROM feeds;";
        $sqlite.cmd(this._DBFile, flushTableQuery);
        //console.info("create 5");
        var flushTableQuery = " DELETE from gdocs;";
        $sqlite.cmd(this._DBFile, flushTableQuery);
        //console.info("create 6");
        var createFoldersQuery = "CREATE TABLE IF NOT EXISTS folders (id INTEGER PRIMARY KEY AUTOINCREMENT, key varchar(100), folder varchar(100));";
        $sqlite.cmd(this._DBFile, createFoldersQuery);
        //console.info("create 7");
        $sqlite.cmd(this._DBFile, "DELETE from folders;")
		//$sqlite.cmd(this._DBFile, "DROP table smartfolders");
		var smartFoldersQuery = "CREATE TABLE IF NOT EXISTS smartfolders (id INTEGER PRIMARY KEY AUTOINCREMENT, fname varchar(100), ffilter varchar(100), fsearch varchar(100), email varchar(100));";
		$sqlite.cmd(this._DBFile, smartFoldersQuery);
    },
    openCaptcha: function() {
        this.openSelectTab("https://www.google.com/accounts/DisplayUnlockCaptcha")
    },
	openMyUILink: function(key, event){
		console.log(event.button);
		if(event.button > 1)
			return false;
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		var recentWindow = wm.getMostRecentWindow("navigator:browser");
		
		var sql = "select link3 from gdocs where key='" + key + "'";
        var results = $sqlite.select(this._DBFile, sql);
		 
			
			if(this.getPreference("checkOpenTabs"))
			{
				if(!this.checkForOpenLink(results[0]["link3"], false, key))
				{
					if(this.getPreference("alwaysOpenTab"))
						{
					        this.openSelectTab(results[0]["link3"])
						}
					else
						recentWindow.openUILink(results[0]["link3"], event, false, true);
				}
			}
			else if(this.getPreference("alwaysOpenTab"))
				{
			        this.openSelectTab(results[0]["link3"])
				}
			else
				recentWindow.openUILink(results[0]["link3"], event, false, true);
		
			
	},
	openGoogleDocsHome: function(event){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		var recentWindow = wm.getMostRecentWindow("navigator:browser");
		if(!gdocsbar.checkForOpenLink('http://docs.google.com/', true))
		{
	        this.openSelectTab('http://docs.google.com/');
		}
			
	},
	checkForOpenLink: function(url, home, key){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		                     .getService(Components.interfaces.nsIWindowMediator);
		  var browserEnumerator = wm.getEnumerator("navigator:browser");

		  // Check each browser instance for our URL
		  var found = false;
		  while (!found && browserEnumerator.hasMoreElements()) {
		    var browserMyInstance = browserEnumerator.getNext();
			var browserInstance = browserMyInstance.getBrowser();

		    // Check each tab of this browser instance
		    var numTabs = browserInstance.tabContainer.childNodes.length;
		    for(var index=0; index<numTabs; index++) {
		      var currentBrowser = browserInstance.getBrowserAtIndex(index);
		      if (currentBrowser.currentURI.spec.indexOf(key) > -1|| (home && currentBrowser.currentURI.spec.indexOf('http://docs.google.com/#') > -1)) {
		        // The URL is already opened. Select this tab.
		        browserInstance.selectedTab = browserInstance.tabContainer.childNodes[index];

		        // Focus *this* browser
		        browserInstance.focus();
				browserMyInstance.focus();
		        found = true;
		        break;
		      }
		    }
		  }
		
		return found;
	},
	getQueryVariable: function(myurl,variable) {
		var query = myurl.substring(myurl.indexOf("?")+1);
		alert(query);
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	    if (pair[0] == variable) {
			alert(pair[0])
	      return pair[1];
	    }
	  } 
	  //alert('Query Variable ' + variable + ' not found');
	},
    openLinkNewTab: function(key) {
        var sql = "select link3 from gdocs where key='" + key + "'";
        var results = $sqlite.select(this._DBFile, sql);
        console.info(results[0]["link3"]);
        this._gBrowser.selectedTab = this._gBrowser.addTab(results[0]["link3"])
    },
    downAll: function() {
        var sql = "select key,title from gdocs where category='document'";
        var results = $sqlite.select(this._DBFile, sql);
        for(i=0;i< results.length; i++) { 
        var url = "http://docs.google.com/feeds/download/documents/Export?docID="+ results[i]["key"] +"&exportFormat=pdf"
        var filename = results[i]["title"] + ".pdf" ;
        //Add custom headers (reqd. for google authorization)
        //YAHOO.util.Connect.initHeader("Authorization", "GoogleLogin auth=" + this._AUTH);
          netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
          // Open the save file dialog
          const nsIFilePicker = Components.interfaces.nsIFilePicker;
          var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
          fp.init(window, "Save File...", nsIFilePicker.modeSave);
          fp.defaultString = filename; 
          var rv = fp.show();
          if(rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace){
            // Open the file and write to it
            var file = fp.file;
            if(file.exists() == false){//create as necessary
              file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
            }
          }
          var dm = Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager);
        var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService); 
         var uri = ios.newURI(url, null, null); 
         var fileURI = ios.newFileURI(file);
      //new persitence object
      var wbp = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);
       var dl = dm.addDownload(0, uri, fileURI, file.leafName, null, 0, null, wbp);
       wbp.progressListener = dl;
      //save file to target
      wbp.saveURI(uri,null,null,null,"Authorization:GoogleLogin auth=" + this._AUTH +"\r\n",file);
      } // end for loop of results 
    },
    downLink: function(key,format) {
        var sql = "select category,title from gdocs where key='" + key + "'";
        var results = $sqlite.select(this._DBFile, sql);
        var fmCmd = {"pdf" : 12, "XLS" : 4}
        console.info("key:" + key);
        if(results[0]["category"] == "spreadsheet") {
          var url = "http://spreadsheets.google.com/feeds/download/spreadsheets/Export?key="+ key +"&fmcmd=" + fcCmd[format]
        } else if(results[0]["category"] == "presentation") {
          var url = "http://docs.google.com/feeds/download/presentations/Export?docID="+ key +"&exportFormat=" + format
        } else {
          var url = "http://docs.google.com/feeds/download/documents/Export?docID="+ key +"&exportFormat=" + format
        }
        console.log("url:" + url);
        var filename = results[0]["title"] + "." + format;
        //Add custom headers (reqd. for google authorization)
        //YAHOO.util.Connect.initHeader("Authorization", "GoogleLogin auth=" + this._AUTH);
          netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
          // Open the save file dialog
          const nsIFilePicker = Components.interfaces.nsIFilePicker;
          var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
          fp.init(window, "Save File...", nsIFilePicker.modeSave);
          fp.defaultString = filename; 
          var rv = fp.show();
          if(rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace){
            // Open the file and write to it
            var file = fp.file;
            if(file.exists() == false){//create as necessary
              file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
            }
          }
          var dm = Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager);
        var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService); 
         var uri = ios.newURI(url, null, null); 
         var fileURI = ios.newFileURI(file);
      //new persitence object
      var wbp = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);
       var dl = dm.addDownload(0, uri, fileURI, file.leafName, null, 0, null, wbp);
       wbp.progressListener = dl;
      //save file to target
      wbp.saveURI(uri,null,null,null,"Authorization:GoogleLogin auth=" + this._AUTH +"\r\n",file);
 
    },
    opnLinkSameTab: function(key) {
        var sql = "select link3 from gdocs where key='" + key + "'";
        var results = $sqlite.select(this._DBFile, sql);
        console.info(results[0]["link3"]);
        this.openSelectTab(results[0]["link3"],true)
    },
    opnLinkNewWindow: function(key) {
        var sql = "select link3 from gdocs where key='" + key + "'";
        var results = $sqlite.select(this._DBFile, sql);
        console.info(results[0]["link3"]);
        window.open(results[0]["link3"])
    },
    copyLink: function(key) {
        var sql = "select link3 from gdocs where key='" + key + "'";
        var results = $sqlite.select(this._DBFile, sql);
        console.info(results[0]["link3"]);
        var clip = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService().QueryInterface(Components.interfaces.nsIClipboardHelper);
        clip.copyString(results[0]["link3"]);
        //console.log(clip)
    },
    getAuthorForFilter: function(key) {
        var sql = "select author_name from gdocs where key='" + key + "'";
        var results = $sqlite.select(this._DBFile, sql);
        //console.info(results[0]["author_name"]);
        document.getElementById("context_author").label = "Filter by " + results[0]["author_name"];
 		document.getElementById("context_author").setAttribute('author',results[0]["author_name"]);
    },
	createNewFilter: function(context){
		//this.focusSearchField(document.getElementById('searchInput'));
		document.getElementById("searchLabelEnd").className = "close"
		document.getElementById("searchInput").focus();
		document.getElementById("searchInput").value = "@author "+context.getAttribute('author');
		this.filterDocs();
	},
    createDocsForFolders: function(folderObj) {
		if(folderObj == null)
			folder = null;
		else
			folder = folderObj.id
        if (folder == null) {
            document.getElementById("folders_menu").label = "All Items";
            document.getElementById("folders_menu").style.backgroundImage = "url(chrome://gdocsbar/skin/images/folder_home.png)"
        } else {
            document.getElementById("folders_menu").label = folder;
            document.getElementById("folders_menu").style.backgroundImage = "url(chrome://gdocsbar/skin/images/folder1.png)"
        }
        this._selectedFolder = folder;
		document.getElementById("searchInput").value = "";
		
        this.filterDocs();
    },
    createDocs: function() {
        txt = document.getElementById("searchInput").value;
        if (txt == this._defaultSearchTxt) {
            txt = ""
        }
        if (this._sortOrder == "title") {
            this._sortOrder = "lower(g.title)"
        }
        if (this._starred == true) {
            var starred = " and g.starred='TRUE' "
        } else {
            var starred = ""
        }
        if (!this._selectedFolder) {
            joinQ = "";
            folderQ = ""
        } else {
            if (this._selectedFolder == this._defaultFolderTxt) {
                joinQ = " LEFT JOIN folders on g.key=folders.key ";
                folderQ = " and folders.key is NULL "
            } else {
                joinQ = " LEFT JOIN folders on g.key=folders.key ";
                folderQ = " and folders.key=g.key and folders.folder='" + this._selectedFolder + "' "
            }
        }
        var sql = "select g.link3, g.title , g.author_email, g.author_name, g.category, date(g.updated) as updated, g.key, g.starred, g.folder from gdocs g   order by " + this._sortOrder + " " + this._sortUpDownOrder;
        if (this._search_id != 0) {
            var sql = "select g.link3, g.title , g.author_email, g.author_name, g.category, date(g.updated) as updated, g.key, g.starred, g.folder from gdocs g, search_results r where r.search_id=" + this._search_id + " and g.key=r.key  order by " + this._sortOrder + " " + this._sortUpDownOrder
        }
        //console.info(sql);
        var results = $sqlite.select(this._DBFile, sql);
		sessionObj = this._session.getSession();
		for (var i = 0; i < results.length; i++) {
			////console.log(results[i]['author_email']+","+sessionObj.username);
            if(results[i]['author_email'] == sessionObj.username)
				results[i]['author_name'] = "me";
        }

        //console.info("Search Results: " + results.length + " -->" + txt);
        var folders = $sqlite.select(this._DBFile, "select key, folder from folders;");
        var myfolders = {};
        for (var j = 0; j < folders.length; j++) {
            if (!myfolders[folders[j]["key"]]) {
                myfolders[folders[j]["key"]] = []
            }
            myfolders[folders[j]["key"]].push(folders[j]["folder"])
        }
        //console.log(myfolders);
        d = new Date();
        this._jstpl.assign("folders", myfolders);
        this._jstpl.assign("results", results);
        this._jstpl.build("list.tpl", "searchResultsBox", true);
        //Behaviour.apply();
        n = new Date();
        //console.info(n.getTime() - d.getTime() + "ms");
        this.addFoldersMenu();
		
        this.filterDocs();
		//
    },
	ExecuteSmartFolders: function(id){
		var smartfolders = $sqlite.select(this._DBFile, "select * from smartfolders where id="+id+"");
		//alert("select * from smartfolders where id='"+id+"");
		document.getElementById('cSearchInput').value = '';
		document.getElementById("searchInput").value = '';
		if(smartfolders[0]['fsearch'] == '' && this._search_id != 0)
		{
			this._search_id = 0;
			this.createDocs();
		}
		
		
		//alert(smartfolders[0]['ffilter']);
		document.getElementById("searchInput").blur();
		document.getElementById("searchInput").value = smartfolders[0]['ffilter'] ;
		document.getElementById("searchInput").style.color = "#000000";
		this._selectedFolder = false;
		this.filterDocs();
		this.toggleSearch(document.getElementById('_filter'));
		if(smartfolders[0]['fsearch'] != '')
		{
			document.getElementById('cSearchInput').value = smartfolders[0]['fsearch'];
			this.toggleSearch(document.getElementById('_content'));
			this.searchDocs();
		}	
		document.getElementById("folders_menu").label = smartfolders[0]['fname'];
        document.getElementById("folders_menu").style.backgroundImage = "url(chrome://gdocsbar/skin/images/folder1.png)";
	},
    filterDocs: function(updateNumbers) {
		var authorFilter = false;
        txt = document.getElementById("searchInput").value;
        if (txt == this._defaultSearchTxt) {
            txt = ""
        } else if (txt == "undefined") {
            txt = ""
        } else if (txt.indexOf("@author") == 0){
			authorFilter = true;
			var author = txt.substr(7);
			author = author.trim();
			txt = ""
			
			//console.log(txt);
		}
        //console.error(txt);
        if (this._starred == true) {
            var starred = " and g.starred='TRUE' "
        } else {
            var starred = ""
        }
        if (this._sortOrder == "title") {
            this._sortOrder = "lower(title)"
        }
        if (!this._selectedFolder) {
            joinQ = "";
            folderQ = ""
        } else {
            if (this._selectedFolder == this._defaultFolderTxt) {
                joinQ = " LEFT JOIN folders on g.key=folders.key ";
                folderQ = " and folders.key is NULL "
            } else {
                joinQ = " LEFT JOIN folders on g.key=folders.key ";
                folderQ = " and folders.key=g.key and folders.folder='" + this.sanitize(this._selectedFolder) + "' "
            }
        }
		if(authorFilter){
			folderQ += " and g.author_name like '%"+this.sanitize(author)+"%' ";
		}
		
		txt = this.sanitize(txt);
        if (!this._selectedTab) {
            var sql = "select g.key from gdocs g " + joinQ + " where g.title like '%" + txt + "%'" + starred + " " + folderQ + " order by " + this._sortOrder + " " + this._sortUpDownOrder
        } else {
            var sql = "select g.key from gdocs g " + joinQ + " where g.title like '%" + txt + "%' and g.category='" + this._selectedTab + "' " + starred + "  " + folderQ + " order by " + this._sortOrder + " " + this._sortUpDownOrder
        }
        if (this._search_id != 0) {
            if (!this._selectedTab) {
                var sql = "select g.key from gdocs g, search_results r " + joinQ + " where r.search_id=" + this._search_id + " and g.key=r.key and  g.title like '%" + txt + "%' " + starred + " " + folderQ + " order by " + this._sortOrder + " " + this._sortUpDownOrder
            } else {
                var sql = "select g.key from gdocs g, search_results r " + joinQ + " where r.search_id=" + this._search_id + " and g.key=r.key and  g.title like '%" + txt + "%' and g.category='" + this._selectedTab + "' " + starred + " " + folderQ + " order by " + this._sortOrder + " " + this._sortUpDownOrder
            }
        }
        if (updateNumbers != false) {
            var sql2 = "select COUNT(g.category) as total, g.category from gdocs g " + joinQ + " where g.title like '%" + txt + "%'" + starred + " " + folderQ + " group by g.category";
            if (this._search_id != 0) {
                //if (!this._selectedTab) {
                    var sql2 = "select COUNT(g.category) as total, g.category from gdocs g, search_results r " + joinQ + " where r.search_id=" + this._search_id + " and g.key=r.key and  g.title like '%" + txt + "%' " + starred + " " + folderQ + " group by g.category"
                //} else {
                //    var sql2 = "select COUNT(g.category) as total, g.category from gdocs g, search_results r " + joinQ + " where r.search_id=" + this._search_id + " and g.key=r.key and  g.title like '%" + txt + "%' and g.category='" + this._selectedTab + "' " + starred + " " + folderQ + " group by g.category"
                //}
            }
            var counts = $sqlite.select(this._DBFile, sql2);
            var myCounts = {};
            //console.info("results-length " + counts.length);
            var sum = 0;
            for (var p in counts[0]) {
                //console.info(p)
            }
            for (var i = 0; i < counts.length; i++) {
                myCounts[counts[i]["g.category"]] = parseInt(counts[i]["total"]);
                sum += parseInt(counts[i]["total"]);
                //console.error(counts[i]["g.category"] + ":" + counts[i]["total"])
            }
            //console.info(myCounts);
            if (myCounts["document"]) {
                document.getElementById("_d").value = myCounts["document"]
            } else {
                document.getElementById("_d").value = 0
            }
            if (myCounts["presentation"]) {
                document.getElementById("_p").value = myCounts["presentation"]
            } else {
                document.getElementById("_p").value = 0
            }
            if (myCounts["spreadsheet"]) {
                document.getElementById("_s").value = myCounts["spreadsheet"]
            } else {
                document.getElementById("_s").value = 0
            }
        }
        //console.info(sql);
        var results = $sqlite.select(this._DBFile, sql);

		
		if(authorFilter){
			if (this._search_id != 0) {
                var results1 = $sqlite.select(this._DBFile, "select COUNT(id) as ct from search_results where search_id=" + this._search_id)
            } else {
                var results1 = $sqlite.select(this._DBFile, "select COUNT(*) as ct from gdocs")
            }
            total = results1[0]["ct"];
            document.getElementById("sInfoTxt").value = "Filtered:  " + results.length + " in " + total + " Files.";
            document.getElementById("refresh_txt").value = "";
            document.getElementById("clear_txt").value = "Clear"
		}
        else if (txt == "") {
            if (this._search_id != 0) {
                var results1 = $sqlite.select(this._DBFile, "select COUNT(*) as ct from gdocs");
                total = results1[0]["ct"];
                document.getElementById("sInfoTxt").value = "Results: " + results.length + " in " + total + " Files.";
                document.getElementById("refresh_txt").value = "Show all";
                document.getElementById("clear_txt").value = ""
            } else {
                var results1 = $sqlite.select(this._DBFile, "select COUNT(*) as ct from gdocs");
                document.getElementById("sInfoTxt").value = " " + results.length + " Files.";
                document.getElementById("refresh_txt").value = "Refresh";
                document.getElementById("clear_txt").value = ""
            }
        } else{
            if (this._search_id != 0) {
                var results1 = $sqlite.select(this._DBFile, "select COUNT(id) as ct from search_results where search_id=" + this._search_id)
            } else {
                var results1 = $sqlite.select(this._DBFile, "select COUNT(*) as ct from gdocs")
            }
            total = results1[0]["ct"];
            document.getElementById("sInfoTxt").value = "Filtered:  " + results.length + " in " + total + " Files.";
            document.getElementById("refresh_txt").value = "";
            document.getElementById("clear_txt").value = "Clear"
        }
        var myResults = new Array();
        d = new Date();
        for (var i = 0; i < results.length; i++) {
            myResults[results[i]["key"]] = results[i]

        }
        sBox = document.getElementById("searchResultsBox").childNodes;
        var j = 0;
        //console.info("sbox: " + sBox.length + " -->");
        for (var i = 0; i < sBox.length; i++) {
            if (myResults[sBox[i].id]) {
                sBox[i].style.display = "";
                j++
            } else {
                sBox[i].style.display = "none"
            }
        }
        n = new Date();
        //console.info(n.getTime() - d.getTime() + "ms");
        Behaviour.apply();
		
    },
    login: function() {
		if(gdocsbarObj._session._busy == true){
			this.error_text("Resource busy. Please try again or close others to conitue.");
			return false;
		}
		
        document.getElementById("captcha_link").style.display = "none";
        document.getElementById("error_txt").style.display = "none";
        username = document.getElementById("username").value;
        password = document.getElementById("password").value;
        if (!this.validateEmail(username)) {
            this.error_text("Please enter your complete email");
            return false
        } else {
            if (!password) {
                this.error_text("Please enter your password");
                return false
            }
        }
        //console.info(username + "," + password);
        remember = document.getElementById("remember_me").checked;
        if (remember) {
            this.savePassword("chrome://gdocsbar/content/gdocsbar.xul", username, password)
        } else {
            this.deletePassword("chrome://gdocsbar/content/gdocsbar.xul", username)
        }
        //clearInterval(this._sessiontimer);
        YAHOO.util.Connect.initHeader("Cookie", "", false);
		this._session.setBusy();
        YAHOO.util.Connect.asyncRequest("POST", "https://www.google.com/accounts/ClientLogin", {
            success: this.loginSuccess,
            failure: this.loginFail,
            customevents: {
                onStart: this.startLoad,
                onComplete: this.completeLoad
            },
            scope: this
        },
        "Email=" + username + "&Passwd=" + password + "&service=writely&source=sandosh&accountType=HOSTED_OR_GOOGLE");
		
    },
    logout: function() {
        this._AUTH = null;
        this._session.destroySession();
gdocsbarObj._session._busy == false;
		document.getElementById("folders_menu").label = "All Items";
        document.getElementById("folders_menu").style.backgroundImage = "url(chrome://gdocsbar/skin/images/folder_home.png)"

		this.callMenuItem(document.getElementById("_a"));
		
		this._selectedFolder = null;
        document.getElementById("searchPage").collapsed = true;
        document.getElementById("loginPage").collapsed = false;
        this.setErrorText("You have signed out.");
		this._jstpl.assign("results", []);
        this._jstpl.build("list.tpl", "searchResultsBox", true);
		this._jstpl8.assign('list', []);
		this._jstpl8.build('templatelistmenu.tpl','templates_menupop',true);
		this._jstpl4.assign("total", 'Loading...');
        this._jstpl4.assign("list", []);
        this._jstpl4.assign("not_in_folders", 0);
		this._jstpl4.assign("smartfolders", []);
        this._jstpl4.build("list4.tpl", "folders_menupop", true)


		var flushTableQuery = "DELETE FROM feeds;";
        $sqlite.cmd(this._DBFile, flushTableQuery);
        var flushTableQuery = " DELETE from gdocs;";
        $sqlite.cmd(this._DBFile, flushTableQuery);
        $sqlite.cmd(this._DBFile, "DELETE from folders;");
		this._search_id = 0;
		document.getElementById('cSearchInput').value = '';
		document.getElementById("searchInput").value = '';
    },
    loginSuccess: function(o) {
        document.getElementById("_user_email").value = document.getElementById("username").value;
        document.getElementById("searchPage").collapsed = false;
        document.getElementById("loginPage").collapsed = true;
        //console.log(o);
        str = o.responseText.replace(/\n/g, "");
        this._AUTH = str.substr(str.indexOf("Auth=") + 5);
        //console.log(this._AUTH);
        this._useremail = document.getElementById("username").value;
        this.getFeed();
		this._session.setSession(this._AUTH, document.getElementById("username").value);
		this.addTemplatesMenu(); 
		this.addFoldersMenu();
    },
    loginFail: function(o) {
        //console.error(o);
        txt = o.responseText;
        lines = txt.split("\n");
        for (var i = 0; i < lines.length; i++) {
            line = lines[i];
            var words = line.split("=");
            if (words[0] == "Error") {
                error = words[1]
            }
        }
        switch (error) {
        case "BadAuthentication":
            error_txt = "The username or password is incorrect. Please try again.";
            break;
        case "NotVerified":
            error_txt = "The account email address has not been verified. Please access your Google account directly to resolve the issue before logging in this application.";
            break;
        case "TermsNotAgreed":
            error_txt = "You have not agreed to terms. Please access your Google account directly to resolve the issue before logging in this application.";
            break;
        case "CaptchaRequired":
            error_txt = "A CAPTCHA is required. Please try again after unlocking.";
            document.getElementById("captcha_link").style.display = "";
            break;
        case "Unknown":
            error_txt = "The error is unknown or unspecified; the request contained invalid input or was malformed.";
            break;
        case "AccountDeleted":
            error_txt = "Your user account has been deleted.";
            break;
        case "AccountDisabled":
            error_txt = "Your user account has been disabled.";
            break;
        case "ServiceDisabled":
            error_txt = "The user's access to the specified service has been disabled. (The user account may still be valid.)";
            break;
        case "ServiceUnavailable":
            error_txt = "The service is not available; try again later.";
            break;
        default:
            error_txt = "The error is unknown or unspecified.";
            break
        }
        dnode = document.getElementById("error_txt");
        dnode.style.display = "";
        while (dnode.childNodes.length > 0) {
            dnode.removeChild(dnode.childNodes[0])
        }
        tnode = document.createTextNode(error_txt);
        document.getElementById("error_txt").appendChild(tnode);
		this._session.setFree();
    },
    error_text: function(error_txt) {
        dnode = document.getElementById("error_txt");
        dnode.style.display = "";
        while (dnode.childNodes.length > 0) {
            dnode.removeChild(dnode.childNodes[0])
        }
        tnode = document.createTextNode(error_txt);
        document.getElementById("error_txt").appendChild(tnode)
    },
    validateEmail: function(email) {
        var emailpat = /^([a-zA-Z0-9])+([\.a-zA-Z0-9_-])*@([a-zA-Z0-9-])+(\.[a-zA-Z0-9_-]+)+$/;
        if (!emailpat.test(email)) {
            return false
        }
        return true
    },
    /*getPassword: function(url, username) {
        var pmInternal = Components.classes["@mozilla.org/passwordmanager;1"].getService().QueryInterface(Components.interfaces.nsIPasswordManagerInternal);
        if (!pmInternal) {
            return null
        }
        var hostout = {
            value: ""
        };
        var userout = {
            value: ""
        };
        var passwordout = {
            value: ""
        };
        try {
            pmInternal.findPasswordEntry(url, username, null, hostout, userout, passwordout);
            return {
                u: userout.value,
                p: passwordout.value
            }
        } catch(e) {
            //console.info("findPasswordEntry() failed\n")
        }
        return null
    },
    savePassword: function(url, username, password) {
        if (!url || !username || !password) {
            return false
        }
        var pm = Components.classes["@mozilla.org/passwordmanager;1"].getService().QueryInterface(Components.interfaces.nsIPasswordManager);
        if (!pm) {
            return false
        }
        this.deletePassword(url, username);
        try {
            pm.addUser(url, username, password);
            //console.info("addUser success\n")
        } catch(e) {
            //console.error("addUser failed\n");
            return false
        }
        return true
    },
    deletePassword: function(url, username) {
        if (!url || !username) {
            return false
        }
        var pm = Components.classes["@mozilla.org/passwordmanager;1"].getService().QueryInterface(Components.interfaces.nsIPasswordManager);
        if (!pm) {
            return false
        }
        try {
            pm.removeUser(url, username)
        } catch(e) {
            //console.error("removeUser() failed\n");
            return false
        }
        return true
    }*/


	getPassword: function(url, username, type) {
		if(!type)
			type = 'gdocs';
		if ("@mozilla.org/passwordmanager;1" in Components.classes) {
		   // Password Manager exists so this is not Firefox 3 (could be Firefox 2, Netscape, SeaMonkey, etc).
		   // Password Manager code
			var pmInternal = Components.classes["@mozilla.org/passwordmanager;1"].getService().QueryInterface(Components.interfaces.nsIPasswordManagerInternal);
	        if (!pmInternal) {
	            return null
	        }
	        var hostout = {
	            value: ""
	        };
	        var userout = {
	            value: ""
	        };
	        var passwordout = {
	            value: ""
	        };
	        try {
	            pmInternal.findPasswordEntry(url+"#"+type, username, null, hostout, userout, passwordout);
	            return {
	                u: userout.value,
	                p: passwordout.value
	            }
	        } catch(e) {
	            //console.info("findPasswordEntry() failed\n")
	        }
		}
		else if ("@mozilla.org/login-manager;1" in Components.classes) {
		   // Login Manager exists so this is Firefox 3
		   // Login Manager code
			try{
				var myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
				                         .getService(Components.interfaces.nsILoginManager);
				var password = null;
				   // Find users for the given parameters
				   var logins = myLoginManager.findLogins({}, 'chrome://gdocsbar/', type, null);
					
					
				   // Find user from returned array of nsILoginInfo objects
					
				   for (var i = 0; i < logins.length; i++) {
				      //if (logins[i].username == username) {
						username = logins[i].username;
				         password = logins[i].password;
					
				         break;
				      //}
				   }
				if(password)
					return {
		                u:username,
		                p:password
		            }
			}
			catch(e)
			{	alert(e); }
			
		}
		
        
        return null
    },

	    savePassword: function(url, username, password, type) {
			if(!type)
				type = 'gdocs';
				
	        if (!url || !username || !password) {
	            return false
	        }
			this.deletePassword(url, username, type);
	
			if ("@mozilla.org/passwordmanager;1" in Components.classes) {
			   // Password Manager exists so this is not Firefox 3 (could be Firefox 2, Netscape, SeaMonkey, etc).
			   // Password Manager code
				var pm = Components.classes["@mozilla.org/passwordmanager;1"].getService().QueryInterface(Components.interfaces.nsIPasswordManager);
		        if (!pm) {
		            return false
		        }
		        
		        try {
		            pm.addUser(url+"#"+type, username, password);
		            console.info("addUser success\n")
		        } catch(e) {
		            
		            return false
		        }
			}
			else if ("@mozilla.org/login-manager;1" in Components.classes) {
			   // Login Manager exists so this is Firefox 3
			   // Login Manager code
				try{
				var myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
			                                .getService(Components.interfaces.nsILoginManager);
				var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
											                                             Components.interfaces.nsILoginInfo,
											                                             "init");
				var extLoginInfo = new nsLoginInfo('chrome://gdocsbar/',
			                      type, null,
			                      username, password, "", "");
			
				 myLoginManager.addLogin(extLoginInfo);
				}
				catch(e)
				{
					alert(e);
				}
			}
			
	        
	        return true
	    },
		deletePassword: function(url, username, type) {
			if(!type)
				type = 'gdocs';
				
	        if ("@mozilla.org/passwordmanager;1" in Components.classes) {
			   // Password Manager exists so this is not Firefox 3 (could be Firefox 2, Netscape, SeaMonkey, etc).
			   // Password Manager code
				if (!url || !username) {
		            return false
		        }
		        var pm = Components.classes["@mozilla.org/passwordmanager;1"].getService().QueryInterface(Components.interfaces.nsIPasswordManager);
		        if (!pm) {
		            return false
		        }
		        try {
		            pm.removeUser(url+"#"+type, username)
		        } catch(e) {
		            //
		            return false
		        }
		        return true
			}
			else if ("@mozilla.org/login-manager;1" in Components.classes) {
			   // Login Manager exists so this is Firefox 3
			   // Login Manager code
				try {
				   // Get Login Manager 
				   var passwordManager = Components.classes["@mozilla.org/login-manager;1"]
				                         .getService(Components.interfaces.nsILoginManager);

				   // Find users for this extension 
				   var logins = passwordManager.findLogins({}, 'chrome://gdocsbar/', type, null);

				   for (var i = 0; i < logins.length; i++) {
				      if (logins[i].username == username) {
				         passwordManager.removeLogin(logins[i]);
				         break;
				      }
				   }
				}
				catch(ex) {
				   // This will only happen if there is no nsILoginManager component class
				}
				
			}
			
	    }



,
    getDropFiles: function(dropSession) {
        for (var m = 0; m < dropSession.numDropItems; m++) {
            var tobj = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
            tobj.addDataFlavor("application/x-moz-file");
            //tobj.addDataFlavor("text/x-moz-url");
		 	tobj.addDataFlavor("text/html");
		  	tobj.addDataFlavor("text/unicode");
            dropSession.getData(tobj, m);


            var dataObj = new Object();
            var dropSizeObj = new Object();
            var flavourObj = new Object();
            tobj.getAnyTransferData(flavourObj, dataObj, dropSizeObj);
			console.info("i am here");
			console.info(flavourObj.value.toString());
			//prompt("Save as", "default value in the text field");
            if(flavourObj.value.toString() == "text/x-moz-url")
			{
				var myObj = dataObj.value.QueryInterface(Components.interfaces.nsISupportsString);
				console.info(dataObj);
				console.info(dataObj.data);
				console.info(myObj);
			}
			else if(flavourObj.value.toString() == "text/html"){
				var myObj = dataObj.value.QueryInterface(Components.interfaces.nsISupportsString);
				this._uploadQ.push({"data": dataObj, "_size":dropSizeObj, "_type": "data", "name": prompt("Save as", "file name")+(this.getCharPreference('clipboardExtension') ? "."+this.getCharPreference('clipboardExtension') : "")});
			}
			else if (flavourObj.value.toString() == "application/x-moz-file") {
               
            var fileObj = dataObj.value.QueryInterface(Components.interfaces.nsIFile);
            _path = fileObj.parent ? fileObj.parent.path: fileObj.path;
            var dupe = false;
            for (var i = 0; i < this._uploadQ.length; i++) {
                path = this._uploadQ[i].file.parent ? this._uploadQ[i].file.parent.path: this._uploadQ[i].file.path;
                if (fileObj.leafName == this._uploadQ[i].file.leafName && path == _path) {
                    dupe = true;
                    break
                }
            }
            if (dupe || fileObj.isDirectory()) {
                continue
            }
            this._uploadQ.push({"file": fileObj, "_type": "file", "name": fileObj.leafName});
			}
            /*var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
            var fileURI = ios.newFileURI(fileObj);*/
        }

        this._jstpl2.assign("list", this._uploadQ);
        this._jstpl2.build("list2.tpl", "QTab", true);
        this.processQ()
    },
    popFromQ: function(index) {
        this._uploadQ.splice(index, 1);
        this._jstpl2.assign("list", this._uploadQ);
        this._jstpl2.build("list2.tpl", "QTab", true)
    },
    processQ: function() {
        var uploadStatus = YAHOO.util.Connect.isCallInProgress(this._uploadConnection);
        if (!uploadStatus && this._uploadQ.length > 0) {
            if(this._uploadQ[0]._type == "file")
				this.upload(this._uploadQ[0].file);
			else if(this._uploadQ[0]._type == "data")
				this.uploadClipBoard(this._uploadQ[0]);
            this._uploadQ.splice(0, 1);
            this._jstpl2.assign("list", this._uploadQ);
            this._jstpl2.build("list2.tpl", "QTab", true)
        } else {
            if (this._uploadQ.length == 0) {
                document.getElementById("upload_txt").style.display = "none";
                document.getElementById("upload_txt").value = ""
            }
        }
    },
	uploadClipBoard: function(data){
		
		
		document.getElementById("upload_txt").style.display = "";
        document.getElementById("upload_txt").value = "Uploading: " + data.name;


		const BOUNDARY = "END_OF_PART";
        const MULTI = "@mozilla.org/io/multiplex-input-stream;1";
        const FINPUT = "@mozilla.org/network/file-input-stream;1";
        const STRINGIS = "@mozilla.org/io/string-input-stream;1";
        const BUFFERED = "@mozilla.org/network/buffered-input-stream;1";
        const nsIMultiplexInputStream = Components.interfaces.nsIMultiplexInputStream;
        const nsIFileInputStream = Components.interfaces.nsIFileInputStream;
        const nsIStringInputStream = Components.interfaces.nsIStringInputStream;
        const nsIBufferedInputStream = Components.interfaces.nsIBufferedInputStream;

		this._uploadHistory.push({
            "file": data.name,
            "status": false,
            "error": ""
        });
		
		console.log(data.data);
		var buf = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        buf.setData(data.data.value, data.data.value.toString().length);
		console.log(data.data.value.toString().length);
		
		
		var mis = Components.classes[MULTI].createInstance(nsIMultiplexInputStream);
        //var fin = Components.classes[FINPUT].createInstance(nsIFileInputStream);
        //fin.init(file, 1, 292, null);
        //var buf = Components.classes[BUFFERED].createInstance(nsIBufferedInputStream);
        //buf.init(fin, (file.fileSize - 1));
        var mime_1 = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        var mime_1_string = new String();
        mime_1_string += "\r\n";
        mime_1_string += "Media multipart posting\r\n";
        mime_1_string += "\r\n--" + BOUNDARY + "\r\n";
        mime_1_string += "Content-Type: application/atom+xml\r\n";
        mime_1_string += "\r\n";
        mime_1_string += '<?xml version=\'1.0\' encoding=\'UTF-8\'?><atom:entry xmlns:atom="http://www.w3.org/2005/Atom"><atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/docs/2007#spreadsheet" /><atom:title>' + data.name + "</atom:title></atom:entry>\r\n";
        mime_1_string += "\r\n--" + BOUNDARY + "\r\n";
        mime_1_string += "Content-Type: text/html\r\n\r\n";
        mime_1.setData(mime_1_string, mime_1_string.length);
        var hsis = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        var sheader = new String();
        sheader += "\r\n";
        sheader += "--" + BOUNDARY + '\r\nContent-disposition: form-data;name="addfile"\r\n\r\n1';
        sheader += "\r\n--" + BOUNDARY + "\r\n";
        sheader += 'Content-disposition: form-data;name="filename";filename="' + data.name + '"\r\n';
        sheader += "Content-Type: application/octet-stream\r\n";
        //sheader += "Content-Length: " + data._size + "\r\n\r\n";
        hsis.setData(sheader, sheader.length);
        var endsis = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        var bs = new String("\r\n--" + BOUNDARY + "--\r\n");
        endsis.setData(bs, bs.length);
        mis.appendStream(mime_1);
        mis.appendStream(buf);
        mis.appendStream(endsis);
        console.log(mis);

        YAHOO.util.Connect.resetDefaultHeaders();
        YAHOO.util.Connect.initHeader("Authorization", "GoogleLogin auth=" + this._AUTH);
        YAHOO.util.Connect.initHeader("Content-Length", mis.available() - 2);
        YAHOO.util.Connect.setDefaultPostHeader("multipart/related; boundary=" + BOUNDARY);
        YAHOO.util.Connect.initHeader("Slug", data.name);
        YAHOO.util.Connect.initHeader("MIME-version", "1.0");
        YAHOO.util.Connect.initHeader("Cookie", "", false);
        this._uploadConnection = YAHOO.util.Connect.asyncRequest("POST", "http://docs.google.com/feeds/documents/private/full", {
            success: this.uploadSuccess,
            failure: this.uploadFail,
            scope: this
        },
        mis);

	},
	executeUploadTemplate: function(file, newFile){
		var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		if (!aFile) return false;
		var dir = this._session.getLocationFile();
		sessionObj = this._session.getSession();
		if(newFile)
			aFile.initWithPath(dir.path+'/content/usertemplates/new/'+file);
		else
			aFile.initWithPath(dir.path+'/content/usertemplates/'+sessionObj.username+'/'+file);
		var name = prompt("Please enter name:");
		if(aFile.exists() && name)
			this.uploadTemplate(aFile, name);
	},
	uploadTemplate: function(file, name) {
        this._uploadHistory.push({
            "file": name,
            "status": false,
            "error": ""
        });
        document.getElementById("upload_txt").style.display = "";
        document.getElementById("upload_txt").value = "Uploading: " + name;
        var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var fileURI = ios.newFileURI(file);
        //console.log("Le fichier " + file.leafName + " a été selectionné et pèse " + file.fileSize + "\n");
        const BOUNDARY = "END_OF_PART";
        const MULTI = "@mozilla.org/io/multiplex-input-stream;1";
        const FINPUT = "@mozilla.org/network/file-input-stream;1";
        const STRINGIS = "@mozilla.org/io/string-input-stream;1";
        const BUFFERED = "@mozilla.org/network/buffered-input-stream;1";
        const nsIMultiplexInputStream = Components.interfaces.nsIMultiplexInputStream;
        const nsIFileInputStream = Components.interfaces.nsIFileInputStream;
        const nsIStringInputStream = Components.interfaces.nsIStringInputStream;
        const nsIBufferedInputStream = Components.interfaces.nsIBufferedInputStream;
        var mis = Components.classes[MULTI].createInstance(nsIMultiplexInputStream);
        var fin = Components.classes[FINPUT].createInstance(nsIFileInputStream);
        fin.init(file, 1, 292, null);
        var buf = Components.classes[BUFFERED].createInstance(nsIBufferedInputStream);
        buf.init(fin, (file.fileSize - 1));
        var mime_1 = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        var mime_1_string = new String();
        mime_1_string += "\r\n";
        mime_1_string += "Media multipart posting\r\n";
        mime_1_string += "\r\n--" + BOUNDARY + "\r\n";
        mime_1_string += "Content-Type: application/atom+xml\r\n";
        mime_1_string += "\r\n";
        mime_1_string += '<?xml version=\'1.0\' encoding=\'UTF-8\'?><atom:entry xmlns:atom="http://www.w3.org/2005/Atom"><atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/docs/2007#spreadsheet" /><atom:title>' + name + "</atom:title></atom:entry>\r\n";
        mime_1_string += "\r\n--" + BOUNDARY + "\r\n";
        mime_1_string += "Content-Type: " + (this.getMIMETypeForURI(fileURI) ? this.getMIMETypeForURI(fileURI) : this.getMIMETypeForExt(file.leafName)) + "\r\n\r\n";
        mime_1.setData(mime_1_string, mime_1_string.length);
        var hsis = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        var sheader = new String();
        sheader += "\r\n";
        sheader += "--" + BOUNDARY + '\r\nContent-disposition: form-data;name="addfile"\r\n\r\n1';
        sheader += "\r\n--" + BOUNDARY + "\r\n";
        sheader += 'Content-disposition: form-data;name="filename";filename="' + name + '"\r\n';
        sheader += "Content-Type: application/octet-stream\r\n";
        sheader += "Content-Length: " + file.fileSize + "\r\n\r\n";
        hsis.setData(sheader, sheader.length);
        var endsis = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        var bs = new String("\r\n--" + BOUNDARY + "--\r\n");
        endsis.setData(bs, bs.length);
        mis.appendStream(mime_1);
        mis.appendStream(buf);
        mis.appendStream(endsis);
        //console.log(buf);
        YAHOO.util.Connect.resetDefaultHeaders();
        YAHOO.util.Connect.initHeader("Authorization", "GoogleLogin auth=" + this._AUTH);
        YAHOO.util.Connect.initHeader("Content-Length", mis.available() - 2);
        YAHOO.util.Connect.setDefaultPostHeader("multipart/related; boundary=" + BOUNDARY);
        YAHOO.util.Connect.initHeader("Slug", name);
        YAHOO.util.Connect.initHeader("MIME-version", "1.0");
        YAHOO.util.Connect.initHeader("Cookie", "", false);
        this._uploadConnection = YAHOO.util.Connect.asyncRequest("POST", "http://docs.google.com/feeds/documents/private/full", {
            success: this.uploadTemplateSuccess,
            failure: this.uploadFail,
            scope: this
        },
        mis)
    },
    upload: function(file) {
        this._uploadHistory.push({
            "file": file.leafName,
            "status": false,
            "error": ""
        });
        document.getElementById("upload_txt").style.display = "";
        document.getElementById("upload_txt").value = "Uploading: " + file.leafName;
        var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var fileURI = ios.newFileURI(file);
        //console.log("Le fichier " + file.leafName + " a été selectionné et pèse " + file.fileSize + "\n");
        const BOUNDARY = "END_OF_PART";
        const MULTI = "@mozilla.org/io/multiplex-input-stream;1";
        const FINPUT = "@mozilla.org/network/file-input-stream;1";
        const STRINGIS = "@mozilla.org/io/string-input-stream;1";
        const BUFFERED = "@mozilla.org/network/buffered-input-stream;1";
        const nsIMultiplexInputStream = Components.interfaces.nsIMultiplexInputStream;
        const nsIFileInputStream = Components.interfaces.nsIFileInputStream;
        const nsIStringInputStream = Components.interfaces.nsIStringInputStream;
        const nsIBufferedInputStream = Components.interfaces.nsIBufferedInputStream;
        var mis = Components.classes[MULTI].createInstance(nsIMultiplexInputStream);
        var fin = Components.classes[FINPUT].createInstance(nsIFileInputStream);
        fin.init(file, 1, 292, null);
        var buf = Components.classes[BUFFERED].createInstance(nsIBufferedInputStream);
        buf.init(fin, (file.fileSize - 1));
        var mime_1 = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        var mime_1_string = new String();
        mime_1_string += "\r\n";
        mime_1_string += "Media multipart posting\r\n";
        mime_1_string += "\r\n--" + BOUNDARY + "\r\n";
        mime_1_string += "Content-Type: application/atom+xml\r\n";
        mime_1_string += "\r\n";
        mime_1_string += '<?xml version=\'1.0\' encoding=\'UTF-8\'?><atom:entry xmlns:atom="http://www.w3.org/2005/Atom"><atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/docs/2007#spreadsheet" /><atom:title>' + file.leafName + "</atom:title></atom:entry>\r\n";
        mime_1_string += "\r\n--" + BOUNDARY + "\r\n";
        mime_1_string += "Content-Type: " + (this.getMIMETypeForURI(fileURI) ? this.getMIMETypeForURI(fileURI) : this.getMIMETypeForExt(file.leafName)) + "\r\n\r\n";
        mime_1.setData(mime_1_string, mime_1_string.length);
        console.log(mime_1_string);
        var hsis = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        var sheader = new String();
        sheader += "\r\n";
        sheader += "--" + BOUNDARY + '\r\nContent-disposition: form-data;name="addfile"\r\n\r\n1';
        sheader += "\r\n--" + BOUNDARY + "\r\n";
        sheader += 'Content-disposition: form-data;name="filename";filename="' + file.leafName + '"\r\n';
        sheader += "Content-Type: application/octet-stream\r\n";
        sheader += "Content-Length: " + file.fileSize + "\r\n\r\n";
        hsis.setData(sheader, sheader.length);
        var endsis = Components.classes[STRINGIS].createInstance(nsIStringInputStream);
        var bs = new String("\r\n--" + BOUNDARY + "--\r\n");
        endsis.setData(bs, bs.length);
        mis.appendStream(mime_1);
        mis.appendStream(buf);
        mis.appendStream(endsis);
        console.log(buf);
        YAHOO.util.Connect.resetDefaultHeaders();
        YAHOO.util.Connect.initHeader("Authorization", "GoogleLogin auth=" + this._AUTH);
        YAHOO.util.Connect.initHeader("Content-Length", mis.available() - 2);
        YAHOO.util.Connect.setDefaultPostHeader("multipart/related; boundary=" + BOUNDARY);
        YAHOO.util.Connect.initHeader("Slug", file.leafName);
        YAHOO.util.Connect.initHeader("MIME-version", "1.0");
        YAHOO.util.Connect.initHeader("Cookie", "", false);
        this._uploadConnection = YAHOO.util.Connect.asyncRequest("POST", "http://docs.google.com/feeds/documents/private/full", {
            success: this.uploadSuccess,
            failure: this.uploadFail,
            scope: this
        },
        mis)
    },
	uploadTemplateSuccess: function(o){
		this._UploadSuccessCount++;
        document.getElementById("_uploadDone").value = "Completed (" + this._UploadSuccessCount + ")";
        //console.log("upload success");
        this._uploadHistory[this._uploadHistory.length - 1].status = "success";
        this.processCompleted();
        this.processQ(true);
        this.getFeed();
		var xotree = new XML.ObjTree();
        a = xotree.parseDOM(o.responseXML.childNodes[0]);
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		var recentWindow = wm.getMostRecentWindow("navigator:browser");
		
		recentWindow.openUILinkIn(a.entry.link[0]["-href"], "tab");
	},
    uploadSuccess: function(o) {
        this._UploadSuccessCount++;
        document.getElementById("_uploadDone").value = "Completed (" + this._UploadSuccessCount + ")";
        //console.log("upload success");
        this._uploadHistory[this._uploadHistory.length - 1].status = "success";
        this.processCompleted();
        this.processQ(true);
        this.getFeed()
    },
    uploadFail: function(o) {
        this._thisUploadErrorCount++;
        console.error(o);
        console.error("upload Fail");
        this._uploadHistory[this._uploadHistory.length - 1].status = "error";
        this._uploadHistory[this._uploadHistory.length - 1].error = o.statusText;
        document.getElementById("error_text").value = this._thisUploadErrorCount;
        document.getElementById("error_text").style.display = "";
		document.getElementById("error_img").style.display = "";
        this.processCompleted();
        this.processQ(false)
    },
    processCompleted: function() {
        this._uploadHistory.reverse();
        this._jstpl3.assign("list", this._uploadHistory);
        this._jstpl3.build("list3.tpl", "finishedTab", true);
        this._uploadHistory.reverse()
    },
    getMIMEService: function() {
        const mimeSvcContractID = "@mozilla.org/mime;1";
        const mimeSvcIID = Components.interfaces.nsIMIMEService;
        const mimeSvc = Components.classes[mimeSvcContractID].getService(mimeSvcIID);
        return mimeSvc
    },
    getMIMETypeForURI: function(aURI, name) {
        try {
            mime = this.getMIMEService().getTypeFromURI(aURI);
            if (mime != "application/octet-stream" && mime != undefined) {
                return mime
            } else {
                return false
            }
        } catch(e) {
            return false
        }
        return false
    },
    getMIMETypeForExt: function(name) {
        name = name.toLowerCase();
        var ext = name.substr((name.lastIndexOf(".") + 1));
        console.log(ext);
        switch (ext) {
        case "txt":
            return "text/plain";
        case "doc":
            return "application/msword";
        case "rtf":
            return "application/msword";
        case "ppt":
            return "application/vnd.ms-powerpoint";
        case "pdf":
            return "application/pdf";
        case "pps":
            return "application/vnd.ms-powerpoint";
        case "xls":
            return "application/vnd.ms-excel";
        case "csv":
            return "application/vnd.ms-excel";
        case "odt":
            return "application/vnd.oasis.opendocument.text";
        case "sxw":
            return "application/vnd.sun.xml.writer";
        case "ods":
            return "application/vnd.oasis.opendocument.spreadsheet";
        case "csv":
          return "text/tab-separated-values";
        case "tab":
          return "text/tab-separated-values";
        case "html":
        case "htm":
          return "text/html";
        }
    },
    openUploadWindow: function() {
        var params = {
            inn: {
                name: "foo",
                description: "bar",
                enabled: true
            },
            out: null
        };
        a = window.openDialog("chrome://gdocsbar/chrome/upload.xul", "", "chrome, dialog, resizable=yes, alwaysRaised=yes", params)
    },
    test: function() {
        //console.log("testing window comm...")
    },
	expandUploadBox: function(){
		document.getElementById("_Qholder").style.height = '100px';	
		document.getElementById('upload_expand').style.display = 'none';
		document.getElementById('upload_contract').style.display = '';
	},
	contractUploadBox: function(){
		document.getElementById("_Qholder").style.height = '5px';
		document.getElementById('upload_expand').style.display = '';
		document.getElementById('upload_contract').style.display = 'none';		
	},
	getPreference: function(pref) {
		var gdocs = Components.classes['@mozilla.org/preferences-service;1']
		.getService(Components.interfaces.nsIPrefService)
		.getBranch('extensions.gdocsbar.');
		if(gdocs) {
			try {
				return gdocs.getBoolPref(pref);
			} catch(e) {
				return false; //possibly not a boolean type preference
			}
		}
	},
	getCharPreference: function(pref){
		var gdocs = Components.classes['@mozilla.org/preferences-service;1']
		.getService(Components.interfaces.nsIPrefService)
		.getBranch('extensions.gdocsbar.');
		if(gdocs) {
			try {
				return gdocs.getCharPref(pref);
			} catch(e) {
				return false; //possibly not a boolean type preference
			}
		}
	},
	openChooseTemplateFileDialog: function(){
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
		        .createInstance(nsIFilePicker);
		fp.init(window, "Select a File", nsIFilePicker.modeOpen);
		fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterImages);
		//fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);
		//fp.appendFilter("Template Files","*.doc; *.ppt");
		var dir = this._session.getLocationFile();
		//dir.initWithPath('usertemplates/');
		//alert(dir.path);
		
		
		var res = fp.show();
		if (res == nsIFilePicker.returnOK){
		  	var thefile = fp.file;
		//alert(thefile.leafName);
			var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			if (!aFile) return false;
		  	var aDir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		  	if (!aDir) return false;
			//aFile.initWithPath(thefile);
			aDir.initWithPath(dir.path+'/content/usertemplates');
			sessionObj = this._session.getSession();
			
			aDir.append(sessionObj.username);
			if( !aDir.exists() || !aDir.isDirectory() ) {   // if it doesn't exist, create
			   aDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
			}
			//alert(aDir.path);
			try{
			thefile.copyTo(aDir,null);
			}
			catch(e){
				if(e.name == 'NS_ERROR_FILE_ALREADY_EXISTS')
					alert('Template already exists. ');
			}
		}
		this.createTemplateList();
		this.addTemplatesMenu();
	},
	deleteTemplate: function(file){
		//alert(file);
		if(!confirm('Are you sure?'))
			return 0;
		
		var dir = this._session.getLocationFile();
		var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	  	if (!aFile) return false;
		sessionObj = this._session.getSession();
		aFile.initWithPath(dir.path+'/content/usertemplates/'+sessionObj.username+'/'+file);
		aFile.remove(false);
		this.createTemplateList();
	},
	getTemplateFileList: function(){
		
		var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
		
		var dir = this._session.getLocationFile();
		var aDir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	  	if (!aDir) return false;
		sessionObj = this._session.getSession();
		aDir.initWithPath(dir.path+'/content/usertemplates/'+sessionObj.username+'/');
		//alert(aDir.path);
		var array = [];
		try{
		var entries = aDir.directoryEntries;
		
		while(entries.hasMoreElements())
		{
		  var entry = entries.getNext();
		  entry.QueryInterface(Components.interfaces.nsIFile);
		console.log(entry.leafName);
		  if(entry.leafName != '.DS_Store' && entry.leafName != '.thumbs')
		  	array.push(entry);
		}
		}
		catch(e){
			console.error(e);
		}
		
		//alert(array);
		return array;
	},
	createTemplateList: function(){
		//alert('hi');
		
		if(this._jstpl7 == null){
			this._jstpl7 = new jsTemplateBuilder();
	        this._jstpl7.loadTemplate("templates/templatelist.tpl");
		}
		this._jstpl7.assign('list', this.getTemplateFileList());
		this._jstpl7.build("templatelist.tpl", "tamplatelist", true)
		
	},
	createSmartFolderList: function(){
		if(!this._jstpl6)
		{
			this._jstpl6 = new jsTemplateBuilder();
	        this._jstpl6.loadTemplate("templates/smartfolderlist.tpl");
		}
			sessionObj = this._session.getSession();
		var selectQuery = "select * from smartfolders where email='"+sessionObj.username+"' order by fname;";
        var list = $sqlite.select(this._DBFile, selectQuery);
		for(i=0; i<list.length; i++)
		{
			console.log(list[i]['fname']);
		}
		this._jstpl6.assign('list',list);
		this._jstpl6.build("smartfolderlist.tpl", "smartfolderlist", true)
	},
	deleteSmartFolder: function(id){
		if(!confirm('Are you sure?'))
			return 0;
		var deleteQuery = "delete from smartfolders where id="+id;
		$sqlite.cmd(this._DBFile, deleteQuery);
		this.createSmartFolderList();
	},
	editSmartTemplate: function(obj, fid, fname, ffilter, fsearch){
		console.log(obj);
		var editST = document.getElementById('editST');
		
		if(this._smartfolderbeingeditted == obj.getAttribute('_id')){
			obj.parentNode.removeChild(editST);
			obj.className='notselected';
			this._smartfolderbeingeditted = null;
			return 0;
		}
		this._smartfolderbeingeditted = obj.getAttribute('_id');
		
		
		
	//	range = document.createRange();
		
		nnn = document.createElement("vbox");
		nnn.style.backgroundColor = '#FFF298';
		nnn.id="editST"
	//	range.selectNode(obj.parentNode);
	//	range.insertNode(nnn);
		for(var i=0; i<obj.parentNode.childNodes.length; i++){
			//obj.parentNode.childNodes[i].style.display = '';
			obj.parentNode.childNodes[i].className='notselected';
		}
			if(editST != null)
				obj.parentNode.removeChild(editST);
		obj.className='selected';
		//obj.parentNode.style.display = 'none';
		obj.parentNode.insertBefore(nnn, obj.nextSibling);
		this._jstpl5.assign("id",fid);
		this._jstpl5.assign("name",fname);
		this._jstpl5.assign("filter",ffilter);
		this._jstpl5.assign("search",fsearch);
		this._jstpl5.build("smartfolderedit.tpl", "editST", true)
		
		document.getElementById('sf_edit_name').addEventListener("keypress", gdocsbarObj.sf_edit_keypress, true);
		document.getElementById('sf_edit_filter').addEventListener("keypress", gdocsbarObj.sf_edit_keypress, true);
		document.getElementById('sf_edit_search').addEventListener("keypress", gdocsbarObj.sf_edit_keypress, true);
	},
	sf_edit_keypress: function(event){
		if(event.keyCode == 13)
		gdocsbarObj.saveSmartFolder(gdocsbarObj._smartfolderbeingeditted);
	},
	sf_new_keypress: function(event){
		if(event.keyCode == 13)
		gdocsbarObj.saveNewSmartFolder();
	},
	saveSmartFolder: function(id){
		sessionObj = this._session.getSession();
		var selectQuery = "select id from smartfolders where fname='"+document.getElementById('sf_edit_name').value+"' and id!="+id+" and email='"+sessionObj.username+"';";
        var myArray1 = $sqlite.select(this._DBFile, selectQuery);
		if(myArray1.length != 0)
		{
			alert('Smart Folder name already exists.');
			return 0;
		}
		if((document.getElementById('sf_edit_name').value.trim()) == '')
		{
			alert('Smart Folder name cannot be empty');
			return 0;
		}
		var myInsertQuery = "UPDATE smartfolders set fname='"+document.getElementById('sf_edit_name').value+"', ffilter='"+document.getElementById('sf_edit_filter').value+"', fsearch='"+document.getElementById('sf_edit_search').value+"' where id="+id+";";
		console.log(myInsertQuery);
		try{
			$sqlite.cmd(this._DBFile, myInsertQuery);
		}
		catch(e){
			console.error(e);
		}
		/*var editST = document.getElementById('editST');
		editST.parentNode.removeChild(editST);
		document.getElementById('smartfolder'+id).className='notselected';
		*/
		this._smartfolderbeingeditted = null;
		this.createSmartFolderList();
		this.addFoldersMenu();
	},
	openNewSmartFolder: function(){
		a = document.getElementById('newST');
		a.style.display = '';
	}
	,
	closeNewSmartFolder: function(){
		a = document.getElementById('newST');
		a.style.display = 'none';
	},
	saveNewSmartFolder: function(){
		sessionObj = this._session.getSession();
		var selectQuery = "select id from smartfolders where fname='"+document.getElementById('sf_new_name').value+"' and email='"+sessionObj.username+"';";
        //alert(selectQuery);
		var myArray1 = $sqlite.select(this._DBFile, selectQuery);
		if(myArray1.length != 0)
		{
			alert('Smart Folder name already exists.');
			return 0;
		}
		if((document.getElementById('sf_new_name').value.trim()) == '')
		{
			alert('Smart Folder name cannot be empty');
			return 0;
		}
		//console.log(myArray1[0]);
		
		var myInsertQuery = "INSERT INTO smartfolders (fname, ffilter, fsearch, email) values ('"+document.getElementById('sf_new_name').value+"', '"+document.getElementById('sf_new_filter').value+"', '"+document.getElementById('sf_new_search').value+"', '"+sessionObj.username+"');";
	//	console.log(myInsertQuery);
		try{
			$sqlite.cmd(this._DBFile, myInsertQuery);
		}
		catch(e){
			console.error(e);
		}
		this.closeNewSmartFolder();
		this.createSmartFolderList();
		this.addFoldersMenu();
	},
	openTemplatesView: function(){
		this.callMoreMenuItem(document.getElementById('o_t')); 
		document.getElementById('morepage').collapsed=false;
		document.getElementById('searchPage').collapsed=true;
		document.getElementById('searchPage').setAttribute('force','false');
	},
	openSmartFoldersView: function(){
			this.callMoreMenuItem(document.getElementById('o_s')); 
			document.getElementById('morepage').collapsed=false;
			document.getElementById('searchPage').collapsed=true;
			document.getElementById('searchPage').setAttribute('force','false');
			this._smartfolderbeingeditted = null;
	}
};
if (!console) {
    var console = {
		consoledump: function(a){
			if(!gdocsbar.getPreference('debug'))
				return;
			TutTB_ConsoleService =Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
			TutTB_ConsoleService.logStringMessage('gdocsbar: ' + a);
		},
        log: function(a) {
            this.consoledump(a + "\n")
        },
        info: function(a) {
            this.consoledump(a + "\n")
        },
        error: function(a) {
            this.consoledump(a + "\n")
        }
    }
}
var $sqlite = {
    storageService: [],
    mDBConn: [],
    _initService: function(file) {
        var db = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
        db.append(file);
        this.storageService[file] = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
        this.mDBConn[file] = (this.storageService[file]).openDatabase(db)
    },
    select: function(file, sql, param) {
        if (this.storageService[file] == undefined) {
            this._initService(file)
        }
        var ourTransaction = false;
        if ((this.mDBConn[file]).transactionInProgress) {
            ourTransaction = true; (this.mDBConn[file]).beginTransactionAs((this.mDBConn[file]).TRANSACTION_DEFERRED)
        }
        var statement = (this.mDBConn[file]).createStatement(sql);
        if (param) {
            for (var m = 2, arg = null; arg = arguments[m]; m++) {
                statement.bindUTF8StringParameter(m - 2, arg)
            }
        }
        try {
            var dataset = [];
            while (statement.executeStep()) {
                var row = [];
                for (var i = 0, k = statement.columnCount; i < k; i++) {
                    row[statement.getColumnName(i)] = statement.getUTF8String(i)
                }
                dataset.push(row)
            }
        } finally {
            statement.reset()
        }
        if (ourTransaction) { (this.mDBConn[file]).commitTransaction()
        }
        return dataset
    },
    cmd: function(file, sql, param) {
        if (this.storageService[file] == undefined) {
            this._initService(file)
        }
        var ourTransaction = false;
        if ((this.mDBConn[file]).transactionInProgress) {
            ourTransaction = true; (this.mDBConn[file]).beginTransactionAs((this.mDBConn[file]).TRANSACTION_DEFERRED)
        }
        try {
            var statement = (this.mDBConn[file]).createStatement(sql)
        } catch(e) {
            //console.error(e)
        }
        if (param) {
            for (var m = 2, arg = null; arg = arguments[m]; m++) {
                statement.bindUTF8StringParameter(m - 2, arg)
            }
        }
        try {
            statement.execute()
        } finally {
            statement.reset()
        }
        if (ourTransaction) { (this.mDBConn[file]).commitTransaction()
        }
    }
};
Date.prototype.setISO8601 = function(string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));
    var offset = 0;
    var date = new Date(d[1], 0, 1);
    if (d[3]) {
        date.setMonth(d[3] - 1)
    }
    if (d[5]) {
        date.setDate(d[5])
    }
    if (d[7]) {
        date.setHours(d[7])
    }
    if (d[8]) {
        date.setMinutes(d[8])
    }
    if (d[10]) {
        date.setSeconds(d[10])
    }
    if (d[12]) {
        date.setMilliseconds(Number("0." + d[12]) * 1000)
    }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == "-") ? 1: -1)
    }
    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time))
};
Date.prototype.getSQLString = function() {
    x = this.getYear();
    var y = x % 100;
    var Year = y += (y < 38) ? 2000: 1900;
    var Month = this.leadingZero(this.getMonth() + 1);
    var Day = this.leadingZero(this.getDate());
    var Hours = this.leadingZero(this.getHours());
    var Minutes = this.leadingZero(this.getMinutes());
    var Seconds = this.leadingZero(this.getSeconds());
    var date = Year + "-" + Month + "-" + Day + " " + Hours + ":" + Minutes + ":" + Seconds;
    return date
};
Date.prototype.leadingZero = function(nr) {
    if (nr < 10) {
        nr = "0" + nr
    }
    return nr
}
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
}
