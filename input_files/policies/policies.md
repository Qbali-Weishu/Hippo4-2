# 回放政策

## 时间与覆盖

- `as_of_utc`: `2026-09-29T00:00:00Z`.
- Web 时间是 Asia/Shanghai；认证是 RFC3339；SQL 是 UTC epoch milliseconds。
- CDN `edge_time` 是 Asia/Shanghai，`edge_clock_ahead_seconds=95`，关联前减 95 秒。
- `partial` 只能阻止阴性结论，不能抹去已有的直连源站证据。
- `data_export_min_response_bytes=100000`；应用侧只有明确标记为 `exported` 且响应字节数达到该阈值时，才可作为数据阶段证据。
- Web 记录中的 `stage` 是采集侧标签，不是独立的成功证明；跨源记录的证据须按有效时间、请求标识、应用、会话与身份核对。

## 决策政策

四阶段必须按时间顺序由同一会话和规范用户衔接。授权测试只能在时间、应用、来源、用户、路径和阶段全部命中时豁免。WAF blocked 不是成功；缺失或 partial 覆盖不是未发生。冻结核心应用必须精确阻断、撤销会话并保全证据，不允许整站关停。

## 重叠窗口的证据归属

- 同一应用下的同一个非空 `request_id` 是不可重复消耗的请求资源；缺失请求标识时，以该来源事件 ID 作为资源。不同应用中的同名请求不是同一资源。Web、认证及证明效果的 SQL 记录不得以不同请求/用户/会话混接。
- 一个候选的种子事件固定属于该候选；若多个候选争用同一资源，应在所有有效候选的合法阶段前缀之间统一分配，不能按窗口开始时间、文件顺序或候选编号先到先得。未分配到后续阶段的有效候选仍保留其可证明前缀。
- 优先使所有候选已证明阶段的**总数**最多；总数相同时，使各链相邻阶段的 UTC 时间间隔之和最小；仍相同时，按候选 ID 和阶段证据 ID 字典序确定稳定结果。阻断/告警等控制证据可以出现在多个候选的控制列表中，但不得作为成功阶段证据参与资源竞争。

## 查询预算

- query | id=H1 | purpose=侦察与利用 | phases=recon,exploit | sources=webapp_access,app_sql_query,cdn_logs | joins=app,request_id,session | hours=2 | minutes=30 | rate=1.0
- query | id=H2 | purpose=认证与会话 | phases=auth | sources=webapp_access,api_auth,cdn_logs | joins=app,session,request_id | hours=1 | minutes=15 | rate=0.5
- query | id=H3 | purpose=数据效果 | phases=data | sources=webapp_access,app_sql_query,cdn_logs | joins=app,request_id,session | hours=4 | minutes=60 | rate=0.25
- 单次查询不得超过 100 cost，每小时调度总成本不得超过 200 cost。维表不计费。
