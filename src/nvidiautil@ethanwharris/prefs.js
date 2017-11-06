const Gtk = imports.gi.Gtk;

const Gettext = imports.gettext.domain('gnome-shell-extensions-nvidiautil');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Util = Me.imports.util;

const SETTINGS = {
    gpuutilisation : {
        type : 'bool',
        key : 'gpuutilisation',
        label : _("GPU Utilisation"),
        tooltip : _("Displays the GPU utilisation in the toolbar")
    },
    gputemp : {
        type : 'bool',
        key : 'gputemp',
        label : _("GPU Temperature"),
        tooltip : _("Displays the GPU temperature in the toolbar")
    },
    gpumemoryutilisation : {
        type : 'bool',
        key : 'gpumemoryutilisation',
        label : _("GPU Memory Utilisation"),
        tooltip : _("Displays the GPU memory utilisation in the toolbar")
    }
};

let settings;

function init() {
    settings = Util.getSettings();
}

function buildSettingWidget(setting) {
    let box = new Gtk.Box(({ orientation : Gtk.Orientation.HORIZONTAL }));

    if (SETTINGS[setting].type == 'bool') {
        let label = new Gtk.Label(({ label : _(SETTINGS[setting].label), xalign: 0}));
        let control = new Gtk.Switch({ active : settings.get_boolean(setting) });

        control.connect('notify::active', function(button) {
            settings.set_boolean(setting, button.get_active());
        });

        label.set_tooltip_text(_(SETTINGS[setting].tooltip));
        control.set_tooltip_text(_(SETTINGS[setting].tooltip));

        box.pack_start(label, true, true, 0);
        box.add(control);
    }

    return box;
}

function buildPrefsWidget() {

    let vbox = new Gtk.Box({ orientation : Gtk.Orientation.VERTICAL,
        border_width: 10 });

    for (setting in SETTINGS) {
        let setting_box = buildSettingWidget(setting);
        vbox.add(setting_box);
    }

    vbox.show_all();

    return vbox;
}
