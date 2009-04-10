<?xml version="1.0"?>
<jstemplate xmlns="http://disruptive-innovations.com/ns/jstemplate" xmlns:jstpl="http://disruptive-innovations.com/ns/jstemplate" xmlns:xul="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" version="1.0">
	<foreach from="list" item="aLabel" key="aKey">
		<xul:menuitem class="menuitem-iconic" image="chrome://gdocsbar/skin/images/folder1.png" name="folder">
			<attribute name="oncommand" value="'gdocsbarObj.executeUploadTemplate(\''+aLabel['leafName']+'\')'"/>
			<attribute name="label" value="aLabel['leafName']"/>
			<attribute name="_id" value="aLabel['leafName']"/>
		</xul:menuitem>
	</foreach>
	
</jstemplate>
