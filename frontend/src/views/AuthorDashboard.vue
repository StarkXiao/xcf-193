<template>
  <div class="author-dashboard">
    <div class="page-header">
      <h1 class="page-title">📊 作者数据看板</h1>
      <p class="page-desc">集中展示你的创作数据和读者反馈</p>
    </div>

    <n-spin :show="loading" size="large">
      <div v-if="!loading" class="dashboard-content">
        <div class="summary-cards">
          <n-card class="summary-card" hoverable>
            <div class="card-icon card-icon-views">👁️</div>
            <div class="card-content">
              <div class="card-value">{{ summary?.performance?.totalViews || 0 }}</div>
              <div class="card-label">总阅读量</div>
              <div class="card-trend up">↑ {{ summary?.performance?.weeklyGrowth || 0 }}% 周增长</div>
            </div>
          </n-card>
          <n-card class="summary-card" hoverable>
            <div class="card-icon card-icon-likes">❤️</div>
            <div class="card-content">
              <div class="card-value">{{ summary?.performance?.totalLikes || 0 }}</div>
              <div class="card-label">总点赞数</div>
              <div class="card-trend up">↑ 持续增长中</div>
            </div>
          </n-card>
          <n-card class="summary-card" hoverable>
            <div class="card-icon card-icon-stories">📖</div>
            <div class="card-content">
              <div class="card-value">{{ summary?.performance?.totalStories || 0 }}</div>
              <div class="card-label">作品数量</div>
              <div class="card-trend">平均完成率 {{ summary?.performance?.avgCompletionRate || 0 }}%</div>
            </div>
          </n-card>
          <n-card class="summary-card" hoverable>
            <div class="card-icon card-icon-refs">🔗</div>
            <div class="card-content">
              <div class="card-value">{{ summary?.settingReferences?.totalReferences || 0 }}</div>
              <div class="card-label">设定引用数</div>
              <div class="card-trend up">↑ 本周 {{ summary?.settingReferences?.weeklyReferences || 0 }} 次</div>
            </div>
          </n-card>
        </div>

        <n-tabs v-model:value="activeTab" type="line" size="large" class="dashboard-tabs">
          <n-tab-pane name="performance" tab="📈 作品表现">
            <div class="tab-panel">
              <div class="section-title">作品数据概览</div>
              <div class="stories-list">
                <n-card 
                  v-for="story in performanceData?.stories || []" 
                  :key="story.id"
                  hoverable
                  class="story-card"
                >
                  <div class="story-header">
                    <div class="story-cover">{{ story.cover }}</div>
                    <div class="story-info">
                      <h3 class="story-title">{{ story.title }}</h3>
                      <n-tag :type="story.status === 'ongoing' ? 'success' : 'default'" size="small">
                        {{ story.status === 'ongoing' ? '连载中' : '已完结' }}
                      </n-tag>
                    </div>
                  </div>
                  
                  <div class="story-metrics">
                    <div class="metric-item">
                      <span class="metric-label">阅读量</span>
                      <span class="metric-value">{{ story.views }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">点赞数</span>
                      <span class="metric-value">{{ story.likes }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">收藏数</span>
                      <span class="metric-value">{{ story.favorites }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">分享数</span>
                      <span class="metric-value">{{ story.shares }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">完成率</span>
                      <span class="metric-value">{{ story.completionRate }}%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">平均阅读时长</span>
                      <span class="metric-value">{{ story.avgReadingTime }}分钟</span>
                    </div>
                  </div>

                  <div class="trend-chart">
                    <div class="chart-title">近7天数据趋势</div>
                    <div class="chart-bars">
                      <div 
                        v-for="(item, idx) in story.trend" 
                        :key="idx"
                        class="chart-bar-group"
                      >
                        <div class="bar-wrapper">
                          <div 
                            class="bar bar-views" 
                            :style="{ height: (item.views / getMaxViews(story.trend) * 100) + '%' }"
                          >
                            <div class="bar-tooltip">阅读: {{ item.views }}</div>
                          </div>
                        </div>
                        <div class="bar-label">{{ item.date.slice(5) }}</div>
                      </div>
                    </div>
                  </div>
                </n-card>
              </div>

              <div class="section-title" v-if="performanceData?.topEndings?.length">热门结局排行</div>
              <div class="endings-ranking" v-if="performanceData?.topEndings?.length">
                <n-card hoverable class="endings-card">
                  <div 
                    v-for="(ending, idx) in performanceData.topEndings" 
                    :key="ending.id"
                    class="ending-item"
                  >
                    <div class="ending-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
                    <div class="ending-info">
                      <div class="ending-title">{{ ending.title }}</div>
                      <div class="ending-bar-wrapper">
                        <div 
                          class="ending-bar" 
                          :style="{ width: ending.rate + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div class="ending-stats">
                      <div class="ending-count">{{ ending.count }} 人达成</div>
                      <div class="ending-rate">{{ ending.rate }}%</div>
                    </div>
                  </div>
                </n-card>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="readers" tab="👥 读者画像">
            <div class="tab-panel">
              <div class="reader-grid">
                <div class="reader-column">
                  <div class="section-title">读者性别分布</div>
                  <n-card hoverable class="chart-card">
                    <div class="pie-chart">
                      <div class="pie-center">
                        <div class="pie-total">读者</div>
                      </div>
                      <svg viewBox="0 0 100 100" class="pie-svg">
                        <circle 
                          cx="50" cy="50" r="40" 
                          fill="none" 
                          stroke="#e74c3c" 
                          :stroke-width="20"
                          :stroke-dasharray="(readerData?.demographics?.gender?.male || 0) * 2.51 + ' ' + 251"
                          stroke-dashoffset="0"
                          transform="rotate(-90 50 50)"
                        />
                        <circle 
                          cx="50" cy="50" r="40" 
                          fill="none" 
                          stroke="#9b59b6" 
                          :stroke-width="20"
                          :stroke-dasharray="(readerData?.demographics?.gender?.female || 0) * 2.51 + ' ' + 251"
                          :stroke-dashoffset="-((readerData?.demographics?.gender?.male || 0) * 2.51)"
                          transform="rotate(-90 50 50)"
                        />
                        <circle 
                          cx="50" cy="50" r="40" 
                          fill="none" 
                          stroke="#3498db" 
                          :stroke-width="20"
                          :stroke-dasharray="(readerData?.demographics?.gender?.other || 0) * 2.51 + ' ' + 251"
                          :stroke-dashoffset="-((readerData?.demographics?.gender?.male || 0) + (readerData?.demographics?.gender?.female || 0)) * 2.51"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <div class="pie-legend">
                      <div class="legend-item">
                        <span class="legend-dot legend-male"></span>
                        <span>男性 {{ readerData?.demographics?.gender?.male || 0 }}%</span>
                      </div>
                      <div class="legend-item">
                        <span class="legend-dot legend-female"></span>
                        <span>女性 {{ readerData?.demographics?.gender?.female || 0 }}%</span>
                      </div>
                      <div class="legend-item">
                        <span class="legend-dot legend-other"></span>
                        <span>其他 {{ readerData?.demographics?.gender?.other || 0 }}%</span>
                      </div>
                    </div>
                  </n-card>

                  <div class="section-title">读者年龄分布</div>
                  <n-card hoverable class="chart-card">
                    <div class="bar-chart-horizontal">
                      <div 
                        v-for="(value, key) in readerData?.demographics?.ageGroups || {}" 
                        :key="key"
                        class="bar-row"
                      >
                        <div class="bar-row-label">{{ key }}岁</div>
                        <div class="bar-row-track">
                          <div 
                            class="bar-row-fill bar-age"
                            :style="{ width: value + '%' }"
                          ></div>
                        </div>
                        <div class="bar-row-value">{{ value }}%</div>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="reader-column">
                  <div class="section-title">读者地域分布</div>
                  <n-card hoverable class="chart-card">
                    <div class="region-list">
                      <div 
                        v-for="region in readerData?.demographics?.regions || []" 
                        :key="region.name"
                        class="region-item"
                      >
                        <span class="region-name">{{ region.name }}</span>
                        <div class="region-bar-wrapper">
                          <div 
                            class="region-bar"
                            :style="{ width: region.value + '%' }"
                          ></div>
                        </div>
                        <span class="region-value">{{ region.value }}%</span>
                      </div>
                    </div>
                  </n-card>

                  <div class="section-title">读者阅读习惯</div>
                  <n-card hoverable class="chart-card">
                    <div class="habit-list">
                      <div class="habit-item">
                        <span class="habit-icon">📚</span>
                        <div class="habit-info">
                          <div class="habit-label">日均阅读次数</div>
                          <div class="habit-value">{{ readerData?.preferences?.readingHabits?.avgSessions || 0 }} 次</div>
                        </div>
                      </div>
                      <div class="habit-item">
                        <span class="habit-icon">⏱️</span>
                        <div class="habit-info">
                          <div class="habit-label">平均阅读时长</div>
                          <div class="habit-value">{{ readerData?.preferences?.readingHabits?.avgDuration || 0 }} 分钟</div>
                        </div>
                      </div>
                      <div class="habit-item">
                        <span class="habit-icon">🕐</span>
                        <div class="habit-info">
                          <div class="habit-label">活跃时段</div>
                          <div class="habit-value">{{ readerData?.preferences?.readingHabits?.preferredTime || '-' }}</div>
                        </div>
                      </div>
                    </div>
                  </n-card>

                  <div class="section-title">一周活跃读者趋势</div>
                  <n-card hoverable class="chart-card">
                    <div class="chart-bars weekly-bars">
                      <div 
                        v-for="day in readerData?.preferences?.engagement?.activeDays || []" 
                        :key="day.day"
                        class="chart-bar-group"
                      >
                        <div class="bar-wrapper tall">
                          <div 
                            class="bar bar-readers" 
                            :style="{ height: (day.readers / getMaxReaders(readerData?.preferences?.engagement?.activeDays) * 100) + '%' }"
                          >
                            <div class="bar-tooltip">{{ day.readers }}人</div>
                          </div>
                        </div>
                        <div class="bar-label">{{ day.day }}</div>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="reader-column full-width">
                  <div class="section-title">读者偏好标签</div>
                  <n-card hoverable class="chart-card">
                    <div class="tag-cloud">
                      <div 
                        v-for="tag in readerData?.preferences?.favoriteTags || []" 
                        :key="tag.name"
                        class="tag-item"
                        :style="{ fontSize: (12 + tag.value / 10) + 'px' }"
                      >
                        {{ tag.name }}
                      </div>
                    </div>
                  </n-card>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="branches" tab="🔀 分支转化">
            <div class="tab-panel">
              <div class="branch-selector">
                <div class="section-title" style="margin-bottom: 0;">选择故事查看分支转化</div>
                <n-select 
                  v-model:value="selectedStoryId" 
                  :options="storyOptions"
                  placeholder="请选择故事"
                  @update:value="loadBranchData"
                  style="width: 280px;"
                />
              </div>

              <div v-if="branchData" class="branch-content">
                <div class="section-title">阅读漏斗</div>
                <n-card hoverable class="funnel-card">
                  <div class="funnel">
                    <div 
                      v-for="(stage, idx) in branchData.overallFunnel" 
                      :key="stage.stage"
                      class="funnel-stage"
                      :style="{ width: stage.rate + '%' }"
                    >
                      <div class="funnel-content">
                        <div class="funnel-stage-name">{{ stage.stage }}</div>
                        <div class="funnel-stage-count">{{ stage.count }} 人</div>
                        <div class="funnel-stage-rate">{{ stage.rate }}%</div>
                      </div>
                    </div>
                  </div>
                </n-card>

                <div class="section-title">分支节点详情</div>
                <div class="branch-nodes">
                  <n-card 
                    v-for="node in branchData.nodes" 
                    :key="node.nodeId"
                    hoverable
                    class="node-card"
                  >
                    <div class="node-header">
                      <h4 class="node-title">{{ node.title }}</h4>
                      <n-tag type="info" size="small">{{ node.visitors }} 人到达</n-tag>
                    </div>
                    <div class="node-choices">
                      <div 
                        v-for="choice in node.choices" 
                        :key="choice.id"
                        class="choice-item"
                      >
                        <div class="choice-text">{{ choice.text }}</div>
                        <div class="choice-stats">
                          <div class="choice-bar-wrapper">
                            <div 
                              class="choice-bar"
                              :style="{ width: choice.rate + '%' }"
                            ></div>
                          </div>
                          <span class="choice-count">{{ choice.count }}人</span>
                          <span class="choice-rate">{{ choice.rate }}%</span>
                        </div>
                      </div>
                    </div>
                  </n-card>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="settings" tab="🔥 设定引用热度">
            <div class="tab-panel">
              <div class="settings-grid">
                <div class="settings-summary">
                  <div class="section-title">引用数据总览</div>
                  <n-card hoverable class="summary-detail-card">
                    <div class="summary-metric">
                      <span class="summary-metric-icon">📊</span>
                      <div>
                        <div class="summary-metric-value">{{ settingData?.summary?.totalReferences || 0 }}</div>
                        <div class="summary-metric-label">总引用次数</div>
                      </div>
                    </div>
                    <div class="summary-metric">
                      <span class="summary-metric-icon">📅</span>
                      <div>
                        <div class="summary-metric-value">{{ settingData?.summary?.weeklyReferences || 0 }}</div>
                        <div class="summary-metric-label">本周引用</div>
                      </div>
                    </div>
                  </n-card>

                  <div class="section-title">引用来源分布</div>
                  <n-card hoverable class="chart-card">
                    <div class="source-list">
                      <div 
                        v-for="source in settingData?.referenceSources || []" 
                        :key="source.source"
                        class="source-item"
                      >
                        <div class="source-info">
                          <span class="source-name">{{ source.source }}</span>
                          <div class="source-bar-wrapper">
                            <div 
                              class="source-bar"
                              :style="{ width: (source.count / (settingData?.summary?.totalReferences || 1) * 100) + '%' }"
                            ></div>
                          </div>
                        </div>
                        <span class="source-count">{{ source.count }} 次</span>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="settings-trend">
                  <div class="section-title">周引用趋势</div>
                  <n-card hoverable class="chart-card">
                    <div class="chart-bars weekly-bars">
                      <div 
                        v-for="item in settingData?.trendData || []" 
                        :key="item.week"
                        class="chart-bar-group"
                      >
                        <div class="bar-wrapper tall">
                          <div 
                            class="bar bar-refs" 
                            :style="{ height: (item.references / getMaxRefs(settingData?.trendData) * 100) + '%' }"
                          >
                            <div class="bar-tooltip">{{ item.references }}次</div>
                          </div>
                        </div>
                        <div class="bar-label">{{ item.week }}</div>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="settings-top full-width">
                  <div class="section-title">热门设定条目排行</div>
                  <n-card hoverable class="top-settings-card">
                    <div 
                      v-for="(item, idx) in settingData?.summary?.topReferenced || []" 
                      :key="item.entryId"
                      class="top-setting-item"
                    >
                      <div class="top-setting-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
                      <div class="top-setting-info">
                        <div class="top-setting-title">{{ item.title }}</div>
                        <div class="top-setting-category">
                          <n-tag size="small" type="primary">{{ item.category }}</n-tag>
                        </div>
                      </div>
                      <div class="top-setting-count">
                        <div class="count-value">{{ item.referenceCount }} 次引用</div>
                        <div class="count-trend" :class="item.trend">
                          {{ item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→' }} 
                          {{ Math.abs(item.weeklyChange) }} 本周
                        </div>
                      </div>
                    </div>
                  </n-card>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="endings" tab="🎭 结局分析">
            <div class="tab-panel">
              <div class="ending-selector">
                <div class="section-title" style="margin-bottom: 0;">选择故事查看结局分析</div>
                <n-select 
                  v-model:value="selectedEndingStoryId" 
                  :options="storyOptions"
                  placeholder="请选择故事"
                  @update:value="loadEndingData"
                  style="width: 280px;"
                />
              </div>

              <div v-if="endingAchievements" class="ending-content">
                <div class="section-title">📊 结局达成率概览</div>
                <div class="achievement-summary">
                  <n-card hoverable class="achievement-summary-card">
                    <div class="summary-metric">
                      <span class="summary-metric-icon">🏆</span>
                      <div>
                        <div class="summary-metric-value">{{ endingAchievements.overallAchievementRate }}%</div>
                        <div class="summary-metric-label">总体达成率</div>
                      </div>
                    </div>
                  </n-card>
                  <n-card hoverable class="achievement-summary-card">
                    <div class="summary-metric">
                      <span class="summary-metric-icon">🎯</span>
                      <div>
                        <div class="summary-metric-value">{{ endingAchievements.totalEndings }}</div>
                        <div class="summary-metric-label">结局总数</div>
                      </div>
                    </div>
                  </n-card>
                  <n-card hoverable class="achievement-summary-card">
                    <div class="summary-metric">
                      <span class="summary-metric-icon">👥</span>
                      <div>
                        <div class="summary-metric-value">{{ endingAchievements.totalReaders }}</div>
                        <div class="summary-metric-label">总阅读人数</div>
                      </div>
                    </div>
                  </n-card>
                  <n-card hoverable class="achievement-summary-card">
                    <div class="summary-metric">
                      <span class="summary-metric-icon">🔄</span>
                      <div>
                        <div class="summary-metric-value">{{ endingAchievements.averageEndingsPerReader }}</div>
                        <div class="summary-metric-label">人均达成结局数</div>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="section-title">结局达成趋势</div>
                <n-card hoverable class="trend-card">
                  <div class="chart-bars weekly-bars">
                    <div 
                      v-for="item in endingAchievements.achievementTrend" 
                      :key="item.date"
                      class="chart-bar-group"
                    >
                      <div class="bar-wrapper tall">
                        <div 
                          class="bar bar-endings" 
                          :style="{ height: (item.newAchievements / getMaxNewAchievements(endingAchievements.achievementTrend) * 100) + '%' }"
                        >
                          <div class="bar-tooltip">新增 {{ item.newAchievements }} 个</div>
                        </div>
                      </div>
                      <div class="bar-label">{{ item.date.slice(5) }}</div>
                    </div>
                  </div>
                </n-card>

                <div class="section-title">各结局达成情况</div>
                <n-card hoverable class="endings-detail-card">
                  <div 
                    v-for="(ending, idx) in endingAchievements.endings" 
                    :key="ending.id"
                    class="ending-detail-item"
                  >
                    <div class="ending-detail-header">
                      <div class="ending-detail-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
                      <div class="ending-detail-info">
                        <div class="ending-detail-title">{{ ending.title }}</div>
                        <n-tag :type="getEndingTypeTag(ending.endingType)" size="small">
                          {{ getEndingTypeLabel(ending.endingType) }}
                        </n-tag>
                      </div>
                      <div class="ending-detail-stats">
                        <div class="ending-detail-count">{{ ending.achievementCount }} 人达成</div>
                        <div class="ending-detail-rate">{{ ending.achievementRate }}%</div>
                      </div>
                    </div>
                    <div class="ending-detail-bar-wrapper">
                      <div 
                        class="ending-detail-bar"
                        :style="{ width: ending.achievementRate + '%' }"
                      ></div>
                    </div>
                    <div class="ending-detail-meta">
                      <span class="meta-item">首次达成: {{ ending.firstReachedAt }}</span>
                      <span class="meta-item">本周新增: {{ ending.recentWeekCount }}</span>
                      <span :class="['meta-trend', ending.trend]">
                        {{ ending.trend === 'up' ? '↑ 上升' : ending.trend === 'down' ? '↓ 下降' : '→ 平稳' }}
                      </span>
                    </div>
                  </div>
                </n-card>
              </div>

              <div v-if="popularBranches" class="ending-section">
                <div class="section-title">🔥 热门分支排行</div>
                <div class="branch-ranking-header">
                  <n-radio-group v-model:value="branchSortBy" size="small" @update:value="onBranchSortChange">
                    <n-radio value="selectCount">按选择人数</n-radio>
                    <n-radio value="selectRate">按选择比例</n-radio>
                  </n-radio-group>
                </div>
                <n-card hoverable class="branch-ranking-card">
                  <div 
                    v-for="branch in popularBranches.ranking" 
                    :key="branch.choiceId"
                    class="branch-rank-item"
                  >
                    <div class="branch-rank-number" :class="'rank-' + branch.rank">{{ branch.rank }}</div>
                    <div class="branch-rank-content">
                      <div class="branch-rank-node">{{ branch.nodeTitle }}</div>
                      <div class="branch-rank-choice">
                        <span class="choice-label">选项:</span>
                        <span class="choice-text">{{ branch.choiceText }}</span>
                      </div>
                      <div class="branch-rank-bar-wrapper">
                        <div 
                          class="branch-rank-bar"
                          :style="{ width: branch.selectRate + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div class="branch-rank-stats">
                      <div class="branch-rank-count">{{ branch.selectCount }} 人</div>
                      <div class="branch-rank-rate">{{ branch.selectRate }}%</div>
                      <div v-if="branch.isKeyBranch" class="branch-rank-tag">
                        <n-tag size="small" type="warning">关键分支</n-tag>
                      </div>
                      <div v-if="branch.leadsToEnding" class="branch-rank-tag">
                        <n-tag size="small" type="success">通向结局</n-tag>
                      </div>
                    </div>
                  </div>
                </n-card>

                <div class="section-title">关键分支节点</div>
                <div class="key-branch-points">
                  <n-card 
                    v-for="point in popularBranches.keyBranchPoints" 
                    :key="point.nodeId"
                    hoverable
                    class="key-point-card"
                  >
                    <div class="key-point-header">
                      <div class="key-point-title">{{ point.title }}</div>
                      <n-tag v-if="point.isFirstLevel" size="small" type="primary">一级分支</n-tag>
                    </div>
                    <div class="key-point-stats">
                      <span class="key-point-stat">
                        <span class="stat-label">访问人数</span>
                        <span class="stat-value">{{ point.visitors }}</span>
                      </span>
                      <span class="key-point-stat">
                        <span class="stat-label">分支数量</span>
                        <span class="stat-value">{{ point.branchCount }}</span>
                      </span>
                    </div>
                  </n-card>
                </div>
              </div>

              <div v-if="endingDistribution" class="ending-section">
                <div class="section-title">👥 读者结局分布</div>
                
                <div class="distribution-tabs">
                  <n-radio-group v-model:value="distributionView" size="small">
                    <n-radio value="gender">按性别</n-radio>
                    <n-radio value="age">按年龄</n-radio>
                    <n-radio value="region">按地域</n-radio>
                    <n-radio value="type">按类型</n-radio>
                  </n-radio-group>
                </div>

                <div v-if="distributionView === 'gender'" class="distribution-content">
                  <div class="distribution-grid">
                    <n-card v-for="(endings, gender) in endingDistribution.story?.byGender || {}" :key="gender" hoverable class="distribution-card">
                      <div class="distribution-card-title">
                        <span class="gender-icon">{{ getGenderLabel(gender) }}</span>
                      </div>
                      <div class="distribution-list">
                        <div 
                          v-for="ending in endings" 
                          :key="ending.endingId"
                          class="distribution-item"
                        >
                          <div class="distribution-item-header">
                            <span class="distribution-item-name">{{ ending.endingTitle }}</span>
                            <span class="distribution-item-rate">{{ ending.rate }}%</span>
                          </div>
                          <div class="distribution-item-bar-wrapper">
                            <div 
                              class="distribution-item-bar"
                              :class="'bar-gender-' + gender"
                              :style="{ width: ending.rate + '%' }"
                            ></div>
                          </div>
                          <div class="distribution-item-count">{{ ending.count }} 人</div>
                        </div>
                      </div>
                    </n-card>
                  </div>
                </div>

                <div v-else-if="distributionView === 'age'" class="distribution-content">
                  <div class="distribution-grid">
                    <n-card v-for="(endings, ageGroup) in endingDistribution.story?.byAgeGroup || {}" :key="ageGroup" hoverable class="distribution-card">
                      <div class="distribution-card-title">
                        <span class="age-label">{{ ageGroup }}岁</span>
                      </div>
                      <div class="distribution-list">
                        <div 
                          v-for="ending in endings" 
                          :key="ending.endingId"
                          class="distribution-item"
                        >
                          <div class="distribution-item-header">
                            <span class="distribution-item-name">{{ ending.endingTitle }}</span>
                            <span class="distribution-item-rate">{{ ending.rate }}%</span>
                          </div>
                          <div class="distribution-item-bar-wrapper">
                            <div 
                              class="distribution-item-bar bar-age"
                              :style="{ width: ending.rate + '%' }"
                            ></div>
                          </div>
                          <div class="distribution-item-count">{{ ending.count }} 人</div>
                        </div>
                      </div>
                    </n-card>
                  </div>
                </div>

                <div v-else-if="distributionView === 'region'" class="distribution-content">
                  <div class="distribution-grid">
                    <n-card v-for="(endings, region) in endingDistribution.story?.byRegion || {}" :key="region" hoverable class="distribution-card">
                      <div class="distribution-card-title">
                        <span class="region-label">{{ region }}</span>
                      </div>
                      <div class="distribution-list">
                        <div 
                          v-for="ending in endings" 
                          :key="ending.endingId"
                          class="distribution-item"
                        >
                          <div class="distribution-item-header">
                            <span class="distribution-item-name">{{ ending.endingTitle }}</span>
                            <span class="distribution-item-rate">{{ ending.rate }}%</span>
                          </div>
                          <div class="distribution-item-bar-wrapper">
                            <div 
                              class="distribution-item-bar bar-region"
                              :style="{ width: ending.rate + '%' }"
                            ></div>
                          </div>
                          <div class="distribution-item-count">{{ ending.count }} 人</div>
                        </div>
                      </div>
                    </n-card>
                  </div>
                </div>

                <div v-else-if="distributionView === 'type'" class="distribution-content">
                  <n-card hoverable class="type-distribution-card">
                    <div class="type-pie-section">
                      <div class="pie-chart">
                        <div class="pie-center">
                          <div class="pie-total">结局类型</div>
                        </div>
                        <svg viewBox="0 0 100 100" class="pie-svg">
                          <circle 
                            v-for="(type, idx) in endingDistribution.story?.endingTypeDistribution || []"
                            :key="type.type"
                            cx="50" cy="50" r="40" 
                            fill="none" 
                            :stroke="getEndingTypeColor(type.type)"
                            :stroke-width="20"
                            :stroke-dasharray="type.rate * 2.51 + ' ' + 251"
                            :stroke-dashoffset="getTypeStrokeOffset(idx, endingDistribution.story?.endingTypeDistribution || [])"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                      <div class="type-legend">
                        <div 
                          v-for="type in endingDistribution.story?.endingTypeDistribution || []"
                          :key="type.type"
                          class="legend-item"
                        >
                          <span class="legend-dot" :style="{ background: getEndingTypeColor(type.type) }"></span>
                          <span>{{ type.label }}</span>
                          <span class="legend-value">{{ type.rate }}%</span>
                        </div>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="section-title">完读路径分析</div>
                <n-card hoverable class="path-analysis-card">
                  <div class="path-stats">
                    <div class="path-stat-item">
                      <span class="path-stat-icon">📏</span>
                      <div class="path-stat-info">
                        <div class="path-stat-value">{{ endingDistribution.story?.completionPaths?.avgStepsToEnding || 0 }}</div>
                        <div class="path-stat-label">平均步长</div>
                      </div>
                    </div>
                    <div class="path-stat-item">
                      <span class="path-stat-icon">⚡</span>
                      <div class="path-stat-info">
                        <div class="path-stat-value">{{ endingDistribution.story?.completionPaths?.fastestPath || '' }}</div>
                        <div class="path-stat-label">最快路径</div>
                      </div>
                    </div>
                    <div class="path-stat-item">
                      <span class="path-stat-icon">🔥</span>
                      <div class="path-stat-info">
                        <div class="path-stat-value">{{ endingDistribution.story?.completionPaths?.mostPopularPath || '' }}</div>
                        <div class="path-stat-label">最热门路径</div>
                      </div>
                    </div>
                    <div class="path-stat-item">
                      <span class="path-stat-icon">🔁</span>
                      <div class="path-stat-info">
                        <div class="path-stat-value">{{ endingDistribution.story?.completionPaths?.avgReplayCount || 0 }}</div>
                        <div class="path-stat-label">平均重玩次数</div>
                      </div>
                    </div>
                  </div>
                </n-card>

                <div class="section-title">💡 数据洞察</div>
                <n-card hoverable class="insights-card">
                  <div class="insights-list">
                    <div 
                      v-for="(insight, idx) in endingDistribution.overallInsights || []" 
                      :key="idx"
                      class="insight-item"
                    >
                      <span class="insight-icon">{{ getInsightIcon(insight.type) }}</span>
                      <span class="insight-text">{{ insight.insight }}</span>
                    </div>
                  </div>
                </n-card>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NCard, NTag, NTabs, NTabPane, NSpin, NSelect, NRadio, NRadioGroup } from 'naive-ui'
import { analyticsApi } from '../api'

const userId = 'user-1'
const loading = ref(false)
const activeTab = ref('performance')
const selectedStoryId = ref('story-1')
const selectedEndingStoryId = ref('story-1')

const summary = ref(null)
const performanceData = ref(null)
const readerData = ref(null)
const branchData = ref(null)
const settingData = ref(null)
const endingAchievements = ref(null)
const popularBranches = ref(null)
const endingDistribution = ref(null)
const branchSortBy = ref('selectCount')
const distributionView = ref('gender')

const storyOptions = computed(() => {
  if (!performanceData.value?.stories) return []
  return performanceData.value.stories.map(s => ({
    label: `${s.cover} ${s.title}`,
    value: s.id
  }))
})

const loadAllData = async () => {
  loading.value = true
  try {
    const [summaryRes, perfRes, readerRes, settingRes] = await Promise.all([
      analyticsApi.getAuthorSummary(userId),
      analyticsApi.getAuthorPerformance(userId),
      analyticsApi.getReaderProfile(userId),
      analyticsApi.getSettingReferences(userId)
    ])
    summary.value = summaryRes.data
    performanceData.value = perfRes.data
    readerData.value = readerRes.data
    settingData.value = settingRes.data
    
    if (perfRes.data?.stories?.length > 0) {
      selectedStoryId.value = perfRes.data.stories[0].id
      selectedEndingStoryId.value = perfRes.data.stories[0].id
      await loadBranchData(perfRes.data.stories[0].id)
      await loadEndingData(perfRes.data.stories[0].id)
    }
  } catch (err) {
    console.error('加载看板数据失败:', err)
  } finally {
    loading.value = false
  }
}

const loadBranchData = async (storyId) => {
  if (!storyId) return
  try {
    const res = await analyticsApi.getBranchConversions(storyId)
    branchData.value = res.data
  } catch (err) {
    console.error('加载分支数据失败:', err)
  }
}

const loadEndingData = async (storyId) => {
  if (!storyId) return
  try {
    const [achieveRes, branchRes, distRes] = await Promise.all([
      analyticsApi.getEndingAchievements(storyId),
      analyticsApi.getPopularBranches(storyId, { sortBy: branchSortBy.value }),
      analyticsApi.getEndingDistribution(userId, { storyId })
    ])
    endingAchievements.value = achieveRes.data
    popularBranches.value = branchRes.data
    endingDistribution.value = distRes.data
  } catch (err) {
    console.error('加载结局分析数据失败:', err)
  }
}

const onBranchSortChange = async (value) => {
  if (!selectedEndingStoryId.value) return
  try {
    const res = await analyticsApi.getPopularBranches(selectedEndingStoryId.value, { sortBy: value })
    popularBranches.value = res.data
  } catch (err) {
    console.error('加载热门分支数据失败:', err)
  }
}

const getMaxViews = (trend) => {
  if (!trend || trend.length === 0) return 1
  return Math.max(...trend.map(t => t.views))
}

const getMaxReaders = (days) => {
  if (!days || days.length === 0) return 1
  return Math.max(...days.map(d => d.readers))
}

const getMaxRefs = (trendData) => {
  if (!trendData || trendData.length === 0) return 1
  return Math.max(...trendData.map(t => t.references))
}

const getMaxNewAchievements = (trend) => {
  if (!trend || trend.length === 0) return 1
  return Math.max(...trend.map(t => t.newAchievements))
}

const getEndingTypeLabel = (type) => {
  const labels = {
    happy: '喜剧结局',
    normal: '普通结局',
    bittersweet: '苦乐参半',
    sad: '悲剧结局'
  }
  return labels[type] || '未知'
}

const getEndingTypeTag = (type) => {
  const tags = {
    happy: 'success',
    normal: 'info',
    bittersweet: 'warning',
    sad: 'error'
  }
  return tags[type] || 'default'
}

const getEndingTypeColor = (type) => {
  const colors = {
    happy: '#52c41a',
    normal: '#1890ff',
    bittersweet: '#faad14',
    sad: '#f5222d'
  }
  return colors[type] || '#999'
}

const getGenderLabel = (gender) => {
  const labels = {
    male: '男性读者',
    female: '女性读者',
    other: '其他读者'
  }
  return labels[gender] || gender
}

const getTypeStrokeOffset = (idx, list) => {
  if (idx === 0) return 0
  let offset = 0
  for (let i = 0; i < idx; i++) {
    offset += list[i].rate * 2.51
  }
  return -offset
}

const getInsightIcon = (type) => {
  const icons = {
    gender: '👤',
    age: '🎂',
    region: '📍',
    ending: '🎯'
  }
  return icons[type] || '💡'
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.author-dashboard {
  padding-bottom: 40px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  margin: 0 0 8px 0;
  color: #333;
}

.page-desc {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.card-icon-views {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.card-icon-likes {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

.card-icon-stories {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.card-icon-refs {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
}

.card-label {
  font-size: 13px;
  color: #999;
  margin: 4px 0;
}

.card-trend {
  font-size: 12px;
  color: #666;
}

.card-trend.up {
  color: #52c41a;
}

.dashboard-tabs {
  margin-top: 8px;
}

.tab-panel {
  padding-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.stories-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.story-card {
  padding: 20px;
}

.story-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.story-cover {
  font-size: 40px;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.story-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.story-title {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.story-metrics {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.metric-item {
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.trend-chart {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.chart-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 140px;
}

.chart-bars.weekly-bars {
  height: 180px;
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.bar-wrapper {
  width: 100%;
  height: calc(100% - 24px);
  display: flex;
  align-items: flex-end;
  position: relative;
}

.bar-wrapper.tall {
  height: calc(100% - 24px);
}

.bar {
  width: 100%;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: height 0.5s ease;
  cursor: pointer;
  min-height: 4px;
}

.bar-views {
  background: linear-gradient(180deg, #9d4edd 0%, #c77dff 100%);
}

.bar-readers {
  background: linear-gradient(180deg, #52c41a 0%, #95de64 100%);
}

.bar-refs {
  background: linear-gradient(180deg, #fa8c16 0%, #ffc069 100%);
}

.bar:hover .bar-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-8px);
}

.bar-tooltip {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.2s;
  pointer-events: none;
}

.bar-label {
  font-size: 12px;
  color: #666;
}

.endings-ranking {
  margin-bottom: 16px;
}

.endings-card {
  padding: 16px 20px;
}

.ending-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ending-item:last-child {
  border-bottom: none;
}

.ending-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}

.rank-1 {
  background: linear-gradient(135deg, #fadb14 0%, #faad14 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%);
}

.rank-3 {
  background: linear-gradient(135deg, #d48806 0%, #ad6800 100%);
}

.ending-rank:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%);
}

.ending-info {
  flex: 1;
  min-width: 0;
}

.ending-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
}

.ending-bar-wrapper {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.ending-bar {
  height: 100%;
  background: linear-gradient(90deg, #9d4edd 0%, #c77dff 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.ending-stats {
  text-align: right;
  flex-shrink: 0;
}

.ending-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.ending-rate {
  font-size: 12px;
  color: #9d4edd;
  margin-top: 2px;
}

.reader-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.reader-column.full-width {
  grid-column: 1 / -1;
}

.chart-card {
  padding: 20px;
}

.pie-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
}

.pie-total {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.pie-svg {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}

.pie-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-male {
  background: #e74c3c;
}

.legend-female {
  background: #9b59b6;
}

.legend-other {
  background: #3498db;
}

.bar-chart-horizontal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-row-label {
  width: 60px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.bar-row-track {
  flex: 1;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.bar-row-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.bar-age {
  background: linear-gradient(90deg, #9d4edd 0%, #c77dff 100%);
}

.bar-row-value {
  width: 50px;
  text-align: right;
  font-size: 13px;
  color: #333;
  font-weight: 600;
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.region-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.region-name {
  width: 50px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.region-bar-wrapper {
  flex: 1;
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.region-bar {
  height: 100%;
  background: linear-gradient(90deg, #52c41a 0%, #95de64 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.region-value {
  width: 50px;
  text-align: right;
  font-size: 13px;
  color: #333;
  font-weight: 600;
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.habit-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
}

.habit-info {
  flex: 1;
}

.habit-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.habit-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 16px;
}

.tag-item {
  padding: 8px 16px;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  color: #7b2cbf;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.tag-item:hover {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  color: #fff;
  transform: translateY(-2px);
}

.branch-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.branch-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.funnel-card {
  padding: 24px;
}

.funnel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.funnel-stage {
  background: linear-gradient(90deg, #9d4edd 0%, #c77dff 100%);
  border-radius: 8px;
  padding: 12px 20px;
  color: #fff;
  transition: all 0.5s ease;
  margin: 0 auto;
}

.funnel-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.funnel-stage-name {
  font-weight: 600;
  font-size: 14px;
}

.funnel-stage-count {
  font-size: 13px;
  opacity: 0.9;
}

.funnel-stage-rate {
  font-size: 16px;
  font-weight: bold;
}

.branch-nodes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.node-card {
  padding: 20px;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.node-title {
  font-size: 15px;
  margin: 0;
  color: #333;
}

.node-choices {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.choice-text {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}

.choice-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.choice-bar-wrapper {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.choice-bar {
  height: 100%;
  background: linear-gradient(90deg, #fa8c16 0%, #ffc069 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.choice-count {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.choice-rate {
  font-size: 12px;
  font-weight: 600;
  color: #fa8c16;
  white-space: nowrap;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.settings-summary,
.settings-trend {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-top.full-width {
  grid-column: 1 / -1;
}

.summary-detail-card {
  padding: 20px;
}

.summary-metric {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-metric:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.summary-metric:first-child {
  padding-top: 0;
}

.summary-metric-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 12px;
}

.summary-metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.summary-metric-label {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.source-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.source-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-name {
  font-size: 14px;
  color: #333;
}

.source-bar-wrapper {
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.source-bar {
  height: 100%;
  background: linear-gradient(90deg, #fa8c16 0%, #ffc069 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.source-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.top-settings-card {
  padding: 16px 20px;
}

.top-setting-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.top-setting-item:last-child {
  border-bottom: none;
}

.top-setting-rank {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}

.top-setting-info {
  flex: 1;
  min-width: 0;
}

.top-setting-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 6px;
}

.top-setting-category {
  display: inline-block;
}

.top-setting-count {
  text-align: right;
  flex-shrink: 0;
}

.count-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.count-trend {
  font-size: 12px;
  margin-top: 4px;
}

.count-trend.up {
  color: #52c41a;
}

.count-trend.down {
  color: #f5222d;
}

.count-trend.stable {
  color: #faad14;
}

.ending-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ending-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.achievement-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.achievement-summary-card {
  padding: 20px;
}

.summary-metric {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-metric-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.summary-metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.summary-metric-label {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

.trend-card {
  padding: 20px;
}

.bar-endings {
  background: linear-gradient(180deg, #ff6b6b 0%, #ffa8a8 100%);
}

.endings-detail-card {
  padding: 16px 20px;
}

.ending-detail-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ending-detail-item:last-child {
  border-bottom: none;
}

.ending-detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.ending-detail-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}

.ending-detail-info {
  flex: 1;
  min-width: 0;
}

.ending-detail-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 6px;
  font-weight: 600;
}

.ending-detail-stats {
  text-align: right;
  flex-shrink: 0;
}

.ending-detail-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.ending-detail-rate {
  font-size: 16px;
  color: #ff6b6b;
  font-weight: bold;
  margin-top: 2px;
}

.ending-detail-bar-wrapper {
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}

.ending-detail-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b 0%, #ffa8a8 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.ending-detail-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-trend.up {
  color: #52c41a;
}

.meta-trend.down {
  color: #f5222d;
}

.meta-trend.stable {
  color: #faad14;
}

.ending-section {
  margin-top: 8px;
}

.branch-ranking-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.branch-ranking-card {
  padding: 16px 20px;
}

.branch-rank-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.branch-rank-item:last-child {
  border-bottom: none;
}

.branch-rank-number {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}

.branch-rank-content {
  flex: 1;
  min-width: 0;
}

.branch-rank-node {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.branch-rank-choice {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.choice-label {
  color: #999;
  margin-right: 4px;
}

.choice-text {
  font-weight: 500;
}

.branch-rank-bar-wrapper {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.branch-rank-bar {
  height: 100%;
  background: linear-gradient(90deg, #fa8c16 0%, #ffc069 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.branch-rank-stats {
  text-align: right;
  flex-shrink: 0;
  min-width: 100px;
}

.branch-rank-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.branch-rank-rate {
  font-size: 13px;
  color: #fa8c16;
  font-weight: 600;
  margin-top: 2px;
}

.branch-rank-tag {
  margin-top: 4px;
}

.key-branch-points {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.key-point-card {
  padding: 20px;
}

.key-point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.key-point-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.key-point-stats {
  display: flex;
  gap: 24px;
}

.key-point-stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.distribution-tabs {
  margin-bottom: 16px;
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.distribution-card {
  padding: 20px;
}

.distribution-card-title {
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.gender-icon,
.age-label,
.region-label {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 16px;
  color: #7b2cbf;
  font-size: 13px;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-item {
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
}

.distribution-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.distribution-item-name {
  font-size: 13px;
  color: #333;
}

.distribution-item-rate {
  font-size: 13px;
  font-weight: 600;
  color: #9d4edd;
}

.distribution-item-bar-wrapper {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.distribution-item-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-gender-male {
  background: linear-gradient(90deg, #e74c3c 0%, #ec7063 100%);
}

.bar-gender-female {
  background: linear-gradient(90deg, #9b59b6 0%, #bb8fce 100%);
}

.bar-gender-other {
  background: linear-gradient(90deg, #3498db 0%, #85c1e9 100%);
}

.bar-region {
  background: linear-gradient(90deg, #52c41a 0%, #95de64 100%);
}

.distribution-item-count {
  font-size: 12px;
  color: #999;
}

.type-distribution-card {
  padding: 24px;
}

.type-pie-section {
  display: flex;
  align-items: center;
  gap: 40px;
  justify-content: center;
}

.type-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-value {
  font-weight: 600;
  margin-left: 8px;
}

.path-analysis-card {
  padding: 20px;
}

.path-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.path-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.path-stat-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.path-stat-info {
  min-width: 0;
  flex: 1;
}

.path-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path-stat-label {
  font-size: 12px;
  color: #999;
}

.insights-card {
  padding: 20px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
  border-radius: 8px;
}

.insight-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.insight-text {
  font-size: 14px;
  color: #333;
  flex: 1;
}

@media (max-width: 1024px) {
  .achievement-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .key-branch-points {
    grid-template-columns: 1fr;
  }

  .distribution-grid {
    grid-template-columns: 1fr;
  }

  .path-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .achievement-summary {
    grid-template-columns: 1fr;
  }

  .ending-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .path-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .story-metrics {
    grid-template-columns: repeat(3, 1fr);
  }

  .reader-grid {
    grid-template-columns: 1fr;
  }

  .branch-nodes {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .story-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .branch-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
