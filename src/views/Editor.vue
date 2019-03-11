<template>
  <div class="css-editor">
    <Row>
      <Form ref="formInline" :model="formInline"
        label-position="right" :label-width="100" inline>
        <FormItem prop="type" label="类型">
          <Select v-model="formInline.type" filterable
            @on-change="onTypeChanged">
            <Option v-for="item in types"
              :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem prop="selector" label="筛选器">
          <Input type="text" v-model="formInline.selector" placeholder="请输入"
            :disabled="formInline.type !== '' && formInline.type !== 'rule'">
          </Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit">查询</Button>
          <Button @click="handleReset">重置</Button>
        </FormItem>
        <FormItem>
        <Upload
            :before-upload="handleImport"
            :format="['css']"
            :accept="'text/css'"
            action="/">
            <Button type="info">导入</Button>
        </Upload>
          <Button type="warning" @click="handleExport">导出</Button>
        </FormItem>
      </Form>
    </Row>
    <Row>
      <Alert show-icon>已选{{ selections.length }}项</Alert>
    </Row>
    <Row>
      <Table border ref="selection" :columns="headers" :data="pageRules"
        @on-selection-change="onSelectionChanged">
        <template slot-scope="{ row, index }" slot="action">
            <Button type="text" size="small" @click="show(row, index)">编辑</Button>
            <Button type="text" size="small" @click="deleteItem(row)">删除</Button>
        </template>
        <template slot-scope="{ row }" slot="content">
            <span v-if="row.type === 'rule'">{{ declarations2str(row.declarations) }}</span>
            <span v-else-if="row.type === 'comment'">{{ row.comment }}</span>
            <span v-else-if="row.type === 'font-face'"
              >{{ declarations2str(row.declarations) }}</span>
        </template>
        <template slot-scope="{ row }" slot="selectors">
            <span v-if="row.type === 'rule'">{{ row.selectors }}</span>
            <span v-else-if="row.type === 'keyframes'">{{ row.name }}</span>
            <span v-else-if="row.type === 'media'">{{ row.media }}</span>
            <span v-else-if="row.type === 'document'"
              >{{ `@${row.vendor}document: ${row.document}` }}</span>
        </template>
        <template slot-scope="{ row }" slot="position">
            <span>start: {{ row.position.start }}</span><br/>
            <span>end: {{ row.position.end }}</span><br/>
            <span>lines: {{ row.position.end.line - row.position.start.line + 1 }}</span>
        </template>
      </Table>
    </Row>
    <Row type="flex" justify="end">
      <Page :current="pager.current" :total="rules.length"
        :page-size-opts="[10, 20, 50, 100]"
        show-total show-sizer show-elevator
        @on-change="onPageChanged"
        @on-page-size-change="onPageSizeChanged"/>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import css from 'css';

@Component
export default class CssEditor extends Vue {
  formInline = {
    type: '',
    selector: '',
  };

  headers = [
    {
      type: 'selection',
      width: 60,
      align: 'center',
    },
    {
      title: 'ID',
      key: 'rawIndex',
      width: 80,
    },
    {
      title: '类型',
      key: 'type',
      width: 120,
    },
    {
      title: '选择器',
      slot: 'selectors',
    },
    {
      title: '内容',
      slot: 'content',
    },
    {
      title: '位置',
      slot: 'position',
    },
    {
      title: '操作',
      slot: 'action',
      width: 150,
    },
  ];

  ast: any;

  rules: Array<any> = [];

  pageRules: Array<any> = [];

  types: Array<string> = [];

  selections: Array<any> = [];

  pager = {
    current: 1,
    pageSize: 10,
  };

  created() {
    this.parseCss('body {margin: 0;}');
  }

  declarations2str(declarations: Array<any>) {
    return declarations.map(item => ({
      property: item.property,
      value: item.value,
    }));
  }

  parseCss(content: string) {
    this.ast = css.parse(content);
    this.rules = this.ast.stylesheet.rules;
    this.rules.map((item: any, index: number) => {
      const res = item;
      res.rawIndex = index;
      return res;
    });
    const types = this.rules.map(item => item.type);
    this.types = [...new Set(types)];
    this.updatePageRules();
  }

  updatePageRules() {
    const end = this.pager.current * this.pager.pageSize;
    const start = end - this.pager.pageSize;
    this.pageRules = this.rules.slice(start, end);
  }

  handleSubmit() {
    const { type, selector } = this.formInline;
    this.rules = this.ast.stylesheet.rules;
    if (type) {
      this.rules = this.rules
        .filter(item => item.type === type);
    }
    if (selector && (type === '' || type === 'rule')) {
      this.rules = this.rules
        .filter((item) => {
          if (item.type !== 'rule') {
            return false;
          }

          const { selectors } = item;
          return selectors.some((s: string) => s.indexOf(selector) !== -1);
        });
    }
    this.updatePageRules();
  }

  handleReset() {
    this.formInline = {
      type: '',
      selector: '',
    };
    this.handleSubmit();
  }

  handleImport(file: File) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (evt: any) => {
      const content = evt.target.result;
      this.parseCss(content);
    };
    return false;
  }

  handleExport() {
    const str = css.stringify(this.ast);
    const name = 'output.css';
    const file = new File([str], name);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(file);
    link.charset = 'utf-8';
    link.download = name;
    link.click();
  }

  deleteItem(row: any) {
    this.$Modal.confirm({
      title: '警告',
      content: '是否要删除该条元素？',
      onOk: () => {
        const index = this.ast.stylesheet.rules
          .findIndex((item: any) => item.rawIndex === row.rawIndex);
        this.ast.stylesheet.rules.splice(index, 1);
        this.handleSubmit();
      },
    });
  }

  onTypeChanged() {
    this.handleSubmit();
  }

  onSelectionChanged(selections: Array<any>) {
    this.selections = selections;
  }

  onPageChanged(current: number) {
    this.pager.current = current;
    this.updatePageRules();
  }

  onPageSizeChanged(size: number) {
    this.pager.pageSize = size;
    this.updatePageRules();
  }
}
</script>

<style scoped>
.css-editor {
  margin: 30px;
}
</style>
