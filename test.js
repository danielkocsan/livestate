$( document ).ready(function() {
    state.bind('testValue',$('input'),['focusout']);
    state.bind('testValue',$('.output'));
});