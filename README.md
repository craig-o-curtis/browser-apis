# Modern Browser APIs

- This project uses VS Code Live Server to preview files

## Request Animation Frame - Instead of Timeouts, Intervals

[MDN requestAnimationFrame Docs](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

- Supported in all browsers
  Page - animation.html

* `requestAnimationFrame`
* `cancelAnimationFrame`

## Prefetch - For Pages

[MDN prefetching Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ)
Page - prefetch.html

- Indicate which resources are likely going to be clicked
- Gives hint to resources likely needed for next navigation

```html
<link rel="prefetch" href="..." />
```

## Preload - For Resources

[MDN preload Docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content)

- NOo supported in some versions of Firefox
  Page - preload.html

* Declare high-priority resources the browser should load first
* Need to specify type of resource - css, image, script, etc
* Resource likely needed in current page

```html
<link rel="preload" href="..." as="type" />
```

## The Beacon API - for Sending Analytics

[MDN Beacon API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API)

- Not supported in IE
  Page - beacon.html
  Responses sent to - [putsreq page](https://putsreq.com/Nnb3fKfklR9vYMDIcbQI/inspect)

* Better than AJAX for plain data analytics, diagnostics
* Done asynchronously

```js
window.navigator.sendBeacon(targetURL, data);
```

## The Intersection Observer API - detect if on viewport

[MDN Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

- No IE support
  Page - intersection.html

* Loading images
* Start and stop video
* Determine if ad was seen

```html
<div id="targetElem">Target Element</div>
```

```js
window.addEventListener("load", function () {
  const observer = new IntersectionObserver(
    function (entries) {
      console.log(entries);
      /* entry object:
       * intersectionRatio - percent of object in viewport
       * isIntersecting - boolean
       */
      if (entries[0].intersection < 0.5) {
        entries[0].target.className = "background0";
      }
      if (entries[0].intersection >= 0.5) {
        entries[0].target.className = "background50";
      }
      if (entries[0].intersection >= 1.0) {
        entries[0].target.className = "background100";
      }
    },
    {
      threshold: [0, 0.5, 1.0], // trigger when these percentages are visible
    }
  );
  observer.observe(document.getElementById("targetElem"));
});
```

## Working With Data

### Browser Data-Related Apis:

- cookies
- application cache - not fully offline solution
- localStorage - syncronous, so blocks user interaction
- sessionStorage
- xmlHttpRequest -> fetch
- IndexedDB
- WebSQL - deprecated

### fetch()

[MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
Page - fetch.html

- modern replacement for AJAX
  > can use modern ESNext in evergreen browsers for quick development

```js
// promise
const res = fetch("https://httpbin.org/json")
  .then((res) => {
    if (res.ok) return res.text(); // or res.json()
    if (!res.ok) throw new Error();
  })
  .then((returnedResText) => {
    console.log(returnedResText);
  })
  .catch((err) => console.error(err));
// async
try {
  const res = await fetch("https://httpbin.org/json");
  if (res.ok) {
    const returnedResText = await res.json();
    console.log(returnedResText);
  } else {
    throw new Error();
  }
} catch (err) {
  console.error(err);
}
```

### localforage - from Mozilla Foundation

[Localforage Docs](https://localforage.github.io/localForage/)
Page - indexedDb_localForage.html

- wrapper around IndexedDB, simplified APIs
- IndexedDB is async, unlike localStorage
- Not limited to LS strings
- Can have multiple stores
- LocalForage - can use with simple key-value pairs
- uses async / promises

#### localforage API

- `localforage.setItem(key, val)` // returns val
- `localforage.getItem(key)` // returns val
- `localforage.removeItem(key)` // returns val as undefined
- `localforage.iterate((val, key, iterationNumber) => {})`

```js
// promise
localforage
  .setItem(key, val)
  .then((res) => {
    console.log("stored");
    console.log(res);
  })
  .catch((err) => console.error(err));

// async await
const storedValue = await localforage.getItem(key);
```

#### Multiple Instances of localforage DBs

```js
// LocalForage also supports multiple database instances
var instance1, instance2;
document.getElementById("btnMulti").addEventListener("click", function () {
  instance1 = localforage.createInstance({
    name: "instance1",
  });
  instance2 = localforage.createInstance({
    name: "instance2",
  });
});

// Store data using the same key name into different database instances
document.getElementById("btnStore").addEventListener("click", async () => {
  const instance1set = await instance1.setItem("key1", "value1");
  const instance2set = await instance2.setItem("key1", "value2");

  console.log(`Set instance 1 ${instance1set} and instance 2 ${instance2set}`);
});

// Retrieve the data from separate instances using the same key name
document.getElementById("btnGetData").addEventListener("click", async () => {
  const instance1get = await instance1.getItem("key1");
  const instance2get = await instance2.getItem("key1");

  console.log(`Get instance 1 ${instance1get} and instance 2 ${instance2get}`);
});
```

### Cache API

[MDN Docs page for Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
Page - cache_api.html

- Only not supported in any IE version
- newer, cache HTTP requests and responses
- Developed for service workers, and progressive web apps
- Good for resources that don't change
  -- company logo

```js
window.addEventListener("load", () => {
  const getJSONData = async (url) => {
    if ("caches" in window) {
      try {
        const cache = await window.caches.open("my-data-cache");
        const inCache = await cache.match(url);

        if (inCache === undefined) {
          // not in cache, do api call
          const result = await fetch(url);
          // responses can only be read once
          const clonedResult = result.clone();
          // set raw result to cache
          cache.put(url, result);
          // transform for readability
          const transformedJsonResult = await clonedResult.json();
          console.log(`not in cache, got response from ${url}`);
          console.log(transformedJsonResult);
        } else {
          // return from cache
          const cachedResult = await inCache.json();
          console.log(`cachedResult from ${url}`);
          console.log(cachedResult);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  document.getElementById("btnGet").addEventListener("click", () => {
    getJSONData("https://httpbin.org/json");
  });

  document.getElementById("btnClear").addEventListener("click", async () => {
    try {
      const deletedResult = await window.caches.delete("my-data-cache");
      console.log(`deleted cache: ${deletedResult}`);
    } catch (err) {
      console.error(err);
    }
  });
});
```

### Storage Manager API

[Storage Docs](https://storage.spec.whatwg.org)
Page - storage.html

- Doesn't work in IE or Safari
- Issues on Chrome, may be due to privacy concerns
- determine storage space

```js
window.addEventListener("load", async () => {
  // See how much space my origin has available
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    document.getElementById("dtEst").textContent = estimate.quota;
    document.getElementById("dtUsage").textContent = estimate.usage;
  }

  // detect whether the app's data is marked as persistent
  if (navigator.storage && navigator.storage.persisted) {
    // stop browsers from clearing out this app
    const persisted = await navigator.storage.persisted();
    document.getElementById("dtPersisted").textContent = persisted;
  }

  // Request storage persistence from the browser
  document.getElementById("btnReqPers").addEventListener("click", () => {
    navigator.storage.persist().then((persistent) => {
      if (persistent) {
        console.log(
          "Storage will not be cleared except by explicit user action"
        );
      } else {
        console.log("Storage may be cleared by the UA under storage pressure.");
      }
    });
  });
});
```

### Device Memory API

[MDN Device Memory API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)
Page - device_memory.html

- Only on Chrome and Edge
- determine storage space, device capacity, RAM
- Tailor experience accordingly

```js
if (navigator.deviceMemory) {
  console.log(`Available RAM is ${navigator.deviceMemory}`);
}
```

### Dialog API

[MDN <dialog>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
Page - dialog.html

- Supported in Chrome, under development in Firefox
- Not supported in Safari or IE

```html
<dialog id="dialog1">
  <h1>This is a dialog</h1>
  <div id="dlgcontent">
    <p>It has content styled like any other HTML element.</p>
    <button id="okBtn">OK</button>
    <button id="cancelBtn">Cancel</button>
  </div>
</dialog>
```

```js
window.addEventListener("load", () => {
  // event handlers to show the dialog as non-modal and modal
  document.getElementById("show1").addEventListener("click", () => {
    // Show the dialog using the non-modal API
    document.getElementById("dialog1").show();
  });
  document.getElementById("show2").addEventListener("click", () => {
    // Show the dialog using the modal API
    document.getElementById("dialog1").showModal();
  });

  // add event listeners for the OK and Cancel buttons
  document.getElementById("okBtn").addEventListener("click", () => {
    dlg = document.getElementById("dialog1");
    // Check to see if the dialog is in fact open, if so then close it with "OK"
    if (dlg.open) {
      dlg.close("Ok");
    }
  });
  document.getElementById("cancelBtn").addEventListener("click", () => {
    dlg = document.getElementById("dialog1");
    // Check to see if the dialog is in fact open, if so then close it with "Cancel"
    if (dlg.open) {
      dlg.close("Cancel");
    }
  });

  // event listeners for the dialog itself - close and cancel
  dlg = document.getElementById("dialog1");
  dlg.addEventListener("close", (evt) => {
    console.log("Dialog closed: ", dlg.returnValue);
  });
  // Fired on [Esc] key
  dlg.addEventListener("cancel", (evt) => {
    console.log("Dialog canceled: ", dlg.returnValue);
  });
});
```

### Native Notifications

[MDN Notification Docs](https://developer.mozilla.org/en-US/docs/Web/API/notification)
Page - notifications.html

- No IE support, Android, iOS
- Works if app isn't currently active on user's system

#### Workflow

1. Request permission from user with `await Notification.requestPermission()`
2. Check if `Notification.permission` is `granted`

#### Customized Notifications

```js
const notify = new Notification("Basic Notification");

// fancy
// Set up the notification options
let noteOptions = {
  title,
  body,
  icon: useIcon ? "../images/info.png" : null,
  requireInteraction: isPersistent,
};

// Show the notification
const notify = new Notification(title, noteOptions);

// Handle a click on the notification to open a new page
notify.onclick = (e) => {
  e.target.close();
  window.location = "https://google.com";
};
```

### Network Information API Detecting Network Conditions

[MDN Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
Page - network.html

- NO support in Firefox, IE, Safari

#### API

- `window.navigator.onLine`
- `window.addEventListener('online', ()=>{});`
- `window.addEventListener('online', ()=>{});`
- `window.navigator.connection`
- `window.navigator.connection.effectiveType`// 3g, 4g, wifi:

```js
NetworkInformation;
downlink: 1.45;
effectiveType: "4g";
onchange: null;
rtt: 200;
saveData: false;
```

- `window.navigator.connection.downlink` - MB/s speed
- `window.navigator.connection.rtt` - round trip time

### Page Visibility

[MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
Page - pagevis.html

- Good support in all major latest browsers, IE10
- Better UX - extends battery life, natural flow
- Can change update frequency, pause videos / games
- Changes when:
  1. window minimized
  2. swiped to another screen
  3. change tabs
- `window.focus` or `window.blur` don't indicate if page is visible

#### API

- `document.visibilityState`
- `document.addEventListener('visibilitychange', (e) => {});`
- DEPRECATED `document.hidden` boolean

### Fullscreen API

[MDN Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
Page - fullscreen.html

- No IE support
- Good for games, video players, productivity apps, media viewers
- Note - browser prefixes, see code below
- `elem.requestFullscreen();`
- `document.documentElement.requestFullscreen()`
- `document.exitFullscreen()`
- `document.addEventListener("fullscreenchange", (e)=>{});`
- CSS `:fullscreen` pseudoclass
- For Images:

```html
<img id="targetImg" src="../images/j0149014.jpg" />
<button id="btnImgFs">Enter Image Fullscreen Mode</button>
```

```js
document.getElementById("btnImgFs").addEventListener("click", () => {
  // start fullscreen mode on the image
  enterFullscreen(document.getElementById("targetImg"));
});
// on an image
function enterFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
  if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
  if (elem.mozRequestFullScreen) {
    elem.mozRequestFullscreen();
  }
  if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

document.addEventListener("fullscreenchange", (e) => {
  console.log("fullscreenchange event! ", e);
  logFullscreenInfo();
});
document.addEventListener("mozfullscreenchange", (e) => {
  console.log("mozfullscreenchange event! ", e);
  logFullscreenInfo();
});
document.addEventListener("webkitfullscreenchange", (e) => {
  console.log("webkitfullscreenchange event! ", e);
  logFullscreenInfo();
});
document.addEventListener("msfullscreenchange", (e) => {
  console.log("msfullscreenchange event! ", e);
  logFullscreenInfo();
});
```

- For page

```html
<button id="btnDocFs">Enter Document Fullscreen Mode</button>
<button id="btnExitFs">Exit Fullscreen Mode</button>
```

```js
document.getElementById("btnDocFs").addEventListener("click", () => {
  // start fullscreen mode on the document
  enterFullscreen(document.documentElement);
});

document.getElementById("btnExitFs").addEventListener("click", () => {
  // exit the fullscreen mode
  exitFullscreen();
});

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
  if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
  if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  }
  if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}
```

### CSS Paint APi

[MDN CSS Painting API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API)
Page - csspaint.html
- Currently only opens in Chrome
- uses HTML Canvas API

```html
<style type="text/css">
  #targetElem {
    width: 500px;
    height: 300px;
    border: 1px solid gray;

    /* Use the paint API to paint the background of the box */
    background-image: paint(samplepainter);
    /* Define some custom properties to use in the paint function */
    --cross-thickness: 2;
    --cross-color: #4778b3;
  }
</style>
```

Loading Script:

```js
if ("paintWorklet" in CSS) {
  console.log("paintWorklet supported");

  // add the paint worklet to our page
  CSS.paintWorklet.addModule("csspaint.js");
}
```

CSSPaint.js file:

```js
if (typeof registerPaint !== "undefined") {
  // define a class to implement the paint worklet
  class SampleCSSPaint {
    // declare the properties that the class has access to
    static get inputProperties() {
      return ["--cross-thickness", "--cross-color"];
    }

    paint(ctx, size, props) {
      // get the custom property values
      let width = props.get("--cross-thickness");
      let color = props.get("--cross-color").toString();

      ctx.lineWidth = width * 30;
      ctx.strokeStyle = color;

      ctx.beginPath();
      ctx.moveTo(size.width / 3, 0);
      ctx.lineTo(size.width / 3, size.height);
      //   ctx.lineTo(size.width, size.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size.width, size.height / 2);
      ctx.lineTo(0, size.height / 2);
      ctx.stroke();
    }
  }

  // register the paint worklet for CSS engine
  registerPaint("samplepainter", SampleCSSPaint);
}
```
