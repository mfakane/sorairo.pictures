---
title: Raspberry Pi + Arch Linux 初期設定
date: 2014-09-17 07:15:00
category: kb
tags:
  - raspi
  - raspbian
  - linux
---

適当なユーザを追加する。

	$ sudo adduser foo

pi の groups を見て、

	$ groups pi
	pi : pi adm dialout cdrom sudo audio video plugdev games users netdev input spi gpio

それぞれ新しいユーザをそのグループに追加していく。

	$ sudo adduser foo adm
	$ sudo adduser foo dialout
	...
	$ sudo adduser foo gpio

新しいユーザでログインしなおして、用済みのデフォルトユーザを削除する。

	$ sudo userdel -r pi

`$ sudo visudo` で sudoers にある pi 用の記述を削除する。

	# ↓この行を消す
	pi ALL=(ALL) NOPASSWD: ALL


別に新しくユーザを追加しなくても、root ログインしてから usermod を使用してデフォルトユーザの名前を変更するだけでも良いかもしれない。その場合においても、sudoers の変更はするべき。
