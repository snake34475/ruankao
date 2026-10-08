<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
import { cleanHeading, headingStatus, importedStatusItems, pageStatusKey } from './status-keys.mjs';

const { page } = useData();
const storeKey = 'ruankao-study-status';
const labels = { none: '未开始', doing: '进行中', done: '已理解', later: '稍后学习' };
const values = Object.keys(labels);
const state = ref({ version: 1, updatedAt: '', items: {} });
const message = ref('');
const fileInput = ref(null);
const pageKey = computed(() => pageStatusKey(page.value.relativePath));
const current = computed(() => state.value.items[pageKey.value] ?? 'none');

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey));
    if (saved && saved.items && typeof saved.items === 'object') state.value = saved;
  } catch { /* 本地存储不可用时保持空状态 */ }
}
function save() {
  state.value.updatedAt = new Date().toISOString();
  try { localStorage.setItem(storeKey, JSON.stringify(state.value, null, 2)); } catch { /* 浏览器可能禁用存储 */ }
}
function choose(value) {
  state.value.items[pageKey.value] = value;
  state.value = { ...state.value };
  save();
  paintSections();
  paintSidebar();
}
function paintSidebar() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.VPSidebar a[href]').forEach(link => {
    const path = decodeURIComponent(new URL(link.href, location.href).pathname).replace(/^\/ruankao\//, '').replace(/\.html$/, '').replace(/\/$/, '');
    if (!path) return;
    const value = state.value.items[path] ?? 'none';
    let dot = link.querySelector('.study-nav-dot');
    if (!dot) {
      dot = document.createElement('i');
      dot.className = 'study-nav-dot';
      dot.setAttribute('aria-hidden', 'true');
      link.append(dot);
    }
    dot.dataset.status = value;
  });
}
function headingText(heading) {
  return cleanHeading(heading.textContent);
}
function sectionKey(heading) {
  return `${pageKey.value}#${headingText(heading)}`;
}
function paintSections() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.vp-doc h2[data-study-key], .vp-doc h3[data-study-key]').forEach(heading => {
    const value = headingStatus(state.value.items, pageKey.value, heading.textContent);
    heading.querySelector('.study-dot')?.setAttribute('data-status', value);
  });
}
function prepareSections() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.vp-doc h2, .vp-doc h3').forEach(heading => {
    const key = sectionKey(heading);
    heading.dataset.studyKey = key;
    if (heading.querySelector('.study-dot')) return;
    const button = document.createElement('button');
    button.className = 'study-dot';
    button.type = 'button';
    button.title = '切换本节学习状态';
    button.setAttribute('aria-label', `切换「${headingText(heading)}」的学习状态`);
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const prior = headingStatus(state.value.items, pageKey.value, heading.textContent);
      state.value.items[key] = values[(values.indexOf(prior) + 1) % values.length];
      state.value = { ...state.value };
      save();
      paintSections();
    });
    heading.append(button);
  });
  paintSections();
  paintSidebar();
}
function exportState() {
  const blob = new Blob([JSON.stringify(state.value, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `study-status-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 2000);
}
async function importState(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  try {
    const input = JSON.parse(await file.text());
    const items = importedStatusItems(input);
    state.value = { version: 1, updatedAt: new Date().toISOString(), items };
    save();
    prepareSections();
    message.value = '导入成功';
  } catch { message.value = '导入失败：文件格式不正确'; }
}

onMounted(() => { load(); prepareSections(); });
watch(() => page.value.relativePath, () => setTimeout(prepareSections, 0));
</script>

<template>
  <div class="study-status" v-if="pageKey !== 'index'">
    <span>本页学习状态</span>
    <select :value="current" :aria-label="`本页学习状态：${labels[current]}`" @change="choose($event.target.value)">
      <option v-for="value in values" :key="value" :value="value">{{ labels[value] }}</option>
    </select>
    <button type="button" @click="exportState">导出状态</button>
    <button type="button" @click="fileInput?.click()">导入状态</button>
    <input ref="fileInput" type="file" accept=".json,application/json" hidden @change="importState">
    <span role="status">{{ message }}</span>
  </div>
</template>
