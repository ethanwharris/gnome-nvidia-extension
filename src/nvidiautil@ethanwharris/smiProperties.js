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
const Property = Me.imports.property;
const Processor = Me.imports.processor;
const Formatter = Me.imports.formatter;

var UtilisationProperty = new Lang.Class({
  Name: 'UtilisationProperty',
  Extends: Property.Property,
  _init: function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Utilisation', 'utilization.gpu,', 'card-symbolic', new Formatter.PercentFormatter('UtilisationFormatter'), gpuCount);
  }
});

var PowerProperty = new Lang.Class({
  Name: 'PowerProperty',
  Extends: Property.Property,
  _init: function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Power Usage (W)', 'power.draw,', 'power-symbolic', new Formatter.PowerFormatter(), gpuCount);
  }
});

var TemperatureProperty = new Lang.Class({
  Name: 'TemperatureProperty',
  Extends: Property.Property,
  _init: function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Temperature', 'temperature.gpu,', 'temp-symbolic', new Formatter.TempFormatter(Formatter.CENTIGRADE), gpuCount);
  },
  setUnit: function(unit) {
    this._formatter.setUnit(unit);
  }
});

var MemoryProperty = new Lang.Class({
  Name: 'MemoryProperty',
  Extends: Property.Property,
  _init: function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Memory Usage', 'memory.used,memory.total,', 'ram-symbolic', new Formatter.MemoryFormatter('MemoryFormatter'), gpuCount);
  },
  parse: function(lines) {
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
  Name: 'FanProperty',
  Extends: Property.Property,
  _init: function(gpuCount) {
    this.parent(Processor.NVIDIA_SMI, 'Fan Speed', 'fan.speed,', 'fan-symbolic', new Formatter.PercentFormatter('FanFormatter'), gpuCount);
  }
});
