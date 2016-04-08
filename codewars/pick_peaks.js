/**
 * http://www.codewars.com/kata/pick-peaks/javascript
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-04-08T16:00:04+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-04-08T16:16:56+10:00
 */



function pickPeaks(arr) {
  var pos = [],
    peaks = []

  function assembleResult() {
    return {
      pos: pos,
      peaks: peaks
    }
  }

  if (arr.length < 3) {
    return assembleResult()
  }

  var cPos = -1

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > arr[i - 1]) {
      cPos = i
    } else if (arr[i] < arr[i - 1]) {
      if (cPos > 0) {
        // we found a peak
        pos.push(cPos)
        peaks.push(arr[cPos])
        cPos = -1
      }
    }
  }

  return assembleResult()
}
