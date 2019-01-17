/* eslint-env mocha */
var recurrify = require('../../index')

var recurrence = recurrify.recurrence

var should = require('should')

describe('recurrence', function () {
  recurrify.date.UTC()

  describe('isValid', function () {
    var d = new Date('2013-03-21T00:00:05Z')

    it('should return true if date is valid', function () {
      var s = { recurrences: [{ Y: [2013], M: [3], D: [21], s: [5] }] }
      recurrence(s).isValid(d).should.eql(true)
    })

    it('should return false if date is invalid', function () {
      var s = { recurrences: [{ Y: [2012] }] }
      recurrence(s).isValid(d).should.eql(false)
    })
  })

  describe('next', function () {
    var d = new Date('2013-03-21T00:00:05Z')

    var e = new Date('2016-01-01T00:00:05Z')

    it('should return the start date if it is valid', function () {
      var s = { recurrences: [{ Y: [2013], M: [3], D: [21], s: [5] }] }
      recurrence(s).next(1, d).should.eql(d)
    })

    it('should return next valid date if one exists', function () {
      var s = { recurrences: [{ Y: [2015] }] }
      recurrence(s).next(1, d).should.eql(new Date('2015-01-01T00:00:00Z'))
    })

    it('should return next valid date if one exists with composite', function () {
      var s = { recurrences: [{ Y: [2017] }, { Y: [2015] }] }
      recurrence(s).next(1, d).should.eql(new Date('2015-01-01T00:00:00Z'))
    })

    it('should return next valid date if one exists with exceptions', function () {
      var s = { recurrences: [{ Y: [2015, 2016, 2017] }], exceptions: [{ Y: [2015] }] }
      recurrence(s).next(1, d).should.eql(new Date('2016-01-01T00:00:00Z'))
    })

    it('should return count valid dates if they exist', function () {
      var s = { recurrences: [{ Y: [2015, 2016, 2017] }] }
      recurrence(s).next(3, d).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2016-01-01T00:00:00Z'),
        new Date('2017-01-01T00:00:00Z')
      ])
    })

    it('should return recurrify.NEVER if no next valid date exists', function () {
      var s = { recurrences: [{ Y: [2012] }] }
      should.equal(recurrence(s).next(1, d), recurrify.NEVER)
    })

    it('should return recurrify.NEVER if end date precludes a valid recurrence', function () {
      var s = { recurrences: [{ Y: [2017] }] }
      should.equal(recurrence(s).next(1, d, e), recurrify.NEVER)
    })
  })

  describe('prev', function () {
    var d = new Date('2013-03-21T00:00:05Z')

    var e = new Date('2010-01-01T00:00:05Z')

    it('should return the start date if it is valid', function () {
      var s = { recurrences: [{ Y: [2013], M: [3], D: [21], s: [5] }] }
      recurrence(s).prev(1, d).should.eql(d)
    })

    it('should return prev valid date if one exists', function () {
      var s = { recurrences: [{ Y: [2012] }] }
      recurrence(s).prev(1, d).should.eql(new Date('2012-01-01T00:00:00Z'))
    })

    it('should return prev valid date if one exists with exceptions', function () {
      var s = { recurrences: [{ Y: [2012, 2013, 2014] }], exceptions: [{ Y: [2013] }] }
      recurrence(s).prev(1, d).should.eql(new Date('2012-01-01T00:00:00Z'))
    })

    it('should return count valid dates if they exist', function () {
      var s = { recurrences: [{ Y: [2010, 2011, 2012] }] }
      recurrence(s).prev(3, d).should.eql([
        new Date('2012-01-01T00:00:00Z'),
        new Date('2011-01-01T00:00:00Z'),
        new Date('2010-01-01T00:00:00Z')
      ])
    })

    it('should return recurrify.NEVER if no prev valid date exists', function () {
      var s = { recurrences: [{ Y: [2017] }] }
      should.equal(recurrence(s).prev(1, d), recurrify.NEVER)
    })

    it('should return recurrify.NEVER if end date precludes a valid recurrence', function () {
      var s = { recurrences: [{ Y: [2009] }] }
      should.equal(recurrence(s).prev(1, d, e), recurrify.NEVER)
    })
  })

  describe('nextRange', function () {
    it('should return next valid range if one exists', function () {
      var d = new Date('2013-03-21T00:00:05Z')

      var s = { recurrences: [{ Y: [2015, 2016, 2017] }] }
      recurrence(s).nextRange(1, d).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2018-01-01T00:00:00Z')
      ])
    })

    it('should correctly calculate ranges', function () {
      var d = new Date('2013-03-21T00:00:05Z')

      var s = {
        recurrences: [{ dw: [2, 3, 4, 5, 6], h_a: [8], h_b: [16] }],
        exceptions:
          [{ fd_a: [1362420000000], fd_b: [1362434400000] },
            { fd_a: [1363852800000], fd_b: [1363860000000] },
            { fd_a: [1364499200000], fd_b: [1364516000000] }]
      }

      recurrence(s).nextRange(1, d).should.eql([
        new Date('2013-03-21T10:00:00Z'),
        new Date('2013-03-21T16:00:00Z')
      ])
    })

    it('should return undefined as end if there is no end date', function () {
      var d = new Date('2013-03-21T00:00:05Z')

      var s = {
        recurrences: [{ fd_a: [1363824005000] }]
      }

      recurrence(s).nextRange(3, d).should.eql([
        [new Date('2013-03-21T00:00:05Z'), undefined]
      ])
    })
  })

  describe('prevRange', function () {
    var d = new Date('2013-03-21T00:00:05Z')

    it('should return next valid range if one exists', function () {
      var s = { recurrences: [{ Y: [2011, 2012] }] }
      recurrence(s).prevRange(1, d).should.eql([
        new Date('2011-01-01T00:00:00Z'),
        new Date('2013-01-01T00:00:00Z')
      ])
    })

    it('should return undefined as end if there is no end date', function () {
      var d = new Date('2013-03-21T00:00:05Z')

      var s = {
        recurrences: [{ fd_b: [1363824005000] }]
      }

      recurrence(s).prevRange(3, d).should.eql([
        [undefined, new Date('2013-03-21T00:00:05Z')]
      ])
    })
  })

  describe('all', function () {
    it('should return the start date as the first entry in results if it is valid', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const s = { recurrences: [{ Y: [2013], M: [3], D: [21], s: [5] }] }
      recurrence(s).all(startDate)[0].should.eql(startDate)
    })

    it('should return all valid dates if one exists', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const endDate = new Date('2020-01-01T00:00:05Z')
      const s = { recurrences: [{ Y: [2015, 2016, 2018] }] }

      recurrence(s).all(startDate, endDate).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2016-01-01T00:00:00Z'),
        new Date('2018-01-01T00:00:00Z')
      ])
    })

    // TODO: bug - doesn't work
    it.skip('should return all valid dates with year only composite', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const endDate = new Date('2020-01-01T00:00:05Z')
      var s = { recurrences: [{ Y: [2017] }, { Y: [2015] }, { Y: [2018] }] }

      recurrence(s).all(startDate, endDate).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2017-01-01T00:00:00Z'),
        new Date('2018-01-01T00:00:00Z')
      ])
    })

    it('should return all valid dates with composite', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      var s = { recurrences: [{ Y: [2017] }, { Y: [2015] }] }

      recurrence(s).all(startDate).should.eql([
        new Date('2015-01-01T00:00:00Z'),
        new Date('2017-01-01T00:00:00Z')
      ])
    })

    it('should return every Tue,Thu at 4:30 in October 2018', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const endDate = new Date('2018-11-01T00:00:00Z')
      const s = {
        recurrences: [
          { dw: [3, 5], h: [4], m: [30] }
        ]
      }
      recurrence(s).all(startDate, endDate).should.eql([
        new Date('2018-10-02T04:30:00.000Z'),
        new Date('2018-10-04T04:30:00.000Z'),
        new Date('2018-10-09T04:30:00.000Z'),
        new Date('2018-10-11T04:30:00.000Z'),
        new Date('2018-10-16T04:30:00.000Z'),
        new Date('2018-10-18T04:30:00.000Z'),
        new Date('2018-10-23T04:30:00.000Z'),
        new Date('2018-10-25T04:30:00.000Z'),
        new Date('2018-10-30T04:30:00.000Z')
      ])
    })

    it('should return all with composite', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const endDate = new Date('2018-11-01T00:00:00Z')
      const s = {
        recurrences: [
          { dw: [3, 5], h: [4], m: [30] },
          { dw: [1], h: [1], m: [0] }
        ]
      }
      recurrence(s).all(startDate, endDate).should.eql([
        new Date('2018-10-02T04:30:00.000Z'),
        new Date('2018-10-04T04:30:00.000Z'),
        new Date('2018-10-07T01:00:00.000Z'),
        new Date('2018-10-09T04:30:00.000Z'),
        new Date('2018-10-11T04:30:00.000Z'),
        new Date('2018-10-14T01:00:00.000Z'),
        new Date('2018-10-16T04:30:00.000Z'),
        new Date('2018-10-18T04:30:00.000Z'),
        new Date('2018-10-21T01:00:00.000Z'),
        new Date('2018-10-23T04:30:00.000Z'),
        new Date('2018-10-25T04:30:00.000Z'),
        new Date('2018-10-28T01:00:00.000Z'),
        new Date('2018-10-30T04:30:00.000Z')
      ])
    })

    it('should return all with composite with exception', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const endDate = new Date('2018-11-01T00:00:00Z')
      const s = {
        recurrences: [
          { dw: [3, 5], h: [4], m: [30] },
          { dw: [1], h: [1], m: [0] }
        ],
        exceptions: [
          { D: [2, 21] }
        ]
      }
      recurrence(s).all(startDate, endDate).should.eql([
        new Date('2018-10-04T04:30:00.000Z'),
        new Date('2018-10-07T01:00:00.000Z'),
        new Date('2018-10-09T04:30:00.000Z'),
        new Date('2018-10-11T04:30:00.000Z'),
        new Date('2018-10-14T01:00:00.000Z'),
        new Date('2018-10-16T04:30:00.000Z'),
        new Date('2018-10-18T04:30:00.000Z'),
        new Date('2018-10-23T04:30:00.000Z'),
        new Date('2018-10-25T04:30:00.000Z'),
        new Date('2018-10-28T01:00:00.000Z'),
        new Date('2018-10-30T04:30:00.000Z')
      ])
    })

    it('should return recurrify.NEVER if no valid date exists', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const endDate = new Date('2018-11-01T00:00:00Z')
      const s = { recurrences: [{ Y: [2012] }] }
      should.equal(recurrence(s).all(startDate, endDate), recurrify.NEVER)
    })

    it('should return recurrify.NEVER if no valid date exists with only startDate passed', function () {
      const startDate = new Date('2018-10-01T00:00:00Z')
      const s = { recurrences: [{ Y: [2012] }] }
      should.equal(recurrence(s).all(startDate), recurrify.NEVER)
    })

    it('should return recurrify.NEVER if end date precludes a valid recurrence', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const endDate = new Date('2016-01-01T00:00:05Z')
      const s = { recurrences: [{ Y: [2017] }] }
      should.equal(recurrence(s).all(startDate, endDate), recurrify.NEVER)
    })

    it('should return all valid dates if one exists with exceptions', function () {
      const startDate = new Date('2013-03-21T00:00:05Z')
      const endDate = new Date('2020-01-01T00:00:05Z')
      const s = { recurrences: [{ Y: [2015, 2016, 2017, 2019] }], exceptions: [{ Y: [2015] }] }
      recurrence(s).all(startDate, endDate).should.eql([
        new Date('2016-01-01T00:00:00Z'),
        new Date('2017-01-01T00:00:00Z'),
        new Date('2019-01-01T00:00:00Z')
      ])
    })
    it('should work when a recurrence is specified that contains empty array values', function () {
      const startDate = new Date('2019-01-21T00:00:00Z')
      const endDate = new Date('2019-01-31T00:00:00Z')
      const s = { recurrences: [ { dw: [7], h: [], m: [30] } ] }
      recurrence(s).all(startDate, endDate).should.eql([
        new Date('2019-01-26T00:30:00.000Z'),
        new Date('2019-01-26T01:30:00.000Z'),
        new Date('2019-01-26T02:30:00.000Z'),
        new Date('2019-01-26T03:30:00.000Z'),
        new Date('2019-01-26T04:30:00.000Z'),
        new Date('2019-01-26T05:30:00.000Z'),
        new Date('2019-01-26T06:30:00.000Z'),
        new Date('2019-01-26T07:30:00.000Z'),
        new Date('2019-01-26T08:30:00.000Z'),
        new Date('2019-01-26T09:30:00.000Z'),
        new Date('2019-01-26T10:30:00.000Z'),
        new Date('2019-01-26T11:30:00.000Z'),
        new Date('2019-01-26T12:30:00.000Z'),
        new Date('2019-01-26T13:30:00.000Z'),
        new Date('2019-01-26T14:30:00.000Z'),
        new Date('2019-01-26T15:30:00.000Z'),
        new Date('2019-01-26T16:30:00.000Z'),
        new Date('2019-01-26T17:30:00.000Z'),
        new Date('2019-01-26T18:30:00.000Z'),
        new Date('2019-01-26T19:30:00.000Z'),
        new Date('2019-01-26T20:30:00.000Z'),
        new Date('2019-01-26T21:30:00.000Z'),
        new Date('2019-01-26T22:30:00.000Z'),
        new Date('2019-01-26T23:30:00.000Z')])
    })
  })
})
