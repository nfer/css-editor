<template>
  <div>
    <FileOperate
      @on-operation="onOperation"/>
    <SearchForm
      @on-operation="onOperation"/>
    <Editor :list="list"/>
    <Pager :current="pager.current" :total="rules.length"
      @on-operation="onOperation"/>
    <ForkMe />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import css from 'css';

import FileOperate from '@/components/FileOperate.vue';
import SearchForm from '@/components/SearchForm.vue';
import Editor from '@/components/Editor.vue';
import Pager from '@/components/Pager.vue';
import ForkMe from '@/components/ForkMe.vue';

@Component({
  components: {
    FileOperate,
    SearchForm,
    Editor,
    Pager,
    ForkMe,
  },
})
export default class Home extends Vue {
  search: any;

  ast: any;

  rules: Array<any> = [];

  medias: Array<any> = [];

  list: Array<any> = [];

  pager = {
    current: 1,
    pageSize: 10,
  };

  created() {
    this.parseCss(`
      html, body {margin: 0;}
      p {margin: 0;}
      @media (max-width: 1200px) {
        body {margin: 10px;}, p {margin: 10px;}
      }
      img {margin: 0;}
    `);
  }

  parseCss(content: string) {
    this.ast = css.parse(content);
    this.rules = this.ast.stylesheet.rules;
    this.rules.map((item: any, index: number) => {
      const res = item;
      res.rawIndex = index;
      return res;
    });

    let index = 0;
    this.rules.forEach((item: any) => {
      if (item.type === 'rule') {
        let media = this.medias[index];
        if (!media) {
          media = {
            type: 'media',
            rules: [],
            media: '',
          };
          media.rules.push(item);
          this.medias.push(media);
        } else {
          media.rules.push(item);
        }
      } else if (item.type === 'media') {
        this.medias.push({
          type: item.type,
          rules: item.rules,
          media: item.media,
        });
        index += 2;
      }
    });

    this.updatePageRules();
  }

  updatePageRules() {
    const end = this.pager.current * this.pager.pageSize;
    const start = end - this.pager.pageSize;
    this.list = this.rules.slice(start, end);
  }

  loadData() {
    const selector = this.search && this.search.selector;
    this.rules = this.ast.stylesheet.rules;
    if (selector) {
      this.rules = this.rules
        .filter((item: any) => {
          if (item.type === 'rule') {
            const { selectors } = item;
            return selectors.some((s: string) => s.indexOf(selector) !== -1);
          }

          return false;
        });
    }
    this.updatePageRules();
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

  onOperation(operation: any) {
    const { type, data } = operation;
    switch (type) {
      case 'search':
        this.search = { ...data };
        this.loadData();
        break;

      case 'pager-changed':
        this.pager = { ...data };
        this.loadData();
        break;

      case 'import':
        this.parseCss(data);
        break;

      case 'export':
        this.handleExport();
        break;

      default:
        break;
    }
  }
}
</script>
