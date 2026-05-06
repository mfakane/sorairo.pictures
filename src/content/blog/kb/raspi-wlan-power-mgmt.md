---
title: Raspberry Pi + Raspbian 無線 LAN アダプタの省電力モードをオフにする
date: 2014-09-12 04:58:00
category: kb
tags:
  - raspi
  - raspbian
  - linux
---

raspi を[小型無線 LAN アダプタでネットに接続している](raspi-wlan-setup.md)が、放っておくと ping が通らなかったり、SSH の接続が切れたりする現象に悩まされて調べたところ、
[Raspberry Pi • View topic - WLAN disappears after some time](http://www.raspberrypi.org/forums/viewtopic.php?f=28&t=51543)
を見たところ省電力モードが原因らしい。

	$ lsusb
	Bus 001 Device 002: ID 0424:9514 Standard Microsystems Corp.
	Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
	Bus 001 Device 003: ID 0424:ec00 Standard Microsystems Corp.
	Bus 001 Device 004: ID 1a40:0101 Terminus Technology Inc. 4-Port HUB
	Bus 001 Device 005: ID 2019:ab2a PLANEX GW-USNano2 802.11n Wireless Adapter [Realtek RTL8188CUS]

で無線子機が RTL8188CUS のを確認する。  
8192cu ドライバが使われるこれは省電力モードが特殊らしく、
iwconfig で見ても常に `Power Management:off` としか表示されず、`iwconfig wlan0 power off` もエラーが出て実行できない。

`$ sudo nano /etc/modprobe.d/8192cu.conf` で設定ファイルを作成し、以下の内容を書き込むことで省電力モードを無効化できる。

	# Disable power management
	options 8192cu rtw_power_mgnt=0 rtw_enusbss=0

省電力モードが有効かどうかは `$ cat /sys/module/8192cu/parameters/rtw_power_mgnt` で確認でき、  
上記の設定をする前は 1 を返し、設定後 reboot すると 0 になっているはずである。

この設定をしたところ、ping が通らなかったりマシンを見失うことがなくなった。めでたし。
