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
 * Copyright (c) 2017-2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * Loads modules
 *
 * It provides 2 distinct way of loading modules :
 *  1. The "required" modules that are necessary. Should be already loaded.
 *  2. The "dynamic" modules that are loaded on demand, they are provided as AMD modules. The module is loaded using the load method.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
import _ from 'lodash';
import Promise from 'core/promise';

/**
 * The data required by the modules loader
 *
 * @typedef {Object} moduleDefinition
 * @property {String} module - AMD module name
 * @property {String} bundle - AMD module name of the bundle that should contain the module
 * @property {String} category - the module category
 * @property {String} name - the module name
 * @property {String|Number} [position = 'append'] - append, prepend or arbitrary position within the category
 */

/**
 * Creates a loader with the list of required modules
 * @param {Object} requiredModules - A collection of mandatory modules, where the key is the category and the value are an array of loaded modules
 * @param {Function} [validate] - A validator function, by default the module should be an object
 * @param {Object} [specs] - Some extra methods to assign to the loader instance
 * @returns {loader} the provider loader
 * @throws TypeError if something is not well formatted
 */
export default function moduleLoaderFactory(requiredModules, validate, specs) {
    /**
     * The list of loaded modules
     */
    var loaded = {};

    /**
     * Retains the AMD modules to load
     */
    var modules = {};

    /**
     * The modules to exclude
     */
    var excludes = [];

    /**
     * Bundles to require
     */
    var bundles = [];

    /**
     * The module loader
     * @typedef {loader}
     */
    var loader = {
        /**
         * Adds a list of dynamic modules to load
         * @param {moduleDefinition[]} moduleList - the modules to add
         * @returns {loader} chains
         * @throws {TypeError} misuse
         */
        addList: function addList(moduleList) {
            _.forEach(moduleList, this.add, this);
            return this;
        },

        /**
         * Adds a dynamic module to load
         * @param {moduleDefinition} def - the module to add
         * @returns {loader} chains
         * @throws {TypeError} misuse
         */
        add(def) {
            if (!_.isPlainObject(def)) {
                throw new TypeError('The module definition module must be an object');
            }
            if (_.isEmpty(def.module) || !_.isString(def.module)) {
                throw new TypeError('An AMD module must be defined');
            }
            if (_.isEmpty(def.category) || !_.isString(def.category)) {
                const identifyProvider = def.id || def.name || def.module;
                throw new TypeError(`The provider '${identifyProvider}' must belong to a category`);
            }

            modules[def.category] = modules[def.category] || [];

            if (_.isNumber(def.position)) {
                modules[def.category][def.position] = def.module;
            } else if (def.position === 'prepend' || def.position === 'before') {
                modules[def.category].unshift(def.module);
            } else {
                modules[def.category].push(def.module);
            }

            if (def.bundle && !_.includes(bundles, def.bundle)) {
                bundles.push(def.bundle);
            }
            return this;
        },

        /**
         * Appends a dynamic module
         * @param {moduleDefinition} def - the module to add
         * @returns {loader} chains
         * @throws {TypeError} misuse
         */
        append: function append(def) {
            return this.add(_.merge({ position: 'append' }, def));
        },

        /**
         * Prepends a dynamic module to a category
         * @param {moduleDefinition} def - the module to add
         * @returns {loader} chains
         * @throws {TypeError} misuse
         */
        prepend: function prepend(def) {
            return this.add(_.merge({ position: 'prepend' }, def));
        },

        /**
         * Removes a module from the loading stack
         * @param {String} module - the module's module
         * @returns {loader} chains
         * @throws {TypeError} misuse
         */
        remove: function remove(module) {
            excludes.push(module);
            return this;
        },

        /**
         * Loads the dynamic modules : trigger the dependency resolution
         * @param {Boolean} [loadBundles=false] - does load the bundles
         * @returns {Promise}
         */
        load(loadBundles) {
            var self = this;

            //compute the providers dependencies
            var dependencies = _(modules)
                .values()
                .flatten()
                .uniq()
                .difference(excludes)
                .value();

            /**
             * Loads AMD modules and wrap then into a Promise
             * @param {String[]} amdModules - the list of modules to require
             * @returns {Promise} resolves with the loaded modules
             */
            var loadModules = function loadModules(amdModules = []) {
                if (_.isArray(amdModules) && amdModules.length) {
                    if (typeof define === 'function' && define.amd) {
                        return new Promise((resolve, reject) => {
                            window.require(
                                amdModules,
                                (...loadedModules) => resolve(loadedModules),
                                err => {
                                    reject(err);
                                }
                            );
                        });
                    } else {
                        return Promise
                            .all( amdModules.map( module => (
                                //eslint-disable
                                import( `${module}`)
                                //eslint-enable
                            )))
                            .then( loadedModules => Promise.resolve(...loadModules) );
                    }
                }
                return Promise.resolve();
            };

            // 1. load bundles
            // 2. load dependencies
            // 3. add them to the modules list
            return loadModules(loadBundles ? bundles : [])
                .then( () => loadModules(dependencies) )
                .then( loadedModules => {
                    _.forEach(dependencies, (dependency, index) => {

                        const module = loadedModules[index];
                        const category = _.findKey(modules, val => _.includes(val, dependency));

                        if (typeof validate === 'function' && !validate(module)) {
                            throw new TypeError(`The module '${dependency}' is not valid`);
                        }

                        if (_.isString(category)) {
                            loaded[category] = loaded[category] || [];
                            loaded[category].push(module);
                        }
                    });
                    return self.getModules();
                });
        },

        /**
         * Get the resolved list of modules.
         * Load needs to be called before to have the dynamic modules.
         * @param {String} [category] - to get the modules for a given category, if not set, we get everything
         * @returns {Object[]} the modules
         */
        getModules: function getModules(category) {
            if (_.isString(category)) {
                return loaded[category] || [];
            }

            return _(loaded)
                .values()
                .flatten()
                .uniq()
                .value();
        },

        /**
         * Get the module categories
         * @returns {String[]} the categories
         */
        getCategories: function getCategories() {
            return _.keys(loaded);
        }
    };

    validate = _.isFunction(validate) ? validate : _.isPlainObject;

    //verify and add the required modules
    _.forEach(requiredModules, function(moduleList, category) {
        if (_.isEmpty(category) || !_.isString(category)) {
            throw new TypeError('Modules must belong to a category');
        }

        if (!_.isArray(moduleList)) {
            throw new TypeError('A list of modules must be an array');
        }

        if (!_.every(moduleList, validate)) {
            throw new TypeError('The list does not contain valid modules');
        }

        if (loaded[category]) {
            loaded[category] = loaded[category].concat(moduleList);
        } else {
            loaded[category] = moduleList;
        }
    });

    // let's extend the instance with extra methods
    if (specs) {
        _(specs)
            .functions()
            .forEach(function(method) {
                loader[method] = function delegate() {
                    return specs[method].apply(loader, [].slice.call(arguments));
                };
            });
    }

    return loader;
}
