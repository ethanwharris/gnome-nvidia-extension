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

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Lang = imports.lang;
const Formatter = Me.imports.formatter;
const Property = Me.imports.property;


var UtilisationProperty = new Lang.Class({
  Name : 'UtilisationProperty',
  Extends : Property.Property,
  _init : function(gpuCount, processor) {
    this.parent(processor, 'Utilisation', '-q GPUUtilization ', 'card-symbolic', new Formatter.PercentFormatter('UtilisationFormatter'), gpuCount);
  },
  parse : function(lines) {
    for (let i = 0; i < this._gpuCount; i++) {
      lines[0] = lines[0].substring(9,11);
    }

    return this.parent(lines);
  }
});

var TemperatureProperty = new Lang.Class({
  Name : 'TemperatureProperty',
  Extends : Property.Property,
  _init : function(gpuCount, processor) {
    this.parent(processor, 'Temperature', '-q [GPU]/GPUCoreTemp ', 'temp-symbolic', new Formatter.TempFormatter(Formatter.CENTIGRADE), gpuCount);
  },
  setUnit(unit) {
    this._formatter.setUnit(unit);
  }
});

var MemoryProperty = new Lang.Class({
  Name : 'MemoryProperty',
  Extends : Property.Property,
  _init : function(gpuCount, processor) {
    this.parent(processor, 'Memory Usage', '-q UsedDedicatedGPUMemory -q TotalDedicatedGPUMemory ', 'ram-symbolic', new Formatter.MemoryFormatter(), gpuCount);
  },
  parse : function(lines) {
    let values = [];

    let used_memory = [];

    for (let i = 0; i < this._gpuCount; i++) {
      used_memory[i] = lines.shift();
    }

    for (let i = 0; i < this._gpuCount; i++) {
      let total_memory = lines.shift();

      values = values.concat(this._formatter.format([used_memory[i], total_memory]));
    }

    return values;
  }
});

var FanProperty = new Lang.Class({
  Name : 'FanProperty',
  Extends : Property.Property,
  _init : function(gpuCount, processor) {
    this.parent(processor, 'Fan Speed', '-q GPUCurrentFanSpeed ', 'fan-symbolic', new Formatter.PercentFormatter('FanFormatter'), gpuCount);
  }
});
