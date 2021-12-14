define([
    'jquery',
    'underscore',
    'marionette'
], function ($, _, Marionette) {
    var PreviewView = Marionette.View.extend({
        el: '.preview_wrap',
        ui: {
            previewBody: '.preview_body',
            previewIframe: '.preview_iframe',
            previewSizeController: '#preview-size-controller',
            pcBtn: '[data-device=pc]',
            tabletBtn: '[data-device=tablet]',
            smartphoneBtn: '[data-device=smartphone]',
        },
        events: {
            'click li': 'previewSizeController'
        },
        deviceDetector: null,
        isKurokoTemplate: false,
        initialize: function(){
            const _device = $('html').data('access-device');
            this.deviceDetector = {
                isMobile: _device === 'mobile',
                isTablet: _device === 'tablet',
                isDesktop: _device === 'desktop',
            };
            this.bindUIElements();
            if (this.deviceDetector.isMobile) {
                this.ui.smartphoneBtn.addClass('selected');
                this.ui.previewBody.addClass('hasScalableIframe');
            } else if (this.deviceDetector.isTablet) {
                this.ui.tabletBtn.addClass('selected');
                this.ui.previewBody.addClass('hasScalableIframe');
            } else {
                this.ui.pcBtn.addClass('selected');
            }
            $(window).on('resize', _.debounce(() => {
                this.ui.previewSizeController.find('.selected').closest('li').trigger('click');
            }, 100));
        },
        loadingPreviewIframe: function(){
            this.isKurokoTemplate = this.ui.previewIframe.contents().find('body').data('template-name') === 'kuroko';
            const selectedBtn = $('#preview-size-controller').find('.selected');
            this.resizePreviewIframe(selectedBtn.closest('li').data('size'));
            this.ui.previewIframe.contents().find('html').css({ 'text-size-adjust' : '100%' }); // モバイルブラウザにおいてiframe内テキストの自動拡大を防ぐ
        },
        previewSizeController: function(e) {
            this.resizePreviewIframe($(e.currentTarget).data('size'));
            this.addSelected(e.currentTarget);
        },
        addSelected: function(selectedBtn) {
            this.ui.previewSizeController.find('.selected').removeClass('selected');
            $(selectedBtn).find('a').addClass('selected');
        },

        /**
         * プレビューの本体サイズを設定する
         * アクセスしたデバイスがPCかそれ以外かで表示の挙動が変わる
         *
         * PCでアクセス
         * - PCサイズを選択：横幅一杯のレスポンシブ
         * - タブレット・スマホサイズを選択：それぞれのサイズで固定。表示画面が小さい場合は横スクロール
         *
         * タブレット・スマホでアクセス
         * - 選択したサイズがデバイスの横幅以下：それぞれのサイズで固定。ランドスケープ含む
         * - 選択したサイズがデバイスの横幅より大きい：プレビュー全体をみせるためiframeを縮小
         * - ※PC選択時の横幅は1024pxとする
         */
        resizePreviewIframe: function (width) {
            const windowWidth = $(window).width();
            const previewBodyHeight = this.ui.previewBody.height();
            const previewIframeContents = this.ui.previewIframe.contents();
            const previewIframeHeight = previewIframeContents.find('body').height();
            let height = Math.min(previewBodyHeight, previewIframeHeight);
            // iframeの方が小さい場合はスクロールfooterを表示させる余地を残すためfooter分の高さを引く
            if (previewIframeHeight < previewBodyHeight) {
                height -= 45;
            }
            let scale = 1;
            if (!this.deviceDetector.isDesktop) {
                width = width === '100%' ? '1024' : width; // PC選択時は固定値1024pxに変換
                scale = windowWidth / width > 1 ? 1 : Math.round((windowWidth / width) * 1000) / 1000; // 拡大はしない
                height = Math.round((height / scale) * 1000) / 1000;
            }
            // KUROKOテンプレは高さを強制的にpreviewBodyHeightと合わせる。scaleも無視する。
            if (this.isKurokoTemplate) {
                height = previewBodyHeight;
            }
            this.ui.previewIframe.css({
                width: width,
                height: height,
                transform: `scale(${scale})`
            }).trigger('resizePreviewIframe');

            // NOTE: iframeの縮小を変えた直後に描画が崩れる（表示欠け、fixedコンテンツのズレなど）ケースがあったので、タイミングをずらしてスクロールを強制発火
            setTimeout(() => {
                previewIframeContents.scrollTop(previewIframeContents.scrollTop() + 1);
            }, 100);
        }
    });
    return PreviewView;
});
