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
const GLib = imports.gi.GLib;

var ERROR = "ERROR";

function spawnAsync(command, callback) {
  try {
    GLib.spawn_command_line_async(command);
  } catch (err) {
    callback(command, err);
    return ERROR;
  }
}

function spawnSync(command, callback) {
  try {
    let data = GLib.spawn_command_line_sync(command)[1];
    if (data instanceof Uint8Array) {
      return imports.byteArray.toString(data);
    } else {
      return data.toString();
    }
  } catch (err) {
    callback(command, err);
    return ERROR;
  }
}

var defaultErrorHandler = function(command, err) {
  let title = "Execution of " + command + " failed:";
  Main.notifyError(title, err.message);
};
