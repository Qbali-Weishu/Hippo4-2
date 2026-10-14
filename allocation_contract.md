# 资源竞争诊断契约

该契约补充 replay_rules.md。目标是解释攻击链不完整究竟来自缺少成功效果，还是资源已经分配给其他候选；不能把竞争失败当作攻击没有发生。

## 分配与反事实

合法选项是满足原回放规则的阶段前缀，包括空前缀。存在且位于窗口内的种子仍令候选 valid=true；如果其种子请求资源被另一个候选占用，可以分配空链，该候选分类为 unresolved。无效种子只有空前缀。一个候选内可重复引用同一请求资源；不同候选之间不可重复消耗。控制记录不消耗资源。

所有候选同时选择一个前缀，依次最大化阶段总数、最小化相邻阶段间隔总和、按主事件 ID 字典序稳定决胜。最后一级按候选 ID 升序排列，逐候选比较其主事件 ID 数组；数组按元素逐项比较，前缀相同时短数组在前；字符串按 Unicode code unit 比较。证明列表顺序、是否重复主事件以及可选派生字段不参与平局判定。

对每个候选，先独立求忽略其他候选资源占用时的最长合法前缀长度 local_max_stages。再约束该候选必须获得这个长度，重新对全部候选按同一三级目标求最优分配。其他候选可以换链或退让，不能只拿基线资源占用表删除冲突事件。无效候选的 local_max_stages=0，其反事实仍需给出完整分配。

result.json 增加 allocation_audit 对象：

- stage_total：基线分配的阶段数总和。
- gap_total_ms：基线各链相邻阶段的 UTC 间隔总和，单位毫秒。
- counterfactuals：每个候选一个对象，数组顺序不限，包含 candidate_id、local_max_stages、stage_total、gap_total_ms、assignments、displaced_candidates。
- assignments：每个输入候选恰好一条记录 {candidate_id, stage_ids}；stage_ids 按阶段顺序列出主事件 ID，无效或未获资源时为空。stage_total 和 gap_total_ms 描述该反事实分配，而非基线。
- displaced_candidates：反事实分配中阶段数比基线少的候选 ID 集合，不计仅更换事件而阶段数不变的候选。

本题不限定搜索算法，也不要求输出全部枚举前缀。所有分配必须随时间、身份、请求、成功效果和候选窗口变化重新计算。

## 证据与运行边界

exploit/data 的主事件可以是 Web 或 SQL。非主事件证明必须符合该阶段成功效果：exploit 为成功 stored Web 或 executed 且 rows>0 的 SQL；data 为成功且达到导出阈值的 exported Web 或 executed 且 sensitive_rows>0 的 SQL。证明与主事件必须匹配应用、非空请求 ID、会话和规范用户。Web 主事件也可由这样的 SQL 证明支撑；SQL 主事件可引用符合条件的 Web 证明。主事件若仅用作请求锚点，不必重复放进 proof_ids；若自身有成功效果，也可重复列出。

CDN 控制记录要求应用、非空请求匹配、校正后时间与主事件相差不超过 5 秒，并且 action 非空且不是 allow，或 rule 非空且不是 none。SQL 控制记录要求相同应用、非空请求且 effect=blocked。普通 allow/none、直连标记或响应字节本身不使 CDN 记录成为控制证据。control_ids 必须覆盖全部匹配控制记录，候选级 control_evidence_ids 必须覆盖所有阶段控制；证明和控制不能互相混用。

可选 resources 为主事件与证明对应的 app|request_id 集合，缺失请求时用事件 ID 代替 request_id；不是 URL 路径。所有新增实现依赖必须放在 /workspace/lib 内，或写在自包含的 /workspace/replay_engine 中；这是单独 verifier 传输的程序边界。

## 可读交付

hunt_queries.spl 应保留政策查询 ID、来源索引、关联键、阶段、绝对时间范围和成本/预算数据，可采用其他查询语言或说明形式。hunt_report.md 应覆盖每个候选 ID、分类、处置动作、证明与控制 ID，以及资源竞争诊断的候选 ID 和统计数据。标识符应保留原值；时间允许等价 UTC/时区表示，数值允许等价十进制表示。标题、段落、表格、字段顺序、空白和大小写不作为评分边界。不要用无意义文本或只贴 JSON 文件路径代替交付。
