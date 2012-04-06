var Lang = Y.Lang,
  Node = Y.Node,
  isNumber = Lang.isNumber,
  isBoolean = Lang.isBoolean,
  BLANK = '&#160;',
  _SHIM = Y.UA.ie && Y.UA.ie < 7,

  _CLASS_ICON = '_CLASS_ICON',
  _CLASS_MESSAGE = '_CLASS_MESSAGE',

  _SELECTOR_ICON = '_SELECTOR_ICON',
  _SELECTOR_MESSAGE = '_SELECTOR_MESSAGE',

  _EVENT_WINDOW_RESIZE = '_EVENT_WINDOW_RESIZE',
  _EVENT_WINDOW_SCROLL = '_EVENT_WINDOW_SCROLL',

  ICON = 'icon',
  MESSAGE = 'message',

  _CLASS_PREV_ICON = null,

  _AUTO_HIDE_TIMER = '_AUTO_HIDE_TIMER',

  /**
   * TODO: write comment according to yui docs
   */
  Notification = Y.Base.create('notification', Y.Widget, [
      Y.WidgetPosition,
      Y.WidgetPositionAlign,
      Y.WidgetPositionConstrain
    ], {
    // -- Prototype Properties ------
    _ICON_TEMPLATE: '<span/>',
    _MESSAGE_TEMPLATE: '<span/>',

    // -- Lifecycle Prototype Methods ----
    initializer: function () {
      this[_CLASS_ICON] = this.getClassName(ICON);
      this[_CLASS_MESSAGE] = this.getClassName(MESSAGE);

      this[_SELECTOR_ICON] = '.' + this[_CLASS_ICON];
      this[_SELECTOR_MESSAGE] = '.' + this[_CLASS_MESSAGE];
    },
    destructor: function () {
      this._unbindWindowEvents();
      this._unsetAutoHideTimer();

      this._iconNode = null;
      this._messageNode = null;
    },
    renderUI: function () {
      var iconNode = this._createIconNode(),
          messageNode = this._createMessageNode();

      if (_SHIM) {
        this.get('boundingBox').plug(Y.Plugin.Shim);
      }

      this._set('iconNode', iconNode);
      this._set('messageNode', messageNode);
    },
    bindUI: function () {
      this._configureWindowEvents();
    },
    syncUI: function () {

    },

    show: function (message, iconClass, timeout) {
      this._setMessage(message);
      this._setIconClass(iconClass);

      this._setAutoHideTimer(timeout);
      this._realign();
      return this.set('visible', true);
    },

    _setAutoHideTimer: function (timeout) {
      var time = (timeout || 0 === timeout) ? timeout : this.get('timeout'),
      self = this;
      this._unsetAutoHideTimer();
      if (time) {
        this[_AUTO_HIDE_TIMER] = Y.later(timeout || this.get('timeout'), self, this.hide);
      }
    },
    _unsetAutoHideTimer: function () {
      if (this[_AUTO_HIDE_TIMER]) {
        this[_AUTO_HIDE_TIMER].cancel();
        this[_AUTO_HIDE_TIMER] = null;
      }
    },

    _setMessage: function (message) {
      this.get('messageNode').set('innerHTML', message);
    },
    _setIconClass: function (iconClass) {
      this.get('iconNode').replaceClass(_CLASS_PREV_ICON, iconClass);
      _CLASS_PREV_ICON = iconClass;
    },

    _realign: function () {
      var align = this.get('align');
      this.align(align.node, align.points);
    },
    _bindWindowEvents: function () {
      if (!this[_EVENT_WINDOW_RESIZE]) {
        this[_EVENT_WINDOW_RESIZE] = Y.on('windowresize', Y.bind(function (e) {
          this._realign();
        }, this));
      }
      if (!this[_EVENT_WINDOW_SCROLL]) {
        this[_EVENT_WINDOW_SCROLL] = Y.on('scroll', Y.bind(function (e) {
          this._realign();
        }, this));
      }
    },
    _unbindWindowEvents: function () {
      if (this[_EVENT_WINDOW_RESIZE]) {
        this[_EVENT_WINDOW_RESIZE].detach();
        this[_EVENT_WINDOW_RESIZE] = null;
      }
      if (this[_EVENT_WINDOW_SCROLL]) {
        this[_EVENT_WINDOW_SCROLL].detach();
        this[_EVENT_WINDOW_SCROLL] = null;
      }
    },
    _configureWindowEvents: function () {
      if (this.get('keepAlinged')) {
        this._bindWindowEvents();
      } else {
        this._unbindWindowEvents();
      }
    },
    _setKeepAligned: function (val) {
      this._configureWindowEvents();
      return val;
    },

    _createIconNode: function () {
      var iconNode = this.get('iconNode');
      if (!iconNode) {
        iconNode =  Node.create(this._ICON_TEMPLATE);
        this.get('contentBox').appendChild(iconNode);
      }

      return iconNode.addClass(this[_CLASS_ICON]).setAttrs({
        id: Y.stamp(iconNode),
        role: 'icon',
        innerHTML: BLANK
      });
    },

    _createMessageNode: function () {
      var messageNode = this.get('messageNode');
      if (!messageNode) {
        messageNode = Node.create(this._MESSAGE_TEMPLATE);
        this.get('contentBox').appendChild(messageNode);
      }

      return messageNode.addClass(this[_CLASS_MESSAGE]).setAttrs({
        id: Y.stamp(messageNode),
        role: 'message'
      });
    }
  }, {
    ATTRS: {
      timeout: {
        value: 1000,
        validator: isNumber
      },
      keepAlinged: {
        value: true,
        validator: isBoolean,
        setter: '_setKeepAligned'
      },
      constrain: {
        value: true
      },
      iconNode: {
        readOnly: true,
        value: null
      },
      messageNode: {
        readOnly: true,
        value: null
      },
      align: {
        value: {
          points: [
            Y.WidgetPositionAlign.TC,
            Y.WidgetPositionAlign.TC
          ]
        }
      }
    },

    ICON_NONE: 'none',
    ICON_BLOCK: 'blockicon',
    ICON_ALARM: 'alerticon',
    ICON_HELP: 'helpicon',
    ICON_INFO: 'infoicon',
    ICON_WARN: 'warnicon',
    ICON_TIP: 'tipicon',

    HTML_PARSER: {
      iconNode: function (srcNode) {
        return srcNode.one(_SELECTOR_ICON);
      },
      messageNode: function (srcNode) {
        return srcNode.one(_SELECTOR_MESSAGE);
      }
    }
  });

Y.namespace('A').Notification = Notification;
