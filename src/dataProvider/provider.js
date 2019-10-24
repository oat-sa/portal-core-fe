/**
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */


/**
 * Expose a basic data provider. It let's you fetch data from the server.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 *
 * @exports {Function} the dataProvider
 */

import baseUrl from 'portal/helper/baseUrl';
import corsHelper from 'portal/helper/cors';

const allowedMethods = ['GET', 'POST'];

/**
 * The data provider to call the platform REST API  endpoint.
 *
 * Supports only JSON requests and responses.
 *
 * @param {String} url - the endpoint URL
 * @param {String} method - GET or POST
 * @param {Object} bodyParams - to post JSON data in the body
 * @returns {Promise<Object>} resolves with the result of the fetch
 * @throws {TypeError} if some parameters are inconsistent
 */
function dataProvider(url = '', method = 'GET', bodyParams){
    const headers = {
        'Accept' : 'application/json'
    };
    let body;

    if(typeof url !== 'string' || url.length === 0){
        throw new TypeError('The URL parameter is required');
    }
    if(allowedMethods.indexOf(method) < 0){
        throw new TypeError(`Unsupported request method ${method}`);
    }

    if(typeof bodyParams === 'object'){
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(bodyParams);
    }

    const fullUrl = baseUrl(url);
    const credentials= corsHelper.credentialsForUrl(fullUrl);

    return fetch(fullUrl, {
        method,
        headers,
        body,
        credentials
    }).then( response => {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            const err = new Error(response.statusText);
            err.code = response.status;
            throw err;
        }
    }).then( response => response.json());
}

//expose readable property baseUrl to enable get a central point for baseUrl definition
Object.defineProperty(dataProvider, 'baseUrl', {get : () => baseUrl});

export default dataProvider;
