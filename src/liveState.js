(function () {
    var State = function () {
        var state = {};

        createElement = function (elementPath) {
            if (!state[elementPath]) {
                state[elementPath] = {
                    attrs: {},
                    handlers: {}
                };
            }
        };

        setElementValue = function (elementPath, value) {
            state[elementPath].value = value;
            callHandlerFunction(elementPath, 'change', true);
        };

        getElementValue = function (elementPath) {
            var result; 

            if (state[elementPath] && state[elementPath].value) {
                result = state[elementPath].value;
            }

            return result;
        };

        setElementAttribute = function (elementPath, attributeName, attributeValue) {
            state[elementPath].attrs[attributeName] = attributeValue;
            callHandlerFunction(elementPath, 'change', false, attributeName);
        };
        
        getElementAttribute = function (elementPath, attributeName) {
            var result;

            if (attributeName === '*') {
                result = state[elementPath].attrs;
            } else {
                result = state[elementPath].attrs[attributeName];
            }

            return result;
        };

        emptyState = function () {
            state = {};
        };

        addHandlerFunction = function (elementPath, eventName, handlerFunction) {
            state[elementPath].handlers[eventName] = handlerFunction;
        };

        callHandlerFunction = function (elementPath, eventName, valueChanged, changeAttributeName) {
            if (state[elementPath].handlers[eventName]) {
                state[elementPath].handlers[eventName].call(
                    this,
                    eventName,
                    elementPath,
                    getElementValue(elementPath),
                    getElementAttribute(elementPath, '*'),
                    valueChanged,
                    changeAttributeName
                );
            }
        };

        return {
            set: function (elementPath, value, attributeName) {
                createElement(elementPath);
 
                if(attributeName) {
                    setElementAttribute(elementPath, attributeName, value);
                } else {
                    setElementValue(elementPath, value);
                }
            },
            get: function (elementPath, attributeName) {
                var result;

                if (attributeName) {
                    result = getElementAttribute(elementPath, attributeName);
                } else {
                    result = getElementValue(elementPath);
                }
 
                return result;
            },
            getDOM: function () {},
            subscribe: function (elementPath, eventName, handlerFunction) {
                createElement(elementPath);
                addHandlerFunction(elementPath, eventName, handlerFunction);
            },
            reset: function () {
                emptyState();
            },
            bind: function () {}
        };
    };
    dio.di.register("State", State);
}());