/**
* Register Complaint controller.
*
* @author Wdnei Paixao {@link https://github.com/wdnei/caretta}
*/
(function () {
  //'use strict';
  /**
  * @ngdoc controller
  * @name RegisterComplaintCtrl
  * @module app.registerComplaint
  * @description
  * Controller for the to register a Complaint page.
  *
  * @ngInject
  */
  function RegisterComplaintCtrl($scope,$state, $rootScope, Complaint,UploadService, $ionicPopup, PhotoService) {




    $scope.takePicture = function () {
      try {
        PhotoService.takePicture().then(function (imageURI) {
          //  console.log(imageURI);
          $scope.data.imageURI = imageURI;
          var image = document.getElementById('myImage');
          image.src = "data:image/jpeg;base64," + imageURI;

        }, function (err) {
          console.err(err);
        });
      } catch (err)
      {
        console.log(err);
        $ionicPopup.alert({
          title: 'Erro',
          template: err.message
        });

      }
    };


    $scope.getPicture = function () {
      var options = {
        maximumImagesCount: 1,
        width: 800,
        height: 800,
        quality: 80
      };

      try {

        var photoDeviceSource = PhotoService.getPhotoSource();
        //            $ionicPopup.alert({
        //                    title: 'Erro localização',
        //                    template: JSON.stringify(photoDeviceSource)
        //                });


        PhotoService.getPhoto(photoDeviceSource.pictureSource.PHOTOLIBRARY).then(function (imageURI) {
          //console.log(imageURI);
          //                       $ionicPopup.alert({
          //                    title: 'Erro',
          //                    template: imageURI
          //                });
          $scope.data.imageURI = imageURI;
          $scope.$apply();
          var image = document.getElementById('myImage');
          image.src = "data:image/jpeg;base64," + imageURI;

        }, function (err) {
          console.err(err);
        });

      } catch (err)
      {
        console.log(err);
        $ionicPopup.alert({
          title: 'Erro',
          template: err.message
        });

      }


      //            PhotoService.getPicture1(options).then(function (imageURI) {
      //                console.log(imageURI);
      //                $scope.lastPhoto = imageURI[0];
      //            }, function (err) {
      //                console.err(err);
      //            });
    };


    $scope.init = function ()
    {
      $scope.data = {
        imageURI: '',
        comment: "",
        date: new Date()
      };




      $scope.location = {};
      $scope.location.lat = "Desconhecida";
      $scope.location.lng = "Desconhecida";

    }

    /**
    * Center map on user's current position
    */
    $scope.locate = function () {

      if (navigator.geolocation)
      {
        navigator.geolocation.getCurrentPosition(function (position) {
          $scope.location.position = position;
          $scope.location.lat = position.coords.latitude;
          $scope.location.lng = position.coords.longitude;

          $scope.$apply();
        }, function (err) {
          // error
          console.log("Location error!");
          console.log(err);
          $ionicPopup.alert({
            title: 'Erro localização',
            template: 'Ocorreu um erro ao identificar sua localização:' + err.message
          });
          $ionicPopup.alert({
            title: 'Erro localização',
            template: 'Tente novamente!'
          });
        });
      }
      else
      {
        $ionicPopup.alert({
          title: 'Erro localização',
          template: 'Ative seu GPS'
        });

      }


    };


    $scope.isValid = function ()
    {
      var msg = "";
      if (isNaN($scope.location.lat) || isNaN($scope.location.lng))
      {
        msg += "Localização desconhecida - Ative o GPS.</br>";
      }
      if (!$scope.data.date)
      {
        msg += "Data não inserida.</br>";
      }

      if ($scope.data.imageURI == "")
      {
        msg += "Imagem não inserida.</br>";
      }

      if (msg != "")
      {
        $rootScope.showAlert("Dados incompletos!", msg);
        return false;
      }

      return true;
    }



    $scope.send = function ()
    {
      try{
        if ($rootScope.isLogged())
        {
          if ($scope.isValid())
          {
            var register = {
              id: 0,
              comment: $scope.data.comment,
              when: $scope.data.date,
              location: {lat: $scope.location.lat, lng: $scope.location.lng},
              userName: $rootScope.currentUser.email,
              imgUrl: "",
              userId: $rootScope.currentUser.id

            };

            $rootScope.showLoad("Enviando imagem...");

            var blob = $scope.dataURItoBlob($scope.data.imageURI);
            var fd = new FormData();
            var currentTime = new Date().toLocaleString().split("/").join("_").split(" ").join("t").split(":").join("_").split(",").join("");
            var fileName = "u_" + $rootScope.currentUser.id + "_d" + currentTime + ".jpg";
            fd.append("myFile", blob, fileName);
            UploadService.uploadFile(fd,"complaint").success(function (res) {
              $scope.fileSent=true;
              $rootScope.hideLoad();
              $rootScope.showLoad("Registrando denúncia...");

              var fileUrl = "/containers/complaint/download/" + fileName;
              register.imgUrl = fileUrl;

              Complaint.create(register, function (res) {
                $scope.registerSent=true;
                $rootScope.hideLoad();
                // success

                $rootScope.showAlert("Registrado", "Denúncia registrada com sucesso!");
                $scope.cleanData();
                $state.go('app.home');

                console.log(res);
              }, function (res) {
                $rootScope.hideLoad();
                // error
                var erro = "Erro ao realizar registro:"+$rootScope.erroMessage(res);

                $rootScope.showAlert("Erro", erro);
                console.log(res);
              });

            })
            .error(function (res) {
              $rootScope.showAlert("Erro", "Ocorreu um erro ao realizar upload do arquivo:"+$rootScope.erroMessage(res));
              console.log(res);
              $rootScope.hideLoad();
            });

            console.log(register);
          }
        } else
        {
          $rootScope.showAlert("", "Usuário necessita estar logado!");
          $rootScope.login();
        }


      }
      catch (err)
      {
        $rootScope.hideLoad();
        $rootScope.showAlert("Erro", err.message);
      }
    };

    $scope.cleanData=function()
    {
      $scope.init();
      $scope.locate();
      var image = document.getElementById('myImage');
      image.src = "";

    }

  }


  angular
  .module('app')
  .controller('RegisterComplaintCtrl', RegisterComplaintCtrl);
})();
