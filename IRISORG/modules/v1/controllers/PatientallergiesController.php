<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatPatient;
use Yii;
use yii\data\ActiveDataProvider;
use common\models\CoAuditLog;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;
use common\models\PatAllergies;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientallergiesController extends ActiveController {

    public $modelClass = 'common\models\PatAllergies';

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

    public function actionGetpatientallergie() {
        $get = Yii::$app->getRequest()->get();

        if (!empty($get)) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);

            $condition = [
                'patient_id' => $patient->patient_id,
            ];

            $data = PatAllergies::find()
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
        if ($id) {
            $model = PatAllergies::find()->where(['pat_allergies_id' => $id])->one();
            $model->remove();
            $activity = 'Allergies Deleted Successfully (#' . $model->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatAllergies::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

}
