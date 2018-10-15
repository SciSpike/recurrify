/* eslint-env mocha */
var recurrify = require('../../index')

var should = require('should')

describe('recurrify.array.nextInvalid', function () {
  it('should exist', function () {
    should.exist(recurrify.array.nextInvalid)
  })

  it('should return the next invalid value', function () {
    var arr = [1, 2, 5]

    var extent = [1, 5]

    var cur = 2

    var expected = 3

    var actual = recurrify.array.nextInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })

  it('should return the next invalid value when greater than arr', function () {
    var arr = [1, 2, 5]

    var extent = [1, 10]

    var cur = 5

    var expected = 6

    var actual = recurrify.array.nextInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })

  it('should return the next invalid value when zero value is largest', function () {
    var arr = [1, 2, 5, 0]

    var extent = [1, 31]

    var cur = 31

    var expected = 3

    var actual = recurrify.array.nextInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })

  it('should return the next invalid value when zero value is smallest', function () {
    var arr = [0, 1, 2, 5, 10]

    var extent = [0, 10]

    var cur = 10

    var expected = 3

    var actual = recurrify.array.nextInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })

  it('should return the current value if it is invalid', function () {
    var arr = [0, 1, 2, 5, 10]

    var extent = [0, 10]

    var cur = 4

    var expected = 4

    var actual = recurrify.array.nextInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })
})
