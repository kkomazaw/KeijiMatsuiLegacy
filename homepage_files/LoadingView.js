define([
    'jquery',
    'underscore',
    'marionette',
], function ($, _, Marionette) {
    var LoadingView,
        sharedView = null;

    LoadingView = Marionette.ItemView.extend({
        el: '.sidebarActions',
        template: false,

        initialize: function(options){
            if (sharedView) console.error('LoadingViewは既に初期化されています。LoadingView.getSharedViewを使用してください。');
            // 本当のel
            this.$loaderEl = $('.editLoader_bg');
        },

        //ajax
        onLoadShow: function(){
          var _this = this;

          $.ajax({
            type:'GET',
            dataType:'jsonp',
            timeout:20000,
            complete: function(data) {
              _this.$loaderEl.delay(900).fadeOut(800);
              _this.$loaderEl.find('.editLoader').delay(600).fadeOut(300, function() {
                  //チュートリアルのテンプレートの場合
                  if (Peraichi.editor.App.isTutorial()) {
                    setTimeout(function() {
                        //サイドバーのチュートリアルで利用しない処理を全て非活性化
                        _this.$el.find('.publish').addClass('grayoutTutorial');
                        _this.$el.find('#lp_info_button a').addClass('grayoutTutorial');
                        _this.$el.find('.mp_save').addClass('grayoutTutorial');
                        _this.$el.find('.mp_preview').addClass('grayoutTutorial');
                        $('.sidebar .logo').addClass('disabledTutorial');
                        $('#btn_sidebar_close').addClass('disabledTutorial');
                        $('.sidebarDevice .js-sidebar-device-note').addClass('grayoutTutorial');
                        $('.sidebarDevice .mp_768').addClass('grayoutTutorial');
                        $('.sidebarDevice .mp_375').addClass('grayoutTutorial');
                        $('.sidebarUndoRedo .undo_btn').addClass('grayoutTutorial');
                        $('.toggleSideSecond[data-type=webfont]').addClass('grayoutTutorial').find('a').css('color', 'gray');
                        $('.toggleSideSecond[data-type=colorScheme]').addClass('grayoutTutorial').find('a').css('color', 'gray');
                        $('.sidebarMenu').addClass('disabledTutorial');
                        Peraichi.editor.App.vent.trigger('completeEditorLoading');
                    }, 500);
                  }
              });
            }
          });
        },
        editLoaderShow: function(){
            this.$loaderEl.show();
            this.$loaderEl.find('.editLoader').show();
            setTimeout(_.bind(this.hide, this), 20000);
        },

        show: function(){
            this.$loaderEl.stop(true, true).show();
            this.$loaderEl.find('.editLoader').stop(true, true).show();
        },
        hide: function(){
            this.$loaderEl.delay(900).fadeOut(800);
            this.$loaderEl.find('.editLoader').delay(600).fadeOut(300);
        }
    });

    LoadingView.getSharedView = function(){
        if (!sharedView) sharedView = new LoadingView();
        return sharedView;
    };

    return LoadingView;
});
