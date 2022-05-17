import { GetUserNamePipe } from './get-user-name.pipe';

describe('GetUserNamePipe', () => {
  it('create an instance', () => {
    const pipe = new GetUserNamePipe();
    expect(pipe).toBeTruthy();
  });
});
