/* 错题本与知识图谱 · 数据与渲染
   新增错题：往 MISTAKES 追加一个对象即可；薄弱点图谱读 WEAK。
   status 取值：danger(未过关) / warn(待巩固) / ok(已过关) */

const STATUS = {
  danger: { label: '未过关', glyph: '●', cls: 'danger' },
  warn:   { label: '待巩固', glyph: '▲', cls: 'warn' },
  ok:     { label: '已过关', glyph: '✔', cls: 'ok' },
};

const MISTAKES = [
  { date: '2026-10-21', kind: '错题', title: '等长编码每个码几位由字符种类数决定，总位数再乘字符总数', tags: ['数据结构与算法', '哈夫曼编码'], status: 'danger', mine: '把「32 个字符」当成 32 种字符，用 2 的 5 次方=32 推出等长编码 5 位；又认为哈夫曼树是四层所以每个字符都占 3 位，据此答「省 2 位」', correct: '字符种类只有 4 种，等长编码 2 位即可（2²=4）；总共要传 4+6+9+13=32 个字符，等长需 32×2=64 位；哈夫曼总位数就是 WPL=61 位，省 3 位', cause: '两个量混在一起：字符种类数决定每个码占几位（取 ⌈log₂ 种类数⌉），字符总数只用来乘总位数，不参与位数选择。另外树深不等于每个字符的码长——本例 13 只走 1 层、9 走 2 层、4 和 6 走 3 层，长短不一，所以总位数只能由 WPL 求出，不能拿一个统一码长乘 32。', next: '2026-10-22' },
  { date: '2026-10-20', kind: '错题', title: 'ASL 求和的项数必须等于元素个数', tags: ['数据结构与算法', '散列表'], status: 'warn', mine: '散列表练习：位置与各元素比较次数全对（4→4 号位 1 次、15→5 号位 2 次、26→6 号位 3 次、7→7 号位 1 次、18→8 号位 2 次），但汇总写成 2+3+1+2 ÷ 5 = 1.6，漏掉第一个元素的 1 次', correct: '(1+2+3+1+2) ÷ 5 = 9 ÷ 5 = 1.8', cause: '逐项计算正确，最后求和时漏掉一项。ASL 的分子项数必须等于元素个数（本例 5 项），少加一项结果就偏小。做法：先把 n 个比较次数排成一列、数一遍项数再相加，不要在脑中跳着加；算式写括号，2+3+1+2÷5 按运算顺序只除了最后一项。', next: '2026-10-22' },
  { date: '2026-10-20', kind: '错题', title: '平均码长要按出现频率加权，等于 WPL 除以总频率', tags: ['数据结构与算法', '哈夫曼编码'], status: 'danger', mine: '第 5 题求平均码长，用各字符码长之和除以字符个数：12 ÷ 5 = 2.4', correct: 'WPL ÷ 总频率 = 60 ÷ 27 ≈ 2.22', cause: '码长 2、3、2、2、3 对应的频率分别是 9、7、5、4、2，各字符出现次数不同，不能简单平均。平均码长 = Σ(频率×码长) ÷ Σ频率，分子就是 WPL，分母是总频率。简单平均等价于假定每个字符出现次数相同，与给定频率矛盾。10 月 20 日回炉题（权值 2、3、5、8）重做答对：WPL 33，平均码长 33 ÷ 18 ≈ 1.83，算式写法正确。10 月 21 日同一错点重犯：权值 4、6、9、13 得 WPL 61，写成 61 ÷ 4 = 15.25，又是拿字符种类数当分母，正确答案 61 ÷ 32 ≈ 1.91。新增自检：平均码长必落在「最短码长～最长码长」之间，本例应在 1～3 之间，算出 15.25 说明每字符要比最长码还长 5 倍，一眼即可判错。', next: '2026-10-22' },
  { date: '2026-10-19', kind: '错题', title: '银行家算法试分后要检查所有未完成进程', tags: ['操作系统', '银行家算法'], status: 'ok', mine: '追加申请题：把 P2 已分配的 3 看成 5，初始 Available 算成 2，试分后算成 1；因 P3 的 Need 大于 Available 判不批准', correct: '初始 Available 为 3、试分后为 2；P2 可先完成，存在安全序列，因此批准', cause: '用户说明把 P2 已分配的 3 看成了 5，导致初始 Available 算错；计算时核对题表各数，Available = 10−(2+3+2)=3。试分后还须检查所有未完成进程是否有 Need ≤ Available 者，逐次完成并归还资源；本次作答仅用 P3 的 Need 作判断。10 月 19 日重做新题答对，正确检查其他进程并找到完整安全序列。', next: '2026-10-21' },
  { date: '2026-10-18', kind: '错题', title: '管道过滤器的并行性不等于必然提升性能', tags: ['软件体系结构', '管道过滤器'], status: 'danger', mine: '外部套题 AM-004 选 C', correct: '原集参考 D：提高性能不是该风格的普遍优点', cause: '过滤器可分段并行、复用，但数据在各段间传输和转换有开销；不能从“可并行”直接推出“总性能提高”。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '中断与 DMA 可并行，DMA 搬运数据不靠 CPU 逐条传送', tags: ['计算机系统', '输入输出'], status: 'danger', mine: '外部套题 AM-005 选 C；AM-U-02 选 C', correct: '原集参考分别为 B、D：中断和 DMA 支持 CPU 与外设并行；直接搬运内存与外设数据的是 DMA', cause: '程序查询由 CPU 反复等待设备状态；无条件传送虽不查询，仍要 CPU 执行传送指令。DMA 控制器承担成块数据搬运。两题同错在混淆四种 I/O 控制方式。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '同日同样发明申请专利须协商确定申请人', tags: ['知识产权', '专利同日申请'], status: 'danger', mine: '外部套题 AM-014 选 B', correct: '参考 D：不能分别给两位申请人各授同一发明的专利权', cause: '同样发明创造只能授予一项专利权；不同申请人同日申请，应在通知后协商确定申请人，不能双方各获一项。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: 'JDBC 是 Java 应用访问数据库的接口', tags: ['数据库', '数据访问'], status: 'danger', mine: '外部套题 AM-024 选 B（XML）', correct: '原集参考 A：JDBC', cause: 'XML 是数据描述和交换格式；JDBC 提供 Java 程序与关系数据库交互的接口。题目问“访问数据库”时要找数据库访问接口。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '哈夫曼编码长度须由两两合并的树深度确定', tags: ['数据结构', '哈夫曼树'], status: 'danger', mine: '外部套题 AM-023 选 C（近似等长）', correct: '原集参考 A：较小权值字符编码更长，整棵树的带权路径长度最小', cause: '哈夫曼树每次合并当前最小两权值，最终字符码长等于叶子到根的边数；不能给高低频字符一律安排相近码长。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '语法分析检查结构，语义分析检查含义和类型', tags: ['程序设计语言', '编译过程'], status: 'danger', mine: '外部套题 AM-U-07 选 B（含义）', correct: '原集参考 C：语句结构是否合法', cause: '词法分析识别记号，语法分析依据文法检查组合结构，语义分析再检查类型和含义；把语义阶段的工作移到了语法阶段。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '后缀式和三地址码是常见中间代码', tags: ['程序设计语言', '中间代码'], status: 'danger', mine: '外部套题 AM-U-08 选 D（中间代码不能跨平台）', correct: '原集参考 B：后缀式、三地址码', cause: '中间代码位于前端和目标机器代码之间，通常尽量不依赖具体机器，便于优化与移植；不能把目标代码的机器依赖性套给中间代码。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '流水线周期由最慢的一段决定', tags: ['计算机系统', '流水线'], status: 'danger', mine: '外部套题 AM-U-09 选 D（各段耗时相加）', correct: '原集参考 C：本题周期为 9 ns', cause: '流水线进入稳定状态后，各段并行处理不同指令；周期至少等于最长阶段耗时。各段求和算的是单条指令串行经过全线的时间。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '被动攻击侧重窃听，拒绝服务会改变服务状态', tags: ['信息安全', '被动攻击'], status: 'danger', mine: '外部套题 AM-U-11 选 A（拒绝服务）', correct: '原集参考 B：会话截获', cause: '被动攻击只获取或分析信息，不主动破坏可用性或改写数据；拒绝服务会干扰正常服务，属于主动攻击。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '并联可靠度先各自计算，串联再相乘', tags: ['计算机系统', '可靠性'], status: 'danger', mine: '外部套题 AM-U-13 选 C（两段相加）', correct: '原集参考 B：两段并联可靠度相乘', cause: '一段并联为 1-(1-R)^n；两段串联要求两段同时成功，独立时总可靠度为两段可靠度的乘积。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '保证同类资源不死锁的下限要在最坏占用上加一', tags: ['操作系统', '死锁'], status: 'ok', mine: '外部套题 AM-U-14 选 D（15 个）；10 月 19 日新题答 4×(5−1)+1=17', correct: '原集参考 B：3 个进程每个最多需 5 个时为 3×(5-1)+1=13；复测题答案 17', cause: '最坏情况下每个进程都拿到所需数减一，额外再给一个就能让一个进程完成并归还资源；不必把所有进程的最大需求相加。10 月 19 日独立答对新题，正确写出 4×(5−1)+1=17。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '风险管理属于项目管理，不是配置管理内容', tags: ['软件工程', '配置管理'], status: 'danger', mine: '外部套题 AM-U-16 选 A（版本控制）', correct: '原集参考 B：风险管理', cause: '配置管理跟踪配置项及其版本、变更、状态与审计；风险管理识别和应对项目不确定性，属于另一管理活动。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '疑问', title: '域名解析先查缓存还是 hosts 需核对题目口径', tags: ['计算机网络', '域名解析'], status: 'warn', mine: '外部套题 AM-U-18 选 A（本地 DNS 缓存）', correct: '原集暂列 B（hosts 文件），但原集亦注明与实际浏览器和系统缓存顺序存在差异', cause: '题目未明确“浏览器缓存、系统缓存、hosts、DNS 服务器”所处层次，不能仅凭一个固定顺序断定作答错误；保留为待核辨析题。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '疑问', title: '相似功能模块合并须先看职责是否重复', tags: ['软件工程', '模块设计'], status: 'warn', mine: '外部套题 AM-U-19 选 B（模块规模适中）', correct: '原集参考 C，但题干只写“相似功能”，没有交代职责是否相同', cause: '不同职责强行合并可能降低内聚；真正重复的实现抽取公共模块也可能改善设计。题干不足以稳定判错，留作辨析。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '入侵检测与漏洞扫描的任务不同', tags: ['信息安全', '入侵检测'], status: 'danger', mine: '外部套题 AM-U-20 选 C（简单匹配）', correct: '原集参考 D：漏洞扫描', cause: '入侵检测分析已发生或正在发生的活动，简单模式匹配是其常用方法；漏洞扫描主动寻找系统弱点，属于安全评估。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '疑问', title: '培训关系范式题先核对函数依赖记号', tags: ['数据库', '关系规范化'], status: 'warn', mine: '外部套题 AM-052 选 C（3NF）', correct: '原集暂列 B（2NF）；但前题把“培训科目→→培训师”写成多值依赖，不能直接当普通函数依赖推键与范式', cause: '2NF、3NF 的判断必须以真实函数依赖集和候选键为前提；原始 OCR 的双箭头若准确，原集闭包推导存在缺口，暂缓判为稳定错题。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '候选键必须覆盖所有不能由右部推出的属性', tags: ['数据库', '候选键'], status: 'danger', mine: '外部套题 AM-061 选 B（DE）', correct: '原集参考 D：CE 能推出全属性集', cause: 'C 未出现在任何依赖的右部，候选键必须含 C；DE 的闭包得不到 C。CE 可经 E→A、A→B、B→D 推得全属性。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '错题', title: '观察者模式中 Subject 管理观察者集合', tags: ['面向对象', '观察者模式'], status: 'danger', mine: '外部套题 AM-067 选 D', correct: '原集参考 A：Subject 提供注册、删除和通知观察者的接口', cause: 'Subject 持有观察者集合并在状态变化时通知；Observer 只定义被通知时的更新接口，不能承担注册管理职责。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '盲区', title: 'LIS 题的子序列与函数参数需要先补前置', tags: ['算法', '动态规划', 'C 语言'], status: 'warn', mine: '读题时追问子序列为何不能重排，以及数组参数、元素个数和返回值分别是什么；尚未独立做填空', correct: '先用小序列理解保持原顺序的选择，再分清函数输入输出，之后才读状态定义和转移', cause: '练习安排直接给出代码填空，缺少题目目标与必要概念的确认；本题已暂停，不能记为做错，也不能记为掌握。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '疑问', title: 'DFD 加工编号取决于给定分层图与建模边界', tags: ['数据流图', '加工编号'], status: 'warn', mine: '按业务文字第 4 段写加工4，并问为何必须沿用加工3', correct: '原卷分层图预设加工3“结算归档”，本卷沿用加工3；如果题目只给业务描述，可以按独立处理目标自行划分加工并保持全图一致', cause: '练习时没有完整展示原卷分层图，先前把加工4直接判错不公平；段落数也不能单独决定加工数。', next: '2026-10-20' },
  { date: '2026-10-18', kind: '疑问', title: 'DFD 数据流名称宜写传递的信息', tags: ['数据流图', '数据流名称'], status: 'warn', mine: '写“修改订单状态”“发送支付请求”', correct: '本卷通常标“更新后的订单状态”“支付请求”等数据名；若语义清楚，应先按流向与内容判断，不因动词一律判错', cause: '先前批改把名称表达问题说成方向错误，扣分过严；建议用名词性信息名以便图上阅读。', next: '2026-10-20' },
  { date: '2026-10-17', kind: '疑问', title: 'DFD 加工写系统内的具体处理名称', tags: ['数据流图', '加工'], status: 'ok', mine: '接收订单场景把加工写为系统；读取订单文件后将数据流终点写为系统', correct: '本题加工分别写接收订单和分派订单', cause: '系统是整体；在分解后的数据流图中，箭头要连接题目中负责该处理的具体加工。10 月 17 日独立写对跟踪配送的两条数据流。', next: '2026-10-18' },
  { date: '2026-10-17', kind: '错题', title: '设备被迫实现无关方法优先判断接口隔离原则', tags: ['面向对象设计原则', 'ISP', 'SRP'], status: 'danger', mine: '打印设备被迫实现扫描、传真方法，答单一职责原则', correct: '接口隔离原则 ISP：客户端不应被迫依赖不需要的接口方法', cause: '题目直接强调设备被迫实现用不到的接口方法，应按用途拆成专用接口；单一职责强调类或模块应只有一个引起变化的原因。', next: '2026-10-18' },
  { date: '2026-10-17', kind: '错题', title: '状态图的监护条件并非每条转换都必需', tags: ['UML', '状态图'], status: 'danger', mine: '选择每条转换都必须同时给出事件与监护条件', correct: '监护条件可以省略；常规单区域状态图可以有多个终态，也可以没有终态', cause: '转换的事件和监护条件不是一律同时必填；考试题中状态图的初态、终态应按题目模型和规则判断。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '错题', title: '部署图与构件图的图形特征', tags: ['UML', '图的识别'], status: 'danger', mine: '立体节点和 Database 构造型选类图；构件的整圆与半圆接口选用例图', correct: '前者是部署图的节点；后者是构件图的供接口和需接口', cause: '部署图展示运行节点及部署关系；构件图展示构件和供需接口，不能把接口符号认作用例图。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '疑问', title: '方法中临时使用对象是依赖关系', tags: ['UML', '类图'], status: 'ok', mine: '汽车的方法里临时创建引擎对象时，犹豫是子类、继承还是实现', correct: '依赖：汽车临时使用引擎', cause: '继承表达是一种，实现表达类满足接口；方法中临时创建或使用另一个对象通常表示依赖。10 月 17 日重做打印机场景答对。', next: '2026-10-18' },
  { date: '2026-10-17', kind: '错题', title: '业务步骤与条件分支用活动图描述', tags: ['UML', '图的识别'], status: 'danger', mine: '借书步骤和条件分支选择 D（构件图）', correct: '选择 A（活动图）', cause: '活动图描述动作流程和分支；构件图描述软件构件及其接口和依赖。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '错题', title: '参与者与系统功能用用例图描述', tags: ['UML', '图的识别'], status: 'ok', mine: '读者可以借书、还书和查询图书，选择通信图', correct: '选择用例图，描述参与者和系统提供的功能', cause: '通信图描述对象之间的连接及消息交互；用例图描述参与者与系统功能的关系。10 月 17 日重做答对。', next: '2026-10-18' },
  { date: '2026-10-17', kind: '错题', title: '实体类、边界类和控制类按职责分类', tags: ['UML', '类分类'], status: 'danger', mine: 'Reader、Book 归实体；Catalog、LoanRecord 归边界；BorrowController、BorrowUI 归控制，边界类是蒙的', correct: 'Reader、Book、Catalog、LoanRecord 为实体类；BorrowUI 为边界类；BorrowController 为控制类', cause: '实体类承载业务信息，不限于物理对象；边界类负责与外界交互；控制类协调业务流程，界面本身不是控制类。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '错题', title: '规则可切换时辨认策略模式与装饰器', tags: ['设计模式', '策略模式'], status: 'danger', mine: '规则扩充和启用题选装饰器模式，表示是蒙的', correct: '题目参考答案是策略模式：封装可选择的规则策略', cause: '策略强调封装并选择可替换的行为；装饰器强调包装对象以增加职责。若需要多个规则叠加或处理链，具体设计还需进一步确认。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '盲区', title: '顺序图突出消息时间顺序，通信图突出对象连接', tags: ['UML', '交互图'], status: 'danger', mine: '不理解按对象交互要求选择 UML 图，也不知道通信图', correct: '按时间顺序描述对象交互选顺序图；通信图用对象连接和消息编号呈现交互', cause: '顺序图按生命线从上到下展示消息先后；通信图突出对象间连接，使用编号表达调用先后和层次。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '错题', title: '学员与课程的多对多联系不代表聚合', tags: ['UML', '类图'], status: 'danger', mine: '学员和课程写成聚合，空心菱形在左右都可以；多重度写 0..*:0..*', correct: '学员与课程是多对多关联；题面没有整体部分关系，不需菱形，可用选课记录保存联系信息。', cause: '多重度描述数量，菱形表示整体部分，两者是独立判断；聚合菱形画在整体端，不能随意选一端。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '疑问', title: '类图泛化保留父类并由子类指向父类', tags: ['UML', '泛化'], status: 'warn', mine: '认为学生读者和教师读者替代读者的位置，并分别拥有相同的关系', correct: '保留读者作为父类，学生读者和教师读者作为子类；泛化实线的空心三角指向读者', cause: '子类继承父类的共性；共同关联可以保留在父类，不必用两个子类取代父类并重复绘制关联。兄弟子类不必直接连接。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '错题', title: '用例扩展关系关键字是 extend', tags: ['UML', '用例图'], status: 'ok', mine: '借书与拒绝提示写成 exclude，箭头从拒绝提示指向借书', correct: '拒绝提示使用 <<extend>> 指向借书', cause: '条件触发的扩展行为使用 extend；exclude 不是 UML 规定的该关系关键字。10 月 17 日发布文章场景重做答对关系和箭头方向。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '错题', title: '关联、多重度和组合须分别依据题干判断', tags: ['UML', '类图'], status: 'danger', mine: '图书与借阅记录写成组合且为 1:1；读者与图书及记录均写成聚合', correct: '题目描述可先建普通关联；一本图书可有多条借阅记录，多重度允许多个', cause: '多重度要逐端询问一个对象对应多少个另一端对象；仅有业务联系或可以独立存在，不能据此断定聚合或组合，组合还需有明确的整体部分及生命周期约束。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '疑问', title: '重载与重写：同名不同参数与子类重新实现', tags: ['面向对象', '重载与重写'], status: 'warn', mine: '选择题第 7 题选 C，并表示不知道', correct: 'A：重载的方法名相同，参数列表不同', cause: '将重载和子类重写混淆：重载依靠参数列表区分同名方法；重写是子类重新实现继承来的方法，参数列表相同。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '错题', title: '父类引用调用重写方法时执行子类版本', tags: ['面向对象', '多态'], status: 'danger', mine: '选择题第 8 题选 D，认为两个版本同时执行', correct: 'B：执行实际对象的子类版本', cause: '实例方法被重写时，动态分派依据实际对象选择实现；子类方法只有主动调用 super 时才会进一步执行父类方法。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '错题', title: '启动时一起执行的无关操作属于时间内聚', tags: ['软件工程', '内聚'], status: 'ok', mine: '前一组第 8 题选 D（过程内聚）', correct: 'C：时间内聚', cause: '因同一时间段执行而组合是时间内聚；过程内聚强调按某个流程或先后顺序执行。10 月 17 日复习后答对时间内聚和逻辑内聚辨认题。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '错题', title: '传递整条学生记录属于标记耦合', tags: ['软件工程', '耦合'], status: 'ok', mine: '前一组第 9 题选 A（数据耦合）', correct: 'B：标记耦合', cause: '参数传递整条记录或数据结构属于标记耦合，传递简单数据属于数据耦合。10 月 17 日重做同题答对。', next: '2026-10-19' },
  { date: '2026-10-17', kind: '疑问', title: '螺旋模型以每轮风险分析为题眼', tags: ['软件工程', '开发模型'], status: 'ok', mine: '前一组第 7 题选 B，说明是蒙的', correct: '螺旋模型每轮迭代进行风险分析', cause: '螺旋模型的辨识重点是每轮风险分析；V 模型强调开发阶段与测试阶段对应。10 月 17 日复习后答对相关题。', next: '2026-10-19' },
  {
    date: '2026-10-09',
    kind: '错题',
    title: '自然连接的行数不能由两表行数相乘得出',
    tags: ['关系代数', '连接行数'],
    status: 'danger',
    mine: '10-09：B，按两表行数相乘；10-15 第 1 题：B（自然连接行数直接按 3×5 算）；第 7 题：9 行（按 3×3 算）',
    correct: '自然连接的列数为两表列数减去重复的同名列；行数由公共属性值实际配成的组合数决定',
    cause: '把笛卡尔积 × 的行数规则「两表行数相乘」套到了自然连接 ⋈ 上。⋈ 是先按同名属性配对、再只保留同名列相等的组合，行数由每个公共值在两表中出现次数的乘积相加决定；只有所有行都能互相配对时，才可能达到两表行数相乘这个上限。10-15 第 7 题中 x 在两表各出现 2 次，故只有 2×2=4 行，y、z 均配不上。',
    next: '2026-10-17',
  },
  {
    date: '2026-10-09',
    kind: '错题',
    title: '用笛卡尔积代替连接（改错题看不出错）',
    tags: ['关系代数', '辨析'],
    status: 'danger',
    mine: 'π姓名(σ课程号=C1(学生 × 选课))，觉得没错',
    correct: 'π姓名(σ课程号=C1(学生 ⋈ 选课)) → 只有小林、小周',
    cause: '笛卡尔积把每个学生和任意选课行都配一遍，「课程号是 C1」和「这个学生是谁」变成两件不相干的事，没选 C1 的小陈、小吴也被列了进来。',
    next: '2026-10-11',
  },
  {
    date: '2026-10-09',
    kind: '盲区',
    title: '学号 05 是在哪一步被去掉的',
    tags: ['关系代数', '连接顺序'],
    status: 'warn',
    mine: '以为 ⋈ 行数 = 两表乘积，于是找不到 05 消失的那一步',
    correct: '在「筛掉同名列不相等」这一步被淘汰',
    cause: '× 才是乘积；⋈ 的一步动作是「先配对、再筛同名列相等」。05 在学生表里没有对应行，配不上，因此没机会走到后面的成绩筛选。',
    next: '2026-10-12',
  },
  {
    date: '2026-10-09',
    kind: '疑问',
    title: '两表有多个同名属性时，等值连接怎么算',
    tags: ['连接列数', '辨析'],
    status: 'warn',
    mine: '不确定同等值连接下多个同名列如何处理',
    correct: '等值连接只按写出的等式筛；自然连接要求所有同名属性都相等',
    cause: 'R(A,B,C) ⋈(R.B=S.B) S(B,C,D)：列数 6，B、C 各留一份、互不比较；自然连接 R ⋈ S：B、C 都要相等，列数 4。考点是「总列数 − 同名属性个数」。',
    next: '2026-10-12',
  },
  {
    date: '2026-10-12',
    kind: '错题',
    title: '职务开发著作权想当然归开发者个人',
    tags: ['知识产权', '职务开发'],
    status: 'warn',
    mine: '课后 5 选 A（归小周）；课后 16(1) 答“著作权归小吴”',
    correct: '课后 5 选 B（归甲公司）；16(1) 归甲公司，小吴只保留署名权',
    cause: '把“谁写的代码归谁”套在职务开发上。任职期间、针对单位明确指定的开发目标、主要使用单位物质技术条件、由单位承担责任——软件著作归单位，作者只剩署名权。2026-10-12 重做 G1～G4、G8(1) 全对，两要件与条例三问已能分开。',
    next: '2026-10-16',
  },
  {
    date: '2026-10-12',
    kind: '错题',
    title: '法人软件著作权保护期的锚点选错',
    tags: ['知识产权', '保护期'],
    status: 'danger',
    mine: '课后 4 选 A：自开发完成之日起第 50 年的 12 月 31 日',
    correct: 'B：法人软件 50 年，截止于首次发表后第 50 年的 12 月 31 日',
    cause: '条例对法人软件统一以“首次发表”为锚（自开发完成 50 年内未发表的不再保护）。“创作完成 50 年”是一般法人作品发表权的锚，两套规则记串了。10-12 重做 G5 时，法人一般作品财产权又错选“永久”，本簇升级为头号过关目标。',
    next: '2026-10-14',
  },
  {
    date: '2026-10-12',
    kind: '错题',
    title: '合法复制品所有人的备份义务漏了后半句',
    tags: ['知识产权', '合法复制品权利'],
    status: 'warn',
    mine: '课后 15 选 C：丧失所有权后仍保留备份，以为不侵权',
    correct: 'D：防损坏做一份备份、供自己使用，才不构成侵权；C 恰恰是侵权情形',
    cause: '备份条款是两半：“只能自留”+“丧失原件所有权必须销毁备份”，只记住了前一半。且与 16(2) 自相矛盾：16 里判小吴带走源代码侵权，15 却放过了“丢原件留备份”。10-12 重做 G6（反向问法“构成侵权的是”）已选对。',
    next: '2026-10-14',
  },
  {
    date: '2026-10-12',
    kind: '盲区',
    title: '场景题结论对但理由错：“离职两年内不能授权”',
    tags: ['知识产权', '表述理由'],
    status: 'ok',
    mine: '16(2) 判小吴、乙公司侵权（对），理由写成“离职两年内不能授权”',
    correct: '真正的理由：著作权归甲公司，小吴无权处分；以个人名义登记他人软件 + 擅自授权他人使用均侵权，与离职后几年无关',
    cause: '把著作权法里一般职务作品“单位优先使用权 2 年”或专利法职务发明概念搬来凑理由，软件条例并无“离职两年”限制。场景判定题要结论、理由各占一半分，理由编造等于没答对。',
    next: '2026-10-15',
  },
  {
    date: '2026-10-12',
    kind: '疑问',
    title: '发表权保护期在 A（永久）和 B（终生+死后 50 年）之间犹豫',
    tags: ['知识产权', '保护期'],
    status: 'ok',
    mine: '精华 5 答“A 或 B”，没敢定',
    correct: 'B：发表权 = 作者终生及其死亡后 50 年，不是永久',
    cause: '永久保护只有三样：署名权、修改权、保护作品完整权（口诀“署改完永久”）。发表权虽然同属人身权，但带期限。10-12 重做 G7（反向问“受期限限制的是”）已选对，转已过关。',
    next: '2026-10-15',
  },
  {
    date: '2026-10-12',
    kind: '错题',
    title: '法人一般作品财产权保护期错选“永久”（课后 4 的复发变体）',
    tags: ['知识产权', '保护期'],
    status: 'danger',
    mine: 'G5 选 C：法人作品的财产权永久保护',
    correct: 'B：保护期 50 年，截止于首次发表后第 50 年的 12 月 31 日',
    cause: '“永久”只是署改完三个人身权的待遇，财产权是钱权、一律有期限。法人作品双锚点：发表权锚创作完成后 50 年，财产权锚首次发表后 50 年；软件法人同按首次发表 50 年。与课后 4 同一簇，说明法人锚点表还没建起来。',
    next: '2026-10-14',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '把“读脏数据”认成“丢失的数据”',
    tags: ['并发错误', '脏读', '03 数据思维'],
    status: 'ok',
    mine: '第 3 题选 A（丢失的数据）；10-14 回炉重做选 C',
    correct: 'C（脏数据）：读到的是未提交、随后被回滚的值',
    cause: '只抓住了“读到的值后来没了”，就归到“丢失”。丢失修改的关键字是“写被写覆盖”（两个写回互相盖掉，谁都提交了）；读脏数据的特征字是“读到一个从未生效的值”。判别锚点是最后一步动作：改值者 ROLLBACK → 脏读；改值者 COMMIT → 不可重复读。10-14 回炉重做一次答对，锚点已用对。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '把“幻读”认成“不可重复读”',
    tags: ['并发错误', '幻读'],
    status: 'ok',
    mine: '第 7 题选 C（不可重复读）；10-14 回炉重做选 D',
    correct: 'D（幻读）：同一范围条件两次查，行数 3 行变 4 行',
    cause: '不可重复读与幻读都叫“两次结果不同”，区别在对象：不可重复读是“同一行字段值被改了”，幻读是“满足条件的行数增减了”。题干给的是插入新行导致结果集多一行，属于行数变化。口诀：同一行变是前，结果集增减行是后。10-14 回炉重做一次答对。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-13',
    kind: '疑问',
    title: 'REDO / UNDO 在 A、B 之间摇摆',
    tags: ['故障恢复', 'REDO/UNDO'],
    status: 'ok',
    mine: '第 5 题答“不确定是 B 还是 A”；10-14 回炉重做选 B',
    correct: 'B（UNDO）：未提交事务做了一半，必须撤销抹掉',
    cause: '口诀只有一句：已提交就 REDO、未提交就 UNDO。恢复扫描日志时只看两件事——BEGIN 后面有没有 COMMIT。有 COMMIT 说明结果该留存，重放（REDO）；只有 BEGIN 说明是半成品，撤销（UNDO）。A（REDO）是给已完成事务用的，方向正好相反。10-14 回炉重做一次答对。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: 'GROUP BY 用课程号分组去查学生——分组列选错',
    tags: ['SQL', 'GROUP BY', '聚合'],
    status: 'danger',
    mine: '第 12(2) 写：SELECT Sno FROM SC GROUP BY Cno HAVING Cno>3；10-14 回炉第 1 次写 HAVING COUNT(Cno>3)，第 2 次 GROUP Sno（漏 BY）',
    correct: 'SELECT Sno FROM SC GROUP BY Sno HAVING COUNT(Cno)>3',
    cause: '两处错叠加：① 题干要“每个学生选了几门”，粒度是学生，分组列必须写 Sno，写 Cno 变成“每门课”；② HAVING 里应该是数行数的聚合 COUNT(Cno)，却写成裸列 Cno 和一个数字比较——分组后裸列代表不了整组。记住：题干说“每个 X 的门数/平均分/人数”，GROUP BY 就写 X，组条件用聚合函数包住要统计的列。10-14 回炉：分组列已改对（Sno），但把比较运算符写进了聚合括号（COUNT(Cno>3)），第二次又漏掉 GROUP BY 的 BY——粒度会认了，写法仍不稳。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '三表聚合查询漏了连接、子查询出了多列',
    tags: ['SQL', '多表连接', '聚合', '子查询'],
    status: 'warn',
    mine: '第 13(2) 写：SELECT 团名,成绩 FROM 代表团 WHERE 团编号 IN (SELECT 团编号,SUM(成绩) FROM 运动员 WHERE (SELECT 运动员编号,成绩 FROM 参赛) GROUP BY 团编号 HAVING SUM(成绩)>300)；10-14 回炉：JOIN 路径写对，但 GROUP BY 里出现表名、HAVING 写成 SUM(成绩>=300)',
    correct: 'SELECT 代表团.团名, SUM(参赛.成绩) AS 总分 FROM 代表团 JOIN 运动员 ON 代表团.团编号=运动员.团编号 JOIN 参赛 ON 运动员.运动员编号=参赛.运动员编号 GROUP BY 代表团.团编号,代表团.团名 HAVING SUM(参赛.成绩)>=300',
    cause: '四个硬伤叠在一起：① 成绩在“参赛”表里，却当成代表团的列直接 SELECT；② 三张表沿“代表团→运动员→参赛”的路径必须逐段 JOIN，这里完全没连；③ IN 后的子查询只能出一列，这里 SELECT 出了两列；④ “300 分（含）以上”是闭区间，写成 > 300 丢掉了等于。聚合查询先画表间路径，再想分组粒度。10-14 回炉：三表 JOIN 路径已能一次写对（本条最大短板已补），闭区间也写对了；剩下两处是「代表团」表名当列名塞进 GROUP BY、以及 SUM(参赛.成绩>=300) 又把比较符写进聚合括号。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '建表外键子句、视图定义两处语法写坏',
    tags: ['SQL', 'CREATE TABLE', 'CREATE VIEW'],
    status: 'danger',
    mine: '13(1) 写 FOREIGN KEY (运动员 REFRENCE 运动员(运动员编号))；13(3) 写 CREATE VIEW vHighScore AS ( FROM 比赛项目 WHEHE exit(...) 双层嵌套 )；10-14 回炉 13(1) 三次提交、REFERENCES 仍拼错，13(3) 的 AS 后又加括号',
    correct: 'FOREIGN KEY (运动员编号) REFERENCES 运动员(运动员编号)；CREATE VIEW vHighScore AS SELECT 运动员.运动员编号,运动员.姓名,比赛项目.项目名称 FROM 运动员 JOIN 参赛 ON ... JOIN 比赛项目 ON ... WHERE 参赛.成绩>=95',
    cause: '① 外键固定三段式：FOREIGN KEY (本表列) REFERENCES 表名(被引列)，列名要写完整（运动员编号），REFERENCES 拼写别丢 S；② CREATE VIEW 是“视图名 AS 查询语句”，AS 后直接接 SELECT，不加括号；③ 视图跨三张表要沿“运动员→参赛→比赛项目”逐段 JOIN，嵌套 EXISTS 不能替代连接。10-14 回炉：JOIN 路径已写对，但 REFERENCES 连错三次（记为 re-fer-ences，REF 后面那个 e 来自 refer）、AS 后又加括号（第二次），另把题干表名「参赛」写成「参赛表」——这一类纯属格式与誊写复核，非理解问题，故升级为未过关。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-13',
    kind: '盲区',
    title: '关联子查询里，省掉关联条件为什么返回全体',
    tags: ['SQL', 'EXISTS', '关联子查询'],
    status: 'ok',
    mine: '第 9 题：知道“只要有人选了 C02 就会返回所有学生”，但说不出原因；10-14 回炉第 1 次给出结论，第 2 次补上机理',
    correct: '省掉 SC.Sno=S.Sno 后，子查询不再与本行学生挂钩，退化成与当前学生无关的常真判断',
    cause: 'EXISTS 是“逐行检查”：对外层每个学生 S，子查询才用 SC.Sno=S.Sno 把内层和当前这行绑在一起问“你选了吗”。一旦这截断掉，子查询问的对象就不再跟着外层的行走，变成固定的“这门课有没有人选”——有人选则所有学生都为真。关联子查询的关联条件就是那个“随外层行移动的指针”，省不得。10-14 回炉已能用自己的话讲出机理，只剩“常量恒为真 → 外层每行都保留”这一句收口。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-13',
    kind: '错题',
    title: '“含／以上”的闭区间写成半开区间：300、95 都漏了等于',
    tags: ['SQL', '边界条件', '字符串常量'],
    status: 'ok',
    mine: '13(2) HAVING SUM(成绩)>300；13(3) 成绩>95；9 题字符串写成双引号 "C02"；10-14 回炉：>= 与 \'C02\' 均写对',
    correct: '总分 ≥300 写 >=300；成绩“95（含）以上”写 >=95；字符串常量用单引号 \'C02\'',
    cause: '题眼“含／以上／之内”是闭区间，比较符必须带等号，99 分和 100 分这种擦边值最容易在这里丢分。另外 SQL 里字符串常量标准写法是单引号，双引号在标准 SQL 里表示标识符名，考试按单引号写才稳妥。10-14 回炉两处均已写对，转已过关。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-14',
    kind: '错题',
    title: '商标续展的“窗口期”和“新有效期”记混：续展年限写成 20 年',
    tags: ['知识产权', '商标权', '续展'],
    status: 'danger',
    mine: '练习第 10 题选 B：宽展期“期满后 6 个月”对上了，但把每次续展注册的有效期写成 20 年',
    correct: 'A：宽展期为期满后 6 个月；每次续展注册的有效期为 10 年',
    cause: '商标续展有两个独立的数字，都是 10 年、都不是 20 年：①“什么时候去续”——期满前 12 个月内办，来不及还有期满后 6 个月宽展期；②“续完管多久”——每次续展注册有效期又是 10 年，次数不限。20 年是发明专利的分量，商标里没有 20 这个数。口诀“商标 10 年核准起，前 12 后 6 可续展，续满 10 年无限次”：前 12 后 6 管窗口，续满 10 年管新期限。',
    next: '2026-10-16',
  },
  {
    date: '2026-10-14',
    kind: '疑问',
    title: '商标先申请原则与“同日才协商”的适用边界没分清',
    tags: ['知识产权', '商标权', '先申请原则'],
    status: 'warn',
    mine: '练习第 8 题选 B（授予甲公司）对了，但理由是反推的：“如果申请日期相同才是协商”，对“一先一后时按先申请原则”本身没把握',
    correct: 'B：商标注册申请实行先申请原则，相同或近似的商标由先申请者优先；协商只补“同日申请”这一种例外',
    cause: '把“同日申请 → 协商”当成了主规则，于是反过来推“不同日才轮得到先申请”，两层关系颠倒了。正确结构是：默认规则为“申请在先者优先”——题面只说先后、没提同日，就直接套先申请；协商仅用于双方同一天申请的情形。专利与商标共用同一套先申请原则，同日协商在两者中也都适用。',
    next: '2026-10-16',
  },
  {
    date: '2026-10-14',
    kind: '错题',
    title: '聚合函数的比较运算符写进了括号里（回炉两题同型）',
    tags: ['SQL', '聚合', 'HAVING'],
    status: 'danger',
    mine: '回炉 12(2) 写 HAVING COUNT(Cno>3)；回炉 13(2) 写 HAVING SUM(参赛.成绩>=300)',
    correct: 'HAVING COUNT(Cno)>3；HAVING SUM(参赛.成绩)>=300',
    cause: '把条件塞进聚合函数的括号，含义就变了：COUNT(Cno>3) 数的是“真假值非空的个数”（≈选过课的行数），SUM(成绩>=300) 数的是“成绩≥300 的行数”，两者都把原来的门槛条件整个丢掉。正确结构固定为 HAVING 聚合函数(列) 运算符 数值——括号里只放“要统计哪一列”，比较运算符永远写在括号外面。回炉两道题同型出现，属高频习惯性错误。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-14',
    kind: '错题',
    title: 'REFERENCES 拼写反复错，且改错只改一处（同类项没扫全）',
    tags: ['SQL', 'CREATE TABLE', '拼写', '自查'],
    status: 'danger',
    mine: '回炉 13(1) 三次提交：REFRENCES → 两行都错 → 只改对一行，另一行继续写 REFRENCES',
    correct: 'REFERENCES（re-fer-ences，10 个字母、4 个 e）：refer + ence = reference，复数 references',
    cause: 'REFERENCES 由动词 refer 派生，REF 后面那个 e 属于 refer 本身，不能省；写错的 REFRENCES 少一个 e。真正暴露的是流程问题：同一句里同一个词出现两次，一轮改正只动了其中一处，错字在两条外键之间“转移”。交卷前的自查要扫“同类项是否全部改到”，而不是改完一处就收工。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-14',
    kind: '错题',
    title: 'CREATE VIEW 的 AS 后又加括号（第二次），且视图里无聚合却写 GROUP BY',
    tags: ['SQL', 'CREATE VIEW', 'GROUP BY'],
    status: 'danger',
    mine: '回炉 13(3) 写 CREATE VIEW vHighScore AS ( SELECT ... GROUP BY 运动员.运动员编号,运动员.姓名 )',
    correct: 'CREATE VIEW vHighScore AS SELECT 运动员.运动员编号,运动员.姓名,比赛项目.项目名称 FROM 参赛 JOIN 运动员 ON ... JOIN 比赛项目 ON ... WHERE 参赛.成绩>=95;',
    cause: '① CREATE VIEW 的固定骨架是“视图名 AS 查询语句”，AS 后面直接接 SELECT，把整句套进括号是 0 分硬伤（上一轮已点过、本轮又犯）；② 题干只要三列，多出的成绩列属擅自加列；③ 整句没有任何聚合函数，GROUP BY 毫无意义，且 SELECT 里的项目名称既不在分组依据里也没被聚合，严格 SQL 直接报错——没有聚合就不写 GROUP BY；④ GROUP BY 漏 BY、GROUP BY 里塞进表名（代表团）同属固定短语写不准。',
    next: '2026-10-18',
  },
  {
    date: '2026-10-16',
    kind: '错题',
    title: '把命令、备忘录、外观的场景误判为工厂、代理、构建器',
    tags: ['面向对象', '设计模式', '命令', '备忘录', '外观'],
    status: 'warn',
    mine: '命令题选“工厂模式”；保存状态题一度猜“代理模式”；统一下单入口题一度猜“构建器模式”。讲解后完成一组 8 题专项，答对命令、备忘录、外观三类题。',
    correct: '请求封装、撤销/排队/日志 → 命令；保存某时刻状态、以后恢复 → 备忘录；库存/支付/物流等多个子系统统一入口 → 外观。',
    cause: '三类题分别看“操作、状态、子系统”：命令保存的是要执行的操作，备忘录保存的是状态快照，外观不替换算法也不分步造对象，只负责把多个已有子系统收敛为一个入口。已能在专项题中识别，仍需在 10-20 错题回炉时再验一次。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-16',
    kind: '疑问',
    title: '外观、策略与代理、中介者两组易混概念',
    tags: ['面向对象', '设计模式', '辨析'],
    status: 'warn',
    mine: '自述外观与策略分不清；聊天室场景虽答中介者，但担心会误选代理。随后完成针对性 8 题，外观、策略、中介者均答对。',
    correct: '多个系统一个入口 → 外观；多种算法选一个 → 策略；一个替身控制一个真实对象的访问 → 代理；多个对象经中心协调通信 → 中介者。',
    cause: '先数对象关系再选：外观是“多系统收敛”，策略是“多算法替换”；代理是“一对一替身”，中介者是“多对多协调”。当前已能正确辨析，保持待巩固到下一次回炉。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-15',
    kind: '疑问',
    title: '商业秘密“未公开”不是不受法律保护',
    tags: ['知识产权', '商业秘密', '保护条件'],
    status: 'warn',
    mine: '第 4 题选 B，但怀疑 D：未公开是否意味着不受法律保护',
    correct: 'B：保密措施有效即持续受保护；独立研发不侵权',
    cause: '把专利“公开换独占”的取得路径套到了商业秘密上。商业秘密的“不为公众所知悉”恰是构成条件之一，不是失去保护的原因；它通过保密措施和《反不正当竞争法》等获得保护。只有被公开到不再是秘密、或未采取相应保密措施时，才可能不再满足商业秘密的条件。',
    next: '2026-10-17',
  },
  {
    date: '2026-10-15',
    kind: '错题',
    title: '建表外键与主键子句漏括号，表名也没改回题干（E-R 案例题第二次）',
    tags: ['SQL', 'CREATE TABLE', 'REFERENCES', '固定格式'],
    status: 'danger',
    mine: 'E-R 案例题 3(1) 重写：CREATE TABLE 参赛表 ( ... PRIMARY KEY 运动员编号,项目编号, FOREIGN KEY 运动员编号 REFERENCES 运动员(运动员编号), FOREIGN KEY 项目编号 REFERENCES 比赛项目(项目编号) )',
    correct: 'CREATE TABLE 参赛 ( ..., PRIMARY KEY (运动员编号, 项目编号), FOREIGN KEY (运动员编号) REFERENCES 运动员(运动员编号), FOREIGN KEY (项目编号) REFERENCES 比赛项目(项目编号) );',
    cause: '① 本轮 REFERENCES 两处拼写已改对、被引列名也对齐「运动员编号」，10-14 的同类项毛病这轮没犯，进步实在；② 但 PRIMARY KEY 与两条 FOREIGN KEY 的关键字后都漏了括号——固定骨架是「关键字 (本表列名)」，列名必须包在括号里；③ 表名仍沿用自造的「参赛表」，题干给的表从头到尾叫「参赛」，三个小问须同名。括号与表名同属固定格式，仍判未过关。',
    next: '2026-10-17',
  },
  {
    date: '2026-10-15',
    kind: '错题',
    title: '三表聚合仍凭空造列（运动员.所属团编号），且连接条件多写孤立等号',
    tags: ['SQL', '多表连接', '聚合'],
    status: 'danger',
    mine: 'E-R 案例题 3(2) 重写：SELECT ...,SUM(参赛.成绩), FROM 代表团 JOIN 运动员 ON  = 运动员.所属团编号 = 代表团.团编号 JOIN 参赛 ON  = 参赛.运动员编号 = 运动员.运动员编号 GROUP BY 代表团.团编号 HAVING SUM(参赛.成绩) >= 300',
    correct: 'SELECT 代表团.团编号,代表团.团名,SUM(参赛.成绩) AS 总分 FROM 代表团 JOIN 运动员 ON 代表团.团编号 = 运动员.团编号 JOIN 参赛 ON 运动员.运动员编号 = 参赛.运动员编号 GROUP BY 代表团.团编号,代表团.团名 HAVING SUM(参赛.成绩) >= 300;',
    cause: '① SUM 拼写、聚合括号、>= 闭区间、三表路径都改对了，进步明显；② 但「运动员」表里的列是「团编号」，仍写成不存在的「运动员.所属团编号」，第二次凭空造列——连接条件的列必须两张表都真实存在，写前先回题干表定义表逐字核对；③ 两处 ON 后面多写了一个孤立的「=」，连接条件整体语法错；④ SELECT 末列后多一个逗号。列名与标点各有手滑，本簇维持未过关。',
    next: '2026-10-17',
  },
  {
    date: '2026-10-15',
    kind: '错题',
    title: 'CREATE VIEW 的 AS 后又加括号（连续两轮），无聚合却写 GROUP BY，还擅自加列',
    tags: ['SQL', 'CREATE VIEW', 'GROUP BY'],
    status: 'ok',
    mine: '首答 13(3) 与回炉 13(3)：CREATE VIEW vHighScore AS ( SELECT ...参赛.成绩... GROUP BY 运动员.运动员编号, 比赛项目.项目编号 )',
    correct: 'CREATE VIEW vHighScore AS SELECT 运动员.运动员编号, 运动员.姓名, 比赛项目.项目名称 FROM 运动员 JOIN 参赛 ON 运动员.运动员编号 = 参赛.运动员编号 JOIN 比赛项目 ON 参赛.项目编号 = 比赛项目.项目编号 WHERE 参赛.成绩 >= 95;',
    cause: '① AS 后加括号曾连续两轮出现（10-13、10-14），是 0 分硬伤；② 题干只要三列，多出的成绩列属擅自加列；③ 整句没有聚合函数却写 GROUP BY，严格 SQL 报错。**10-15 E-R 案例题重写时三处全部修正**：AS 后直接接 SELECT（括号去掉）、只投影三列、不再写多余的 GROUP BY，且 JOIN 顺序 运动员→参赛→比赛项目 正确。唯一小瑕疵是 WHERE 里的 成绩 未带表名前缀（标准答案写 参赛.成绩），属规范性而非错误。连续三轮的顽疾本轮过关，转已过关。',
    next: '2026-10-20',
  },
  {
    date: '2026-10-15',
    kind: '错题',
    title: '候选键最小性、主属性与范式阶梯混在一起判断',
    tags: ['关系规范化', '候选键', '主属性', '范式'],
    status: 'danger',
    mine: '第 2 题选 ABD；第 5 题把有传递依赖判为 3NF；第 6 题答候选键 A、B、C，且把“全码”与“全属性为主属性”混同',
    correct: '第 2 题候选键 AD；第 5 题最高 2NF（但可再分解到 3NF）；第 6 题候选键 AB、AC，A、B、C 都是主属性，最高 3NF',
    cause: '候选键先要“能推出全集”，再要逐个删属性验最小性：AD 已能推出 ABCD，ABD 中的 B 多余。主属性只问“是否出现在任一候选键中”，不是候选键本身，也不是只看选作主键的那一个；第 6 题 AB、AC 都是候选键，所以 A、B、C 均为主属性。范式必须逐级验：单属性候选键不可能有部分依赖，故第 5 题先过 2NF；但仓库号→城市→地区编号构成传递依赖，止于 2NF，达不到 3NF。',
    next: '2026-10-17',
  },
  {
    date: '2026-10-16',
    kind: '错题',
    title: '接口隔离与里氏替换连续混淆：先看“被迫实现”还是“子换父出错”',
    tags: ['面向对象设计原则', '接口隔离', '里氏替换', 'SOLID'],
    status: 'danger',
    mine: '① IWorker 同时含 work()、eat()、fly()；普通员工被迫空实现 fly()，答 LSP；② Bird 父类承诺 fly()，Penguin 子类改为抛异常，客户代码替换后报错，答 IFP（犹豫）',
    correct: '① ISP（接口隔离原则）：多个专门接口优于一个包含无关方法的总接口；② LSP（里氏替换原则）：子类替换父类后，不能破坏原有约定',
    cause: '这两题的区分必须先看题目在批评什么：普通员工被迫依赖和实现 fly() 这个无关方法，说明接口职责太杂，应拆成 IWork、IEat、IFly 等按需实现的小接口，选 ISP；企鹅替换鸟后，原本合法的 fly() 调用抛异常，说明子类破坏了父类约定，选 LSP。口诀：“被迫空实现无关方法”见 ISP；“子换父，原逻辑出错”才见 LSP。10-16 随后两道对照题均答对：简易打印机被迫空实现 scan/fax 选 ISP；VIPAccount 改变余额不足的行为约定选 LSP。',
    next: '2026-10-17',
  },
];

const WEAK = [
  { name: '散列表 ASL 的计算', errors: 1, status: 'warn', action: '10 月 20 日原题（H=key%7、表长 8、插入 15/22/8/29/36）答对：位置 1~5、ASL 3，五项齐全未漏项。仍是当天首胜，回炉日再验一次项数是否稳定。' },
  { name: '银行家算法追加申请与安全性检查', errors: 1, status: 'ok', action: '10 月 19 日重做新题答对；回炉时复查初始 Available，试分后检查全部未完成进程并找完整安全序列。' },
  { name: '管道过滤器体系结构', errors: 1, status: 'danger', action: '重做 AM-004：列出该风格的复用、并行收益和数据传输开销。' },
  { name: 'I/O 控制方式与 DMA', errors: 2, status: 'danger', action: '对照查询、中断、无条件传送和 DMA，重做 AM-005、AM-U-02。' },
  { name: '数据库访问接口 JDBC', errors: 1, status: 'danger', action: '比较 JDBC 与 XML、CGI、COM 的用途，重做 AM-024。' },
  { name: '哈夫曼编码与树深度', errors: 1, status: 'ok', action: '10 月 20 日同类新题 4 道全部答对：WPL 计算、节点总数、构造编码与码长均正确；考前按“每轮取最小两个、和放回池子”复述一遍即可。' },
  { name: '哈夫曼编码的平均码长', errors: 2, status: 'danger', action: '10 月 20 日回炉答对（33 ÷ 18 ≈ 1.83），10 月 21 日重犯（61 ÷ 4 = 15.25，应为 61 ÷ 32 ≈ 1.91）。回炉时先写分母再动笔：Σf 是总频率，不是字符种类数；算完用「结果必须落在最短码长～最长码长之间」自检。' },
  { name: '等长编码位数与哈夫曼总位数对比', errors: 1, status: 'danger', action: '分清种类数（决定每个码几位，⌈log₂种类数⌉）与字符总数（只用来乘总位数）；哈夫曼总位数直接取 WPL，不要用统一码长乘总数。' },
  { name: '编译阶段与中间代码', errors: 2, status: 'danger', action: '分清语法与语义分析，再认后缀式和三地址码，重做 AM-U-07、AM-U-08。' },
  { name: '流水线周期', errors: 1, status: 'danger', action: '把最长阶段耗时与各段串行总耗时分开计算，重做 AM-U-09。' },
  { name: '主动攻击与被动攻击', errors: 1, status: 'danger', action: '对照截获与拒绝服务，重做 AM-U-11。' },
  { name: '串并联可靠性', errors: 1, status: 'danger', action: '先算两组并联的成功率，再将两组串联相乘，重做 AM-U-13。' },
  { name: '保证不死锁的资源数', errors: 1, status: 'ok', action: '已于 10 月 19 日独立答对新题；考前复习时回忆“每进程最大需求减一后求和，再加一”。' },
  { name: '软件配置管理边界', errors: 1, status: 'danger', action: '区分版本、变更、状态报告与风险管理，重做 AM-U-16。' },
  { name: '域名解析顺序口径', errors: 0, status: 'warn', action: '核对 AM-U-18 原题和所用教材关于浏览器缓存、系统缓存与 hosts 的前提。' },
  { name: '模块职责与相似功能合并', errors: 0, status: 'warn', action: '用新题区分不同职责的强行合并与重复实现的公共模块抽取；AM-U-19 暂不计错。' },
  { name: '入侵检测与漏洞扫描', errors: 1, status: 'danger', action: '区分检测运行时活动与主动探测弱点，重做 AM-U-20。' },
  { name: '观察者模式的目标角色', errors: 1, status: 'danger', action: '画出 Subject、Observer 与注册、通知、更新的职责，重做 AM-067。' },
  { name: '算法案例读题地基', errors: 1, status: 'warn', action: '先独立说出输入、输出、数组个数、子序列与返回值，再尝试未见过的小题；LIS 尚未独立作答。' },
  { name: 'DFD 系统与具体加工的区分', errors: 1, status: 'ok', action: '从业务描述中找具体处理名称，区分整个系统与其内部加工。' },
  { name: '接口隔离与单一职责的场景辨析', errors: 1, status: 'danger', action: '对照设备被迫实现无关方法与类承担多种变化原因，分别判断 ISP 和 SRP。' },
  { name: 'UML 状态图转换与初终态', errors: 1, status: 'danger', action: '复习监护条件可省略，并辨认状态图中的初态与终态。' },
  { name: 'UML 部署图与构件图识别', errors: 2, status: 'danger', action: '辨认部署节点立体长方体，以及构件图的整圆供接口和半圆需接口。' },
  { name: 'UML 临时使用的依赖关系', errors: 1, status: 'ok', action: '区分方法中临时使用对象的依赖、类继承和接口实现。' },
  { name: 'UML 活动图与构件图识别', errors: 1, status: 'danger', action: '看到业务步骤和条件分支选活动图；看到软件构件和接口依赖选构件图。' },
  { name: 'UML 用例图与通信图识别', errors: 1, status: 'ok', action: '看到角色和系统功能选用例图；看到对象连接和消息编号选通信图。' },
  { name: '实体类、边界类和控制类', errors: 1, status: 'danger', action: '按承载业务信息、对外交流、协调流程区分，并重做借书六个类的分类。' },
  { name: '策略模式与装饰器辨认', errors: 1, status: 'danger', action: '区分可替换的规则与包装对象增加职责，并用提醒方式例子说明策略。' },
  { name: '顺序图与通信图', errors: 1, status: 'danger', action: '比较生命线上的时间顺序与对象连接上的消息编号，重做 UML 图选型题。' },
  { name: 'UML 泛化与继承关系', errors: 1, status: 'warn', action: '用读者、学生读者和教师读者画泛化，标出父类与空心三角的方向。' },
  { name: 'UML 用例扩展关系关键字', errors: 1, status: 'ok', action: '复习 include 与 extend 的名称、条件和箭头方向。' },
  { name: 'UML 类图关系与多重度', errors: 2, status: 'danger', action: '逐端判断对象数量；区分多对多关联和有明确整体部分约束的聚合、组合，并确认菱形所在端。' },
  { name: '方法重载与重写', errors: 1, status: 'warn', action: '区分同名不同参数的重载与子类重新实现的重写，重做辨析题。' },
  { name: '多态与重写方法的动态分派', errors: 1, status: 'danger', action: '用父类引用指向子类对象的例子，判断被重写方法执行哪个版本。' },
  { name: '模块内聚类型辨认', errors: 1, status: 'ok', action: '复习偶然、逻辑、时间和过程内聚，继续区分时间内聚与过程内聚。' },
  { name: '模块耦合类型辨认', errors: 1, status: 'ok', action: '复习简单数据、整条记录、控制标志与公共数据分别对应的耦合类型。' },
  { name: '开发模型与风险分析', errors: 1, status: 'ok', action: '说出螺旋模型风险分析和 V 模型开发测试对应关系。' },
  { name: '连接的行数与列数手算', errors: 4, status: 'danger', action: '逐个公共值做“左表出现次数 × 右表出现次数”后求和；重做 10-15 第 1、7 题' },
  { name: '笛卡尔积与连接的区别', errors: 2, status: 'danger', action: '背口诀 + 重做改错题' },
  { name: '等值连接 / 自然连接列数', errors: 1, status: 'warn', action: '手算 3 对表' },
  { name: '投影去重、选择逐行验条件', errors: 0, status: 'ok', action: '考前抽查' },
  { name: '复合式子 σ+π+⋈ 运算顺序', errors: 0, status: 'ok', action: '考前抽查' },
  { name: '职务开发著作权归属（归单位）', errors: 2, status: 'warn', action: '10-12 重做 G1～G4 已过，考前抽查' },
  { name: '著作权保护期三锚点（永久/发表/终生+50）', errors: 3, status: 'danger', action: '背法人双锚点 +「署改完永久」，重做课后 3、4、精华 5、G5' },
  { name: '合法复制品备份的两半义务', errors: 1, status: 'warn', action: '重做课后 15，对照速判表' },
  { name: 'GROUP BY 分组粒度与聚合条件', errors: 4, status: 'danger', action: '分组列已会认（回炉已改对 Sno）；仍要练：先认「每个 X」定分组列，组条件写成 聚合函数(列) 运算符 值，GROUP BY 不许漏 BY；无聚合一律不写 GROUP BY（13(3) 已改对一次，E-R 3(2) 的聚合写法也已规范）' },
  { name: '多表连接路径与嵌套子查询写法', errors: 4, status: 'danger', action: '两条三表 JOIN 路径已能一次画对；仍要防「连接列名凭空编造」——E-R 3(2) 重写时仍写 运动员.所属团编号（该表只有 团编号），且 ON 后多写孤立等号；写连接条件前逐字回题干表定义核对列名' },
  { name: '建表外键与建视图的固定格式', errors: 5, status: 'danger', action: '三处固定骨架要能闭卷默写：FOREIGN KEY (本表列) REFERENCES 表名(被引列)、PRIMARY KEY (列)（关键字后必带括号）、CREATE VIEW 视图名 AS SELECT（AS 后直接接 SELECT、不加括号）；E-R 3(3) 的 AS 加括号已改对，E-R 3(1) 又漏 PRIMARY KEY/FOREIGN KEY 括号' },
  { name: '并发四类错误对号入座', errors: 3, status: 'ok', action: '回炉脏读、幻读各答对一次，锚点已用对；考前抽查' },
  { name: '故障恢复 REDO/UNDO 判据', errors: 2, status: 'ok', action: '回炉「未完成事务 → UNDO」答对；考前抽查' },
  { name: '“含／以上”闭区间与单引号常量', errors: 2, status: 'ok', action: '回炉闭区间与字符串常量均写对；考前抽查' },
  { name: '聚合函数与比较运算符的位置', errors: 2, status: 'danger', action: '括号里只放列，比较符写在外面；重做 12(2)、13(2)' },
  { name: '固定短语与同类项誊写复查', errors: 4, status: 'danger', action: '默写 REFERENCES / SUM / GROUP BY / WITH GRANT OPTION / CREATE VIEW ... AS SELECT；改错后扫同类项——10-15 重写已能一次改对 REFERENCES 两处，但标点仍漏（3(1) 关键字漏括号、3(2) 末列多逗号、ON 后多等号），交卷前扫一遍全句标点' },
  { name: '商标续展窗口期与新有效期（前 12 后 6 / 续 10）', errors: 1, status: 'danger', action: '背「前 12 后 6 管窗口，续满 10 年管新期限」，重做 10-14 练习第 10 题' },
  { name: '先申请原则与同日协商的适用边界', errors: 1, status: 'warn', action: '默认先申请优先，协商只补同日；专利商标同套规则，重做 10-14 练习第 8 题' },
  { name: '设计模式：命令／备忘录／外观的场景识别', errors: 3, status: 'warn', action: '背“操作→命令、状态→备忘录、多个系统→外观”；10-20 错题回炉抽查' },
  { name: '设计模式：外观/策略与代理/中介者辨析', errors: 2, status: 'warn', action: '背“多系统入口→外观、多算法替换→策略、一对一替身→代理、多对象协调→中介者”；10-20 错题回炉抽查' },
  { name: '商业秘密的构成条件与法律保护', errors: 1, status: 'warn', action: '背“三要件：秘密性、价值性、保密措施”；重做本轮第 4、6 题' },
  { name: '候选键最小性、主属性与范式逐级判定', errors: 4, status: 'danger', action: '先算闭包、再逐个删属性；候选键求并集标主属性；按 1NF→2NF→3NF→BCNF 逐级验，重做 10-15 第 2、5、6 题及外部套题 AM-061；AM-052 待核原题依赖。' },
  { name: '接口隔离与里氏替换的场景辨析', errors: 2, status: 'warn', action: '本轮紧接的两道对照题已答对；明日各重做一题。被迫实现无关方法选 ISP；子类替换父类导致原有逻辑失效选 LSP' },
];

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- 总览数字块 ---------- */
function renderTiles() {
  const count = s => MISTAKES.filter(m => m.status === s).length;
  const defs = [
    { n: MISTAKES.length, l: '记录总数', cls: 't-total' },
    { n: count('danger'), l: '未过关', cls: 't-danger', st: 'danger' },
    { n: count('warn'), l: '待巩固', cls: 't-warn', st: 'warn' },
    { n: count('ok'), l: '已过关', cls: 't-ok', st: 'ok' },
  ];
  document.getElementById('tiles').innerHTML = defs.map(d => {
    const glyph = d.st ? `<span class="chip ${d.st}" style="border:0;background:none;padding:0"><span class="g">${STATUS[d.st].glyph}</span></span>` : '';
    return `<div class="tile ${d.cls}"><div class="n">${d.n}</div><div class="l">${glyph}${esc(d.l)}</div></div>`;
  }).join('');
}

/* ---------- 薄弱点图谱 ---------- */
function renderGraph() {
  const max = Math.max(1, ...WEAK.map(w => w.errors));
  document.getElementById('graph').innerHTML = WEAK.map(w => {
    const st = STATUS[w.status];
    const pct = Math.round((w.errors / max) * 100);
    return `<div class="grow s-${w.status}">
      <div class="gname">${esc(w.name)}</div>
      <div class="gbar" role="progressbar" aria-label="${esc(w.name)} 出错强度" aria-valuenow="${w.errors}" aria-valuemin="0" aria-valuemax="${max}"><i style="width:${pct}%"></i></div>
      <div class="gcount">${w.errors} 次</div>
      <div class="gchip"><span class="chip ${w.status}"><span class="g">${st.glyph}</span>${st.label}</span></div>
    </div>`;
  }).join('');
}

/* ---------- 错题卡片 ---------- */
function cardHTML(m) {
  const st = STATUS[m.status];
  return `<article class="card s-${m.status}">
    <header class="card-h">
      <span class="card-kind">${esc(m.kind)} · ${esc(m.date)}</span>
      <h3 class="card-t">${esc(m.title)}</h3>
      <span class="tags">${m.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</span>
    </header>
    <div class="card-b">
      <div class="ba">
        <div class="ans mine"><div class="k"><span>✗</span>我的答案</div><div class="v">${esc(m.mine)}</div></div>
        <div class="ans right"><div class="k"><span>✓</span>正确答案</div><div class="v">${esc(m.correct)}</div></div>
      </div>
      <p class="cause"><b>错因　</b>${esc(m.cause)}</p>
      <footer class="card-f">
        <span class="chip ${m.status}"><span class="g">${st.glyph}</span>${st.label}</span>
        <span class="foot-l">下次回炉 <b>${esc(m.next)}</b></span>
      </footer>
    </div>
  </article>`;
}

let filter = 'all';
function renderCards() {
  const list = MISTAKES.filter(m => filter === 'all' || m.status === filter);
  document.getElementById('cards').innerHTML = list.map(cardHTML).join('');
  document.getElementById('empty').classList.toggle('is-hidden', list.length > 0);
}

function renderFilters() {
  const count = s => s === 'all' ? MISTAKES.length : MISTAKES.filter(m => m.status === s).length;
  const defs = [
    { k: 'all', label: '全部' },
    { k: 'danger', label: `${STATUS.danger.glyph} 未过关` },
    { k: 'warn', label: `${STATUS.warn.glyph} 待巩固` },
    { k: 'ok', label: `${STATUS.ok.glyph} 已过关` },
  ];
  const box = document.getElementById('filters');
  box.innerHTML = defs.map(d =>
    `<button class="fbtn" type="button" data-k="${d.k}" aria-pressed="${d.k === filter}">${esc(d.label)} <span class="cnt">${count(d.k)}</span></button>`
  ).join('');
  box.querySelectorAll('.fbtn').forEach(btn => btn.addEventListener('click', () => {
    filter = btn.dataset.k;
    box.querySelectorAll('.fbtn').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    renderCards();
  }));
}

/* ---------- 深/浅色 ---------- */
function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('mb-theme');
  const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = saved || (preferDark ? 'dark' : 'light');
  root.classList.toggle('reduce', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.getElementById('themeBtn').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mb-theme', root.dataset.theme);
  });
}

initTheme();
renderTiles();
renderGraph();
renderFilters();
renderCards();
