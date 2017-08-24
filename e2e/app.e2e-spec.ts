import { CarmatchPage } from './app.po';

describe('carmatch App', () => {
  let page: CarmatchPage;

  beforeEach(() => {
    page = new CarmatchPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
