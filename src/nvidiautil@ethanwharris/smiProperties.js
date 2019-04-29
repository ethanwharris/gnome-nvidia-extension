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
const Formatter = Me.imports.formatter;

class UtilisationProperty extends Property.Property {
  constructor(gpuCount, processor) {
    super(processor, 'Utilisation', 'utilization.gpu,', 'card-symbolic', new Formatter.PercentFormatter('UtilisationFormatter'), gpuCount);
  }
}

class PowerProperty extends Property.Property {
  constructor(gpuCount, processor) {
    super(processor, 'Power Usage (W)', 'power.draw,', 'power-symbolic', new Formatter.PowerFormatter(), gpuCount);
  }
}

class TemperatureProperty extends Property.Property {
  constructor(gpuCount, processor) {
    super(processor, 'Temperature', 'temperature.gpu,', 'temp-symbolic', new Formatter.TempFormatter(Formatter.CENTIGRADE), gpuCount);
  }
  setUnit(unit) {
    this._formatter.setUnit(unit);
  }
}

class MemoryProperty extends Property.Property {
  constructor(gpuCount, processor) {
    super(processor, 'Memory Usage', 'memory.used,memory.total,', 'ram-symbolic', new Formatter.MemoryFormatter('MemoryFormatter'), gpuCount);
  }
  parse(lines) {
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
}

class FanProperty extends Property.Property {
  constructor(gpuCount, processor) {
    super(processor, 'Fan Speed', 'fan.speed,', 'fan-symbolic', new Formatter.PercentFormatter('FanFormatter'), gpuCount);
  }
}
