

<template>
  <div> 任务库 <svg-icon icon-class="build" /> </div>
  <el-table v-loading="false" :data="taskList">

  </el-table>
</template>
<script setup name="tasks">

  const taskList = ref([]);
  const data = reactive({

  })
</script>

<style scoped lang="scss">


</style>