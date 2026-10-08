<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vitepress';

const route = useRoute();
const progress = ref(0);
let frame = 0;

function update() {
  frame = 0;
  const length = document.documentElement.scrollHeight - window.innerHeight;
  progress.value = length > 0 ? Math.min(1, Math.max(0, window.scrollY / length)) : 1;
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}

function decorateStars() {
  document.querySelectorAll('.vp-doc h1, .vp-doc h2, .vp-doc h3, .vp-doc h4').forEach(heading => {
    if (heading.querySelector('.stars')) return;
    for (const node of [...heading.childNodes].reverse()) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      const match = node.textContent.match(/^(.*?)(\s+)([★☆]+)\s*$/);
      if (!match) continue;
      node.textContent = `${match[1]} `;
      const badge = document.createElement('span');
      badge.className = 'stars';
      badge.textContent = match[3];
      node.after(badge);
      break;
    }
  });
}

function decorateInlineStars() {
  const article = document.querySelector('.vp-doc');
  if (!article) return;
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/[★☆]/.test(node.textContent) && !node.parentElement.closest('h1,h2,h3,h4,pre,code,svg,a,button,mjx-container,.stars,.stars-inline')) nodes.push(node);
  }
  for (const node of nodes) {
    const fragment = document.createDocumentFragment();
    for (const part of node.textContent.split(/([★☆]+)/g)) {
      if (!part) continue;
      if (/[★☆]/.test(part)) {
        const span = document.createElement('span');
        span.className = 'stars-inline';
        span.textContent = part;
        fragment.append(span);
      } else fragment.append(part);
    }
    node.replaceWith(fragment);
  }
}

async function onPageChange() {
  await nextTick();
  requestAnimationFrame(() => { decorateStars(); decorateInlineStars(); schedule(); });
}

onMounted(() => {
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  onPageChange();
});
onUnmounted(() => {
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  if (frame) cancelAnimationFrame(frame);
});
watch(() => route.path, onPageChange);
</script>

<template>
  <div class="reading-progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }" /></div>
</template>
