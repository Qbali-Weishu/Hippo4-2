# 回放规则

## 时间与身份

- Web 和 CDN 的无时区时间按 `Asia/Shanghai` 解释；CDN 归一化时减去政策中的 `edge_clock_ahead_seconds`；认证按 RFC3339；SQL 的 `time_ms` 是 UTC epoch milliseconds。
- 候选种子必须存在且落在候选窗口（端点包含）内，否则候选无效且 `chain` 为空；无效候选的情报字段为 `unknown`，其事件时间只需保持可解析。
- 规范用户由事件自带的非空值、有效期内唯一别名、有效期内唯一会话绑定组成；非空来源冲突时结果为空。链中各阶段必须保持同一规范用户；无法确定身份时不得凭空补值。

## 阶段与决策

- 阶段必须按 `recon`、`auth`、`exploit`、`data` 顺序，使用同一应用、会话和规范用户；每阶段在窗口内，时间不倒退，相邻阶段间隔不超过该候选的 `chain_gap_seconds`。
- `recon` 使用种子 Web 事件；`auth` 使用同会话的成功认证事件。
- `exploit` 的主事件可以是成功的 `stored` Web 事件，或同请求、同应用/会话/规范用户且 `executed`、`rows>0` 的 SQL；`data` 的主事件可以是成功且达到阈值的 `exported` Web 事件，或同请求、同应用/会话/规范用户且 `executed`、`sensitive_rows>0` 的 SQL。HTTP 成功状态为 200–399。
- 非主事件证明必须使用输入中的请求、应用、会话和规范用户，并满足对应阶段的成功效果；SQL 主事件可以引用符合条件的 Web 证明，Web 主事件可以引用符合条件的 SQL 证明。
- CDN/WAF 控制证据除请求和应用匹配外，还须与阶段主事件的归一化 UTC 时间相差不超过 5 秒；action 非空且不是 `allow`，或 rule 非空且不是 `none`。SQL 控制证据要求相同应用、非空请求且 `effect=blocked`。控制证据不构成成功证明，也不参与资源竞争。
- `proof_ids`、`control_ids` 采用集合语义；主事件可以重复列入证明，也可以只在阶段主字段中表示。候选级列表必须覆盖阶段引用的真实证明和控制证据。
- 四阶段完整且未命中授权范围为 `confirmed`；阶段不足为 `unresolved`；所有 Web 阶段均命中批准变更或安全工具范围为 `authorized`。处置动作读取治理响应政策；`partial` 覆盖不能证明阴性结论。

## 资源与查询

- 成功阶段占用 `app|request_id`；请求为空时使用该事件 ID。不同应用的同名请求不同。控制记录不消耗资源。
- 对所有候选统一选择：已证明阶段总数最多，其次相邻阶段间隔总和最小，最后按候选 ID 和阶段主事件 ID 字典序稳定决胜；资源冲突允许候选退让为空或较短前缀，但不改变其 `valid` 状态。
- 查询集合必须与政策定义一致；数组顺序不代表语义。查询计划以政策 `as_of_utc` 为分析锚点，每条查询回溯 `hours`，间隔和费率直接取政策字段。
- 每条查询 `cost_per_run = hours × rate`，`hourly_cost = cost_per_run × 60 ÷ minutes`；`total_cost` 汇总单次成本，`hourly_total_cost` 汇总小时成本；`under_budget` 同时检查单次和小时预算。
