/**
 * http://www.codewars.com/kata/reverse-polish-notation-calculator/javascript
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-04-08T16:18:21+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-04-08T17:00:07+10:00
 */



function calc(expr) {
  var input = expr.split(" ")
  var stack = []

  for (var i = 0; i < input.length; i++) {
    var c = input[i]

    if (c === "") {
      continue
    }

    var cNum = parseFloat(c)

    if (!isNaN(cNum)) {
      stack.push(cNum)
    } else {
      var o2 = stack.pop()
      var o1 = stack.pop()
      stack.push(eval(`${o1}${c}${o2}`))
    }
  }

  return stack.pop() || 0;
}
