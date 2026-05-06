---
title: Raspberry Pi + Arch Linux 初期設定
date: 2014-09-21 04:30:00
category: kb
tags:
  - raspi
  - arch
  - linux
---

Arch が使ってみたくなったので、公式から Arch のイメージを落とし、SD カードに書き込む。  
デフォルトで DHCP でつながり、sshd が動くので環境によっては電源投入すると即 SSH ログインできる。(デフォルトのホスト名は alarmpi)  
root でログイン。初期パスワードも root。

<!-- more -->

# 地域設定

現在のセッションのキーマップを設定。

	# loadkeys jp106

`# nano /etc/vconsole.conf` で以下の内容を書き込む。

	KEYMAP=jp106

タイムゾーンを Tokyo にする。

	# ln -s /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

`# nano /etc/locale.gen` で以下の二行をアンコメント。ばらばらにあるので検索で探そう。

	#en_US.UTF-8 UTF-8
	#ja_JP.UTF-8 UTF-8

ロケールを生成して、セットする。

	# export LANG=en_US.UTF-8
	# echo LANG=en_US.UTF-8 > /etc/locale.conf


# ホスト名設定

名づける。

	# echo Lazuli > /etc/hostname


# ネットワークの初期設定
自分のところでは無線 LAN コネクタを使うので、それの設定。
参考: [netctl - Arch Wiki](https://wiki.archlinux.org/index.php/Netctl)

まずは eth0 の自動設定を無効化。

	# systemctl stop netctl-ifplugd@eth0.service
	# systemctl disable netctl-ifplugd@eth0.service

親切なウィザードで無線 LAN コネクタのセットアップ。

	# wifi-menu -o

今回のプロファイル名は wlan0-profile とする。  
固定 IP アドレスとかの設定が必要ならば生成したプロファイルを編集する。/etc/netctl/examples/* にあるサンプルを参考にすると良い。

	# nano -w /etc/netctl/wlan0-profile

プロファイルを開始するには以下。

	# netctl start wlan0-profile

問題なく開始できたら起動時に使用するようにセットする。

	# netctl enable wlan0-profile


# パッケージの更新

	# pacman -Syu

できるやつだ。なお検索は

	# pacman -Ss query

で可能。インストール済みのものを検索するには S を Q にする。  
削除は

	# pacman -R packagename

であり、設定ファイルを含めて削除するには `pacman -Rn packagename` とする。


# 時刻の同期
ntpd 使うやり方は検索でたくさん出てくるけど、なんか systemd-timesyncd 動いたからこれでいいや。  
`# nano /etc/systemd/timesyncd.conf` で `NTP=ntp.nict.jp` など追記して、以下で有効にする。

	# timedatectl set-ntp 1

再起動して時刻が正常なら成功。


# sudo 入れる
デフォルトでは入ってないので、インストールする。

	# pacman -S sudo

`# visudo` で suroders を編集する。以下の行をアンコメントし、wheel グループを sudo 可能にする。

	# %wheel ALL=(ALL) ALL


# ユーザを作る

普段使用するためのユーザを作成する。wheel と adm グループにとりあえず突っ込んでおく。パスワードも設定する。

	# useradd -G wheel,adm -m foo
	# passwd foo

ついでに root のパスワードがそのままなのもアレなので、パスワードを変更しておこう。

	# passwd

次回から通常ユーザを使用して作業する。


# その他
`tail /var/log/syslog` の代わりに `journalctl -n` (-n の後に数値指定で行数指定)、`service foo start` の代わりに `systemctl start foo.service` を使う。  
journalctl は例えば `journalctl -n /usr/bin/sshd` で sshd のログだけ読めたりもする。便利。  
[systemd - Arch Wiki](https://wiki.archlinux.org/index.php/Systemd) や man に大体書いてあるので活用すべし。

どうせ Linux だし、Raspbian でやった [無線 LAN アダプタの省電力設定解除](raspi-wlan-setup.md) や [sSMTP を使用する](raspi-redirect-root-mail-with-ssmtp.md) なのは大体そのまま使えると思う、たぶん。
