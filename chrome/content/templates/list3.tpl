<?xml version="1.0"?>
<jstemplate
    version="1.0"
    xmlns="http://disruptive-innovations.com/ns/jstemplate"
    xmlns:jstpl="http://disruptive-innovations.com/ns/jstemplate"
    xmlns:xul="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">
    
    <foreach from="list" item="aLabel" key="aKey">
		<xul:vbox crop="end">
			<xul:label crop="center">
				<text value="aLabel['file']" />
				<attribute name="class" value="aLabel['status']" />
			</xul:label>
			<xul:description><text value="aLabel['error']" /></xul:description>
	    </xul:vbox>
    </foreach>

</jstemplate>
