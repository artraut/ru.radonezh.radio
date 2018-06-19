var dataURL = "http://apps.radonezh.ru/";
var update = 60000;
var host = "https://payments.chronopay.ru/";
var product_id = "006009-0001-0001";
var secret = "-FQ1I7T3GGv62KdYc";
var yandexAppMetricaKey = "fb667c24-b282-42b7-a321-5723b7dbf637";

var getBitrate = localStorage.getItem("bitrate");

if (getBitrate === null) {
    localStorage.setItem("bitrate", "http://icecast.radonezh.cdnvideo.ru:8000/rad128");
}

var $$ = Dom7;

// install Keypad plugin to Framework7
Framework7.use(Framework7Keypad);

var app = new Framework7({
    // App Theme
    theme: 'ios',
    // App root element
    root: '#app',
    // App Name
    name: 'Радио «Радонеж»',
    // App id
    id: 'ru.radonezh',
    // Enable swipe panel
    panel: {
        swipe: 'left',
    },
    routes: [
        {
            name: 'about',
            path: '/about/',
            url: './pages/about.html',
        },
        {
            name: 'settings',
            path: '/settings/',
            url: './pages/settings.html',
            on: {
                pageAfterIn: function (e, page) {
                    var getBitrate = localStorage.getItem("bitrate");
                    $$('[name="bitrate"]').each(function () {
                        if (this.value === getBitrate) {
                            this.checked = true;
                        } else {
                            this.checked = false;
                        }
                    });
                    $$('[name="bitrate"]').on("change", function () {
                        localStorage.setItem("bitrate", this.value);
                        location.reload();
                    });
                },
                pageInit: function (e, page) {
                    // do something when page initialized
                },
            }
        },
    ]
});
  
// Create main view
var mainView = app.views.create('.view-main');

// Numeric keypad settings
var keypad = app.keypad.create({
    inputEl: '#sum',
    dotButton: false,
    toolbarCloseText: 'Готово'       
});

// Ask Radonezh for playlists
var getData = function () {
    app.request({
        url: dataURL,
        method: "POST",
        crossDomain: true,
        success: function(response) {
            var data = JSON.parse(response);
            $$('#playing-now').text(data.current);
            $$('#playing-next').text(data.next);
        },
        complete: function () {
            setTimeout(function(){
                getData();
            }, update);
        }
    });
}

// Stream Player
document.addEventListener("online", onOnline, false);
document.addEventListener("offline", onOffline, false);

var isPlaying = false;
var networkError = false;
var audio;

function onOnline() {

    getData();

    init();

    audio.onplaying = function () {
        playView();
        isPlaying = true;
    }

    audio.onpause = function () {
        pauseView();
        isPlaying = false;
    }

    audio.onwaiting = function () {
        loadingView();
    }

    $$('.r-play-button-play').click( function () {
        audio.play();
    });

    $$('.r-play-button-pause').click( function () {
        audio.pause();
    });

    if (networkError == true && isPlaying == true) {
        audio.play();
        networkError = false;
    }
    
}
function onOffline() {
    networkError = true;
    loadingView();
    app.dialog.alert('Проверьте подключение к сети');
}

function playView() {
    $$('.r-play-button-play').hide();
    $$('.r-play-button-pause').show();
    $$('.r-play-button-loading').hide();
    $$('.r-block-progress-playback').show();
    $$('.r-block-progress-loading').hide();
}

function pauseView() {
    $$('.r-play-button-play').show();
    $$('.r-play-button-pause').hide();
    $$('.r-play-button-loading').hide();
    $$('.r-block-progress-playback').hide();
    $$('.r-block-progress-loading').show();
}

function loadingView() {
    $$('.r-play-button-play').hide();
    $$('.r-play-button-pause').hide();
    $$('.r-play-button-loading').show();
    $$('.r-block-progress-playback').hide();
    $$('.r-block-progress-loading').show();
}

function init() {

    var streamURL = localStorage.getItem("bitrate");

    if (isPlaying == false) {
        pauseView();
        audio = new Audio(streamURL);
    } else {
        audio.pause();
        audio.currentTime = 0;
        audio.src = null;
        audio = new Audio(streamURL);
        audio.play();
    }
}

// Update Radonezh playlists data on swip down
$$('.ptr-content').on('ptr:refresh', function () {
    setTimeout(function () {
        getData();
        // When loading done, we need to reset it
        app.ptr.done(); // or e.detail();
    }, 500);
});

// Redirect on donation page
$$('#donate').on('click', function(){
    var json = app.form.convertToData('#donation');
    var product_price = json.sum;
    if (parseInt(product_price) > 0) {
        var sign = md5(product_id + "-" + product_price + secret);
        var donateUrl = host + "?product_id=" + product_id + "&product_price=" + product_price + "&sign=" + sign;
        window.open(donateUrl, '_system')
    } else {
        keypad.open();
    }
});

// App Metrica
var configuration = {
    // Mandatory
    apiKey: yandexAppMetricaKey,
    // Optional
    trackLocationEnabled: true,
    handleFirstActivationAsUpdateEnabled: true,
    sessionTimeout: 15
}
app.appMetrica.activate(configuration);
