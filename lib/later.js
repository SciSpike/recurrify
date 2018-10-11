'use strict'

var later = { version: '1.2.0' } // semver
later.array = {}
/**
 * Sort
 * (c) 2013 Bill, BunKat LLC.
 *
 * Sorts an array in natural ascending order, placing zero at the end
 * if zeroIsLast is true.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.sort = function (arr, zeroIsLast) {
  arr.sort(function (a, b) {
    return +a - +b
  })

  if (zeroIsLast && arr[0] === 0) {
    arr.push(arr.shift())
  }
}
/**
 * Next
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns the next valid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.next = function (val, values, extent) {
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
 * Next Invalid
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns the next invalid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.nextInvalid = function (val, values, extent) {
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
 * Previous
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns the previous valid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.prev = function (val, values, extent) {
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
 * Previous Invalid
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns the previous invalid value in a range of values, wrapping as needed. Assumes
 * the array has already been sorted.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.array.prevInvalid = function (val, values, extent) {
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
 * Day Constraint (D)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a day of month (date) constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.day = later.D = {

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
    return d.D || (d.D = later.date.getDate.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.D.val(d) === (val || later.D.extent(d)[1])
  },

  /**
   * The minimum and maximum valid day values of the month specified.
   * Zero to specify the last day of the month.
   *
   * @param {Date} d: The date indicating the month to find the extent of
   */
  extent: function (d) {
    if (d.DExtent) return d.DExtent

    var month = later.M.val(d)

    var max = later.DAYS_IN_MONTH[month - 1]

    if (month === 2 && later.dy.extent(d)[1] === 366) {
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
    return d.DStart || (d.DStart = later.date.next(
      later.Y.val(d), later.M.val(d), later.D.val(d)))
  },

  /**
   * The end of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.DEnd || (d.DEnd = later.date.prev(
      later.Y.val(d), later.M.val(d), later.D.val(d)))
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
    val = val > later.D.extent(d)[1] ? 1 : val
    var month = later.date.nextRollover(d, val, later.D, later.M)

    var DMax = later.D.extent(month)[1]

    val = val > DMax ? 1 : val || DMax

    return later.date.next(
      later.Y.val(month),
      later.M.val(month),
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
    var month = later.date.prevRollover(d, val, later.D, later.M)

    var DMax = later.D.extent(month)[1]

    return later.date.prev(
      later.Y.val(month),
      later.M.val(month),
      val > DMax ? DMax : val || DMax
    )
  }

}
/**
 * Day of Week Count Constraint (dc)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a day of week count constraint type. This constraint is used
 * to specify schedules like '2nd Tuesday of every month'.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.dayOfWeekCount = later.dc = {

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
    return d.dc || (d.dc = Math.floor((later.D.val(d) - 1) / 7) + 1)
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return (later.dc.val(d) === val) ||
      (val === 0 && later.D.val(d) > later.D.extent(d)[1] - 7)
  },

  /**
   * The minimum and maximum valid day values of the month specified.
   * Zero to specify the last day of week count of the month.
   *
   * @param {Date} d: The date indicating the month to find the extent of
   */
  extent: function (d) {
    return d.dcExtent || (d.dcExtent = [1, Math.ceil(later.D.extent(d)[1] / 7)])
  },

  /**
   * The first day of the month with the same day of week count as the date
   * specified.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.dcStart || (d.dcStart =
      later.date.next(
        later.Y.val(d),
        later.M.val(d),
        Math.max(1, ((later.dc.val(d) - 1) * 7) + 1 || 1)))
  },

  /**
   * The last day of the month with the same day of week count as the date
   * specified.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.dcEnd || (d.dcEnd =
      later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        Math.min(later.dc.val(d) * 7, later.D.extent(d)[1])))
  },

  /**
   * Returns the next earliest date with the day of week count specified.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > later.dc.extent(d)[1] ? 1 : val
    var month = later.date.nextRollover(d, val, later.dc, later.M)

    var dcMax = later.dc.extent(month)[1]

    val = val > dcMax ? 1 : val

    var next = later.date.next(
      later.Y.val(month),
      later.M.val(month),
      val === 0 ? later.D.extent(month)[1] - 6 : 1 + (7 * (val - 1))
    )

    if (next.getTime() <= d.getTime()) {
      month = later.M.next(d, later.M.val(d) + 1)

      return later.date.next(
        later.Y.val(month),
        later.M.val(month),
        val === 0 ? later.D.extent(month)[1] - 6 : 1 + (7 * (val - 1))
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
    var month = later.date.prevRollover(d, val, later.dc, later.M)

    var dcMax = later.dc.extent(month)[1]

    val = val > dcMax ? dcMax : val || dcMax

    return later.dc.end(later.date.prev(
      later.Y.val(month),
      later.M.val(month),
      1 + (7 * (val - 1))
    ))
  }

}
/**
 * Day of Week Constraint (dw)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a day of week constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.dayOfWeek = later.dw = later.d = {

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
    return d.dw || (d.dw = later.date.getDay.call(d) + 1)
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.dw.val(d) === (val || 7)
  },

  /**
   * The minimum and maximum valid day of week values. Unlike the standard
   * Date object, Later day of week goes from 1 to 7.
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
    return later.D.start(d)
  },

  /**
   * The end of the day of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return later.D.end(d)
  },

  /**
   * Returns the start of the next instance of the day of week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > 7 ? 1 : val || 7

    return later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val - later.dw.val(d)) + (val <= later.dw.val(d) ? 7 : 0))
  },

  /**
   * Returns the end of the previous instance of the day of week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    val = val > 7 ? 7 : val || 7

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val - later.dw.val(d)) + (val >= later.dw.val(d) ? -7 : 0))
  }
}
/**
 * Day of Year Constraint (dy)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a day of year constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.dayOfYear = later.dy = {

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
      Math.ceil(1 + (later.D.start(d).getTime() - later.Y.start(d).getTime()) / later.DAY))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.dy.val(d) === (val || later.dy.extent(d)[1])
  },

  /**
   * The minimum and maximum valid day of year values of the month specified.
   * Zero indicates the last day of the year.
   *
   * @param {Date} d: The date indicating the month to find the extent of
   */
  extent: function (d) {
    var year = later.Y.val(d)

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
    return later.D.start(d)
  },

  /**
   * The end of the day of year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return later.D.end(d)
  },

  /**
   * Returns the start of the next instance of the day of year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > later.dy.extent(d)[1] ? 1 : val
    var year = later.date.nextRollover(d, val, later.dy, later.Y)

    var dyMax = later.dy.extent(year)[1]

    val = val > dyMax ? 1 : val || dyMax

    return later.date.next(
      later.Y.val(year),
      later.M.val(year),
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
    var year = later.date.prevRollover(d, val, later.dy, later.Y)

    var dyMax = later.dy.extent(year)[1]

    val = val > dyMax ? dyMax : val || dyMax

    return later.date.prev(
      later.Y.val(year),
      later.M.val(year),
      val
    )
  }

}
/**
 * Hour Constraint (H)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a hour constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.hour = later.h = {

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
    return d.h || (d.h = later.date.getHour.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.h.val(d) === val
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
    return d.hStart || (d.hStart = later.date.next(
      later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d)))
  },

  /**
   * The end of the hour of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.hEnd || (d.hEnd = later.date.prev(
      later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d)))
  },

  /**
   * Returns the start of the next instance of the hour value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > 23 ? 0 : val

    var next = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val <= later.h.val(d) ? 1 : 0),
      val)

    // correct for passing over a daylight savings boundry
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = later.date.next(
        later.Y.val(next),
        later.M.val(next),
        later.D.val(next),
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

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val >= later.h.val(d) ? -1 : 0),
      val)
  }

}
/**
 * Minute Constraint (m)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a minute constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.minute = later.m = {

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
    return d.m || (d.m = later.date.getMin.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.m.val(d) === val
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
    return d.mStart || (d.mStart = later.date.next(
      later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d), later.m.val(d)))
  },

  /**
   * The end of the minute of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.mEnd || (d.mEnd = later.date.prev(
      later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d), later.m.val(d)))
  },

  /**
   * Returns the start of the next instance of the minute value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    var m = later.m.val(d)

    var s = later.s.val(d)

    var inc = val > 59 ? 60 - m : (val <= m ? (60 - m) + val : val - m)

    var next = new Date(d.getTime() + (inc * later.MIN) - (s * later.SEC))

    // correct for passing over a daylight savings boundry
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + ((inc + 120) * later.MIN) - (s * later.SEC))
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

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d),
      later.h.val(d) + (val >= later.m.val(d) ? -1 : 0),
      val)
  }

}
/**
 * Month Constraint (M)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a month constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.month = later.M = {

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
    return d.M || (d.M = later.date.getMonth.call(d) + 1)
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.M.val(d) === (val || 12)
  },

  /**
   * The minimum and maximum valid month values. Unlike the native date object,
   * month values in later are 1 based.
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
    return d.MStart || (d.MStart = later.date.next(later.Y.val(d), later.M.val(d)))
  },

  /**
   * The end of the month of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.MEnd || (d.MEnd = later.date.prev(later.Y.val(d), later.M.val(d)))
  },

  /**
   * Returns the start of the next instance of the month value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > 12 ? 1 : val || 12

    return later.date.next(
      later.Y.val(d) + (val > later.M.val(d) ? 0 : 1),
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

    return later.date.prev(
      later.Y.val(d) - (val >= later.M.val(d) ? 1 : 0),
      val)
  }

}
/**
 * Second Constraint (s)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a second constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.second = later.s = {

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
    return d.s || (d.s = later.date.getSec.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.s.val(d) === val
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
    var s = later.s.val(d)

    var inc = val > 59 ? 60 - s : (val <= s ? (60 - s) + val : val - s)

    var next = new Date(d.getTime() + (inc * later.SEC))

    // correct for passing over a daylight savings boundry
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + ((inc + 7200) * later.SEC))
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

    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d),
      later.h.val(d),
      later.m.val(d) + (val >= later.s.val(d) ? -1 : 0),
      val)
  }

}
/**
 * Time Constraint (dy)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a time of day constraint type. Stored as number of seconds
 * since midnight to simplify calculations.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.time = later.t = {

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
      (later.h.val(d) * 3600) + (later.m.val(d) * 60) + (later.s.val(d)))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.t.val(d) === val
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

    var next = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val <= later.t.val(d) ? 1 : 0),
      0,
      0,
      val)

    // correct for passing over a daylight savings boundry
    if (!later.date.isUTC && next.getTime() < d.getTime()) {
      next = later.date.next(
        later.Y.val(next),
        later.M.val(next),
        later.D.val(next),
        later.h.val(next),
        later.m.val(next),
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

    return later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (val >= later.t.val(d) ? -1 : 0),
      0,
      0,
      val)
  }

}
/**
 * Week of Month Constraint (wy)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for an week of month constraint type. Week of month treats the
 * first of the month as the start of week 1, with each following week starting
 * on Sunday.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.weekOfMonth = later.wm = {

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
      (later.D.val(d) +
        (later.dw.val(later.M.start(d)) - 1) + (7 - later.dw.val(d))) / 7)
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.wm.val(d) === (val || later.wm.extent(d)[1])
  },

  /**
   * The minimum and maximum valid week of month values for the month indicated.
   * Zero indicates the last week in the month.
   *
   * @param {Date} d: The date indicating the month to find values for
   */
  extent: function (d) {
    return d.wmExtent || (d.wmExtent = [1,
      (later.D.extent(d)[1] + (later.dw.val(later.M.start(d)) - 1) +
        (7 - later.dw.val(later.M.end(d)))) / 7])
  },

  /**
   * The start of the week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.wmStart || (d.wmStart = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      Math.max(later.D.val(d) - later.dw.val(d) + 1, 1)))
  },

  /**
   * The end of the week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.wmEnd || (d.wmEnd = later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      Math.min(later.D.val(d) + (7 - later.dw.val(d)), later.D.extent(d)[1])))
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
    val = val > later.wm.extent(d)[1] ? 1 : val

    var month = later.date.nextRollover(d, val, later.wm, later.M)

    var wmMax = later.wm.extent(month)[1]

    val = val > wmMax ? 1 : val || wmMax

    // jump to the Sunday of the desired week, set to 1st of month for week 1
    return later.date.next(
      later.Y.val(month),
      later.M.val(month),
      Math.max(1, (val - 1) * 7 - (later.dw.val(month) - 2)))
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
    var month = later.date.prevRollover(d, val, later.wm, later.M)

    var wmMax = later.wm.extent(month)[1]

    val = val > wmMax ? wmMax : val || wmMax

    // jump to the end of Saturday of the desired week
    return later.wm.end(later.date.next(
      later.Y.val(month),
      later.M.val(month),
      Math.max(1, (val - 1) * 7 - (later.dw.val(month) - 2))))
  }

}
/**
 * Week of Year Constraint (wy)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for an ISO 8601 week constraint type. For more information about
 * ISO 8601 see http://en.wikipedia.org/wiki/ISO_week_date.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.weekOfYear = later.wy = {

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
    var wThur = later.dw.next(later.wy.start(d), 5)

    var YThur = later.dw.next(later.Y.prev(wThur, later.Y.val(wThur) - 1), 5)

    // caculate the difference between the two dates in weeks
    return (d.wy = 1 + Math.ceil((wThur.getTime() - YThur.getTime()) / later.WEEK))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.wy.val(d) === (val || later.wy.extent(d)[1])
  },

  /**
   * The minimum and maximum valid ISO week values for the year indicated.
   *
   * @param {Date} d: The date indicating the year to find ISO values for
   */
  extent: function (d) {
    if (d.wyExtent) return d.wyExtent

    // go to start of ISO week to get to the right year
    var year = later.dw.next(later.wy.start(d), 5)

    var dwFirst = later.dw.val(later.Y.start(year))

    var dwLast = later.dw.val(later.Y.end(year))

    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52])
  },

  /**
   * The start of the ISO week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  start: function (d) {
    return d.wyStart || (d.wyStart = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      // jump to the Monday of the current week
      later.D.val(d) - (later.dw.val(d) > 1 ? later.dw.val(d) - 2 : 6)
    ))
  },

  /**
   * The end of the ISO week of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.wyEnd || (d.wyEnd = later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      // jump to the Saturday of the current week
      later.D.val(d) + (later.dw.val(d) > 1 ? 8 - later.dw.val(d) : 0)
    ))
  },

  /**
   * Returns the start of the next instance of the ISO week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    val = val > later.wy.extent(d)[1] ? 1 : val

    var wyThur = later.dw.next(later.wy.start(d), 5)

    var year = later.date.nextRollover(wyThur, val, later.wy, later.Y)

    // handle case where 1st of year is last week of previous month
    if (later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2)
    }

    var wyMax = later.wy.extent(year)[1]

    var wyStart = later.wy.start(year)

    val = val > wyMax ? 1 : val || wyMax

    return later.date.next(
      later.Y.val(wyStart),
      later.M.val(wyStart),
      later.D.val(wyStart) + 7 * (val - 1)
    )
  },

  /**
   * Returns the end of the previous instance of the ISO week value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    var wyThur = later.dw.next(later.wy.start(d), 5)

    var year = later.date.prevRollover(wyThur, val, later.wy, later.Y)

    // handle case where 1st of year is last week of previous month
    if (later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2)
    }

    var wyMax = later.wy.extent(year)[1]

    var wyEnd = later.wy.end(year)

    val = val > wyMax ? wyMax : val || wyMax

    return later.wy.end(later.date.next(
      later.Y.val(wyEnd),
      later.M.val(wyEnd),
      later.D.val(wyEnd) + 7 * (val - 1)
    ))
  }
}
/**
 * Year Constraint (Y)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for a year constraint type.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.year = later.Y = {

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
    return d.Y || (d.Y = later.date.getYear.call(d))
  },

  /**
   * Returns true if the val is valid for the date specified.
   *
   * @param {Date} d: The date to check the value on
   * @param {Integer} val: The value to validate
   */
  isValid: function (d, val) {
    return later.Y.val(d) === val
  },

  /**
   * The minimum and maximum valid values for the year constraint.
   * If max is past 2099, later.D.extent must be fixed to calculate leap years
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
    return d.YStart || (d.YStart = later.date.next(later.Y.val(d)))
  },

  /**
   * The end of the year of the specified date.
   *
   * @param {Date} d: The specified date
   */
  end: function (d) {
    return d.YEnd || (d.YEnd = later.date.prev(later.Y.val(d)))
  },

  /**
   * Returns the start of the next instance of the year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  next: function (d, val) {
    return val > later.Y.val(d) && val <= later.Y.extent()[1]
      ? later.date.next(val) : later.NEVER
  },

  /**
   * Returns the end of the previous instance of the year value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    return val < later.Y.val(d) && val >= later.Y.extent()[0]
      ? later.date.prev(val) : later.NEVER
  }

}
/**
 * Full date (fd)
 * (c) 2013 Bill, BunKat LLC.
 *
 * Definition for specifying a full date and time.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.fullDate = later.fd = {

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
    return later.fd.val(d) === val
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
    return later.fd.val(d) < val ? new Date(val) : later.NEVER
  },

  /**
   * Returns the end of the previous instance of the time value indicated.
   *
   * @param {Date} d: The starting date
   * @param {int} val: The desired value, must be within extent
   */
  prev: function (d, val) {
    return later.fd.val(d) > val ? new Date(val) : later.NEVER
  }

}

later.modifier = {}

/**
 * After Modifier
 * (c) 2013 Bill, BunKat LLC.
 *
 * Modifies a constraint such that all values that are greater than the
 * specified value are considered valid.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

/**
 * Creates a new modified constraint.
 *
 * @param {Constraint} constraint: The constraint to be modified
 * @param {Integer} value: The starting value of the after constraint
 */
later.modifier.after = later.modifier.a = function (constraint, values) {
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
 * Before Modifier
 * (c) 2013 Bill, BunKat LLC.
 *
 * Modifies a constraint such that all values that are less than the
 * specified value are considered valid.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

/**
 * Creates a new modified constraint.
 *
 * @param {Constraint} constraint: The constraint to be modified
 * @param {Integer} value: The starting value of the before constraint
 */
later.modifier.before = later.modifier.b = function (constraint, values) {
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
 * Compile
 * (c) 2013 Bill, BunKat LLC.
 *
 * Compiles a single schedule definition into a form from which instances can be
 * efficiently calculated from.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.compile = function (schedDef) {
  var constraints = []

  var constraintsLen = 0

  var tickConstraint

  for (var key in schedDef) {
    var nameParts = key.split('_')

    var name = nameParts[0]

    var mod = nameParts[1]

    var vals = schedDef[key]

    var constraint = mod ? later.modifier[mod](later[name], vals) : later[name]

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

  // this is the smallest constraint, we use this one to tick the schedule when
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
     * Calculates the start of the next valid occurrence of a particular schedule
     * that occurs on or after the specified start time.
     *
     * @param {String} dir: Direction to search in ('next' or 'prev')
     * @param {Date} startDate: The first possible valid occurrence
     */
    start: function (dir, startDate) {
      var next = startDate

      var nextVal = later.array[dir]

      var maxAttempts = 1000

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

      if (next !== later.NEVER) {
        next = dir === 'next' ? tickConstraint.start(next)
          : tickConstraint.end(next)
      }

      // if next, move to start of time period. needed when moving backwards
      return next
    },

    /**
     * Given a valid start time, finds the next schedule that is invalid.
     * Useful for finding the end of a valid time range.
     *
     * @param {Date} startDate: The first possible valid occurrence
     */
    end: function (dir, startDate) {
      var result

      var nextVal = later.array[dir + 'Invalid']

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
     * Ticks the date by the minimum constraint in this schedule
     *
     * @param {String} dir: Direction to tick in ('next' or 'prev')
     * @param {Date} date: The start date to tick from
     */
    tick: function (dir, date) {
      return new Date(dir === 'next'
        ? tickConstraint.end(date).getTime() + later.SEC
        : tickConstraint.start(date).getTime() - later.SEC)
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
 * Schedule
 * (c) 2013 Bill, BunKat LLC.
 *
 * Returns an object to calculate future or previous occurrences of the
 * specified schedule.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */
later.schedule = function (sched) {
  if (!sched) throw new Error('Missing schedule definition.')
  if (!sched.schedules) throw new Error('Definition must include at least one schedule.')

  // compile the schedule components
  var schedules = []

  var schedulesLen = sched.schedules.length

  var exceptions = []

  var exceptionsLen = sched.exceptions ? sched.exceptions.length : 0

  for (var i = 0; i < schedulesLen; i++) {
    schedules.push(later.compile(sched.schedules[i]))
  }

  for (var j = 0; j < exceptionsLen; j++) {
    exceptions.push(later.compile(sched.exceptions[j]))
  }

  /**
   * Calculates count number of instances or ranges for the current schedule,
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

    var maxAttempts = 1000

    var schedStarts = []; var exceptStarts = []

    var next; var end; var results = []

    var isForward = dir === 'next'

    var lastResult

    var rStart = isForward ? 0 : 1

    var rEnd = isForward ? 1 : 0

    startDate = startDate ? new Date(startDate) : new Date()
    if (!startDate || !startDate.getTime()) throw new Error('Invalid start date.')

    // Step 1: calculate the earliest start dates for each schedule and exception
    setNextStarts(dir, schedules, schedStarts, startDate)
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
          updateNextStarts(dir, schedules, schedStarts, end)
          continue
        }
      }

      // Step 5: Date is good, if range, find the end of the range and update start dates
      if (isRange) {
        var maxEndDate = calcMaxEndDate(exceptStarts, compare)
        end = calcEnd(dir, schedules, schedStarts, next, maxEndDate)
        var r = isForward
          ? [
            new Date(Math.max(startDate, next)),
            end ? new Date(endDate ? Math.min(end, endDate) : end) : undefined
          ]
          : [
            end ? (new Date(endDate ? Math.max(endDate, end.getTime() + later.SEC) : end.getTime() + later.SEC)) : undefined,
            new Date(Math.min(startDate, next.getTime() + later.SEC))
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
        updateNextStarts(dir, schedules, schedStarts, end)
      } else {
        // otherwise store the start date and tick the start dates
        results.push(isForward
          ? new Date(Math.max(startDate, next))
          : getStart(schedules, schedStarts, next, endDate)
        )

        tickStarts(dir, schedules, schedStarts, next)
      }

      loopCount--
    }

    // clean the dates that will be returned to remove any cached properties
    // that were added during the schedule process
    for (var i = 0, len = results.length; i < len; i++) {
      var result = results[i]
      results[i] = Object.prototype.toString.call(result) === '[object Array]'
        ? [cleanDate(result[0]), cleanDate(result[1])]
        : cleanDate(result)
    }

    return results.length === 0 ? later.NEVER : count === 1 ? results[0] : results
  }

  /**
   * Calculates all instances for the current schedule between the specified startDate and endDate.
   * If endDate is not specified, the maximum number of results returned is 1000
   *
   * @param {Date} startDate: The earliest date a valid instance can occur on
   * @param {Date} endDate: The latest date a valid instance can occur on
   */
  function getAllInstances (startDate, endDate) {
    const dir = 'next'
    var compare = compareFn(dir)
    // encapsulates difference between directions

    var maxAttempts = 1000

    var schedStarts = []; var exceptStarts = []

    var next; var end; var results = []

    var isForward = dir === 'next'

    startDate = startDate ? new Date(startDate) : new Date()
    if (!startDate || !startDate.getTime()) throw new Error('Invalid start date.')

    // Step 1: calculate the earliest start dates for each schedule and exception
    setNextStarts(dir, schedules, schedStarts, startDate)
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
          updateNextStarts(dir, schedules, schedStarts, end)
          continue
        }
      }

      // Step 5: Date is good, if range, find the end of the range and update start dates
      // otherwise store the start date and tick the start dates
      results.push(isForward
        ? new Date(Math.max(startDate, next))
        : getStart(schedules, schedStarts, next, endDate)
      )

      tickStarts(dir, schedules, schedStarts, next)
    }

    // clean the dates that will be returned to remove any cached properties
    // that were added during the schedule process
    for (var i = 0, len = results.length; i < len; i++) {
      var result = results[i]
      results[i] = Object.prototype.toString.call(result) === '[object Array]'
        ? [cleanDate(result[0]), cleanDate(result[1])]
        : cleanDate(result)
    }

    return results.length === 0 ? later.NEVER : results
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
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function setNextStarts (dir, schedArr, startsArr, startDate) {
    for (var i = 0, len = schedArr.length; i < len; i++) {
      startsArr[i] = schedArr[i].start(dir, startDate)
    }
  }

  /**
   * Updates the set of cached start dates to the next valid start dates. Only
   * schedules where the current start date is less than or equal to the
   * specified startDate need to be updated.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
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
   * schedules where the current start date is less than or equal to the
   * specified startDate need to be updated.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function setRangeStarts (dir, schedArr, rangesArr, startDate) {
    for (var i = 0, len = schedArr.length; i < len; i++) {
      var nextStart = schedArr[i].start(dir, startDate)

      if (!nextStart) {
        rangesArr[i] = later.NEVER
      } else {
        rangesArr[i] = [nextStart, schedArr[i].end(dir, nextStart)]
      }
    }
  }

  /**
   * Updates the set of cached ranges to the next valid ranges. Only
   * schedules where the current start date is less than or equal to the
   * specified startDate need to be updated.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: Starts earlier than this date will be calculated
   */
  function updateRangeStarts (dir, schedArr, rangesArr, startDate) {
    var compare = compareFn(dir)

    for (var i = 0, len = schedArr.length; i < len; i++) {
      if (rangesArr[i] && !compare(rangesArr[i][0], startDate)) {
        var nextStart = schedArr[i].start(dir, startDate)

        if (!nextStart) {
          rangesArr[i] = later.NEVER
        } else {
          rangesArr[i] = [nextStart, schedArr[i].end(dir, nextStart)]
        }
      }
    }
  }

  /**
   * Increments all schedules with next start equal to startDate by one tick.
   * Tick size is determined by the smallest constraint within a schedule.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: The date that should cause a schedule to tick
   */
  function tickStarts (dir, schedArr, startsArr, startDate) {
    for (var i = 0, len = schedArr.length; i < len; i++) {
      if (startsArr[i] && startsArr[i].getTime() === startDate.getTime()) {
        startsArr[i] = schedArr[i].start(dir, schedArr[i].tick(dir, startDate))
      }
    }
  }

  /**
   * Determines the start date of the schedule that produced startDate
   *
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
   * @param {Date} startDate: The date that should cause a schedule to tick
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
   * Calculates the end of the overlap between any exception schedule and the
   * specified start date. Returns undefined if there is no overlap.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} rangesArr: The set of cached start dates for the schedules
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
   * Calculates the earliest start of an exception schedule, this is the maximum
   * end date of the schedule.
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
   * Calculates the next invalid date for a particular schedules starting from
   * the specified valid start date.
   *
   * @param {String} dir: The direction to use, either 'next' or 'prev'
   * @param {Array} schedArr: The set of compiled schedules to use
   * @param {Array} startsArr: The set of cached start dates for the schedules
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
     * Returns true if d is a valid occurrence of the current schedule.
     *
     * @param {Date} d: The date to check
     */
    isValid: function (d) {
      return getInstances('next', 1, d, d) !== later.NEVER
    },

    /**
     * Finds the next valid instance or instances of the current schedule,
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
     * Finds the previous valid instance or instances of the current schedule,
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
     * Finds the next valid range or ranges of the current schedule,
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
     * Finds the previous valid range or ranges of the current schedule,
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
/**
 * Set Timeout
 * (c) 2013 Bill, BunKat LLC.
 *
 * Works similar to setTimeout() but allows you to specify a Later schedule
 * instead of milliseconds.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.setTimeout = function (fn, sched) {
  var s = later.schedule(sched); var t
  if (fn) {
    scheduleTimeout()
  }

  /**
   * Schedules the timeout to occur. If the next occurrence is greater than the
   * max supported delay (2147483647 ms) than we delay for that amount before
   * attempting to schedule the timeout again.
   */
  function scheduleTimeout () {
    var now = Date.now()

    var next = s.next(2, now)

    if (!next[0]) {
      t = undefined
      return
    }

    var diff = next[0].getTime() - now

    // minimum time to fire is one second, use next occurrence instead
    if (diff < 1000) {
      diff = next[1] ? next[1].getTime() - now : 1000
    }

    if (diff < 2147483647) {
      t = setTimeout(fn, diff)
    } else {
      t = setTimeout(scheduleTimeout, 2147483647)
    }
  }

  return {

    isDone: function () {
      return !t
    },

    /**
     * Clears the timeout.
     */
    clear: function () {
      clearTimeout(t)
    }

  }
}
/**
 * Set Interval
 * (c) 2013 Bill, BunKat LLC.
 *
 * Works similar to setInterval() but allows you to specify a Later schedule
 * instead of milliseconds.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.setInterval = function (fn, sched) {
  if (!fn) {
    return
  }

  var t = later.setTimeout(scheduleTimeout, sched)

  var done = t.isDone()

  /**
   * Executes the specified function and then sets the timeout for the next
   * interval.
   */
  function scheduleTimeout () {
    if (!done) {
      fn()
      t = later.setTimeout(scheduleTimeout, sched)
    }
  }

  return {

    isDone: function () {
      return t.isDone()
    },

    /**
     * Clears the timeout.
     */
    clear: function () {
      done = true
      t.clear()
    }

  }
}
later.date = {}

/**
 * Timezone
 * (c) 2013 Bill, BunKat LLC.
 *
 * Configures helper functions to switch between using local time and UTC. Later
 * uses UTC time by default.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.date.timezone = function (useLocalTime) {
  // configure the date builder used to create new dates in the right timezone
  later.date.build = useLocalTime
    ? function (Y, M, D, h, m, s) {
      return new Date(Y, M, D, h, m, s)
    }
    : function (Y, M, D, h, m, s) {
      return new Date(Date.UTC(Y, M, D, h, m, s))
    }

  // configure the accessor methods
  var get = useLocalTime ? 'get' : 'getUTC'

  var d = Date.prototype

  later.date.getYear = d[get + 'FullYear']
  later.date.getMonth = d[get + 'Month']
  later.date.getDate = d[get + 'Date']
  later.date.getDay = d[get + 'Day']
  later.date.getHour = d[get + 'Hours']
  later.date.getMin = d[get + 'Minutes']
  later.date.getSec = d[get + 'Seconds']

  // set the isUTC flag
  later.date.isUTC = !useLocalTime
}

// friendly names for available timezones
later.date.UTC = function () {
  later.date.timezone(false)
}
later.date.localTime = function () {
  later.date.timezone(true)
}

// use UTC by default
later.date.UTC()
/**
 * Date Constants
 * (c) 2013 Bill, BunKat LLC.
 *
 * Useful constants for dealing with time conversions.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

// Time to milliseconds conversion
later.SEC = 1000
later.MIN = later.SEC * 60
later.HOUR = later.MIN * 60
later.DAY = later.HOUR * 24
later.WEEK = later.DAY * 7

// Array of days in each month, must be corrected for leap years
later.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

// constant for specifying that a schedule can never occur
later.NEVER = 0
/**
 * Next
 * (c) 2013 Bill, BunKat LLC.
 *
 * Creates a new Date object defaulted to the first second after the specified
 * values.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
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
later.date.next = function (Y, M, D, h, m, s) {
  return later.date.build(
    Y,
    M !== undefined ? M - 1 : 0,
    D !== undefined ? D : 1,
    h || 0,
    m || 0,
    s || 0)
}
/**
 * Next Rollover
 * (c) 2013 Bill, BunKat LLC.
 *
 * Determines if a value will cause a particualr constraint to rollover to the
 * next largest time period. Used primarily when a constraint has a
 * variable extent.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.date.nextRollover = function (d, val, constraint, period) {
  var cur = constraint.val(d)

  var max = constraint.extent(d)[1]

  return (((val || max) <= cur) || val > max)
    ? new Date(period.end(d).getTime() + later.SEC)
    : period.start(d)
}
/**
 * Prev
 * (c) 2013 Bill, BunKat LLC.
 *
 * Creates a new Date object defaulted to the last second after the specified
 * values.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
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
later.date.prev = function (Y, M, D, h, m, s) {
  var len = arguments.length
  M = len < 2 ? 11 : M - 1
  D = len < 3 ? later.D.extent(later.date.next(Y, M + 1))[1] : D
  h = len < 4 ? 23 : h
  m = len < 5 ? 59 : m
  s = len < 6 ? 59 : s

  return later.date.build(Y, M, D, h, m, s)
}
/**
 * Prev Rollover
 * (c) 2013 Bill, BunKat LLC.
 *
 * Determines if a value will cause a particualr constraint to rollover to the
 * previous largest time period. Used primarily when a constraint has a
 * variable extent.
 *
 * Later is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/later
 */

later.date.prevRollover = function (d, val, constraint, period) {
  var cur = constraint.val(d)

  return (val >= cur || !val)
    ? period.start(period.prev(d, period.val(d) - 1))
    : period.start(d)
}

module.exports = later
