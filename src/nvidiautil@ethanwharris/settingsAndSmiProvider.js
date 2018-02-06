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

const Shell = imports.gi.Shell;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Lang = imports.lang;
const Spawn = Me.imports.spawn;
const SettingsProperties = Me.imports.settingsProperties;
const SmiProperties = Me.imports.smiProperties;
const Processor = Me.imports.processor;

var SettingsAndSmiProvider = new Lang.Class({
  Name : 'SettingsAndSmiProvider',
  _init : function() {
  },
  getGpuNames() {
    var output = Spawn.spawnSync("nvidia-smi --query-gpu=gpu_name --format=csv,noheader", function(command, err) {
      // Do Nothing
    });

    if (output.indexOf("libnvidia-ml.so") >= 0) {
      return Spawn.ERROR;
    }

    return output.split('\n');
  },
  getProperties(gpuCount) {
    this.storedProperties =  [
      new SettingsProperties.UtilisationProperty(gpuCount, Processor.NVIDIA_SETTINGS),
      new SettingsProperties.TemperatureProperty(gpuCount, Processor.NVIDIA_SETTINGS),
      new SettingsProperties.MemoryProperty(gpuCount, Processor.NVIDIA_SETTINGS),
      new SettingsProperties.FanProperty(gpuCount, Processor.NVIDIA_SETTINGS),
      new SmiProperties.PowerProperty(gpuCount)
    ];
    return this.storedProperties;
  },
  retrieveProperties() {
    return this.storedProperties;
  },
  openSettings() {
    let defaultAppSystem = Shell.AppSystem.get_default();
    let nvidiaSettingsApp = defaultAppSystem.lookup_app('nvidia-settings.desktop');

    if (!nvidiaSettingsApp) {
      Main.notifyError("Couldn't find nvidia-settings on your device", "Check you have it installed correctly");
      return;
    }

    if (nvidiaSettingsApp.get_n_windows()) {
      nvidiaSettingsApp.activate();
    } else {
      Spawn.spawnAsync('nvidia-settings', Spawn.defaultErrorHandler);
    }
  }
});
