// JS,CSSのキャッシュコントロールのためのバージョン
var element = document.querySelector("script[data-cache-version]");
var staticCacheVersion = element.getAttribute("data-cache-version")
requirejs.config({
    baseUrl: '/js',
    waitSeconds: 0,
    urlArgs: staticCacheVersion,
    paths: {
        jquery: 'libs/jquery',
        underscore: 'libs/underscore',
        backbone: 'libs/backbone',
        marionette: 'libs/backbone.marionette/backbone.marionette.min',
        magnificPopup: 'libs/jquery.magnific-popup',
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore'],
            exports: 'Backbone'
        },
        marionette: {
            deps: ['backbone'],
            exports: 'Marionette'
        },
        'magnificPopup': {
            deps: ['jquery']
        },
    }
});

require([
    'preview_modules/PreviewView',
    'preview_modules/LoadingView',
    'magnificPopup'
], function (PreviewView, LoadingView, magnificPopup) {

    /*
        # BUG: undefined variable referrence in LoadingView
        - LoadingViewにて未定義グローバルオブジェクトの参照あり
        - 応急処置として参照しているオブジェクトを定義する
        - プレビュー表示が遅いので、そこからSSRで実装し直して解決する方向を提案
    */
    window.Peraichi = window.Peraichi || {};
    Peraichi.editor = Peraichi.editor || {};
    Peraichi.editor.App = Peraichi.editor.App || {};
    Peraichi.editor.App.isTutorial = function() { return false; };

    $(function(){
        // プレビューの表示
        var preview = new PreviewView();
        preview.loadingPreviewIframe();
        // ロードイベントのコントロール
        LoadingView.getSharedView().onLoadShow();
        // CREATED BY ペライチ非表示の案内
        $('.preview_hideCreated').on('click', function (e) {
            e.preventDefault();
            mixpanel.track('Preview.CreatedBy.Modal');
            $.magnificPopup.open({
                mainClass: 'mfp-fade',
                items: {
                    src: $('#modalHideCreatedGuide'),
                    type: 'inline'
                }
            });
        });
    });
    //mixpanel
    mixpanel.track_links('.mp_preview_created_price', 'Preview.CreatedBy.Price');
    mixpanel.track_links('.mp_preview_created_support', 'Preview.CreatedBy.Support');
});
