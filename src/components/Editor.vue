<template>
  <div>
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
      <Col span="24" style="text-align: right;">
        <Page :current="pager.current" :total="list.length"
          :page-size-opts="[10, 20, 50, 100]"
          show-total show-sizer show-elevator
          @on-change="onPageChanged"
          @on-page-size-change="onPageSizeChanged"/>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Emit, Vue,
} from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class CssEditor extends Vue {
  @Prop() readonly list!: Array<any>;

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

  selections: Array<any> = [];

  pager = {
    current: 1,
    pageSize: 10,
  };

  declarations2str(declarations: Array<any>) {
    return declarations.map(item => ({
      property: item.property,
      value: item.value,
    }));
  }

  onSelectionChanged(selections: Array<any>) {
    this.selections = selections;
  }

  onPageChanged(current: number) {
    this.pager.current = current;
    this.emitPagerChanged();
  }

  onPageSizeChanged(size: number) {
    this.pager.pageSize = size;
    this.emitPagerChanged();
  }

  @Emit('on-operation')
  emitPagerChanged() {
    return {
      type: 'pager-changed',
      data: this.pager,
    };
  }
}
</script>
