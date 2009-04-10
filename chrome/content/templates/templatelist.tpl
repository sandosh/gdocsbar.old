<?xml version="1.0"?>
<jstemplate xmlns="http://disruptive-innovations.com/ns/jstemplate" xmlns:jstpl="http://disruptive-innovations.com/ns/jstemplate" xmlns:xul="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" version="1.0">
	<foreach from="list" item="aLabel" key="aKey">
		
		<xul:box>
			<xul:label class="t_name">
				<attribute name="value" value="aLabel['leafName']"/>
			</xul:label>
			<xul:label value="" class="t_delete">
				<attribute name="onclick" value="'event.stopPropagation(); gdocsbarObj.deleteTemplate(\''+aLabel['leafName']+'\')'"/>
			</xul:label>
		</xul:box>
		
	</foreach>
</jstemplate>
