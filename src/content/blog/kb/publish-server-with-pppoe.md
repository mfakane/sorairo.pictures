---
title: v6 プラス環境下で PPPoE で外部にサーバを公開する
date: 2017-08-11 04:07:10
category: kb
tags:
  - arch
  - linux
  - pppoe
---

[v6 プラス](https://www.jpne.co.jp/service/v6plus/) 環境下で IPv4 でサーバを公開するために、Arch Linux マシンから PPPoE 接続を試みます。

v6 プラスな環境は IPv4 の通信が IPv6 に包まれ送信されます。設定不要で接続が簡単ですが、IPv4 なサーバに接続する際に初めて NAT されて IPv4 アドレスを使って通信し、複数ユーザで一つの IPv4 アドレスを共有される形になります。  
ユーザ個別の IPv4 アドレスが得られないため、外側からユーザの設備まで到達することができません。よって、v6 プラス環境では IPv4 を使用して自宅でサーバを公開することができません。

そこで、HGW の PPPoE ブリッジ機能を通して LAN 内から PPPoE 接続を試みることによりグローバルな IPv4 アドレスを取得し、外からアクセスできるようにします。

<!-- more -->

以下のページを参考にしました。

- [pppd - ArchWiki](https://wiki.archlinuxjp.org/index.php/Pppd)
- [モデムに直接接続 - ArchWiki](https://wiki.archlinuxjp.org/index.php/%E3%83%A2%E3%83%87%E3%83%A0%E3%81%AB%E7%9B%B4%E6%8E%A5%E6%8E%A5%E7%B6%9A)

## パッケージのインストール
PPPoE 接続に必要な [rp-pppoe](https://www.archlinuxjp.org/packages/?name=rp-pppoe) をインストールします。

```
# pacman -S rp-pppoe
```

## PPPoE 接続のセットアップ
ppp サービスを使う方法と、adsl サービスを使う方法の二通りがあります。

### ppp サービスを使う
`/etc/ppp/peers` 以下に任意の名前で接続先情報ファイルを作成します。(例: `provider`)

```
# cd /etc/ppp
# nano peers/provider
```
```
plugin rp-pppoe.so

# インターフェイス名
eth0
# ISP のユーザ名
name "username@example.com"
persist
# デフォルトの経路として設定する
defaultroute
hide-password
noauth
```

`/etc/ppp/pap-secrets` もしくは `/etc/ppp/chap-secrets` を編集し、認証情報を追加します。
通常は認証方式に合わせてファイルを選択しますが、両方に書いても大丈夫です。pppd が適切な方を自動的に選択します。

```
# nano /etc/ppp/chap-secrets
```
```
"username@example.com" * "passwd"
```

`ppp@接続先名` サービスを起動することで接続を試みます。

```
# systemctl start ppp@provider
```

`ip addr` などで `ppp0` インターフェイスが出現するかどうかなどを確認し、正常に接続されているかどうかを確認してください。


### adsl サービスを使う
`pppoe-setup` を実行することで対話的に接続情報の設定ができます。

```
# pppoe-setup
```

設定が完了したら adsl サービスを起動し接続を試みます。

```
# systemctl start adsl
```

`ip addr` などで `ppp0` インターフェイスが出現するかどうかなどを確認し、正常に接続されているかどうかを確認してください。

## ルーティングの設定
上記の設定ではデフォルトの経路が PPPoE 経由となるため、接続後は既定で通信が LAN 上の ルータではなく PPPoE 経由で行われるようになります。デフォルトの経路を PPPoE 接続にしない場合、外からの通信に対して応答するためには追加の経路の設定が必要になります。  
具体的には、デフォルトの経路を `ppp0` ではなく `eth0` のまま `ppp0` から来たパケットに応答しようとすると、応答パケットが `ppp0` ではなく `eth0` から送出されてしまい外から応答を受け取ることができないので、`ppp0` から来たパケットへの返答パケットだけを `ppp0` に返すようにします。

以下のページを参考にしました。
- http://d.hatena.ne.jp/hirose31/20120822/1345626743

### ルールの追加
まずルーティングのルールを確認します。
```
# ip rule
0:      from all lookup local
32766:  from all lookup main
32767:  from all lookup default
```

ルーティングテーブル `local` には主にループバックなどの設定が含まれており、普段 `ip` コマンドで行う設定は `main` に含まれております。  
(ちなみに、テーブルの中身は以下のようなコマンドで確認できます。)
```
# ip route show table local
```

`ppp0` からのパケットを振り分けるために、`main` より高い優先度で送信元が `ppp0` なパケットに一致するルールを作成します。
`<addr>` には `ppp0` に割り当てられている IP アドレスを入れてください。
```
# ip rule add from <addr> table 100 prio 200
```

次にそれに一致したとき `ppp0` 経由で出ていくようにします。
```
# ip route add dev ppp0 src <addr> table 100
```

こうすることで `<addr>` から送り返すパケットは `ppp0` を通るようになり、外からの通信に対して正しく返答できるようになります。

この設定は PPPoE 接続が確立したとき毎回必要になりますが、pppd には接続が確立したときや切断されたときなどにスクリプトを呼ぶ機能を使うことで、自動化できます。  
例えば、`/etc/ppp/ip-up.d/*` は PPP 接続が確立したときに呼ばれるので、`/etc/ppp/ip-up.d/10-rule.sh` などの名前で以下のようなスクリプトを作成することで自動的にルールを追加できます。

```bash
#!/bin/sh
ip rule add from $4 table 100 prio 200
ip route add dev ppp0 src $4 table 100
```

## 補足
PPPoE 接続されグローバル IP アドレスを獲得すると、デフォルトでは全ポートがインターネットに公開されます。`iptables` や `firewalld` などでファイアウォールを設定し、公開したいポートだけを公開するよう設定してください。

## 余談
記事書くのさぼってるうちに環境が変わってサーバが立てられなくなりました。鬱です。
