/**
 * Copyright (c) 2018 Open Assessment Technologies SA;
 */

/**
 * UI Component to show feedbacks to the user
 *
 * @example
 * import { info, warning, danger } from 'portal/core/feedback'
 *
 * //display an info with an overlay, that close after 10s
 * info( 'Please wait while we configure something', { overlay : true, timeout: 10000 });
 *
 * //display a warning to the user, it contains some HTML
 * warning( 'Be careful, the value of <i>the field</i> is dangerous');
 *
 * //show a structured and permanent error message
 * danger({ title : 'An unexpected error occurred', content : 'Please contact your site administrator'}, {timeout: -1 });
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */

import _ from 'lodash';
import component from 'portal/core/component/component';

import feedbackTpl from './feedback.tpl';
import feedbackContainerTpl from './feedback-container.tpl';

import './feedback.scss';

//keep a reference to  alive feedback, one at a time
var  previous = [];

//the default configuration
const defaultOptions = {
    timeout: {
        info:    3000,
        success: 3000,
        warning: 6000,
        danger:  10000
    },
    overlay : false,
    containerSelector : '#feedbacks',
    overlaySelector : '#overlay'
};

/**
 * Creates a feedback object.
 *
 * @exports ui/feedback
 * @param {jQUeryElement} [$container] - only to specify another container
 * @param {Object} [config] - change the config
 * @param {Object|Number} [config.timeout] - either one for every level or per level timeout in ms
 * @param {Boolean} [config.overlay = false] - show an overlay between the feedback and the app
 * @returns {feedback} the feedback object
 */
const feedbackFactory = function feedbackFactory( config = {} ){

    /**
     * @typedef {Object} feedback - the feedback component
     */
    const feedback = component({

        /**
         * Get the supported levels
         * @returns {String[]} the levels
         */
        getLevels(){
            return [
                'info',
                'success',
                'warning',
                'danger'
            ];
        },

        /**
         * Opens the message (and close previous one)
         * @returns {feedback} chains
         * @fires feedback#open
         */
        open(){

            const timeout = _.isPlainObject(this.config.timeout) ? this.config.timeout[this.config.level] : this.config.timeout;

            if( this.is('rendered') && ! this.is('open') ){
                if(this.config.overlay && this.config.overlayElt){
                    this.config.overlayElt.classList.remove('hidden');
                }

                if(_.isNumber(timeout) && timeout > 0){
                    _.delay(() => this.close(), timeout);
                }

                this.setState('open', true);

                /**
                 * @event feedback#open
                 */
                this.trigger('open');
            }
            return this;
        },

        /**
         * Closes the message
         * @returns {feedback} chains
         * @fires feedback#close
         */
        close(){
            if(this.is('rendered') && this.is('open')){

                this.setState('open', false);

                if(this.config.overlay && this.config.overlayElt){
                    this.config.overlayElt.classList.add('hidden');
                }

                /**
                 * @event feedback#close
                 */
                this.trigger('close');
            }
            return this;
        },
    }, defaultOptions);

    feedback.setTemplate(feedbackTpl)
        .on('init', function(){

            this.config.container = document.querySelector(this.config.containerSelector);
            if(!this.config.container){
                document.body.insertAdjacentHTML('beforeend', feedbackContainerTpl());
            }
            this.config.container  = document.querySelector(this.config.containerSelector);
            this.config.overlayElt = document.querySelector(this.config.overlaySelector);

            if( !(this.config.container instanceof HTMLElement) ){
                return this.trigger('error', new Error(`Unable to find the feedback container ${this.config.containerSelector}`));
            }

            this.config.id = 'feedback-' + Date.now();

            if(!this.config.level || !_.includes(this.getLevels(), this.config.level)){
                this.config.level = 'info';
            }

            previous.push(this);

            this.render(this.config.container);
        })
        .on('render', function(){
            const element = this.getElement()[0];

            const closer  = element.querySelector('.close');
            if(closer){
                closer.addEventListener('click', e => {
                    e.preventDefault();
                    this.close();
                });
            }
        });

    _.defer( () => feedback.init(config) );

    return feedback;
};

/**
 * Display a message within an feedback box
 * @param {String} level - the message level
 * @param {String|Object} msg - the message to display
 * @param {String} [msg.title] - An optional message title
 * @param {String} [msg.content] - The message body along with the title
 * @param {Object} [config] - to configure the message
 * @param {Boolean} [config.overlay = false] - to display the overlay
 * @param {Number} [config.timeout] - to change the message timeout (-1 to make it permanent)
 * @returns {feedback} the feedback component
 */
export function message(level = 'info', msg = '', config = { }) {
    const feedbackConfig =   Object.assign(config, { level });
    if(_.isPlainObject(msg)){
        feedbackConfig.title = msg.title;
        feedbackConfig.msg = msg.content;
    }
    if(_.isString(msg)){
        feedbackConfig.msg = msg;
    }
    if(previous && previous.length){
        previous.forEach( previousFeedback => {
            if(previousFeedback.is('open')){
                previousFeedback
                    .on('close', () => previousFeedback.destroy())
                    .close();
            } else {
                previousFeedback.destroy();
            }
        });
    }
    return feedbackFactory(feedbackConfig)
        .on('render', function(){
            _.defer( () => this.open());
        })
        .on('error', err => {

            /* eslint no-console: off */
            //since feedback is part of the error handling we log internal error
            console.error(err);
        });
}

/**
 * Shortcut function to display an informative message
 * @see message
 */
export function info(msg, config) {
    return message('info', msg, config);
}

/**
 * Shortcut function to display a success message
 * @see message
 */
export function success(msg, config) {
    return message('success', msg, config);
}

/**
 * Shortcut function to display a warning message
 * @see message
 */
export function warning(msg, config) {
    return message('warning', msg, config);
}

/**
 * Shortcut function to display a danger message
 * @see message
 */
export function danger(msg, config) {
    return message('danger', msg, config);
}

/**
 * Shortcut function to display an error message
 * @see message
 */
export function error (msg, config) {
    return danger(msg, config);
}
