var simulator = angular.module("simulator", ["angularLocalStorage",
                                             "simulator.lsview", "simulator.codeview"]);

simulator.controller('SimCtrl', ['$scope', '$rootScope', 'storage', SimCtrl]);
function SimCtrl($scope, $rootScope, storage) {
    $scope.renderPoles = true;
    storage.bind($scope, 'designs', {defaultValue: {}});
    startWatch($scope);
    $scope.pins = {};

    $scope.export = function() {
        var design = $scope.designs[$scope.design];
        saveAs(new Blob([JSON.stringify(design)]), design.name + ".ls");
    };

    // of course this isn't hacky
    document.getElementById("import").addEventListener('change', function(evt) {
        var file = evt.target.files[0];
        if (file.name.slice(-3) !== ".ls") {
            return;
        }

        var reader = new FileReader();
        reader.onloadend = function() {
            $scope.$apply(function() {
                var value = JSON.parse(reader.result);
                $scope.designs[value.name] = value;
                $scope.design = value.name;
            });
        };
        reader.readAsText(file);
    }, false);
}

function startWatch($scope) {
    $scope.removeDesign = function(design) {
        delete $scope.designs[design];
        if (len($scope.designs) == 0) {
            $scope.newDesign();
        } else {
            $scope.design = getFirstKey($scope.designs);
        }
    };
    $scope.newDesign = function() {
        $scope.designs["New Design"] = {name: "New Design", programs: {}, poles:
                                        [{rods: [{r: 0, theta: 0, height: 3, color: 'R'}], pos: [-2, -2]}]};
        $scope.design = "New Design";
    };
    $scope.setDesign = function(name) {
        if (typeof name !== 'undefined') {
            $scope.design = name;
        } else {
            if (len($scope.designs) == 0) {
                $scope.newDesign();
            } else {
                $scope.design = getFirstKey($scope.designs);
            }
        }
    };
    $scope.addPole = function() {
        var design = $scope.designs[$scope.design];
        design.poles.push({rods: [{r: 0, theta: 0, height: 3, color: 'R'}], pos: [-2, -2]});
    };
    $scope.deletePole = function(pole) {
        var poles = $scope.designs[$scope.design].poles;
        poles.splice(poles.indexOf(pole), 1);
    };
    $scope.addRod = function(pole) {
        pole.rods.push({r: 0, theta: 0, height: 3, color: 'R'});
    };
    $scope.deleteRod = function(pole, rod) {
        var poles = $scope.designs[$scope.design].poles,
            pole = poles[poles.indexOf(pole)];
        pole.rods.splice(pole.rods.indexOf(rod), 1);
    };
    $scope.setDesign();
    $scope.$watch("designs[design].name", function(n) {
        if (typeof n !== 'undefined' && $scope.design !== n) {
            $scope.designs[n] = $scope.designs[$scope.design];
            delete $scope.designs[$scope.design];
            $scope.design = n;
        }
    });
}

simulator.directive('parseFloat', function() { return { require: 'ngModel', link: parseFloatDir }; });
function parseFloatDir($scope, elem, attrs, modelCtrl) {
    var parseFloatOrZero = function(val) {
        var parsed = parseFloat(val);
        if (isNaN(parsed)) {
            return 0.0;
        } else {
            return parsed;
        }
    };
    modelCtrl.$parsers.push(parseFloatOrZero);
}

function len(o) {
    var count = 0;
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            count++;
        }
    }
    return count;
}

function getFirstKey(o) {
    for (var k in o) {
        if (o.hasOwnProperty(k) && k.charAt(0) != '$') {
            return k;
        }
    }
    return null;
}
