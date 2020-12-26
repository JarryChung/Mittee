export type EventName = string | symbol;

// 事件回调函数可以接收一些参数
export type Handler<T = any> = (params?: T) => void;
export type CommonHandler = (name: EventName, params?: any) => void;

// 已注册的事件所对应的回调函数数组
export type HandlerList = Handler[];
export type CommonHandlerList = CommonHandler[];

// 事件名与回调函数数组的映射表
export type HandlerMap = Map<EventName, HandlerList | CommonHandlerList>;

export interface Mittee {
  all: HandlerMap;

  on<T = any>(evtName: EventName, handler: Handler<T>): void;
  on(evtName: '*', handler: CommonHandler): void;

  once<T = any>(evtName: EventName, handler: Handler<T>): void;
  once(evtName: '*', handler: CommonHandler): void;

  off<T  = any>(evtName: EventName, handler: Handler<T>): void;
  off(evtName: '*', handler: CommonHandler): void;

  emit<T = any>(evtName: EventName, params?: T): void;
  emit(type: '*', params?: any): void;
}

/**
 * Mittee: A super tiny event bus.
 * @name mittee
 * @returns {Mittee}
 */
export default function mittee (all: HandlerMap = new Map()): Mittee {
  const mit = {
    /**
		 * 事件名与回调函数数组的映射表
		 */
    all,

    /**
		 * 注册事件
		 * @param {string|symbol} evtName 事件名, 通配符 `"*"` 表示所有事件
		 * @param {Function} handler 指定事件的回调函数
		 * @memberOf mittee
		 */
    on<T = any>(evtName: EventName, handler: Handler<T>): void {
      const h = all.get(evtName);
      const l = h && h.push(handler);
      !l && all.set(evtName, [handler]);
    },

    once<T = any>(evtName: EventName, handler: Handler<T>): void {
      const fn = (params: any) => {
        mit.off(evtName, fn);
        handler(params);
      };
      mit.on(evtName, fn);
    },

    /**
		 * 注销事件
		 * @param {string|symbol} evtName 事件名, 通配符 `"*"` 表示所有事件
		 * @param {Function} handler 需要注销的函数
		 * @memberOf mittee
		 */
    off<T = any>(evtName: EventName, handler: Handler<T>): void {
      const h = all.get(evtName);
      h && h.splice(h.indexOf(handler) >>> 0, 1);
    },

    /**
		 * 触发事件
     * 若事件通配符 `"*"` 下存在函数，则在执行完指定事件的回调函数后进行调用
		 *
		 * 注意：不支持手动触发事件通配符 `"*"` 的回调函数
		 *
		 * @param {string|symbol} type 事件名
		 * @param {Any} [params] 传递给回调函数的参数
		 * @memberOf mittee
		 */
    emit<T = any>(evtName: EventName, params: T): void {
      ((all.get(evtName) || []) as HandlerList).slice().map(h => { h(params); });
      ((all.get('*') || []) as CommonHandlerList).slice().map(h => { h(evtName, params); });
    },
  };
  return mit;
}
