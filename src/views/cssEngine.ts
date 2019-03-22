import css from 'css';

export default class CssEngine {
  ast: any;

  rules: Array<any> = [];

  types: Array<string> = [];

  parse(content: string) {
    this.ast = css.parse(content);
    this.rules = this.ast.stylesheet.rules;
    this.rules.map((item: any, index: number) => {
      const res = item;
      res.rawIndex = index;
      return res;
    });

    const types = this.rules.map(item => item.type);
    this.types = [...new Set(types)];
  }

  stringify() {
    const str = css.stringify(this.ast);
    return str;
  }

  getList(pager: any, param: any) {
    let { rules } = this;
    const { type, selector } = param;

    if (type) {
      rules = rules.filter(item => item.type === type);
    }

    if (selector && (!type || type === 'rule')) {
      rules = rules.filter((item) => {
        if (item.type !== 'rule') {
          return false;
        }

        const { selectors } = item;
        return selectors.some((s: string) => s.indexOf(selector) !== -1);
      });
    }

    const end = pager.current * pager.pageSize;
    const start = end - pager.pageSize;
    const list = rules.slice(start, end);
    return list;
  }

  delete(rawIndex: number) {
    let index = rawIndex;
    if (this.ast.stylesheet.rules[index].rawIndex !== index) {
      index = this.ast.stylesheet.rules
        .findIndex((item: any) => item.rawIndex === rawIndex);
    }
    this.ast.stylesheet.rules.splice(index, 1);

    const types = this.rules.map(item => item.type);
    this.types = [...new Set(types)];
  }

  deleteBatch(rawIndexs: Array<number>) {
    rawIndexs.forEach((rawIndex: number) => {
      const index = this.ast.stylesheet.rules
        .findIndex((item: any) => item.rawIndex === rawIndex);
      this.ast.stylesheet.rules.splice(index, 1);
    });

    const types = this.rules.map(item => item.type);
    this.types = [...new Set(types)];
  }

  getTotal() {
    return this.rules.length;
  }

  getTypes() {
    return this.types;
  }
}
