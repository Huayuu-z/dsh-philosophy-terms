# 哲学词谱 / Philosophy Lexicon

一个 Harness Web 插件：输入哲学书名，凝练三个关键概念，接入 Stanford Encyclopedia of Philosophy（SEP）生成中文哲学释义，并允许对每个词作出「感兴趣 / 一般 / 不感兴趣」的评价。评价会进入阅读口味模型，用于每天推荐一个尚未遇见、但可能感兴趣的哲学词汇。

## 使用

1. 安装并启用本 bundle（设置 → 插件，或由 `plugin_manager` 安装工作区目录）。
2. 在左侧栏点击「哲学词谱」图标。
3. 输入书名（作者可选），点击「凝练三个词」。一次分析通常需要 30–90 秒：先辨认全书概念结构，再检索 SEP 词条，最后写三段 200–1000 字的释义。
4. 对每个词选择「感兴趣 / 一般 / 不感兴趣」。
5. 释义中带下划线的概念、以及下方的「相关概念」标签，都可以点击。插件会再次检索 SEP，生成一段 200–1000 字的中文哲学释义，并可以继续点开其中的概念，形成一条可回溯的查询链。
6. 在「每日一词」中领取当天推荐；同一自然日只生成一个词（按 Asia/Shanghai 计算）。如果当前推荐不合口味，点「换一个词」会在排除当前词和词谱已有词后重新推荐，并覆盖今天的推荐。释义较长时，把鼠标放在定义区，可以直接用滚轮在卡片内部上下滚动。
7. 右上角「我的书目」可以查看全部历史书目，并修改书名、作者、领域、备注，或删除整本书；也可以从那里直接打开某本书的词条。

## 数据与来源

* 词谱、评价、每日推荐和已查询的概念释义通过 `ctx.storageDomain` 的 `philosophy_reading` domain 持久化，跨书、跨会话、跨重启保留。
* 释义优先抓取 `plato.stanford.edu/entries/...` 原文，再交给模型以中文哲学语言重写；若 SEP 暂时不可达，会标明「SEP 未直连 · 依据哲学史知识」。
* 释义为 200–1000 字，UI 会显示实际字数；SEP 原词条链接始终附在卡片底部。
* 概念查询会缓存到 `concepts` 表；同一个概念第二次打开不会重复请求模型。

## 能力边界

* 需要当前 profile 中已启用 `storageDomain`、`llm`、`agentDefaultModel`、`webServer`、`web` 这些服务，以及一个可用的默认模型。
* 这是阅读辅助工具，不是 SEP 的替代品；正式引用请回到原词条。

## 从 GitHub 安装

在 DSH Web 的 **Plugins → Add plugin → Install a third-party plugin** 中填入：

```text
https://github.com/Huayuu-z/dsh-philosophy-terms
```

或：

```text
github:Huayuu-z/dsh-philosophy-terms
```

本插件没有构建步骤，也没有额外依赖，`pnpm` 安装后即可加载。安装完成后刷新页面。

如果只想手动安装，也可以下载 Release 中的 zip，按下面的「分享给朋友」步骤用本地目录安装。

> 安全提示：插件会在本机注册 `/philosophy/api`，没有额外的鉴权。请让 DSH 保持默认的 `127.0.0.1` 绑定，不要把 Harness Web 暴露到局域网或公网。详见 [SECURITY.md](SECURITY.md)。

## 分享给朋友

这是一个纯 JavaScript 的本地 bundle，没有构建步骤，也没有额外的 npm 依赖。把整个 `philosophy-terms` 文件夹打包发给朋友即可。

朋友收到后：

1. 解压到一个**固定、不会被移动或删除**的目录，例如 `C:\Users\<用户名>\dsh-plugins\philosophy-terms`。不要放在“下载”文件夹里。
2. 打开 DSH Web，进入左侧 **Plugins**。
3. 点 **Add plugin** 旁边的箭头，选 **Install a third-party plugin**。
4. 在输入框里填这个文件夹的**绝对路径**，例如 `C:\Users\alice\dsh-plugins\philosophy-terms`，然后安装。
5. 安装完成后刷新页面；左侧栏会出现「哲学词谱」图标。

说明：

* 这是 `link:` 安装，DSH 直接读取这个目录。目录被移动、改名或删除后插件会失效，重新按上面的路径安装即可。
* 朋友需要已经登录可用的模型，并且 profile 里有 `web`/`webServer`/`storageDomain` 等基础服务；默认 Web profile 通常都有。
* 插件按 `Asia/Shanghai` 计算“每日一词”的日期；如果朋友在其他时区，跨日时间会按北京时间。
* 书目和评价只写进朋友自己的 `~/.dsh/storages/philosophy_reading.json`，不会随插件目录一起分享。

## License

本项目采用 **PolyForm Noncommercial License 1.0.0**，属于 source-available，不是 OSI 开源许可证。

* 允许：个人、研究、教学等**非商业目的**的使用、修改和再分发。
* 再分发修改版时，必须附带本许可证及 `Required Notice`。
* 禁止：任何**商业用途**，包括销售、付费分发、作为付费产品或商业服务的一部分提供。
* 商业授权需要单独获得书面许可。Commercial licensing: <3140728341@qq.com>

完整条款见 [LICENSE](LICENSE)。这是授权层面的约束，不是技术上的复制保护；公开仓库仍可能被 fork，侵权处理需要依据许可证和平台规则进行。

