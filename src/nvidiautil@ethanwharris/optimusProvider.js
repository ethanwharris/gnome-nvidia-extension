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
const Lang = imports.lang;
const Spawn = Me.imports.spawn;
const Processor = Me.imports.processor;
const SmiProperties = Me.imports.smiProperties;

var OptimusProvider = class {
  constructor() {
  }
  getGpuNames() {
    let output = Spawn.spawnSync("optirun nvidia-smi --query-gpu=gpu_name --format=csv,noheader", function(command, err) {
      // Do Nothing
    });

    if (output == Spawn.ERROR || output.indexOf("ERROR") >= 0) {
      return Spawn.ERROR;
    }

    if (output.indexOf("libnvidia-ml.so") >= 0) {
      return Spawn.ERROR;
    }

    output = output.split('\n');

    for (let i = 0; i < output.length; i++) {
      output[i] = i + ": " + output[i];
    }

    return output;
  }
  getProperties(gpuCount) {
    this.storedProperties = [
      new SmiProperties.UtilisationProperty(gpuCount, Processor.OPTIMUS),
      new SmiProperties.TemperatureProperty(gpuCount, Processor.OPTIMUS),
      new SmiProperties.MemoryProperty(gpuCount, Processor.OPTIMUS),
      new SmiProperties.FanProperty(gpuCount, Processor.OPTIMUS),
      new SmiProperties.PowerProperty(gpuCount, Processor.OPTIMUS)
    ];
    return this.storedProperties;
  }
  retrieveProperties() {
    return this.storedProperties;
  }
  hasSettings() {
    return true;
  }
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
      Spawn.spawnAsync('optirun -b none nvidia-settings -c :8', Spawn.defaultErrorHandler);
    }
  }
}
