import crypto from 'node:crypto';

export const createChecksum = (payloadBase64: string, endpoint: string, saltKey: string, saltIndex: string | number) => {
  const hash = crypto.createHash('sha256').update(`${payloadBase64}${endpoint}${saltKey}`).digest('hex');
  return `${hash}###${saltIndex}`;
};

export const createStatusChecksum = (endpoint: string, saltKey: string, saltIndex: string | number) => {
  const hash = crypto.createHash('sha256').update(`${endpoint}${saltKey}`).digest('hex');
  return `${hash}###${saltIndex}`;
};
