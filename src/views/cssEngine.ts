import css from 'css';

export default class CssEngine {
  ast: any;

  rules: Array<any> = [];

  parse(content: string) {
    this.ast = css.parse(content);
    this.rules = this.ast.stylesheet.rules;
    this.rules.map((item: any, index: number) => {
      const res = item;
      res.rawIndex = index;
      return res;
    });
  }

  getList(pager: any) {
    const end = pager.current * pager.pageSize;
    const start = end - pager.pageSize;
    const list = this.rules.slice(start, end);
    return list;
  }
}
