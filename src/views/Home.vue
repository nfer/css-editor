<template>
  <div>
    <FileOperate
      @on-operation="onOperation"/>
    <SearchForm
      @on-operation="onOperation"/>
    <Editor :list="list"/>
    <Pager :current="pager.current" :total="total"
      @on-operation="onOperation"/>
    <ForkMe />
    <ExportFormModal :show="showExportModal"
      @on-operation="onOperation"/>
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
import ExportFormModal from '@/components/ExportFormModal.vue';

@Component({
  components: {
    FileOperate,
    SearchForm,
    Editor,
    Pager,
    ForkMe,
    ExportFormModal,
  },
})
export default class Home extends Vue {
  search: any;

  ast: any;

  rules: Array<any> = [];

  total = 0;

  list: Array<any> = [];

  pager = {
    current: 1,
    pageSize: 10,
  };

  showExportModal = false;

  created() {
    this.parseCss(`
      html, body {margin: 0;}
      p {margin: 0;}
      @media (max-width: 1200px) {
        body {margin: 10px;}
        p {margin: 10px;}
      }
      img {margin: 0;}
    `);
  }

  parseCss(content: string) {
    this.ast = css.parse(content);
    const { rules } = this.ast.stylesheet;

    const medias: Array<any> = [];

    let index = 0;
    rules.forEach((item: any) => {
      if (item.type === 'rule') {
        let media = medias[index];
        if (!media) {
          media = {
            type: 'media',
            rules: [],
            media: '',
          };
          media.rules.push(item);
          medias.push(media);
        } else {
          media.rules.push(item);
        }
      } else if (item.type === 'media') {
        medias.push({
          type: item.type,
          rules: item.rules,
          media: item.media,
        });
        index += 2;
      }
    });

    this.rules = medias
      .reduce((prev, curr) => prev.concat(curr.rules), [])
      .map((item: any, idx: number) => {
        const rule = item;
        rule.rawIndex = idx;
        if (item.parent && item.parent.type === 'media') {
          rule.type = 'media';
          rule.media = item.parent.media;
          delete rule.parent;
        }
        return rule;
      });

    this.loadData();
  }

  filterData() {
    const selector = this.search && this.search.selector;
    let { rules } = this;
    if (selector) {
      rules = rules
        .filter((item: any) => {
          if (item.type === 'rule' || item.type === 'media') {
            const { selectors } = item;
            return selectors.some((s: string) => s.indexOf(selector) !== -1);
          }

          return false;
        });
    }
    return rules;
  }

  loadData() {
    const rules = this.filterData();

    this.total = rules.length;

    const end = this.pager.current * this.pager.pageSize;
    const start = end - this.pager.pageSize;
    this.list = rules.slice(start, end);
  }

  tableRules2parseRules(rules: Array<any>) {
    const arr: Array<any> = [];
    let media: any;
    rules.forEach((item: any, idx: number) => {
      if (item.type === 'rule') {
        arr.push(item);
        media = undefined;
      } else if (item.type === 'media') {
        if (!media || media.media !== item.media) {
          media = {
            type: 'media',
            rules: [],
            media: item.media,
          };
          arr.push(media);
        }
        /* eslint-disable no-param-reassign */
        item.type = 'rule';
        delete item.media;
        /* eslint-enable no-param-reassign */
        media.rules.push(item);
      }
    });
    return arr;
  }

  handleExport(fileName: string) {
    const rules = this.filterData();
    const outputRules = this.tableRules2parseRules(rules);

    const ast = {
      type: 'stylesheet',
      stylesheet: {
        rules: outputRules,
        parsingErrors: [],
      },
    };
    const str = css.stringify(ast);
    const file = new File([str], fileName);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(file);
    link.charset = 'utf-8';
    link.download = fileName;
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
        this.handleExport(data.fileName);
        break;

      case 'show-export-modal':
        this.showExportModal = data;
        break;

      default:
        break;
    }
  }
}
</script>
