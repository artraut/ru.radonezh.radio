var dataURL = "http://radonezh.ru/json/";
var update = 60000;
var host = "https://payments.chronopay.ru/";
var product_id = "006009-0001-0001";
var secret = "-FQ1I7T3GGv62KdYc";


var getBitrate = localStorage.getItem("bitrate");

if (getBitrate === null) {
    localStorage.setItem("bitrate", "http://icecast.radonezh.cdnvideo.ru:8000/rad128");
}

var $$ = Dom7;

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
                        localStorage.setItem("bitrate",this.value);
                            audio.stop();
                            audio.load();
                            if (playing == true) {
                                audio.play();
                            }
                        }
                    );
                },
                pageInit: function (e, page) {
                    // do something when page initialized
                },
            }
        },
    ]
});
  
var mainView = app.views.create('.view-main');

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
getData();

// Stream Player

var streamURL = localStorage.getItem("bitrate");
var audio = new Audio(streamURL);
var playing = false;

$$('.r-play-button-play').show();

audio.oncanplay = function () {
    $$('.r-play-button-play').show();
    $$('.r-play-button-pause').hide();
    $$('.r-play-button-loading').hide();
    $$('.r-block-progress-playback').hide();
    $$('.r-block-progress-loading').show();
}

audio.onplaying = function () {
    $$('.r-play-button-play').hide();
    $$('.r-play-button-pause').show();
    $$('.r-play-button-loading').hide();
    $$('.r-block-progress-playback').show();
    $$('.r-block-progress-loading').hide();
    playing = true;
}

audio.onpause = function () {
    $$('.r-play-button-play').show();
    $$('.r-play-button-pause').hide();
    $$('.r-play-button-loading').hide();
    $$('.r-block-progress-playback').hide();
    $$('.r-block-progress-loading').show();
    playing = false;
}

audio.onwaiting = function () {
    $$('.r-play-button-play').hide();
    $$('.r-play-button-pause').hide();
    $$('.r-play-button-loading').show();
    $$('.r-block-progress-playback').hide();
    $$('.r-block-progress-loading').show();
}

audio.onerror = function () {
    $$('.r-play-button-play').hide();
    $$('.r-play-button-pause').hide();
    $$('.r-play-button-loading').show();
    $$('.r-block-progress-playback').hide();
    $$('.r-block-progress-loading').show();
    audio.stop();
    audio.load();
    if (playing == true) {
        audio.play();
    }
}

$$('.r-play-button-play').click( function() {
    audio.play();
});

$$('.r-play-button-pause').click( function() {
    audio.pause();
});

$$('.ptr-content').on('ptr:refresh', function () {
    setTimeout(function () {
        getData();
        // When loading done, we need to reset it
        app.ptr.done(); // or e.detail();
    }, 500);
});

$$('#donate').on('click', function(){
    var json = app.form.convertToData('#donation');
    var product_price = json.sum;
    console.log(product_price);
    var sign = md5(product_id + "-" + product_price + secret);
    var donateUrl = host + "?product_id=" + product_id + "&product_price=" + product_price + "&sign=" + sign;
    window.open(donateUrl, '_system')
});