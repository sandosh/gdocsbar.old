var fup_panelDropObserver = 
{
	onDrop : function (evt, transferData, session) 
	{
		evt.preventDefault(); 
		console.info(evt);
		evt.preventDefault(); 
		gdocsbarObj.getDropFiles(session);
		
		document.getElementById('_Qholder').style.backgroundColor = "#93C2F1";
	},
	onDragOver : function (evt, transferData, session) 
	{
		document.getElementById('_Qholder').style.backgroundColor = "#FAE298";
		gdocsbarObj.expandUploadBox();
		evt.preventDefault(); 
		//console.log('ondragover...');
		
	},
	ondragenter : function (evt, transferData, session) 
	{

		evt.preventDefault(); 
		console.log('ondragenter...');

	},
	onDragExit : function (evt, transferData, session) 
	{

		evt.preventDefault(); 
		console.log('onDragExit...');
		document.getElementById('_Qholder').style.backgroundColor = "#93C2F1";
		
	},

	getSupportedFlavours: function ()
    {
      var flavourSet = new FlavourSet();
      flavourSet.appendFlavour("text/x-moz-url");
      flavourSet.appendFlavour("text/unicode");
      flavourSet.appendFlavour("application/x-moz-file", "nsIFile");
      return flavourSet;
    }
}


var  gdocsbarObj = null;



var myrules = {
		'#menu label.notSelected' : function(element){
			element.onclick = function(){
				gdocsbarObj.callMenuItem(this);
			}
		},
		'#optionstabs label' : function(element){
			element.onclick = function(){
				gdocsbarObj.callMoreMenuItem(this);
			}
		},
		'#smartfolderlist label.s_edit' :function(element){
			element.onclick = function(){
				gdocsbarObj.editSmartTemplate(this);
			}
		},
		'#smartfolderlist box' :function(element){
			element.onclick = function(){
				gdocsbarObj.editSmartTemplate(this);
			}
		},
		'#smartfolderlist label.s_delete' :function(element){
			element.onclick = function(e){
				alert(e.target);
				e.stopPropagation()
			}
		},
		'#sortBox label.off' : function(element){
			element.onclick = function(){
				gdocsbarObj.callsortList(this);
			}
		},
		'#orderBox label.off' : function(element){
			element.onclick = function(){
				gdocsbarObj.callsortOrderList(this);
			}
		},
		'#uploadTabs label.notSelected' : function(element){
			element.onclick = function(){
				gdocsbarObj.callUploadMenuItem(this);
			}
		}
		/*,
		'#searchResultsBox description' : function(element){
			element.onmouseover = function(){
				
				this.oldColor = this.style.backgroundColor;
				this.oldBgImg = this.style.backgroundImage;
				this.style.backgroundColor = '#DEEBFF';
				//this.style.backgroundImage = "url('')";
			};
				element.onmouseout = function(){
					this.style.backgroundColor = this.oldColor;
					//this.style.backgroundImage = this.oldBgImg;
				};
			
			element.onclick = function(e){
					gdocsbarObj.openMyUILink(this.id, e);
			}
		}*/,
		'#starB' : function(element){
			element.onclick = function(){
				if(this.className == 'off')
					{
						this.className = 'on';
						gdocsbarObj._starred = true;
						gdocsbarObj.createDocs();
					}
				else
					{
						this.className = 'off';
						gdocsbarObj._starred = false;
						gdocsbarObj.createDocs();
					}
			};
		}
	};

	

function init() {

	gdocsbarObj = gdocsbar;
	gdocsbarObj.init();

 Behaviour.register(myrules);

	//gdocsbarObj.getFeed();
	var contextMenu = document.getElementById("docsmenu");
	  if (contextMenu)
	    contextMenu.addEventListener("popupshowing", onContextShow, false);
	//textbox = document.getElementById('cSearchInput');
	document.getElementById('cSearchInput').addEventListener("keypress", search_keypress, true);
	document.getElementById('username').addEventListener("keypress", login_keypress, true);
	document.getElementById('password').addEventListener("keypress", login_keypress, true);
	document.getElementById('sf_new_name').addEventListener("keypress", gdocsbarObj.sf_new_keypress, true);
	document.getElementById('sf_new_filter').addEventListener("keypress", gdocsbarObj.sf_new_keypress, true);
	document.getElementById('sf_new_search').addEventListener("keypress", gdocsbarObj.sf_new_keypress, true);

 }
function search_keypress(event){
	switch(event.keyCode){
		case 13:
			gdocsbarObj.searchDocs();
			
		break;
	}
}
function login_keypress(event){
	switch(event.keyCode){
		case 13:
			gdocsbarObj.login();
			
		break;
	}
}
function onContextShow(event)
{
  	console.log(document.popupNode);
	gdocsbarObj.getAuthorForFilter(document.popupNode.id||document.popupNode.parentNode.id);
}

