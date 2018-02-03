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

const Property = Me.imports.property;
const Processor = Me.imports.processor;

var UtilisationProperty = new Lang.Class({
  Name : 'UtilisationProperty',
  Extends : Property.Property,
  _init : function(gpuCount) {
    this.parent(Processor.NVIDIA_SETTINGS, 'Utilisation', '-q GPUUtilization ', 'card-symbolic');

    this._gpuCount = gpuCount;
  },
  parse : function(lines) {
    var line = '';
    var values = [];

    for (let i = 0; i < this._gpuCount; i++) {
      line = lines.shift();

      line = line.substring(9,11);
      line = line.replace(/\D/g,'');
      values = values.concat(line + "%");
    }

    return values;
  }
});

var TemperatureProperty = new Lang.Class({
  Name : 'TemperatureProperty',
  Extends : Property,
  _init : function(gpuCount) {
    this.parent(Processor.NVIDIA_SETTINGS, 'Temperature (' + "\xB0" + "C" + ')', '-q GPUCoreTemp ', 'temp-symbolic');

    this._gpuCount = gpuCount;
  },
  parse : function(lines) {
    var line = '';
    var values = [];

    lines.shift();

    for (let i = 0; i < this._gpuCount; i++) {
      line = lines.shift();

      values = values.concat(line + "\xB0" + "C");
    }

    return values;
  }
});

var MemoryProperty = new Lang.Class({
  Name : 'MemoryProperty',
  Extends : Property,
  _init : function(gpuCount) {
    this.parent(Processor.NVIDIA_SETTINGS, 'Memory Usage', '-q UsedDedicatedGPUMemory -q TotalDedicatedGPUMemory ', 'ram-symbolic');

    this._gpuCount = gpuCount;
  },
  parse : function(lines) {
    var values = [];

    for (let i = 0; i < this._gpuCount; i++) {
      var used_memory = lines.shift();
      var total_memory = lines.shift();

      var mem_usage = ((used_memory / total_memory) * 100).toString();
      mem_usage = mem_usage.substring(0,2);
      mem_usage = mem_usage.replace(/\D/g,'');
      values = values.concat(mem_usage + "%");
    }

    return values;
  }
});

var FanProperty = new Lang.Class({
  Name : 'FanProperty',
  Extends : Property,
  _init : function(gpuCount) {
    this.parent(Processor.NVIDIA_SETTINGS, 'Fan Speed', '-q GPUCurrentFanSpeed ', 'fan-symbolic');

    this._gpuCount = gpuCount;
  },
  parse : function(lines) {
    var line = '';
    var values = [];

    for (let i = 0; i < this._gpuCount; i++) {
      line = lines.shift();
      values = values.concat(line + "%");
    }

    return values;
  }
});
