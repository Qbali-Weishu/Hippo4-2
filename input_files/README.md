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
