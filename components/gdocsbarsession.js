/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Gdocsbarsession.
 *
 * The Initial Developer of the Original Code is
 * sandosh.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

const nsISupports = Components.interfaces.nsISupports;

// You can change these if you like
const CLASS_ID = Components.ID("93c39cae-9123-4a1a-bfb6-3ee3d3820a9b");
const CLASS_NAME = "";
const CONTRACT_ID = "@sandosh/gdocsbarsession;1";
//const INTERFACE = Components.interfaces.nsIGdocsbarsession;
// This is your constructor.
// You can do stuff here.
function Gdocsbarsession() {
  // you can cheat and use this
  // while testing without
  // writing your own interface
  this.wrappedJSObject = this;
}

// This is the implementation of your component.
Gdocsbarsession.prototype = {
	
	_session:null,
	_AUTH:null,
	_username:null,
	_busy:false,
  // for nsISupports
  QueryInterface: function(aIID)
  {
    // add any other interfaces you support here
    if (!aIID.equals(nsISupports))
        throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  },
	hello: function() {
      return "Hello Worlds!";
  },
	setSession: function(auth, username){
		this._session = true;
		this._AUTH = auth;
		this._username = username;
	},
	getSession: function(){
		return {session: this._session, auth: this._AUTH, username: this._username};
	},
	destroySession: function(){
		this._AUTH = null;
		this._session = null;
		this._username = null;
		return true;
	},
	setBusy: function(){
		this._busy = true;
	},
	setFree: function(){
		this._busy = false;
	},
	isBusy: function(){
		return this._busy;
	},
	getLocationFile: function(){
	    return __LOCATION__.parent.parent;
	}
}

//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var GdocsbarsessionFactory = {
  createInstance: function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    return (new Gdocsbarsession()).QueryInterface(aIID);
  }
};

// Module
var GdocsbarsessionModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID)
  {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return GdocsbarsessionFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return GdocsbarsessionModule; }
