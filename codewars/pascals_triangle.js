/**
 * http://www.codewars.com/kata/pascals-triangle/javascript
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-04-08T15:56:18+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-04-08T15:56:54+10:00
 */



function pascalsTriangle(n) {
  var result = []
  for (var i = 1; i <= n; i++) {
    for (var j = 0; j < i; j++) {
      if (j === 0 || j === i - 1) {
        result.push(1)
      } else {
        result.push(result[result.length - i] + result[result.length - i + 1])
      }
    }
  }
  return result
}
