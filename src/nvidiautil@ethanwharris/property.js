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

var Property = new Lang.Class({
  Name: 'Property',
  Abstract: true,
  _init: function(processor, name, callExtension, icon, formatter, gpuCount) {
    this._processor = processor;
    this._name = name;
    this._callExtension = callExtension;
    this._icon = icon;
    this._formatter = formatter;
    this._gpuCount = gpuCount;
  },
  getName: function() {
    return this._name;
  },
  getCallExtension: function() {
    return this._callExtension;
  },
  getIcon: function() {
    return this._icon;
  },
  parse: function(lines) {
    let values = [];

    for (let i = 0; i < this._gpuCount; i++) {
      values = values.concat(this._formatter.format([lines.shift()]));
    }

    return values;
  },
  declare: function() {
    return this._processor;
  }
});
