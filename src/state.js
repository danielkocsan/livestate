var state = (function () {
    'use strict';

    var state = {};

    function setupProperty(property, domCollection) {
        state[property] = {};
        state[property].value = domCollection.val();
        state[property].domCollection = domCollection;
        state[property].changeHandlers = {};
    }

    function callChangeHandlers(property, value) {
        if (state[property].changeHandlers[value] instanceof Array) {
            state[property].changeHandlers[value].forEach(function (changeHandler) {
                changeHandler();
            });
        }
    }

    return {
        bind: function (property, domCollection, domEvents) {
            var events = domEvents;
            setupProperty(property, domCollection);
            if (!(events instanceof Array)) {
                events = ['change'];
            }
            events.forEach(function (event) {
                domCollection.on(event, function () {
                    state[property].value = this.value;
                    callChangeHandlers(property, this.value);
                    callChangeHandlers(property, null);
                });
            });
        },
        get: function (property) {
            if (!state[property]) {
                return undefined;
            }

            return state[property].value;
        },

        set: function (property, value) {
            if (!state[property]) {
                return false;
            }
            state[property].value = value;
            state[property].domCollection.val(value);
            callChangeHandlers(property, value);
            callChangeHandlers(property, null);
        },

        reset: function () {
            state = {};
        },

        subscribe: function (property, eventHandler, val) {
            var value = val;
            if (!state[property] || !state[property].domCollection || !(eventHandler instanceof Function)) {
                return;
            }
            if (!value) {
                value = null;
            }

            if (!(state[property].changeHandlers[value] instanceof Array)) {
                state[property].changeHandlers[value] = [];
            }

            state[property].changeHandlers[value].push(eventHandler);
        }
    };
}());