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

const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Util = Me.imports.util;

const SETTINGS_UTILISATION = "gpuutilisation";
const SETTINGS_TEMPERATURE = "gputemp";
const SETTINGS_MEMORY = "gpumemoryutilisation";
const SETTINGS_POWER = "gpupowerusage";
const SETTINGS_FAN = "gpufanspeed";
const SETTINGS_REFRESH = "refreshrate";
const SETTINGS_CURRENT_GPU = 'currentgpu';

var button;

var timeout_id;
var settings_id;

var extension_settings;

var labels;
var icons;

var settings_call;
var settings_parse_function;

var smi;
var smi_call;
var smi_parse_function;

var has_smi;
var has_settings;

var current_gpu = 0;
var num_gpu;

/*
 * Utility function to perform one function and then another
 */
function andThen(first, second) {
  return function(lines) {
    first(lines);
    return second(lines);
  };
}

// three classes : Main (StatsMenu), Statistic and Processor
// Main creates all statistics (based on smi / settings availability)
// Statistics are given a Processor where they can declare the processing function / call properties

class Processor {
  constructor(baseCall, delimiter) {
    // Initialise lists / functions etc.
    this._baseCall = baseCall;
    this._delimiter = delimiter;

    this._init();
  }

  _init() {
    // Reset the processor
    this._call = this._baseCall;

    this._parseFunction = function(lines) {
      return;
    };
  }

  _process() {
    // Perform the action
    var output = GLib.spawn_command_line_sync(this._call)[1].toString();
    this._parseFunction(output.split(this._delimiter));
  }

  _addProperty(parseFunction, callExtension) {
    // Add the new property
    this._call += callExtension;
    this._parseFunction = andThen(this._parseFunction, parseFunction);
  }
}

class PropertyMenuItem extends PopupMenu.PopupBaseMenuItem {
  constructor(processor) {
    // Construct the menu item etc
    // register with the processor
    // Place icon in panel
  }
}

class MainMenu extends PanelMenu.Button {
  constructor() {

  }
}

class StatsMenu extends PanelMenu.Button {
    constructor() {
        super(0.0, _("GPU Statistics"));

        // Add icons

        let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        let icon = new St.Icon({ icon_name: 'media-eject-symbolic',
                                 style_class: 'system-status-icon' });

        hbox.add_child(icon);
        hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));
        this.actor.add_child(hbox);

        this._monitor = Gio.VolumeMonitor.get();
        this._addedId = this._monitor.connect('mount-added', (monitor, mount) => {
            this._addMount(mount);
            this._updateMenuVisibility();
        });
        this._removedId = this._monitor.connect('mount-removed', (monitor, mount) => {
            this._removeMount(mount);
            this._updateMenuVisibility();
        });

        this._mounts = [ ];

        this._monitor.get_mounts().forEach(this._addMount.bind(this));

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addAction(_("Open Files"), event => {
            let appSystem = Shell.AppSystem.get_default();
            let app = appSystem.lookup_app('org.gnome.Nautilus.desktop');
            app.activate_full(-1, event.get_time());
        });

        this._updateMenuVisibility();
    }

    _updateMenuVisibility() {
        if (this._mounts.filter(i => i.actor.visible).length > 0)
            this.actor.show();
        else
            this.actor.hide();
    }

    _addMount(mount) {
        let item = new MountMenuItem(mount);
        this._mounts.unshift(item);
        this.menu.addMenuItem(item, 0);
    }

    _removeMount(mount) {
        for (let i = 0; i < this._mounts.length; i++) {
            let item = this._mounts[i];
            if (item.mount == mount) {
                item.destroy();
                this._mounts.splice(i, 1);
                return;
            }
        }
        log ('Removing a mount that was never added to the menu');
    }

    destroy() {
        if (this._connectedId) {
            this._monitor.disconnect(this._connectedId);
            this._monitor.disconnect(this._disconnectedId);
            this._connectedId = 0;
            this._disconnectedId = 0;
        }

        super.destroy();
    }
};

/*
 * Init function, nothing major here, do not edit view
 */
function init() {
  Gtk.IconTheme.get_default().append_search_path(Me.dir.get_child('icons').get_path());
  extension_settings = Util.getSettings();
}

/*
 * Enable handles the main functioning of the extension, editing view and updating
 */
function enable() {
  var settings = GLib.find_program_in_path("nvidia-settings");
  smi = GLib.find_program_in_path("nvidia-smi");

  button = new St.Button({
    style_class: 'panel-button',
    x_fill: true,
    y_fill: false,
    can_focus: true,
    reactive: true,
    button_mask: St.ButtonMask.ONE |
                St.ButtonMask.THREE });

  if (settings) {
    get_num_gpu();

    button.connect('clicked', Lang.bind(this, function(actor, button) {
      if (button == 3) {
        open_prefs();
      }
      if (button == 1) {
        open_settings();
      }

      return true;
    }));
    load_settings();
    settings_id = extension_settings.connect('changed', load_settings);
  } else {
    button.connect('button-press-event', Lang.bind(this, function(actor, button) {
      if (button == 1) {
        open_prefs();
      }

      return true;
    }));
    button.set_child(new St.Label({text: "Error - nvidia-settings or -smi not present!"}));
    Main.panel._rightBox.insert_child_at_index(button, 0);
  }
}

function get_num_gpu() {
  var output = GLib.spawn_command_line_sync("nvidia-settings -t -q gpus")[1].toString();
  var lines = output.split('\n');
  var line = lines.shift();
  num_gpu = parseInt(line.substring(0,1));
}

/*
 * Create and add the timeout which updates values every t seconds
 */
function add_timeout(t) {
  if (timeout_id != -1) {
    GLib.source_remove(timeout_id);
  }
  timeout_id = GLib.timeout_add_seconds(0, t, Lang.bind(this, function() {
    update_button_box(get_info());
    return true;
  }));
}

/*
 * Remove current timeout
 */
function remove_timeout() {
  if (timeout_id != -1) {
    GLib.source_remove(timeout_id);
    timeout_id = -1;
  }
}

/*
 * Disable should remove elements from view which where added and de-assign any timeouts etc.
 */
function disable() {
  Main.panel._rightBox.remove_child(button);
  remove_timeout();
  extension_settings.disconnect(settings_id);
}

/*
 * Utility function to perform one function and then another
 */
function and_then(first, second) {
  return function(lines, values) {
    values = first(lines, values);
    return second(lines, values);
  };
}

/*
 * Set-up a new property with the given icon, nvidia-settings call and parse function
 */
function build_settings_property(icon, setting, parse) {
  var logo = new St.Icon({icon_name: icon, style_class: 'system-status-icon'});
  var label = new St.Label({text: "", style_class: 'label'});

  icons = icons.concat(logo);
  labels = labels.concat(label);
  settings_call += setting;
  settings_parse_function = and_then(settings_parse_function, parse);
}

/*
 * Set-up a new property with the given icon, nvidia-smi call and parse function
 */
function build_smi_property(icon, smi, parse) {
  var logo = new St.Icon({icon_name: icon, style_class: 'system-status-icon'});
  var label = new St.Label({text: "", style_class: 'label'});

  icons = icons.concat(logo);
  labels = labels.concat(label);
  smi_call += smi;
  smi_parse_function = and_then(smi_parse_function, parse);
}

/*
 * Re-Load the settings (use as a callback for settings changes)
 */
function load_settings() {
  var show_utilisation = extension_settings.get_boolean(SETTINGS_UTILISATION);
  var show_temperature = extension_settings.get_boolean(SETTINGS_TEMPERATURE);
  var show_memory = extension_settings.get_boolean(SETTINGS_MEMORY);
  var show_power = extension_settings.get_boolean(SETTINGS_POWER);
  var show_fan = extension_settings.get_boolean(SETTINGS_FAN);

  current_gpu = extension_settings.get_int(SETTINGS_CURRENT_GPU);
  var refresh_rate = extension_settings.get_int(SETTINGS_REFRESH);

  has_smi = false;
  has_settings = false;

  settings_call = 'nvidia-settings ';
  settings_parse_function = function(lines) {
    return values;
  };

  smi_call = 'nvidia-smi --query-gpu=';
  smi_parse_function = function(lines) {
    return;
  };

  icons = [];
  labels = [];

  if(show_utilisation) {
    has_settings = true;
    build_settings_property('card-symbolic', '-q GPUUtilization ', function(lines, values) {
      var line = '';
      var util = '';

      for (i = 0; i < num_gpu; i++) {
        line = lines.shift();
        if (i == current_gpu) {
          util = line.substring(9,11);
          util = util.replace(/\D/g,'');
        }
      }

      return values.concat(util + "%");
    });
  }

  if(show_temperature) {
    has_settings = true;
    build_settings_property('temp-symbolic', '-q GPUCoreTemp ', function(lines, values) {
      var temp = '';
      lines.shift();

      for (i = 0; i < num_gpu; i++) {
        if (i == current_gpu) {
          temp = lines.shift();
        } else {
          lines.shift();
        }
      }

      return values.concat(temp + "\xB0" + "C");
    });
  }

  if(show_memory) {
    has_settings = true;
    build_settings_property('ram-symbolic', '-q UsedDedicatedGPUMemory -q TotalDedicatedGPUMemory ', function(lines, values) {
      var used_memory = '';
      for (i = 0; i < num_gpu; i++) {
        if (i == current_gpu) {
          used_memory = lines.shift();
        } else {
          lines.shift();
        }
      }

      var total_memory = ''
      for (i = 0; i < num_gpu; i++) {
        if (i == current_gpu) {
          total_memory = lines.shift();
        } else {
          lines.shift();
        }
      }

      var mem_usage = ((used_memory / total_memory) * 100).toString();
      mem_usage = mem_usage.substring(0,2);
      mem_usage = mem_usage.replace(/\D/g,'');
      return values.concat(mem_usage + "%");
    });
  }

  if(show_fan) {
    has_settings = true;
    build_settings_property('fan-symbolic', '-q GPUCurrentFanSpeed ', function(lines, values) {
      var fan = ''
      for (i = 0; i < num_gpu; i++) {
        if (i == current_gpu) {
          fan = lines.shift()
        } else {
          lines.shift()
        }
      }

      return values.concat(fan + "%");
    });
  }

  if(show_power) {
    has_smi = true;
    build_smi_property('power-symbolic', 'power.draw,', function(lines, values) {
      var power = lines.shift();
      power = power.split('\n');
      power = power[current_gpu];

      if (isNaN(parseFloat(power)) || !isFinite(power)) {
        return values.concat('ERR')
      }

      return values.concat(power.split('.')[0] + "W");
    });
  }

  smi_call += ' --format=csv,noheader,nounits';
  settings_call += '-t';

  if (labels.length == 0) {
    Main.panel._rightBox.remove_child(button);
    remove_timeout();
    settings_call = '';
  } else {
    add_timeout(refresh_rate);
    var box = build_button_box();
    update_button_box(get_info());
    button.set_child(box);
    Main.panel._rightBox.remove_child(button);
    Main.panel._rightBox.insert_child_at_index(button, 0);
  }
}

/*
 * Open the preferences for the nvidiautil extension
 */
function open_prefs() {
  GLib.spawn_command_line_async("gnome-shell-extension-prefs " + Me.metadata['uuid']);
}

/*
 * Open the Nvidia Settings tool
 * Note: This will not check if nvidia-settings exists first
 */
 function open_settings() {
   const Shell = imports.gi.Shell;
   let defaultAppSystem = Shell.AppSystem.get_default();
   let nvidiaSettingsApp = defaultAppSystem.lookup_app('nvidia-settings.desktop');

   if (nvidiaSettingsApp.get_n_windows()) {
     nvidiaSettingsApp.activate();
   } else {
     GLib.spawn_command_line_async('nvidia-settings');
   }
}

/*
 * Obtain and parse the output of the settings call
 */
function get_info() {
  var output = '';
  var res = [];

  if (has_settings) {
    var output = GLib.spawn_command_line_sync(settings_call)[1].toString();
    var res = settings_parse_function(output.split('\n'), []);
  }
  if (smi && has_smi) {
    output = GLib.spawn_command_line_sync(smi_call)[1].toString();
    res = res.concat(smi_parse_function(output.split(','), []));
  }
  return res;
}

/*
 * Construct the button box (the box layout which stores the info)
 */
function build_button_box() {
  var box = new St.BoxLayout({name: 'DataBox'});

  for(var i = 0; i < labels.length; i++) {
    box.add_actor(icons[i]);
    box.add_actor(labels[i]);
  }

  return box;
}

/*
 * Update the info labels
 */
function update_button_box(info) {
  for(var i = 0; i < labels.length; i++) {
    labels[i].text = info[i];
  }
}
