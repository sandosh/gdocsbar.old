<?xml version="1.0"?>
<jstemplate xmlns="http://disruptive-innovations.com/ns/jstemplate" xmlns:jstpl="http://disruptive-innovations.com/ns/jstemplate" xmlns:xul="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" version="1.0">
	<foreach from="results" item="aLabel" key="aKey">
		<xul:vbox crop="end" context="docsmenu" onclick="gdocsbarObj.openMyUILink(this.id, event);"><attribute name="tooltiptext" value="aLabel['title']"/><attribute name="id" value="aLabel['key']" class="img09"/><attribute name="class" value="aLabel['category']+'_'+aLabel['starred']"/>
		<xul:label crop="center" class="title"><attribute name="value" value="aLabel['title']"/></xul:label>
		
		<if condition="folders[aLabel['key']]"><iftrue>
			<xul:description class="folders"><foreach from="folders[aLabel['key']]" item="bLabel" key="bKey"><xul:label crop="center" class="folder"><text value="bLabel"/></xul:label></foreach>
			</xul:description></iftrue></if>
			<xul:label crop="center" class="updated"><attribute name="value" value="aLabel['updated']+' by '+aLabel['author_name']"/></xul:label>
			
		</xul:vbox>
	</foreach>
</jstemplate>
