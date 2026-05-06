---
title: Arch Linux で OpenVPN サーバをセットアップ
date: 2017-05-27 08:23:33
category: kb
tags:
  - arch
  - linux
  - openvpn
---

Arch Linux で OpenVPN サーバをセットアップした際のメモです。
以下のページを参考にしました。

- [OpenVPN - ArchWiki](https://wiki.archlinuxjp.org/index.php/OpenVPN)
- [Easy-RSA - ArchWiki](https://wiki.archlinuxjp.org/index.php/Easy-RSA)

ぶっちゃけこれ見れば全部書いてあります。

<!-- more -->

## どのようなものを組むか
自宅 LAN `192.168.0.0/24` 内の `192.168.0.14` のマシンを OpenVPN サーバとして、その下に作られる `10.8.0.0/24` 以下に VPN クライアントがぶら下がります。
外から VPN に接続されると、クライアントに `10.8.0.x` のアドレスが割り当てられ、`192.168.0.0/24` 内のマシンに接続可能なほか、それを経由してインターネットに接続できます。

## パッケージのインストール
必要なパッケージをインストールします。
```
# pacman -S openvpn easy-rsa
```

[openvpn](https://www.archlinuxjp.org/packages/?name=openvpn) は OpenVPN のパッケージです。
[easy-rsa](https://www.archlinuxjp.org/packages/?name=easy-rsa) は必要な証明書の作成に使用します。

## 証明書の作成

### CA の初期化
CA とサーバはセキュリティ上の理由により分離する方が望ましいそうですが、今回は適当なので同じマシンで行きます。
```
# cd /etc/easy-rsa
# easyrsa init-pki
# easyrsa build-ca
```

### サーバ証明書の作成
以下を実行します。
```
# easyrsa gen-req servername nopass
```

以下のファイルが作成されます:
- `/etc/easy-rsa/pki/reqs/servername.req`
- `/etc/easy-rsa/pki/private/servername.key`

次にサーバ証明書に署名します。
```
# easyrsa sign-req server servername
```

以下のファイルが作成されます:
- `/etc/easy-rsa/pki/issued/servername.crt`

作成された証明書と鍵をコピーします。
```
# cp /etc/easy-rsa/pki/private/servername.key /etc/openvpn/server/
# cp /etc/easy-rsa/pki/private/servername.crt /etc/openvpn/server/
```

## 必要なファイルの作成

以下を実行します。
```
# cd /etc/openvpn/server
# openssl dhparam -out dh.pem 2048
# openvpn --genkey --secret ta.key
```

## 設定ファイルの編集
`cp /usr/share/openvpn/examples/server.conf /etc/openvpn/server/server.conf` で設定のサンプルをコピーし、それを編集します。

### ポートとプロトコル
```
port 1194

# TCP or UDP server?
proto tcp
;proto udp
```
TCP 1194 を使用するように変更します。

### サブネット
```
server 10.8.0.0 255.255.255.0
```
VPN クライアントが使用するサブネットを設定します。今回はデフォルトのまま使用します。

### 暗号方式
```
cipher AES-256-CBC
auth SHA512
```
暗号および認証方式を設定します。この行はクライアント側でも同じ設定が必要になるので確認しておきます。

### 圧縮
```
# For compression compatible with older clients use comp-lzo
# If you enable it here, you must also
# enable it in the client config file.
comp-lzo
```
LZO 圧縮を有効にしておきます。

### すべての通信を VPN 経由にする
```
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
```
DHCP 以外の通信を VPN を経由するようにする設定を追加します。(bypass-dhcp を外すと DHCP の通信も VPN を経由してしまうため、クライアントがローカルの DHCP サーバからの IP アドレスのリースを失ってしまいます。)
DNS の問い合わせも VPN 経由で行われるため、利用する DNS サーバの設定 `8.8.8.8` もします。

## VPN クライアントから LAN 内マシンへ通信できるようにする
標準ではクライアントは OpenVPN サーバ自体にはアクセスできても自宅 LAN までパケットが出てこれないため、他の LAN 内マシンと通信できません。
そのため、systemd-networkd の設定を編集し、`[Network]` セクションに `IPForward=yes` を追加してパケットフォワーディングを有効にします。
```
# echo "IPForward=yes" >> /etc/systemd/network/eth0.network
# systemctl restart systemd-networkd
```

## LAN 内マシンから VPN クライアントへ通信できるようにする
自宅 LAN のルータに静的ルーティング設定を追加して、`10.8.0.0/24` への通信を OpenVPN サーバ `192.168.0.14` をゲートウェイとして経由するようにすることで自宅 LAN 内のマシンから VPN クライアントを参照することができます。
例えば、接続したクライアントが `10.8.0.6` が割り当てられているとき、自宅 LAN 内のマシンから以下のように ping が通るようになります。
```
C:\>ping 10.8.0.6

10.8.0.6 に ping を送信しています 32 バイトのデータ:
10.8.0.6 からの応答: バイト数 =32 時間 =1286ms TTL=63
10.8.0.6 からの応答: バイト数 =32 時間 =51ms TTL=63
10.8.0.6 からの応答: バイト数 =32 時間 =485ms TTL=63
10.8.0.6 からの応答: バイト数 =32 時間 =23ms TTL=63

10.8.0.6 の ping 統計:
    パケット数: 送信 = 4、受信 = 4、損失 = 0 (0% の損失)、
ラウンド トリップの概算時間 (ミリ秒):
    最小 = 23ms、最大 = 1286ms、平均 = 461ms
```

## 起動
```
# openvpn /etc/openvpn/server/server.conf
```
試しに起動してみてエラーが出ないかどうか確認してみます。

問題なさそうであればサービスとして起動します。
```
# systemctl start openvpn-server@server
```
