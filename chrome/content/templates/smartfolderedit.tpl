<jstemplate
    version="1.0"
    xmlns="http://disruptive-innovations.com/ns/jstemplate"
    xmlns:jstpl="http://disruptive-innovations.com/ns/jstemplate"
    xmlns:xul="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">

		<xul:vbox class="smartfolderedit">
			<xul:label value="Smart folder name:"/><xul:textbox id="sf_edit_name"><attribute name="value" value="name" /></xul:textbox>
			<xul:label value="Filter:"/><xul:textbox id="sf_edit_filter"><attribute name="value" value="filter" /></xul:textbox>
			<xul:label value="Search term:"/><xul:textbox id="sf_edit_search"><attribute name="value" value="search" /></xul:textbox>
			<xul:hbox>
				<xul:label value="save" class="s_button">
					<attribute name="onclick" value="'gdocsbarObj.saveSmartFolder('+id+')'"/>
				</xul:label>
				<xul:label value="cancel" class="s_button" onclick=" gdocsbarObj.editSmartTemplate(this.parentNode.parentNode.parentNode.previousSibling);"/>
			</xul:hbox>
		</xul:vbox>
		
</jstemplate>