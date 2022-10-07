function getWeatherUrls (isOnline) {
  return isOnline ? {  current: "https://weather-app-as-apple.herokuapp.com/api/weather/current",
  hours: "https://weather-app-as-apple.herokuapp.com/api/weather/hoursForecast",
  fiveDays: "https://weather-app-as-apple.herokuapp.com/api/weather/forecast",
} : {
  current: "",
  hours: "",
  fiveDays: "",
}
}

let isOnline = false;
isOnline = localStorage.getItem("isOnline");
console.log(isOnline)
if (isOnline) {
  let label = document.getElementsByClassName("online__toggle")[0];
  label.firstChild.innerHTML = "Weather is online";
  let input = document.getElementById("isOnline");
  input.checked = true;
}

function calculateRange(tempData) {
  let { tempMin: lowestTemp, tempMax: highestTemp } = tempData[0];
  tempData.forEach((elem) => {
    lowestTemp = elem.tempMin < lowestTemp ? elem.tempMin : lowestTemp;
    highestTemp = elem.tempMax > highestTemp ? elem.tempMax : highestTemp;
  });
  return { lowestTemp, highestTemp };
}

function createGraph(dayRange, weekRange) {
  let weekGraph = document.createElement("div");
  weekGraph.setAttribute("class", "forecast__graph-weekRange");
  let dayGraph = document.createElement("div");
  const graphInterval = weekRange.highestTemp - weekRange.lowestTemp;
  dayGraph.setAttribute("class", "forecast__graph-dayGraph");
  dayGraph.style.marginLeft =
    Math.round(
      ((dayRange.tempMin - weekRange.lowestTemp) / graphInterval) * 100
    ) + "%";

  dayGraph.style.marginRight =
    Math.round(
      ((weekRange.highestTemp - dayRange.tempMax) / graphInterval) * 100
    ) + "%";
  const gradient = getGradient(dayRange.tempMin, dayRange.tempMax);
  dayGraph.style.backgroundImage = `linear-gradient(90deg,${gradient
    .map((point) => {
      return " #" + point.color + " " + point.position + "%";
    })
    .join(",")})`;

  weekGraph.append(dayGraph);
  return weekGraph;
}

function getDayName(range) {
  let date = new Date();
  let weekDays = [];
  for (i = 0; i < range; i++) {
    weekDays.push(date.toLocaleDateString("en-US", { weekday: "long" }));
    date.setDate(date.getDate() + 1);
  }
  return weekDays;
}

const currentWeather = {};



const currentWeatherResponse = fetch(
  getWeatherUrls(isOnline).current
)
  .then((res) => res.json())
  .catch((error) => {
    console.log(error);
    return {icon: 6, text: "Mostly Sunny", temperature: 25};
  })
  .then((weather) => {
    currentWeather.text = weather.text;
    currentWeather.temp = weather.temperature;
    currentWeather.location = "Beersheba";
    console.log(weather);
    updateCurrentWeather();
    createBackground(weather.icon);
  });
  

const hoursForecastWeatherResponse = fetch(
  getWeatherUrls(isOnline).hours
)
  .then((res) => res.json())
  .catch((error) => {
    console.log(error);
    return [{icon: 4, temp: 28, time: "20220817ZZZ16:00"},
    {icon: 4, temp: 28, time: "20220817ZZZ17:00"},
    {icon: 4, temp: 28, time: "20220817ZZZ18:00"},
    {icon: 4, temp: 28, time: "20220817ZZZ19:00"},
    {icon: 4, temp: 28, time: "20220817ZZZ20:00"},
    {icon: 4, temp: 28, time: "20220817ZZZ21:00"},
    {icon: 4, temp: 28, time: "20220817ZZZ22:00"},
    {icon: 4, temp: 28, time: "20220817ZZZ23:00"},
    {icon: 4, temp: 28, time: "20220818ZZZ00:00"},
    {icon: 4, temp: 28, time: "20220818ZZZ01:00"},
    {icon: 4, temp: 28, time: "20220818ZZZ02:00"},
    {icon: 4, temp: 28, time: "20220818ZZZ03:00"},];
  })
  .then((weather) => {
    updateHoursForecast(weather);
  })
  .finally(() => {
      var splide = new Splide( '.splide', {
          drag: 'free',
          perPage: 5,
          arrows: false,
          pagination: false,
      } );
      splide.mount();
    } );

const forecastResponse = fetch(
  getWeatherUrls(isOnline).fiveDays
)
  .then((res) => res.json())
  .then((forecastArr) => {
    const weekRange = calculateRange(forecastArr);
    let graphArray = forecastArr.map((elem) => {
      return createGraph(elem, weekRange);
    });
    let weekDays = getDayName(forecastArr.length).map((elem) =>
      elem.substring(0, 3)
    );
    let forecastList = document.getElementById("forecast__list");
    graphArray.forEach((elem, index) => {
      let forecastItem = document.createElement("li");
      forecastItem.setAttribute("class", "forecast__list-item");

      let dayName = document.createElement("h2");
      dayName.setAttribute("class", "forecast__item-weekday");
      dayName.innerHTML = index ? weekDays[index] : "Today";

      let forecastIcon = document.createElement("img");
      forecastIcon.setAttribute("class", "forecast__item-icon");
      forecastIcon.src = `https://developer.accuweather.com/sites/default/files/${
        forecastArr[index].icon < 10
          ? "0" + forecastArr[index].icon
          : forecastArr[index].icon
      }-s.png`;

      let forecastMin = document.createElement("h2");
      forecastMin.setAttribute("class", "forecast__item-temp");
      forecastMin.innerHTML = Math.round(forecastArr[index].tempMin) + "&deg;";

      let forecastMax = document.createElement("h2");
      forecastMax.setAttribute("class", "forecast__item-temp");
      forecastMax.innerHTML = Math.round(forecastArr[index].tempMax) + "&deg;";

      let forecastGraph = document.createElement("li");
      forecastGraph.setAttribute("class", "forecast__item-graph");
      forecastGraph.append(elem);

      forecastItem.append(dayName);
      forecastItem.append(forecastIcon);
      forecastItem.append(forecastMin);
      forecastItem.append(forecastGraph);
      forecastItem.append(forecastMax);
      forecastList.append(forecastItem);
    });
    currentWeatherTempRange.innerHTML = `L:${Math.round(
      forecastArr[0].tempMin
    )}&deg;  H:${Math.round(forecastArr[0].tempMax)}&deg;`;
  });

let currentWeatherItem = document.getElementsByClassName("current__weather")[0];

let currentWeatherLocation = document.getElementsByClassName(
  "current__weather-location"
)[0];

let currentWeatherTemp = document.getElementsByClassName(
  "current__weather-temp"
)[0];

let currentWeatherText = document.createElement("div");
currentWeatherText.setAttribute("class", "current__weather-text");
currentWeatherItem.append(currentWeatherText);

let currentWeatherTempRange = document.createElement("div");
currentWeatherTempRange.setAttribute("class", "current__weather-tempRange");
currentWeatherItem.append(currentWeatherTempRange);

const updateHoursForecast = (weather) => {
  // const hoursForecast = document.getElementsByClassName("hours__forecast")[0];
  // hoursForecast.scrollLeft = 50;
  // hoursForecast.addEventListener("swipe" , (event) => {
  //   console.log(event);
  // })
  // hoursForecast.addEventListener("wheel", (event) => {
  //   event.preventDefault();
  //   hoursForecast.scrollLeft += event.deltaY;
  //   if (hoursForecast.scrollLeft <= 50) {
  //     setTimeout(() => (hoursForecast.scrollLeft = 50), 100);
  //   }
  //   if (hoursForecast.scrollLeft >= 450) {
  //     setTimeout(() => (hoursForecast.scrollLeft = 450), 100);
  //   }
  //   console.log(hoursForecast.scrollLeft);
  // });

  // const hoursForecastSlider = document.createElement("div");
  // hoursForecastSlider.setAttribute("class", "hours__forecast-slider");

  // hoursForecast.append(hoursForecastSlider);

  // const hoursElements = weather.map((hourForecast) => {
  //   let hourElement = document.createElement("div");

  //   let hourTitle = document.createElement("h2");
  //   hourTitle.innerHTML = hourForecast.time.substring(11, 13);

  //   let hourIcon = document.createElement("img");
  //   // hourIcon.setAttribute("class", "forecast__item-icon");
  //   hourIcon.src = `https://developer.accuweather.com/sites/default/files/${
  //     hourForecast.icon < 10 ? "0" + hourForecast.icon : hourForecast.icon
  //   }-s.png`;

  //   let hourTemp = document.createElement("h2");
  //   hourTemp.innerHTML = hourForecast.temp;
  //   hourElement.append(hourTitle, hourIcon, hourTemp);
  //   hourElement.setAttribute("class", "hours__forecast-card");
  //   return hourElement;
  // });
  const hoursSplideList = document.getElementsByClassName("splide__list")[0];
  const hoursSplideElements = weather.map((hourForecast) => {
    let hourElement = document.createElement("div");

    let hourTitle = document.createElement("h2");
    hourTitle.innerHTML = hourForecast.time.substring(11, 13);

    let hourIcon = document.createElement("img");
    // hourIcon.setAttribute("class", "forecast__item-icon");
    hourIcon.src = `https://developer.accuweather.com/sites/default/files/${
      hourForecast.icon < 10 ? "0" + hourForecast.icon : hourForecast.icon
    }-s.png`;

    let hourTemp = document.createElement("h2");
    hourTemp.innerHTML = hourForecast.temp;
    hourElement.append(hourTitle, hourIcon, hourTemp);
    hourElement.setAttribute("class", "hours__forecast-card");

    let slideElement = document.createElement("li");
    slideElement.setAttribute("class", "splide__slide");
    slideElement.append(hourElement);
    hoursSplideList.append(slideElement);
    return slideElement;
  });

  // hoursElements.forEach((elem) => hoursForecastSlider.append(elem));
};

const updateCurrentWeather = () => {
  currentWeatherLocation.innerHTML = currentWeather.location;
  currentWeatherTemp.innerHTML = Math.round(currentWeather.temp) + "&deg;";
  currentWeatherText.innerHTML = currentWeather.text;
};

function getGradient(tempMin, tempMax) {
  let gradientPoints = [];
  if (tempMin < 0) {
    if (tempMax > 0) {
      gradientPoints.push({
        color: "f9f945",
        position: Math.floor(-(tempMin / (tempMax - tempMin)) * 100),
      });
    }
    if (tempMin <= -30) {
      gradientPoints.push({ color: "4545eb", position: 0 });
    } else {
      gradientPoints.push({
        color: pickHex("4545eb", "f9f945", tempMin / -30),
        position: 0,
      });
    }
  } else {
    if (tempMin >= 30) {
      gradientPoints.push({ color: "f94545", position: 0 });
    } else {
      gradientPoints.push({
        color: pickHex("f94545", "f9f945", tempMin / 30),
        position: 0,
      });
    }
  }

  if (tempMax > 0) {
    if (tempMax >= 30) {
      gradientPoints.push({ color: "f94545", position: 100 });
    } else {
      gradientPoints.push({
        color: pickHex("f94545", "f9f945", tempMax / 30),
        position: 100,
      });
    }
  } else {
    if (tempMin <= -30) {
      gradientPoints.push({ color: "4545eb", position: 100 });
    } else {
      gradientPoints.push({
        color: pickHex("4545eb", "f9f945", tempMax / 30),
        position: 100,
      });
    }
  }

  return gradientPoints.sort((a, b) => a.position - b.position);

  function pickHex(color1, color2, ratio) {
    const hex = (x) => {
      return x.toString(16).padStart(2, "0");
    };

    const r = Math.ceil(
      parseInt(color1.substring(0, 2), 16) * ratio +
        parseInt(color2.substring(0, 2), 16) * (1 - ratio)
    );
    const g = Math.ceil(
      parseInt(color1.substring(2, 4), 16) * ratio +
        parseInt(color2.substring(2, 4), 16) * (1 - ratio)
    );
    const b = Math.ceil(
      parseInt(color1.substring(4, 6), 16) * ratio +
        parseInt(color2.substring(4, 6), 16) * (1 - ratio)
    );
    const rgb = hex(r) + hex(g) + hex(b);
    return rgb;
  }
}

function createBackground(icon) {
  const background = document.getElementById("background");
  console.log(icon);
  switch (icon) {
    case 1:
      sunnyWeather();
      background.style.background =
        "linear-gradient(180deg, rgba(54, 93, 145, 1) 0%, rgba(108, 155, 215, 1) 100%)";
      break;
    case 2:
      sunnyWeather();
      cloudyWeather(1, 100);
      background.style.background =
        "linear-gradient(180deg, rgba(54, 93, 145, 1) 0%, rgba(108, 155, 215, 1) 100%)";
      break;
    case 3:
      sunnyWeather();
      cloudyWeather(3, 100);
      background.style.background =
        "linear-gradient(180deg, rgba(54, 93, 145, 1) 0%, rgba(108, 155, 215, 1) 100%)";
      break;
    case 4:
      sunnyWeather();
      cloudyWeather(3, 100);
      background.style.background =
        "linear-gradient(180deg, rgba(54, 93, 145, 1) 0%, rgba(108, 155, 215, 1) 100%)";
      break;
    case 6:
      sunnyWeather();
      cloudyWeather(6, 100);
      background.style.background =
        "linear-gradient(180deg, rgba(54, 93, 145, 1) 0%, rgba(108, 155, 215, 1) 100%)";
      break;
    case 7:
      cloudyWeather(10, 75);
      background.style.background =
        "linear-gradient(180deg, rgba(124, 141, 157, 1) 0%, rgba(93, 112, 127, 1) 100%)";
      break;
    case 33:
      background.style.background =
        "linear-gradient(180deg, rgba(1, 5, 28, 1) 0%, rgba(50, 58, 86, 1) 100%)";
      break;
    case 34:
      cloudyWeather(2, 100);
      background.style.background =
        "linear-gradient(180deg, rgba(1, 5, 28, 1) 0%, rgba(50, 58, 86, 1) 100%)";
      break;
  }

  function sunnyWeather() {
    const sunRay = document.createElement("img");
    sunRay.src = "/image/sunray.png";
    sunRay.setAttribute("class", "sunray");
    background.appendChild(sunRay);
  }

  function cloudyWeather(cloudNumber, brightness) {
    for (let i = 1; i <= cloudNumber; i++) {
      const cloud = document.createElement("img");
      const fileNumber = i <= 6 ? i : i % 6;
      cloud.src = "/image/cloud-0" + fileNumber + ".png";
      cloud.setAttribute("class", "cloud cloud0" + fileNumber);
      cloud.style.filter = `brightness(${brightness}%)`;
      const style = document.createElement("style");
      style.innerHTML = `.cloud${
        i < 10 ? "0" + i : i
      } {animation-delay: -${getDelay(cloudNumber, i)}s;}`;
      background.appendChild(cloud);
      background.appendChild(style);
    }
  }

  function getDelay(cloudNumber, counter) {
    if (cloudNumber == 1) {
      return 0;
    }
    if (cloudNumber == 2) {
      return counter == 1 ? 0 : 50;
    } else {
      return (100 / (cloudNumber - 1)) * (counter - 1);
    }
  }
}

let checkbox = document.getElementById("isOnline");


checkbox.addEventListener('change', function() {
  let label = document.getElementById("labelIsOnline");
  if (this.checked) {
    console.log("Checkbox is checked..");
    label.innerHTML = "Weather is online";
    isOnline = true;
  } else {
    console.log("Checkbox is not checked..");
    label.innerHTML = "Weather is offline";
    isOnline = false;
  }
  localStorage.setItem("isOnline", isOnline);
  window.location.reload();
});