export type EventName = string | symbol;

// The event callback function can receive some parameters
export type Handler<T = any> = (params?: T) => void;
export type CommonHandler = (name: EventName, params?: any) => void;

// An array of callback functions corresponding to registered events
export type HandlerList = Handler[];
export type CommonHandlerList = CommonHandler[];

// The mapping table of the event name and the callback function array
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
		 * The mapping table of the event name and the callback function array
		 */
    all,

    /**
		 * Register the event
		 * @param {string|symbol} evtName Event name, '*' means all events
		 * @param {Function} handler Specifies the callback function for the event
		 * @memberOf mittee
		 */
    on<T = any>(evtName: EventName, handler: Handler<T>): void {
      const h = all.get(evtName);
      const l = h && h.push(handler);
      !l && all.set(evtName, [handler]);
    },

    /**
     * Register an event and trigger it only once
		 * @param {string|symbol} evtName Event name, '*' means all events
		 * @param {Function} handler Specifies the callback function for the event
		 * @memberOf mittee
     */
    once<T = any>(evtName: EventName, handler: Handler<T>): void {
      const fn = (params: any) => {
        mit.off(evtName, fn);
        handler(params);
      };
      mit.on(evtName, fn);
    },

    /**
		 * Remove the event
		 * @param {string|symbol} evtName Event name, '*' means all events
		 * @param {Function} handler Specify the callback function
		 * @memberOf mittee
		 */
    off<T = any>(evtName: EventName, handler: Handler<T>): void {
      const h = all.get(evtName);
      h && h.splice(h.indexOf(handler) >>> 0, 1);
    },

    /**
		 * Trigger an event
     * If a function exists under the event '*',
     * it is called after the callback function for the specified event has been executed
		 *
		 * Note: Callback functions that manually trigger the event '*' are not supported
		 *
		 * @param {string|symbol} evtName Event name
		 * @param {Any} [params] The argument passed to the callback function
		 * @memberOf mittee
		 */
    emit<T = any>(evtName: EventName, params: T): void {
      ((all.get(evtName) || []) as HandlerList).slice().map(h => { h(params); });
      ((all.get('*') || []) as CommonHandlerList).slice().map(h => { h(evtName, params); });
    },
  };
  return mit;
}
