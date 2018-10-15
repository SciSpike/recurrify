/* eslint-env mocha */
var cronicle = require('../../index')

describe('Modifier After', function () {
  describe('name', function () {
    it('should append "after" before a minute constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [15])
      after.name.should.equal('after ' + cronicle.m.name)
    })

    it('should append "after" before a time constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [15])
      after.name.should.equal('after ' + cronicle.t.name)
    })
  })

  describe('range', function () {
    it('should be the number of seconds covered by the minutes range', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [15])
      after.range.should.equal(44 * 60)
    })

    it('should be the number of seconds covered by the time range', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [60000])
      after.range.should.equal(26399)
    })
  })

  describe('val', function () {
    var d = new Date('2013-03-21T03:10:00Z')

    it('should return the correct minutes value when less than constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [5])
      after.val(d).should.equal(10)
    })

    it('should return the correct minutes value when greater than constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [15])
      after.val(d).should.equal(10)
    })

    it('should be the number of seconds covered by the time range when less than constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [10000])
      after.val(d).should.equal(11400)
    })

    it('should be the number of seconds covered by the time range when greater than constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [20000])
      after.val(d).should.equal(11400)
    })
  })

  describe('isValid', function () {
    var d = new Date('2013-03-21T03:10:00Z')

    it('should return true if the current minute val is greater than constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [5])
      after.isValid(d, 10).should.equal(true)
    })

    it('should return true if the current minute val is equal to the constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [10])
      after.isValid(d, 5).should.equal(true)
    })

    it('should return false if the current minute val is less than constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [15])
      after.isValid(d, 2).should.equal(false)
    })

    it('should return true if the current time val is greater than constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [10000])
      after.isValid(d, 30000).should.equal(true)
    })

    it('should return true if the current time val is equal to the constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [11400])
      after.isValid(d, 20000).should.equal(true)
    })

    it('should return false if the current time val is less than constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [20000])
      after.isValid(d, 15000).should.equal(false)
    })
  })

  describe('extent', function () {
    var d = new Date('2013-03-21T03:10:00Z')

    it('should return the minute extent', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [15])
      after.extent(d).should.eql(cronicle.m.extent(d))
    })

    it('should return the time extent', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [60000])
      after.extent(d).should.eql(cronicle.t.extent(d))
    })
  })

  describe('start', function () {
    var d = new Date('2013-03-21T03:10:00Z')

    it('should return the minute start', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [15])
      after.start(d).should.eql(cronicle.m.start(d))
    })

    it('should return the time start', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [60000])
      after.start(d).should.eql(cronicle.t.start(d))
    })
  })

  describe('end', function () {
    var d = new Date('2013-03-21T03:10:00Z')

    it('should return the minute end', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [15])
      after.end(d).should.eql(cronicle.m.end(d))
    })

    it('should return the time end', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [60000])
      after.end(d).should.eql(cronicle.t.end(d))
    })
  })

  describe('next', function () {
    var d = new Date('2013-03-21T03:10:00Z')

    it('should return start of range if val equals minute constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [15])
      after.next(d, 15).should.eql(new Date('2013-03-21T03:15:00Z'))
    })

    it('should return start of extent if val does not equal minute constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [10])
      after.next(d, 5).should.eql(new Date('2013-03-21T04:00:00Z'))
    })

    it('should return start of range if val equals time constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [11520])
      after.next(d, 11520).should.eql(new Date('2013-03-21T03:12:00Z'))
    })

    it('should return start of extent if val does not equal time constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [11520])
      after.next(d, 11521).should.eql(new Date('2013-03-22T00:00:00Z'))
    })
  })

  describe('prev', function () {
    var d = new Date('2013-03-21T03:10:00Z')

    it('should return end of range if val equals minute constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [15])
      after.prev(d, 15).should.eql(new Date('2013-03-21T02:59:59Z'))
    })

    it('should return start of range - 1 if val does not equal minute constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.m, [10])
      after.prev(d, 5).should.eql(new Date('2013-03-21T03:09:59Z'))
    })

    it('should return end of range if val equals time constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [11520])
      after.prev(d, 11520).should.eql(new Date('2013-03-20T23:59:59Z'))
    })

    it('should return start of range - 1 if val does not equal time constraint', function () {
      cronicle.date.UTC()
      var after = cronicle.modifier.after(cronicle.t, [11400])
      after.prev(d, 11521).should.eql(new Date('2013-03-21T03:09:59Z'))
    })
  })

  describe('compiled minute recurrence', function () {
    var c = cronicle.compile({ m_a: [30] })

    it('should tick to next consecutive minutes', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:31:00Z')

      var expected = new Date('2013-03-21T03:32:00Z')

      var actual = c.tick('next', d)

      actual.should.eql(expected)
    })

    it('should tick to prev consecutive minutes', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:26:00Z')

      var expected = new Date('2013-03-21T03:25:59Z')

      var actual = c.tick('prev', d)

      actual.should.eql(expected)
    })

    it('should go the next valid value when invalid', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:25:00Z')

      var expected = new Date('2013-03-21T03:30:00Z')

      var actual = c.start('next', d)

      actual.should.eql(expected)
    })

    it('should go the prev valid value when invalid', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:25:00Z')

      var expected = new Date('2013-03-21T02:59:59Z')

      var actual = c.start('prev', d)

      actual.should.eql(expected)
    })

    it('should go the end of constraint value when valid for prev', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:45:10Z')

      var expected = new Date('2013-03-21T03:45:59Z')

      var actual = c.start('prev', d)

      actual.should.eql(expected)
    })

    it('should go the start of constraint value when valid for next', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:45:10Z')

      var expected = new Date('2013-03-21T03:45:00Z')

      var actual = c.start('next', d)

      actual.should.eql(expected)
    })

    it('should go the end of the constraint', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:45:10Z')

      var expected = new Date('2013-03-21T04:00:00Z')

      var actual = c.end('next', d)

      actual.should.eql(expected)
    })
  })

  describe('compiled time recurrence', function () {
    var c = cronicle.compile({ t_a: [11400] })

    it('should tick to next consecutive minutes', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:31:00Z')

      var expected = new Date('2013-03-21T03:31:01Z')

      var actual = c.tick('next', d)

      actual.should.eql(expected)
    })

    it('should tick to prev consecutive minutes', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:26:00Z')

      var expected = new Date('2013-03-21T03:25:59Z')

      var actual = c.tick('prev', d)

      actual.should.eql(expected)
    })

    it('should go the next valid value when invalid', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:05:00Z')

      var expected = new Date('2013-03-21T03:10:00Z')

      var actual = c.start('next', d)

      actual.getTime().should.eql(expected.getTime())
    })

    it('should go the prev valid value when invalid', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:05:00Z')

      var expected = new Date('2013-03-20T23:59:59Z')

      var actual = c.start('prev', d)

      actual.getTime().should.eql(expected.getTime())
    })

    it('should go the start of constraint value when valid for prev', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:10:10Z')

      var expected = new Date('2013-03-21T03:10:10Z')

      var actual = c.start('prev', d)

      actual.getTime().should.eql(expected.getTime())
    })

    it('should go the start of constraint value when valid for next', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:10:10Z')

      var expected = new Date('2013-03-21T03:10:10Z')

      var actual = c.start('next', d)

      actual.getTime().should.eql(expected.getTime())
    })

    it('should go the end of the constraint', function () {
      cronicle.date.UTC()
      var d = new Date('2013-03-21T03:45:10Z')

      var expected = new Date('2013-03-22T00:00:00Z')

      var actual = c.end('next', d)

      actual.getTime().should.eql(expected.getTime())
    })
  })
})
