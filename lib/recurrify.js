'use strict'

var recurrify = {}
recurrify.array = {}
/**
 * Sorts an array in natural ascending order, placing zero at the end
 * if zeroIsLast is true.
 */
recurrify.array.sort = function (arr, zeroIsLast) {
  arr.sort(function (a, b) {
    return +a - +b
  })

  if (zeroIsLast && arr[0] === 0) {
    arr.push(arr.shift())
  }
}
/**
 * Returns the next valid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 */
recurrify.array.next = function (val, values, extent) {
  var cur

  var zeroIsLargest = extent[0] !== 0

  var nextIdx = 0

  for (var i = values.length - 1; i > -1; --i) {
    cur = values[i]

    if (cur === val) {
      return cur
    }

    if (cur > val || (cur === 0 && zeroIsLargest && extent[1] > val)) {
      nextIdx = i
      continue
    }

    break
  }

  return values[nextIdx]
}
/**
 * Returns the next invalid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 */
recurrify.array.nextInvalid = function (val, values, extent) {
  var min = extent[0]; var max = extent[1]; var len = values.length

  var zeroVal = values[len - 1] === 0 && min !== 0 ? max : 0

  var next = val

  var i = values.indexOf(val)

  var start = next

  while (next === (values[i] || zeroVal)) {
    next++
    if (next > max) {
      next = min
    }

    i++
    if (i === len) {
      i = 0
    }

    if (next === start) {
      return undefined
    }
  }

  return next
}
/**
 * Returns the previous valid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 */
recurrify.array.prev = function (val, values, extent) {
  var cur; var len = values.length

  var zeroIsLargest = extent[0] !== 0

  var prevIdx = len - 1

  for (var i = 0; i < len; i++) {
    cur = values[i]

    if (cur === val) {
      return cur
    }

    if (cur < val || (cur === 0 && zeroIsLargest && extent[1] < val)) {
      prevIdx = i
      continue
    }

    break
  }

  return values[prevIdx]
}
/**
 * Returns the previous invalid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 */
recurrify.array.prevInvalid = function (val, values, extent) {
  var min = extent[0]; var max = extent[1]; var len = values.length

  var zeroVal = values[len - 1] === 0 && min !== 0 ? max : 0

  var next = val

  var i = values.indexOf(val)

  var start = next

  while (next === (values[i] || zeroVal)) {
    next--

    if (next < min) {
      next = max
    }

    i--
    if (i === -1) {
      i = len - 1
    }

    if (next === start) {
      return undefined
    }
  }

  return next
}
/**
 * Definition for a day of month (date) constraint type.
 */
recurrify.day = recurrify.D = {

  /**
   * The name of this constraint.
   */
  name: 'day',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 86400,

  /**
   * The day value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.D || (d.D = recurrify.date.getDate.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.D.val(d) === (val || recurrify.D.extent(d)[1])
  },

  /**
   * The minimum and maximum valid day values of the month specified.
   * Zero to specify the last day of the month.
   *
   * @param {Date} d: The date indicating the month to find the extent of
   */
  extent: function (d) {
    if (d.DExtent) return d.DExtent

    var month = recurrify.M.val(d)

    var max = recurrify.DAYS_IN_MONTH[month - 1]

    if (month === 2 && recurrify.dy.extent(d)[1] === 366) {
      max = max + 1
    }

    return (d.DExtent = [1, max])
  },

  /**
   * The start of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.DStart || (d.DStart = recurrify.date.next(
      recurrify.Y.val(d), recurrify.M.val(d), recurrify.D.val(d)))
  },

  /**
   * The end of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.DEnd || (d.DEnd = recurrify.date.prev(
      recurrify.Y.val(d), recurrify.M.val(d), recurrify.D.val(d)))
  },

  /**
   * Returns the start of the next instance of the day value indicated. Returns
   * the first day of the next month if val is greater than the number of
   * days in the following month.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > recurrify.D.extent(d)[1] ? 1 : val
    var month = recurrify.date.nextRollover(d, val, recurrify.D, recurrify.M)

    var DMax = recurrify.D.extent(month)[1]

    val = val > DMax ? 1 : val || DMax

    return recurrify.date.next(
      recurrify.Y.val(month),
      recurrify.M.val(month),
      val
    )
  },

  /**
   * Returns the end of the previous instance of the day value indicated. Returns
   * the last day in the previous month if val is greater than the number of days
   * in the previous month.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    var month = recurrify.date.prevRollover(d, val, recurrify.D, recurrify.M)

    var DMax = recurrify.D.extent(month)[1]

    return recurrify.date.prev(
      recurrify.Y.val(month),
      recurrify.M.val(month),
      val > DMax ? DMax : val || DMax
    )
  }

}
/**
 * Definition for a day of week count constraint type. This constraint is used
 * to specify recurrences like '2nd Tuesday of every month'.
 */
recurrify.dayOfWeekCount = recurrify.dc = {

  /**
   * The name of this constraint.
   */
  name: 'day of week count',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 604800,

  /**
   * The day of week count value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.dc || (d.dc = Math.floor((recurrify.D.val(d) - 1) / 7) + 1)
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return (recurrify.dc.val(d) === val) ||
      (val === 0 && recurrify.D.val(d) > recurrify.D.extent(d)[1] - 7)
  },

  /**
   * The minimum and maximum valid day values of the month specified.
   * Zero to specify the last day of week count of the month.
   *
   * @param {Date} d: The date indicating the month to find the extent of
   */
  extent: function (d) {
    return d.dcExtent || (d.dcExtent = [1, Math.ceil(recurrify.D.extent(d)[1] / 7)])
  },

  /**
   * The first day of the month with the same day of week count as the date
   * specified.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.dcStart || (d.dcStart =
      recurrify.date.next(
        recurrify.Y.val(d),
        recurrify.M.val(d),
        Math.max(1, ((recurrify.dc.val(d) - 1) * 7) + 1 || 1)))
  },

  /**
   * The last day of the month with the same day of week count as the date
   * specified.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.dcEnd || (d.dcEnd =
      recurrify.date.prev(
        recurrify.Y.val(d),
        recurrify.M.val(d),
        Math.min(recurrify.dc.val(d) * 7, recurrify.D.extent(d)[1])))
  },

  /**
   * Returns the next earliest date with the day of week count specified.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > recurrify.dc.extent(d)[1] ? 1 : val
    var month = recurrify.date.nextRollover(d, val, recurrify.dc, recurrify.M)

    var dcMax = recurrify.dc.extent(month)[1]

    val = val > dcMax ? 1 : val

    var next = recurrify.date.next(
      recurrify.Y.val(month),
      recurrify.M.val(month),
      val === 0 ? recurrify.D.extent(month)[1] - 6 : 1 + (7 * (val - 1))
    )

    if (next.getTime() <= d.getTime()) {
      month = recurrify.M.next(d, recurrify.M.val(d) + 1)

      return recurrify.date.next(
        recurrify.Y.val(month),
        recurrify.M.val(month),
        val === 0 ? recurrify.D.extent(month)[1] - 6 : 1 + (7 * (val - 1))
      )
    }

    return next
  },

  /**
   * Returns the closest previous date with the day of week count specified.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    var month = recurrify.date.prevRollover(d, val, recurrify.dc, recurrify.M)

    var dcMax = recurrify.dc.extent(month)[1]

    val = val > dcMax ? dcMax : val || dcMax

    return recurrify.dc.end(recurrify.date.prev(
      recurrify.Y.val(month),
      recurrify.M.val(month),
      1 + (7 * (val - 1))
    ))
  }

}
/**
 * Definition for a day of week constraint type.
 */
recurrify.dayOfWeek = recurrify.dw = recurrify.d = {

  /**
   * The name of this constraint.
   */
  name: 'day of week',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 86400,

  /**
   * The day of week value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.dw || (d.dw = recurrify.date.getDay.call(d) + 1)
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.dw.val(d) === (val || 7)
  },

  /**
   * The minimum and maximum valid day of week values. Unlike the standard
   * Date object, recurrify day of week goes from 1 to 7.
   */
  extent: function () {
    return [1, 7]
  },

  /**
   * The start of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return recurrify.D.start(d)
  },

  /**
   * The end of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return recurrify.D.end(d)
  },

  /**
   * Returns the start of the next instance of the day of week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > 7 ? 1 : val || 7

    return recurrify.date.next(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      recurrify.D.val(d) + (val - recurrify.dw.val(d)) + (val <= recurrify.dw.val(d) ? 7 : 0))
  },

  /**
   * Returns the end of the previous instance of the day of week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    val = val > 7 ? 7 : val || 7

    return recurrify.date.prev(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      recurrify.D.val(d) + (val - recurrify.dw.val(d)) + (val >= recurrify.dw.val(d) ? -7 : 0))
  }
}
/**
 * Definition for a day of year constraint type.
 */
recurrify.dayOfYear = recurrify.dy = {

  /**
   * The name of this constraint.
   */
  name: 'day of year',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 86400,

  /**
   * The day of year value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.dy || (d.dy =
      Math.ceil(1 + (recurrify.D.start(d).getTime() - recurrify.Y.start(d).getTime()) / recurrify.DAY))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.dy.val(d) === (val || recurrify.dy.extent(d)[1])
  },

  /**
   * The minimum and maximum valid day of year values of the month specified.
   * Zero indicates the last day of the year.
   *
   * @param {Date} d: The date indicating the month to find the extent of
   */
  extent: function (d) {
    var year = recurrify.Y.val(d)

    // shortcut on finding leap years since this function gets called a lot
    // works between 1901 and 2099
    return d.dyExtent || (d.dyExtent = [1, year % 4 ? 365 : 366])
  },

  /**
   * The start of the day of year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return recurrify.D.start(d)
  },

  /**
   * The end of the day of year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return recurrify.D.end(d)
  },

  /**
   * Returns the start of the next instance of the day of year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > recurrify.dy.extent(d)[1] ? 1 : val
    var year = recurrify.date.nextRollover(d, val, recurrify.dy, recurrify.Y)

    var dyMax = recurrify.dy.extent(year)[1]

    val = val > dyMax ? 1 : val || dyMax

    return recurrify.date.next(
      recurrify.Y.val(year),
      recurrify.M.val(year),
      val
    )
  },

  /**
   * Returns the end of the previous instance of the day of year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    var year = recurrify.date.prevRollover(d, val, recurrify.dy, recurrify.Y)

    var dyMax = recurrify.dy.extent(year)[1]

    val = val > dyMax ? dyMax : val || dyMax

    return recurrify.date.prev(
      recurrify.Y.val(year),
      recurrify.M.val(year),
      val
    )
  }

}
/**
 * Definition for a hour constraint type.
 */
recurrify.hour = recurrify.h = {

  /**
   * The name of this constraint.
   */
  name: 'hour',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 3600,

  /**
   * The hour value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.h || (d.h = recurrify.date.getHour.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.h.val(d) === val
  },

  /**
   * The minimum and maximum valid hour values.
   */
  extent: function () {
    return [0, 23]
  },

  /**
   * The start of the hour of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.hStart || (d.hStart = recurrify.date.next(
      recurrify.Y.val(d), recurrify.M.val(d), recurrify.D.val(d), recurrify.h.val(d)))
  },

  /**
   * The end of the hour of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.hEnd || (d.hEnd = recurrify.date.prev(
      recurrify.Y.val(d), recurrify.M.val(d), recurrify.D.val(d), recurrify.h.val(d)))
  },

  /**
   * Returns the start of the next instance of the hour value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > 23 ? 0 : val

    var next = recurrify.date.next(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      recurrify.D.val(d) + (val <= recurrify.h.val(d) ? 1 : 0),
      val)

    // correct for passing over a daylight savings boundry
    if (!recurrify.date.isUTC && next.getTime() <= d.getTime()) {
      next = recurrify.date.next(
        recurrify.Y.val(next),
        recurrify.M.val(next),
        recurrify.D.val(next),
        val + 1)
    }

    return next
  },

  /**
   * Returns the end of the previous instance of the hour value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    val = val > 23 ? 23 : val

    return recurrify.date.prev(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      recurrify.D.val(d) + (val >= recurrify.h.val(d) ? -1 : 0),
      val)
  }

}
/**
 * Definition for a minute constraint type.
 */
recurrify.minute = recurrify.m = {

  /**
   * The name of this constraint.
   */
  name: 'minute',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 60,

  /**
   * The minute value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.m || (d.m = recurrify.date.getMin.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.m.val(d) === val
  },

  /**
   * The minimum and maximum valid minute values.
   */
  extent: function (d) {
    return [0, 59]
  },

  /**
   * The start of the minute of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.mStart || (d.mStart = recurrify.date.next(
      recurrify.Y.val(d), recurrify.M.val(d), recurrify.D.val(d), recurrify.h.val(d), recurrify.m.val(d)))
  },

  /**
   * The end of the minute of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.mEnd || (d.mEnd = recurrify.date.prev(
      recurrify.Y.val(d), recurrify.M.val(d), recurrify.D.val(d), recurrify.h.val(d), recurrify.m.val(d)))
  },

  /**
   * Returns the start of the next instance of the minute value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    var m = recurrify.m.val(d)

    var s = recurrify.s.val(d)

    var inc = val > 59 ? 60 - m : (val <= m ? (60 - m) + val : val - m)

    var next = new Date(d.getTime() + (inc * recurrify.MIN) - (s * recurrify.SEC))

    // correct for passing over a daylight savings boundry
    if (!recurrify.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + ((inc + 120) * recurrify.MIN) - (s * recurrify.SEC))
    }

    return next
  },

  /**
   * Returns the end of the previous instance of the minute value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    val = val > 59 ? 59 : val

    return recurrify.date.prev(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      recurrify.D.val(d),
      recurrify.h.val(d) + (val >= recurrify.m.val(d) ? -1 : 0),
      val)
  }

}
/**
 * Definition for a month constraint type.
 */
recurrify.month = recurrify.M = {

  /**
   * The name of this constraint.
   */
  name: 'month',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 2629740,

  /**
   * The month value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.M || (d.M = recurrify.date.getMonth.call(d) + 1)
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.M.val(d) === (val || 12)
  },

  /**
   * The minimum and maximum valid month values. Unlike the native date object,
   * month values in recurrify are 1 based.
   */
  extent: function () {
    return [1, 12]
  },

  /**
   * The start of the month of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.MStart || (d.MStart = recurrify.date.next(recurrify.Y.val(d), recurrify.M.val(d)))
  },

  /**
   * The end of the month of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.MEnd || (d.MEnd = recurrify.date.prev(recurrify.Y.val(d), recurrify.M.val(d)))
  },

  /**
   * Returns the start of the next instance of the month value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > 12 ? 1 : val || 12

    return recurrify.date.next(
      recurrify.Y.val(d) + (val > recurrify.M.val(d) ? 0 : 1),
      val)
  },

  /**
   * Returns the end of the previous instance of the month value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    val = val > 12 ? 12 : val || 12

    return recurrify.date.prev(
      recurrify.Y.val(d) - (val >= recurrify.M.val(d) ? 1 : 0),
      val)
  }

}
/**
 * Definition for a second constraint type.
 */
recurrify.second = recurrify.s = {

  /**
   * The name of this constraint.
   */
  name: 'second',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 1,

  /**
   * The second value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.s || (d.s = recurrify.date.getSec.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.s.val(d) === val
  },

  /**
   * The minimum and maximum valid second values.
   */
  extent: function () {
    return [0, 59]
  },

  /**
   * The start of the second of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d
  },

  /**
   * The end of the second of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d
  },

  /**
   * Returns the start of the next instance of the second value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    var s = recurrify.s.val(d)

    var inc = val > 59 ? 60 - s : (val <= s ? (60 - s) + val : val - s)

    var next = new Date(d.getTime() + (inc * recurrify.SEC))

    // correct for passing over a daylight savings boundry
    if (!recurrify.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + ((inc + 7200) * recurrify.SEC))
    }

    return next
  },

  /**
   * Returns the end of the previous instance of the second value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val, cache) {
    val = val > 59 ? 59 : val

    return recurrify.date.prev(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      recurrify.D.val(d),
      recurrify.h.val(d),
      recurrify.m.val(d) + (val >= recurrify.s.val(d) ? -1 : 0),
      val)
  }

}
/**
 * Definition for a time of day constraint type. Stored as number of seconds
 * since midnight to simplify calculations.
 */
recurrify.time = recurrify.t = {

  /**
   * The name of this constraint.
   */
  name: 'time',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 1,

  /**
   * The time value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.t || (d.t =
      (recurrify.h.val(d) * 3600) + (recurrify.m.val(d) * 60) + (recurrify.s.val(d)))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.t.val(d) === val
  },

  /**
   * The minimum and maximum valid time values.
   */
  extent: function () {
    return [0, 86399]
  },

  /**
   * Returns the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d
  },

  /**
   * Returns the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d
  },

  /**
   * Returns the start of the next instance of the time value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > 86399 ? 0 : val

    var next = recurrify.date.next(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      recurrify.D.val(d) + (val <= recurrify.t.val(d) ? 1 : 0),
      0,
      0,
      val)

    // correct for passing over a daylight savings boundry
    if (!recurrify.date.isUTC && next.getTime() < d.getTime()) {
      next = recurrify.date.next(
        recurrify.Y.val(next),
        recurrify.M.val(next),
        recurrify.D.val(next),
        recurrify.h.val(next),
        recurrify.m.val(next),
        val + 7200)
    }

    return next
  },

  /**
   * Returns the end of the previous instance of the time value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    val = val > 86399 ? 86399 : val

    return recurrify.date.next(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      recurrify.D.val(d) + (val >= recurrify.t.val(d) ? -1 : 0),
      0,
      0,
      val)
  }

}
/**
 * Definition for an week of month constraint type. Week of month treats the
 * first of the month as the start of week 1, with each following week starting
 * on Sunday.
 */
recurrify.weekOfMonth = recurrify.wm = {

  /**
   * The name of this constraint.
   */
  name: 'week of month',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 604800,

  /**
   * The week of month value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.wm || (d.wm =
      (recurrify.D.val(d) +
        (recurrify.dw.val(recurrify.M.start(d)) - 1) + (7 - recurrify.dw.val(d))) / 7)
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.wm.val(d) === (val || recurrify.wm.extent(d)[1])
  },

  /**
   * The minimum and maximum valid week of month values for the month indicated.
   * Zero indicates the last week in the month.
   *
   * @param {Date} d: The date indicating the month to find values for
   */
  extent: function (d) {
    return d.wmExtent || (d.wmExtent = [1,
      (recurrify.D.extent(d)[1] + (recurrify.dw.val(recurrify.M.start(d)) - 1) +
        (7 - recurrify.dw.val(recurrify.M.end(d)))) / 7])
  },

  /**
   * The start of the week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.wmStart || (d.wmStart = recurrify.date.next(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      Math.max(recurrify.D.val(d) - recurrify.dw.val(d) + 1, 1)))
  },

  /**
   * The end of the week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.wmEnd || (d.wmEnd = recurrify.date.prev(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      Math.min(recurrify.D.val(d) + (7 - recurrify.dw.val(d)), recurrify.D.extent(d)[1])))
  },

  /**
   * Returns the start of the next instance of the week value indicated. Returns
   * the first day of the next month if val is greater than the number of
   * days in the following month.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > recurrify.wm.extent(d)[1] ? 1 : val

    var month = recurrify.date.nextRollover(d, val, recurrify.wm, recurrify.M)

    var wmMax = recurrify.wm.extent(month)[1]

    val = val > wmMax ? 1 : val || wmMax

    // jump to the Sunday of the desired week, set to 1st of month for week 1
    return recurrify.date.next(
      recurrify.Y.val(month),
      recurrify.M.val(month),
      Math.max(1, (val - 1) * 7 - (recurrify.dw.val(month) - 2)))
  },

  /**
   * Returns the end of the previous instance of the week value indicated. Returns
   * the last day of the previous month if val is greater than the number of
   * days in the previous month.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    var month = recurrify.date.prevRollover(d, val, recurrify.wm, recurrify.M)

    var wmMax = recurrify.wm.extent(month)[1]

    val = val > wmMax ? wmMax : val || wmMax

    // jump to the end of Saturday of the desired week
    return recurrify.wm.end(recurrify.date.next(
      recurrify.Y.val(month),
      recurrify.M.val(month),
      Math.max(1, (val - 1) * 7 - (recurrify.dw.val(month) - 2))))
  }

}
/**
 * Definition for an ISO 8601 week constraint type. For more information about
 * ISO 8601 see http://en.wikipedia.org/wiki/ISO_week_date.
 */
recurrify.weekOfYear = recurrify.wy = {

  /**
   * The name of this constraint.
   */
  name: 'week of year (ISO)',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 604800,

  /**
   * The ISO week year value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    if (d.wy) return d.wy

    // move to the Thursday in the target week and find Thurs of target year
    var wThur = recurrify.dw.next(recurrify.wy.start(d), 5)

    var YThur = recurrify.dw.next(recurrify.Y.prev(wThur, recurrify.Y.val(wThur) - 1), 5)

    // caculate the difference between the two dates in weeks
    return (d.wy = 1 + Math.ceil((wThur.getTime() - YThur.getTime()) / recurrify.WEEK))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.wy.val(d) === (val || recurrify.wy.extent(d)[1])
  },

  /**
   * The minimum and maximum valid ISO week values for the year indicated.
   *
   * @param {Date} d: The date indicating the year to find ISO values for
   */
  extent: function (d) {
    if (d.wyExtent) return d.wyExtent

    // go to start of ISO week to get to the right year
    var year = recurrify.dw.next(recurrify.wy.start(d), 5)

    var dwFirst = recurrify.dw.val(recurrify.Y.start(year))

    var dwLast = recurrify.dw.val(recurrify.Y.end(year))

    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52])
  },

  /**
   * The start of the ISO week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.wyStart || (d.wyStart = recurrify.date.next(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      // jump to the Monday of the current week
      recurrify.D.val(d) - (recurrify.dw.val(d) > 1 ? recurrify.dw.val(d) - 2 : 6)
    ))
  },

  /**
   * The end of the ISO week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.wyEnd || (d.wyEnd = recurrify.date.prev(
      recurrify.Y.val(d),
      recurrify.M.val(d),
      // jump to the Saturday of the current week
      recurrify.D.val(d) + (recurrify.dw.val(d) > 1 ? 8 - recurrify.dw.val(d) : 0)
    ))
  },

  /**
   * Returns the start of the next instance of the ISO week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > recurrify.wy.extent(d)[1] ? 1 : val

    var wyThur = recurrify.dw.next(recurrify.wy.start(d), 5)

    var year = recurrify.date.nextRollover(wyThur, val, recurrify.wy, recurrify.Y)

    // handle case where 1st of year is last week of previous month
    if (recurrify.wy.val(year) !== 1) {
      year = recurrify.dw.next(year, 2)
    }

    var wyMax = recurrify.wy.extent(year)[1]

    var wyStart = recurrify.wy.start(year)

    val = val > wyMax ? 1 : val || wyMax

    return recurrify.date.next(
      recurrify.Y.val(wyStart),
      recurrify.M.val(wyStart),
      recurrify.D.val(wyStart) + 7 * (val - 1)
    )
  },

  /**
   * Returns the end of the previous instance of the ISO week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    var wyThur = recurrify.dw.next(recurrify.wy.start(d), 5)

    var year = recurrify.date.prevRollover(wyThur, val, recurrify.wy, recurrify.Y)

    // handle case where 1st of year is last week of previous month
    if (recurrify.wy.val(year) !== 1) {
      year = recurrify.dw.next(year, 2)
    }

    var wyMax = recurrify.wy.extent(year)[1]

    var wyEnd = recurrify.wy.end(year)

    val = val > wyMax ? wyMax : val || wyMax

    return recurrify.wy.end(recurrify.date.next(
      recurrify.Y.val(wyEnd),
      recurrify.M.val(wyEnd),
      recurrify.D.val(wyEnd) + 7 * (val - 1)
    ))
  }
}
/**
 * Definition for a year constraint type.
 */
recurrify.year = recurrify.Y = {

  /**
   * The name of this constraint.
   */
  name: 'year',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 31556900,

  /**
   * The year value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.Y || (d.Y = recurrify.date.getYear.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.Y.val(d) === val
  },

  /**
   * The minimum and maximum valid values for the year constraint.
   * If max is past 2099, recurrify.D.extent must be fixed to calculate leap years
   * correctly.
   */
  extent: function () {
    return [1970, 2099]
  },

  /**
   * The start of the year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.YStart || (d.YStart = recurrify.date.next(recurrify.Y.val(d)))
  },

  /**
   * The end of the year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.YEnd || (d.YEnd = recurrify.date.prev(recurrify.Y.val(d)))
  },

  /**
   * Returns the start of the next instance of the year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    return val > recurrify.Y.val(d) && val <= recurrify.Y.extent()[1]
      ? recurrify.date.next(val) : recurrify.NEVER
  },

  /**
   * Returns the end of the previous instance of the year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    return val < recurrify.Y.val(d) && val >= recurrify.Y.extent()[0]
      ? recurrify.date.prev(val) : recurrify.NEVER
  }

}
/**
 * Definition for specifying a full date and time.
 */
recurrify.fullDate = recurrify.fd = {

  /**
   * The name of this constraint.
   */
  name: 'full date',

  /**
   * The rough amount of seconds between start and end for this constraint.
   * (doesn't need to be exact)
   */
  range: 1,

  /**
   * The time value of the specified date.
   *
   * @param {Date} d: The date to calculate the value of
   */
  val: function (d) {
    return d.fd || (d.fd = d.getTime())
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return recurrify.fd.val(d) === val
  },

  /**
   * The minimum and maximum valid time values.
   */
  extent: function () {
    return [0, 32503680000000]
  },

  /**
   * Returns the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d
  },

  /**
   * Returns the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d
  },

  /**
   * Returns the start of the next instance of the time value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    return recurrify.fd.val(d) < val ? new Date(val) : recurrify.NEVER
  },

  /**
   * Returns the end of the previous instance of the time value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    return recurrify.fd.val(d) > val ? new Date(val) : recurrify.NEVER
  }

}

recurrify.modifier = {}

/**
 * Modifies a constraint such that all values that are greater than the
 * specified value are considered valid.
 */
/**
 * Creates a new modified constraint.
 *
 * @param {Constraint} constraint: The constraint to be modified
 * @param {Integer} value: The starting value of the after constraint
 */
recurrify.modifier.after = recurrify.modifier.a = function (constraint, values) {
  var value = values[0]

  return {

    /**
     * Returns the name of the constraint with the 'after' modifier.
     */
    name: 'after ' + constraint.name,

    /**
     * Pass through to the constraint.
     */
    range: (constraint.extent(new Date())[1] - value) * constraint.range,

    /**
     * The value of the specified date. Returns value for any constraint val
     * that is greater than or equal to value.
     *
     * @param {Date} d: The date to calculate the value of
     */
    val: constraint.val,

    /**
     * Returns true if the val is valid for the date specified.
     *
     * @param {Date} d: The date to check the value on
     * @param {Integer} val: The value to validate
     */
    isValid: function (d, val) {
      return this.val(d) >= value
    },

    /**
     * Pass through to the constraint.
     */
    extent: constraint.extent,

    /**
     * Pass through to the constraint.
     */
    start: constraint.start,

    /**
     * Pass through to the constraint.
     */
    end: constraint.end,

    /**
     * Pass through to the constraint.
     */
    next: function (startDate, val) {
      if (val !== value) val = constraint.extent(startDate)[0]
      return constraint.next(startDate, val)
    },

    /**
     * Pass through to the constraint.
     */
    prev: function (startDate, val) {
      val = val === value ? constraint.extent(startDate)[1] : value - 1
      return constraint.prev(startDate, val)
    }

  }
}
/**
 * Modifies a constraint such that all values that are less than the
 * specified value are considered valid.
 */
/**
 * Creates a new modified constraint.
 *
 * @param {Constraint} constraint: The constraint to be modified
 * @param {Integer} value: The starting value of the before constraint
 */
recurrify.modifier.before = recurrify.modifier.b = function (constraint, values) {
  var value = values[values.length - 1]

  return {

    /**
     * Returns the name of the constraint with the 'before' modifier.
     */
    name: 'before ' + constraint.name,

    /**
     * Pass through to the constraint.
     */
    range: constraint.range * (value - 1),

    /**
     * The value of the specified date. Returns value for any constraint val
     * that is less than or equal to value.
     *
     * @param {Date} d: The date to calculate the value of
     */
    val: constraint.val,

    /**
     * Returns true if the val is valid for the date specified.
     *
     * @param {Date} d: The date to check the value on
     * @param {Integer} val: The value to validate
     */
    isValid: function (d, val) {
      return this.val(d) < value
    },

    /**
     * Pass through to the constraint.
     */
    extent: constraint.extent,

    /**
     * Pass through to the constraint.
     */
    start: constraint.start,

    /**
     * Jump to the end of the range.
     */
    end: constraint.end,

    /**
     * Pass through to the constraint.
     */
    next: function (startDate, val) {
      val = val === value ? constraint.extent(startDate)[0] : value
      return constraint.next(startDate, val)
    },

    /**
     * Pass through to the constraint.
     */
    prev: function (startDate, val) {
      val = val === value ? value - 1 : constraint.extent(startDate)[1]
      return constraint.prev(startDate, val)
    }

  }
}
/**
 * Compiles a single recurrence definition into a form from which instances can be
 * efficiently calculated from.
 */
recurrify.compile = function (schedDef) {
  var constraints = []

  var constraintsLen = 0

  var tickConstraint

  for (var key in schedDef) {
    var nameParts = key.split('_')

    var name = nameParts[0]

    var mod = nameParts[1]

    var vals = schedDef[key]

    var constraint = mod ? recurrify.modifier[mod](recurrify[name], vals) : recurrify[name]

    constraints.push({ constraint: constraint, vals: vals })
    constraintsLen++
  }

  // sort constraints based on their range for best performance (we want to
  // always skip the largest block of time possible to find the next valid
  // value)
  constraints.sort(function (a, b) {
    var ra = a.constraint.range; var rb = b.constraint.range
    return (rb < ra) ? -1 : (rb > ra) ? 1 : 0
  })

  // this is the smallest constraint, we use this one to tick the recurrence when
  // finding multiple instances
  tickConstraint = constraints[constraintsLen - 1].constraint

  /**
   * Returns a function to use when comparing two dates. Encapsulates the
   * difference between searching for instances forward and backwards so that
   * the same code can be completely reused for both directions.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   */
  function compareFn (dir) {
    return dir === 'next'
      ? function (a, b) {
        return a.getTime() > b.getTime()
      }
      : function (a, b) {
        return b.getTime() > a.getTime()
      }
  }

  return {

    /**
     * Calculates the start of the next valid time slot of a particular recurrence
     * that occurs on or after the specified start time.
     *
     * @param {String} dir: Direction to search in ('next' or 'prev')
     * @param {Date} startDate: The first possible valid time slot
     */
    start: function (dir, startDate) {
      var next = startDate

      var nextVal = recurrify.array[dir]

      var maxAttempts = 1000000

      var done

      while (maxAttempts-- && !done && next) {
        done = true

        // verify all of the constraints in order since we want to make the
        // largest jumps possible to find the first valid value
        for (var i = 0; i < constraintsLen; i++) {
          var constraint = constraints[i].constraint

          var curVal = constraint.val(next)

          var extent = constraint.extent(next)

          var newVal = nextVal(curVal, constraints[i].vals, extent)

          if (!constraint.isValid(next, newVal)) {
            next = constraint[dir](next, newVal)
            done = false
            break // need to retest all constraints with new date
          }
        }
      }

      if (next !== recurrify.NEVER) {
        next = dir === 'next' ? tickConstraint.start(next)
          : tickConstraint.end(next)
      }

      // if next, move to start of time period. needed when moving backwards
      return next
    },

    /**
     * Given a valid start time, finds the next recurrence that is invalid.
     * Useful for finding the end of a valid time range.
     *
     * @param {Date} startDate: The first possible valid time slot
     */
    end: function (dir, startDate) {
      var result

      var nextVal = recurrify.array[dir + 'Invalid']

      var compare = compareFn(dir)

      for (var i = constraintsLen - 1; i >= 0; i--) {
        var constraint = constraints[i].constraint

        var curVal = constraint.val(startDate)

        var extent = constraint.extent(startDate)

        var newVal = nextVal(curVal, constraints[i].vals, extent)

        var next

        if (newVal !== undefined) { // constraint has invalid value, use that
          next = constraint[dir](startDate, newVal)
          if (next && (!result || compare(result, next))) {
            result = next
          }
        }
      }

      return result
    },

    /**
     * Ticks the date by the minimum constraint in this recurrence
     *
     * @param {String} dir: Direction to tick in ('next' or 'prev')
     * @param {Date} date: The start date to tick from
     */
    tick: function (dir, date) {
      return new Date(dir === 'next'
        ? tickConstraint.end(date).getTime() + recurrify.SEC
        : tickConstraint.start(date).getTime() - recurrify.SEC)
    },

    /**
     * Ticks the date to the start of the minimum constraint
     *
     * @param {Date} date: The start date to tick from
     */
    tickStart: function (date) {
      return tickConstraint.start(date)
    }

  }
}
/**
 * Returns an object to calculate future or previous time slots of the
 * specified recurrence.
 */
recurrify.recurrence = function (sched) {
  if (!sched) throw new Error('Missing recurrence definition.')
  if (!sched.recurrences) throw new Error('Definition must include at least one recurrence.')

  // compile the recurrence components
  var recurrences = []

  var recurrencesLen = sched.recurrences.length

  var exceptions = []

  var exceptionsLen = sched.exceptions ? sched.exceptions.length : 0

  for (var i = 0; i < recurrencesLen; i++) {
    recurrences.push(recurrify.compile(sched.recurrences[i]))
  }

  for (var j = 0; j < exceptionsLen; j++) {
    exceptions.push(recurrify.compile(sched.exceptions[j]))
  }

  /**
   * Calculates count number of instances or ranges for the current recurrence,
   * optionally between the specified startDate and endDate.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Integer} count: The number of instances or ranges to return
   * @param {Date} startDate: The earliest date a valid instance can occur on
   * @param {Date} endDate: The latest date a valid instance can occur on
   * @param {Bool} isRange: True to return ranges, false to return instances
   */
  function getInstances (dir, count, startDate, endDate, isRange) {
    var compare = compareFn(dir)
    // encapsulates difference between directions

    var loopCount = count

    var maxAttempts = 1000000

    var schedStarts = []; var exceptStarts = []

    var next; var end; var results = []

    var isForward = dir === 'next'

    var lastResult

    var rStart = isForward ? 0 : 1

    var rEnd = isForward ? 1 : 0

    startDate = startDate ? new Date(startDate) : new Date()
    if (!startDate || !startDate.getTime()) throw new Error('Invalid start date.')

    // Step 1: calculate the earliest start dates for each recurrence and exception
    setNextStarts(dir, recurrences, schedStarts, startDate)
    setRangeStarts(dir, exceptions, exceptStarts, startDate)

    // Step 2: select the earliest of the start dates calculated
    while (maxAttempts-- && loopCount && (next = findNext(schedStarts, compare))) {
      // Step 3: make sure the start date we found is in range
      if (endDate && compare(next, endDate)) {
        break
      }

      // Step 4: make sure we aren't in the middle of an exception range
      if (exceptionsLen) {
        updateRangeStarts(dir, exceptions, exceptStarts, next)
        if ((end = calcRangeOverlap(dir, exceptStarts, next))) {
          updateNextStarts(dir, recurrences, schedStarts, end)
          continue
        }
      }

      // Step 5: Date is good, if range, find the end of the range and update start dates
      if (isRange) {
        var maxEndDate = calcMaxEndDate(exceptStarts, compare)
        end = calcEnd(dir, recurrences, schedStarts, next, maxEndDate)
        var r = isForward
          ? [
            new Date(Math.max(startDate, next)),
            end ? new Date(endDate ? Math.min(end, endDate) : end) : undefined
          ]
          : [
            end ? (new Date(endDate ? Math.max(endDate, end.getTime() + recurrify.SEC) : end.getTime() + recurrify.SEC)) : undefined,
            new Date(Math.min(startDate, next.getTime() + recurrify.SEC))
          ]

        // make sure start of this range doesn't overlap with the end of the
        // previous range
        if (lastResult && r[rStart].getTime() === lastResult[rEnd].getTime()) {
          lastResult[rEnd] = r[rEnd]
          loopCount++ // correct the count since this isn't a new range
        } else {
          lastResult = r
          results.push(lastResult)
        }

        if (!end) break // last iteration valid until the end of time
        updateNextStarts(dir, recurrences, schedStarts, end)
      } else {
        // otherwise store the start date and tick the start dates
        results.push(isForward
          ? new Date(Math.max(startDate, next))
          : getStart(recurrences, schedStarts, next, endDate)
        )

        tickStarts(dir, recurrences, schedStarts, next)
      }

      loopCount--
    }

    // clean the dates that will be returned to remove any cached properties
    // that were added during the recurrence process
    for (var i = 0, len = results.length; i < len; i++) {
      var result = results[i]
      results[i] = Object.prototype.toString.call(result) === '[object Array]'
        ? [cleanDate(result[0]), cleanDate(result[1])]
        : cleanDate(result)
    }

    return results.length === 0 ? recurrify.NEVER : count === 1 ? results[0] : results
  }

  /**
   * Calculates all instances for the current recurrence between the specified startDate and endDate.
   * If endDate is not specified, the maximum number of results returned is 1000
   *
   * @param {Date} startDate: The earliest date a valid instance can occur on
   * @param {Date} endDate: The latest date a valid instance can occur on
   */
  function getAllInstances (startDate, endDate) {
    const dir = 'next'
    const compare = compareFn(dir) // encapsulates difference between directions

    let maxAttempts = 1000000
    const schedStarts = []
    const exceptStarts = []
    let next
    let end
    const results = []

    startDate = startDate ? new Date(startDate) : new Date()
    if (!startDate || !startDate.getTime()) throw new Error('Invalid start date.')

    // Step 1: calculate the earliest start dates for each recurrence and exception
    setNextStarts(dir, recurrences, schedStarts, startDate)
    setRangeStarts(dir, exceptions, exceptStarts, startDate)

    // Step 2: select the earliest of the start dates calculated
    while (maxAttempts-- && (next = findNext(schedStarts, compare))) {
      // Step 3: make sure the start date we found is in range
      if (endDate && compare(next, endDate)) {
        break
      }

      // Step 4: make sure we aren't in the middle of an exception range
      if (exceptionsLen) {
        updateRangeStarts(dir, exceptions, exceptStarts, next)
        if ((end = calcRangeOverlap(dir, exceptStarts, next))) {
          updateNextStarts(dir, recurrences, schedStarts, end)
          continue
        }
      }

      // Step 5: Date is good, if range, find the end of the range and update start dates
      // otherwise store the start date and tick the start dates
      results.push(new Date(Math.max(startDate, next)))

      tickStarts(dir, recurrences, schedStarts, next)
    }

    // clean the dates that will be returned to remove any cached properties
    // that were added during the recurrence process
    for (let i = 0, len = results.length; i < len; i++) {
      let result = results[i]
      results[i] = Object.prototype.toString.call(result) === '[object Array]'
        ? [cleanDate(result[0]), cleanDate(result[1])]
        : cleanDate(result)
    }

    return results.length === 0 ? recurrify.NEVER : results
  }

  function cleanDate (d) {
    if (d instanceof Date && !isNaN(d.valueOf())) {
      return new Date(d)
    }

    return undefined
  }

  /**
   * Initially sets the first valid next start times
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled recurrences to use
   * @param {Array} startsArr: The set of cached start dates for the recurrences
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function setNextStarts (dir, schedArr, startsArr, startDate) {
    for (var i = 0, len = schedArr.length; i < len; i++) {
      startsArr[i] = schedArr[i].start(dir, startDate)
    }
  }

  /**
   * Updates the set of cached start dates to the next valid start dates. Only
   * recurrences where the current start date is less than or equal to the
   * specified startDate need to be updated.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled recurrences to use
   * @param {Array} startsArr: The set of cached start dates for the recurrences
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function updateNextStarts (dir, schedArr, startsArr, startDate) {
    var compare = compareFn(dir)

    for (var i = 0, len = schedArr.length; i < len; i++) {
      if (startsArr[i] && !compare(startsArr[i], startDate)) {
        startsArr[i] = schedArr[i].start(dir, startDate)
      }
    }
  }

  /**
   * Updates the set of cached ranges to the next valid ranges. Only
   * recurrences where the current start date is less than or equal to the
   * specified startDate need to be updated.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled recurrences to use
   * @param {Array} startsArr: The set of cached start dates for the recurrences
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function setRangeStarts (dir, schedArr, rangesArr, startDate) {
    for (var i = 0, len = schedArr.length; i < len; i++) {
      var nextStart = schedArr[i].start(dir, startDate)

      if (!nextStart) {
        rangesArr[i] = recurrify.NEVER
      } else {
        rangesArr[i] = [nextStart, schedArr[i].end(dir, nextStart)]
      }
    }
  }

  /**
   * Updates the set of cached ranges to the next valid ranges. Only
   * recurrences where the current start date is less than or equal to the
   * specified startDate need to be updated.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled recurrences to use
   * @param {Array} startsArr: The set of cached start dates for the recurrences
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function updateRangeStarts (dir, schedArr, rangesArr, startDate) {
    var compare = compareFn(dir)

    for (var i = 0, len = schedArr.length; i < len; i++) {
      if (rangesArr[i] && !compare(rangesArr[i][0], startDate)) {
        var nextStart = schedArr[i].start(dir, startDate)

        if (!nextStart) {
          rangesArr[i] = recurrify.NEVER
        } else {
          rangesArr[i] = [nextStart, schedArr[i].end(dir, nextStart)]
        }
      }
    }
  }

  /**
   * Increments all recurrences with next start equal to startDate by one tick.
   * Tick size is determined by the smallest constraint within a recurrence.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled recurrences to use
   * @param {Array} startsArr: The set of cached start dates for the recurrences
   * @param {Date} startDate: The date that should cause a recurrence to tick
   */
  function tickStarts (dir, schedArr, startsArr, startDate) {
    for (var i = 0, len = schedArr.length; i < len; i++) {
      if (startsArr[i] && startsArr[i].getTime() === startDate.getTime()) {
        startsArr[i] = schedArr[i].start(dir, schedArr[i].tick(dir, startDate))
      }
    }
  }

  /**
   * Determines the start date of the recurrence that produced startDate
   *
   * @param {Array} schedArr: The set of compiled recurrences to use
   * @param {Array} startsArr: The set of cached start dates for the recurrences
   * @param {Date} startDate: The date that should cause a recurrence to tick
   * @param {Date} minEndDate: The minimum end date to return
   */
  function getStart (schedArr, startsArr, startDate, minEndDate) {
    var result

    for (var i = 0, len = startsArr.length; i < len; i++) {
      if (startsArr[i] && startsArr[i].getTime() === startDate.getTime()) {
        var start = schedArr[i].tickStart(startDate)

        if (minEndDate && (start < minEndDate)) {
          return minEndDate
        }

        if (!result || (start > result)) {
          result = start
        }
      }
    }

    return result
  }

  /**
   * Calculates the end of the overlap between any exception recurrence and the
   * specified start date. Returns undefined if there is no overlap.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled recurrences to use
   * @param {Array} rangesArr: The set of cached start dates for the recurrences
   * @param {Date} startDate: The valid date for which the overlap will be found
   */
  function calcRangeOverlap (dir, rangesArr, startDate) {
    var compare = compareFn(dir); var result

    for (var i = 0, len = rangesArr.length; i < len; i++) {
      var range = rangesArr[i]

      if (range && !compare(range[0], startDate) &&
        (!range[1] || compare(range[1], startDate))) {
        // startDate is in the middle of an exception range
        if (!result || compare(range[1], result)) {
          result = range[1]
        }
      }
    }

    return result
  }

  /**
   * Calculates the earliest start of an exception recurrence, this is the maximum
   * end date of the recurrence.
   *
   * @param {Array} exceptsArr: The set of cached exception ranges
   * @param {Array} compare: The compare function to use to determine earliest
   */
  function calcMaxEndDate (exceptsArr, compare) {
    var result

    for (var i = 0, len = exceptsArr.length; i < len; i++) {
      if (exceptsArr[i] && (!result || compare(result, exceptsArr[i][0]))) {
        result = exceptsArr[i][0]
      }
    }

    return result
  }

  /**
   * Calculates the next invalid date for a particular recurrences starting from
   * the specified valid start date.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled recurrences to use
   * @param {Array} startsArr: The set of cached start dates for the recurrences
   * @param {Date} startDate: The valid date for which the end date will be found
   * @param {Date} maxEndDate: The latested possible end date or null for none
   */
  function calcEnd (dir, schedArr, startsArr, startDate, maxEndDate) {
    var compare = compareFn(dir); var result

    for (var i = 0, len = schedArr.length; i < len; i++) {
      var start = startsArr[i]

      if (start && start.getTime() === startDate.getTime()) {
        var end = schedArr[i].end(dir, start)

        // if the end date is past the maxEndDate, just return the maxEndDate
        if (maxEndDate && (!end || compare(end, maxEndDate))) {
          return maxEndDate
        }

        // otherwise, return the maximum end date that was calculated
        if (!result || compare(end, result)) {
          result = end
        }
      }
    }

    return result
  }

  /**
   * Returns a function to use when comparing two dates. Encapsulates the
   * difference between searching for instances forward and backwards so that
   * the same code can be completely reused for both directions.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   */
  function compareFn (dir) {
    return dir === 'next'
      ? function (a, b) {
        return !b || (a.getTime() > b.getTime())
      }
      : function (a, b) {
        return !a || (b.getTime() > a.getTime())
      }
  }

  /**
   * Returns the next value in an array using the function passed in as compare
   * to do the comparison. Skips over null or undefined values.
   *
   * @param {Array} arr: The array of values
   * @param {Function} compare: The comparison function to use
   */
  function findNext (arr, compare) {
    var next = arr[0]

    for (var i = 1, len = arr.length; i < len; i++) {
      if (arr[i] && compare(next, arr[i])) {
        next = arr[i]
      }
    }

    return next
  }

  return {

    /**
     * Returns true if d is a valid tiem slot of the current recurrence.
     *
     * @param {Date} d: The date to check
     */
    isValid: function (d) {
      return getInstances('next', 1, d, d) !== recurrify.NEVER
    },

    /**
     * Finds the next valid instance or instances of the current recurrence,
     * optionally between a specified start and end date. Start date is
     * Date.now() by default, end date is unspecified. Start date must be
     * smaller than end date.
     *
     * @param {Integer} count: The number of instances to return
     * @param {Date} startDate: The earliest a valid instance can occur
     * @param {Date} endDate: The latest a valid instance can occur
     */
    next: function (count, startDate, endDate) {
      return getInstances('next', count || 1, startDate, endDate)
    },

    /**
     * Finds the previous valid instance or instances of the current recurrence,
     * optionally between a specified start and end date. Start date is
     * Date.now() by default, end date is unspecified. Start date must be
     * greater than end date.
     *
     * @param {Integer} count: The number of instances to return
     * @param {Date} startDate: The earliest a valid instance can occur
     * @param {Date} endDate: The latest a valid instance can occur
     */
    prev: function (count, startDate, endDate) {
      return getInstances('prev', count || 1, startDate, endDate)
    },

    /**
     * Finds the next valid range or ranges of the current recurrence,
     * optionally between a specified start and end date. Start date is
     * Date.now() by default, end date is unspecified. Start date must be
     * greater than end date.
     *
     * @param {Integer} count: The number of ranges to return
     * @param {Date} startDate: The earliest a valid range can occur
     * @param {Date} endDate: The latest a valid range can occur
     */
    nextRange: function (count, startDate, endDate) {
      return getInstances('next', count || 1, startDate, endDate, true)
    },

    /**
     * Finds the previous valid range or ranges of the current recurrence,
     * optionally between a specified start and end date. Start date is
     * Date.now() by default, end date is unspecified. Start date must be
     * greater than end date.
     *
     * @param {Integer} count: The number of ranges to return
     * @param {Date} startDate: The earliest a valid range can occur
     * @param {Date} endDate: The latest a valid range can occur
     */
    prevRange: function (count, startDate, endDate) {
      return getInstances('prev', count || 1, startDate, endDate, true)
    },

    all: function (startDate, endDate) {
      return getAllInstances(startDate, endDate)
    }
  }
}

recurrify.date = {}
/**
 * Configures helper functions to switch between using local time and UTC. recurrify
 * uses UTC time by default.
 */

recurrify.date.timezone = function (useLocalTime) {
  // configure the date builder used to create new dates in the right timezone
  recurrify.date.build = useLocalTime
    ? function (Y, M, D, h, m, s) {
      return new Date(Y, M, D, h, m, s)
    }
    : function (Y, M, D, h, m, s) {
      return new Date(Date.UTC(Y, M, D, h, m, s))
    }

  // configure the accessor methods
  var get = useLocalTime ? 'get' : 'getUTC'

  var d = Date.prototype

  recurrify.date.getYear = d[get + 'FullYear']
  recurrify.date.getMonth = d[get + 'Month']
  recurrify.date.getDate = d[get + 'Date']
  recurrify.date.getDay = d[get + 'Day']
  recurrify.date.getHour = d[get + 'Hours']
  recurrify.date.getMin = d[get + 'Minutes']
  recurrify.date.getSec = d[get + 'Seconds']

  // set the isUTC flag
  recurrify.date.isUTC = !useLocalTime
}

// friendly names for available timezones
recurrify.date.UTC = function () {
  recurrify.date.timezone(false)
}
recurrify.date.localTime = function () {
  recurrify.date.timezone(true)
}

// use UTC by default
recurrify.date.UTC()
/**
 * Useful constants for dealing with time conversions.
 */
// Time to milliseconds conversion
recurrify.SEC = 1000
recurrify.MIN = recurrify.SEC * 60
recurrify.HOUR = recurrify.MIN * 60
recurrify.DAY = recurrify.HOUR * 24
recurrify.WEEK = recurrify.DAY * 7

// Array of days in each month, must be corrected for leap years
recurrify.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

// constant for specifying that a recurrence can never occur
recurrify.NEVER = 0
/**
 * Creates a new Date object defaulted to the first second after the specified
 * values.
 */
/**
 * Builds and returns a new Date using the specified values.  Date
 * returned is either using Local time or UTC based on isLocal.
 *
 * @param {Int} Y: Four digit year
 * @param {Int} M: Month between 1 and 12, defaults to 1
 * @param {Int} D: Date between 1 and 31, defaults to 1
 * @param {Int} h: Hour between 0 and 23, defaults to 0
 * @param {Int} m: Minute between 0 and 59, defaults to 0
 * @param {Int} s: Second between 0 and 59, defaults to 0
 */
recurrify.date.next = function (Y, M, D, h, m, s) {
  return recurrify.date.build(
    Y,
    M !== undefined ? M - 1 : 0,
    D !== undefined ? D : 1,
    h || 0,
    m || 0,
    s || 0)
}
/**
 * Determines if a value will cause a particular constraint to rollover to the
 * next largest time period. Used primarily when a constraint has a
 * variable extent.
 */
recurrify.date.nextRollover = function (d, val, constraint, period) {
  var cur = constraint.val(d)

  var max = constraint.extent(d)[1]

  return (((val || max) <= cur) || val > max)
    ? new Date(period.end(d).getTime() + recurrify.SEC)
    : period.start(d)
}
/**
 * Creates a new Date object defaulted to the last second after the specified
 * values.
 */
/**
 * Builds and returns a new Date using the specified values.  Date
 * returned is either using Local time or UTC based on isLocal.
 *
 * @param {Int} Y: Four digit year
 * @param {Int} M: Month between 0 and 11, defaults to 11
 * @param {Int} D: Date between 1 and 31, defaults to last day of month
 * @param {Int} h: Hour between 0 and 23, defaults to 23
 * @param {Int} m: Minute between 0 and 59, defaults to 59
 * @param {Int} s: Second between 0 and 59, defaults to 59
 */
recurrify.date.prev = function (Y, M, D, h, m, s) {
  var len = arguments.length
  M = len < 2 ? 11 : M - 1
  D = len < 3 ? recurrify.D.extent(recurrify.date.next(Y, M + 1))[1] : D
  h = len < 4 ? 23 : h
  m = len < 5 ? 59 : m
  s = len < 6 ? 59 : s

  return recurrify.date.build(Y, M, D, h, m, s)
}
/**
 * Determines if a value will cause a particular constraint to rollover to the
 * previous largest time period. Used primarily when a constraint has a
 * variable extent.
 */
recurrify.date.prevRollover = function (d, val, constraint, period) {
  var cur = constraint.val(d)

  return (val >= cur || !val)
    ? period.start(period.prev(d, period.val(d) - 1))
    : period.start(d)
}

module.exports = recurrify
