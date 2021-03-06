
/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {inherits as ol_inherits} from 'ol'
import ol_control_Control from 'ol/control/Control'
import ol_ext_element from '../util/element'

/** Control overlay for OL3
 * The overlay control is a control that display an overlay over the map
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fire change:visible
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String|Element} options.content
 *	@param {bool} options.hideOnClick hide the control on click, default false
 *	@param {bool} options.closeBox add a closeBox to the control, default false
 */
var ol_control_Overlay = function(options)
{	if (!options) options={};

/*
	var element = document.createElement("div");
	element.classList.add('ol-unselectable', 'ol-overlay');
	//if (options.className) element.classList.add(options.className);
*/
	var element = ol_ext_element.create('DIV', {
		className: 'ol-unselectable ol-overlay '+(options.className||''),
		html: options.content
	});
	ol_control_Control.call(this,
	{	element: element,
		target: options.target
	});

	var self = this;
	if (options.hideOnClick) element.addEventListener("click", function(){self.hide();});

	this.set("closeBox", options.closeBox);

	this._timeout = false;
	this.setContent (options.content);
};
ol_inherits(ol_control_Overlay, ol_control_Control);

/** Set the content of the overlay
* @param {string} html the html to display in the control (or a jQuery object) 
*/
ol_control_Overlay.prototype.setContent = function (html)
{	var self = this;
	if (html)
	{	var elt = this.element;
		if (html instanceof Element) elt.appendChild(html)
		else if (html!==undefined) elt.innerHTML = html;
		if (this.get("closeBox"))
		{	var cb = document.createElement("div");
					cb.classList.add("ol-closebox");
					cb.addEventListener("click", function(){self.hide();});
			elt.insertBefore(cb, elt.firstChild);
		}
	}
};

/** Set the control visibility
* @param {string} html the html to display in the control (or a jQuery object) 
* @param {ol.coordinate} coord coordinate of the top left corner of the control to start from
*/
ol_control_Overlay.prototype.show = function (html, coord)
{	var self = this;
	var elt = this.element;
	elt.style.display = 'block';
	if (coord) {
		this.center_ = this.getMap().getPixelFromCoordinate(coord);
		elt.style.top = this.center_[1]+'px';
		elt.style.left = this.center_[0]+'px';
	} else {
		//TODO: Do fix from  hkollmann pull request
		this.center_ = false;
		elt.style.top = "";
		elt.style.left = "";
	}
	if (html) this.setContent(html);
	if (this._timeout) clearTimeout(this._timeout);
	this._timeout = setTimeout(function()
		{	elt.classList.add("ol-visible")
			elt.style.top = "";
			elt.style.left = "";
			self.dispatchEvent({ type:'change:visible', visible:true, element: self.element });
		}, 10);
	self.dispatchEvent({ type:'change:visible', visible:false, element: self.element });
};

/** Set the control visibility hidden
*/
ol_control_Overlay.prototype.hide = function ()
{	var elt = this.element;
	this.element.classList.remove("ol-visible");
	if (this.center_)
	{	elt.style.top = this.center_[1]+'px';
		elt.style.left = this.center_[0]+'px';
		this.center_ = false;
	}
	if (this._timeout) clearTimeout(this._timeout);
	this._timeout = setTimeout(function(){ elt.style.display = 'none'; }, 500);
	this.dispatchEvent({ type:'change:visible', visible:false, element: this.element });
};

/** Toggle control visibility
*/
ol_control_Overlay.prototype.toggle = function ()
{	
	/*
	if (this.getVisible()) this.element.style.display = 'none';
	else this.element.style.display = 'block';
	this.element.classList.toggle('ol-visible');
	*/
	if (this.getVisible()) this.hide();
	else this.show();
}

/** Get the control visibility
* @return {boolean} b
*/
ol_control_Overlay.prototype.getVisible = function ()
{	return ol_ext_element.getStyle(this.element, 'display') !== 'none';
};

/** Change class name
* @param {String} className a class name or a list of class names separated by a space
*/
ol_control_Overlay.prototype.setClass = function (className)
{	var vis = this.element.classList.contains("ol-visible");
	this.element.className = "";
	var classes = ['ol-unselectable', 'ol-overlay'];
	if (vis) classes.push('ol-visible');
	classes = classes.concat(className.split(' '));
	this.element.classList.add.apply(this.element.classList, classes);
};

export default ol_control_Overlay
