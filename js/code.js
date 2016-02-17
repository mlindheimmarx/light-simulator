(function(angular, ace, $) {
    var module = angular.module('simulator.codeview', []);
    module.directive('codeView', function() { return { link: codeView }; });
    function codeView($scope, elem, attrs) {
        var editor = ace.edit(elem.context);
        editor.setTheme("ace/theme/github");
        editor.getSession().setMode("ace/mode/c_cpp");
        editor.setValue("void setup()\n{\n  \n}\n\nvoid loop()\n{\n  \n}\n");
        editor.gotoLine(3, 3);
        editor.getSession().setTabSize(2);

        $scope.saveCode = function() {
            var design = $scope.designs[$scope.design];
            design.programs = {};
            design.programs['main'] = editor.getValue();
        };

        $scope.$watch('designs[design].programs', function(val) {
            if ('main' in val) {
                editor.setValue(val['main']);
            }
        }, true);

        $scope.$watch('coding', function() {
            console.log('resizing editor');
            editor.resize();
            editor.renderer.updateFull();
        }, true);

        var worker;
        $scope.runCode = function() {
            var code = "#include <Arduino.h>\n" + editor.getValue();
            if (worker) {
                worker.terminate();
            }
            worker = new Worker("picoc.min.js");
            worker.onmessage = function(event) {
                if (event.data.type == "write") {
                    $scope.pins[event.data.pin] = event.data.brightness;
                    $scope.$digest();
                } else if (event.data.type == "msg") {
                    $("#console").append(event.data.msg);
                } else if (event.data.type == "error") {
                    editor.getSession().setAnnotations([{
                        row: event.data.line,
                        column: event.data.column,
                        text: "ERRAR",
                        type: "error"
                    }]);
                } else {
                    console.log("received other webworker event:");
                    console.log(event);
                }
            };
            worker.postMessage({code: code});
        };
    }
})(angular, ace, jQuery);
