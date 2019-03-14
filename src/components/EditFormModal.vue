<template>
  <Modal v-model="isShow" @on-visible-change="onVisibleChanged">
    <p slot="header">
      <span>编辑</span>
    </p>
    <Form :label-width="80">
      <FormItem label="Select">
        <Select v-model="selectors" multiple
          @on-change="onSelectorsChanged">
          <template v-for="item in selectors">
            <Option :key="item" :value="item">{{ item }}</Option>
          </template>
        </Select>
      </FormItem>
      <FormItem label="Text">
        <Input v-model="cssVal" type="textarea" :autosize="{minRows: 5}"
          @on-blur="onCssValBlur"></Input>
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
export default class EditFormModal extends Vue {
  @Prop(Boolean) readonly show!: boolean;

  @Prop(Object) readonly rule!: any;

  isShow = false;

  selectors: Array<string> = [];

  cssVal = '';

  ast: any;

  editRule: any;

  @Watch('show')
  onShowChanged(show: boolean) {
    this.isShow = show;

    const rules = [];
    rules.push(this.rule);
    const ast = {
      type: 'stylesheet',
      stylesheet: {
        rules,
        parsingErrors: [],
      },
    };

    this.cssVal = css.stringify(ast);

    this.parseCss();
  }

  parseCss() {
    this.ast = css.parse(this.cssVal);
    [this.editRule] = this.ast.stylesheet.rules;
    this.editRule.rawIndex = this.rule.rawIndex;
    this.selectors = this.editRule.selectors;
  }

  @Emit('modal-close')
  closeModal() {
    this.isShow = false;
  }

  @Emit('on-rule-change')
  updateRule() {
    return this.editRule;
  }

  cancel() {
    this.closeModal();
  }

  ok() {
    this.updateRule();
    this.closeModal();
  }

  onVisibleChanged(visible: boolean) {
    if (!visible) {
      this.closeModal();
    }
  }

  onSelectorsChanged(values: Array<string>) {
    this.editRule.selectors = values;
    this.cssVal = css.stringify(this.ast);
  }

  onCssValBlur() {
    this.parseCss();
  }
}
</script>
