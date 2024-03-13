<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- Copyright Contributors to the gnome-nvidia-extension project. -->

# gnome-nvidia-extension
A Gnome extension to show Nvidia GPU information
(https://extensions.gnome.org/extension/1320/nvidia-gpu-stats-tool/)

# Supported Gnome versions
The "master" branch supports only Gnome v45+.
For older shell versions, please check out the "legacy" branch.

# Requirements
nvidia-settings and nvidia-smi

# Installation from git
    git clone https://github.com/ethanwharris/gnome-nvidia-extension.git
    cd gnome-nvidia-extension
    make
    make install

Use `alt + f2`, `r`, `Enter` to restart the gnome shell (if this is not allowed then log out and log back in)
Enable the extension in the gnome tweak tool.

# Icons
For icons we use font-awesome:
http://fontawesome.io/

We obtain SVGs from:
https://github.com/encharm/Font-Awesome-SVG-PNG
