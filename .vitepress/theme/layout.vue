<script setup>
import DefaultTheme from 'vitepress/theme';
import StatusBar from './status-bar.vue';
import ReadingProgress from './reading-progress.vue';
</script>

<template>
  <ReadingProgress />
  <DefaultTheme.Layout>
    <template #doc-after>
      <StatusBar />
    </template>
  </DefaultTheme.Layout>
</template>
