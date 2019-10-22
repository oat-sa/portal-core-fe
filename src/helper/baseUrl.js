/**
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Expose a basic resolver for the base URL.
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */

const explicitEntryPoint = /\/([\w-_.]+\.php)[/?]/;

/**
 * Common base URL used to build routes
 * @type {String}
 */
export default function baseUrl(prefix = '') {
    prefix = prefix || '/';
    if (prefix.charAt(0) === '/') {
        const matches = explicitEntryPoint.exec(window.location.href);
        if (matches) {
            return `/${matches[1]}${prefix}`;
        }
    }
    return prefix;
}
