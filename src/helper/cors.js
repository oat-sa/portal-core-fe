/**
 * Copyright (c) 2018-2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * Manage some CORS values.
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */

import urlHelper from 'url';

export default {
    /**
     * Gets the proper credentials settings for the provided url.
     * @type {String}
     */
    credentialsForUrl(url) {
        const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reMainDomain = new RegExp(`[\w\.-_]${escapeRegExp(document.domain)}`);

        let credentials = 'omit';

        const parsedUrl = urlHelper.parse(url);
        if (parsedUrl.protocol === null && parsedUrl.hostname === null) {
            parsedUrl.hostname = document.domain;
        }

        // same domain, allows to send credentials
        if (document.domain === parsedUrl.hostname) {
            credentials = 'same-origin';
        }

        // sub domain, allows to send credentials
        else if (reMainDomain.test(parsedUrl.hostname)) {
            credentials = 'include';
        }

        return credentials;
    }
};
