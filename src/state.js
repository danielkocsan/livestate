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

    function handleChange(property, value, eventHandler) {
        if (!state[property] || !state[property].domCollection || !(eventHandler instanceof Function)) {
            return;
        }
        if (!(state[property].changeHandlers[value] instanceof Array)) {
            state[property].changeHandlers[value] = [];
        }

        state[property].changeHandlers[value].push(eventHandler);
    }

    return {
        bind: function (property, domCollection) {
            setupProperty(property, domCollection);
            domCollection.on('change', function () {
                state[property].value = this.value;
                callChangeHandlers(property, this.value);
                callChangeHandlers(property, null);
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

        onChange: function (property, eventHandler) {
            handleChange(property, null, eventHandler);
        },

        onChangeTo: function (property, value, eventHandler) {
            handleChange(property, value, eventHandler);
        }
    };
}());