/*
   Copyright (c) 2007-9, iUI Project Members
   See LICENSE.txt for licensing terms
 */

(function() {

// Using DOMContentLoaded so this loads before the onload in iui.js -- need a better method (Issue #204?)
// We need to register before iui's main onload handler so we can get the 'load' and 'focus' events
// for the default 'page' (view).
//
// The "better method" may be related to http://code.google.com/p/iui/issues/detail?id=204
//  but there may need to be more than one hook for iUI loading...
//
addEventListener("DOMContentLoaded", function(event)
{
	document.body.addEventListener('beforeinsert', fireEvent, false);
	document.body.addEventListener('afterinsert', afterInsert, false);
// This will register event handlers on all initial nodes
// We'll also need to register handlers on inserted (via ajax) nodes
// To do that we'll need to use the afterInsert event
	var nodes = iui.getAllViews();
	for (var i = 0; i  < nodes.length  ; i++)
	{
		registerAllEvents(nodes[i]);
	}
}, false);

function registerAllEvents(node)
{
  node.addEventListener('load', fireEvent, false);
}

function afterInsert(e)
{
	fireEvent(e);
	registerAllEvents(e.insertedNode);	// Set event handlers on newly added node
}

function fireEvent(e)
{
  onPanelLoad(e.target.id);
	//console.log("fireEvent type: " + e.type + "  target " + e.target.tagName + ");
}

})();