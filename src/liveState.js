(function () {
    var State = function () {
        var state = {};

        createElement = function (elementPath) {
            state[elementPath] = {
                attrs: {}
            };
        };

        setElementValue = function (elementPath, value) {
            state[elementPath].value = value;
        };

        getElementValue = function (elementPath) {
            return state[elementPath].value;
        };

        return {
            set: function (elementPath, value) {
                createElement(elementPath);
                setElementValue(elementPath, value);
            },
            get: function (elementPath) {
                return getElementValue(elementPath);
            },
            getDOM: function () {},
            subscribe: function () {},
            reset: function () {},
            bind: function () {}
        };
    };
    dio.di.register("State", State);
}());