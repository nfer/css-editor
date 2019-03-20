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

  getList(pager: any) {
    const end = pager.current * pager.pageSize;
    const start = end - pager.pageSize;
    const list = this.rules.slice(start, end);
    return list;
  }

  getTypes() {
    return this.types;
  }
}