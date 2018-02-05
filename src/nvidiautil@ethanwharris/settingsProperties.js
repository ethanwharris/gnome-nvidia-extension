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

const Formatter = Me.imports.formatter;

var UtilisationProperty = new Lang.Class({
  Name : 'UtilisationProperty',
  Extends : Property.Property,
  _init : function(gpuCount, processor) {
    this.parent(processor, 'Utilisation', '-q GPUUtilization ', 'card-symbolic');

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
  Extends : Property.Property,
  _init : function(gpuCount, processor) {
    this.parent(processor, 'Temperature', '-q GPUCoreTemp ', 'temp-symbolic');
    this.formatter = new Formatter.tempFormatter(Formatter.CENTIGRADE);
    this._gpuCount = gpuCount;
  },
  parse : function(lines) {
    var line = '';
    var values = [];
    var formattedValue = '';

    lines.shift();

    for (let i = 0; i < this._gpuCount; i++) {
      line = lines.shift();

      formattedValue = this.formatter.format(line);
      values = values.concat(formattedValue);
    }

    return values;
  },
  setUnit(unit) {
    this.formatter.setUnit(unit);
  }
});

var MemoryProperty = new Lang.Class({
  Name : 'MemoryProperty',
  Extends : Property.Property,
  _init : function(gpuCount, processor) {
    this.parent(processor, 'Memory Usage', '-q UsedDedicatedGPUMemory -q TotalDedicatedGPUMemory ', 'ram-symbolic');

    this._gpuCount = gpuCount;
  },
  parse : function(lines) {
    let values = [];

    let used_memory = [];

    for (let i = 0; i < this._gpuCount; i++) {
      used_memory[i] = lines.shift();
    }

    for (let i = 0; i < this._gpuCount; i++) {
      let total_memory = lines.shift();

      let memory_usage = ((used_memory[i] / total_memory) * 100).toString();
      memory_usage = memory_usage.substring(0,2);
      memory_usage = memory_usage.replace(/\D/g,'');
      values = values.concat(memory_usage + "%");
    }

    return values;
  }
});

var FanProperty = new Lang.Class({
  Name : 'FanProperty',
  Extends : Property.Property,
  _init : function(gpuCount, processor) {
    this.parent(processor, 'Fan Speed', '-q GPUCurrentFanSpeed ', 'fan-symbolic');

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
