# 060 免费档提示卡片与剧情不相关：撤销 _free_sug

日期：2026-11-19
分支：`fix/remove-free-sug`
相关：`engine/server.py`（`run_site_chat` 免费分支）；修正 notes/057

## 现象

免费档（nalang-turbo-*）底部提示卡片与当前剧情弱相关/不相关。

## 根因

notes/057 用 `_free_sug` 从正文抠「建议X： / - / 1.」行当建议卡片。但免费模型
不产「动态接话建议」——它吐的「建议X」是**卡片系统提示自带的固定剧情走向模板**
（每轮输出类似的「建议二：关掉电视 / 建议三：去阳台」），不随用户当前这轮对话
变化；「- / 1.」bullet 还可能误伤正文里的普通列表行。付费档的 `suggestedReplies`
是上游针对当前对话动态生成的，强相关；免费档抠出来的固定模板自然弱相关/不相关。

## 修复（只动引擎，前端零改动）

删除 `_free_sug` 及相关常量（`SUG_ADVICE_RE` / `SUG_BULLET_RE` / `SUG_TAG_RE` /
`SUG_JUNK_RE`）。免费分支改为只 `_strip_sug(final_text)`：

- 剥掉写进 `<sug>` 的状态面板垃圾（不显示垃圾卡片）；
- **不抠建议行、不补卡片**（宁缺毋滥）。

要相关卡片走付费档（Flux/Max 的 `suggestedReplies` 动态强相关）。

## 自检

- `python -m py_compile engine/server.py` 通过；
- `python -m unittest discover engine/tests` 87 项全过。

## 回滚

```powershell
git revert <本次提交>
# 生产：/opt/lan/backup-* 覆盖回 engine/server.py 后 systemctl restart lan-engine
```
