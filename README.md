# cronicle

## Installation

`$ npm install cronicle`

## Example usage

```
const cronicle = require('cronicle')

const startDate = new Date('2018-10-01T13:00:00Z')
const endDate = new Date('2018-10-01T15:00:00Z')

// every 5 minutes
const sched = { 'schedules': [{ 'm': [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] }] }
const occurrences = cronicle.schedule(sched).all(startDate, endDate)
console.log(occurrences)
```

### Result
```
$ node example.js
[ 2018-10-01T13:00:00.000Z,
  2018-10-01T13:05:00.000Z,
  2018-10-01T13:10:00.000Z,
  2018-10-01T13:15:00.000Z,
  2018-10-01T13:20:00.000Z,
  2018-10-01T13:25:00.000Z,
  2018-10-01T13:30:00.000Z,
  2018-10-01T13:35:00.000Z,
  2018-10-01T13:40:00.000Z,
  2018-10-01T13:45:00.000Z,
  2018-10-01T13:50:00.000Z,
  2018-10-01T13:55:00.000Z,
  2018-10-01T14:00:00.000Z,
  2018-10-01T14:05:00.000Z,
  2018-10-01T14:10:00.000Z,
  2018-10-01T14:15:00.000Z,
  2018-10-01T14:20:00.000Z,
  2018-10-01T14:25:00.000Z,
  2018-10-01T14:30:00.000Z,
  2018-10-01T14:35:00.000Z,
  2018-10-01T14:40:00.000Z,
  2018-10-01T14:45:00.000Z,
  2018-10-01T14:50:00.000Z,
  2018-10-01T14:55:00.000Z,
  2018-10-01T15:00:00.000Z ]
```

## Running tests

`$ npm test`

## Schedules
Schedules in Cronicle are json objects that define a set of time periods along with the values that should be considered valid for that time period. The combination of a time period with their valid values is called a *constraint*. Cronicle then takes all of the constraints that have been defined and finds dates that match all of them.

Since Cronicle schedules are json objects, they can easily be serialized and stored in caches and databases as needed. They are also completely deterministic which means a schedule will always produce exactly the same valid occurrences. Therefore, occurrences never need to be stored as they can always be recalculated from the schedule definition.

## Basic schedules
A basic schedule is a set of time periods along with their valid values. A date is only considered valid if it meets all of the constraints within a basic schedule. A basic schedule can include as many time periods (with or without modifiers) as needed, in any order.

```
// a basic schedule that is valid every day at 10:15am and 10:45am
const basic = {h: [10], m: [15,45]}
```

Here we can see a schedule is made up of objects with properties that correspond to the various time periods. In this case `h` is the hour time period and `m` is the minute time period. The values to consider valid are always stored in an array as the value of the property.


**Note:** Basic schedules are only valid as part of a complete schedule definition.

## Composite schedules
Multiple basic schedules can be combined into a single composite schedule by placing them into an array. A date is considered valid if any of the basic schedules are valid (basically an OR of all of the basic schedules). A composite schedule can contain as many basic schedules as needed.

```
// a composite schedule that is valid every day at 10:15am and 10:45am
// and every day at 5:30pm
const composite = [
  {h: [10], m: [15,45]},
  {h: [17], m: [30]}
]

```

**Note:** Composite schedules are only valid as part of a complete schedule definition.

## Exception schedules
An exception schedule is a basic or composite schedule that defines when a schedule should be considered invalid. A date is considered invalid if any of the basic schedules within an exception schedule are valid.

```
// an exception schedule that makes any date in March as
// well as any Monday of any month invalid
const exception = [
  {M: [3]},
  {dw: [2]}
]
```

**Note:** Exception schedules are only valid as part of a complete schedule definition.

## Complete definition
A complete definition is a json object that at a minimum contains a `schedules` property that defines a composite schedule with at least one basic schedule. Optionally, the definition can also include an `exceptions` property that defines a composite exception schedule.


A valid schedule that fires every 10 minutes. The composite schedule is always placed in an object under a property named `schedules`. Even if you only have a basic schedule, the `schedules` property must be an array.

```
const schedule = {
  schedules: [
    {m: [0,10,20,30,40,50]}
  ]
}
```

A valid schedule definition that includes exceptions with modifiers. Here we see the composite exception schedule is always placed in an object under a property named `exceptions`. Even if you only have a basic exception schedule, the `exceptions` property must be an array.

```
const schedule = {
  schedules: [
    {h: [10], m: [15,45]},
    {h: [17], m: [30]}
  ],
  exceptions: [
    {M_a: [3]},
    {dw: [2]}
  ]
}
```

## Performance considerations
While Cronicle has been designed to efficiently calculate occurrences for all types and complexities of schedules, there are a few things to keep in mind for applications that have particularly high performance requirements.

* Basic time periods perform the best. These include years, months, days, hours, minutes, and seconds. Calculating ISO week of year is particularly expensive.
* Schedules without exceptions perform better than those with exceptions. Defining your schedule without the need for exceptions will improve performance.
* Use the `time` time period instead of specifying hours and minutes seperately when possible. Reducing the number of constraints will generally improve performance.
* Using `after` and `before` modifiers to eliminate the need for specifying a lot of valid values will improve performance, especially when calculating ranges.


## Time periods
Time periods are the crux of the Cronicle library and are used to define new schedules. Cronicle comes with a large assortment of time periods and is also fully extensible making it easy to create custom time periods.

While time periods are primarily used by Cronicle to define schedules and calculate occurrences, they are also useful for performing time based calculations. Calculating values such as ISO week number, moving between days of the year, or figuring out how many days are in a month are all possible using the time period interface.

If you don't see the time period that you need for your schedule, Cronicle is fully extensible and it is easy to write your own. See the custom time period at the bottom of this page for an example.

## Interface
All time periods implement the same public interface for interacting with them:

**name**
The name of the time period.

**range**
The rough number of seconds that are covered when moving from one instance of this time period to the next instance.

**val(*date*)**
The value of this time period for the date specified.

**isValid(*date, value*)**
True if the specified value is valid for the specified date, false otherwise.

**extent(*date*)**
The minimum and maximum valid values for the time period for the specified date. If the minimum value is not 0, 0 can be specified in schedules to indicate the maximum value. This makes working with non-constant extents (like days in a month) easier.

**start(*date*)**
The first second in which the value is the same as the value of the specified date. For example, the start of an hour would be the hour with 0 minutes and 0 seconds.

**end(*date*)**
The last second in which the value is the same as the value of the specified date. For example, the end of an hour would be the hour with 59 minutes and 59 seconds.

**next(*date, value*)**
Returns the next date where the value is the value specified. Sets the value to 1 if value specified is greater than the max allowed value.

**prev(*date, value*)**
Returns the previous date where the value is the value specified. Sets the value to the max allowed value if the value specified is greater than the max allowed value.


## Second (second, s)
Seconds in a minute, from 0 to 59.


Using seconds in a schedule:

`const sched = {schedules: [{s: [0, 15, 30, 45]}]}`

Performing seconds based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.second.name;
--> 'second'

cronicle.second.range;
--> 1

cronicle.second.val(d);
--> 5

cronicle.second.isValid(d, 10);
--> false

cronicle.second.extent();
--> [0, 59]

cronicle.second.start(d);
--> 'Fri, 22 Mar 2013 10:02:05 GMT'

cronicle.second.end(d);
--> 'Fri, 22 Mar 2013 10:02:05 GMT'

cronicle.second.next(d, 27);
--> 'Fri, 22 Mar 2013 10:02:27 GMT'

cronicle.second.prev(d, 27);
--> 'Fri, 22 Mar 2013 10:01:27 GMT'
```

## Minute (minute, m)
Minutes in an hour, from 0 to 59.


Using minutes in a schedule:

`const sched = {schedules: [{m: [0, 15, 30, 45]}]}`

Performing minutes based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.minute.name;
--> 'minute'

cronicle.minute.range;
--> 60

cronicle.minute.val(d);
--> 2

cronicle.minute.isValid(d, 2);
--> true

cronicle.minute.extent();
--> [0, 59]

cronicle.minute.start(d);
--> 'Fri, 22 Mar 2013 10:02:00 GMT'

cronicle.minute.end(d);
--> 'Fri, 22 Mar 2013 10:02:59 GMT'

cronicle.minute.next(d, 27);
--> 'Fri, 22 Mar 2013 10:27:00 GMT'

cronicle.minute.prev(d, 27);
--> 'Fri, 22 Mar 2013 09:27:59 GMT'
```

## Hour (hour, h)
Hours in a day, from 0 to 23.


Using hours in a schedule:

`const sched = {schedules: [{h: [0, 5, 12]}]}`

Performing hours based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.hour.name;
--> 'hour'

cronicle.hour.range;
--> 3600

cronicle.hour.val(d);
--> 10

cronicle.hour.isValid(d, 2);
--> false

cronicle.hour.extent();
--> [0, 23]

cronicle.hour.start(d);
--> 'Fri, 22 Mar 2013 10:00:00 GMT'

cronicle.hour.end(d);
--> 'Fri, 22 Mar 2013 10:59:59 GMT'

cronicle.hour.next(d, 5);
--> 'Sat, 23 Mar 2013 05:00:00 GMT'

cronicle.hour.prev(d, 21);
--> 'Thu, 21 Mar 2013 21:59:59 GMT'
```

## Time (time, t)
Time of day, represented as seconds since midnight. From 0 to 86399.


Using time in a schedule:

`const sched = {schedules: [{t: [6500]}]}`

Performing time based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.time.name;
--> 'time'

cronicle.time.range;
--> 1

cronicle.time.val(d);
--> 36125

cronicle.time.isValid(d, 36125);
--> true

cronicle.time.extent();
--> [0, 86399]

cronicle.time.start(d);
--> 'Fri, 22 Mar 2013 00:00:00 GMT'

cronicle.time.end(d);
--> 'Fri, 22 Mar 2013 23:59:59 GMT'

cronicle.time.next(d, 60);
--> 'Sat, 23 Mar 2013 00:01:00 GMT'

cronicle.time.prev(d, 60);
--> 'Fri, 22 Mar 2013 00:01:00 GMT'
```

## Day (day, D)
Days of a month, from 1 to max days in month. Specify 0 for the last day of the month.


Using days in a schedule:

`const sched = {schedules: [{D: [0]}]}`

Performing day based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.day.name;
--> 'day'

cronicle.day.range;
--> 86400

cronicle.day.val(d);
--> 22

cronicle.day.isValid(d, 3);
--> false

cronicle.day.extent(d);
--> [1, 31]

cronicle.day.start(d);
--> 'Fri, 22 Mar 2013 00:00:00 GMT'

cronicle.day.end(d);
--> 'Fri, 22 Mar 2013 23:59:59 GMT'

cronicle.day.next(d, 11);
--> 'Thu, 11 Apr 2013 00:00:00 GMT'

cronicle.day.prev(d, 2);
--> 'Sat, 02 Mar 2013 23:59:59 GMT'
```

## Day of week (dayOfWeek, dw, d)
Days of a week, from 1 to 7. Specify 0 for the last day of the week (Saturday).


Using days of week in a schedule:

`const sched = {schedules: [{dw: [2,3,4,5,6]}]}`

Performing day of week based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.dayOfWeek.name;
--> 'day of week'

cronicle.dayOfWeek.range;
--> 86400

cronicle.dayOfWeek.val(d);
--> 6

cronicle.dayOfWeek.isValid(d, 3);
--> false

cronicle.dayOfWeek.extent();
--> [1, 7]

cronicle.dayOfWeek.start(d);
--> 'Fri, 22 Mar 2013 00:00:00 GMT'

cronicle.dayOfWeek.end(d);
--> 'Fri, 22 Mar 2013 23:59:59 GMT'

cronicle.dayOfWeek.next(d, 1);
--> 'Sun, 24 Mar 2013 00:00:00 GMT'

cronicle.dayOfWeek.prev(d, 5);
--> 'Thu, 21 Mar 2013 23:59:59 GMT'
```

## Day of week count (dayOfWeekCount, dc)
The nth day of the week within a month, from 1 to max weeks in a month. Specify 0 for the last day instance. Used together with the day of the week time period to specify things like the 2nd Tuesday or last Friday of a month.


Using days of week count in a schedule:

`const sched = {schedules: [{dc: [2]}]}`

Performing day of week count based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.dayOfWeekCount.name;
--> 'day of week count'

cronicle.dayOfWeekCount.range;
--> 604800

cronicle.dayOfWeekCount.val(d);
--> 4

cronicle.dayOfWeekCount.isValid(d, 4);
--> true

cronicle.dayOfWeekCount.extent(d);
--> [1, 5]

cronicle.dayOfWeekCount.start(d);
--> 'Fri, 22 Mar 2013 00:00:00 GMT'

cronicle.dayOfWeekCount.end(d);
--> 'Thu, 28 Mar 2013 23:59:59 GMT'

// zero is special cased and means the last instance of
// a day of the week in the month, instead of meaning the
// first day of the week with the highest instance count
// which would have been Mar 29 with value 5.
cronicle.dayOfWeekCount.next(d, 0);
--> 'Mon, 25 Mar 2013 00:00:00 GMT'

cronicle.dayOfWeekCount.prev(d, 2);
--> 'Thu, 14 Mar 2013 23:59:59 GMT'
```

## Day of year (dayOfYear, dy)
Days in a year, from 1 to max days in year. Specify 0 for last day of the year.


Using days of year in a schedule:

`const sched = {schedules: [{dy: [189, 267]}]}`

Performing day of year based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.dayOfYear.name;
--> 'day of year'

cronicle.dayOfYear.range;
--> 86400

cronicle.dayOfYear.val(d);
--> 81

cronicle.dayOfYear.isValid(d, 4);
--> false

cronicle.dayOfYear.extent(d);
--> [1, 365]

cronicle.dayOfYear.start(d);
--> 'Fri, 22 Mar 2013 00:00:00 GMT'

cronicle.dayOfYear.end(d);
--> 'Fri, 22 Mar 2013 23:59:59 GMT'

cronicle.dayOfYear.next(d, 256);
--> 'Fri, 13 Sep 2013 00:00:00 GMT'

cronicle.dayOfYear.prev(d, 44);
--> 'Wed, 13 Feb 2013 23:59:59 GMT'
```

## Week of month (weekOfMonth, wm)
Weeks in a month where the 1st of the month is week 1 and following weeks start on Sunday. From 1 to max weeks in the month. Specify 0 for last week of the month.


Using weeks of month in a schedule:

`const sched = {schedules: [{wm: [1, 2]}]}`

Performing week of month based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.weekOfMonth.name;
--> 'week of month'

cronicle.weekOfMonth.range;
--> 604800

cronicle.weekOfMonth.val(d);
--> 4

cronicle.weekOfMonth.isValid(d, 4);
--> true

cronicle.weekOfMonth.extent(d);
--> [1, 6]

cronicle.weekOfMonth.start(d);
--> 'Sun, 17 Mar 2013 00:00:00 GMT'

cronicle.weekOfMonth.end(d);
--> 'Sat, 23 Mar 2013 23:59:59 GMT'

cronicle.weekOfMonth.next(d, 1);
--> 'Mon, 01 Apr 2013 00:00:00 GMT'

cronicle.weekOfMonth.prev(d, 2);
--> 'Sat, 09 Mar 2013 23:59:59 GMT'
```

## ISO Week of year (weekOfYear, wy)
The ISO 8601 week of the year. From 1 to max ISO week in the year. Specify 0 for last ISO week of the year.


Using weeks of year in a schedule:

`const sched = {schedules: [{wy: [13,26,39,0]}]}`

Performing week of year based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.weekOfYear.name;
--> 'week of year'

cronicle.weekOfYear.range;
--> 604800

cronicle.weekOfYear.val(d);
--> 12

cronicle.weekOfYear.isValid(d, 21);
--> false

cronicle.weekOfYear.extent(d);
--> [1, 52]

cronicle.weekOfYear.start(d);
--> 'Mon, 18 Mar 2013 00:00:00 GMT'

cronicle.weekOfYear.end(d);
--> 'Sun, 24 Mar 2013 23:59:59 GMT'

cronicle.weekOfYear.next(d, 47);
--> 'Mon, 18 Nov 2013 00:00:00 GMT'

cronicle.weekOfYear.prev(d, 52);
--> 'Sun, 30 Dec 2012 23:59:59 GMT'
```

## Month (month, M)
Months of the year, from 1 to 12. Specify 0 for the last month of the year.


Using months in a schedule:

`const sched = {schedules: [{M: [3,5,7]}]}`

Performing months based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.month.name;
--> 'month'

cronicle.month.range;
--> 2629740

cronicle.month.val(d);
--> 3

cronicle.month.isValid(d, 3);
--> true

cronicle.month.extent();
--> [1, 12]

cronicle.month.start(d);
--> 'Fri, 01 Mar 2013 00:00:00 GMT'

cronicle.month.end(d);
--> 'Sun, 31 Mar 2013 23:59:59 GMT'

cronicle.month.next(d, 11);
--> 'Fri, 01 Nov 2013 00:00:00 GMT'

cronicle.month.prev(d, 2);
--> 'Thu, 28 Feb 2013 23:59:59 GMT'
```

## Year (year, Y)
Years, from 1970 to 2099.


Using years in a schedule:

`const sched = {schedules: [{Y: [2013, 2014, 2015]}]}`

Performing years based calculations:

```
var d = new Date('2013-03-22T10:02:05Z');

cronicle.year.name;
--> 'year'

cronicle.year.range;
--> 31556900

cronicle.year.val(d);
--> 2013

cronicle.year.isValid(d, 2013);
--> true

cronicle.year.extent();
--> [1970, 2099]

cronicle.year.start(d);
--> 'Tue, 01 Jan 2013 00:00:00 GMT'

cronicle.year.end(d);
--> 'Tue, 31 Dec 2013 23:59:59 GMT'

cronicle.year.next(d, 2014);
--> 'Wed, 01 Jan 2014 00:00:00 GMT'

cronicle.year.prev(d, 2012);
--> 'Mon, 31 Dec 2012 23:59:59 GMT'
```

## Writing a custom time period
Cronicle is fully extensible and it is easy to create your own custom time periods that can be used to define new schedules. To keep things simple, we'll walk through creating a new time period for indicating morning, afternoon, and evening. For our purposes, morning will be before noon and have a value of 0, afternoon will be before 6pm and have a value of 1, and evening will be before midnight and have a value of 2.


The first step is to create a name and id for the modifier and add it to the cronicle namespace.

```
cronicle.partOfDay = cronicle.pd = {
  // interface implementation goes here
};
```

Next, we need to implement the time period interface. First we will just specify the name of this time period.

`name: 'part of day',`

The range is approximately 6 hours. Though some of our periods are longer and some shorter, we'll use the shortest range which is afternoon at 6 hours.

`range: cronicle.h.range * 6,`

We then implement val to return the appropriate value based on the definition described previously.

```
val: function(d) {
  return cronicle.h.val(d) < 12 ? 0 :
         cronicle.h.val(d) < 6 ? 1 :
         2;
},
```

Then we can use our new val function to implement isValid.

```
isValid: function(d, val) {
  return cronicle.pd.val(d) === val;
},
```

The extent is always going to be the same for every day so we can just return a constant array here.

`extent: function(d) { return [0, 2]; },`

Next we need to implement start and end based on the current time period. This will be the start and end of each part of the day that we've defined.

```
start: function(d) {
  var hour = cronicle.pd.val(d) === 0 ? 0 :
                cronicle.pd.val(d) === 1 ? 12 :
                6;

  // cronicle.date.next is a helper function for creating the date in UTC or
  // localTime as appropriate
  return cronicle.date.next(
    cronicle.Y.val(d),
    cronicle.M.val(d),
    cronicle.D.val(d),
    hour
  );
},

end: function(d) {
  var hour = cronicle.pd.val(d) === 0 ? 11 :
                cronicle.pd.val(d) === 1 ? 5 :
                23;

  // cronicle.date.prev is a helper function for creating the date in UTC or
  // localTime as appropriate, and automatically adjusts the date to be at
  // the last second of the specified time
  return cronicle.date.prev(
    cronicle.Y.val(d),
    cronicle.M.val(d),
    cronicle.D.val(d),
    hour
  );
},
```

Finally, we need to implement next and prev so that you can move to different parts of the day. We need to make sure to increment and decrement the day appropriately if we've already passed the specified value.

```
next: function(d, val) {
  var hour = val === 0 ? 0 : val === 1 ? 12 : 18;

  return cronicle.date.next(
    cronicle.Y.val(d),
    cronicle.M.val(d),
    // increment the day if we already passed the desired time period
    cronicle.D.val(d) + (hour < cronicle.h.val(d) ? 1 : 0),
    hour
  );
},

prev: function(d, val) {
  var hour = val === 0 ? 11 : val === 1 ? 5 : 23;

  return cronicle.date.prev(
    cronicle.Y.val(d),
    cronicle.M.val(d),
    // decrement the day if we already passed the desired time period
    cronicle.D.val(d) + (hour > cronicle.h.val(d) ? -1 : 0),
    hour
  );
}
```

### Full implementation
Here is the code for the completed example. To use the time period, just add this code after including Cronicle into your project and before you use it in any schedules.

```
cronicle.partOfDay = cronicle.pd = {

  name: 'part of day',

  range: cronicle.h.range * 6,

  val: function(d) {
    return cronicle.h.val(d) < 12 ? 0 :
           cronicle.h.val(d) < 18 ? 1 :
           2;
  },

  isValid: function(d, val) {
    return cronicle.pd.val(d) === val;
  },

  extent: function(d) { return [0, 2]; },

  start: function(d) {
    var hour = cronicle.pd.val(d) === 0 ? 0 :
                  cronicle.pd.val(d) === 1 ? 12 :
                  18;

    return cronicle.date.next(
      cronicle.Y.val(d),
      cronicle.M.val(d),
      cronicle.D.val(d),
      hour
    );
  },

  end: function(d) {
    var hour = cronicle.pd.val(d) === 0 ? 11 :
                  cronicle.pd.val(d) === 1 ? 5 :
                  23;

    return cronicle.date.prev(
      cronicle.Y.val(d),
      cronicle.M.val(d),
      cronicle.D.val(d),
      hour
    );
  },

  next: function(d, val) {
    var hour = val === 0 ? 0 : val === 1 ? 12 : 18;

    return cronicle.date.next(
      cronicle.Y.val(d),
      cronicle.M.val(d),
      // increment the day if we already passed the desired time period
      cronicle.D.val(d) + (hour < cronicle.h.val(d) ? 1 : 0),
      hour
    );
  },

  prev: function(d, val) {
    var hour = val === 0 ? 11 : val === 1 ? 5 : 23;

    return cronicle.date.prev(
      cronicle.Y.val(d),
      cronicle.M.val(d),
      // decrement the day if we already passed the desired time period
      cronicle.D.val(d) + (hour > cronicle.h.val(d) ? -1 : 0),
      hour
    );
  }
};
```

### Usage
Using the custom time period is exactly the same as using a built-in time period.

```
// use our new time period to specify every 15 mins at night
var sched = cronicle.parse.recur().every(15).minute().on(2).customPeriod('pd'),
    next = cronicle.schedule(sched).next(1, new Date(2013, 3, 21));

console.log(next.toUTCString());
--> Sun, 21 Apr 2013 18:00:00 GMT
```

## Modifiers
With Cronicle, not only can you write your own custom time periods, you can also write custom modifiers that can change the behavior of existing time periods. The modifiers sit in between the scheduling engine and the time period allowing you to intercept and modify the results that are returned by the time period.


Modifies are specified by attaching `_(modifier-id)` to the time period id that you want to modify. The same time period can be used with different modifiers within the same schedule.

## after (_a)
Modifies the corresponding time period such that all values after and including the specified value is considered valid. This modifier can be used with any time period. Useful for creating more compact schedules when a time period has a lot of consecutive valid values.

```
// all hours after 5:00pm will be valid
var sched = {schedules: [{h_a: [17]}]};

// equivalent to
var sched = {schedules: [{h: [17,18,19,20,21,22,23]}]};
```

## before (_b)
Modifies the corresponding time period such that all values before (but not including) the specified value is considered valid. This modifier can be used with any time period. Useful for creating more compact schedules when a time period has a lot of consecutive valid values.

```
// all hours before 5:00pm will be valid
var sched = {schedules: [{h_b: [17]}]};

// equivalent to
var sched = {schedules: [{h: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]}]};
```

## Writing a custom modifier
Custom modifiers are very similar to custom time periods and share the same interface. To keep things simple, we'll walk through creating a modifier to change the `month` period to work with values 0-11 instead of 1-12.


The first step is to create a name and id for the modifier and add it to the modifier namespace. Modifiers take the time period that is being modified along with the specified values as arguments.

```
cronicle.modifier.month = cronicle.modifier.m = function(period, values) {
  if(period.name !== 'month') {
    throw new Error('Month modifier only works with months!');
  }

  return {
    // interface implementation goes here
  };
};
```

Next, we need to implement the same interface that time periods implement and modify them to work with the new set of values. First we will just modify the *name* to include a reference to the modifier.

`name: 'reIndexed ' + period.name,`

The range is the same, so we just pass it through.

`range: period.range,`

We then modify the val returned by subtracting 1 since our new indicies are one less than the original ones.

`val: function(d) { return period.val(d) - 1; },`

Next, *isValid* is modified by tweaking the value that is passed in so that it is in the range that the month time period expects.

`isValid: function(d, val) { return period.isValid(d, val+1); },`

The *extent* also needs to be modified to reflect the new extent that goes from 0-11. Now that the extent starts at 0, the schedule engine will no longer assume that a 0 value means 'last'. There is nothing else that we need to do to correct for that behavior.

`extent: function(d) { return [0, 11]; },`

The *start* and *end* dates for the month will be the same, so we can just pass those through to the time period without modification.

```
start: period.start,
end: period.end,
```

Finally, the values passed into *next* and *prev* need to be updated to be in the range that the month time period expects.

```
next: function(d, val) { return period.next(d, val+1); },
prev: function(d, val) { return period.prev(d, val+1); }
```

### Full implementation
Here is the code for the completed example. To use the modifier, just add this code after including Cronicle into your project and before you use it in any schedules.

```
cronicle.modifier.month = cronicle.modifier.m = function(period, values) {
  if(period.name !== 'month') {
    throw new Error('Month modifier only works with months!');
  }

  return {
    name:     'reIndexed ' + period.name,
    range:    period.range,
    val:      function(d) { return period.val(d) - 1; },
    isValid:  function(d, val) { return period.isValid(d, val+1); },
    extent:   function(d) { return [0, 11]; },
    start:    period.start,
    end:      period.end,
    next:     function(d, val) { return period.next(d, val+1); },
    prev:     function(d, val) { return period.prev(d, val+1); }
  };
};
```

### Usage
Using the custom modifier is exactly the same as using a built-in modifier.

```
// wihtout our modifier, 2 means February
var sched1 = {schedules: [{M: [2]}]};

cronicle.schedule(sched1).next(1, new Date(2013, 3, 21));
--> Sat, 01 Feb 2014 00:00:00 GMT

// use our new modifier so that 2 now means March
var sched = cronicle.parse.recur().customModifier('m', 2).month();

next = cronicle.schedule(sched2).next(1, new Date(2013, 3, 21));
--> Sat, 01 Mar 2014 00:00:00 GMT
```

## Occurrences
Once a schedule has been defined, it can be used to calculate future and past occurrences of that schedule. An occurrence is a date that meets all of the constraints imposed by the schedule.

In order to improve performance, schedules are first compiled prior to occurrences being calculated. The compiled version of the schedule can be reused to find additional occurrences as needed.


To compile a schedule, pass the schedule definition to `cronicle.schedule`.

`var sched = cronicle.schedule(schedule)`

**Tip** All schedule definitions are timezone agnostic. When you need to calculate occurrences, you can decide to perform the calculation using local time or UTC.

```
// set cronicle to use UTC time (the default)
cronicle.date.UTC();

// set cronicle to use local time
cronicle.date.localTime();
```

## isValid(date)
Returns true if the `date` passed in is a valid occurrence of the schedule, false otherwise.

`var valid = cronicle.schedule(schedule).isValid(date)`

### Examples

```
var sched = cronicle.schedule(cronicle.parse.recur().on(1,2,3).minute());

sched.isValid(new Date('2013-03-22T10:02:00Z'));
--> true

sched.isValid(new Date('2013-03-22T10:22:00Z'));
--> false

sched.isValid(new Date('2013-03-22T10:02:05Z'));
--> false
```

## Calculating instances
Instances are individual dates that meet all of the constraints that are imposed by the schedule. Instances can be calculated both forwards and backwards, in any quantity, and optionally between a start and end date. When calculating multiple instances, the minimum time between instances is based on the smallest ranged time period.


**cronicle.schedule(*schedule*).all(*start, end*)**
Calculates *all* occurrences of `schedule` starting from the `start` date and ending before the `end` date. If an end date is not specified, the maximum results returned is 1000.

`cronicle.schedule({schedules: [{m: [5]}]}).all(startDate, endDate)`

**cronicle.schedule(*schedule*).next(*count, start, end*)**
Calculates the next `count` occurrences of `schedule`, optionally starting from the `start` date and ending before the `end` date.

`cronicle.schedule({schedules: [{m: [5]}]}).next(2)`


**cronicle.schedule(*schedule*).prev(*count, start, end*)**
Calculates the previous `count` occurrences of `schedule`, optionally starting from the `start` date and ending before the `end` date. When using previous, the `start` date must be greater than the `end` date.

`cronicle.schedule({schedules: [{m: [5]}]}).prev(2)`

### Examples
```
// sched for minute equal to 1,2, or 3
var sched = cronicle.schedule(cronicle.parse.recur().on(1,2,3).minute()),
    start = new Date('2013-05-22T10:22:00Z');

// get the next instance
sched.next(1, start);
--> Mon, 22 May 2013 11:01:00 GMT

// get the next 5 instances
sched.next(5, start);
--> [ 'Mon, 22 May 2013 11:01:00 GMT',
      'Mon, 22 May 2013 11:02:00 GMT',
      'Mon, 22 May 2013 11:03:00 GMT',
      'Mon, 22 May 2013 12:01:00 GMT',
      'Mon, 22 May 2013 12:02:00 GMT' ]

// get the previous instance
sched.prev(1, start);
--> Mon, 22 May 2013 10:03:00 GMT
```

## Calculating ranges
Ranges combine consecutively valid instances into a single start and end block of time. The start time is the first valid instance of the block of time. The end time is the first invalid time after the block.

Ranges are useful when scheduling blocks of time such as a meeting or activity. The schedule definition defines the start and end time of the activity and then ranges are used to find their occurrences.


**cronicle.schedule(*schedule*).nextRange(*count, start, end*)**
Calculates the next count ranges of schedule, optionally starting from the start date and ending before the end date.

`cronicle.schedule({schedules: [{m:[5,6,7]}]}).nextRange(2)`

**cronicle.schedule(*schedule*).prevRange(*count, start, end*)**
Calculates the previous count ranges of schedule, optionally starting from the start date and ending before the end date.

`cronicle.schedule({schedules: [{m:[5,6,7]}]}).prevRange(2)`

### Examples
```
// sched for minute equal to 1,2, or 3
var sched = cronicle.schedule(cronicle.parse.recur().on(1,2,3).minute()),
    start = new Date('2013-05-22T10:22:00Z');

// get the next range
sched.nextRange(1, start);
--> ['Mon, 22 May 2013 11:01:00 GMT', 'Mon, 22 May 2013 11:04:00 GMT']

// get the next 5 ranges
sched.nextRange(5, start);
--> [
      ['Mon, 22 May 2013 11:01:00 GMT', 'Mon, 22 May 2013 11:04:00 GMT']
      ['Mon, 22 May 2013 12:01:00 GMT', 'Mon, 22 May 2013 12:04:00 GMT']
      ['Mon, 22 May 2013 13:01:00 GMT', 'Mon, 22 May 2013 13:04:00 GMT']
      ['Mon, 22 May 2013 14:01:00 GMT', 'Mon, 22 May 2013 14:04:00 GMT']
      ['Mon, 22 May 2013 15:01:00 GMT', 'Mon, 22 May 2013 15:04:00 GMT']
    ]

// get the previous range
sched.prevRange(1, start);
--> ['Mon, 22 May 2013 10:01:00 GMT', 'Mon, 22 May 2013 10:04:00 GMT']
```
