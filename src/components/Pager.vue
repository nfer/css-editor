<template>
  <Row span="24" style="text-align: right;">
    <Page :current="current" :total="total"
      :page-size-opts="[10, 20, 50, 100]"
      show-total show-sizer show-elevator
      @on-change="onPageChanged"
      @on-page-size-change="onPageSizeChanged"/>
  </Row>
</template>

<script lang="ts">
import {
  Component, Prop, Emit, Vue,
} from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class Pager extends Vue {
  @Prop() readonly total!: number;

  @Prop() readonly current!: number;

  pager = {
    current: 1,
    pageSize: 10,
  };

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
