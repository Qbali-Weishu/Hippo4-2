# 输入目录

目录保持按来源分组的紧凑结构；每个主日志文件包含核心候选、正常业务、自动化工具、阻断请求和时间边界样本，不能按单条候选事件假设文件只含少量记录。

- webapp_access/events.jsonl：Web 应用访问事件。
- api_auth/events.jsonl：认证与会话事件。
- app_sql_query/events.jsonl：应用数据库查询事件。
- cdn_logs/events.jsonl：CDN/WAF 事件。
- threat_intel_feeds/events.json：情报状态及合并文件内的快照元数据。
- attack_sessions/windows.json：候选窗口。
- identity/identity.json：用户别名和会话绑定。
- governance/governance.json：应用、覆盖、授权、安全工具和响应策略。
- policies/policies.md：时间、决策和查询预算政策。
- source_catalog/catalog.csv：来源字段和关联键目录。

## 材料角色

- `policies.md`：时间换算、阶段归属、全局竞争、处置边界与查询预算的规则；同名规则冲突时以此文件为准。
- `catalog.csv`：列出已交付来源的时间基准与关联字段；不新增未知来源，也不覆盖政策中的时间修正参数。
- `governance.json`：应用状态、授权范围、覆盖事实、已登记工具和响应条件；`response_policy` 中的条件用于选择处置动作与保全范围。
- `identity.json`：用户别名和会话绑定的时态事实；`events.json` 的 indicators 是情报状态事实，snapshots 记录材料来源，不覆盖 indicator 的时间状态。
- `windows.json`：候选活动的输入范围；四类 JSONL 是观测事实，采集侧 `stage` 不保证等同于事件效果。

## 交付结构

`result.json` 保留原型中的 `schema_version`、`as_of_utc`、`candidates`、`summary` 和 `query_plan` 顶层字段；版本号为正整数。每个候选至少包含 `id`、`valid`、`classification`、`action`、`canonical_user`、`event_time_utc`、`intel_at_event`、`intel_at_anchor`、`coverage`、`chain`、`evidence_ids` 和 `control_evidence_ids`。`chain` 逐阶段列出来源事件 ID、UTC 时间以及证明与控制证据 ID；证据列表不应包含请求 ID 或不存在的事件。`query_plan.queries` 保留政策中的查询顺序、来源、关联键、窗口、调度周期和成本，并给出预算状态。查询文件与报告应与 JSON 中的候选和查询计划一致。
