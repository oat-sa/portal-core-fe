/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
import _ from 'lodash';
import eventifier from '../core/eventifier';

/**
 * Builds a page controller
 * @param {String} selector - The CSS selector that targets the page element
 * @param {Object} specs - Some API to add
 * @param {Object} [defaults] - Some default config entries if any
 * @returns {pageController}
 */
function pageController(selector, specs, defaults) {
    const controllerState = {};

    /**
     * @typedef {Object} pageController
     */
    const controllerApi = {
        /**
         * Gets the CSS selector for the page element
         * @returns {String}
         */
        getSelector() {
            return selector;
        },

        /**
         * Checks if the controller has a particular state
         * @param {String} state
         * @returns {Boolean}
         */
        is(state) {
            return !!controllerState[state];
        },

        /**
         * Sets the controller to a particular state
         * @param {String} state
         * @param {Boolean} flag
         * @returns {pageController}
         * @fires component#state
         */
        setState(state, flag) {
            controllerState[state] = !!flag;

            /**
             * Executes extra tasks on state change
             * @event controller#state
             * @param {String} state
             * @param {Boolean} flag
             */
            this.trigger('state', state, controllerState[state]);

            return this;
        },

        /**
         * Get the component's configuration
         * @returns {Object}
         */
        getConfig() {
            return this.config || defaults || {};
        },

        /**
         * Initializes the controller
         * @param {Object} config
         * @returns {pageController}
         * @fires pageController#init
         */
        init(config) {
            this.config = _(config || {})
                .omit(function (value) {
                    return value === null || typeof value === 'undefined';
                })
                .defaults(defaults || {})
                .value();

            // delegate the call to the `init` method provided by the api
            if (specs && _.isFunction(specs.init)) {
                specs.init.call(controllerApi);
            }

            this.setState('ready', true);

            /**
             * Executes extra init tasks
             * @event pageController#init
             */
            this.trigger('init');

            return this;
        },

        /**
         * Runs the controller
         * @returns {pageController}
         * @fires pageController#run
         */
        run() {
            // delegate the call to the `run` method provided by the api
            if (specs && _.isFunction(specs.run)) {
                specs.run.call(controllerApi);
            }

            this.setState('run', true);

            /**
             * Executes extra init tasks
             * @event pageController#run
             */
            this.trigger('run');

            return this;
        }
    };

    // let's extend the instance with extra methods
    if (specs) {
        _(specs).omit(_.keys(controllerApi)).functions().forEach(method => {
            controllerApi[method] = function() {
                return specs[method].apply(controllerApi, [].slice.call(arguments));
            };
        });
    }

    return eventifier(controllerApi);
}

export default pageController;