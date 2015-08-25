﻿/* entities.module.js */

/**
* @desc this module manages the application home desktop screen
*/

(function () {
	'use strict';

	angular
        .module('webvellaAreas') //only gets the module, already initialized in the base.module of the plugin. The lack of dependency [] makes the difference.
        .config(config)
        .controller('WebVellaAreasRecordViewController', controller)
	    .controller('ManageRelationFieldModalController', ManageRelationFieldModalController);

	// Configuration ///////////////////////////////////
	config.$inject = ['$stateProvider'];

	/* @ngInject */
	function config($stateProvider) {
		$stateProvider.state('webvella-areas-record-view', {
			parent: 'webvella-areas-base',
			url: '/:areaName/:entityName/:recordId/view/:viewName/section/:sectionName/:filter/:page',
			views: {
				"topnavView": {
					controller: 'WebVellaAreasTopnavController',
					templateUrl: '/plugins/webvella-areas/topnav.view.html',
					controllerAs: 'topnavData'
				},
				"sidebarView": {
					controller: 'WebVellaAreasRecordViewSidebarController',
					templateUrl: '/plugins/webvella-areas/view-record-sidebar.view.html',
					controllerAs: 'sidebarData'
				},
				"contentView": {
					controller: 'WebVellaAreasRecordViewController',
					templateUrl: '/plugins/webvella-areas/record-view.view.html',
					controllerAs: 'contentData'
				}
			},
			resolve: {
				resolvedCurrentView: resolveCurrentView,
				resolvedCurrentEntityMeta: resolveCurrentEntityMeta
			},
			data: {

			}
		});
	};


	// Run //////////////////////////////////////
	run.$inject = ['$log'];

	/* @ngInject */
	function run($log) {
		$log.debug('webvellaAreas>entities> BEGIN module.run');

		$log.debug('webvellaAreas>entities> END module.run');
	};


	//#region << Resolve Function >>
	resolveCurrentView.$inject = ['$q', '$log', 'webvellaAreasService', '$stateParams', '$state', '$timeout'];
	/* @ngInject */
	function resolveCurrentView($q, $log, webvellaAreasService, $stateParams, $state, $timeout) {
		$log.debug('webvellaAdmin>entity-views>resolveCurrentView BEGIN state.resolved');
		// Initialize
		var defer = $q.defer();

		// Process
		function successCallback(response) {
			if (response.object == null) {
				$timeout(function () {
					$state.go("webvella-root-not-found");
				}, 0);
			}
			else {
					defer.resolve(response.object);
			}
		}

		function errorCallback(response) {
			if (response.object == null) {
				$timeout(function () {
					$state.go("webvella-root-not-found");
				}, 0);
			}
			else {
				defer.resolve(response.object);
			}
		}

		webvellaAreasService.getViewRecord($stateParams.recordId, $stateParams.viewName, $stateParams.entityName, successCallback, errorCallback);

		// Return
		$log.debug('webvellaAdmin>entity-views>resolveCurrentView END state.resolved');
		return defer.promise;
	}


	// Resolve Function /////////////////////////
	resolveCurrentEntityMeta.$inject = ['$q', '$log', 'webvellaAdminService', '$stateParams', '$state', '$timeout'];
	/* @ngInject */
	function resolveCurrentEntityMeta($q, $log, webvellaAdminService, $stateParams, $state, $timeout) {
		$log.debug('webvellaAdmin>entity-details> BEGIN state.resolved');
		// Initialize
		var defer = $q.defer();

		// Process
		function successCallback(response) {
			if (response.object == null) {
				$timeout(function () {
					$state.go("webvella-root-not-found");
				}, 0);
			}
			else {
				defer.resolve(response.object);
			}
		}

		function errorCallback(response) {
			if (response.object == null) {
				$timeout(function () {
					$state.go("webvella-root-not-found");
				}, 0);
			}
			else {
				defer.resolve(response.object);
			}
		}

		webvellaAdminService.getEntityMeta($stateParams.entityName, successCallback, errorCallback);

		// Return
		$log.debug('webvellaAdmin>entity-details> END state.resolved');
		return defer.promise;
	}

	//#endregion


	// Controller ///////////////////////////////
	controller.$inject = ['$filter', '$modal', '$log', '$q','$rootScope', '$state', '$stateParams', '$scope', 'pageTitle', 'webvellaRootService', 'webvellaAdminService',
        'resolvedSitemap', '$timeout', 'resolvedCurrentView', 'ngToast', 'wvAppConstants', 'resolvedCurrentEntityMeta'];

	/* @ngInject */
	function controller($filter,$modal, $log,$q, $rootScope, $state,$stateParams, $scope, pageTitle, webvellaRootService, webvellaAdminService,
        resolvedSitemap, $timeout, resolvedCurrentView, ngToast, wvAppConstants, resolvedCurrentEntityMeta) {
		$log.debug('webvellaAreas>entities> BEGIN controller.exec');
		/* jshint validthis:true */
		var contentData = this;
		contentData.isView = false;
		contentData.isList = false;
		contentData.stateParams = $stateParams;
		//#region <<Set pageTitle>>
		contentData.pageTitle = "Area Entities | " + pageTitle;
		webvellaRootService.setPageTitle(contentData.pageTitle);
		contentData.siteMap = angular.copy(resolvedSitemap);
		contentData.currentArea = null;
		for (var i = 0; i < contentData.siteMap.data.length; i++) {
			if (contentData.siteMap.data[i].name == $state.params.areaName) {
				contentData.currentArea = contentData.siteMap.data[i];
			};
		}
		webvellaRootService.setBodyColorClass(contentData.currentArea.color);
		//#endregion

		//#region << Initialize view and regions>>
		contentData.recordView = angular.copy(resolvedCurrentView.meta);
		contentData.contentRegion = null;
		contentData.sidebarRegion = contentData.recordView.sidebar;
		for (var i = 0; i < contentData.recordView.regions.length; i++) {
			if (contentData.recordView.regions[i].name === "content") {
				contentData.contentRegion = contentData.recordView.regions[i];
			}
		}
		contentData.viewData = angular.copy(resolvedCurrentView.data[0]);
		//#endregion

		//#region << Intialize current entity >>
		contentData.currentEntity = angular.copy(resolvedCurrentEntityMeta);

		//#endregion

	    //#region << View Seciton >>
		contentData.viewSection = {};
	    //<< Initialize section label >>
		contentData.viewSection.label = "General";
		for (var i = 0; i < contentData.recordView.sidebar.items.length; i++) {
		    if ($stateParams.sectionName == contentData.recordView.sidebar.items[i].meta.name) {
		        contentData.viewSection.label = contentData.recordView.sidebar.items[i].meta.label;
		    }
		}


		if ($stateParams.sectionName == "$") {
		    //The default view is active
		    contentData.isView = true;
		}
		else {
		    //One of the sidebar view or lists is active
		}

	    //#endregion

		//#region << Logic >>

		contentData.toggleSectionCollapse = function (section) {
			section.collapsed = !section.collapsed;
		}

		contentData.htmlFieldUpdate = function (item) {
			contentData.fieldUpdate(item, contentData.viewData[item.dataName]);
		}

		contentData.fieldUpdate = function (item, data) {
		    var defer = $q.defer();
			contentData.patchObject = {};
			var validation = {
				success: true,
				message: "successful validation"
			};
			if (data != null) {
				data = data.toString().trim();
				switch (item.meta.fieldType) {

					//Auto increment number
					case 1:
						//Readonly
						break;
						//Checkbox
					case 2:
						data = (data === "true"); // convert string to boolean
						break;
						//Auto increment number
					case 3: //Currency
						if (!data && item.meta.required) {
							return "This is a required field";
						}
						validation = checkDecimal(data);
						if (!validation.success) {
							return validation.message;
						}
						if (decimalPlaces(data) > item.meta.currency.decimalDigits) {
							return "Decimal places should be " + item.meta.currency.decimalDigits + " or less";
						}
						break;
					case 4: //Date
						if (!data && item.meta.required) {
							return "This is a required field";
						}
						data = moment(data).toISOString();
						break;
					case 5: //Datetime
						if (!data && item.meta.required) {
							return "This is a required field";
						}
						data = moment(data).toISOString();
						break;
					case 6: //Email
						if (!data && item.meta.required) {
							return "This is a required field";
						}
						validation = checkEmail(data);
						if (!validation.success) {
							return validation.message;
						}
						break;
					case 11: // Multiselect
						if (!data && item.meta.required) {
							return "This is a required field";
						}
						//We need to convert data which is "2,3" comma separated string to string array
						if (data !== '[object Array]') {
							data = data.split(',');
						}
						break;
					//Number
					case 12:
						if (!data && item.meta.required) {
							return "This is a required field";
						}
						validation = checkDecimal(data);
						if (!validation.success) {
							return validation.message;
						}
						if (!data) {
							data = null;
						}
						break;
					//Percent
					case 14:
						if (!data && item.meta.required) {
							return "This is a required field";
						}
						validation = checkPercent(data);
						if (!validation.success) {
							return validation.message;
						}
						if (!data) {
							data = null;
						}
						break;
					case 15: //Phone
						if (!data && item.meta.required) {
							return "This is a required field";
						}
						validation = checkPhone(data);
						if (!validation.success) {
							return validation.message;
						}
						break;
					case 17: // Dropdown
						if (!data && item.meta.required) {
							return "This is a required field";
						}
						break;
				}
			}
			contentData.patchObject[item.meta.name] = data;

			function patchSuccessCallback(response) {
			    ngToast.create({
			        className: 'success',
			        content: '<span class="go-green">Success:</span> ' + response.message
			    });
			    contentData.viewData = angular.copy(response.object.data[0]);
			    defer.resolve();
			}
			function patchFailedCallback(response) {
			    ngToast.create({
			        className: 'error',
			        content: '<span class="go-red">Error:</span> ' + response.message
			    });
			    defer.resolve("validation error");
			}

			webvellaAdminService.patchRecord($stateParams.recordId, contentData.currentEntity.name, contentData.patchObject, patchSuccessCallback, patchFailedCallback);

			return defer.promise;
		}


		//Auto increment
		contentData.getAutoIncrementString = function (item) {
			var fieldValue = contentData.viewData[item.dataName];
			if (!fieldValue) {
				return "empty";
			}
			else if (item.meta.displayFormat) {
				return item.meta.displayFormat.replace("{0}", fieldValue);
			}
			else {
				return fieldValue;
			}
		}
		//Checkbox
		contentData.getCheckboxString = function (item) {
			var fieldValue = contentData.viewData[item.dataName];
			if (fieldValue) {
			    return "<i class='fa fa-fw fa-check go-green'></i> true";
			}
			else {
			    return "<i class='fa fa-fw fa-close go-red'></i> false";
			}
		}
		//Currency
		contentData.getCurrencyString = function (item) {
			var fieldValue = contentData.viewData[item.dataName];
			if (!fieldValue) {
				return "empty";
			}
			else if (item.meta.currency != null && item.meta.currency != {} && item.meta.currency.symbol) {
				if (item.meta.currency.symbolPlacement == 1) {
					return item.meta.currency.symbol + " " + fieldValue
				}
				else {
					return fieldValue + " " + item.meta.currency.symbol
				}
			}
			else {
				return fieldValue;
			}
		}
		//Date & DateTime 
		contentData.getDateString = function (item) {
			var fieldValue = contentData.viewData[item.dataName];
			if (!fieldValue) {
				return "";
			}
			else {
				return $filter('date')(fieldValue, "dd MMM yyyy");
			}
		}
		contentData.getTimeString = function (item) {
			var fieldValue = contentData.viewData[item.dataName];
			if (!fieldValue) {
				return "";
			}
			else {
				return $filter('date')(fieldValue, "HH:mm");
			}
		}
		$scope.picker = { opened: false };
		$scope.openPicker = function () {
			$timeout(function () {
				$scope.picker.opened = true;
			});
		};
		$scope.closePicker = function () {
			$scope.picker.opened = false;
		};

		//File upload
		contentData.files = {}; // this is the data wrapper for the temporary upload objects that will be used in the html and for which we will generate watches below
		contentData.progress = {}; //data wrapper for the progress percentage for each upload

		/////////Register variables
		for (var sectionIndex = 0; sectionIndex < contentData.contentRegion.sections.length; sectionIndex++) {
			for (var rowIndex = 0; rowIndex < contentData.contentRegion.sections[sectionIndex].rows.length; rowIndex++) {
				for (var columnIndex = 0; columnIndex < contentData.contentRegion.sections[sectionIndex].rows[rowIndex].columns.length; columnIndex++) {
					for (var itemIndex = 0; itemIndex < contentData.contentRegion.sections[sectionIndex].rows[rowIndex].columns[columnIndex].items.length; itemIndex++) {
						if (contentData.contentRegion.sections[sectionIndex].rows[rowIndex].columns[columnIndex].items[itemIndex].meta.fieldType === 7
							|| contentData.contentRegion.sections[sectionIndex].rows[rowIndex].columns[columnIndex].items[itemIndex].meta.fieldType === 9) {
							var item = contentData.contentRegion.sections[sectionIndex].rows[rowIndex].columns[columnIndex].items[itemIndex];
							var FieldName = item.dataName;
							contentData.progress[FieldName] = 0;
						}
					}
				}
			}
		}

		contentData.upload = function (files, item) {
			var fieldName = item.dataName;
			function moveSuccessCallback(response) {
				contentData.viewData[fieldName] = response.object.url;
				contentData.fieldUpdate(item, response.object.url);
			}

			function uploadSuccessCallback(response) {
				var tempPath = response.object.url;
				var fileName = response.object.filename;
				var targetPath = "/fs/" + item.fieldId + "/" + fileName;
				var overwrite = false;
				webvellaAdminService.moveFileFromTempToFS(tempPath, targetPath, overwrite, moveSuccessCallback, uploadErrorCallback);
			}
			function uploadErrorCallback(response) {
				alert(response.message);
			}
			function uploadProgressCallback(response) {
				contentData.progress[dataName] = parseInt(100.0 * response.loaded / response.total);
			}
			webvellaAdminService.uploadFileToTemp(files, item.meta.name, uploadProgressCallback, uploadSuccessCallback, uploadErrorCallback);
		};

		contentData.deleteFileUpload = function (item) {
			var fieldName = item.dataName;
			var filePath = contentData.viewData[fieldName];

			function deleteSuccessCallback(response) {
				$timeout(function () {
					contentData.viewData[fieldName] = null;
					contentData.progress[fieldName] = 0;
					contentData.fieldUpdate(item,null);
				}, 0);
				return true;
			}
			function deleteFailedCallback(response) {
				ngToast.create({
					className: 'error',
					content: '<span class="go-red">Error:</span> ' + response.message
				});
				return "validation error";
			}

			webvellaAdminService.deleteFileFromFS(filePath, deleteSuccessCallback, deleteFailedCallback);

		}

		//Html
		$scope.editorOptions = {
			language: 'en',
			'skin': 'moono',
			height: '160',
			//'extraPlugins': "imagebrowser",//"imagebrowser,mediaembed",
			//imageBrowser_listUrl: '/api/v1/ckeditor/gallery',
			//filebrowserBrowseUrl: '/api/v1/ckeditor/files',
			//filebrowserImageUploadUrl: '/api/v1/ckeditor/images',
			//filebrowserUploadUrl: '/api/v1/ckeditor/files',
			toolbarLocation: 'top',
			toolbar: 'full',
			toolbar_full: [
				{
					name: 'basicstyles',
					items: ['Bold', 'Italic', 'Strike', 'Underline']
				},
				{ name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote'] },
				{ name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
				{ name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
				{ name: 'tools', items: ['SpellChecker', 'Maximize'] },
				{ name: 'clipboard', items: ['Undo', 'Redo'] },
				{ name: 'styles', items: ['Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat'] },
				{ name: 'insert', items: ['Image', 'Table', 'SpecialChar', 'MediaEmbed'] }, '/',
			]
		};

		//Checkbox list
		contentData.getCheckboxlistString = function (fieldData, array) {
			if (fieldData) {
				var selected = [];
				angular.forEach(array, function (s) {
					if (fieldData.indexOf(s.key) >= 0) {
						selected.push(s.value);
					}
				});
				return selected.length ? selected.join(', ') : 'empty';
			}
			else {
				return 'empty';
			}
		}

		//Password
		contentData.dummyPasswordModels = {};//as the password value is of know use being encrypted, we will assign dummy models
		//Dropdown
		contentData.getDropdownString = function (fieldData, array) {
			var selected = $filter('filter')(array, { key: fieldData });
			return (fieldData && selected.length) ? selected[0].value : 'empty';
		}

	    //Percent
		$scope.Math = window.Math;
		function multiplyDecimals(val1, val2, decimalPlaces) {
		    var helpNumber = 100;
		    for (var i = 0; i < decimalPlaces; i++) {
		        helpNumber = helpNumber * 10;
		    }
		    var temp1 = $scope.Math.round(val1 * helpNumber);
		    var temp2 = $scope.Math.round(val2 * helpNumber);
		    return (temp1 * temp2) / (helpNumber * helpNumber);
		}

		contentData.getPercentString = function (item) {
		    var fieldValue = contentData.viewData[item.dataName];

		    if (!fieldValue) {
		        return "empty";
		    }
		    else {
		        //JavaScript has a bug when multiplying decimals
		        //The way to correct this is to multiply the decimals before multiple their values,
		        var resultPercentage = 0.00;
		        resultPercentage = multiplyDecimals(fieldValue,100,3);
		        return resultPercentage + "%";
		        }

		}

	    //Test

		contentData.getItem = function (item) {
		    var i = 0;
		}


		//#endregion

	    //#region << Modals >>

	    //Relation field
		contentData.openManageRelationFieldModal = function (item) {
		    var modalInstance = $modal.open({
		        animation: false,
		        templateUrl: 'manageRelationFieldModal.html',
		        controller: 'ManageRelationFieldModalController',
		        controllerAs: "popupData",
		        windowClass: 'center-modal textbox',
		        size: "lg",
		        resolve: {
		            contentData: function () {
		                return contentData;
		            },
		            selectedItem: function () {
		                return item;
		            }
		        }
		    });

		}



        //#endregion




		$log.debug('webvellaAreas>entities> END controller.exec');
	}


    //#region < Modal Controllers >
	ManageRelationFieldModalController.$inject = ['contentData', '$modalInstance', '$log','selectedItem', 'webvellaAdminService', 'webvellaRootService', 'ngToast', '$timeout', '$state'];

    /* @ngInject */
	function ManageRelationFieldModalController(contentData, $modalInstance, $log, selectedItem, webvellaAdminService, webvellaRootService, ngToast, $timeout, $state) {
	    $log.debug('webvellaAdmin>entities>deleteFieldModal> START controller.exec');
	    /* jshint validthis:true */
	    var popupData = this;
	    popupData.parentData = angular.copy(contentData);
	    popupData.selectedItem = angular.copy(selectedItem);
	    //Get the default lookup list for the entity
	    //Get view records for this list with page 1 and all as filter initially
        //Put in popupData.listData and popupData.listMeta


	    popupData.select = function (record) {

	        

	    };

	    popupData.cancel = function () {
	        $modalInstance.dismiss('cancel');
	    };

	    /// Aux
	    function successCallback(response) {
	        ngToast.create({
	            className: 'success',
	            content: '<span class="go-green">Success:</span> ' + response.message
	        });
	        $modalInstance.close('success');
	        popupData.parentData.modalInstance.close('success');
	        //webvellaRootService.GoToState($state, $state.current.name, {});
	    }

	    function errorCallback(response) {
	        popupData.hasError = true;
	        popupData.errorMessage = response.message;


	    }
	    $log.debug('webvellaAdmin>entities>createEntityModal> END controller.exec');
	};

    //#endregion


})();


