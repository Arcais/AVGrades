'use strict';

alertify.set({ delay: 10000 });

var options = {
  oldmode:1
}//Can't display a scope object outside view? Declare it outside the controller! #shittyworkarounds

var app = angular.module('GradebookApp', ['ngRoute']);

app.config(function ($routeProvider){
      $routeProvider
        .when('/',
        {
          controller:'GradebookController',
          templateUrl:'views/main.html'
        })
        .when('/options',
        {
          controller:'GradebookController',
          templateUrl:'views/options.html'
        })
        .when('/tutorial',
        {
          controller:'GradebookController',
          templateUrl:'views/tutorial.html'
        })
        .otherwise({ redirectTo: '/' });
});

app.controller('GradebookController', ['$scope', function($scope) {
  //****MODEL****
  //TODO: Create factory and then move to Postgres
  $scope.overallaverage;
  $scope.subjects = [
    {
      name:"",
      overallgrade:10,
      overallwanted:'',
      grades:[7,7,6],
      wantedgrades:[],
      fgrade:0,
      hasfgrade:0,
      wantedmode:1,
      locked:0,
      deletemodeon:0
    }
  ];
  $scope.options = options;//And here we just push it into the controller. Why? Because Angular, that's why.
  //****MODEL****

  //$scope.numberofcolumns=parseInt(window.innerWidth/300);

  //****Basic Functions
  $scope.maxWantedGrade = function(subjectid,exception){
    var max=0;
    var maxid=0;
    var ender=exception;
    if(exception==$scope.subjects[subjectid].wantedgrades.length-1){
      ender--;
    }
    for(var i=$scope.subjects[subjectid].wantedgrades.length-1;i>=ender;i--){
      if($scope.subjects[subjectid].wantedgrades[i]>max&&i!=exception){
        max=$scope.subjects[subjectid].wantedgrades[i];
        maxid=i;
      }
    }
    return maxid;
  }

  $scope.minWantedGrade = function(subjectid,exception){
    var min=11;
    var minid=0;
    for(var i=$scope.subjects[subjectid].wantedgrades.length-1;i>=0;i--){
      if($scope.subjects[subjectid].wantedgrades[i]<min&&i!=exception){
        min=$scope.subjects[subjectid].wantedgrades[i];
        minid=i;
      }
    }
    return minid;
  }

  $scope.round = function(x){
    if(x>=(parseInt(x)+0.5)){
      return parseInt(x)+1;
    }
    else{
      return parseInt(x);
    }
  }

  $scope.subjectGradesSum = function(subjectid){
    var sum=0;
    for(var i=0;i<$scope.subjects[subjectid].grades.length;i++){
      sum=sum+$scope.subjects[subjectid].grades[i];
    }
    return sum;
  }

  $scope.subjectWGradesSum = function(subjectid){
    var wsum=0;
    for(var i=0;i<$scope.subjects[subjectid].wantedgrades.length;i++){
      wsum=wsum+$scope.subjects[subjectid].wantedgrades[i];
    }
    return wsum;
  }
  //****Basic Functions


  //****Average Overall Modifiers****
  $scope.overallAverageRefresh = function(){
  var sum=0;
    for(var i=0;i<$scope.subjects.length;i++){
      if($scope.subjects[i].overallgrade<=10&&$scope.subjects[i].overallgrade>=1){
        sum=sum+$scope.round($scope.subjects[i].overallgrade);
      }
    }
  $scope.overallaverage=sum/$scope.subjects.length;    
  }

  $scope.calculateOverall = function (subjectid){

  var sum=0; 
  for(var i=0;i<$scope.subjects[subjectid].grades.length;i++){
    sum=sum+$scope.subjects[subjectid].grades[i];
  }
  $scope.subjects[subjectid].overallgrade=sum/$scope.subjects[subjectid].grades.length;

  if($scope.subjects[subjectid].fgrade<=10&&$scope.subjects[subjectid].fgrade>=1){
    $scope.subjects[subjectid].overallgrade=
        ($scope.subjects[subjectid].overallgrade*3+$scope.subjects[subjectid].fgrade)/4;
  }

  }

  $scope.overallRefresh = function(subjectid){
    $scope.calculateOverall(subjectid);
    $scope.overallAverageRefresh();
  }

  $scope.completeOverallRefresh = function (){
  var sum=0;
    for(var i=0;i<$scope.subjects.length;i++){
      $scope.calculateOverall(i);
      sum=sum+$scope.round($scope.subjects[i].overallgrade);
    }
  $scope.overallaverage=sum/$scope.subjects.length;
  }
  //****Average Overall Modifiers****

  //****Subject Controller****
  $scope.addSubject = function (){
    $scope.subjects.push({
      name:"",
      overallgrade:5,
      overallwanted:'',
      grades:[5,5],
      wantedgrades:[],
      fgrade:0,
      hasfgrade:0,
      wantedmode:1,
      locked:0,
      deletemodeon:0
    });
    $scope.overallRefresh($scope.subjects.length-1);
  }

  $scope.deleteSubject = function (subjectid){ 
    if (subjectid > -1) {
        $scope.subjects.splice(subjectid, 1);
    }
  }
  //****Subject Controller****

  //****Normal Grade Controller****
  $scope.addGrade = function (subjectid){
    $scope.subjects[subjectid].grades.push(5);
    $scope.overallRefresh(subjectid);
  }

  $scope.deleteGrade = function (subjectid,gradeid){ 
    if (gradeid > -1) {
        $scope.subjects[subjectid].grades.splice(gradeid, 1);
        $scope.overallRefresh(subjectid);
    }
  }

  $scope.gradeUp = function (subjectid,gradeid){ 
    if ($scope.subjects[subjectid].grades[gradeid]<10) {
        $scope.subjects[subjectid].grades[gradeid]++;
        $scope.overallRefresh(subjectid);
    }
  }

  $scope.gradeDown = function (subjectid,gradeid){ 
    if ($scope.subjects[subjectid].grades[gradeid]>1) {
        $scope.subjects[subjectid].grades[gradeid]--;
        $scope.overallRefresh(subjectid);
    }
  }

  $scope.gradeInput = function (subjectid,gradeid,value){

    //Extremely unsafe method. Will solve later.
    if(value==''){
      $scope.subjects[subjectid].grades[gradeid]=parseInt('');
    }
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    if(value<=10&&value>=1){
      $scope.subjects[subjectid].grades[gradeid]=parseInt(value);
    }
    $scope.overallRefresh(subjectid);
  }
  //****Normal Grade Controller****

  //****FGrade Controller****
  $scope.addFGrade = function (subjectid){
    $scope.subjects[subjectid].fgrade=5;
    $scope.subjects[subjectid].hasfgrade=1;
    $scope.overallRefresh(subjectid);
  }

  $scope.deleteFGrade = function (subjectid){ 
    $scope.subjects[subjectid].fgrade=0;
    $scope.subjects[subjectid].hasfgrade=0;
    $scope.overallRefresh(subjectid);
  }

  $scope.fgradeUp = function (subjectid){ 
    if ($scope.subjects[subjectid].fgrade<10) {
        $scope.subjects[subjectid].fgrade++;
        $scope.overallRefresh(subjectid);
    }
  }

  $scope.fgradeDown = function (subjectid){ 
    if ($scope.subjects[subjectid].fgrade>1) {
        $scope.subjects[subjectid].fgrade--;
        $scope.overallRefresh(subjectid);
    }
  }

  $scope.fgradeInput = function (subjectid,value){

    //Extremely unsafe method. Will solve later.
    if(value==''){
      $scope.subjects[subjectid].fgrade=parseInt('');
    }
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    if(value<=10&&value>=1){
      $scope.subjects[subjectid].fgrade=parseInt(value);
    }
    $scope.overallRefresh(subjectid);
  }
  //****FGrade Controller****

  //**********Wanted Grade Algorithms*********
  $scope.wantedGradesNumber = function(subjectid,value,maxgrade){
    var length=$scope.subjects[subjectid].grades.length;
    var sum=$scope.subjectGradesSum(subjectid);
    var wgrnum=1;
    var wsum=value*(length+wgrnum);
    while((wsum-sum)/wgrnum>maxgrade){
      if(wgrnum<10){
        wgrnum++;
        wsum=value*(length+wgrnum);
      }
      else{
        wgrnum=0;
        break;
      }
    }
    return wgrnum;
  }


  $scope.calculateWantedGrades = function(subjectid,value){
  //Extremely unsafe method. Will solve later.
    if(value==''){
      $scope.subjects[subjectid].overallwanted=parseInt('');
      $scope.subjects[subjectid].wantedgrades=[];
    }
  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    if(value<=10&&value>=1){
      $scope.subjects[subjectid].overallwanted=parseInt(value);
      $scope.subjects[subjectid].wantedgrades=[];
      if(value>$scope.round($scope.subjects[subjectid].overallgrade)){

        switch($scope.subjects[subjectid].wantedmode) {
          case 1:
            var maxgrade=10;
            break;
          case 2:
            var maxgrade=$scope.subjects[subjectid].overallwanted;
            break;
          default:
            var maxgrade=10;
        }


        if($scope.subjects[subjectid].hasfgrade){
          value=((value-0.5)*4-$scope.subjects[subjectid].fgrade)/3;
        }
        else{
          value=value-0.5;
        }

        var wgrnum=$scope.wantedGradesNumber(subjectid,value,maxgrade);
        var sum=$scope.subjectGradesSum(subjectid);
        var wsum=(value)*($scope.subjects[subjectid].grades.length+wgrnum);
        var tempSum=wsum-sum;

        if(wgrnum==0){
          alertify.error("Media "+(value+0.5)+" necesita mai mult de 15 note la aceasta materie.");
        }
        else if(wgrnum==1){
          $scope.subjects[subjectid].wantedgrades.push($scope.round(tempSum));
        }
        else{
          var tempGr=$scope.round(tempSum/wgrnum);
          while(!(tempSum<=maxgrade&&tempSum>=1)){
            tempSum=tempSum-tempGr;
            $scope.subjects[subjectid].wantedgrades.push(tempGr);
          }
          $scope.subjects[subjectid].wantedgrades.push($scope.round(tempSum));
        }
        
      }
      else{
        alertify.error("Media "+value+" este prea mica.");
      }
    }
    
  }

  $scope.calculateWantedOverall = function (subjectid){

  var sum = $scope.subjectGradesSum(subjectid);
  var wsum = $scope.subjectWGradesSum(subjectid);

  $scope.subjects[subjectid].overallwanted=
    (sum+wsum)/($scope.subjects[subjectid].grades.length+$scope.subjects[subjectid].wantedgrades.length);

  if($scope.subjects[subjectid].fgrade<=10&&$scope.subjects[subjectid].fgrade>=1){
    $scope.subjects[subjectid].overallwanted=
        ($scope.subjects[subjectid].overallwanted*3+$scope.subjects[subjectid].fgrade)/4;
  }

  }

  $scope.deleteWGrade = function (subjectid,gradeid){ 
    if (gradeid > -1) {
        $scope.subjects[subjectid].wantedgrades.splice(gradeid, 1);
        if(!($scope.subjects[subjectid].locked)){
          $scope.calculateWantedOverall(subjectid);
        }
    }
  }

  $scope.wgradeUp = function (subjectid,gradeid){ 
    if ($scope.subjects[subjectid].wantedgrades[gradeid]<10) {
        if(!($scope.subjects[subjectid].locked)){
          $scope.subjects[subjectid].wantedgrades[gradeid]++;
          $scope.calculateWantedOverall(subjectid);
        }
        else{
          var maxid = $scope.maxWantedGrade(subjectid,gradeid);
          $scope.subjects[subjectid].wantedgrades[maxid]--;
          $scope.subjects[subjectid].wantedgrades[gradeid]++;

          if($scope.subjects[subjectid].wantedgrades[maxid]==0){
            $scope.subjects[subjectid].wantedgrades[maxid]++;
            $scope.subjects[subjectid].wantedgrades[gradeid]--;
          }//Shitty way to solve a problem

        }
    }
  }

  $scope.wgradeDown = function (subjectid,gradeid){ 
    if ($scope.subjects[subjectid].wantedgrades[gradeid]>1) {
        if(!($scope.subjects[subjectid].locked)){
          $scope.subjects[subjectid].wantedgrades[gradeid]--;
          $scope.calculateWantedOverall(subjectid);
        }
        else{
          var minid = $scope.minWantedGrade(subjectid,gradeid);
          $scope.subjects[subjectid].wantedgrades[minid]++;
          $scope.subjects[subjectid].wantedgrades[gradeid]--;

          if($scope.subjects[subjectid].wantedgrades[minid]==11){
            $scope.subjects[subjectid].wantedgrades[minid]--;
            $scope.subjects[subjectid].wantedgrades[gradeid]++;
          }//Shitty way to solve a problem

        }
    }
  }
  //**********Wanted Grade Algorithms*********

  //****Switches****
  $scope.switchDeleteMode = function (subjectid){
    $scope.subjects[subjectid].deletemodeon = $scope.subjects[subjectid].deletemodeon ? 0 : 1;
  }
  $scope.switchWantedGradesMode = function (subjectid){
    $scope.subjects[subjectid].wantedmode = $scope.subjects[subjectid].wantedmode==1 ? 2 : 1;
    if($scope.subjects[subjectid].overallwanted){
      $scope.calculateWantedGrades(subjectid,$scope.subjects[subjectid].overallwanted);
    }
  }
  $scope.switchLockSubject = function (subjectid){
    $scope.subjects[subjectid].locked = $scope.subjects[subjectid].locked ? 0 : 1;
    if($scope.subjects[subjectid].overallwanted){
      $scope.calculateWantedGrades(subjectid,$scope.subjects[subjectid].overallwanted);
    }
  }
  //****Switches****

  $scope.completeOverallRefresh();

  window.sc = $scope;

}]);

