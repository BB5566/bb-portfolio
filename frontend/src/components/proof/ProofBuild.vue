<template>
  <section id="build" class="proof-build" aria-labelledby="proof-build-title">
    <ProofFrame class="wrap">
      <div class="shead">
        <h2 id="proof-build-title">
          實作
          <small>經歷與技能</small>
        </h2>
      </div>

      <div class="grid">
        <div>
          <ol class="timeline">
            <li v-for="exp in experiences" :key="exp.id">
              <time>{{ period(exp.start_date, exp.end_date, exp.is_current) }}</time>
              <h3>{{ exp.position }}</h3>
              <p class="company">{{ exp.company }}</p>
              <p v-if="exp.description" class="desc">{{ exp.description }}</p>
              <ul v-if="exp.achievements?.length" class="achievements">
                <li v-for="line in exp.achievements.slice(0, SHOWN)" :key="line">{{ line }}</li>
              </ul>
              <!-- 超過 4 條的收起來，想細看的人再展開 -->
              <details v-if="moreOf(exp).length" class="more">
                <summary>其他 {{ moreOf(exp).length }} 項成果</summary>
                <ul class="achievements">
                  <li v-for="line in moreOf(exp)" :key="line">{{ line }}</li>
                </ul>
              </details>
            </li>
          </ol>
        </div>

        <!-- 右欄：技能＋學歷，桌機跟著捲，左邊經歷再長也不會留一大塊空白 -->
        <div class="side">
          <div class="skills">
            <div v-for="(items, group) in skills" :key="group" class="group">
              <h4>{{ group }}</h4>
              <p>
                <span v-for="item in items" :key="item">{{ item }}</span>
              </p>
            </div>
          </div>

          <template v-if="education.length">
            <h3 class="sub">學歷與訓練</h3>
            <ul class="education">
              <li v-for="edu in education" :key="edu.id">
                <time>{{ period(edu.start_date, edu.end_date, edu.is_current) }}</time>
                <div>
                  <strong>{{ edu.school }}</strong>
                  <span>{{ edu.field_of_study }}・{{ edu.degree }}</span>
                </div>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </ProofFrame>
  </section>
</template>

<script setup lang="ts">
import type { Education, Experience } from '@/types/models'
import { getDatePeriod } from '@/utils/date'
import ProofFrame from './ProofFrame.vue'

defineProps<{
  experiences: Experience[]
  education: Education[]
  skills: Record<string, string[]>
}>()

// 每段經歷先列幾條成果，其餘收進「其他 N 項」
const SHOWN = 4
const moreOf = (exp: Experience) => exp.achievements?.slice(SHOWN) ?? []
const period = (start: string, end: string | null, isCurrent: boolean) =>
  getDatePeriod(start, end, isCurrent, 'dot')
</script>

<style scoped>
.proof-build {
  padding: 60px 0 48px;
}

.shead {
  margin-bottom: 22px;
}

.shead h2 {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: 900;
  letter-spacing: 0.02em;
}

.shead h2 small {
  font-family: var(--latin);
  font-size: var(--fs-ui);
  letter-spacing: 0.04em;
  color: var(--ink-2);
}

.grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
  align-items: start;
}

/* ── 經歷時間軸 ── */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 26px;
  margin: 0;
  padding: 0 0 0 22px;
  border-left: 1.5px solid var(--rule);
  list-style: none;
}

.timeline > li {
  position: relative;
}

.timeline > li::before {
  content: '';
  position: absolute;
  left: -28px;
  top: 6px;
  width: 10px;
  height: 10px;
  border: 2px solid var(--paper);
  border-radius: 50%;
  background: var(--accent);
}

time {
  font-family: var(--latin);
  font-weight: 700;
  font-size: var(--fs-small);
  letter-spacing: 0.06em;
  color: var(--ink-2);
}

.timeline h3 {
  margin: 2px 0 0;
  font-size: var(--fs-lead);
  font-weight: 900;
}

.company {
  margin: 2px 0 0;
  font-size: var(--fs-ui);
  color: var(--ink-2);
}

.desc {
  max-width: 36em;
  margin: 6px 0 0;
  font-size: var(--fs-body);
  line-height: 1.7;
  color: var(--ink);
  text-wrap: pretty;
}

.achievements {
  display: grid;
  gap: 4px;
  max-width: 36em;
  margin: 8px 0 0;
  padding-left: 1.2em;
  font-size: var(--fs-body);
  line-height: 1.7;
}

.more {
  margin-top: 6px;
  font-size: var(--fs-ui);
}

.more summary {
  width: fit-content;
  color: var(--accent-ink);
  font-weight: 700;
  cursor: pointer;
}

.sub {
  margin: 36px 0 12px;
  font-size: var(--fs-lead);
  font-weight: 900;
}

.education {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.education li {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 12px;
  font-size: var(--fs-body);
  line-height: 1.6;
}

.education strong,
.education span {
  display: block;
}

.education span {
  color: var(--ink-2);
}

/* ── 技能 ── */
/* 桌機而且視窗夠高（右欄約 700px）才跟著捲，矮螢幕會切到學歷 */
@media (min-width: 901px) and (min-height: 800px) {
  .side {
    position: sticky;
    top: 24px;
  }
}

.skills {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.group h4 {
  margin: 0;
  font-family: var(--latin);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--ink-2);
}

.group p {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 0;
}

.group span {
  padding: 4px 10px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: #fff;
  font-size: var(--fs-small);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .education li {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
