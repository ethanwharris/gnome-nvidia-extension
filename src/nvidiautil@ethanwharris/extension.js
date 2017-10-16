const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;

let text, button, timeout_id;

function open_settings() {
  GLib.spawn_command_line_async("nvidia-settings");
}

function init() {
}

function get_info() {
  util = GLib.spawn_command_line_sync("nvidia-settings -q GPUUtilization -t")[1].toString();
  util = util.substring(9,11);
  util = util.replace(/\D/g,'');

  temp = GLib.spawn_command_line_sync("nvidia-settings -q GPUCoreTemp -t")[1].toString();
  temp = temp.split('\n')[0];

  res = "GPU: " + util + "%, " + temp + "\xB0" + "C";
  return new St.Label({text: res});
}

function enable() {
  button = new St.Bin({
    style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: false,
    track_hover: true
  });

  settings = GLib.find_program_in_path("nvidia-settings");

  if (settings) {
    button.set_child(get_info());
    button.connect('button-press-event', open_settings);

    timeout_id = GLib.timeout_add_seconds(0, 2, Lang.bind(this, function () {
        button.set_child(get_info());
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
