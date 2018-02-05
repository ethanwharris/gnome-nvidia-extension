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
  _init : function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Utilisation', 'utilization.gpu,', 'card-symbolic', new Formatter.PercentFormatter('UtilisationFormatter'), gpuCount);
  }
});

var PowerProperty = new Lang.Class({
  Name : 'PowerProperty',
  Extends : Property.Property,
  _init : function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Power Usage (W)', 'power.draw,', 'power-symbolic', new Formatter.PowerFormatter(), gpuCount);
  }
});

var TemperatureProperty = new Lang.Class({
  Name : 'TemperatureProperty',
  Extends : Property.Property,
  _init : function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Temperature', 'temperature.gpu,', 'temp-symbolic', new Formatter.TempFormatter(Formatter.CENTIGRADE), gpuCount);
  },
  setUnit(unit) {
    this._formatter.setUnit(unit);
  }
});

var MemoryProperty = new Lang.Class({
  Name : 'MemoryProperty',
  Extends : Property.Property,
  _init : function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Memory Usage', 'utilization.memory,', 'ram-symbolic', new Formatter.PercentFormatter('MemoryFormatter'), gpuCount);
  }
});

var FanProperty = new Lang.Class({
  Name : 'FanProperty',
  Extends : Property.Property,
  _init : function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Fan Speed', 'fan.speed,', 'fan-symbolic', new Formatter.PercentFormatter('FanFormatter'), gpuCount);
  }
});
