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

const Lang = imports.lang;

var CENTIGRADE = 0;
var FAHRENHEIT = 1;

var Formatter = new Lang.Class({
  Name : 'Formatter',
  Abstract : true,
  _init : function(name) {
    this._name = name;
  },
  format : function(values) {
    for (let i = 0; i < values.length; i++) {
      let stringValue = values[i].replace(/[^0-9.]/g,'');
      values[i] = parseFloat(stringValue);
      if (stringValue == '' || isNaN(values[i]) || !isFinite(stringValue)) {
        return "ERR";
      }
    }
    return this._format(values);
  },
  _format : function(values) {
    return values;
  }
});

var PercentFormatter = new Lang.Class({
  Name : 'PercentFormatter',
  Extends : Formatter,
  _init : function(name) {
    this.parent(name);
  },
  _format : function(values) {
    return values[0] + "%";
  }
})

var PowerFormatter = new Lang.Class({
  Name : 'PowerFormatter',
  Extends : Formatter,
  _init : function() {
    this.parent('PowerFormatter');
  },
  _format : function(values) {
    return Math.floor(values[0]) + "W";
  }
})

var MemoryFormatter = new Lang.Class({
  Name : 'MemoryFormatter',
  Extends : Formatter,
  _init : function() {
    this.parent('MemoryFormatter');
  },
  _format : function(values) {
    let mem_usage = Math.floor((values[0] / values[1]) * 100);
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
  _format : function(value) {
    if (this.currentUnit == CENTIGRADE) {
      return this._formatCentigrade(value);
    } else if (this.currentUnit == FAHRENHEIT) {
      return this._formatFehrenheit(value);
    }
  },
  _formatCentigrade : function(value) {
    return value + "\xB0" + "C";
  },
  _formatFehrenheit : function(value) {
    return Math.floor(value*9/5+32) + "\xB0" + "F";
  }
});
