<?xml version="1.0"?>
<jstemplate xmlns="http://disruptive-innovations.com/ns/jstemplate" xmlns:jstpl="http://disruptive-innovations.com/ns/jstemplate" xmlns:xul="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" version="1.0">
	<foreach from="list" item="aLabel" key="aKey">
		<xul:box class="notselected">
			<attribute name="_id" value="aLabel['id']"/>
			<attribute name="onclick" value="'gdocsbarObj.editSmartTemplate(this,'+aLabel['id']+',\''+aLabel['fname']+'\',\''+aLabel['ffilter']+'\',\''+aLabel['fsearch']+'\')'"/>
			<attribute name="id" value="'smartfolder'+aLabel['id']"/>
			<xul:label class="s_name">
				<attribute name="value" value="aLabel['fname']"/> 
			</xul:label>
			<xul:label value="" class="s_delete">
				<attribute name="onclick" value="'event.stopPropagation();gdocsbarObj.deleteSmartFolder('+aLabel['id']+');'"/>
			</xul:label>
		</xul:box>
	</foreach>
</jstemplate>
