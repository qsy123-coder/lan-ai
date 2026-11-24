/** 
---消息接口
* message 消息内容
* targetOrigin 目标源（目前不做限制）
postMessage(message,targetOrigin)

---消息格式
{
    type 消息类型
    data 消息内容（JSON格式）
}

---视图层级
> 菜单层（底部菜单）
> 页面层（登录框，注册框，个人中心，后续扩展页面登）
*/

class FloatBall {
  constructor(options = {}) {
    this.options = {
      size: options.size || 35,
      image: options.image || '',
      distance: options.distance >= 0 ? options.distance : 20,
      container: options.container || document.body,
      zIndex: options.zIndex || 9999,
      onClick: options.onClick || null,
      defaultPosition: options.defaultPosition || 'left-center',
      isHidden: options.isHidden || false, // 新增隐藏状态选项
    };

    // 状态追踪
    this.dragStartTime = 0;
    this.lastClickTime = 0;
    this.moveDistance = 0;

    this.init();
  }

  init() {
    this.createBall();

    this.isDragging = false;
    this.currentX = 0;
    this.currentY = 0;
    this.initialX = 0;
    this.initialY = 0;

    // 初始化位置
    this.initPosition();
    this.snapToBorder();
    this.bindEvents();
  }

  createBall() {
    this.ball = document.createElement('div');
    this.ball.className = 'float-ball';

    const style = `
            width: ${this.options.size}px;
            height: ${this.options.size}px;
            position: fixed;
            cursor: pointer;
            transition: all 0.3s ease-out;
            z-index: ${this.options.zIndex};
            user-select: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
            background-image: url('${this.options.image}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            touch-action: none;
            left:0px;
            top:0px
        `;

    this.ball.style.cssText = style;
    this.options.container.appendChild(this.ball);
  }

  initPosition() {
    const pos = this.options.defaultPosition;
    const maxX = window.innerWidth - this.options.size;
    const maxY = window.innerHeight - this.options.size;
    let distance = this.options.distance;
    switch (pos) {
      case 'right-bottom':
        this.currentX = maxX - distance;
        this.currentY = maxY - distance;
        break;
      case 'right-top':
        this.currentX = maxX - distance;
        this.currentY = distance;
        break;
      case 'right-center':
        this.currentX = maxX - distance;
        this.currentY = maxY / 2;
        break;
      case 'left-bottom':
        this.currentX = distance;
        this.currentY = maxY - distance;
        break;
      case 'left-top':
        this.currentX = distance;
        this.currentY = distance;
        break;
      case 'left-center':
        this.currentX = distance;
        this.currentY = maxY / 2;
        break;
    }

    this.setPosition(this.currentX, this.currentY);
  }

  bindEvents() {
    // 触摸事件
    this.ball.addEventListener('touchstart', (e) => this.dragStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
    document.addEventListener('touchend', (e) => this.dragEnd(e));
    document.addEventListener('touchcancel', (e) => this.dragEnd(e));

    // 鼠标事件
    this.ball.addEventListener('mousedown', (e) => this.dragStart(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', (e) => this.dragEnd(e));

    // 点击事件（废弃）
    // if (this.options.onClick) {
    //     this.ball.addEventListener('click', (e) => {
    //         if (this.moveDistance > 5) {
    //             e.preventDefault();
    //             e.stopPropagation();
    //             return;
    //         }

    //         const now = Date.now();
    //         if (now - this.lastClickTime < 300) {
    //             return;
    //         }
    //         this.lastClickTime = now;
    //         this.options.onClick(e);
    //     });
    // }

    if (this.options.onClick) {
      // 添加点击事件
      this.bindClickForBall();
    }

    // 窗口大小改变时重新计算位置
    window.addEventListener('resize', () => {
      // 重新处理悬浮球位置
      this.handleResize();
    });
  }

  bindClickForBall() {
    this.addClickEvent(
      this.ball,
      (e) => {
        console.log('点击事件触发', e);
        // 显示球
        this.setHidden(false);
        // 回调
        this.options.onClick(e);
      },
      {
        preventDefault: true,
        stopPropagation: true,
        delay: 300,
      },
    );
  }

  /**
   * 创建通用点击事件监听器
   * @param {HTMLElement} element 目标元素
   * @param {Function} callback 回调函数
   * @param {Object} options 配置选项
   */
  addClickEvent(element, callback, options = {}) {
    if (!element || typeof callback !== 'function') return;

    const {
      preventDefault = true, // 是否阻止默认行为
      stopPropagation = true, // 是否阻止冒泡
      delay = 300, // 点击判定延迟（毫秒）
    } = options;

    let touchStartTime = 0;
    let touchEndTime = 0;
    let lastTouchEnd = 0;
    let startX = 0;
    let startY = 0;

    // 判断是否为移动设备
    // const isMobile = 'ontouchstart' in window;

    if (!element.bindClick) {
      // 移动端
      element.addEventListener(
        'touchstart',
        (e) => {
          touchStartTime = Date.now();
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;

          if (preventDefault) e.preventDefault();
          if (stopPropagation) e.stopPropagation();
        },
        false,
      );

      element.addEventListener(
        'touchend',
        (e) => {
          touchEndTime = Date.now();

          // 计算触摸时间和距离
          const touchTime = touchEndTime - touchStartTime;
          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const moveDistance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

          // 防止重复点击
          if (touchEndTime - lastTouchEnd <= delay) {
            if (preventDefault) e.preventDefault();
            return;
          }

          // 判断是否为有效点击（时间短且移动距离小）
          if (touchTime < 300 && moveDistance < 10) {
            callback(e);
            lastTouchEnd = touchEndTime;
          }

          if (preventDefault) e.preventDefault();
          if (stopPropagation) e.stopPropagation();
        },
        false,
      );

      // pc端
      element.addEventListener(
        'click',
        (e) => {
          if (preventDefault) e.preventDefault();
          if (stopPropagation) e.stopPropagation();
          callback(e);
        },
        false,
      );

      element.bindClick = true;
    }
  }

  handleResize() {
    const maxX = window.innerWidth - this.options.size;
    const maxY = window.innerHeight - this.options.size;

    // 确保球体不会超出新的窗口边界
    this.currentX = Math.min(this.currentX, maxX);
    this.currentY = Math.min(this.currentY, maxY);

    // 重新贴边
    this.snapToBorder();
  }

  dragStart(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;

    e.preventDefault();
    this.isDragging = true;
    this.dragStartTime = Date.now();
    this.moveDistance = 0;
    this.ball.style.transition = 'none';

    if (e.type === 'mousedown') {
      this.initialX = e.clientX - this.currentX;
      this.initialY = e.clientY - this.currentY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    } else {
      this.initialX = e.touches[0].clientX - this.currentX;
      this.initialY = e.touches[0].clientY - this.currentY;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
    }
  }

  drag(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

    // 计算移动距离
    const deltaX = clientX - this.lastX;
    const deltaY = clientY - this.lastY;
    this.moveDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    this.lastX = clientX;
    this.lastY = clientY;

    this.currentX = clientX - this.initialX;
    this.currentY = clientY - this.initialY;

    // 限制边界
    const maxX = window.innerWidth - this.options.size;
    const maxY = window.innerHeight - this.options.size;

    this.currentX = Math.min(Math.max(0, this.currentX), maxX);
    this.currentY = Math.min(Math.max(0, this.currentY), maxY);

    this.setPosition(this.currentX, this.currentY);
  }

  dragEnd(e) {
    if (!this.isDragging) return;

    const dragEndTime = Date.now();
    const dragDuration = dragEndTime - this.dragStartTime;

    this.isDragging = false;
    this.ball.style.transition = 'all 0.3s ease-out';

    // 如果拖动时间很短且移动距离很小，可能是点击
    if (dragDuration < 200 && this.moveDistance < 10) {
      return;
    }

    this.snapToBorder();
  }

  snapToBorder() {
    const halfWidth = window.innerWidth / 2;
    const maxX = window.innerWidth - this.options.size;

    // 根据当前位置决定贴到哪边
    if (this.options.isHidden) {
      this.currentX =
        this.currentX + this.options.size / 2 > halfWidth
          ? maxX + this.options.size * 0.3
          : -this.options.size * 0.3;
    } else {
      this.currentX =
        this.currentX + this.options.size / 2 > halfWidth
          ? maxX - this.options.distance
          : this.options.distance;
    }

    // 透明度
    this.ball.style.opacity = this.options.isHidden ? '0.3' : '1';
    // 位置
    this.setPosition(this.currentX, this.currentY);
  }

  setPosition(x, y) {
    this.currentX = x;
    this.currentY = y;
    this.ball.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  show() {
    this.ball.style.display = 'block';
  }

  hide() {
    this.ball.style.display = 'none';
  }

  // 新增设置隐藏状态的方法
  setHidden(isHidden) {
    this.options.isHidden = isHidden;
    this.snapToBorder(); // 立即更新位置
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('touchmove', this.drag);
    document.removeEventListener('touchend', this.dragEnd);
    document.removeEventListener('mousemove', this.drag);
    document.removeEventListener('mouseup', this.dragEnd);
    this.ball.remove();
  }
}

class H5SDK {
  constructor() {
    // 容器
    this._iframe = null;
    // 浮动球
    this._ball = null;
    // 目标源：要求与当前web同源
    this._targetOrigin = window.location.origin;
    // 回调表
    this._handler = {};
    // 初始化返回的数据
    this._initData = {};
    // A same-tab login handoff is supplied by the host after it removes the
    // credential from the address bar. Kept only in memory for SDK retries.
    this._loginSecretSnapshot = null;
  }

  // 初始化
  setup(config, handler, loginSecretSnapshot = null) {
    this.setLoginSecretSnapshot(loginSecretSnapshot);
    let loginSecret = this._getLoginSecret();
    config = this._normalizeGameConfig(config);
    if (!config) {
      console.error('[H5SDK] rejected untrusted game URL');
      return;
    }

    // 获取渠道id
    config.promote_id = this._getQueryParam('pid', '0');

    // 配置编码
    let strConfig = this._encodeConfig(config);
    console.log('[encodeConfig] ready');

    // 带有`login_secret`信息，但是不是在iframe情况下，则认为非法访问，直接跳转到游戏详情页
    // https://a.com/mobile/game/detail/game_id/39.html
    if (loginSecret && window.self === window.top) {
      // 从配置中获取gameurl和gameid
      let gameurl = config.gameurl;
      let gameid = config.gameid;
      if (gameurl && gameid) {
        // 构建游戏详情页URL并跳转
        let detailUrl = `${gameurl}/mobile/game/detail/game_id/${gameid}.html`;
        window.location.href = detailUrl;
        return;
      }
    }

    // 创建iframe
    let iframe = document.getElementById('h5sdk_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.zIndex = 1000;
      iframe.style.width = '100%';
      // iframe.style.height = '100vh';
      // 处理移动平台底部标题栏占用高度的问题
      iframe.style.height = this._getInnerHeight();
      iframe.style.border = 'none';
      iframe.style.top = '0px';
      iframe.style.left = '0px';
      iframe.src = `/mgwan-sdk/index.html?c=${strConfig}&v=${Math.random()}`;
      document.body.appendChild(iframe);

      // 处理resize后页面尺寸没有变化的问题
      window.addEventListener('resize', () => {
        iframe.style.height = this._getInnerHeight();
      });

      // 处理Safari上小键盘关闭后，页面位置没有复位的问题
      document.addEventListener('focusout', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          // 处理自己
          window.scrollTo(0, 0);
          // 处理父窗口
          setTimeout(() => {
            try {
              let windows =
                window.parent && window.parent === window.top
                  ? [window.parent]
                  : [window.parent, window.top];
              windows.forEach((e) => {
                if (e) {
                  let data = JSON.stringify({ op: 'input:focusout' });
                  e.postMessage(data, '*');
                }
              });
            } catch (err) {
              console.log('错误:' + err.message);
            }
          });
        }
      });
    }
    this._iframe = iframe;

    // 创建浮动球（独立游戏环境）
    let isSingle = this._isSingle();
    if (isSingle) {
      this._ball = new FloatBall({
        size: 35,
        image: '/mgwan-sdk/ball.png', // 替换为你的图片URL
        distance: 0,
        isHidden: this._getBallHide(),
        defaultPosition: 'left-center',
        onClick: () => {
          console.log('点击了悬浮球！');
          this.menu();
        },
      });
      this._ball.hide();
    }

    // 保存回调委托
    this._handler = handler;
    // 监听消息
    this._bindListeners();
  }

  // 开始登录
  login() {
    // 如果页面带有登录信息
    let loginSecret = this._getLoginSecret();
    if (loginSecret) {
      // 无需通知用户，直接内部登录
      this._doQuickLogin(loginSecret);
      return;
    }

    // 拉起登录框
    let msg = {
      type: 'login',
      data: {},
    };
    this._call(msg);
  }

  setLoginSecretSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' || typeof snapshot.secret !== 'string') {
      this._loginSecretSnapshot = null;
      return;
    }
    this._loginSecretSnapshot = {
      secret: snapshot.secret,
      env: typeof snapshot.env === 'string' ? snapshot.env : '',
    };
  }

  clearLoginSecretSnapshot() {
    this._loginSecretSnapshot = null;
  }

  _getTrustedGameUrl(value) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== 'https:'
        || parsed.origin !== 'https://sdk.ghjwq.com'
        || parsed.username
        || parsed.password) {
        return null;
      }
      return parsed.origin;
    } catch {
      return null;
    }
  }

  _normalizeGameConfig(config) {
    const gameurl = this._getTrustedGameUrl(config?.gameurl);
    return gameurl ? { ...config, gameurl } : null;
  }

  // 开始注册
  register() {
    let msg = {
      type: 'register',
      data: {},
    };
    this._call(msg);
  }

  // 开始登出(保留`自动登录`的状态)
  logout(clear = true) {
    let msg = {
      type: 'logout',
      data: { clear },
    };
    this._call(msg);
  }

  // 清空登出(重置`自动登录`的状态(默认开启))
  clear() {
    let msg = {
      type: 'clear',
      data: {},
    };
    this._call(msg);
  }

  // 内购
  pay(data) {
    let msg = {
      type: 'pay',
      data,
    };
    this._call(msg);
  }

  // 充值
  ptbpay(data) {
    let msg = {
      type: 'ptbpay',
      data,
    };
    this._call(msg);
  }

  // 显示底部菜单
  menu() {
    let msg = {
      type: 'menuOpen',
      data: {},
    };
    this._call(msg);
  }

  // 显示账单页
  bill() {
    let msg = {
      type: 'billOpen',
      data: {},
    };
    this._call(msg);
  }

  // 显示优惠券
  coupon() {
    let msg = {
      type: 'couponOpen',
      data: {},
    };
    this._call(msg);
  }

  // 关闭视图(内部回到`/`，且隐藏iframe)
  close() {
    let msg = {
      type: 'close',
      data: {},
    };
    this._call(msg);
  }

  // 打开客服
  chat(show = true) {
    this._doChatOpen(show);
  }

  // 上报角色信息
  uploadRole(data) {
    let msg = {
      type: 'uploadRole',
      data,
    };
    this._call(msg);
  }

  // 获取游戏价格
  gamePrice() {
    let msg = {
      type: 'gamePrice',
      data: {},
    };
    this._call(msg);
  }

  // 获取游戏购买信息
  gamePay() {
    let msg = {
      type: 'gamePay',
      data: {},
    };
    this._call(msg);
  }

  _isSingle() {
    return this._getLoginSecret() == null;
  }

  _doVisible(visible) {
    this._iframe.style.display = visible ? 'inline' : 'none';
  }

  _doBallHide(hide) {
    this._ball?.setHidden(hide);
  }

  _doBallShow(show) {
    show ? this._ball?.show() : this._ball?.hide();
  }

  _doQuickLogin(data) {
    // 快速登录
    let msg = {
      type: 'quickLogin',
      data,
    };
    this._call(msg);
  }

  async _doChatOpen(open) {
    // 显示loading
    this._toggleLoading(true);
    // 初始化客服系统
    await this._doAddChatScript(this._initData);
    // 设置客服窗口状态
    if (window.$crisp) {
      if (open) {
        window.$crisp.push(['do', 'chat:show']);
        window.$crisp.push(['do', 'chat:open']);

        // 触发`chat_opened`消息
        let cb = this._handler['chat_opened'];
        cb && cb({});
      } else {
        window.$crisp.push(['do', 'chat:hide']);
        window.$crisp.push(['do', 'chat:close']);
      }
    }
    // 隐藏loading
    this._toggleLoading(false);
  }

  async _doAddChatScript({ websiteId }) {
    return new Promise((resolve, reject) => {
      console.log('[_addChatScript] websiteId: ', websiteId);
      if (!window.crispLoaded) {
        let script = document.getElementById('h5sdk_chatScript');
        if (!script) {
          // 记录加载crisp的resolve
          window.crispResolve = resolve;

          // 动态加载脚本
          script = document.createElement('script');
          script.type = 'text/javascript';
          script.id = 'h5sdk_chatScript'; // 添加id便于后续删除
          // 方式1：直接设置内容
          script.innerHTML = `
                        window.$crisp=[];
                        window.CRISP_WEBSITE_ID="${websiteId}";
                        (function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
                    
                        // 监听客服系统加载完成
                        window.$crisp.push(["on", "session:loaded", function(session_id) {
                            window.crispLoaded = true;
                            window.crispResolve()
                        }]);

                        // 监听当窗口关闭：顺便隐藏客服系统
                        window.$crisp.push(["on", "chat:closed", () => {
                            window.$crisp.push(["do", "chat:hide"]);
                            window.$crisp.push(["do", "chat:close"]);
                        }]);

                        // 写入昵称
                        if (window.crispNickname) {
                            window.$crisp.push(["set", "user:nickname", window.crispNickname]);
                        }

                        // 默认隐藏客服
                        window.$crisp.push(["do", "chat:hide"]);
                        window.$crisp.push(["do", "chat:close"]);
                    `;
          document.head.appendChild(script);
        }
      } else {
        resolve();
      }
    });
  }

  _doChatName(nickname) {
    if (window.$crisp) {
      window.$crisp.push(['set', 'user:nickname', nickname]);
    } else {
      // 暂时保存
      window.crispNickname = nickname;
    }
  }

  _doBillOpen() {
    let msg = {
      type: 'billOpen',
      data: {},
    };
    this._call(msg);
  }

  _doCouponOpen() {
    let msg = {
      type: 'couponOpen',
      data: {},
    };
    this._call(msg);
  }

  _doGuideOpen() {
    let msg = {
      type: 'guideOpen',
      data: {},
    };
    this._call(msg);
  }

  _doNewsOpen() {
    let msg = {
      type: 'newsOpen',
      data: {},
    };
    this._call(msg);
  }

  _doPTBPay(data) {
    let msg = {
      type: 'ptbpay',
      data,
    };
    this._call(msg);
  }

  _doOpenUrl(data) {
    let value = data?.value;
    if (!value) return;
    window.location.href = value;
  }

  _doFresh() {
    window.location.reload();
  }

  _getBallHide() {
    let item = localStorage.getItem('H5SDK_BALLHIDE');
    return item === '1';
  }

  _bindListeners() {
    window.addEventListener(
      'message',
      (msg) => {
        // 内层H5SDK，以及外层平台都会给游戏层发消息，这里取消origin过滤
        // Origin filter is intentionally disabled, but we still need to
        // reject messages from unrelated senders (ad iframes, analytics
        // widgets, browser extensions, self-posts) so they cannot trigger
        // SDK side effects like hiding the ball or booting the chat
        // loader. Only accept the SDK's own inner iframe and, when we are
        // actually embedded, the outer platform frame. At top-level
        // `window.parent === window`, so accepting `window.parent`
        // unconditionally would silently whitelist self-posts from
        // extensions or injected scripts.
        const hasOuterParent = window !== window.parent;
        if (
          msg.source !== this._iframe?.contentWindow
          && !(hasOuterParent && msg.source === window.parent)
        ) {
          return;
        }
        if (typeof msg.data === 'string') {
          // Swallow non-JSON payloads (UC Browser's PREUCBROWSER preamble,
          // webpack runtime snippets, etc.) instead of surfacing parse
          // errors to Sentry. Only JSON envelopes with a string `type` and
          // an object `data` field are SDK protocol messages — drop the
          // rest instead of degrading via `data?.x` lookups that would
          // still trigger side effects (e.g. hide iframe on missing data).
          let payload;
          try {
            payload = JSON.parse(msg.data);
          } catch (e) {
            return;
          }
          if (
            !payload
            || typeof payload !== 'object'
            || Array.isArray(payload)
            || typeof payload.type !== 'string'
            || !payload.data
            || typeof payload.data !== 'object'
            || Array.isArray(payload.data)
          ) {
            return;
          }
          this._onCall(payload);
        }
      },
      false,
    );
  }

  _getInnerHeight() {
    return (
      (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) +
      'px'
    );
  }

  // 从平台跳转到游戏页，可直接拿到登录信息，避免二次登录
  _getLoginSecret() {
    let data = null;

    // Prefer the host-captured in-memory handoff. Query fallback preserves
    // compatibility for older embedders that have not adopted the adapter.
    let value = this._loginSecretSnapshot?.secret ?? this._getQueryParam('login_secret');
    if (value == null) {
      console.log('[_getLoginData] 没有找到`login_secret`');
      return data;
    }

    try {
      data = JSON.parse(decodeURIComponent(value));
      console.log('[_getLoginData] 找到`login_secret`');
    } catch (error) {
      console.log('[_getLoginData] JSON解析失败');
    }

    // env
    if (data) {
      data.env = this._loginSecretSnapshot?.env ?? this._getQueryParam('env', '');
    }
    return data;
  }

  _getQueryParam(param, defaultValue = null) {
    const queryString = window.location.search; // 获取查询字符串
    const params = new URLSearchParams(queryString);
    return params.has(param) ? params.get(param) : defaultValue; // 返回指定参数的值
  }

  _encodeConfig(config) {
    // 1. 序列化为JSON字符串
    const jsonStr = JSON.stringify(config);
    // 2. 使用TextEncoder和btoa处理非Latin1字符
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonStr);
    const base64Str = btoa(String.fromCharCode.apply(null, data));
    // 3. url编码
    return encodeURIComponent(base64Str);
  }

  _toggleLoading(isShow) {
    // 获取已有的loading元素，如果不存在则创建
    let loadingElement = document.getElementById('full-screen-loading');

    // 如果需要显示loading但元素不存在，则创建它
    if (isShow && !loadingElement) {
      loadingElement = document.createElement('div');
      loadingElement.id = 'full-screen-loading';
      loadingElement.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <div class="loading-text">客服加载中</div>
        </div>
      `;

      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        #full-screen-loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        
        .loading-spinner {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }

        .loading-text {
          color: #666;
          font-size: 14px;
          animation: bounce 1s ease infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(loadingElement);
    }

    // 如果loading元素存在，根据isShow参数控制其显示或隐藏
    if (loadingElement) {
      loadingElement.style.display = isShow ? 'flex' : 'none';
    }
  }

  _callUpwards(msg) {
    console.log('[H5SDK:callUpwards]', msg?.type);
    // 当确实存在外层parent时才执行
    // 如果只有当前页面时,window.parent和window的指向同一对象
    if (window !== window.parent) {
      window.parent.postMessage(
        JSON.stringify(msg),
        '*', // 这里设置任意，因为上层窗体域名不可预知
      );
    }
  }

  _call(msg) {
    console.log('[H5SDK:call]', msg?.type);
    this._iframe.contentWindow.postMessage(
      JSON.stringify(msg), // 需要序列化
      this._targetOrigin,
    );
  }

  _onCall(msg) {
    console.log('[H5SDK:onCall]', msg?.type);
    let { type, data } = msg;

    // 内部处理
    if (type == 'visible') {
      this._doVisible(data?.value);
    } else if (type == 'hide') {
      this._doBallHide(data?.value);
    } else if (type == 'show') {
      this._doBallShow(data?.value);
    } else if (type == 'fresh') {
      this._doFresh();
    } else if (type == 'chatOpen') {
      this._doChatOpen(data?.value);
    } else if (type == 'chatName') {
      this._doChatName(data?.value);
    } else if (type == 'billOpen') {
      this._doBillOpen();
    } else if (type == 'couponOpen') {
      this._doCouponOpen();
    } else if (type == 'guideOpen') {
      this._doGuideOpen();
    } else if (type == 'newsOpen') {
      this._doNewsOpen();
    } else if (type == 'ptbpay') {
      this._doPTBPay(data);
    } else if (type == 'openUrl') {
      this._doOpenUrl(data);
    } else {
      // 内部+外部处理
      if (type == 'init') {
        // 保存初始化数据
        this._initData = data;
      } else if (type == 'login_succ') {
        // 设置悬浮球状态
        if (data?.options?.env) {
          if (data.options.env == 'mp') {
            // 小程序
            this._ball?.show();
          } else if (data.options.env == 'pt') {
            // 平台
            this._ball?.hide();
          }
        } else {
          this._ball?.show();
        }
      } else if (type == 'logout_succ') {
        // 隐藏悬浮球
        this._ball?.hide();

        // 通知平台发起登出操作
        let top = window.top;
        if (top) {
          console.log('sdk:通知top层发起登出操作');
          let data = JSON.stringify({ op: 'user:logout' });
          top.postMessage(data, '*');
        }
      }

      // 外部回调
      let cb = this._handler[type];
      cb && cb(data);
    }
  }
}
// 暴露到全局
window.H5SDK = H5SDK;
