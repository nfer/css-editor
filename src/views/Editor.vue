<template>
  <div class="css-editor">
    <Row>
      <Form ref="formInline" :model="formInline" :rules="ruleInline"
        label-position="left" :label-width="100" inline>
        <FormItem prop="selector" label="筛选器">
          <Input type="text" v-model="formInline.selector" placeholder="请输入">
          </Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit">查询</Button>
          <Button @click="handleReset">重置</Button>
        </FormItem>
      </Form>
    </Row>
    <Row>
      <Table border ref="selection" :columns="columns4" :data="data1"></Table>
    </Row>
    <Row type="flex" justify="end">
      <Page :total="100" show-total />
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class CssEditor extends Vue {
  @Prop() private msg!: string;

  formInline = {
    selector: '',
  };

  ruleInline = {
    selector: [
      { required: true, message: '请输入筛选器', trigger: 'blur' },
    ],
  };

  columns4 = [
    {
      type: 'selection',
      width: 60,
      align: 'center',
    },
    {
      title: 'Name',
      key: 'name',
    },
    {
      title: 'Age',
      key: 'age',
    },
    {
      title: 'Address',
      key: 'address',
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

  handleSubmit() {

  }

  handleReset() {

  }
}
</script>

<style scoped>
.css-editor {
  margin: 30px;
}
</style>
