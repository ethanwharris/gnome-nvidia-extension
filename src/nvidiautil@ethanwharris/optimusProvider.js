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
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Spawn = Me.imports.spawn;
const SettingsProperties = Me.imports.settingsProperties;
const Lang = imports.lang;


var OptimusProvider = new Lang.Class({
  Name : 'OptimusProvider',
  _init : function() {
  },
  getGpuNames() {
    let output = Spawn.spawnSync("optirun nvidia-settings -q GpuUUID -t", function(command, err) {
      // Do Nothing
    });

    if (output == Spawn.ERROR) {
      return Spawn.ERROR;
    }

    output = output.split('\n');
    let result = [];

    for (let i = 0; i < output.length; i++) {
      result[i] = "GPU " + i;
    }

    return result;
  },
  getProperties(gpuCount) {
    this.storedProperties = [
      new SettingsProperties.UtilisationProperty(gpuCount, Processor.OPTIMUS),
      new SettingsProperties.TemperatureProperty(gpuCount, Processor.OPTIMUS),
      new SettingsProperties.MemoryProperty(gpuCount, Processor.OPTIMUS),
      new SettingsProperties.FanProperty(gpuCount, Processor.OPTIMUS)
    ];
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
      Spawn.spawnAsync('optirun nvidia-settings -c :8', Spawn.defaultErrorHandler);
    }
  }
});
