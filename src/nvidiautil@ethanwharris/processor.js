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

/*
 * Utility function to perform one function and then another
 */
function andThen(first, second) {
  return function(lines) {
    first(lines);
    return second(lines);
  };
}

const Processor = new Lang.Class({
  Name : 'Processor',
  Abstract : true,
  _init : function(baseCall, tailCall) {
    this._baseCall = baseCall;
    this._tailCall = tailCall;
    this._call = this._baseCall;

    this._parseFunction = function(lines) {
      return;
    };
  },
  parse : function(output) {
    // Do Nothing
  },
  process : function() {
    var output = GLib.spawn_command_line_sync(this._call + this._tailCall)[1].toString();
    this.parse(output);
  },
  addProperty : function(parseFunction, callExtension) {
    this._call += callExtension;
    this._parseFunction = andThen(this._parseFunction, parseFunction);
  }
});

const NvidiaSettingsProcessor = new Lang.Class({
  Name : 'NvidiaSettingsProcessor',
  Extends : Processor,
  _init : function() {
    this.parent('nvidia-settings ', '-t');
  },
  parse : function(output) {
    this._parseFunction(output.split('\n'));
  }
});

const NvidiaSmiProcessor = new Lang.Class({
  Name : 'NvidiaSmiProcessor',
  Extends : Processor,
  _init : function() {
    this.parent('nvidia-smi --query-gpu=', ' --format=csv,noheader,nounits');
  },
  parse : function(output) {
    var lines = output.split('\n');
    var items = [];
    for(var i = 0; i < lines.length; i++) {
        var fields = lines[i].split(',');
        for(var j = 0; j < fields.length; j++) {
          items[(fields.length * i) + j] = fields[j];
        }
    }
    this._parseFunction(items);
  }
});
