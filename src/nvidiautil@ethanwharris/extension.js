const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();

var button;
var timeout_id;
var logo_util;
var logo_temp;
var logo_ram;
var util_label;
var temp_label;
var mem_label;

function init() {
  Gtk.IconTheme.get_default().append_search_path(Me.dir.get_child('icons').get_path());
}

function enable() {
  logo_util = new St.Icon({icon_name: 'nvidia-card-symbolic', style_class: 'system-status-icon'});
  logo_temp = new St.Icon({icon_name: 'nvidia-temp-symbolic', style_class: 'system-status-icon'});
  logo_ram = new St.Icon({icon_name: 'nvidia-ram-symbolic', style_class: 'system-status-icon'});

  util_label = new St.Label({text: "%"});
  temp_label = new St.Label({text: "\xB0" + "C"});
  mem_label = new St.Label ({text: "%"});

  button = new St.Bin({
    style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: false,
    track_hover: true
  });

  var settings = GLib.find_program_in_path("nvidia-settings");

  if (settings) {
    var info = get_info();
    var box = build_button_box(info);

    button.set_child(box);
    button.connect('button-press-event', open_settings);

    timeout_id = GLib.timeout_add_seconds(0, 2, Lang.bind(this, function () {
        var info_string = get_info();
        update_button_box(info_string);
        return true;
    }));
  } else {
    button.set_child(new St.Label({text: "Error - nvidia-settings not present!"}))
  }

	Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
	Main.panel._rightBox.remove_child(button);
  GLib.source_remove(timeout_id);
}

function open_settings() {
  GLib.spawn_command_line_async("nvidia-settings");
}

function get_info() {
  var util = GLib.spawn_command_line_sync("nvidia-settings -q GPUUtilization -t")[1].toString();
  util = util.substring(9,11);
  util = util.replace(/\D/g,'');

  var temp = GLib.spawn_command_line_sync("nvidia-settings -q GPUCoreTemp -t")[1].toString();
  temp = temp.split('\n')[0];

  var used_memory = GLib.spawn_command_line_sync("nvidia-settings -q UsedDedicatedGPUMemory -t")[1];
  var total_memory = GLib.spawn_command_line_sync("nvidia-settings -q TotalDedicatedGPUMemory -t")[1];

  var mem_usage = (used_memory / total_memory * 100).toString();
  mem_usage = mem_usage.substring(0,2);

  var info = util + "," + temp + "," + mem_usage;

  return info;
}

function build_button_box(info_string) {
  var box = new St.BoxLayout({name: 'DataBox'});

  info = info_string.split(',');

  util_text = info[0] + "%";
  util_label.text = util_text;

  temp_text = info[1] + "\xB0" + "C";
  temp_label.text = temp_text;

  mem_text = info[2] + "%";
  mem_label.text = mem_text;

  util_label.text = info[0] + "%";
  temp_label.text = info[1] + "\xB0" + "C";
  mem_label.text = info[2] + "%";

  box.add_actor(logo_util);
  box.add_actor(util_label);
  box.add_actor(logo_temp);
  box.add_actor(temp_label);
  box.add_actor(logo_ram);
  box.add_actor(mem_label);

  return box;
}

function update_button_box(info_string) {
  info = info_string.split(',');

  util_label.text = info[0] + "%";
  temp_label.text = info[1] + "\xB0" + "C";
  mem_label.text = info[2] + "%";
}
