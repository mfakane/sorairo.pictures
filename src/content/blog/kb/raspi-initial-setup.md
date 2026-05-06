---
title: Raspberry Pi を買ってみた + 初期設定
date: 2014-09-10 04:31:00
category: kb
tags:
  - raspi
  - raspbian
  - linux
---

うちにはホームサーバと言うほどでもない、あまり仕事してないなんともいえない常時稼働マシンがある。  
Tiger 時代の Mac mini に Lubuntu を入れて、それを GUI レス起動にし、いらないパッケージを散々引っこ抜いて適当に運用していたが、
やらせてる内容の割にマシンスペック余ってて電気とか場所とか無駄だなーと思ったので、今回それを [Raspberry Pi](http://www.raspberrypi.org/) B+ で置き換えてみることにした。

Raspberry Pi 自体はそれ向けに作られてる拡張基板を導入して機能を広げてみたり、自作の基盤を繋いで謎仕事させてみたり、モバイルバッテリーで稼働させてみたりなどもっと面白いことをするのにも向いているデバイスだが、今回そういったものには全く触れないことにする。

<!-- more -->

# 用意した物

* **Raspberry Pi B+**  
  本体。  
  [RS Online](http://jp.rs-online.com/web/) や [Amazon](www.amazon.co.jp/gp/search?field-keywords=Raspberry+Pi) のほか、[ModMyPi](https://www.modmypi.com/) や [Pimoroni Shop](http://shop.pimoroni.com/) などで購入できる。大抵はケースと一緒のセットがあるので、好きなケースがあるところで買おう。  
  うちはケースも一緒に頼んだものの、在庫がなくて届くのはだいぶ先なので、
  今のところ raspi の外箱に本体を突っ込んで適当にコネクタ用の穴を切り抜いて使っている。  
  世の中には LEGO を使用して自分でケースを作る人も結構いるらしい。  
  案外電源 LED がまぶしいのでクリアじゃなくて不透明のケース頼めば良かった…
* **U2HS-T201SWH**  
  セルフパワー USB ハブ。  
  raspi は USB の電力周りが弱いらしく (B+ で一応改善されてはいるらしい)、いろいろ機器を接続するのであればセルフパワーの USB ハブを繋ぐのが推奨らしい。
  充電用ポート搭載で raspi 本体の電源にもなる。繋ぐと一見接続がループしているようでシュール。
* **GW-USNANO2A**  
  小型無線 LAN アダプタ。  
  最近のならおそらく何でも良さそうだけど、[比較的消費電力が少なくて良いらしい](http://www.softantenna.com/wp/hard/planex-gw-usnano2a/)。  
  稼働中は LED がちょっとまぶしいのが難。
* **microSDHC カード**  
  Transcend 製。  
  事前に他のマシンで公式からダウンロードした OS イメージを [Win32 Disk Imager](http://sourceforge.net/projects/win32diskimager/) などを使って書き込んで、それを本体にセットする。  
  イメージのダウンロードにはそれなりの時間がかかるので、raspi を注文してから届くまでの間に事前に使うディストリを決めてダウンロードしておくことを強く推奨する。  
  今回は自分が使い慣れた Debian 系のほうがいいかなと思い、raspi では標準的な Raspbian を選んだ。


# 初期設定
本体に OS インストール済み SD カード、マウス、キーボード、画面、USB ハブとその先に無線 LAN アダプタを繋いで、
ハブの充電用ポートにつないだケーブルを本体の電源用 USB ポートにつなぐと起動する。  
うまくいけば画面が一瞬虹色になり、その後起動時のメッセージが次々流れていく。

ほうっておくと raspi-config が立ち上がるので、必要そうな項目を順番にそれっぽく設定する。

日本語キーボードで記号類を正常に打てるようにするためには

1. `4 Internationalisation Options`
2. `13 Change Keyboard Layout`
3. `Generic 105-Key (Intl) PC`
4. `Japanese`
5. `Japanese` か `Japanese (OADG 109A)`

の順に選ぶ。

設定が完了したら矢印キーの左右を使用して `<finish>` を選ぶ。
これを選択しないと起動時に毎回 raspi-config が立ち上がる。  
もし後から設定しなおしたい項目があった場合、`$ sudo raspi-config` で raspi-config を起動できる。
