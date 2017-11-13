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

var button;

var timeout_id;
var settings_id;

var extension_settings;

var labels;
var formatters;
var icons;

var show_utilisation;
var show_temperature;
var show_memory;

var use_nvidia_settings = false;

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
  var smi = GLib.find_program_in_path("nvidia-smi");

  button = new St.Button({
    style_class: 'panel-button',
    x_fill: true,
    y_fill: false,
    can_focus: true,
    reactive: true,
    button_mask: St.ButtonMask.ONE |
                St.ButtonMask.THREE });

  if (settings) {
    button.connect('clicked', Lang.bind(this, function(actor, button) {
      if (button == 3) {
        open_prefs();
      }
      if (button == 1) {
        open_settings();
      }

      return true;
    }));
  } else {
    button.connect('button-press-event', Lang.bind(this, function(actor, button) {
      if (button == 1) {
        open_prefs();
      }

      return true;
    }));
  }

  if (settings && !smi) {
    use_nvidia_settings = true;
  } else if (smi && !settings) {
    use_nvidia_settings = false;
  } else if (!settings && !smi) {
    button.set_child(new St.Label({text: "Error - nvidia-settings or -smi not present!"}))
    Main.panel._rightBox.insert_child_at_index(button, 0);
    return;
  }

  load_settings();

  timeout_id = GLib.timeout_add_seconds(0, 2, Lang.bind(this, function() {
    update_button_box(get_info());
    return true;
  }));

  settings_id = extension_settings.connect('changed', load_settings);

  Main.panel._rightBox.insert_child_at_index(button, 0);
}

/*
 * Disable should remove elements from view which where added and de-assign any timeouts etc.
 */
function disable() {
  Main.panel._rightBox.remove_child(button);
  GLib.source_remove(timeout_id);
  extension_settings.disconnect(settings_id);
}

/*
 * Re-Load the settings (use as a callback for settings changes)
 */
function load_settings() {
  show_utilisation = extension_settings.get_boolean(SETTINGS_UTILISATION);
  show_temperature = extension_settings.get_boolean(SETTINGS_TEMPERATURE);
  show_memory = extension_settings.get_boolean(SETTINGS_MEMORY);

  icons = [];
  labels = [];
  formatters = [];

  if(show_utilisation) {
    var logo_util = new St.Icon({icon_name: 'nvidia-card-symbolic', style_class: 'system-status-icon'});
    var util_label = new St.Label({text: "", style_class: 'label'});

    icons = icons.concat(logo_util);
    labels = labels.concat(util_label);
    formatters = formatters.concat(function(val) {
      return val + "%";
    });
  }

  if(show_temperature) {
    var logo_temp = new St.Icon({icon_name: 'nvidia-temp-symbolic', style_class: 'system-status-icon'});
    var temp_label = new St.Label({text: "", style_class: 'label'});

    icons = icons.concat(logo_temp);
    labels = labels.concat(temp_label);
    formatters = formatters.concat(function(val) {
      return val + "\xB0" + "C";
    });
  }

  if(show_memory) {
    var logo_ram = new St.Icon({icon_name: 'nvidia-ram-symbolic', style_class: 'system-status-icon'});
    var mem_label = new St.Label ({text: "", style_class: 'label'});

    icons = icons.concat(logo_ram);
    labels = labels.concat(mem_label);
    formatters = formatters.concat(function(val) {
      return val + "%";
    });
  }

  var box = build_button_box();
  update_button_box(get_info());
  button.set_child(box);
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
  GLib.spawn_command_line_async("nvidia-settings");
}

/*
 * Root function to get info depending on which options are available
 */
function get_info() {
  if (!use_nvidia_settings) {
    return get_info_smi();
  } else {
    return get_info_settings();
  }
}

/*
 * Get info using nvidia-smi. This uses one call to smi and an efficient
 * state machine to parse. Use this if possible.
 */
function get_info_smi() {
  var smi = GLib.spawn_command_line_sync("nvidia-smi")[1].toString().split('\n');

  var values_line = smi[8];
  var buffer_state = false;

  var buffer = [];
  var values = [];
  var buffer_index = 0;
  var values_index = 0;

  for (var i = 0; i < values_line.length; i++) {
    var c = values_line.charAt(i);

    if (c >= '0' && c <= '9') {
      buffer_state = true;
      buffer[buffer_index] = c;
      buffer_index = buffer_index + 1;
    } else if (buffer_state == true) {
      buffer_index = 0;
      values[values_index] = buffer.join("");
      buffer = [];
      values_index += 1;
      buffer_state = false;
    }
  }

  if (values.length < 8) {
    var settings = GLib.find_program_in_path("nvidia-settings");
    if (!settings) {
      return ["N/A", "N/A", "N/A"];
    } else {
      use_nvidia_settings = true;
      return get_info_settings();
    }
  } else {
    var result = [];
    if (show_utilisation) {
      result = result.concat(values[7]);
    }

    if (show_temperature) {
      result = result.concat(values[1]);
    }

    if (show_memory) {
      var used_memory = values[5];
      var total_memory = values[6];
      var mem_usage = (used_memory / total_memory * 100).toString();
      result = result.concat(mem_usage.substring(0,2));
    }

    return result;
  }
}

/*
 * Get info using nvidia-settings. Multiple calls to nvidia-settings required.
 * Use only if there are no available alternatives.
 */
function get_info_settings() {
  var result = [];

  if (show_utilisation) {
    var util = GLib.spawn_command_line_sync("nvidia-settings -q GPUUtilization -t")[1].toString();
    util = util.substring(9,11);
    util = util.replace(/\D/g,'');
    result = result.concat(util);
  }

  if (show_temperature) {
    var temp = GLib.spawn_command_line_sync("nvidia-settings -q GPUCoreTemp -t")[1].toString();
    temp = temp.split('\n')[0];
    result = result.concat(temp);
  }

  if (show_memory) {
    var used_memory = GLib.spawn_command_line_sync("nvidia-settings -q UsedDedicatedGPUMemory -t")[1];
    var total_memory = GLib.spawn_command_line_sync("nvidia-settings -q TotalDedicatedGPUMemory -t")[1];
    var mem_usage = (used_memory / total_memory * 100).toString();
    mem_usage = mem_usage.substring(0,2);
    mem_usage = mem_usage.replace(/\D/g,'');
    result = result.concat(mem_usage);
  }

  return result;
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
    labels[i].text = formatters[i](info[i]);
  }
}
