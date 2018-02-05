/*This file is part of Nvidia Util Gnome Extension.

Nvidia Util Gnome Extension is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Nvidia Util Gnome Extension is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Nvidia Util Gnome Extension.  If not, see <http://www.gnu.org/licenses/>.*/

const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Shell = imports.gi.Shell;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ShellMountOperation = imports.ui.shellMountOperation;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

var CENTIGRADE = 0;
var FAHRENHEIT = 1;

var Formatter = new Lang.Class({
  Name : 'Formatter',
  Abstract : true,
  _init : function(name) {
    this._name = name;
  },
  format : function(value) {
    return value;
  },
});

var PercentFormatter = new Lang.Class({
  Name : 'PercentFormatter',
  Extends : Formatter,
  _init : function(name) {
    this.parent(name);
  },
  format : function(value) {
    value = value.trim();
    if (value == '' || value == '[Not Supported]') {
      return "ERR"
    }

    return value + "%";
  }
})

var PowerFormatter = new Lang.Class({
  Name : 'PowerFormatter',
  Extends : Formatter,
  _init : function() {
    this.parent('PowerFormatter');
  },
  format : function(value) {
    value = value.trim();
    var pow = parseFloat(value);

    if (isNaN(pow) || !isFinite(value)) {
      return "ERR"
    }

    pow = Math.floor(pow)

    return pow + "W";
  }
})

var MemoryFormatter = new Lang.Class({
  Name : 'MemoryFormatter',
  Extends : Formatter,
  _init : function() {
    this.parent('MemoryFormatter');
  },
  format : function(used_memory, total_memory) {
    used_memory = used_memory.trim();
    total_memory = total_memory.trim();
    if (used_memory == '' || used_memory == '[Not Supported]' || total_memory == '' || total_memory == '[Not Supported]' || total_memory == '0') {
      return "ERR"
    }

    var mem_usage = ((used_memory / total_memory) * 100).toString();
    mem_usage = mem_usage.substring(0,2);
    mem_usage = mem_usage.replace(/\D/g,'');

    // Main.notifyError('',''+used_memory + '-' + total_memory)

    return mem_usage + "%";
  }
})

var TempFormatter = new Lang.Class({
  Name : 'TempFormatter',
  Extends : Formatter,
  currentUnit : 0,
  _init : function(unit) {
    this.parent('TempFormatter')
    this.currentUnit = unit;
  },
  setUnit : function(unit) {
    this.currentUnit = unit;
  },
  format : function(value) {
    value = value.trim();
    if (value == '' || value == '[Not Supported]') {
      return "ERR"
    }

    if (this.currentUnit == CENTIGRADE) {
      return this.formatCentigrade(value);
    } else if (this.currentUnit == FAHRENHEIT) {
      return this.formatFehrenheit(value);
    }
  },
  formatCentigrade : function(value) {
    return value + "\xB0" + "C";
  },
  formatFehrenheit : function(value) {
    return Math.floor(value*9/5+32) + "\xB0" + "F";
  }
});
