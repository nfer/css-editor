<template>
  <Row>
    <Form :model="formInline"
      label-position="right" :label-width="100" inline>
      <FormItem prop="selector" label="筛选器">
        <Input type="text" v-model="formInline.selector" placeholder="请输入">
        </Input>
      </FormItem>
      <FormItem label="匹配模式">
        <RadioGroup v-model="formInline.mode">
          <Radio label="fuzzy">模糊匹配</Radio>
          <Radio label="exact">精确匹配</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSubmit">查询</Button>
        <Button @click="handleReset">重置</Button>
      </FormItem>
    </Form>
  </Row>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class SearchForm extends Vue {
  initForm = {
    selector: '',
    mode: 'fuzzy',
  };

  formInline = { ...this.initForm };

  @Emit('on-operation')
  emitSearch(search: any) {
    return {
      type: 'search',
      data: search,
    };
  }

  handleSubmit() {
    this.emitSearch(this.formInline);
  }

  handleReset() {
    this.formInline = { ...this.initForm };
    this.handleSubmit();
  }
}
</script>
