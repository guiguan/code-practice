/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-10-18T17:42:19+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-10-18T18:51:32+11:00
 */

import _ from 'lodash';

const store = {};
const stats = {
  totalCounts: 0
};

export function countChange(money, coins) {
  const [head,
    ...rest] = coins;
  if (money === 0) {
    return 1;
  }
  if (head === undefined) {
    return 0;
  }
  stats.totalCounts += 1;
  const storeKey = `${money}-${coins.toString()}`;
  const storeValue = store[storeKey];
  if (storeValue !== undefined) {
    const statCount = stats[storeKey];
    stats[storeKey] = statCount
      ? statCount + 1
      : 1;
    return storeValue;
  }
  let count = 0;
  for (let num = Math.floor(money / head); num >= 0; --num) {
    const rem = money - (num * head);
    count += countChange(rem, rest);
  }
  store[storeKey] = count;
  return count;
}

console.log(countChange(128, [10, 5, 2, 1]));

console.log('Stats:\n\ttotal cache hits: %d\n\tcache hit ratio: %d%%', _.keys(stats).length, ((_.keys(stats).length / stats.totalCounts) * 100).toFixed(2));
