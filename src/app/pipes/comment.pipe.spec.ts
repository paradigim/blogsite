import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  it('create an instance', () => {
    const pipe = new CommentPipe();
    expect(pipe).toBeTruthy();
  });
});
