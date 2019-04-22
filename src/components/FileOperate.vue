<template>
  <Row>
    <Upload
      :before-upload="handleImport"
      :format="['css']"
      :accept="'text/css'"
      action="/">
      <Button type="info">导入</Button>
    </Upload>
    <Button type="warning" @click="handleExport">导出</Button>
  </Row>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class FileOperate extends Vue {
  handleImport(file: File) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (evt: any) => {
      const content = evt.target.result;
      this.emitImport(content);
    };
    return false;
  }

  @Emit('on-operation')
  emitImport(content: string) {
    return {
      type: 'import',
      data: content,
    };
  }

  @Emit('on-operation')
  handleExport() {
    return {
      type: 'export',
      data: {},
    };
  }
}
</script>
