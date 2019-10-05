var dataURL = "https://pwa.radonezh.info/api/";
var update = 60000;
var host = "https://payments.chronopay.ru/";
var product_id = "006009-0001-0001";
var secret = "-FQ1I7T3GGv62KdYc";

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
    id: 'ru.radonezh.radio',
    // Enable swipe panel
    panel: {
        swipe: 'left'
    },
    routes: [
        {
            name: 'about',
            path: '/about/',
            url: './pages/about.html'
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
                }
            }
        }
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
};

// Stream Player
var
    isPlaying = false,
    networkError = false,
    audio;

window.addEventListener('load', function() {
    // 1st, we set the correct status when the page loads
    navigator.onLine ? throwStatus(true) : throwStatus(false);

    // now we listen for network status changes
    window.addEventListener('online', function() {
        throwStatus(true);
    });

    window.addEventListener('offline', function() {
        throwStatus(false);
    });
});

function throwStatus(online) {
    if (online) {
        onOnline();
    } else {
        onOffline();
    }
}

function onOnline() {

    getData();

    init();

    audio.onplaying = function () {
        playView();
        isPlaying = true;
    };

    audio.onpause = function () {
        pauseView();
        isPlaying = false;
    };

    audio.onwaiting = function () {
        loadingView();
    };

    $$('.r-play-button-play').click( function () {
        audio.play();
    });

    $$('.r-play-button-pause').click( function () {
        audio.pause();
    });

    if (networkError === true && isPlaying === true) {
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

    if (isPlaying === false) {
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
