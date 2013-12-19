function ipPages($scope) {
    //languages
    $scope.activeLanguage = languageList[0];
    $scope.activeZone = zoneList[0];
    $scope.copyPageId = false;
    $scope.cutPageId = false;
    $scope.selectedPageId = null;
    $scope.languages = languageList;
    $scope.zones = zoneList;

    $scope.activateLanguage = function(language) {
        $scope.activeLanguage = language;
        initTree();
    }

    $scope.activateZone = function(zone) {
        $scope.activeZone = zone;
        initTree();

    }

    $scope.addPageModal = function() {
        var $modal = $('.ipsAddModal');
        $modal.modal();


        $modal.find('.ipsAdd').off('click').on('click', function(){$modal.find('form').submit()});
        $modal.find('form').off('submit').on('submit', function(e) {
            e.preventDefault();
            var title = $modal.find('input[name=title]').val();
            var visible = $modal.find('input[name=visible]').is(':checked') ? 1 : 0;
            addPage(title, visible);
            $modal.modal('hide');
        });
    }

    $scope.cutPage = function() {
        $scope.copyPageId = false;
        $scope.cutPageId = $scope.selectedPageId
    }

    $scope.copyPage = function () {
        $scope.cutPageId = false;
        $scope.copyPageId = $scope.selectedPageId;
    }

    $scope.pastePage = function () {
        var tree = getJsTree();
        var position = tree._get_children(-1).length; //last position
        var node = tree.get_selected();
        if (node.length) {
            var position = node.index() + 1;
        }
        if ($scope.cutPageId) {
            movePage($scope.cutPageId, $scope.activeLanguage.id, $scope.activeZone.name, $scope.selectedPageId, position, true);
        } else {
            copyPage($scope.selectedPageId, $scope.activeLanguage.id, $scope.activeZone.name, $scope.selectedPageId, position, true);
        }

    }

    var initTree = function () {console.log('init');
        $scope.selectedPageId = null;
        getTreeDiv().ipPageTree({languageId: $scope.activeLanguage.id, zoneName: $scope.activeZone.name});
        getTreeDiv().off('select_node.jstree').on('select_node.jstree', function(e) {
            console.log('select node');
            var node = getJsTree().get_selected();
            var $properties = $('.ipsProperties');
            $scope.selectedPageId = node.attr('pageId');
            $scope.$apply();

            $properties.ipPageProperties({
                pageId : node.attr('pageId'),
                zoneName : node.attr('zoneName')
            });
            $properties.on('update.ipPages', function() {
                getJsTree().set_text(getJsTree().get_selected() , $properties.find('input[name=navigationTitle]').val());
            });

        });
        getTreeDiv().off('move_node.jstree').on('move_node.jstree', function(e, moveData) {
            moveData.rslt.o.each(function(i) {
                var pageId = $(this).attr("pageId");
                var destinationPageId = moveData.rslt.np.attr("pageId");
                if (!destinationPageId) { //replace undefined with null;
                    destinationPageId = null;
                }
                var destinationPosition = moveData.rslt.cp + i;
                movePage(pageId, $scope.activeLanguage.id, $scope.activeZone.name, destinationPageId, destinationPosition);
            });
        });



    }

    var getTreeDiv = function () {
        return $('#pages_' + $scope.activeLanguage.id + '_' + $scope.activeZone.name).find('.ipsTree');
    }

    var getJsTree = function () {
        return jQuery.jstree._reference('#pages_' + $scope.activeLanguage.id + '_' + $scope.activeZone.name + ' .ipsTree');
    }

    var refresh = function () {
        var activeZone = $scope.activeZone;
//        $scope.languages = [];
//        $scope.zones = [];
//        $scope.activeZone = false;
//        $scope.$apply();


//        $scope.languages = languageList;
//        $scope.zones = zoneList;
//        $scope.$apply();
        $('.ipsTree').ipPageTree('destroy');
        console.log('destoryed');
        $scope.activateZone(activeZone);
        $scope.$apply();
    }


    var addPage = function (title, visible) {
        var data = {
            aa: 'Pages.addPage',
            securityToken: ip.securityToken,
            title: title,
            visible: visible,
            zoneName: $scope.activeZone.name,
            languageId: $scope.activeLanguage.id
        };

        $.ajax({
            type: 'POST',
            url: ip.baseUrl,
            data: data,
            context: this,
            success: function (response) {
                refresh();
            },
            error: function(response) {
                if (ip.developmentEnvironment || ip.debugMode) {
                    alert('Server response: ' + response.responseText);
                }
            },
            dataType: 'json'
        });

    }

    var deletePage = function (pageId) {
        var data = {
            aa: 'Pages.deletePage',
            securityToken: ip.securityToken
        };

        $.ajax({
            type: 'POST',
            url: ip.baseUrl,
            data: data,
            context: this,
            success: function (response) {
                refresh();
            },
            error: function(response) {
                if (ip.developmentEnvironment || ip.debugMode) {
                    alert('Server response: ' + response.responseText);
                }
            },
            dataType: 'json'
        });
    }


    var copyPage = function(pageId, destinationLanguageId, destinationZoneName, destinationParentId, destinationPosition, doRefresh) {
        var data = {
            aa: 'Pages.copyPage',
            destinationParentId: destinationParentId,
            destinationPosition: destinationPosition,
            languageId: destinationLanguageId,
            zoneName: destinationZoneName,
            securityToken: ip.securityToken
        };

        $.ajax({
            type: 'POST',
            url: ip.baseUrl,
            data: data,
            context: this,
            success: function (response) {
                if (doRefresh) {
                    refresh();
                }
            },
            error: function(response) {
                if (ip.developmentEnvironment || ip.debugMode) {
                    alert('Server response: ' + response.responseText);
                }
            },
            dataType: 'json'
        });
    }

    var movePage = function(pageId, destinationLanguageId, destinationZoneName, destinationParentId, destinationPosition, doRefresh) {
        var data = {
            aa: 'Pages.movePage',
            pageId: pageId,
            destinationPosition: destinationPosition,
            destinationParentId: destinationParentId,
            languageId: destinationLanguageId,
            zoneName: destinationZoneName,
            securityToken: ip.securityToken
        };

        $.ajax({
            type: 'POST',
            url: ip.baseUrl,
            data: data,
            context: this,
            success: function (response) {
                if (doRefresh) {
                    refresh();
                }
            },
            error: function(response) {
                if (ip.developmentEnvironment || ip.debugMode) {
                    alert('Server response: ' + response.responseText);
                }
            },
            dataType: 'json'
        });
    }



}



$( document ).ready(function() {
    $('.zoneList li:first a').click();
});