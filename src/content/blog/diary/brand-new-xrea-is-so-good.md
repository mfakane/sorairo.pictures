---
title: XREA の新しいサーバがすごい
date: 2017-05-05 20:54:00
category: diary
tags:
  - server
  - xrea
---

もはや老舗といってもいい広告貼付系無料レンタルサーバー XREA が今年に入って[新しい仕様のサーバへ移行が進んでいる](https://www.xrea.com/info/brandnew2017.php)のですが、最近私の使っている範囲のサーバも更新されたので、試しに触ってみました。  
SSH ログインで適当にコマンドを叩いてみたところ、少し面白いことが分かりました。

<!-- more -->

```
-bash-4.2$ uname -srv
Linux 4.4.0-64-generic #85-Ubuntu SMP Mon Feb 20 11:50:30 UTC 2017
-bash-4.2$ cat /etc/redhat-release
CentOS Linux release 7.3.1611 (Core)
```

Ubuntu ホスト上で CentOS が動いてるらしいです？

```
-bash-4.2$ which git
/usr/bin/git
-bash-4.2$ git --version
git version 1.8.3.1
```

git がデフォルトでインストールされています。昔は XREA で git を使おうと思うと[ホームディレクトリ以下にビルドしてインストール](http://sangoukan.xrea.jp/cgi-bin/tDiary/?date=20120415)する必要があったので、お手軽になりましたね。

```
-bash-4.2$ which node
/usr/bin/node
-bash-4.2$ node -v
v6.9.4
```

なんと node も入っています。[Hexo](https://hexo.io) なんかを入れて、git hook を使って push 時に自動でページを生成、みたいなこともできるんじゃないでしょうか。

実行時間制限があるので常時稼働させておく bot などは使えませんが、月額 191 JPY の XREA+ では cron も使えますので、他のレンタルサーバと比べても価格の割にはかなり自由度が高いのではないでしょうか。

XREA+ には 10 年くらいお世話になっていますが、これからもお世話になりそうです。