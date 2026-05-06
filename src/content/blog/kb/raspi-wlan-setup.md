---
title: Raspberry Pi + Raspbian 無線 LAN 接続設定
date: 2014-09-11 06:57:00
category: kb
tags:
  - raspi
  - raspbian
  - linux
---

wpa\_supplicant の設定になるが、めんどくさいので GUI から設定する。

1. デフォルトユーザでログインし、`$ startx` で LXDE が起動する。
2. 表示されたら、デスクトップにある `WiFi Config` を開く。左下のメニューから wpa\_gui を探して起動しても可。
3. `Scan` を押しスキャンダイアログを開き、それにある `Scan` を押し周囲のアクセスポイントをスキャンする。
4. 対象のアクセスポイントをダブルクリックすると接続設定を入力するダイアログが出るので、
   適切に設定したら `Add` し、メインウィンドウに戻ってくると Network の一覧に追加されている。
5. 元のウィンドウの `Connect` を押すとアクセスポイントに接続され、DHCP で IP アドレスが降ってくる。

大抵はこれで完了。
固定アドレスを割り振りたい場合は /etc/network/interfaces を適切に編集する。
