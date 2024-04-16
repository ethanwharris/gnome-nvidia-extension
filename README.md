<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- Copyright Contributors to the gnome-nvidia-extension project. -->

# gnome-nvidia-extension
A Gnome extension to show Nvidia GPU information
(https://extensions.gnome.org/extension/1320/nvidia-gpu-stats-tool/)

## Supported Gnome versions
The "master" branch supports only Gnome v45+.
For older shell versions, please check out the "legacy" branch.

## Requirements
The extension requires `nvidia-smi`, which should be included with the drivers.
Additionally, `nvidia-settings` is supported as a data source.

## Installation from git
    git clone https://github.com/ethanwharris/gnome-nvidia-extension.git
    cd gnome-nvidia-extension
    make
    make install

Restart gnome shell to load the extension:
- On Wayland, log out and back in.
- On X11, you can also use `alt + f2`, `r`, `Enter` to reload more quickly.

Afterwards, you can enable the extension in gnome-extensions.

## Selecting Properties
By default, no measurements are displayed in the menu bar.
You can open the dropdown menu and select the properties to be shown.

## Icons
For icons we use font-awesome:
http://fontawesome.io/

We obtain SVGs from:
https://github.com/encharm/Font-Awesome-SVG-PNG
