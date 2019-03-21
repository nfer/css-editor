<template>
  <div class="css-editor">
    <Row>
      <Form ref="formInline" :model="formInline"
        label-position="right" :label-width="100" inline>
        <FormItem prop="type" label="类型">
          <Select v-model="formInline.type" filterable
            @on-change="onTypeChanged">
            <Option v-for="item in getTypes()"
              :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem prop="selector" label="筛选器">
          <Input type="text" v-model="formInline.selector" placeholder="请输入"
            :disabled="disableSelector()">
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
      <Table border ref="selection" :columns="headers" :data="list"
        disabled-hover
        @on-selection-change="onSelectionChanged">
        <template slot-scope="{ row }" slot="action">
            <Button type="text" size="small" @click="editItem(row)"
              :disabled="row.type !== 'rule'">编辑</Button>
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
    <Row>
      <Col span="8">
        <Button type="error" @click="deleteBatch">批量删除</Button>
      </Col>
      <Col span="16" style="text-align: right;">
        <Page
          :current="pager.current" :total="getTotal()"
          :page-size-opts="[10, 20, 50, 100]"
          show-total show-sizer show-elevator
          @on-change="onPageChanged"
          @on-page-size-change="onPageSizeChanged"/>
      </Col>
    </Row>
    <EditFormModal :show="show" :rule="editRule"
      @modal-close="show = false"
      @on-rule-change="onRuleChanged"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import css from 'css';
import forkMe from 'fork-me-github';

import EditFormModal from '@/components/EditFormModal.vue';
import CssEngine from './cssEngine';


@Component({
  components: {
    EditFormModal,
  },
})
export default class CssEditor extends Vue {
  formInline = {
    type: '',
    selector: '',
  };

  show = false;

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

  list: Array<any> = [];

  selections: Array<any> = [];

  editRule = {
    declarations: [],
    selectors: [],
  };

  pager = {
    current: 1,
    pageSize: 10,
  };

  engine: any;

  disableSelector() {
    return this.formInline.type ? this.formInline.type !== 'rule' : false;
  }

  getTotal() {
    return this.engine ? this.engine.getTotal() : [];
  }

  getTypes() {
    return this.engine ? this.engine.getTypes() : [];
  }

  created() {
    this.engine = new CssEngine();
    this.engine.parse('html, body {margin: 0;}');
    this.getList();

    forkMe('https://github.com/nfer/css-editor', {
      background: 'gray',
    });
  }

  getList() {
    const param = {
      type: this.formInline.type,
      selector: this.formInline.selector,
    };
    this.list = this.engine.getList(this.pager, param);
  }

  declarations2str(declarations: Array<any>) {
    return declarations.map(item => ({
      property: item.property,
      value: item.value,
    }));
  }

  handleSubmit() {
    this.getList();
  }

  handleReset() {
    const form: any = this.$refs.formInline;
    form.resetFields();

    this.getList();
  }

  handleImport(file: File) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (evt: any) => {
      const content = evt.target.result;
      this.engine.parse(content);
      this.getList();
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

  editItem(row: any) {
    this.show = true;
    this.editRule = row;
  }

  deleteItem(rule: any) {
    this.$Modal.confirm({
      title: '警告',
      content: '是否要删除该条元素？',
      onOk: () => {
        let index = rule.rawIndex;
        if (this.ast.stylesheet.rules[index].rawIndex !== index) {
          index = this.ast.stylesheet.rules
            .findIndex((item: any) => item.rawIndex === rule.rawIndex);
        }
        this.ast.stylesheet.rules.splice(index, 1);
        this.handleSubmit();
      },
    });
  }

  deleteBatch() {
    if (!this.selections.length) {
      return;
    }

    this.$Modal.confirm({
      title: '警告',
      content: '是否要批量删除选中元素？',
      onOk: () => {
        this.selections.forEach((rule: any) => {
          const index = this.ast.stylesheet.rules
            .findIndex((item: any) => item.rawIndex === rule.rawIndex);
          this.ast.stylesheet.rules.splice(index, 1);
        });
        this.selections = [];
        this.handleSubmit();
      },
    });
  }

  onTypeChanged() {
    this.getList();
  }

  onSelectionChanged(selections: Array<any>) {
    this.selections = selections;
  }

  onPageChanged(current: number) {
    this.pager.current = current;
    this.getList();
  }

  onPageSizeChanged(size: number) {
    this.pager.pageSize = size;
    this.getList();
  }

  onRuleChanged(rule: any) {
    const index = this.ast.stylesheet.rules
      .findIndex((item: any) => item.rawIndex === rule.rawIndex);
    if (index !== -1) {
      this.ast.stylesheet.rules.splice(index, 1, rule);
      this.handleSubmit();
    }
  }
}
</script>

<style scoped>
.css-editor {
  margin: 30px;
}
</style>
