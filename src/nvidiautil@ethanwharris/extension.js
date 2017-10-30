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
  var smi = GLib.find_program_in_path("nvidia-smi");

  if (settings && smi) {
    var info = get_info();
    var box = build_button_box(info);

    button.set_child(box);
    button.connect('button-press-event', open_settings);

    timeout_id = GLib.timeout_add_seconds(0, 2, Lang.bind(this, function () {
        var info = get_info();
        update_button_box(info);
        return true;
    }));
  } else {
    button.set_child(new St.Label({text: "Error - nvidia-settings or -smi not present!"}))
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

  var smi = GLib.spawn_command_line_sync("nvidia-smi")[1].toString().split('\n');

  var values_line = smi[8];
  var buffer_state = false;

  buffer = [];
  values = [];
  var buffer_index = 0;
  var values_index = 0;

  for (var i = 0; i < values_line.length; i++) {
      var c = values_line.charAt(i);

      if ((c != " " && c != "|" && c != "/") || (c == "/" && buffer_index > 0)) {
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

  var temp = values[1]; temp = temp.substring(0, temp.length-1);
  var used_memory = values[5]; used_memory = used_memory.substring(0, used_memory.length-3);
  var total_memory = values[6];total_memory = total_memory.substring(0, total_memory.length-3);
  var util = values[7]; util = util.substring(0, util.length-1);

  var mem_usage = (used_memory / total_memory * 100).toString();
  mem_usage = mem_usage.substring(0,2);

  return [util, temp, mem_usage];
}

function build_button_box(info) {
  var box = new St.BoxLayout({name: 'DataBox'});

  update_button_box(info);

  box.add_actor(logo_util);
  box.add_actor(util_label);
  box.add_actor(logo_temp);
  box.add_actor(temp_label);
  box.add_actor(logo_ram);
  box.add_actor(mem_label);

  return box;
}

function update_button_box(info) {
  util_label.text = info[0] + "%";
  temp_label.text = info[1] + "\xB0" + "C";
  mem_label.text = info[2] + "%";
}
