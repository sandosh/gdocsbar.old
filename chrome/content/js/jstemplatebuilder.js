/**
 * jsTemplateBuilder
 * Template engine with javascript datas
 * @module diJsLibrary
 * @package jsTemplate
 * @version 1.3
 * @author Laurent Jouanneau
 * @date 30 sept 2005
 * @copyright Disruptive Innovations 2005
 * @licence MPL/GPL/LGPL
 */
/****** BEGIN LICENSE BLOCK *****
 *
 * The contents of this file are subject to the Mozilla Public License Version 1.1
 * (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis, WITHOUT
 * WARRANTY OF ANY KIND, either express or implied. See the License for the specific
 * language governing rights and limitations under the License.
 *
 * The Original Code is jsTemplate code.
 *
 * The Initial Developer of the Original Code is Laurent Jouanneau. Portions created
 * by the initial developer are Copyright (C) 2004 Disruptive Innovations.
 * All Rights Reserved.
 *
 * Contributor(s): .
 *
 * Alternatively, the contents of this file may be used under the terms of the GNU
 * General Public License Version 2 or later (the "GPL"), or the GNU Lesser General
 * Public License Version 2.1 or later (the "LGPL"), in which case the provisions
 * of the GPL or the LGPL are applicable  instead of those above.  If you wish to
 * allow use of your version of this file only under the terms of the GPL or the LGPL
 * and not to allow others to use your version of this file under the MPL, indicate your
 * decision by deleting  the provisions above and replace  them with the notice and other
 * provisions required by the GPL or the LGPL.  If you do not delete the provisions above,
 * a recipient may use your version of this file under either the MPL or the GPL or the LGPL
 ***** END LICENSE BLOCK ******/

/**
 * Constructor of the template engine
 * @param   object   params   the properties of this object will be the variables of the template
 */
function jsTemplateBuilder(params){
    this._templateDoc=null;
    this.errors=null;
    this.errorSilent=false;
    if(typeof(params) == 'object')
        this.parameters=params;
    else
        this.parameters={};
}

jsTemplateBuilder.prototype = {
   /**
    * namespace of the template tags
    */
    _nsTemplate :'http://disruptive-innovations.com/ns/jstemplate',

    /**
     * main method : generate content from a template file and variables
     * @param   string   tplUrl   url of the template file
     * @param   string/object   DOMtarget   element id from the current document, or the element itself, where the generated content wil be inserted
     * @param   boolean   clean   say if current child of the dom element wil be erased before insertion
     * @return   boolean   indicates if the generation is ok
     */
    build: function(tplUrl, DOMtarget, clean){

        try{
	console.log("load build");
            //this.loadTemplate(tplUrl);

            // we have a string in DOMtarget : we use getElementById
            if(typeof(DOMtarget) == 'string'){
                if(clean)
                    this._clean(document.getElementById(DOMtarget));
                this._build(this._templateDoc.firstChild, document.getElementById(DOMtarget));
            // we have an object in DOMtarget : we assume that it is a DOM element object
            }else if(typeof(DOMtarget) == 'object'){
                if(clean)
                    this._clean(DOMtarget);
                this._build(this._templateDoc.firstChild, DOMtarget);
            }else{
                console.error( "invalid DOMtarget");
            }
        }catch(e){
            this.errors = e.toString();
            if(!this.errorSilent){
                console.error( 'jsTemplateBuilder : '+tplUrl+ ' : '+ e.toString());
            }
            return false;
        }
        return true;
    },

    /**
     * internal recursive method to parse the template file and that generate content
     * @param   DOMElement   templateNode        the current node that the function will analyse, in the template file
     * @param   DOMElement   parentNodebuilt   the current node that is generated from the template
     * @return  nothing
     * @access private
     */
    _build : function(templateNode, parentNodebuilt){

        var i, tag, newNodebuilt, text, valeur,assignation;
	//	console.log("inside _build");
        // we parse all children of the current template node
        for(i=0; i < templateNode.childNodes.length; i++){
            tag =templateNode.childNodes[i];

            // for nodes that aren't element node
            if(tag.nodeType != tag.ELEMENT_NODE){
                // we ignore comments in template file
                if(tag.nodeType == tag.COMMENT_NODE){

                // we take care of text node and cdata node that aren't empty or that content not only space caracters
                }else if(tag.nodeType ==tag.TEXT_NODE || tag.nodeType== tag.CDATA_SECTION_NODE){
                    var trim = /^\s*(.*)\s*$/m.exec(tag.nodeValue);
                    if( !(trim && trim.length > 1 && trim[1].length ==0) ){
                        parentNodebuilt.appendChild(tag.cloneNode(true));
                    }

                // we include other nodes
                }else{
                  parentNodebuilt.appendChild(tag.cloneNode(true));
                }

            // here is the section that analyse tags of template language
            }else if(tag.namespaceURI == this._nsTemplate){

                switch(tag.localName){
                    case 'text':
                        // for <text> tag, we include some text from a template variable
                        if(tag.hasAttribute('value')){
                            text=tag.getAttribute('value');
                            parentNodebuilt.appendChild(document.createTextNode(this.evalstring(text)));
                        }
                        break;

                    case 'attribut' : // deprecated. for compatiblity with old french version
                    case 'attribute':
                        // for <attribut> tag, we add an attribute to the last generated tag
                        assignation=new Array();
                        assignation[0]=tag.getAttribute('name');
                        assignation[1]=tag.getAttribute('value');
                        if(assignation[0] && assignation[1])
                           parentNodebuilt.setAttribute(assignation[0], this.evalstring(assignation[1]));
                        else
                           console.error( "attribute in attribute tag are missing");
                        break;

                    case 'if':
                        // we have an if statement

                        // @todo verify that getElementsByTagNameNS retrieve only direct child of the <if> tag. i think it don't...
                        var iftrue =tag.getElementsByTagNameNS(this._nsTemplate,'iftrue');
                        var iffalse =tag.getElementsByTagNameNS(this._nsTemplate,'iffalse');

                        if(!iffalse.length && !iftrue.length){
                           // we haven't a <iftrue> and <iffalse> tag, so child nodes of the <if> tag
                           // will be generated only if the condition expression is true
                            if(this.evalstring(tag.getAttribute('condition'))){
                               this._build(tag,parentNodebuilt);
                            }
                        }else{
                            if(this.evalstring(tag.getAttribute('condition'))){
                               if(iftrue.length)
                                    this._build(iftrue[0],parentNodebuilt);
                            }else{
                                if(iffalse.length)
                                    this._build(iffalse[0],parentNodebuilt);
                            }
                        }
                        break;

                    case 'foreach':
                        // foreach statement

                        var from= tag.getAttribute('from');
                        var item= tag.getAttribute('item');
                        var key = tag.getAttribute('key');
                        if(from && item){
                            var fromvar = this.evalstring(from);
                            if(typeof(fromvar) != 'undefined'){
                              for (var keyname in fromvar) {
                                 this.parameters[item]=fromvar[keyname];
                                 if(key)
                                    this.parameters[key]=keyname;
                                 this._build(tag,parentNodebuilt);
                              }
                            }else
                               console.error( 'unknow "from" value in foreach');
                        }else{
                          console.error( "not enough attribute in foreach tag ");
                        }
                        break;

                     case 'assign':
                        // assign instruction : we modify/create a template variable
                        var name=tag.getAttribute('name');
                        var value=tag.getAttribute('value');
                        if(name && value){
                           this.parameters[name]=this.evalstring(value);
                        }else{
                          console.error( "not enough attribute in assign tag");
                        }
                        break;

                     case 'debug':
                        // debug instruction : we can dump some values during the parsing
                        var what = tag.getAttribute('show');
                        var label = tag.getAttribute('label');
                        if(what){
                           dump(label + ' : ' +this.evalstring(what));
                        }else if(label){
                           dump(label);
                        }else{
                          console.error( "show attribute missing in debug tag");
                        }
                        break;

                     default:
                         console.error( "unknow template tag : " + tag.localName);
               }

            // parsing of other tags : we will simply clone them in the target node
            }else{

                newNodebuilt= this._cloneNode(tag);

                // we take care of the 'attribute' attribute from the jsTemplateBuilder
                // namespace : we add an attribute to the newNodebuilt node.
                if(tag.hasAttributeNS( this._nsTemplate, 'attribute')){
                   text = tag.getAttributeNS( this._nsTemplate, 'attribute');
                   assignation = text.split('=');
                   if(assignation.length > 0){
                      newNodebuilt.setAttribute(assignation[0],this.evalstring(assignation[1]));
                   }
                }

                //newNodebuilt.setAttributeNS(this._nsTemplate, 'builtbytpl','true');
                // parse child nodes of the current template tag node, before to insert
                // the generated content to its parent node (constructor of tags that are
                // binding to an xbl component may need all attributes of the tag, all
                // children of this tag, But the tag is not currently yet finished because
                // of the possibly existence of <attribute> tag)
                
				this._build(tag,newNodebuilt);
				
                parentNodebuilt.appendChild(newNodebuilt);

            }
        }
    },

    /**
     * clone a node with its attribute
     * @param   DOMElement   tag   tag to clone
     * @return   DOMElement tag cloned
     * @todo i saw some little problems with cloneNode method of DOMElement that are binding
     *   to an xbl component (problems with event handlers ?-( ). Need to verify that problem.
     *   it's why that i clone "by hand"
     * @access private
     */
    _cloneNode : function (tag){
       var elt = document.createElementNS(tag.namespaceURI, tag.localName);

       var i;
       for(i=0; i < tag.attributes.length; i ++){
          elt.setAttributeNode(tag.attributes.item(i).cloneNode(true));
       }
       return elt;
    },

    /**
     * eval a value of a parameter. It can be just a name of a variable of the template, but
     * also a script
     * @param   string   jst_script   the script/variable name to eval
     * @return   the value
     */
    evalstring : function( jst_script){
        var jst_return='';
        with(this.parameters){
            jst_return=eval(jst_script);
        }
       return jst_return;
    },

    /**
     * load a template from an url, into a DOM document (_templateDoc property)
     * @param   string   url   the URL of the template
     * @return DOMDocument   the DOM document that represent the template file
     */
    loadTemplate: function (url){

/*
        var xhr = false;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
            xhr.overrideMimeType('text/xml');
        }else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.open('GET', url, false);
        xhr.send(null);

		console.log(xhr.responseXML);
*/
	console.log("loading..."); 
	this._templateDoc=document.implementation.createDocument("", "", null) 
	this._templateDoc.async = false;
	 this._templateDoc.load(url);
	this._templateDoc.onLoad = function(){
		console.info("document Loaded...");
	}
       // this._templateDoc = xhr.responseXML;

    },

    /**
     * create/modify a variable of the template , which will be used during content generation
     * @param   string   nom   name of the variable
     * @param   any   valeur   the value of the variable
     */
    assign : function (nom, valeur){
        this.parameters[nom]=valeur;
    },

    /**
     * remove all children of a DOM Element.
     * @param   DOMElement   elt   the DOM element from which we'll remove children
     * @access private
     */
    _clean: function (elt){
         if(!elt)
            console.error( 'clean: invalide root element');
         var i;
         var childs=elt.childNodes;
         if(childs.length){
          for(i=childs.length-1; i >=0; i--){
            //if(childs[i].nodeType == childs[i].ELEMENT_NODE && childs[i].hasAttributeNS(this._nsTemplate, 'builtbytpl'))
                elt.removeChild(childs[i]);
          }
        }
    }
}