<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoPatientCategory;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * SpecialityController implements the CRUD actions for CoTenant model.
 */
class PatientcategoryController extends ActiveController {

    public $modelClass = 'common\models\CoPatientCategory';

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className()
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actions() {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];

        return $actions;
    }

    public function prepareDataProvider() {
        /* @var $modelClass BaseActiveRecord */
        $modelClass = $this->modelClass;

        return new ActiveDataProvider([
            'query' => $modelClass::find()->active()->orderBy(['patient_cat_name' => SORT_ASC]),
            'pagination' => false,
        ]);
    }
    
    public function actionGetpatientcategorylist() {
        $get = Yii::$app->getRequest()->get();

//        if (isset($get['tenant']))
//            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['patientcategoryList' => CoPatientCategory::getPatientCateogrylist($status, $deleted)];
    }

}
