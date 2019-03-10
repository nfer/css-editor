<template>
  <div class="css-editor">
    <Row>
      <Form ref="formInline" :model="formInline"
        label-position="left" :label-width="100" inline>
        <FormItem prop="type" label="类型">
          <Input type="text" v-model="formInline.type" placeholder="请选择">
          </Input>
        </FormItem>
        <FormItem prop="selector" label="筛选器">
          <Input type="text" v-model="formInline.selector" placeholder="请输入">
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
      <Table border ref="selection" :columns="headers" :data="rules"
        @on-selection-change="onSelectionChanged">
        <template slot-scope="{ row, index }" slot="action">
            <Button type="text" size="small" @click="show(row)">编辑</Button>
            <Button type="text" size="small" @click="deleteItem(index)">删除</Button>
        </template>
        <template slot-scope="{ row }" slot="content">
            <span v-if="row.type === 'rule'">{{ declarations2str(row.declarations) }}</span>
            <span v-else-if="row.type === 'comment'">{{ row.comment }}</span>
        </template>
        <template slot-scope="{ row }" slot="position">
            <span>start: {{ row.position.start }}</span><br/>
            <span>end: {{ row.position.end }}</span>
        </template>
      </Table>
    </Row>
    <Row type="flex" justify="end">
      <Page :total="rules.length" show-total show-sizer show-elevator />
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
      title: '类型',
      key: 'type',
      width: 80,
    },
    {
      title: '选择器',
      key: 'selectors',
      width: 150,
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

  data1 = [
    {
      name: 'John Brown',
      age: 18,
      address: 'New York No. 1 Lake Park',
      date: '2016-10-03',
    },
    {
      name: 'Jim Green',
      age: 24,
      address: 'London No. 1 Lake Park',
      date: '2016-10-01',
    },
    {
      name: 'Joe Black',
      age: 30,
      address: 'Sydney No. 1 Lake Park',
      date: '2016-10-02',
    },
    {
      name: 'Jon Snow',
      age: 26,
      address: 'Ottawa No. 2 Lake Park',
      date: '2016-10-04',
    },
  ]

  ast: any;

  rules: Array<any> = [];

  selections: Array<any> = [];

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
  }

  handleSubmit() {

  }

  handleReset() {

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

  deleteItem(index: number) {
    this.$Modal.confirm({
      title: '警告',
      content: '是否要删除该条元素？',
      onOk: () => {
        this.rules.splice(index, 1);
      },
    });
  }

  onSelectionChanged(selections: Array<any>) {
    this.selections = selections;
  }
}
</script>

<style scoped>
.css-editor {
  margin: 30px;
}
</style>
