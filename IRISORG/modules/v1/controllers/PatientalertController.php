<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatAlert;
use common\models\PatPatient;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientalertController extends ActiveController {

    public $modelClass = 'common\models\PatAlert';

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
            'query' => $modelClass::find()->tenant()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }
    
    public function actionGetpatientalerts() {
        $get = Yii::$app->getRequest()->get();

        if (!empty($get)) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);

            $condition = [
                'patient_id' => $patient->patient_id,
            ];
            
            $data = PatAlert::find()
                    ->tenant()
                    ->active()
                    ->andWhere($condition)
                    ->orderBy(['created_at' => SORT_DESC])
                    ->all();

            return ['success' => true, 'result' => $data];
        }
    }
    
    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if($id){
            $model = PatAlert::find()->where(['pat_alert_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }
    
}
