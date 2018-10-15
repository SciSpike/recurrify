/* eslint-env mocha */
var recurrify = require('../../index')

var should = require('should')

describe('recurrify.array.sort', function () {
  it('should exist', function () {
    should.exist(recurrify.array.sort)
  })

  it('should not modify arrays that are already sorted', function () {
    var arr = [1, 2, 3, 4, 5]

    var expected = [1, 2, 3, 4, 5]

    recurrify.array.sort(arr)
    arr.should.eql(expected)
  })

  it('should sort in natural order', function () {
    var arr = [6, 9, 2, 4, 3]

    var expected = [2, 3, 4, 6, 9]

    recurrify.array.sort(arr)
    arr.should.eql(expected)
  })

  it('should put zero at the front by default', function () {
    var arr = [6, 9, 2, 0, 4, 3]

    var expected = [0, 2, 3, 4, 6, 9]

    recurrify.array.sort(arr)
    arr.should.eql(expected)
  })

  it('should put zero at the end if zeroIsLast is true', function () {
    var arr = [6, 9, 2, 0, 4, 3]

    var expected = [2, 3, 4, 6, 9, 0]

    recurrify.array.sort(arr, true)
    arr.should.eql(expected)
  })
})
