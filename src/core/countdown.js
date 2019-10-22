/**
 * Copyright (c) 2018-2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */

import _ from "lodash";
import eventifier from 'depp/core/eventifier';

const defaults = {
    autoStart: false,
    interval: 1000
};

/**
 * Creates a countdown timer.
 *
 * @example sample usage
 *
 *      const countdown = countdownFactory(30, {autoStart: true})
 *          .on('tick', remaining => console.log(remaining, 'seconds remaining')
 *          .on('cancel', remaining => console.log('timer canceled')
 *          .on('done', () => console.log('time elapsed');
 *
 *      // for some reason...
 *      if (shouldCancel) {
 *          countdown.cancel();
 *      }
 *
 * @param {Number|String} countdown
 * @param {Object} config - Some config entries
 * @param {Boolean} [config.autoStart=false] - Auto start the countdown just after the instance is created
 * @param {Number|String} [config.interval=1000] - The update interval, change the overall duration of the countdown as it is its time unit.
 * @returns {countdown}
 */
export default function countdownFactory(countdown = 0, config = {}) {
    let delayHandle = null;
    let state = 'paused';

    config = _.defaults({}, config, defaults);
    countdown = Math.max(0, parseInt(countdown, 10) || 0);

    /**
     * Stops the countdown
     */
    const stop = () => {
        clearInterval(delayHandle);
        delayHandle = null;
    };

    /**
     * @typedef {Object} countdown
     */
    const api = {
        /**
         * Gets the remaining time on the countdown
         * @returns {Number}
         */
        get remaining() {
            return Math.max(0, countdown);
        },

        /**
         * Gets the config
         * @returns {Object}
         */
        get config() {
            return config;
        },

        /**
         * Gets the state
         * @returns {String}
         */
        get state() {
            return state;
        },

        /**
         * Pauses the countdown, if started
         * @returns {countdown}
         * @fires pause - when paused
         */
        pause() {
            if (delayHandle) {
                stop();
                state = 'paused';

                /**
                 * @event pause
                 * @param {Number} countdown
                 */
                this.trigger('pause', countdown);
            }
            return this;
        },

        /**
         * Reset the remaining time. If the autoStart option is `true`, force the start.
         * @param {Number|String} remaining
         * @returns {api}
         */
        reset(remaining) {
            countdown = Math.max(0, parseInt(remaining, 10) || 0);

            /**
             * @event reset
             * @param {Number} countdown
             */
            this.trigger('reset', countdown);

            if (config.autoStart) {
                this.start();
            }

            return this;
        },

        /**
         * Starts the countdown, if not already started
         * @returns {countdown}
         * @fires start - when starting
         * @fires tick - on each interval update
         * @fires done - when finished
         */
        start() {
            if (!delayHandle) {
                if (countdown > 0) {
                    state = 'running';

                    /**
                     * @event start
                     * @param {Number} countdown
                     */
                    this.trigger('start', countdown);

                    delayHandle = setInterval(() => {
                        countdown --;

                        /**
                         * @event tick
                         * @param {Number} countdown
                         */
                        this.trigger('tick', countdown);

                        if (countdown <= 0) {
                            stop();
                            state = 'done';

                            /**
                             * @event done
                             */
                            this.trigger('done');
                        }
                    }, parseInt(config.interval, 10) || defaults.interval);
                } else {
                    state = 'done';

                    /**
                     * @event done
                     */
                    this.trigger('done');
                }
            }
            return this;
        },

        /**
         * Cancels the countdown
         * @returns {countdown}
         * @fires cancel - when canceled
         */
        cancel() {
            if (delayHandle) {
                stop();
                state = 'canceled';

                /**
                 * @event cancel
                 * @param {Number} countdown
                 */
                this.trigger('cancel', countdown);
                countdown = 0;
            }
            return this;
        }
    };

    const instance = eventifier(api);

    if (config.autoStart) {
        _.defer(() => instance.start());
    }

    return instance;
}
