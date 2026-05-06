---
title: Raspberry Pi + Raspbian sSMTP を使用して、root 宛のメールを Gmail に飛ばす
date: 2014-09-17 07:15:00
category: kb
tags:
  - raspi
  - raspbian
  - linux
---

cron ジョブの実行を仕掛けてるとエラーなどで root 宛にメールが飛んでくる。  
これを自分の持ってる既存のメールアドレスに飛ばしたいが、sendmail はよくわからないし、postfix みたいな本格的なものを導入するのももちろんそれ以上に面倒である。今時メールサーバを個人で建てるなど正気でないだろう。  
そこで、sSMTP を使用すると外部の SMTP サーバを使用してメールを送信でき、root 宛のメールを自分の既存のメールアドレスに送ることができる。  
sSMTP は sendmail の代わりとなって動くため、sendmail を使用してメールを飛ばすものに sendmail の代わりに使用されることができる。

<!-- more -->

apt-get でインストール。heirloom-mailx は mail コマンド。

	$ sudo apt-get install heirloom-mailx ssmtp

/etc/ssmtp/ssmtp.conf を開いて、以下のように設定。

	# uid が 1000 未満のユーザに送られるメールの転送先
	root=foobar@gmail.com
	
	# SMTP サーバ
	mailhub=smtp.gmail.com:587
	
	# ログインユーザ名
	AuthUser=foobar@gmail.com
	
	# パスワード
	AuthPass=passwd
	
	# STARTTLS を使用する
	UseSTARTTLS=YES
	
	# 送信元のホスト名、適当で良いがサーバに当ててるドメインがあればそれが良い？
	hostname=foobar.example.com

基本的にデフォルトの中身をコメントの指示通りに設定して、AuthUser, AuthPass, UseSTARTTLS を追加すれば良い。  
Gmail 以外の場合も、その任意のサーバに合わせて適宜設定すればよい。

# テスト
試しに root にメールを送り付ける。

	$ mail root
	Subject: test
	foobar
	.
	EOT

設定で指定したアカウントにメールが飛んできたら成功。  
root 以外にも、もちろん任意のメールアドレスを送信先に指定することでメールを送ることができる。

# 注意点
sSMTP はあらゆるメール送信を設定された SMTP サーバの設定されたユーザから送信するので、複数人で使用するマシンには推奨できない。  
とくに Gmail を使用する場合はその Gmail アカウントに登録された送信元アドレス以外はデフォルトのアドレスに修正されてしまう。ご注意を。