---
title: 新しい Metasequoia.Sharp
date: 2017-03-21 12:39:00
category: notice
tags:
  - csharp
  - metasequoia
  - apps
---

https://github.com/mfakane/mqsharp

C# 用 Metasequoia プラグインフレームワークを作り直して Metaseq 4 向けになりました。

ILMerge を使うのをやめて Shared Project を一つ参照するだけで Metaseq から読み込める DLL を作成できます。
クラス構造も一新してより C# にな感じの API になりました。

ユーザデータやウィジェット周りは未実装です。

基本的な使い方に関しては Wiki のほうに雑にまとめています。  
[基本 · mfakane/mqsharp Wiki](https://github.com/mfakane/mqsharp/wiki/%E5%9F%BA%E6%9C%AC)

気が向いたら更新します。
