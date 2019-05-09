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

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Processor = Me.imports.processor;
const Lang = imports.lang;

class ProcessorHandler {
  constructor() {
    this._processors = [false, false, false];
  }
  process() {
    for (let i = 0; i < this._processors.length; i++) {
      if (this._processors[i]) {
        try {
          this._processors[i].process();
        } catch (err) {
          Main.notifyError("Error parsing " + this._processors[i].getName(), err.message);
          this._processors[i] = false;
        }
      }
    }
  }
  addProperty(property, listeners) {
    let processor = property.declare();
    if (!this._processors[processor]) {
      this._processors[processor] = new Processor.LIST[processor]();
    }

    this._processors[processor].addProperty(function(lines) {
      let values = property.parse(lines);
      for(let i = 0; i < values.length; i++) {
          listeners[i].handle(values[i]);
      }
    }, property.getCallExtension());
  }
  reset() {
    this._processors = [false, false, false];
  }
}
