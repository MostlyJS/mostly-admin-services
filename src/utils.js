import { each, get } from 'lodash';

export function sorter($sort) {
  return function (first, second) {
    let comparator = 0;
    each($sort, function (modifier, key) {
      modifier = parseInt(modifier, 10);

      let firstValue = get(first, key);
      let secondValue = get(second, key);
      if (firstValue < secondValue) {
        comparator -= 1 * modifier;
      }

      if (firstValue > secondValue) {
        comparator += 1 * modifier;
      }
    });
    return comparator;
  };
}