<?xml version="1.0"?>
<jstemplate xmlns="http://disruptive-innovations.com/ns/jstemplate" xmlns:jstpl="http://disruptive-innovations.com/ns/jstemplate" xmlns:xul="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" version="1.0">
	<xul:menuitem class="menuitem-iconic" oncommand="gdocsbarObj.createDocsForFolders(null);" image="chrome://gdocsbar/skin/images/folder_home.png" type="radio" checked="true" name="folder" id="context_all_items">
		<attribute name="label" value="'All Items ('+total+')'"/>
	</xul:menuitem>
	<xul:menuseparator/>
	<xul:menuitem oncommand="gdocsbarObj.createDocsForFolders({id:'Items not in folders'});" class="menuitem-iconic" image="chrome://gdocsbar/skin/images/folder1.png" name="folder">
		<attribute name="label" value="'Items not in folders ('+not_in_folders+')'"/>
	</xul:menuitem>
	<xul:menuseparator/>
	<xul:menuitem label="Folders" disabled="true"/>
	<foreach from="list" item="aLabel" key="aKey">
		<xul:menuitem class="menuitem-iconic" image="chrome://gdocsbar/skin/images/folder1.png" name="folder">
			<attribute name="oncommand" value="'gdocsbarObj.createDocsForFolders(this)'"/>
			<attribute name="label" value="aLabel['folder']+' ('+aLabel['total']+')'"/>
			<attribute name="id" value="aLabel['folder']"/>
		</xul:menuitem>
	</foreach>
	<xul:menuseparator/>
	<xul:menuitem label="Smart Folders" disabled="true"/>
	<foreach from="smartfolders" item="aLabel" key="aKey">
		<xul:menuitem class="menuitem-iconic" image="chrome://gdocsbar/skin/images/folder1.png" name="folder">
			<attribute name="oncommand" value="'gdocsbarObj.ExecuteSmartFolders('+aLabel['id']+')'"/>
			<attribute name="label" value="aLabel['fname']"/>
			<attribute name="_id" value="aLabel['id']"/>
		</xul:menuitem>
	</foreach>
	
</jstemplate>
