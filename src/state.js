var state = (function () {
    'use strict';

    var state = {},
        setupProperty;

    setupProperty = function (property, domCollection) {
        state[property] = {};
        state[property].value = domCollection.val();
        state[property].domCollection = domCollection;
    };

    return {
        bind: function (property, domCollection) {
            setupProperty(property, domCollection);
            domCollection.on('change', function () {
                state[property].value = this.value;
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
        },

        reset: function () {
            state = {};
        }
    };
}());