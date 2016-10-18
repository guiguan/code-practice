/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-04-08T18:07:41+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-04-09T17:40:38+10:00
 */



snail = function(array) {
  var n = array.length

  if (n === 1 && array[0].length === 0) return []

  // create a 2D boolean map
  var map = new Array(n)
  for (var i = 0; i < n; i++) {
    var temp = new Array(n)
    for (var j = 0; j < n; j++) {
      temp[j] = false
    }
    map[i] = temp
  }

  var result = []
  var i = 0,
    j = -1,
    d = 0 // 0 right, 1 down, 2 left, 3 up

  while (true) {
    var isOkay = false
    for (var k = 0; k < 4; k++) {
      switch ((d + k) % 4) {
        case 0:
          // check right
          if (j + 1 < n && !map[i][j + 1]) {
            j++
            d = 0
            isOkay = true
          }
          break;
        case 1:
          // check down
          if (i + 1 < n && !map[i + 1][j]) {
            i++
            d = 1
            isOkay = true
          }
          break;
        case 2:
          // check left
          if (j - 1 >= 0 && !map[i][j - 1]) {
            j--
            d = 2
            isOkay = true
          }
          break;
        case 3:
          // check up
          if (i - 1 >= 0 && !map[i - 1][j]) {
            i--
            d = 3
            isOkay = true
          }
          break;
      }
      if (isOkay) break;
    }
    if (!isOkay) break; // we have reached the end
    result.push(array[i][j])
    map[i][j] = true
  }

  return result
}

array = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25]
]
console.log(JSON.stringify(array), JSON.stringify(snail(array)))
