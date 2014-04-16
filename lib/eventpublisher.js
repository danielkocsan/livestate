/**
 * EventPublisher
 *
 * Responsibility: Handle publish / subscribe of events for different modules
 *
 * @author: igor_mucsicska
 */
(function () {
    var EventPublisher = function () {
        var eventHandlers = {};

        function publishEvents(moduleName, eventName, data) {
            var listeners,
                i,
                len,
                promises = [],
                deferred,
                handler = function (i, moduleName, eventName, deferred, data) {
                    return function () {
                        listeners[i](
                            {
                                moduleName: moduleName,
                                eventName: eventName,
                                deferred: deferred,
                                data: data
                            }
                        );
                    };
                };

            if (eventHandlers[eventName] !== undefined && eventHandlers[eventName][moduleName] !== undefined && eventHandlers[eventName][moduleName].callbacks instanceof Array) {
                listeners = eventHandlers[eventName][moduleName].callbacks;
                for (i = 0, len = listeners.length; i < len; i += 1) {
                    if (typeof listeners[i] === "function") {
                        deferred = $.Deferred();
                        promises.push(deferred.promise());
                        setTimeout(handler(i, moduleName, eventName, deferred, data), 0);
                    }
                }
            }

            return promises;
        }

        function publish(eventName, moduleName, data) {
            var promises = [];
            promises = promises.concat(publishEvents(moduleName, eventName, data));
            promises = promises.concat(publishEvents(null, eventName, data));
            promises = promises.concat(publishEvents(moduleName, null, data));

            return $.when.apply(this, promises);
        }

        function subscribe(eventName, moduleName, callback) {
            if (!eventHandlers[eventName]) {
                eventHandlers[eventName] = {};
            }

            if (!eventHandlers[eventName][moduleName]) {
                eventHandlers[eventName][moduleName] = {
                    callbacks: []
                };
            }

            eventHandlers[eventName][moduleName].callbacks.push(callback);
        }

        function unsubscribeAll(eventName, moduleName) {
            if (eventHandlers[eventName] !== undefined && eventHandlers[eventName][moduleName]) {
                eventHandlers[eventName][moduleName] = undefined;
            }
        }

        function unsubscribe(eventName, moduleName, callback) {
            var index,
                listeners;
            if (eventHandlers[eventName] !== undefined && eventHandlers[eventName][moduleName] && eventHandlers[eventName][moduleName].callbacks instanceof Array) {
                listeners = eventHandlers[eventName][moduleName].callbacks;
                index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }

        function reset() {
            eventHandlers = {};
        }

        return {
            /**
             * Publishes event from given module and passes the data object to the event handler as parameter object on .data path
             * @param {string} eventName events name
             * @param {string} moduleName module name
             * @param {object} data data object passed to event handlers on .data path
             * @returns {object} jQuery promise
             *
             */
            publish: publish,
            /**
             * Subscribes on a given module given event with a callback function.
             * Module name is null means it will subscribe to all module's events
             * Event name is null means it will subscribe to all events of a module
             *
             * @param {string} eventName events name
             * @param {string} moduleName modules name
             * @param {function} callback event handler function. As parameter it will get an object containing: triggering module name, event name, data, jQuery deferred
             *
             */
            subscribe: subscribe,
            /**
             * Unsubscribes from a given module given event all event handlers
             * @param {string} eventName event name
             * @param {string} moduleName module name
             *
             */
            unsubscribeAll: unsubscribeAll,
            /**
             * Unsubscribes from a given module given event given event handler
             * @param {string} eventName event name
             * @param {string} moduleName module name
             * @param {function} callback event handler
             */
            unsubscribe: unsubscribe,
            /**
             * Resets own state to initial. Forgets every registered subscriptions. Useful for testing.
             *
             */
            reset: reset
        };
    };
    dio.di.register("EventPublisher", EventPublisher);
}());

