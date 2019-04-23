<template>
  <Modal
    :value="show"
    :mask-closable="false"
    :closable="false">
    <p slot="header">
      <span>导出</span>
    </p>
    <Form ref="exportForm" :label-width="80" :model="formInline" :rules="ruleValidate">
      <FormItem label="文件名" prop="fileName">
        <Input type="text" v-model="formInline.fileName" placeholder="请输入文件名">
        </Input>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="error" size="large" @click="cancel">取消</Button>
      <Button type="primary" size="large" @click="ok">确认</Button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch, Emit,
} from 'vue-property-decorator';
import css from 'css';

@Component
export default class ExportFormModal extends Vue {
  @Prop(Boolean) readonly show!: boolean;

  initForm = {
    fileName: 'output.css',
  };

  formInline = { ...this.initForm };

  ruleValidate = {
    fileName: [
      { required: true, message: '文件名不可为空', trigger: 'blur' },
    ],
  }

  @Emit('on-operation')
  closeModal() {
    this.formInline = { ...this.initForm };
    return {
      type: 'show-export-modal',
      data: false,
    };
  }

  @Emit('on-operation')
  emitExport() {
    return {
      type: 'export',
      data: this.formInline,
    };
  }

  cancel() {
    this.closeModal();
  }

  ok() {
    const form: any = this.$refs.exportForm;
    form.validate((valid: boolean) => {
      if (valid) {
        this.emitExport();
        this.closeModal();
      }
    });
  }
}
</script>
