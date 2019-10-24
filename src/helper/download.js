/**
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */

import _ from 'lodash';

const defaultWatchConfig = {
    param: 'ts',
    event: 'downloadStart',
    pattern: '[\\d]+',
    cookieName: 'fileDownload',
    interval: 1000,
    timeout: 20000
};

/**
 * Helper that allows to watch a file download
 * @type {Object}
 */
const downloadHelper = {
    /**
     * Watches for a cookie to be set with a particular token
     * @param {String|Number} token - The token value to search in cookies
     * @param {Object}config - Allows to setup the watcher
     * @param {String} [config.pattern='[\\d]+'] - The pattern that should match the token value
     * @param {String} [config.cookieName='fileDownload'] - The name of the cookie to watch
     * @param {Number} [config.interval=1000] - The watch interval
     * @param {Number} [config.timeout=20000] - The delay before failing the promise
     * @returns {Promise<any>}
     */
    watch(token, config = {}) {
        config = _.defaults({}, config, defaultWatchConfig);
        token = `${token}`;

        return new Promise((resolve, reject) => {
            let watchHandle, failureHandle;
            const reCookie = new RegExp(`${config.cookieName}=${token}`);

            const matchCookie = () => {
                return reCookie.test(document.cookie || '');
            };

            const clearCookie = () => {
                document.cookie = `${config.cookieName}=${token}; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            };

            failureHandle = window.setTimeout(() => {
                window.clearInterval(watchHandle);
                clearCookie();
                reject();
            }, config.timeout);

            watchHandle = window.setInterval(() => {
                if (matchCookie()) {
                    window.clearInterval(watchHandle);
                    window.clearTimeout(failureHandle);
                    clearCookie();
                    resolve();
                }
            }, config.interval);
        });
    },

    /**
     * Manages a link responsible of a file download
     *
     * @param {jQuery} $link
     * @param {Object}config - Allows to setup the watcher
     * @param {String} [config.param='ts'] - The name of the param in the query that contains the token value
     * @param {String} [config.event='downloadStart'] - The name of the event triggered once the download is started
     * @param {String} [config.pattern='[\\d]+'] - The pattern that should match the token value
     * @param {String} [config.cookieName='fileDownload'] - The name of the cookie to watch
     * @param {Number} [config.interval=1000] - The watch interval
     * @param {Number} [config.timeout=20000] - The delay before failing the promise
     * @returns {Promise}
     */
    manageLink($link, config = {}) {
        config = _.defaults({}, config, defaultWatchConfig);

        const [route, query] = ($link.attr('href') || '').split('?');
        const reParam = new RegExp(`${config.param}=(${config.pattern})`);
        const token = ((query || '').match(reParam) || []).pop();

        return downloadHelper.watch(token, config)
            .then(() => {
                $link.attr('href', `${route}?${config.param}=${Date.now()}`).trigger(config.event);
            });
    }
};

export default downloadHelper;