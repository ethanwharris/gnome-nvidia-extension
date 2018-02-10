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
const Lang = imports.lang;
const Spawn = Me.imports.spawn;
const SmiProperties = Me.imports.smiProperties;

var SmiProvider = new Lang.Class({
  Name : 'SmiProvider',
  _init : function() {
  },
  getGpuNames() {
    let output = Spawn.spawnSync("nvidia-smi --query-gpu=gpu_name --format=csv,noheader", function(command, err) {
      // Do Nothing
    });

    if (output.indexOf("libnvidia-ml.so") >= 0) {
      return Spawn.ERROR;
    }

    return output.split('\n');
  },
  getProperties(gpuCount) {
    this.storedProperties = [
      new SmiProperties.UtilisationProperty(gpuCount),
      new SmiProperties.TemperatureProperty(gpuCount),
      new SmiProperties.BackupMemoryProperty(gpuCount),
      new SmiProperties.FanProperty(gpuCount),
      new SmiProperties.PowerProperty(gpuCount)
    ];
    return this.storedProperties;
  },
  retrieveProperties() {
    return this.storedProperties;
  },
  openSettings() {
    Main.notifyError("Settings are not available in smi mode", "Switch to a provider which supports nivida-settings");
  }
});
