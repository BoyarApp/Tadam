import { createChecksum, createStatusChecksum } from '../../../src/plugins/phonepe/server/utils/signature';

describe('PhonePe signature helpers', () => {
  it('creates checksum for payload', () => {
    const result = createChecksum('eyJmb28iOiAiYmFyIn0=', '/pg/v1/pay', 'salt', 1);
    expect(result).toMatch(/###1$/);
    expect(result.split('###')[0]).toHaveLength(64);
  });

  it('creates checksum for status path', () => {
    const result = createStatusChecksum('/pg/v1/status/MERCHANT/MTX', 'salt', 3);
    expect(result).toBe(`${result.split('###')[0]}###3`);
    expect(result.split('###')[0]).toHaveLength(64);
  });
});
