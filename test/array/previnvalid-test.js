/* eslint-env mocha */
var later = require('../../index')

var should = require('should')

describe('Later.array.prevInvalid', function () {
  it('should exist', function () {
    should.exist(later.array.prevInvalid)
  })

  it('should return the previous invalid value', function () {
    var arr = [1, 2, 5]

    var extent = [1, 5]

    var cur = 5

    var expected = 4

    var actual = later.array.prevInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })

  it('should return the previous invalid value when less than arr', function () {
    var arr = [2, 3, 5]

    var extent = [1, 10]

    var cur = 3

    var expected = 1

    var actual = later.array.prevInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })

  it('should return the previous invalid value when zero value is largest', function () {
    var arr = [1, 2, 5, 0]

    var extent = [1, 31]

    var cur = 31

    var expected = 30

    var actual = later.array.prevInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })

  it('should return the previous invalid value when zero value is smallest', function () {
    var arr = [0, 1, 2, 5, 10]

    var extent = [0, 10]

    var cur = 2

    var expected = 9

    var actual = later.array.prevInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })

  it('should return the current value if it is invalid', function () {
    var arr = [0, 1, 2, 5, 10]

    var extent = [0, 10]

    var cur = 4

    var expected = 4

    var actual = later.array.prevInvalid(cur, arr, extent)

    actual.should.eql(expected)
  })

  it('should return undefined if there is no invalid value', function () {
    var arr = [0, 1, 2, 3, 4, 5]

    var extent = [0, 5]

    var cur = 4

    should.not.exist(later.array.prevInvalid(cur, arr, extent))
  })
})
