import _ from 'lodash';

export const sanitizeEntityInput = (value: unknown) => {
  if (_.isPlainObject(value)) {
    return _(value as Record<string, unknown>)
      .omitBy((val) => typeof val === 'undefined')
      .value();
  }

  return value;
};
