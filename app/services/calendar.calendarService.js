calendarModule.service("calendarService", [
  "$http",
  function($http) {
    // private attributes
    let days = ["SUN", "MON", "TUE", "WED", "THR", "FRI", "SAT"];
    let reservationsMap = {};
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    let locale = "Asia/Dubai";
    let today = new Date().getTime() / 1000;
    today = moment.unix(today).tz(locale).startOf("day");

    this.timeZoneError = "";

    function validateMonthInBounds(month) {
      /**
       * validates the month : [0-11], resets to 0 if it is out of bounds. 
       */
      return month > 11 || month < 0 ? 0 : month;
    }

    function getPrevMonth(month, year) {
      /**
       * returns previous month
       */
      month = validateMonthInBounds(month);
      year = month === 0 ? year - 1 : year;

      return [month === 0 ? 11 : month - 1, year];
    }

    function getNextMonth(month, year) {
      /**
       * returns next month, and year
       */
      month = validateMonthInBounds(month);
      year = month === 11 ? year + 1 : year;

      return [month === 11 ? 0 : month + 1, year];
    }

    function getDateObject(year, month, day) {
      /**
       * expects year, month:[0-11], day:[0-6] and returns the expected date object
       */
      let date = new Date(year, month, day);

      date = moment.unix(date.getTime() / 1000).tz(locale).startOf("day");
      let datekey = `${year}${month}${date.date()}`;
      return {
        id: datekey,
        timeStamp: date.unix(),
        day: days[date.day()],
        dayIndex: date.day(),
        date: date.date(),
        month: months[date.month()],
        monthIndex: date.month(),
        year: date.year(),
        reservation: reservationsMap[datekey]
      };
    }

    function getNumberofDays(month, year) {
      /**
       * returns number of days in a given month: [0-11]
       */
      return 32 - new Date(year, month, 32).getDate();
    }

    function updateReservationsMap(reservations) {
      /**
       * expects reservations from the response payload of reservations API 
       * and updates reservationMap 
       */
      reservationsMap = {};
      reservations.forEach(reservation => {
        let date = moment.unix(reservation.time).tz(locale).startOf("day");

        reservationsMap[`${date.year()}${date.month()}${date.date()}`] = {
          tennantName: reservation.tennantName,
          date: date.date(),
          year: date.year(),
          month: date.month()
        };
      });
    }

    this.updateTennant = async function(tennant, onSuccess, onError) {
      let url = "http://localhost:3000/reserve";
      return $http.post(url, tennant).then(
        response => {
          if (response.status === 200) {
            onSuccess(response.data);
            this.fetchTennant();
          } else {
            onError(response.data);
            this.fetchTennant();
          }
        },
        err => {
          onError("Some unexpected Error occured");
          this.fetchTennant();
        }
      );
    };

    this.fetchTimeZone = async function() {
      let url = "http://localhost:3000/now";
      return $http.get(url).then(
        response => {
          if (response.status === 200) {
            this.locale = response.data.timeZone;
            this.today = moment
              .unix(response.data.time)
              .tz(locale)
              .startOf("day");
            this.calendar.dates = this.getDatesForMonth(
              this.calendar.monthIndex,
              this.calendar.year
            );
          }
        },
        err => {
          this.timeZoneError = "An error occured while fetching time stamp!";
        }
      );
    };

    this.fetchTennant = async function() {
      let url = `http://localhost:3000/reserve/${this.calendar.dates[0]
        .timeStamp}/${this.calendar.dates[this.calendar.dates.length - 1]
        .timeStamp}`;
      return $http.get(url).then(
        response => {
          if (response.status === 200) {
            updateReservationsMap(response.data.reserved);
            this.calendar.dates = this.getDatesForMonth(
              this.calendar.monthIndex,
              this.calendar.year
            );
          }
        },
        err => {
          console.log("Some unexpected Error occured while fetching Tennants");
        }
      );
    };

    this.navigateToNextMonth = function() {
      [this.calendar.monthIndex, this.calendar.year] = getNextMonth(
        this.calendar.monthIndex,
        this.calendar.year
      );

      this.calendar.month = months[this.calendar.monthIndex];
      this.calendar.dates = this.getDatesForMonth(
        this.calendar.monthIndex,
        this.calendar.year
      );

      this.fetchTennant();
    };

    this.navigateToPrevMonth = function() {
      [this.calendar.monthIndex, this.calendar.year] = getPrevMonth(
        this.calendar.monthIndex,
        this.calendar.year
      );

      this.calendar.month = months[this.calendar.monthIndex];
      this.calendar.dates = this.getDatesForMonth(
        this.calendar.monthIndex,
        this.calendar.year
      );

      this.fetchTennant();
    };

    this.getDatesForMonth = function(month, year) {
      let numberofDays = getNumberofDays(month, year);
      let calender = [];
      let startDate = getDateObject(year, month, 1);
      let endDate = getDateObject(year, month, numberofDays + 1);

      for (let i = -(startDate.dayIndex % 7) + 1; i < 1; i++) {
        calender.push(getDateObject(year, month, i));
      }

      calender.push(startDate);

      for (let day = 2; day < numberofDays + 1; day++) {
        calender.push(getDateObject(year, month, day));
      }

      calender.push(endDate);

      let [nextMonth, nextYear] = getNextMonth(month, year);
      let remainingDays = 7 - endDate.dayIndex;

      for (let day = 1; day < remainingDays; day++) {
        calender.push(getDateObject(nextYear, nextMonth, day + 1));
      }

      return calender;
    };

    this.calendar = {
      days,
      month: months[today.month()],
      monthIndex: today.month(),
      year: today.year(),
      dates: this.getDatesForMonth(today.month(), today.year())
    };

    // fetch time zone
    this.fetchTimeZone();
    // fetching Tennants
    this.fetchTennant();
  }
]);
