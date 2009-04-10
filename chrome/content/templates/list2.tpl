<?xml version="1.0"?>
<jstemplate
    version="1.0"
    xmlns="http://disruptive-innovations.com/ns/jstemplate"
    xmlns:jstpl="http://disruptive-innovations.com/ns/jstemplate"
    xmlns:xul="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">
    
    <foreach from="list" item="aLabel" key="aKey">
		<xul:box crop="end">
			<xul:image src="chrome://gdocsbar/skin/images/close.png">
				<attribute name="onclick" value="'gdocsbarObj.popFromQ('+aKey+')'" />
			</xul:image><xul:label crop="center"><text value="aLabel['name']" /></xul:label>
	    </xul:box>
    </foreach>

</jstemplate>